// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./BalanceAccounting.sol";


contract BaseRewards is Ownable, BalanceAccounting {
    using SafeERC20 for IERC20;

    event RewardAdded(uint256 indexed i, uint256 reward);
    event RewardPaid(uint256 indexed i, address indexed user, uint256 reward);
    event DurationUpdated(uint256 indexed i, uint256 duration);
    event RewardDistributionChanged(uint256 indexed i, address rewardDistribution);
    event NewGift(uint256 indexed i, IERC20 gift);

    struct TokenRewards {
        IERC20 gift;
        uint256 duration;
        address rewardDistribution;

        uint256 periodFinish;
        uint256 rewardRate;
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        mapping(address => uint256) userRewardPerTokenPaid;
        mapping(address => uint256) rewards;
    }

    TokenRewards[] public tokenRewards;

    modifier updateReward(address account) {
        uint256 len = tokenRewards.length;
        for (uint i = 0; i < len; i++) {
            TokenRewards storage tr = tokenRewards[i];
            tr.rewardPerTokenStored = rewardPerToken(i);
            tr.lastUpdateTime = lastTimeRewardApplicable(i);
            if (account != address(0)) {
                tr.rewards[account] = earned(i, account);
                tr.userRewardPerTokenPaid[account] = tr.rewardPerTokenStored;
            }
        }
        _;
    }

    modifier onlyRewardDistribution(uint i) {
        require(msg.sender == tokenRewards[i].rewardDistribution, "Access denied");
        _;
    }

    function lastTimeRewardApplicable(uint i) public view returns (uint256) {
        return Math.min(block.timestamp, tokenRewards[i].periodFinish);
    }

    function rewardPerToken(uint i) public view returns (uint256) {
        TokenRewards storage tr = tokenRewards[i];
        if (totalSupply() == 0) {
            return tr.rewardPerTokenStored;
        }
        return tr.rewardPerTokenStored.add(
            lastTimeRewardApplicable(i)
                .sub(tr.lastUpdateTime)
                .mul(tr.rewardRate)
                .mul(1e18)
                .div(totalSupply())
        );
    }

    function earned(uint i, address account) public view returns (uint256) {
        TokenRewards storage tr = tokenRewards[i];
        return balanceOf(account)
            .mul(rewardPerToken(i).sub(tr.userRewardPerTokenPaid[account]))
            .div(1e18)
            .add(tr.rewards[account]);
    }

    function getReward(uint i) public updateReward(msg.sender) {
        TokenRewards storage tr = tokenRewards[i];
        uint256 reward = tr.rewards[msg.sender];
        if (reward > 0) {
            tr.rewards[msg.sender] = 0;
            tr.gift.safeTransfer(msg.sender, reward);
            emit RewardPaid(i, msg.sender, reward);
        }
    }

    function getAllRewards() public {
        uint256 len = tokenRewards.length;
        for (uint i = 0; i < len; i++) {
            getReward(i);
        }
    }

    function notifyRewardAmount(uint i, uint256 reward) external onlyRewardDistribution(i) updateReward(address(0)) {
        require(reward < uint(-1).div(1e18), "Reward overlow");

        TokenRewards storage tr = tokenRewards[i];
        uint256 duration = tr.duration;

        if (block.timestamp >= tr.periodFinish) {
            require(reward >= duration, "Reward is too small");
            tr.rewardRate = reward.div(duration);
        } else {
            uint256 remaining = tr.periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(tr.rewardRate);
            require(reward.add(leftover) >= duration, "Reward is too small");
            tr.rewardRate = reward.add(leftover).div(duration);
        }

        uint balance = tr.gift.balanceOf(address(this));
        require(tr.rewardRate <= balance.div(duration), "Reward is too big");

        tr.lastUpdateTime = block.timestamp;
        tr.periodFinish = block.timestamp.add(duration);
        emit RewardAdded(i, reward);
    }

    function setRewardDistribution(uint i, address _rewardDistribution) external onlyOwner {
        TokenRewards storage tr = tokenRewards[i];
        tr.rewardDistribution = _rewardDistribution;
        emit RewardDistributionChanged(i, _rewardDistribution);
    }

    function setDuration(uint i, uint256 _duration) external onlyRewardDistribution(i) {
        TokenRewards storage tr = tokenRewards[i];
        require(block.timestamp >= tr.periodFinish, "Not finished yet");
        tr.duration = _duration;
        emit DurationUpdated(i, _duration);
    }

    function addGift(IERC20 gift, uint256 duration, address rewardDistribution) public onlyOwner {
        uint256 len = tokenRewards.length;
        for (uint i = 0; i < len; i++) {
            require(gift != tokenRewards[i].gift, "Gift is already added");
        }

        TokenRewards storage tr = tokenRewards.push();
        tr.gift = gift;
        tr.duration = duration;
        tr.rewardDistribution = rewardDistribution;

        emit NewGift(len, gift);
        emit DurationUpdated(len, duration);
        emit RewardDistributionChanged(len, rewardDistribution);
    }
}
