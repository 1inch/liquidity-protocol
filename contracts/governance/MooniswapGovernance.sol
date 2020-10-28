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
        _updateVote(_fee, msg.sender, oldVote, Vote.init(vote), oldVote.isDefault() ? mooniswapFactoryGovernance.defaultFee() : 0, _feeUpdate);
    }

    function decayPeriodVote(uint256 vote) external nonReentrant {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        Vote.Data memory oldVote = _decayPeriod.votes[msg.sender];
        _updateVote(_decayPeriod, msg.sender, oldVote, Vote.init(vote), oldVote.isDefault() ? mooniswapFactoryGovernance.defaultDecayPeriod() : 0, _decayPeriodUpdate);
    }

    function discardFeeVote() external nonReentrant {
        _updateVote(_fee, msg.sender, _fee.votes[msg.sender], Vote.init(), mooniswapFactoryGovernance.defaultFee(), _feeUpdate);
    }

    function discardDecayPeriodVote() external nonReentrant {
        _updateVote(_decayPeriod, msg.sender, _decayPeriod.votes[msg.sender], Vote.init(), mooniswapFactoryGovernance.defaultDecayPeriod(), _decayPeriodUpdate);
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

    function _feeUpdate(uint256 newFee) private {
        emit FeeUpdate(newFee);
    }

    function _decayPeriodUpdate(uint256 newDecayPeriod) private {
        emit DecayPeriodUpdate(newDecayPeriod);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        uint256 balanceFrom = (from != address(0)) ? balanceOf(from) : 0;
        uint256 balanceTo = (from != address(0)) ? balanceOf(to) : 0;
        uint256 newTotalSupply = totalSupply()
            .add(from == address(0) ? amount : 0)
            .sub(to == address(0) ? amount : 0);

        _updateFeeOnTransfer(from, to, amount, balanceFrom, balanceTo, newTotalSupply);
        _updateDecayPeriodOnTransfer(from, to, amount, balanceFrom, balanceTo, newTotalSupply);
    }

    function _updateFeeOnTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 balanceFrom,
        uint256 balanceTo,
        uint256 newTotalSupply
    ) private {
        uint256 oldFee = _fee.result;
        uint256 newFee;
        Vote.Data memory voteFrom = _fee.votes[from];
        Vote.Data memory voteTo = _fee.votes[to];
        uint256 defaultFee = (voteFrom.isDefault() || balanceFrom == amount || voteTo.isDefault())
            ? mooniswapFactoryGovernance.defaultFee()
            : 0;

        if (from != address(0)) {
            (newFee,) = _fee.updateBalance(from, voteFrom, balanceFrom, balanceFrom.sub(amount), newTotalSupply, defaultFee);
        }

        if (to != address(0)) {
            (newFee,) = _fee.updateBalance(to, voteTo, balanceTo, balanceTo.add(amount), newTotalSupply, defaultFee);
        }

        if (oldFee != newFee) {
            emit FeeUpdate(newFee);
        }
    }

    function _updateDecayPeriodOnTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 balanceFrom,
        uint256 balanceTo,
        uint256 newTotalSupply
    ) private {
        uint256 oldDecayPeriod = _decayPeriod.result;
        uint256 newDecayPeriod;
        Vote.Data memory voteFrom = _decayPeriod.votes[from];
        Vote.Data memory voteTo = _decayPeriod.votes[to];
        uint256 defaultDecayPeriod = (voteFrom.isDefault() || balanceFrom == amount || voteTo.isDefault())
            ? mooniswapFactoryGovernance.defaultDecayPeriod()
            : 0;

        if (from != address(0)) {
            (newDecayPeriod,) = _decayPeriod.updateBalance(from, voteFrom, balanceFrom, balanceFrom.sub(amount), newTotalSupply, defaultDecayPeriod);
        }

        if (to != address(0)) {
            (newDecayPeriod,) = _decayPeriod.updateBalance(to, voteTo, balanceTo, balanceTo.add(amount), newTotalSupply, defaultDecayPeriod);
        }

        if (oldDecayPeriod != newDecayPeriod) {
            emit DecayPeriodUpdate(newDecayPeriod);
        }
    }
}
