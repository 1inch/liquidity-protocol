// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IMooniswapFactoryGovernance.sol";
import "../libraries/Voting.sol";
import "../MooniswapConstants.sol";


abstract contract MooniswapGovernance is ERC20, ReentrancyGuard, MooniswapConstants {
    using Vote for Vote.Data;
    using Voting for Voting.Data;

    event FeeUpdate(uint256 fee);
    event DecayPeriodUpdate(uint256 decayPeriod);

    IMooniswapFactoryGovernance public immutable mooniswapFactoryGovernance;
    Voting.Data private _fee;
    Voting.Data private _decayPeriod;

    constructor(IMooniswapFactoryGovernance _mooniswapFactoryGovernance) internal {
        mooniswapFactoryGovernance = _mooniswapFactoryGovernance;
        _fee.result = _DEFAULT_FEE;
        _decayPeriod.result = _DEFAULT_DECAY_PERIOD;
    }

    function fee() public view returns(uint256) {
        return _fee.result;
    }

    function decayPeriod() public view returns(uint256) {
        return _decayPeriod.result;
    }

    function feeVotes(address user) public view returns(uint256) {
        return _fee.votes[user].get(mooniswapFactoryGovernance.defaultFee);
    }

    function decayPeriodVotes(address user) public view returns(uint256) {
        return _decayPeriod.votes[user].get(mooniswapFactoryGovernance.defaultDecayPeriod);
    }

    function feeVote(uint256 vote) external nonReentrant {
        require(vote <= _MAX_FEE, "Fee vote is too high");

        Vote.Data memory oldVote = _fee.votes[msg.sender];
        _updateVote(_fee, msg.sender, oldVote, Vote.init(vote), oldVote.isDefault() ? mooniswapFactoryGovernance.defaultFee() : 0, _emitFeeUpdate);
    }

    function decayPeriodVote(uint256 vote) external nonReentrant {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        Vote.Data memory oldVote = _decayPeriod.votes[msg.sender];
        _updateVote(_decayPeriod, msg.sender, oldVote, Vote.init(vote), oldVote.isDefault() ? mooniswapFactoryGovernance.defaultDecayPeriod() : 0, _emitDecayPeriodUpdate);
    }

    function discardFeeVote() external nonReentrant {
        _updateVote(_fee, msg.sender, _fee.votes[msg.sender], Vote.init(), mooniswapFactoryGovernance.defaultFee(), _emitFeeUpdate);
    }

    function discardDecayPeriodVote() external nonReentrant {
        _updateVote(_decayPeriod, msg.sender, _decayPeriod.votes[msg.sender], Vote.init(), mooniswapFactoryGovernance.defaultDecayPeriod(), _emitDecayPeriodUpdate);
    }

    function _updateVote(
        Voting.Data storage data,
        address account,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 defaultValue,
        function(uint256) emitEvent
    ) private {
        (uint256 newValue, bool changed) = data.updateVote(account, oldVote, newVote, balanceOf(account), totalSupply(), defaultValue);
        if (changed) {
            emitEvent(newValue);
        }
    }

    function _emitFeeUpdate(uint256 newFee) private {
        emit FeeUpdate(newFee);
    }

    function _emitDecayPeriodUpdate(uint256 newDecayPeriod) private {
        emit DecayPeriodUpdate(newDecayPeriod);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        uint256 balanceFrom = (from != address(0)) ? balanceOf(from) : 0;
        uint256 balanceTo = (from != address(0)) ? balanceOf(to) : 0;
        uint256 newTotalSupply = totalSupply()
            .add(from == address(0) ? amount : 0)
            .sub(to == address(0) ? amount : 0);

        ParamsHelper memory params = ParamsHelper({
            from: from,
            to: to,
            amount: amount,
            balanceFrom: balanceFrom,
            balanceTo: balanceTo,
            newTotalSupply: newTotalSupply
        });

        _updateOnTransfer(params, mooniswapFactoryGovernance.defaultFee, _emitFeeUpdate, _fee);
        _updateOnTransfer(params, mooniswapFactoryGovernance.defaultDecayPeriod, _emitDecayPeriodUpdate, _decayPeriod);
    }

    struct ParamsHelper {
        address from;
        address to;
        uint256 amount;
        uint256 balanceFrom;
        uint256 balanceTo;
        uint256 newTotalSupply;
    }

    function _updateOnTransfer(
        ParamsHelper memory params,
        function() external view returns (uint256) defaultValueGetter,
        function(uint256) internal emitEvent,
        Voting.Data storage votingData
    ) private {
        Vote.Data memory voteFrom = votingData.votes[params.from];
        Vote.Data memory voteTo = votingData.votes[params.to];

        if (voteFrom.isDefault() && voteTo.isDefault() && params.from != address(0) && params.to != address(0)) {
            return;
        }

        uint256 defaultValue = (voteFrom.isDefault() || voteTo.isDefault() || params.balanceFrom == params.amount) ? defaultValueGetter() : 0;
        uint256 oldValue = votingData.result;
        uint256 newValue;

        if (params.from != address(0)) {
            (newValue,) = votingData.updateBalance(params.from, voteFrom, params.balanceFrom, params.balanceFrom.sub(params.amount), params.newTotalSupply, defaultValue);
        }

        if (params.to != address(0)) {
            (newValue,) = votingData.updateBalance(params.to, voteTo, params.balanceTo, params.balanceTo.add(params.amount), params.newTotalSupply, defaultValue);
        }

        if (oldValue != newValue) {
            emitEvent(newValue);
        }
    }
}
