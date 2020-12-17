// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMooniswapFactoryGovernance.sol";
import "../libraries/LimitedLiquidVoting.sol";
import "../MooniswapConstants.sol";
import "../utils/BalanceAccounting.sol";
import "./BaseGovernanceModule.sol";


contract MooniswapFactoryGovernance is IMooniswapFactoryGovernance, BaseGovernanceModule, MooniswapConstants, BalanceAccounting, Ownable {
    using Vote for Vote.Data;
    using LimitedLiquidVoting for LimitedLiquidVoting.Data;
    using VirtualVote for VirtualVote.Data;
    using SafeMath for uint256;

    event DefaultFeeVoteUpdate(address indexed user, uint256 fee, bool isDefault, uint256 amount);
    event DefaultSlippageFeeVoteUpdate(address indexed user, uint256 slippageFee, bool isDefault, uint256 amount);
    event DefaultDecayPeriodVoteUpdate(address indexed user, uint256 decayPeriod, bool isDefault, uint256 amount);
    event ReferralShareVoteUpdate(address indexed user, uint256 referralShare, bool isDefault, uint256 amount);
    event GovernanceShareVoteUpdate(address indexed user, uint256 governanceShare, bool isDefault, uint256 amount);
    event GovernanceFeeReceiverUpdate(address governanceFeeReceiver);
    event ReferralFeeReceiverUpdate(address referralFeeReceiver);

    LimitedLiquidVoting.Data private _defaultFee;
    LimitedLiquidVoting.Data private _defaultSlippageFee;
    LimitedLiquidVoting.Data private _defaultDecayPeriod;
    LimitedLiquidVoting.Data private _referralShare;
    LimitedLiquidVoting.Data private _governanceShare;
    address public override governanceFeeReceiver;
    address public override referralFeeReceiver;

    constructor(address _mothership) public BaseGovernanceModule(_mothership) {
        _defaultFee.data.result = uint104(_DEFAULT_FEE);
        _defaultSlippageFee.data.result = uint104(_DEFAULT_SLIPPAGE_FEE);
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

    function virtualDefaultFee() external view returns(uint104, uint104, uint48) {
        return (_defaultFee.data.oldResult, _defaultFee.data.result, _defaultFee.data.time);
    }

    function defaultSlippageFee() external view override returns(uint256) {
        return _defaultSlippageFee.data.current();
    }

    function defaultSlippageFeeVotes(address user) external view returns(uint256) {
        return _defaultSlippageFee.votes[user].get(_DEFAULT_SLIPPAGE_FEE);
    }

    function virtualDefaultSlippageFee() external view returns(uint104, uint104, uint48) {
        return (_defaultSlippageFee.data.oldResult, _defaultSlippageFee.data.result, _defaultSlippageFee.data.time);
    }

    function defaultDecayPeriod() external view override returns(uint256) {
        return _defaultDecayPeriod.data.current();
    }

    function defaultDecayPeriodVotes(address user) external view returns(uint256) {
        return _defaultDecayPeriod.votes[user].get(_DEFAULT_DECAY_PERIOD);
    }

    function virtualDefaultDecayPeriod() external view returns(uint104, uint104, uint48) {
        return (_defaultDecayPeriod.data.oldResult, _defaultDecayPeriod.data.result, _defaultDecayPeriod.data.time);
    }

    function referralShare() external view override returns(uint256) {
        return _referralShare.data.current();
    }

    function referralShareVotes(address user) external view returns(uint256) {
        return _referralShare.votes[user].get(_DEFAULT_REFERRAL_SHARE);
    }

    function virtualReferralShare() external view returns(uint104, uint104, uint48) {
        return (_referralShare.data.oldResult, _referralShare.data.result, _referralShare.data.time);
    }

    function governanceShare() external view override returns(uint256) {
        return _governanceShare.data.current();
    }

    function governanceShareVotes(address user) external view returns(uint256) {
        return _governanceShare.votes[user].get(_DEFAULT_GOVERNANCE_SHARE);
    }

    function virtualGovernanceShare() external view returns(uint104, uint104, uint48) {
        return (_governanceShare.data.oldResult, _governanceShare.data.result, _governanceShare.data.time);
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
        _defaultFee.updateVote(msg.sender, _defaultFee.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), _DEFAULT_FEE, _emitDefaultFeeVoteUpdate);
    }

   function discardDefaultFeeVote() external {
       _defaultFee.updateVote(msg.sender, _defaultFee.votes[msg.sender], Vote.init(), balanceOf(msg.sender), _DEFAULT_FEE, _emitDefaultFeeVoteUpdate);
    }

    function defaultSlippageFeeVote(uint256 vote) external {
        require(vote <= _MAX_SLIPPAGE_FEE, "Slippage fee vote is too high");
        _defaultSlippageFee.updateVote(msg.sender, _defaultSlippageFee.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), _DEFAULT_SLIPPAGE_FEE, _emitDefaultSlippageFeeVoteUpdate);
    }

   function discardDefaultSlippageFeeVote() external {
        _defaultSlippageFee.updateVote(msg.sender, _defaultSlippageFee.votes[msg.sender], Vote.init(), balanceOf(msg.sender), _DEFAULT_SLIPPAGE_FEE, _emitDefaultSlippageFeeVoteUpdate);
    }

    function defaultDecayPeriodVote(uint256 vote) external {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");
        _defaultDecayPeriod.updateVote(msg.sender, _defaultDecayPeriod.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodVoteUpdate);
    }

    function discardDefaultDecayPeriodVote() external {
        _defaultDecayPeriod.updateVote(msg.sender, _defaultDecayPeriod.votes[msg.sender], Vote.init(), balanceOf(msg.sender), _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodVoteUpdate);
    }

    function referralShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Referral share vote is too high");
        require(vote >= _MIN_REFERRAL_SHARE, "Referral share vote is too low");
        _referralShare.updateVote(msg.sender, _referralShare.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), _DEFAULT_REFERRAL_SHARE, _emitReferralShareVoteUpdate);
    }

    function discardReferralShareVote() external {
        _referralShare.updateVote(msg.sender, _referralShare.votes[msg.sender], Vote.init(), balanceOf(msg.sender), _DEFAULT_REFERRAL_SHARE, _emitReferralShareVoteUpdate);
    }

    function governanceShareVote(uint256 vote) external {
        require(vote <= _MAX_SHARE, "Gov share vote is too high");
        _governanceShare.updateVote(msg.sender, _governanceShare.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareVoteUpdate);
    }

    function discardGovernanceShareVote() external {
        _governanceShare.updateVote(msg.sender, _governanceShare.votes[msg.sender], Vote.init(), balanceOf(msg.sender), _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareVoteUpdate);
    }

    function _notifyStakeChanged(address account, uint256 newBalance) internal override {
        uint256 balance = _set(account, newBalance);
        if (newBalance == balance) {
            return;
        }

        _defaultFee.updateBalance(account, _defaultFee.votes[account], balance, newBalance, _DEFAULT_FEE, _emitDefaultFeeVoteUpdate);
        _defaultSlippageFee.updateBalance(account, _defaultSlippageFee.votes[account], balance, newBalance, _DEFAULT_SLIPPAGE_FEE, _emitDefaultSlippageFeeVoteUpdate);
        _defaultDecayPeriod.updateBalance(account, _defaultDecayPeriod.votes[account], balance, newBalance, _DEFAULT_DECAY_PERIOD, _emitDefaultDecayPeriodVoteUpdate);
        _referralShare.updateBalance(account, _referralShare.votes[account], balance, newBalance, _DEFAULT_REFERRAL_SHARE, _emitReferralShareVoteUpdate);
        _governanceShare.updateBalance(account, _governanceShare.votes[account], balance, newBalance, _DEFAULT_GOVERNANCE_SHARE, _emitGovernanceShareVoteUpdate);
    }

    function _emitDefaultFeeVoteUpdate(address user, uint256 newDefaulFee, bool isDefault, uint256 balance) private {
        emit DefaultFeeVoteUpdate(user, newDefaulFee, isDefault, balance);
    }

    function _emitDefaultSlippageFeeVoteUpdate(address user, uint256 newDefaulSlippageFee, bool isDefault, uint256 balance) private {
        emit DefaultSlippageFeeVoteUpdate(user, newDefaulSlippageFee, isDefault, balance);
    }

    function _emitDefaultDecayPeriodVoteUpdate(address user, uint256 newDefaultDecayPeriod, bool isDefault, uint256 balance) private {
        emit DefaultDecayPeriodVoteUpdate(user, newDefaultDecayPeriod, isDefault, balance);
    }

    function _emitReferralShareVoteUpdate(address user, uint256 newReferralShare, bool isDefault, uint256 balance) private {
        emit ReferralShareVoteUpdate(user, newReferralShare, isDefault, balance);
    }

    function _emitGovernanceShareVoteUpdate(address user, uint256 newGovernanceShare, bool isDefault, uint256 balance) private {
        emit GovernanceShareVoteUpdate(user, newGovernanceShare, isDefault, balance);
    }
}
