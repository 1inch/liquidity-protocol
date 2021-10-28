# BaseRewards

Base contract for reward mechanics



## Functions
### lastTimeRewardApplicable
```solidity
function lastTimeRewardApplicable(
  uint256 i
) public returns (uint256)
```
Returns last time specific token reward was applicable

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 


### rewardPerToken
```solidity
function rewardPerToken(
  uint256 i
) public returns (uint256)
```
Returns current reward per token

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 


### earned
```solidity
function earned(
  uint256 i,
  address account
) public returns (uint256)
```
Returns how many tokens account currently has

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`account` | address | 


### getReward
```solidity
function getReward(
  uint256 i
) public
```
Withdraws `msg.sender`'s reward

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 


### getAllRewards
```solidity
function getAllRewards(
) public
```
Same as `getReward` but for all listed tokens



### notifyRewardAmount
```solidity
function notifyRewardAmount(
  uint256 i,
  uint256 reward
) external
```
Updates specific token rewards amount

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`reward` | uint256 | 


### setRewardDistribution
```solidity
function setRewardDistribution(
  uint256 i,
  address _rewardDistribution
) external
```
Updates rewards distributor

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`_rewardDistribution` | address | 


### setDuration
```solidity
function setDuration(
  uint256 i,
  uint256 duration
) external
```
Updates rewards duration

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`duration` | uint256 | 


### setScale
```solidity
function setScale(
  uint256 i,
  uint256 scale
) external
```
Updates rewards scale

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`scale` | uint256 | 


### addGift
```solidity
function addGift(
  contract IERC20 gift,
  uint256 duration,
  address rewardDistribution,
  uint256 scale
) public
```
Adds new token to the list

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`gift` | contract IERC20 | 
|`duration` | uint256 | 
|`rewardDistribution` | address | 
|`scale` | uint256 | 


## Events
### RewardAdded
```solidity
event RewardAdded(
  uint256 i,
  uint256 reward
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`reward` | uint256 | 

### RewardPaid
```solidity
event RewardPaid(
  uint256 i,
  address user,
  uint256 reward
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`user` | address | 
|`reward` | uint256 | 

### DurationUpdated
```solidity
event DurationUpdated(
  uint256 i,
  uint256 duration
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`duration` | uint256 | 

### ScaleUpdated
```solidity
event ScaleUpdated(
  uint256 i,
  uint256 scale
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`scale` | uint256 | 

### RewardDistributionChanged
```solidity
event RewardDistributionChanged(
  uint256 i,
  address rewardDistribution
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`rewardDistribution` | address | 

### NewGift
```solidity
event NewGift(
  uint256 i,
  contract IERC20 gift
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 
|`gift` | contract IERC20 | 

