// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IReferralFeeReceiver.sol";
import "./libraries/UniERC20.sol";
import "./libraries/VirtualBalance.sol";
import "./Mooniswap.sol";


contract ReferralFeeReceiver is IReferralFeeReceiver {
    using SafeMath for uint256;
    using UniERC20 for IERC20;
    using VirtualBalance for VirtualBalance.Data;

    uint256 private constant _ONE = 1e18;
    uint256 private constant _SPREAD_FEE_MULTIPLIER = 100;

    struct UserInfo {
        uint256 balance;
        mapping(IERC20 => uint256) share;
        mapping(IERC20 => uint256) lastEpoch;
    }

    struct TokenInfo {
        mapping(uint256 => uint256) totalSupply;
        mapping(uint256 => uint256) amount;
        uint256 currentEpoch;
    }

    mapping(address => UserInfo) public userInfo;
    mapping(IERC20 => TokenInfo) public tokenInfo;

    function updateReward(address referral, uint256 referralShare) external override {
        IERC20 token = IERC20(msg.sender);
        uint256 currentEpoch = tokenInfo[token].currentEpoch;
        uint256 lastUserEpoch = userInfo[referral].lastEpoch[token];
        if (lastUserEpoch < currentEpoch) {
            // Todo
        }

        userInfo[referral].share[token] += referralShare;
        tokenInfo[token].totalSupply[currentEpoch] += referralShare;
    }

    function freezeEpoch() external {
        // require previous epoch finalized
        // increment epoch
        // unwrap LP
    }

    function trade() external {
        // sell to inch
    }


    function _validateSpread(Mooniswap mooniswap) private view {
        IERC20[] memory tokens = mooniswap.getTokens();

        uint256 buyPrice;
        uint256 sellPrice;
        uint256 spotPrice;
        {
            uint256 token0Balance = tokens[0].uniBalanceOf(address(mooniswap));
            uint256 token1Balance = tokens[1].uniBalanceOf(address(mooniswap));
            uint256 decayPeriod = mooniswap.decayPeriod();
            (uint216 balance, uint40 time) = mooniswap.virtualBalancesForAddition(tokens[0]);
            uint256 token0BalanceForAddition = Math.max(VirtualBalance.Data({balance: balance, time: time}).current(decayPeriod, token0Balance), token0Balance);
            (balance, time) = mooniswap.virtualBalancesForAddition(tokens[1]);
            uint256 token1BalanceForAddition = Math.max(VirtualBalance.Data({balance: balance, time: time}).current(decayPeriod, token1Balance), token1Balance);
            (balance, time) = mooniswap.virtualBalancesForRemoval(tokens[0]);
            uint256 token0BalanceForRemoval = Math.min(VirtualBalance.Data({balance: balance, time: time}).current(decayPeriod, token0Balance), token0Balance);
            (balance, time) = mooniswap.virtualBalancesForRemoval(tokens[1]);
            uint256 token1BalanceForRemoval = Math.min(VirtualBalance.Data({balance: balance, time: time}).current(decayPeriod, token1Balance), token1Balance);

            buyPrice = _ONE.mul(token1BalanceForAddition).div(token0BalanceForRemoval);
            sellPrice = _ONE.mul(token1BalanceForRemoval).div(token0BalanceForAddition);
            spotPrice = _ONE.mul(token1Balance).div(token0Balance);
        }

        require(buyPrice.sub(sellPrice).mul(_ONE) < mooniswap.fee().mul(_SPREAD_FEE_MULTIPLIER).mul(spotPrice), "Spread is too high");
    }

    // function startAuction(IERC20 token) external {
    //     // determine price
    //     // start dutch auction from 2x price
    // }

    // function executeAuction(IERC20 token) external {
    //     // swap LP tokens to INCH
    //     // increment current epoch
    // }

    // function auctionPrice(IERC20 token) external {
    //     // get current auction price
    // }
}
