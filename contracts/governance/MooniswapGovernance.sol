// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IMooniFactory.sol";
import "../libraries/Voting.sol";
import "../MooniswapConstants.sol";


contract MooniswapGovernance is ERC20, ReentrancyGuard, MooniswapConstants {
    using Vote for Vote.Data;
    using Voting for Voting.Data;

    event FeeUpdate(
        uint256 fee
    );

    event DecayPeriodUpdate(
        uint256 decayPeriod
    );

    IMooniFactory private immutable _factory;
    Voting.Data private _fee;
    Voting.Data private _decayPeriod;

    constructor(string memory name, string memory symbol) internal ERC20(name, symbol) {
        require(bytes(name).length > 0, "Mooniswap: name is empty");
        require(bytes(symbol).length > 0, "Mooniswap: symbol is empty");

        _factory = IMooniFactory(msg.sender);
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

        (uint256 newFee, bool changed) = _fee.updateVote(
            msg.sender,
            _fee.votes[msg.sender],
            Vote.init(vote),
            balanceOf(msg.sender),
            totalSupply(),
            _factory.fee
        );

        if (changed) {
            emit FeeUpdate(newFee);
        }
    }

    function decayPeriodVote(uint256 vote) external nonReentrant {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        (uint256 newDecayPeriod, bool decayPeriodChanged) = _decayPeriod.updateVote(
            msg.sender,
            _decayPeriod.votes[msg.sender],
            Vote.init(vote),
            balanceOf(msg.sender),
            totalSupply(),
            _factory.decayPeriod
        );

        if (decayPeriodChanged) {
            emit DecayPeriodUpdate(newDecayPeriod);
        }
    }

    function discardFeeVote() external nonReentrant {
        (uint256 newFee, bool feeChanged) = _fee.updateVote(
            msg.sender,
            _fee.votes[msg.sender],
            Vote.init(),
            balanceOf(msg.sender),
            totalSupply(),
            _factory.fee
        );

        if (feeChanged) {
            emit FeeUpdate(newFee);
        }
    }

    function discardDecayPeriodVote() external nonReentrant {
        (uint256 newFee, bool changed) = _decayPeriod.updateVote(
            msg.sender,
            _decayPeriod.votes[msg.sender],
            Vote.init(),
            balanceOf(msg.sender),
            totalSupply(),
            _factory.decayPeriod
        );

        if (changed) {
            emit DecayPeriodUpdate(newFee);
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        uint256 balanceFrom = (from != address(0)) ? balanceOf(from) : 0;
        uint256 balanceTo = (from != address(0)) ? balanceOf(to) : 0;
        uint256 totalSupplyBefore = totalSupply();
        uint256 totalSupplyAfter = totalSupplyBefore
            .add(from == address(0) ? amount : 0)
            .sub(to == address(0) ? amount : 0);

        uint256 oldFee = _fee.result;
        uint256 newFee = 0;
        if (from != address(0)) {
            (newFee,) = _fee.updateBalance(
                from,
                _fee.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                totalSupplyBefore,
                totalSupplyAfter,
                _factory.fee
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
                _factory.fee
            );
        }

        if (oldFee != newFee) {
            emit FeeUpdate(newFee);
        }

        //

        uint256 oldDecayPeriod = _decayPeriod.result;
        uint256 newDecayPeriod = 0;

        if (from != address(0)) {
            _decayPeriod.updateBalance(
                from,
                _decayPeriod.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                totalSupplyBefore,
                totalSupplyAfter,
                _factory.decayPeriod
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
                _factory.decayPeriod
            );
        }

        if (oldDecayPeriod != newDecayPeriod) {
            emit DecayPeriodUpdate(newDecayPeriod);
        }
    }
}
