// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../interfaces/IExchangeGovernance.sol";
import "../libraries/ExchangeConstants.sol";
import "../libraries/LiquidVoting.sol";
import "../libraries/SafeCast.sol";
import "../utils/BalanceAccounting.sol";
import "./BaseGovernanceModule.sol";


contract ExchangeGovernance is IExchangeGovernance, BaseGovernanceModule, BalanceAccounting {
    using Vote for Vote.Data;
    using LiquidVoting for LiquidVoting.Data;
    using VirtualVote for VirtualVote.Data;
    using SafeCast for uint256;

    event LeftoverGovernanceShareUpdate(address indexed user, uint256 vote, bool isDefault, uint256 amount);
    event LeftoverReferralShareUpdate(address indexed user, uint256 vote, bool isDefault, uint256 amount);
    event LeftoverTeamShareUpdate(address indexed user, uint256 vote, bool isDefault, uint256 amount);

    LiquidVoting.Data private _leftoverGovernanceShare;
    LiquidVoting.Data private _leftoverReferralShare;

    constructor(address _mothership) public BaseGovernanceModule(_mothership) {
        _leftoverGovernanceShare.data.result = ExchangeConstants._DEFAULT_LEFTOVER_GOV_SHARE.toUint104();
        _leftoverReferralShare.data.result = ExchangeConstants._DEFAULT_LEFTOVER_REF_SHARE.toUint104();
    }

    function parameters() external view override returns(uint256 govShare, uint256 refShare, uint256 teamShare) {
        govShare = _leftoverGovernanceShare.data.current();
        refShare = _leftoverReferralShare.data.current();
        teamShare = ExchangeConstants._LEFTOVER_TOTAL_SHARE.sub(govShare).sub(refShare);
    }

    function leftoverGovernanceShare() external view override returns(uint256) {
        return _leftoverGovernanceShare.data.current();
    }

    function leftoverGovernanceShareVotes(address user) external view returns(uint256) {
        return _leftoverGovernanceShare.votes[user].get(ExchangeConstants._DEFAULT_LEFTOVER_GOV_SHARE);
    }

    function virtualLeftoverGovernanceShare() external view returns(uint104, uint104, uint48) {
        return (_leftoverGovernanceShare.data.oldResult, _leftoverGovernanceShare.data.result, _leftoverGovernanceShare.data.time);
    }

    //

    function leftoverReferralShare() external view override returns(uint256) {
        return _leftoverReferralShare.data.current();
    }

    function leftoverReferralShareVotes(address user) external view returns(uint256) {
        return _leftoverReferralShare.votes[user].get(ExchangeConstants._DEFAULT_LEFTOVER_REF_SHARE);
    }

    function virtualLeftoverReferralShare() external view returns(uint104, uint104, uint48) {
        return (_leftoverReferralShare.data.oldResult, _leftoverReferralShare.data.result, _leftoverReferralShare.data.time);
    }

    //

    function leftoverTeamShare() external view override returns(uint256) {
        return ExchangeConstants._LEFTOVER_TOTAL_SHARE
            .sub(_leftoverGovernanceShare.data.current())
            .sub(_leftoverReferralShare.data.current());
    }

    function leftoverTeamShareVotes(address user) external view returns(uint256) {
        return ExchangeConstants._LEFTOVER_TOTAL_SHARE
            .sub(_leftoverGovernanceShare.votes[user].get(ExchangeConstants._DEFAULT_LEFTOVER_GOV_SHARE))
            .sub(_leftoverReferralShare.votes[user].get(ExchangeConstants._DEFAULT_LEFTOVER_REF_SHARE));
    }

    function virtualLeftoverTeamShare() external view returns(uint104, uint104, uint48) {
        return (
            ExchangeConstants._LEFTOVER_TOTAL_SHARE
                .sub(_leftoverGovernanceShare.data.oldResult)
                .sub(_leftoverReferralShare.data.oldResult).toUint104(),
            ExchangeConstants._LEFTOVER_TOTAL_SHARE
                .sub(_leftoverGovernanceShare.data.result)
                .sub(_leftoverReferralShare.data.result).toUint104(),
            _leftoverGovernanceShare.data.time
        );
    }

    ///

    function leftoverShareVote(uint256 govShare, uint256 refShare) external {
        uint256 teamShare = ExchangeConstants._LEFTOVER_TOTAL_SHARE
            .sub(govShare.add(refShare), "Leftover shares are too high");

        uint256 balance = balanceOf(msg.sender);
        uint256 supply = totalSupply();

        _leftoverGovernanceShare.updateVote(
            msg.sender,
            _leftoverGovernanceShare.votes[msg.sender],
            Vote.init(govShare),
            balance,
            supply,
            ExchangeConstants._DEFAULT_LEFTOVER_GOV_SHARE,
            _emitLeftoverGovernanceShareVoteUpdate
        );

        _leftoverReferralShare.updateVote(
            msg.sender,
            _leftoverReferralShare.votes[msg.sender],
            Vote.init(refShare),
            balance,
            supply,
            ExchangeConstants._DEFAULT_LEFTOVER_REF_SHARE,
            _emitLeftoverReferralShareVoteUpdate
        );

        _emitLeftoverTeamShareVoteUpdate(msg.sender, teamShare, false, balance);
    }

    function discardLeftoverShareVote() external {
        uint256 balance = balanceOf(msg.sender);
        uint256 supply = totalSupply();

        _leftoverGovernanceShare.updateVote(
           msg.sender,
           _leftoverGovernanceShare.votes[msg.sender],
           Vote.init(),
           balance,
           supply,
           ExchangeConstants._DEFAULT_LEFTOVER_GOV_SHARE,
           _emitLeftoverGovernanceShareVoteUpdate
        );

        _leftoverReferralShare.updateVote(
           msg.sender,
           _leftoverReferralShare.votes[msg.sender],
           Vote.init(),
           balance,
           supply,
           ExchangeConstants._DEFAULT_LEFTOVER_REF_SHARE,
           _emitLeftoverReferralShareVoteUpdate
        );

        _emitLeftoverTeamShareVoteUpdate(msg.sender, ExchangeConstants._DEFAULT_LEFTOVER_TEAM_SHARE, true, balance);
    }

    function _notifyStakeChanged(address account, uint256 newBalance) internal override {
        uint256 balance = _set(account, newBalance);
        if (newBalance == balance) {
            return;
        }

        Vote.Data memory govShareVote = _leftoverGovernanceShare.votes[account];
        Vote.Data memory refShareVote = _leftoverReferralShare.votes[account];
        uint256 teamShare = ExchangeConstants._LEFTOVER_TOTAL_SHARE
            .sub(govShareVote.get(ExchangeConstants._DEFAULT_LEFTOVER_GOV_SHARE))
            .sub(refShareVote.get(ExchangeConstants._DEFAULT_LEFTOVER_REF_SHARE));
        uint256 supply = totalSupply();

        _leftoverGovernanceShare.updateBalance(
            account,
            govShareVote,
            balance,
            newBalance,
            supply,
            ExchangeConstants._DEFAULT_LEFTOVER_GOV_SHARE,
            _emitLeftoverGovernanceShareVoteUpdate
        );

        _leftoverReferralShare.updateBalance(
            account,
            refShareVote,
            balance,
            newBalance,
            supply,
            ExchangeConstants._DEFAULT_LEFTOVER_REF_SHARE,
            _emitLeftoverReferralShareVoteUpdate
        );

        _emitLeftoverTeamShareVoteUpdate(
            account,
            teamShare,
            govShareVote.isDefault(),
            newBalance
        );
    }

    function _emitLeftoverGovernanceShareVoteUpdate(address user, uint256 newDefaultShare, bool isDefault, uint256 balance) private {
        emit LeftoverGovernanceShareUpdate(user, newDefaultShare, isDefault, balance);
    }

    function _emitLeftoverReferralShareVoteUpdate(address user, uint256 newDefaultShare, bool isDefault, uint256 balance) private {
        emit LeftoverReferralShareUpdate(user, newDefaultShare, isDefault, balance);
    }

    function _emitLeftoverTeamShareVoteUpdate(address user, uint256 newDefaultShare, bool isDefault, uint256 balance) private {
        emit LeftoverTeamShareUpdate(user, newDefaultShare, isDefault, balance);
    }
}
