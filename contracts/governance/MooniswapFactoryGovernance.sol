// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMooniswapFactoryGovernance.sol";
import "../libraries/Voting.sol";
import "../MooniswapConstants.sol";
import "../utils/BalanceAccounting.sol";
import "./BaseGovernanceModule.sol";


contract MooniswapFactoryGovernance is IMooniswapFactoryGovernance, BaseGovernanceModule, MooniswapConstants, BalanceAccounting, Ownable {
    using Vote for Vote.Data;
    using Voting for Voting.Data;
    using SafeMath for uint256;

    event DefaultFeeUpdate(uint256 fee);
    event DefaultDecayPeriodUpdate(uint256 decayPeriod);
    event ReferralShareUpdate(uint256 referralShare);
    event GovernanceShareUpdate(uint256 referralShare);
    event GovernanceFeeReceiverUpdate(address governanceFeeReceiver);

    Voting.Data private _defaultFee;
    Voting.Data private _defaultDecayPeriod;
    Voting.Data private _referralShare;
    Voting.Data private _governanceShare;
    address public override governanceFeeReceiver;

    constructor(address _mothership) public BaseGovernanceModule(_mothership) {
        _defaultFee.result = _DEFAULT_FEE;
        _defaultDecayPeriod.result = _DEFAULT_DECAY_PERIOD;
        _referralShare.result = _DEFAULT_REFERRAL_SHARE;
        _governanceShare.result = _DEFAULT_GOVERNANCE_SHARE;
    }

    function parameters() external view override returns(GovernanceParameters memory) {
        return GovernanceParameters({
            referralShare: _referralShare.result,
            governanceShare: _governanceShare.result,
            governanceFeeReceiver: governanceFeeReceiver
        });
    }

    function defaultFee() external view override returns(uint256) {
        return _defaultFee.result;
    }

    function defaultFeeVotes(address user) external view returns(uint256) {
        return _defaultFee.votes[user].get(_DEFAULT_FEE);
    }

    function defaultDecayPeriod() external view override returns(uint256) {
        return _defaultDecayPeriod.result;
    }

    function decayPeriodVotes(address user) external view returns(uint256) {
        return _defaultDecayPeriod.votes[user].get(_DEFAULT_DECAY_PERIOD);
    }

    function referralShare() external view override returns(uint256) {
        return _referralShare.result;
    }

    function referralShareVotes(address user) external view returns(uint256) {
        return _referralShare.votes[user].get(_DEFAULT_REFERRAL_SHARE);
    }

    function governanceShare() external view override returns(uint256) {
        return _governanceShare.result;
    }

    function governanceShareVotes(address user) external view returns(uint256) {
        return _governanceShare.votes[user].get(_DEFAULT_GOVERNANCE_SHARE);
    }

    function setGovernanceFeeReceiver(address newGovernanceFeeReceiver) external onlyOwner {
        governanceFeeReceiver = newGovernanceFeeReceiver;
        emit GovernanceFeeReceiverUpdate(newGovernanceFeeReceiver);
    }

    function defaultFeeVote(uint256 vote) external {
        require(vote <= _MAX_FEE, "Fee vote is too high");
        _updateVote(_defaultFee, msg.sender, Vote.init(vote), _DEFAULT_FEE, _emitDefaultFeeUpdate);
    }

   function discardDefaultFeeVote() external {
       _updateVote(_defaultFee, msg.sender, Vote.init(), _DEFAULT_FEE, _emitDefaultFeeUpdate);
    }

    function defaultDecayPeriodVote(uint256 vote) external {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        _updateVote(_defaultDecayPeriod, msg.sender, Vote.init(vote), _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodUpdate);
    }

    function discardDefaultDecayPeriodVote() external {
        _updateVote(_defaultDecayPeriod, msg.sender, Vote.init(), _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodUpdate);
    }

    function referralShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Referral share vote is too high");
        require(vote >= _MIN_REFERRAL_SHARE, "Referral share vote is too low");

        _updateVote(_referralShare, msg.sender, Vote.init(vote), _DEFAULT_REFERRAL_SHARE, _emitReferralShareUpdate);
    }

    function discardReferralShareVote() external {
        _updateVote(_referralShare, msg.sender, Vote.init(), _DEFAULT_REFERRAL_SHARE, _emitReferralShareUpdate);
    }

    function governanceShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Gov share vote is too high");

        _updateVote(_governanceShare, msg.sender, Vote.init(vote), _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareUpdate);
    }

    function discardGovernanceShareVote() external {
        _updateVote(_governanceShare, msg.sender, Vote.init(), _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareUpdate);
    }

    function notifyStakeChanged(address account, uint256 newBalance) external override onlyMothership {
        uint256 balance = balanceOf(account);
        if (newBalance > balance) {
            _mint(account, newBalance.sub(balance));
        } else if (newBalance < balance) {
            _burn(account, balance.sub(newBalance));
        } else {
            return;
        }
        uint256 newTotalSupply = totalSupply();

        _updateBalance(_defaultFee, account, balance, newBalance, newTotalSupply, _DEFAULT_FEE, _emitDefaultFeeUpdate);
        _updateBalance(_defaultDecayPeriod, account, balance, newBalance, newTotalSupply, _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodUpdate);
        _updateBalance(_referralShare, account, balance, newBalance, newTotalSupply, _DEFAULT_REFERRAL_SHARE, _emitReferralShareUpdate);
        _updateBalance(_governanceShare, account, balance, newBalance, newTotalSupply, _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareUpdate);
    }

    function _emitDefaultFeeUpdate(uint256 newDefaulFee) private {
        emit DefaultFeeUpdate(newDefaulFee);
    }

    function _emitDefaultDecayPeriodUpdate(uint256 newDefaultDecayPeriod) private {
        emit DefaultDecayPeriodUpdate(newDefaultDecayPeriod);
    }

    function _emitReferralShareUpdate(uint256 newReferralShare) private {
        emit ReferralShareUpdate(newReferralShare);
    }

    function _emitGovernanceShareUpdate(uint256 newGovernanceShare) private {
        emit GovernanceShareUpdate(newGovernanceShare);
    }

    function _updateVote(
        Voting.Data storage data,
        address account,
        Vote.Data memory vote,
        uint256 defaultValue,
        function(uint256) emitEvent
    ) private {
        (uint256 newValue, bool changed) = data.updateVote(
            account,
            data.votes[account],
            vote,
            balanceOf(account),
            totalSupply(),
            defaultValue
        );

        if (changed) {
            emitEvent(newValue);
        }
    }

    function _updateBalance(
        Voting.Data storage data,
        address account,
        uint256 balance,
        uint256 newBalance,
        uint256 newTotalSupply,
        uint256 defaultValue,
        function(uint256) emitEvent
    ) private {
        (uint256 newValue, bool changed) = data.updateBalance(
            account,
            data.votes[account],
            balance,
            newBalance,
            newTotalSupply,
            defaultValue
        );

        if (changed) {
            emitEvent(newValue);
        }
    }
}
