// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IMooniswapFactoryGovernance.sol";
import "../libraries/LiquidVoting.sol";
import "../MooniswapConstants.sol";


abstract contract MooniswapGovernance is ERC20, ReentrancyGuard, MooniswapConstants {
    using Vote for Vote.Data;
    using LiquidVoting for LiquidVoting.Data;
    using LiquidVoting for LiquidVoting.VirtualData;

    event FeeVoteUpdate(address indexed user, uint256 fee, uint256 amount);
    event DecayPeriodVoteUpdate(address indexed user, uint256 decayPeriod, uint256 amount);

    IMooniswapFactoryGovernance public immutable mooniswapFactoryGovernance;
    LiquidVoting.Data private _fee;
    LiquidVoting.Data private _decayPeriod;

    constructor(IMooniswapFactoryGovernance _mooniswapFactoryGovernance) internal {
        mooniswapFactoryGovernance = _mooniswapFactoryGovernance;
        _fee.data.result = uint104(_mooniswapFactoryGovernance.defaultFee());
        _decayPeriod.data.result = uint104(_mooniswapFactoryGovernance.defaultDecayPeriod());
    }

    function fee() public view returns(uint256) {
        return _fee.data.current();
    }

    function decayPeriod() public view returns(uint256) {
        return _decayPeriod.data.current();
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
        LiquidVoting.Data storage data,
        address account,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 defaultValue,
        function(address, uint256, uint256) emitEvent
    ) private {
        uint256 balance = balanceOf(account);
        data.updateVote(account, oldVote, newVote, balance, totalSupply(), defaultValue);
        emitEvent(account, newVote.get(defaultValue), balance);
    }

    function _emitFeeUpdate(address account, uint256 newFee, uint256 newBalance) private {
        emit FeeVoteUpdate(account, newFee, newBalance);
    }

    function _emitDecayPeriodUpdate(address account, uint256 newDecayPeriod, uint256 newBalance) private {
        emit DecayPeriodVoteUpdate(account, newDecayPeriod, newBalance);
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
        function(address, uint256, uint256) internal emitEvent,
        LiquidVoting.Data storage votingData
    ) private {
        Vote.Data memory voteFrom = votingData.votes[params.from];
        Vote.Data memory voteTo = votingData.votes[params.to];

        uint256 defaultValue = (voteFrom.isDefault() || voteTo.isDefault() || params.balanceFrom == params.amount) ? defaultValueGetter() : 0;

        if (voteFrom.isDefault() && voteTo.isDefault() && params.from != address(0) && params.to != address(0)) {
            emitEvent(params.from, voteFrom.get(defaultValue), params.balanceFrom.sub(params.amount));
            emitEvent(params.from, voteTo.get(defaultValue), params.balanceTo.add(params.amount));
            return;
        }

        if (params.from != address(0)) {
            uint256 newBalance = params.balanceFrom.sub(params.amount);
            votingData.updateBalance(params.from, voteFrom, params.balanceFrom, newBalance, params.newTotalSupply, defaultValue);
            emitEvent(params.from, voteFrom.value, newBalance);
        }

        if (params.to != address(0)) {
            uint256 newBalance = params.balanceTo.add(params.amount);
            votingData.updateBalance(params.to, voteTo, params.balanceTo, newBalance, params.newTotalSupply, defaultValue);
            emitEvent(params.from, voteTo.value, newBalance);
        }
    }
}
