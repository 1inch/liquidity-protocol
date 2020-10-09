// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IMooniFactory.sol";
import "../libraries/Voting.sol";
import "../MooniswapConstants.sol";


abstract contract IERC20Helper {
    function _totalSupply() internal view virtual returns(uint256);
    function _balanceOf(address account) internal view virtual returns(uint256);
}


abstract contract MooniswapGovernancePure is IERC20Helper, ReentrancyGuard, MooniswapConstants {
    using Vote for Vote.Data;
    using Voting for Voting.Data;

    event FeeUpdate(
        uint256 fee
    );

    event DecayPeriodUpdate(
        uint256 decayPeriod
    );

    IMooniFactory internal immutable _factory;
    Voting.Data internal _fee;
    Voting.Data internal _decayPeriod;

    constructor() internal {
        _factory = IMooniFactory(msg.sender);
        _fee.result = _DEFAULT_FEE;
        _decayPeriod.result = _DEFAULT_DECAY_PERIOD;
    }

    function factory() public view returns(IMooniFactory) {
        return _factory;
    }

    function fee() public view returns(uint256) {
        return _fee.result;
    }

    function decayPeriod() public view returns(uint256) {
        return _decayPeriod.result;
    }

    function feeVotes(address user) public view returns(uint256) {
        return _fee.votes[user].get(_factory.fee);
    }

    function decayPeriodVotes(address user) public view returns(uint256) {
        return _decayPeriod.votes[user].get(_factory.decayPeriod);
    }

    function feeVote(uint256 vote) external nonReentrant {
        require(vote <= _MAX_FEE, "Fee vote is too high");

        Vote.Data memory oldVote = _fee.votes[msg.sender];
        uint256 defaultVote = oldVote.isDefault() ? _factory.fee() : 0;

        (uint256 newFee, bool changed) = _fee.updateVote(
            msg.sender,
            oldVote,
            Vote.init(vote),
            _balanceOf(msg.sender),
            _totalSupply(),
            defaultVote
        );

        if (changed) {
            _feeChanged(newFee);
        }
    }

    function decayPeriodVote(uint256 vote) external nonReentrant {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        Vote.Data memory oldVote = _decayPeriod.votes[msg.sender];
        uint256 defaultVote = oldVote.isDefault() ? _factory.decayPeriod() : 0;

        (uint256 newDecayPeriod, bool decayPeriodChanged) = _decayPeriod.updateVote(
            msg.sender,
            oldVote,
            Vote.init(vote),
            _balanceOf(msg.sender),
            _totalSupply(),
            defaultVote
        );

        if (decayPeriodChanged) {
            _decayPeriodChanged(newDecayPeriod);
        }
    }

    function discardFeeVote() external nonReentrant {
        (uint256 newFee, bool feeChanged) = _fee.updateVote(
            msg.sender,
            _fee.votes[msg.sender],
            Vote.init(),
            _balanceOf(msg.sender),
            _totalSupply(),
            _factory.fee()
        );

        if (feeChanged) {
            _feeChanged(newFee);
        }
    }

    function discardDecayPeriodVote() external nonReentrant {
        (uint256 newDecayPeriod, bool decayPeriodChanged) = _decayPeriod.updateVote(
            msg.sender,
            _decayPeriod.votes[msg.sender],
            Vote.init(),
            _balanceOf(msg.sender),
            _totalSupply(),
            _factory.decayPeriod()
        );

        if (decayPeriodChanged) {
            _decayPeriodChanged(newDecayPeriod);
        }
    }

    function _feeChanged(uint256 newFee) internal virtual {
        emit FeeUpdate(newFee);
    }

    function _decayPeriodChanged(uint256 newDecayPeriod) internal virtual {
        emit DecayPeriodUpdate(newDecayPeriod);
    }
}
