// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./libraries/Rewards.sol";
import "./governance/MooniswapGovernance.sol";


contract GovernedRewards is Rewards, MooniswapGovernancePure {
    MooniswapGovernance public immutable pool;

    constructor(MooniswapGovernance _pool, IERC20 _gift) public Rewards(IERC20(_pool), _gift) {
        pool = _pool;
    }

    function _feeChanged(uint256 newFee) internal override {
        // super._feeChanged(newFee);
        pool.feeVote(newFee);
    }

    function _decayPeriodChanged(uint256 newDecayPeriod) internal override {
        // super._decayPeriodChanged(newDecayPeriod);
        pool.decayPeriodVote(newDecayPeriod);
    }

    function _totalSupply() internal view override returns(uint256) {
        return totalSupply();
    }

    function _balanceOf(address account) internal view override returns(uint256) {
        return balanceOf(account);
    }
}
