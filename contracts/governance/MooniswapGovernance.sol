// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MooniswapGovernancePure.sol";


abstract contract MooniswapGovernance is MooniswapGovernancePure, ERC20 {
    function _totalSupply() internal view override returns(uint256) {
        return totalSupply();
    }

    function _balanceOf(address account) internal view override returns(uint256) {
        return balanceOf(account);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        uint256 balanceFrom = (from != address(0)) ? _balanceOf(from) : 0;
        uint256 balanceTo = (from != address(0)) ? _balanceOf(to) : 0;
        uint256 totalSupplyBefore = _totalSupply();
        uint256 totalSupplyAfter = totalSupplyBefore
            .add(from == address(0) ? amount : 0)
            .sub(to == address(0) ? amount : 0);

        _updateFeeOnTransfer(from, to, amount, balanceFrom, balanceTo, totalSupplyBefore, totalSupplyAfter);
        _updateDecayPeriodOnTransfer(from, to, amount, balanceFrom, balanceTo, totalSupplyBefore, totalSupplyAfter);
    }

    function _updateFeeOnTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 balanceFrom,
        uint256 balanceTo,
        uint256 totalSupplyBefore,
        uint256 totalSupplyAfter
    ) private {
        uint256 oldFee = _fee.result;
        uint256 newFee;
        uint256 defaultFee = (_fee.votes[from].isDefault() || balanceFrom == amount || _fee.votes[to].isDefault())
            ? _factory.fee()
            : 0;

        if (from != address(0)) {
            (newFee,) = _fee.updateBalance(
                from,
                _fee.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                totalSupplyBefore,
                totalSupplyAfter,
                defaultFee
            );
        }

        if (to != address(0)) {
            (newFee,) = _fee.updateBalance(
                to,
                _fee.votes[to],
                balanceTo,
                balanceTo.add(amount),
                totalSupplyBefore,
                totalSupplyAfter,
                defaultFee
            );
        }

        if (oldFee != newFee) {
            _feeChanged(newFee);
        }
    }

    function _updateDecayPeriodOnTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 balanceFrom,
        uint256 balanceTo,
        uint256 totalSupplyBefore,
        uint256 totalSupplyAfter
    ) private {
        uint256 oldDecayPeriod = _decayPeriod.result;
        uint256 newDecayPeriod;
        uint256 defaultDecayPeriod = (_decayPeriod.votes[from].isDefault() || balanceFrom == amount || _decayPeriod.votes[to].isDefault())
            ? _factory.decayPeriod()
            : 0;

        if (from != address(0)) {
            (newDecayPeriod,) = _decayPeriod.updateBalance(
                from,
                _decayPeriod.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                totalSupplyBefore,
                totalSupplyAfter,
                defaultDecayPeriod
            );
        }

        if (to != address(0)) {
            (newDecayPeriod,) = _decayPeriod.updateBalance(
                to,
                _decayPeriod.votes[to],
                balanceTo,
                balanceTo.add(amount),
                totalSupplyBefore,
                totalSupplyAfter,
                defaultDecayPeriod
            );
        }

        if (oldDecayPeriod != newDecayPeriod) {
            _decayPeriodChanged(newDecayPeriod);
        }
    }
}
