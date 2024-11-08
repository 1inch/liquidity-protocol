
## BaseRewards

### Types list
- [TokenRewards](#tokenrewards)

### Functions list
- [lastTimeRewardApplicable(i) public](#lasttimerewardapplicable)
- [rewardPerToken(i) public](#rewardpertoken)
- [earned(i, account) public](#earned)
- [getReward(i) public](#getreward)
- [getAllRewards() public](#getallrewards)
- [notifyRewardAmount(i, reward) external](#notifyrewardamount)
- [setRewardDistribution(i, _rewardDistribution) external](#setrewarddistribution)
- [setDuration(i, duration) external](#setduration)
- [setScale(i, scale) external](#setscale)
- [addGift(gift, duration, rewardDistribution, scale) public](#addgift)

### Events list
- [RewardAdded(i, reward) ](#rewardadded)
- [RewardPaid(i, user, reward) ](#rewardpaid)
- [DurationUpdated(i, duration) ](#durationupdated)
- [ScaleUpdated(i, scale) ](#scaleupdated)
- [RewardDistributionChanged(i, rewardDistribution) ](#rewarddistributionchanged)
- [NewGift(i, gift) ](#newgift)

### Types
### TokenRewards

```solidity
struct TokenRewards {
  contract IERC20 gift;
  uint256 scale;
  uint256 duration;
  address rewardDistribution;
  uint256 periodFinish;
  uint256 rewardRate;
  uint256 lastUpdateTime;
  uint256 rewardPerTokenStored;
  mapping(address => uint256) userRewardPerTokenPaid;
  mapping(address => uint256) rewards;
}
```

### Functions
### lastTimeRewardApplicable

```solidity
function lastTimeRewardApplicable(uint256 i) public view returns (uint256)
```
Returns last time specific token reward was applicable

### rewardPerToken

```solidity
function rewardPerToken(uint256 i) public view returns (uint256)
```
Returns current reward per token

### earned

```solidity
function earned(uint256 i, address account) public view returns (uint256)
```
Returns how many tokens account currently has

### getReward

```solidity
function getReward(uint256 i) public
```
Withdraws `msg.sender`'s reward

### getAllRewards

```solidity
function getAllRewards() public
```
Same as `getReward` but for all listed tokens

### notifyRewardAmount

```solidity
function notifyRewardAmount(uint256 i, uint256 reward) external
```
Updates specific token rewards amount

### setRewardDistribution

```solidity
function setRewardDistribution(uint256 i, address _rewardDistribution) external
```
Updates rewards distributor

### setDuration

```solidity
function setDuration(uint256 i, uint256 duration) external
```
Updates rewards duration

### setScale

```solidity
function setScale(uint256 i, uint256 scale) external
```
Updates rewards scale

### addGift

```solidity
function addGift(contract IERC20 gift, uint256 duration, address rewardDistribution, uint256 scale) public
```
Adds new token to the list

### Events
### RewardAdded

```solidity
event RewardAdded(uint256 i, uint256 reward)
```

### RewardPaid

```solidity
event RewardPaid(uint256 i, address user, uint256 reward)
```

### DurationUpdated

```solidity
event DurationUpdated(uint256 i, uint256 duration)
```

### ScaleUpdated

```solidity
event ScaleUpdated(uint256 i, uint256 scale)
```

### RewardDistributionChanged

```solidity
event RewardDistributionChanged(uint256 i, address rewardDistribution)
```

### NewGift

```solidity
event NewGift(uint256 i, contract IERC20 gift)
```

