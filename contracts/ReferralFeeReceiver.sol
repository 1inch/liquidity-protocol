// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./interfaces/IReferralFeeReceiver.sol";
import "./utils/Converter.sol";


contract ReferralFeeReceiver is IReferralFeeReceiver, Converter {
    struct UserInfo {
        uint256 balance;
        mapping(IERC20 => mapping(uint256 => uint256)) share;
        mapping(IERC20 => uint256) firstUnprocessedEpoch;
    }

    struct EpochBalance {
        uint256 totalSupply;
        uint256 token0Balance;
        uint256 token1Balance;
        uint256 inchBalance;
    }

    struct TokenInfo {
        mapping(uint256 => EpochBalance) epochBalance;
        uint256 firstUnprocessedEpoch;
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
        _tokenInfo.epochBalance[currentEpoch].totalSupply = _tokenInfo.epochBalance[currentEpoch].totalSupply.add(referralShare);
    }

    function freezeEpoch(Mooniswap mooniswap) external validSpread(mooniswap) {
        TokenInfo storage info = tokenInfo[mooniswap];
        uint256 currentEpoch = info.currentEpoch;

        require(info.firstUnprocessedEpoch == currentEpoch, "Previous epoch is not finlazed");

        tokenInfo[mooniswap].currentEpoch = currentEpoch.add(1);

        IERC20[] memory tokens = mooniswap.getTokens();
        uint256 token0Balance = tokens[0].uniBalanceOf(address(this));
        uint256 token1Balance = tokens[1].uniBalanceOf(address(this));

        mooniswap.withdraw(mooniswap.balanceOf(address(this)), new uint256[](0));

        info.epochBalance[currentEpoch].token0Balance = tokens[0].uniBalanceOf(address(this)).sub(token0Balance);
        info.epochBalance[currentEpoch].token1Balance = tokens[1].uniBalanceOf(address(this)).sub(token1Balance);
    }

    function trade(Mooniswap mooniswap, IERC20[] memory path) external {
        TokenInfo storage info = tokenInfo[mooniswap];
        uint256 firstUnprocessedEpoch = info.firstUnprocessedEpoch;
        require(firstUnprocessedEpoch.add(1) == info.currentEpoch, "Prev epoch already finalized");

        EpochBalance storage epochBalance = info.epochBalance[firstUnprocessedEpoch];

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
            info.firstUnprocessedEpoch = firstUnprocessedEpoch.add(1);
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
        if (balance > 0) {
            _userInfo.balance = 0;
            targetToken.transfer(msg.sender, balance);
        }
    }

    function claimCurrentEpoch(Mooniswap mooniswap) external {
        TokenInfo storage _tokenInfo = tokenInfo[mooniswap];
        UserInfo storage _userInfo = userInfo[msg.sender];
        uint256 currentEpoch = _tokenInfo.currentEpoch;
        uint256 balance = _userInfo.share[mooniswap][currentEpoch];
        if (balance > 0) {
            _userInfo.share[mooniswap][currentEpoch] = 0;
            _tokenInfo.epochBalance[currentEpoch].totalSupply = _tokenInfo.epochBalance[currentEpoch].totalSupply.sub(balance);
            mooniswap.transfer(msg.sender, balance);
        }
    }

    function claimFrozenEpoch(Mooniswap mooniswap) external {
        TokenInfo storage _tokenInfo = tokenInfo[mooniswap];
        UserInfo storage _userInfo = userInfo[msg.sender];
        uint256 firstUnprocessedEpoch = _tokenInfo.firstUnprocessedEpoch;
        uint256 currentEpoch = _tokenInfo.currentEpoch;

        require(firstUnprocessedEpoch.add(1) == currentEpoch, "Epoch already finalized");
        require(_userInfo.firstUnprocessedEpoch[mooniswap] == firstUnprocessedEpoch, "Epoch funcds already claimed");

        _userInfo.firstUnprocessedEpoch[mooniswap] = currentEpoch;
        uint256 share = _userInfo.share[mooniswap][firstUnprocessedEpoch];
        uint256 totalSupply = _tokenInfo.epochBalance[firstUnprocessedEpoch].totalSupply;

        if (share > 0) {
            _userInfo.share[mooniswap][firstUnprocessedEpoch] = 0;
            _tokenInfo.epochBalance[firstUnprocessedEpoch].totalSupply = totalSupply.sub(share);

            IERC20[] memory tokens = mooniswap.getTokens();
            EpochBalance storage epochBalance = _tokenInfo.epochBalance[firstUnprocessedEpoch];
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
        if (_userInfo.share[mooniswap][_userInfo.firstUnprocessedEpoch[mooniswap]] == 0) {
            _userInfo.firstUnprocessedEpoch[mooniswap] = currentEpoch;
            return 0;
        }

        uint256 startEpoch = _userInfo.firstUnprocessedEpoch[mooniswap];
        uint256 epoch = startEpoch;
        for (uint256 i = 0; i < 2 && epoch < _tokenInfo.firstUnprocessedEpoch; i++) {
            unclaimedTokens = unclaimedTokens.add(
                _tokenInfo.epochBalance[epoch].inchBalance
                .mul(_userInfo.share[mooniswap][epoch])
                .div(_tokenInfo.epochBalance[epoch].totalSupply)
            );
            epoch++;
        }

        if (epoch - startEpoch == 2) {
            _userInfo.firstUnprocessedEpoch[mooniswap] = currentEpoch;
        }
        else if (epoch - startEpoch == 1) {
            if (_userInfo.share[mooniswap][epoch] > 0) {
                _userInfo.firstUnprocessedEpoch[mooniswap] = epoch;
            } else {
                _userInfo.firstUnprocessedEpoch[mooniswap] = currentEpoch;
            }
        } else {
            revert("Unreachable code");
        }
    }
}
