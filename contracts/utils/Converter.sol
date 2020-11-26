// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../libraries/UniERC20.sol";
import "../libraries/VirtualBalance.sol";
import "../Mooniswap.sol";


contract Converter {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using UniERC20 for IERC20;
    using VirtualBalance for VirtualBalance.Data;

    uint256 private constant _ONE = 1e18;
    uint256 private constant _SPREAD_FEE_MULTIPLIER = 10;
    uint256 private constant _MAX_LIQUIDITY_SHARE = 100;

    IERC20 public immutable targetToken;

    constructor (IERC20 _targetToken) public {
        targetToken = _targetToken;
    }

    modifier validSpread(Mooniswap mooniswap) {
        _validateSpread(mooniswap);

        _;
    }

    function _validateSpread(Mooniswap mooniswap) internal view {
        IERC20[] memory tokens = mooniswap.getTokens();

        uint256 buyPrice;
        uint256 sellPrice;
        uint256 spotPrice;
        {
            uint256 token0Balance = tokens[0].uniBalanceOf(address(mooniswap));
            uint256 token1Balance = tokens[1].uniBalanceOf(address(mooniswap));
            uint256 decayPeriod = mooniswap.decayPeriod();
            VirtualBalance.Data memory vb;
            (vb.balance, vb.time) = mooniswap.virtualBalancesForAddition(tokens[0]);
            uint256 token0BalanceForAddition = Math.max(vb.current(decayPeriod, token0Balance), token0Balance);
            (vb.balance, vb.time) = mooniswap.virtualBalancesForAddition(tokens[1]);
            uint256 token1BalanceForAddition = Math.max(vb.current(decayPeriod, token1Balance), token1Balance);
            (vb.balance, vb.time) = mooniswap.virtualBalancesForRemoval(tokens[0]);
            uint256 token0BalanceForRemoval = Math.min(vb.current(decayPeriod, token0Balance), token0Balance);
            (vb.balance, vb.time) = mooniswap.virtualBalancesForRemoval(tokens[1]);
            uint256 token1BalanceForRemoval = Math.min(vb.current(decayPeriod, token1Balance), token1Balance);

            buyPrice = _ONE.mul(token1BalanceForAddition).div(token0BalanceForRemoval);
            sellPrice = _ONE.mul(token1BalanceForRemoval).div(token0BalanceForAddition);
            spotPrice = _ONE.mul(token1Balance).div(token0Balance);
        }

        require(buyPrice.sub(sellPrice).mul(_ONE) < mooniswap.fee().mul(_SPREAD_FEE_MULTIPLIER).mul(spotPrice), "Spread is too high");
    }

    function _maxAmountForSwap(IERC20[] memory path, uint256 initialAmount) internal view returns(uint256 amount) {
        amount = initialAmount;
        uint256 stepAmount = amount;
        uint256 pathLength = path.length;

        for (uint256 i = 1; i < pathLength; i += 2) {
            Mooniswap mooniswap = Mooniswap(address(path[i]));
            _validateSpread(mooniswap);
            uint256 maxCurSwapAmount = path[i-1].uniBalanceOf(address(mooniswap)).div(_MAX_LIQUIDITY_SHARE);
            if (maxCurSwapAmount < stepAmount) {
                amount = amount.mul(maxCurSwapAmount).div(stepAmount);
                stepAmount = maxCurSwapAmount;
            }
            if (i + 2 < pathLength) {
                // no need to estimate getReturn on last step
                stepAmount = mooniswap.getReturn(path[i-1], path[i+1], stepAmount);
            }
        }
    }

    function _swap(IERC20[] memory path, uint256 initialAmount, address payable destination) internal returns(uint256 amount) {
        require(path[path.length - 1] == targetToken, "Should swap to target token");
        require(path.length % 2 == 1, "Path length should be odd");

        amount = initialAmount;

        for (uint256 i = 1; i < path.length; i += 2) {
            uint256 value = amount;
            if (!path[i-1].isETH()) {
                path[i-1].safeApprove(address(path[i]), amount);
                value = 0;
            }

            Mooniswap mooni = Mooniswap(address(path[i]));
            if (i + 2 < path.length) {
                amount = mooni.swap{value: value}(path[i-1], path[i+1], amount, 0, address(this));
            }
            else {
                amount = mooni.swapFor{value: value}(path[i-1], path[i+1], amount, 0, address(this), destination);
            }
        }

        if (path.length == 1) {
            path[0].transfer(destination, amount);
        }
    }
}
