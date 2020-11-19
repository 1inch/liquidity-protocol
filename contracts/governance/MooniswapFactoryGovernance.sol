// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMooniswapFactoryGovernance.sol";
import "../libraries/LiquidVoting.sol";
import "../MooniswapConstants.sol";
import "../utils/BalanceAccounting.sol";
import "./BaseGovernanceModule.sol";


contract MooniswapFactoryGovernance is IMooniswapFactoryGovernance, BaseGovernanceModule, MooniswapConstants, BalanceAccounting, Ownable {
    using Vote for Vote.Data;
    using LiquidVoting for LiquidVoting.Data;
    using LiquidVoting for LiquidVoting.VirtualData;
    using SafeMath for uint256;

    event DefaultFeeVoteUpdate(address indexed user, uint256 fee, uint256 amount);
    event DefaultDecayPeriodVoteUpdate(address indexed user, uint256 decayPeriod, uint256 amount);
    event ReferralShareVoteUpdate(address indexed user, uint256 referralShare, uint256 amount);
    event GovernanceShareVoteUpdate(address indexed user, uint256 referralShare, uint256 amount);
    event GovernanceFeeReceiverUpdate(address governanceFeeReceiver);
    event ReferralFeeReceiverUpdate(address referralFeeReceiver);

    LiquidVoting.Data private _defaultFee;
    LiquidVoting.Data private _defaultDecayPeriod;
    LiquidVoting.Data private _referralShare;
    LiquidVoting.Data private _governanceShare;
    address public override governanceFeeReceiver;
    address public override referralFeeReceiver;

    constructor(address _mothership) public BaseGovernanceModule(_mothership) {
        _defaultFee.data.result = uint104(_DEFAULT_FEE);
        _defaultDecayPeriod.data.result = uint104(_DEFAULT_DECAY_PERIOD);
        _referralShare.data.result = uint104(_DEFAULT_REFERRAL_SHARE);
        _governanceShare.data.result = uint104(_DEFAULT_GOVERNANCE_SHARE);
    }

    function parameters() external view override returns(uint256, uint256, address, address) {
        return (_referralShare.data.current(), _governanceShare.data.current(), governanceFeeReceiver, referralFeeReceiver);
    }

    function defaultFee() external view override returns(uint256) {
        return _defaultFee.data.current();
    }

    function defaultFeeVotes(address user) external view returns(uint256) {
        return _defaultFee.votes[user].get(_DEFAULT_FEE);
    }

    function defaultDecayPeriod() external view override returns(uint256) {
        return _defaultDecayPeriod.data.current();
    }

    function defaultDecayPeriodVotes(address user) external view returns(uint256) {
        return _defaultDecayPeriod.votes[user].get(_DEFAULT_DECAY_PERIOD);
    }

    function referralShare() external view override returns(uint256) {
        return _referralShare.data.current();
    }

    function referralShareVotes(address user) external view returns(uint256) {
        return _referralShare.votes[user].get(_DEFAULT_REFERRAL_SHARE);
    }

    function governanceShare() external view override returns(uint256) {
        return _governanceShare.data.current();
    }

    function governanceShareVotes(address user) external view returns(uint256) {
        return _governanceShare.votes[user].get(_DEFAULT_GOVERNANCE_SHARE);
    }

    function setGovernanceFeeReceiver(address newGovernanceFeeReceiver) external onlyOwner {
        governanceFeeReceiver = newGovernanceFeeReceiver;
        emit GovernanceFeeReceiverUpdate(newGovernanceFeeReceiver);
    }

    function setReferralFeeReceiver(address newReferralFeeReceiver) external onlyOwner {
        referralFeeReceiver = newReferralFeeReceiver;
        emit ReferralFeeReceiverUpdate(newReferralFeeReceiver);
    }

    function defaultFeeVote(uint256 vote) external {
        require(vote <= _MAX_FEE, "Fee vote is too high");
        _updateVote(_defaultFee, msg.sender, Vote.init(vote), _DEFAULT_FEE, _emitDefaultFeeVoteUpdate);
    }

   function discardDefaultFeeVote() external {
       _updateVote(_defaultFee, msg.sender, Vote.init(), _DEFAULT_FEE, _emitDefaultFeeVoteUpdate);
    }

    function defaultDecayPeriodVote(uint256 vote) external {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        _updateVote(_defaultDecayPeriod, msg.sender, Vote.init(vote), _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodVoteUpdate);
    }

    function discardDefaultDecayPeriodVote() external {
        _updateVote(_defaultDecayPeriod, msg.sender, Vote.init(), _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodVoteUpdate);
    }

    function referralShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Referral share vote is too high");
        require(vote >= _MIN_REFERRAL_SHARE, "Referral share vote is too low");

        _updateVote(_referralShare, msg.sender, Vote.init(vote), _DEFAULT_REFERRAL_SHARE, _emitReferralShareVoteUpdate);
    }

    function discardReferralShareVote() external {
        _updateVote(_referralShare, msg.sender, Vote.init(), _DEFAULT_REFERRAL_SHARE, _emitReferralShareVoteUpdate);
    }

    function governanceShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Gov share vote is too high");

        _updateVote(_governanceShare, msg.sender, Vote.init(vote), _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareVoteUpdate);
    }

    function discardGovernanceShareVote() external {
        _updateVote(_governanceShare, msg.sender, Vote.init(), _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareVoteUpdate);
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

        _updateBalance(_defaultFee, account, balance, newBalance, newTotalSupply, _DEFAULT_FEE, _emitDefaultFeeVoteUpdate);
        _updateBalance(_defaultDecayPeriod, account, balance, newBalance, newTotalSupply, _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodVoteUpdate);
        _updateBalance(_referralShare, account, balance, newBalance, newTotalSupply, _DEFAULT_REFERRAL_SHARE, _emitReferralShareVoteUpdate);
        _updateBalance(_governanceShare, account, balance, newBalance, newTotalSupply, _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareVoteUpdate);
    }

    function _emitDefaultFeeVoteUpdate(address user, uint256 newDefaulFee, uint256 balance) private {
        emit DefaultFeeVoteUpdate(user, newDefaulFee, balance);
    }

    function _emitDefaultDecayPeriodVoteUpdate(address user, uint256 newDefaultDecayPeriod, uint256 balance) private {
        emit DefaultDecayPeriodVoteUpdate(user, newDefaultDecayPeriod, balance);
    }

    function _emitReferralShareVoteUpdate(address user, uint256 newReferralShare, uint256 balance) private {
        emit ReferralShareVoteUpdate(user, newReferralShare, balance);
    }

    function _emitGovernanceShareVoteUpdate(address user, uint256 newGovernanceShare, uint256 balance) private {
        emit GovernanceShareVoteUpdate(user, newGovernanceShare, balance);
    }

    function _updateVote(
        LiquidVoting.Data storage data,
        address account,
        Vote.Data memory vote,
        uint256 defaultValue,
        function(address, uint256, uint256) emitEvent
    ) private {
        uint256 newBalance = balanceOf(account);

        data.updateVote(
            account,
            data.votes[account],
            vote,
            newBalance,
            totalSupply(),
            defaultValue
        );

        emitEvent(account, vote.get(defaultValue), newBalance);
    }

    function _updateBalance(
        LiquidVoting.Data storage data,
        address account,
        uint256 balance,
        uint256 newBalance,
        uint256 newTotalSupply,
        uint256 defaultValue,
        function(address, uint256, uint256) emitEvent
    ) private {
        Vote.Data memory vote = data.votes[account];

        data.updateBalance(
            account,
            vote,
            balance,
            newBalance,
            newTotalSupply,
            defaultValue
        );

        emitEvent(account, vote.get(defaultValue), newBalance);
    }
}
