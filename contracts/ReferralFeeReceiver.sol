// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./interfaces/IReferralFeeReceiver.sol";
import "./utils/Converter.sol";


contract ReferralFeeReceiver is IReferralFeeReceiver, Converter {
    struct UserInfo {
        uint256 balance;
        mapping(IERC20 => mapping(uint256 => uint256)) share;
        mapping(IERC20 => uint256) lastUnprocessedEpoch;
    }

    struct EpochBalance {
        uint256 token0Balance;
        uint256 token1Balance;
        uint256 inchBalance;
    }

    struct TokenInfo {
        mapping(uint256 => uint256) totalSupply;
        mapping(uint256 => uint256) amount;
        mapping(uint256 => EpochBalance) epochBalance;
        uint256 lastUnprocessedEpoch;
        uint256 currentEpoch;
    }

    mapping(address => UserInfo) public userInfo;
    mapping(IERC20 => TokenInfo) public tokenInfo;

    // solhint-disable-next-line no-empty-blocks
    constructor(IERC20 _targetToken) public Converter(_targetToken) {}

    function updateReward(address referral, uint256 referralShare) external override {
        Mooniswap mooniswap = Mooniswap(msg.sender);
        TokenInfo storage _tokenInfo = tokenInfo[mooniswap];
        UserInfo storage _userInfo = userInfo[referral];
        uint256 currentEpoch = _tokenInfo.currentEpoch;
        uint256 unclaimedTokens = _claimOldEpoch(_tokenInfo, _userInfo, currentEpoch, mooniswap);
        if (unclaimedTokens > 0) {
            _userInfo.balance = _userInfo.balance.add(unclaimedTokens);
        }
        _userInfo.share[mooniswap][currentEpoch] = _userInfo.share[mooniswap][currentEpoch].add(referralShare);
        _tokenInfo.totalSupply[currentEpoch] = _tokenInfo.totalSupply[currentEpoch].add(referralShare);
    }

    function freezeEpoch(Mooniswap mooniswap) external validSpread(mooniswap) {
        TokenInfo storage info = tokenInfo[mooniswap];
        uint256 currentEpoch = info.currentEpoch;

        require(info.lastUnprocessedEpoch == currentEpoch, "Previous epoch is not finlazed");

        tokenInfo[mooniswap].currentEpoch = currentEpoch.add(1);

        IERC20[] memory tokens = mooniswap.getTokens();
        uint256 token0Balance = tokens[0].uniBalanceOf(address(this));
        uint256 token1Balance = tokens[1].uniBalanceOf(address(this));

        mooniswap.withdraw(mooniswap.balanceOf(address(this)), new uint256[](0));

        info.epochBalance[currentEpoch] = EpochBalance({
            token0Balance: tokens[0].uniBalanceOf(address(this)).sub(token0Balance),
            token1Balance: tokens[1].uniBalanceOf(address(this)).sub(token1Balance),
            inchBalance: 0
        });
    }

    function trade(Mooniswap mooniswap, IERC20[] memory path) external {
        TokenInfo storage info = tokenInfo[mooniswap];
        uint256 lastUnprocessedEpoch = info.lastUnprocessedEpoch;
        require(lastUnprocessedEpoch.add(1) == info.currentEpoch, "Prev epoch already finalized");

        EpochBalance storage epochBalance = info.epochBalance[lastUnprocessedEpoch];

        IERC20[] memory tokens = mooniswap.getTokens();
        uint256 availableBalance;
        if (path[0] == tokens[0]) {
            availableBalance = epochBalance.token0Balance;
        } else if (path[0] == tokens[1]) {
            availableBalance = epochBalance.token1Balance;
        } else {
            revert("Invalid first token");
        }

        uint256 amount = _maxAmountForSwap(path, availableBalance);
        uint256 receivedAmount = _swap(path, amount, payable(address(this)));
        epochBalance.inchBalance = epochBalance.inchBalance.add(receivedAmount);
        if (path[0] == tokens[0]) {
            epochBalance.token0Balance = epochBalance.token0Balance.sub(amount);
        } else {
            epochBalance.token1Balance = epochBalance.token1Balance.sub(amount);
        }

        if (epochBalance.token0Balance == 0 && epochBalance.token1Balance == 0) {
            info.lastUnprocessedEpoch = lastUnprocessedEpoch.add(1);
        }
    }

    function claim(Mooniswap[] memory updates) external {
        UserInfo storage _userInfo = userInfo[msg.sender];
        uint256 balance = _userInfo.balance;
        for (uint256 i = 0; i < updates.length; ++ i) {
            Mooniswap mooniswap = updates[i];
            TokenInfo storage _tokenInfo = tokenInfo[mooniswap];
            uint256 currentEpoch = _tokenInfo.currentEpoch;
            uint256 unclaimedTokens = _claimOldEpoch(_tokenInfo, _userInfo, currentEpoch, mooniswap);
            if (unclaimedTokens > 0) {
                balance = balance.add(unclaimedTokens);
            }
        }
        if (balance > 1) {
            _userInfo.balance = 1;
            targetToken.transfer(msg.sender, balance - 1);
        }
    }

    function claimCurrentEpoch(Mooniswap mooniswap) external {
        TokenInfo storage _tokenInfo = tokenInfo[mooniswap];
        UserInfo storage _userInfo = userInfo[msg.sender];
        uint256 currentEpoch = _tokenInfo.currentEpoch;
        uint256 balance = _userInfo.share[mooniswap][currentEpoch];
        if (balance > 0) {
            _userInfo.share[mooniswap][currentEpoch] = 0;
            _tokenInfo.totalSupply[currentEpoch] = _tokenInfo.totalSupply[currentEpoch].sub(balance);
            mooniswap.transfer(msg.sender, balance);
        }
    }

    function claimFrozenEpoch(Mooniswap mooniswap) external {
        TokenInfo storage _tokenInfo = tokenInfo[mooniswap];
        UserInfo storage _userInfo = userInfo[msg.sender];
        uint256 lastUnprocessedEpoch = _tokenInfo.lastUnprocessedEpoch;
        uint256 currentEpoch = _tokenInfo.currentEpoch;

        require(lastUnprocessedEpoch.add(1) == currentEpoch, "Epoch already finalized");
        require(_userInfo.lastUnprocessedEpoch[mooniswap] == lastUnprocessedEpoch, "Epoch funds already claimed");

        _userInfo.lastUnprocessedEpoch[mooniswap] = currentEpoch;
        uint256 share = _userInfo.share[mooniswap][lastUnprocessedEpoch];
        uint256 totalSupply = _tokenInfo.totalSupply[lastUnprocessedEpoch];

        if (share > 0) {
            _userInfo.share[mooniswap][lastUnprocessedEpoch] = 0;
            _tokenInfo.totalSupply[lastUnprocessedEpoch] = totalSupply.sub(share);

            IERC20[] memory tokens = mooniswap.getTokens();
            EpochBalance storage epochBalance = _tokenInfo.epochBalance[lastUnprocessedEpoch];
            {
                uint256 token0Balance = epochBalance.token0Balance;
                uint256 token0Amount = token0Balance.mul(share).div(totalSupply);
                if (token0Amount > 0) {
                    epochBalance.token0Balance = token0Balance.sub(token0Amount);
                    tokens[0].transfer(msg.sender, token0Amount);
                }
            }
            {
                uint256 token1Balance = epochBalance.token1Balance;
                uint256 token1Amount = token1Balance.mul(share).div(totalSupply);
                if (token1Amount > 0) {
                    epochBalance.token1Balance = token1Balance.sub(token1Amount);
                    tokens[1].transfer(msg.sender, token1Amount);
                }
            }
            {
                uint256 inchBalance = epochBalance.inchBalance;
                uint256 inchAmount = inchBalance.mul(share).div(totalSupply);
                if (inchAmount > 0) {
                    epochBalance.inchBalance = inchBalance.sub(inchAmount);
                    tokens[1].transfer(msg.sender, inchAmount);
                }
            }
        }
    }

    function _claimOldEpoch(TokenInfo storage _tokenInfo, UserInfo storage _userInfo, uint256 currentEpoch, Mooniswap mooniswap) private returns (uint256 unclaimedTokens) {
        uint256 lastUserEpoch = _userInfo.lastUnprocessedEpoch[mooniswap];
        if (lastUserEpoch < _tokenInfo.lastUnprocessedEpoch) {
            unclaimedTokens =
                _tokenInfo.epochBalance[lastUserEpoch].inchBalance
                .mul(_userInfo.share[mooniswap][lastUserEpoch])
                .div(_tokenInfo.totalSupply[lastUserEpoch]);

            _userInfo.lastUnprocessedEpoch[mooniswap] = currentEpoch;
        }
    }
}
