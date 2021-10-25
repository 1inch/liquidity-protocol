# FarmingRewards

Farming rewards contract



## Functions
### constructor
```solidity
function constructor(
  contract Mooniswap _mooniswap,
  contract IERC20 _gift,
  uint256 _duration,
  address _rewardDistribution,
  uint256 scale
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_mooniswap` | contract Mooniswap | 
|`_gift` | contract IERC20 | 
|`_duration` | uint256 | 
|`_rewardDistribution` | address | 
|`scale` | uint256 | 


### name
```solidity
function name(
) external returns (string)
```




### symbol
```solidity
function symbol(
) external returns (string)
```




### decimals
```solidity
function decimals(
) external returns (uint8)
```




### stake
```solidity
function stake(
  uint256 amount
) public
```
Stakes `amount` of tokens into farm

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`amount` | uint256 | 


### withdraw
```solidity
function withdraw(
  uint256 amount
) public
```
Withdraws `amount` of tokens from farm

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`amount` | uint256 | 


### exit
```solidity
function exit(
) external
```
Withdraws all staked funds and rewards



### fee
```solidity
function fee(
) public returns (uint256)
```
Current fee



### slippageFee
```solidity
function slippageFee(
) public returns (uint256)
```
Current slippage



### decayPeriod
```solidity
function decayPeriod(
) public returns (uint256)
```
Current decay period



### feeVotes
```solidity
function feeVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### slippageFeeVotes
```solidity
function slippageFeeVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred slippage fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### decayPeriodVotes
```solidity
function decayPeriodVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred decay period

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### feeVote
```solidity
function feeVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### slippageFeeVote
```solidity
function slippageFeeVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for slippage fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### decayPeriodVote
```solidity
function decayPeriodVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for decay period

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### discardFeeVote
```solidity
function discardFeeVote(
) external
```
Retracts `msg.senders`'s vote for fee



### discardSlippageFeeVote
```solidity
function discardSlippageFeeVote(
) external
```
Retracts `msg.senders`'s vote for slippage fee



### discardDecayPeriodVote
```solidity
function discardDecayPeriodVote(
) external
```
Retracts `msg.senders`'s vote for decay period



### _mint
```solidity
function _mint(
  address account,
  uint256 amount
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`amount` | uint256 | 


### _burn
```solidity
function _burn(
  address account,
  uint256 amount
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`amount` | uint256 | 


### rescueFunds
```solidity
function rescueFunds(
  contract IERC20 token,
  uint256 amount
) external
```
Allows contract owner to withdraw funds that was send to contract by mistake

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 
|`amount` | uint256 | 


## Events
### Staked
```solidity
event Staked(
  address user,
  uint256 amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 
|`amount` | uint256 | 

### Withdrawn
```solidity
event Withdrawn(
  address user,
  uint256 amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 
|`amount` | uint256 | 

### FeeVoteUpdate
```solidity
event FeeVoteUpdate(
  address user,
  uint256 fee,
  bool isDefault,
  uint256 amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 
|`fee` | uint256 | 
|`isDefault` | bool | 
|`amount` | uint256 | 

### Transfer
```solidity
event Transfer(
  address from,
  address to,
  uint256 value
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`from` | address | 
|`to` | address | 
|`value` | uint256 | 

### SlippageFeeVoteUpdate
```solidity
event SlippageFeeVoteUpdate(
  address user,
  uint256 slippageFee,
  bool isDefault,
  uint256 amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 
|`slippageFee` | uint256 | 
|`isDefault` | bool | 
|`amount` | uint256 | 

### DecayPeriodVoteUpdate
```solidity
event DecayPeriodVoteUpdate(
  address user,
  uint256 decayPeriod,
  bool isDefault,
  uint256 amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 
|`decayPeriod` | uint256 | 
|`isDefault` | bool | 
|`amount` | uint256 | 

