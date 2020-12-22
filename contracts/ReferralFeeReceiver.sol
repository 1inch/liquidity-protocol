// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./interfaces/IReferralFeeReceiver.sol";
import "./libraries/UniERC20.sol";
import "./utils/Converter.sol";


contract ReferralFeeReceiver is IReferralFeeReceiver, Converter {
    using UniERC20 for IERC20;

    struct UserInfo {
        uint256 balance;
        mapping(IERC20 => mapping(uint256 => uint256)) share;
        mapping(IERC20 => uint256) firstUnprocessedEpoch;
    }

    struct EpochBalance {
        uint256 totalSupply;
        uint256 token0Share;
        uint256 token1Share;
        uint256 inchBalance;
    }

    struct TokenInfo {
        mapping(uint256 => EpochBalance) epochBalance;
        uint256 firstUnprocessedEpoch;
        uint256 currentEpoch;
    }

    mapping(address => UserInfo) public userInfo;
    mapping(IERC20 => TokenInfo) public tokenInfo;
    mapping(IERC20 => uint256) public tokenTotalShares;

    // solhint-disable-next-line no-empty-blocks
    constructor(IERC20 _inchToken, IMooniswapFactory _mooniswapFactory) public Converter(_inchToken, _mooniswapFactory) {}

    function updateReward(address referral, uint256 amount) external override {
        Mooniswap mooniswap = Mooniswap(msg.sender);
        TokenInfo storage token = tokenInfo[mooniswap];
        UserInfo storage user = userInfo[referral];
        uint256 currentEpoch = token.currentEpoch;

        // Add new reward to current epoch
        user.share[mooniswap][currentEpoch] = user.share[mooniswap][currentEpoch].add(amount);
        token.epochBalance[currentEpoch].totalSupply = token.epochBalance[currentEpoch].totalSupply.add(amount);

        // Collect all processed epochs and advance user token epoch
        _collectProcessedEpochs(user, token, mooniswap, currentEpoch);
    }

    function freezeEpoch(Mooniswap mooniswap) external validPool(mooniswap) validSpread(mooniswap) {
        TokenInfo storage token = tokenInfo[mooniswap];
        uint256 currentEpoch = token.currentEpoch;
        require(token.firstUnprocessedEpoch == currentEpoch, "Previous epoch is not finalized");

        IERC20[] memory tokens = mooniswap.getTokens();
        uint256 token0Balance = tokens[0].uniBalanceOf(address(this));
        uint256 token1Balance = tokens[1].uniBalanceOf(address(this));

        mooniswap.withdraw(mooniswap.balanceOf(address(this)), new uint256[](0));

        (tokenTotalShares[tokens[0]], token.epochBalance[currentEpoch].token0Share) = _increaseShare(
            token0Balance,
            tokenTotalShares[tokens[0]],
            tokens[0].uniBalanceOf(address(this)).sub(token0Balance)
        );
        (tokenTotalShares[tokens[1]], token.epochBalance[currentEpoch].token1Share) = _increaseShare(
            token1Balance,
            tokenTotalShares[tokens[1]],
            tokens[1].uniBalanceOf(address(this)).sub(token1Balance)
        );

        token.currentEpoch = currentEpoch.add(1);
    }

    function _increaseShare(uint256 tokenBalance, uint256 totalShares, uint256 balance) private view returns(uint256 /*returnTotalShares*/, uint256 /*share*/) {
        if (totalShares == 0) {
            return (balance, balance);
        }

        if (tokenBalance == 0) {
            return (0, balance);
        }

        uint256 share = balance.mul(totalShares).div(tokenBalance);
        return (totalShares.add(share), share);
    }

    function trade(Mooniswap mooniswap, IERC20[] memory path) external validPool(mooniswap) validPath(path) {
        TokenInfo storage token = tokenInfo[mooniswap];
        uint256 firstUnprocessedEpoch = token.firstUnprocessedEpoch;
        EpochBalance storage epochBalance = token.epochBalance[firstUnprocessedEpoch];
        require(firstUnprocessedEpoch.add(1) == token.currentEpoch, "Prev epoch already finalized");

        IERC20[] memory tokens = mooniswap.getTokens();
        uint256 availableBalance;
        uint256 totalShares;
        uint256 share;
        if (path[0] == tokens[0]) {
            share = epochBalance.token0Share;
            totalShares = tokenTotalShares[tokens[0]];
            availableBalance = tokens[0].uniBalanceOf(address(this)).mul(share).div(totalShares);
        } else if (path[0] == tokens[1]) {
            share = epochBalance.token1Share;
            totalShares = tokenTotalShares[tokens[1]];
            availableBalance = tokens[1].uniBalanceOf(address(this)).mul(share).div(totalShares);
        } else {
            revert("Invalid first token");
        }

        (uint256 amount, uint256 returnAmount) = _maxAmountForSwap(path, availableBalance);
        if (returnAmount == 0) {
            // get rid of dust
            if (availableBalance > 0) {
                require(availableBalance == amount, "availableBalance is not dust");
                for (uint256 i = 0; i + 1 < path.length; i += 1) {
                    Mooniswap _mooniswap = mooniswapFactory.pools(path[i], path[i+1]);
                    require(_validateSpread(_mooniswap), "Spread is too high");
                }
                if (path[0].isETH()) {
                    tx.origin.transfer(availableBalance);  // solhint-disable-line avoid-tx-origin
                } else {
                    path[0].safeTransfer(address(mooniswap), availableBalance);
                }
            }
        } else {
            uint256 receivedAmount = _swap(path, amount, payable(address(this)));
            epochBalance.inchBalance = epochBalance.inchBalance.add(receivedAmount);
        }

        uint256 deductedShare = share.mul(amount).div(availableBalance);
        if (path[0] == tokens[0]) {
            epochBalance.token0Share = share.sub(deductedShare);
            tokenTotalShares[tokens[0]] = totalShares.sub(deductedShare);
        } else {
            epochBalance.token1Share = share.sub(deductedShare);
            tokenTotalShares[tokens[0]] = totalShares.sub(deductedShare);
        }

        if (epochBalance.token0Share == 0 && epochBalance.token1Share == 0) {
            token.firstUnprocessedEpoch = firstUnprocessedEpoch.add(1);
        }
    }

    function claim(Mooniswap[] memory pools) external {
        UserInfo storage user = userInfo[msg.sender];
        for (uint256 i = 0; i < pools.length; ++i) {
            Mooniswap mooniswap = pools[i];
            TokenInfo storage token = tokenInfo[mooniswap];
            _collectProcessedEpochs(user, token, mooniswap, token.currentEpoch);
        }

        uint256 balance = user.balance;
        if (balance > 1) {
            // Avoid erasing storage to decrease gas footprint for referral payments
            user.balance = 1;
            inchToken.transfer(msg.sender, balance - 1);
        }
    }

    function claimCurrentEpoch(Mooniswap mooniswap) external validPool(mooniswap) {
        TokenInfo storage token = tokenInfo[mooniswap];
        UserInfo storage user = userInfo[msg.sender];
        uint256 currentEpoch = token.currentEpoch;
        uint256 balance = user.share[mooniswap][currentEpoch];
        if (balance > 0) {
            user.share[mooniswap][currentEpoch] = 0;
            token.epochBalance[currentEpoch].totalSupply = token.epochBalance[currentEpoch].totalSupply.sub(balance);
            mooniswap.transfer(msg.sender, balance);
        }
    }

    function claimFrozenEpoch(Mooniswap mooniswap) external validPool(mooniswap) {
        TokenInfo storage token = tokenInfo[mooniswap];
        UserInfo storage user = userInfo[msg.sender];
        uint256 firstUnprocessedEpoch = token.firstUnprocessedEpoch;
        uint256 currentEpoch = token.currentEpoch;

        require(firstUnprocessedEpoch.add(1) == currentEpoch, "Epoch already finalized");
        require(user.firstUnprocessedEpoch[mooniswap] == firstUnprocessedEpoch, "Epoch funds already claimed");

        user.firstUnprocessedEpoch[mooniswap] = currentEpoch;
        uint256 share = user.share[mooniswap][firstUnprocessedEpoch];

        if (share > 0) {
            EpochBalance storage epochBalance = token.epochBalance[firstUnprocessedEpoch];
            uint256 totalSupply = epochBalance.totalSupply;
            user.share[mooniswap][firstUnprocessedEpoch] = 0;
            epochBalance.totalSupply = totalSupply.sub(share);

            uint256 token0Share = epochBalance.token0Share;
            uint256 token1Share = epochBalance.token1Share;
            uint256 inchBalance = epochBalance.inchBalance;
            epochBalance.token0Share = 0;
            epochBalance.token1Share = 0;
            epochBalance.inchBalance = 0;

            IERC20[] memory tokens = mooniswap.getTokens();
            _transferTokenShare(tokens[0], _balanceOfShare(tokens[0], token0Share), share, totalSupply);
            _transferTokenShare(tokens[1], _balanceOfShare(tokens[1], token1Share), share, totalSupply);
            _transferTokenShare(inchToken, inchBalance, share, totalSupply);

            tokenTotalShares[tokens[0]] = tokenTotalShares[tokens[0]].sub(token0Share);
            tokenTotalShares[tokens[1]] = tokenTotalShares[tokens[1]].sub(token1Share);
        }
    }

    function _balanceOfShare(IERC20 token, uint256 share) private view returns(uint256) {
        return token.uniBalanceOf(address(this)).mul(share).div(tokenTotalShares[token]);
    }

    function _transferTokenShare(IERC20 token, uint256 balance, uint256 share, uint256 totalSupply) private returns(uint256 newBalance) {
        uint256 amount = balance.mul(share).div(totalSupply);
        if (amount > 0) {
            token.uniTransfer(msg.sender, amount);
        }
        return balance.sub(amount);
    }

    function _collectProcessedEpochs(UserInfo storage user, TokenInfo storage token, Mooniswap mooniswap, uint256 currentEpoch) private {
        // Early return for the new users
        if (user.share[mooniswap][user.firstUnprocessedEpoch[mooniswap]] == 0) {
            user.firstUnprocessedEpoch[mooniswap] = currentEpoch;
            return;
        }

        uint256 userEpoch = user.firstUnprocessedEpoch[mooniswap];
        uint256 tokenEpoch = token.firstUnprocessedEpoch;
        uint256 epochCount = Math.min(2, tokenEpoch.sub(userEpoch)); // 0, 1 or 2 epochs
        if (epochCount == 0) {
            return;
        }

        // Claim 1 or 2 processed epochs for the user
        uint256 collected = _collectEpoch(user, token, mooniswap, userEpoch);
        if (epochCount > 1) {
            collected = collected.add(_collectEpoch(user, token, mooniswap, userEpoch + 1));
        }
        user.balance = user.balance.add(collected);

        // Update user token epoch counter
        bool emptySecondEpoch = user.share[mooniswap][userEpoch + 1] == 0;
        user.firstUnprocessedEpoch[mooniswap] = (epochCount == 2 || emptySecondEpoch) ? currentEpoch : userEpoch + 1;
    }

    function _collectEpoch(UserInfo storage user, TokenInfo storage token, Mooniswap mooniswap, uint256 epoch) private returns(uint256 collected) {
        uint256 inchBalance = token.epochBalance[epoch].inchBalance;
        uint256 share = user.share[mooniswap][epoch];
        uint256 totalSupply = token.epochBalance[epoch].totalSupply;

        collected = inchBalance.mul(share).div(totalSupply);

        user.share[mooniswap][epoch] = 0;
        token.epochBalance[epoch].totalSupply = totalSupply.sub(share);
        token.epochBalance[epoch].inchBalance = inchBalance.sub(collected);
    }
}
