// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../MooniFactory.sol";
import "../libraries/Voting.sol";
import "../MooniswapConstants.sol";


contract WrappedMoon is ERC20, MooniswapConstants {
    // TODO: add permit

    using Vote for Vote.Data;
    using Voting for Voting.Data;

    IERC20 public immutable moonToken;
    MooniFactory public immutable mooniFactory;

    Voting.Data private _fee;
    Voting.Data private _decayPeriod;
    Voting.Data private _referralShare;
    Voting.Data private _governanceShare;

    constructor(IERC20 _moonToken, MooniFactory _mooniFactory) public ERC20("Wrapped MOON Token", "wMOON") {
        moonToken = _moonToken;
        mooniFactory = _mooniFactory;
        _fee.result = _DEFAULT_FEE;
        _decayPeriod.result = _DEFAULT_DECAY_PERIOD;
        _referralShare.result = _DEFAULT_REFERRAL_SHARE;
        _governanceShare.result = _DEFAULT_GOVERNANCE_SHARE;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Empty stake is not allowed");
        moonToken.transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Empty unstake is not allowed");
        moonToken.transfer(msg.sender, amount);
        _burn(msg.sender, amount);
    }

    function feeVote(uint256 vote) external {
        require(vote <= _MAX_FEE, "Fee vote is too high");

        (uint256 newFee, bool changed) = _fee.updateVote(
            msg.sender,
            _fee.votes[msg.sender],
            Vote.init(vote),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_FEE
        );

        if (changed) {
            mooniFactory.setFee(newFee);
        }
    }

   function discardFeeVote() external {
        (uint256 newFee, bool feeChanged) = _fee.updateVote(
            msg.sender,
            _fee.votes[msg.sender],
            Vote.init(),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_FEE
        );

        if (feeChanged) {
            mooniFactory.setFee(newFee);
        }
    }

    function decayPeriodVote(uint256 vote) external {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        (uint256 newDecayPeriod, bool decayPeriodChanged) = _decayPeriod.updateVote(
            msg.sender,
            _decayPeriod.votes[msg.sender],
            Vote.init(vote),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_DECAY_PERIOD
        );

        if (decayPeriodChanged) {
            mooniFactory.setDecayPeriod(newDecayPeriod);
        }
    }

    function discardDecayPeriodVote() external {
        (uint256 newDecayPeriod, bool decayPeriodChanged) = _decayPeriod.updateVote(
            msg.sender,
            _decayPeriod.votes[msg.sender],
            Vote.init(),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_DECAY_PERIOD
        );

        if (decayPeriodChanged) {
            mooniFactory.setDecayPeriod(newDecayPeriod);
        }
    }

    function referralShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Referral share vote is too high");
        require(vote >= _MIN_REFERRAL_SHARE, "Referral share vote is too low");

        (uint256 newReferralShare, bool referralShareChanged) = _referralShare.updateVote(
            msg.sender,
            _referralShare.votes[msg.sender],
            Vote.init(vote),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_REFERRAL_SHARE
        );

        if (referralShareChanged) {
            mooniFactory.setReferralShare(newReferralShare);
        }
    }

    function discardReferralShareVote() external {
        (uint256 newReferralShare, bool referralShareChanged) = _referralShare.updateVote(
            msg.sender,
            _referralShare.votes[msg.sender],
            Vote.init(),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_REFERRAL_SHARE
        );

        if (referralShareChanged) {
            mooniFactory.setReferralShare(newReferralShare);
        }
    }

    function governanceShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Gov share vote is too high");

        (uint256 newGovernanceShare, bool governanceShareChanged) = _governanceShare.updateVote(
            msg.sender,
            _governanceShare.votes[msg.sender],
            Vote.init(vote),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_GOVERNANCE_SHARE
        );

        if (governanceShareChanged) {
            mooniFactory.setGovernanceShare(newGovernanceShare);
        }
    }

    function discardGovernanceShareVote() external {
        (uint256 newGovernanceShare, bool governanceShareChanged) = _governanceShare.updateVote(
            msg.sender,
            _governanceShare.votes[msg.sender],
            Vote.init(),
            balanceOf(msg.sender),
            totalSupply(),
            _DEFAULT_GOVERNANCE_SHARE
        );

        if (governanceShareChanged) {
            mooniFactory.setGovernanceShare(newGovernanceShare);
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        uint256 balanceFrom = (from != address(0)) ? balanceOf(from) : 0;
        uint256 balanceTo = (from != address(0)) ? balanceOf(to) : 0;
        uint256 newTotalSupply = totalSupply()
            .add(from == address(0) ? amount : 0)
            .sub(to == address(0) ? amount : 0);

        _updateFeeOnTransfer(from, to, amount, balanceFrom, balanceTo, newTotalSupply);
        _updateDecayPeriodOnTransfer(from, to, amount, balanceFrom, balanceTo, newTotalSupply);
        _updateReferralShareOnTransfer(from, to, amount, balanceFrom, balanceTo, newTotalSupply);
        _updateGovernanceShareOnTransfer(from, to, amount, balanceFrom, balanceTo, newTotalSupply);
    }

    function _updateFeeOnTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 balanceFrom,
        uint256 balanceTo,
        uint256 newTotalSupply
    ) private {
        uint256 oldValue = _fee.result;
        uint256 newValue;

        if (from != address(0)) {
            (newValue,) = _fee.updateBalance(
                from,
                _fee.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                newTotalSupply,
                _DEFAULT_FEE
            );
        }

        if (to != address(0)) {
            (newValue,) = _fee.updateBalance(
                to,
                _fee.votes[to],
                balanceTo,
                balanceTo.add(amount),
                newTotalSupply,
                _DEFAULT_FEE
            );
        }

        if (oldValue != newValue) {
            mooniFactory.setFee(newValue);
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
        uint256 oldValue = _decayPeriod.result;
        uint256 newValue;

        if (from != address(0)) {
            (newValue,) = _decayPeriod.updateBalance(
                from,
                _decayPeriod.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                newTotalSupply,
                _DEFAULT_DECAY_PERIOD
            );
        }

        if (to != address(0)) {
            (newValue,) = _decayPeriod.updateBalance(
                to,
                _decayPeriod.votes[to],
                balanceTo,
                balanceTo.add(amount),
                newTotalSupply,
                _DEFAULT_DECAY_PERIOD
            );
        }

        if (oldValue != newValue) {
            mooniFactory.setDecayPeriod(newValue);
        }
    }

    function _updateReferralShareOnTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 balanceFrom,
        uint256 balanceTo,
        uint256 newTotalSupply
    ) private {
        uint256 oldValue = _referralShare.result;
        uint256 newValue;

        if (from != address(0)) {
            (newValue,) = _referralShare.updateBalance(
                from,
                _referralShare.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                newTotalSupply,
                _DEFAULT_REFERRAL_SHARE
            );
        }

        if (to != address(0)) {
            (newValue,) = _referralShare.updateBalance(
                to,
                _referralShare.votes[to],
                balanceTo,
                balanceTo.add(amount),
                newTotalSupply,
                _DEFAULT_REFERRAL_SHARE
            );
        }

        if (oldValue != newValue) {
            mooniFactory.setReferralShare(newValue);
        }
    }

    function _updateGovernanceShareOnTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 balanceFrom,
        uint256 balanceTo,
        uint256 newTotalSupply
    ) private {
        uint256 oldValue = _governanceShare.result;
        uint256 newValue;

        if (from != address(0)) {
            (newValue,) = _governanceShare.updateBalance(
                from,
                _governanceShare.votes[from],
                balanceFrom,
                balanceFrom.sub(amount),
                newTotalSupply,
                _DEFAULT_GOVERNANCE_SHARE
            );
        }

        if (to != address(0)) {
            (newValue,) = _governanceShare.updateBalance(
                to,
                _governanceShare.votes[to],
                balanceTo,
                balanceTo.add(amount),
                newTotalSupply,
                _DEFAULT_GOVERNANCE_SHARE
            );
        }

        if (oldValue != newValue) {
            mooniFactory.setGovernanceShare(newValue);
        }
    }
}
