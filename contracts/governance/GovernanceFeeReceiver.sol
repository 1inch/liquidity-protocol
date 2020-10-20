// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../Mooniswap.sol";
import "../libraries/UniERC20.sol";
import "../libraries/VirtualBalance.sol";


contract GovernanceFeeReceiver {
    using SafeMath for uint256;
    using UniERC20 for IERC20;
    using VirtualBalance for VirtualBalance.Data;

    uint256 private constant _ONE = 1e18;
    uint256 private constant _SPREAD_FEE_MULTIPLIER = 10;
    uint256 private constant _MAX_LIQUIDITY_SHARE = 100;

    IERC20 public immutable moonToken;
    address public immutable wrappedMoon;

    constructor(IERC20 _moonToken, address _wrappedMoon) public {
        moonToken = _moonToken;
        wrappedMoon = _wrappedMoon;
    }

    modifier validSpread(Mooniswap mooniswap) {
        _validateSpread(mooniswap);
        _;
    }

    // solhint-disable-next-line visibility-modifier-order
    function unwrapLPTokens(Mooniswap mooniswap, uint256 amount, uint256[] memory minReturns) validSpread(mooniswap) external {
        mooniswap.withdraw(amount, minReturns);
    }

    // solhint-disable-next-line visibility-modifier-order
    function swap(IERC20[] memory path) external {
        require(path[path.length - 1] == moonToken, "should swap to moon token");

        uint256 amount = path[0].balanceOf(address(this));
        uint256 swapAmount = amount;
        for (uint256 i = 1; i < path.length; i += 2) {
            Mooniswap mooniswap = Mooniswap(address(path[i]));
            _validateSpread(mooniswap);
            uint256 maxCurSwapAmount = path[i-1].balanceOf(address(mooniswap)).div(_MAX_LIQUIDITY_SHARE);
            if (maxCurSwapAmount < swapAmount) {
                amount = amount.mul(maxCurSwapAmount).div(swapAmount);
                swapAmount = maxCurSwapAmount;
            }
            swapAmount = mooniswap.getReturn(path[i-1], path[i+1], swapAmount);
        }
        for (uint256 i = 1; i < path.length - 2; i += 2) {
            amount = Mooniswap(address(path[i])).swap(path[i-1], path[i+1], amount, 0, address(this));
        }

        moonToken.transfer(wrappedMoon, amount);
    }

    function _validateSpread(Mooniswap mooniswap) view private {
        IERC20[2] memory tokens = mooniswap.getTokens();

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
            uint256 token1BalanceForRemoval = Math.max(VirtualBalance.Data({balance: balance, time: time}).current(decayPeriod, token1Balance), token1Balance);

            buyPrice = _ONE.mul(token1BalanceForAddition).div(token0BalanceForRemoval);
            sellPrice = _ONE.mul(token1BalanceForRemoval).div(token0BalanceForAddition);
            spotPrice = _ONE.mul(token1Balance).div(token0Balance);
        }

        require(buyPrice.sub(sellPrice).mul(_ONE) < mooniswap.fee().mul(_SPREAD_FEE_MULTIPLIER).mul(spotPrice), "Spread is too high");
    }
}
