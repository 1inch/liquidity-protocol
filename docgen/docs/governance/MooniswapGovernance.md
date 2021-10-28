# MooniswapGovernance

1inch Mooniswap governance



## Functions
### constructor
```solidity
function constructor(
  contract IMooniswapFactoryGovernance _mooniswapFactoryGovernance
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_mooniswapFactoryGovernance` | contract IMooniswapFactoryGovernance | 


### setMooniswapFactoryGovernance
```solidity
function setMooniswapFactoryGovernance(
  contract IMooniswapFactoryGovernance newMooniswapFactoryGovernance
) external
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`newMooniswapFactoryGovernance` | contract IMooniswapFactoryGovernance | 


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



### virtualFee
```solidity
function virtualFee(
) external returns (uint104, uint104, uint48)
```
Describes previous fee that had place, current one and time on which this changed



### virtualSlippageFee
```solidity
function virtualSlippageFee(
) external returns (uint104, uint104, uint48)
```
Describes previous slippage fee that had place, current one and time on which this changed



### virtualDecayPeriod
```solidity
function virtualDecayPeriod(
) external returns (uint104, uint104, uint48)
```
Describes previous decay period that had place, current one and time on which this changed



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



### _beforeTokenTransfer
```solidity
function _beforeTokenTransfer(
  address from,
  address to,
  uint256 amount
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`from` | address | 
|`to` | address | 
|`amount` | uint256 | 


## Events
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

