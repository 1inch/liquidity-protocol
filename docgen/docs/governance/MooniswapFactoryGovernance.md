# MooniswapFactoryGovernance

1inch Mooniswap factory governance



## Functions
### constructor
```solidity
function constructor(
  address _mothership
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_mothership` | address | 


### shutdown
```solidity
function shutdown(
) external
```




### isActive
```solidity
function isActive(
) external returns (bool)
```
True if contract is currently working and wasn't stopped. Otherwise, false



### shareParameters
```solidity
function shareParameters(
) external returns (uint256, uint256, address, address)
```
Returns information about mooniswap shares



#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`referralShare`| uint256 | Referrals share 
|`governanceShare`| uint256 | Governance share 
|`governanceWallet`| address | Governance wallet address 
|`referralFeeReceiver`| address | Fee collector address

### defaults
```solidity
function defaults(
) external returns (uint256, uint256, uint256)
```
Initial settings that contract was created



#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`defaultFee`| uint256 | Default fee 
|`defaultSlippageFee`| uint256 | Default slippage fee 
|`defaultDecayPeriod`| uint256 | Decay period for virtual amounts

### defaultFee
```solidity
function defaultFee(
) external returns (uint256)
```
Same as `defaults` but only returns fee



### defaultFeeVotes
```solidity
function defaultFeeVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred default fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### virtualDefaultFee
```solidity
function virtualDefaultFee(
) external returns (uint104, uint104, uint48)
```
Describes previous default fee that had place, current one and time on which this changed



### defaultSlippageFee
```solidity
function defaultSlippageFee(
) external returns (uint256)
```
Same as `defaults` but only returns slippage fee



### defaultSlippageFeeVotes
```solidity
function defaultSlippageFeeVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred default slippage fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### virtualDefaultSlippageFee
```solidity
function virtualDefaultSlippageFee(
) external returns (uint104, uint104, uint48)
```
Describes previous default slippage fee that had place, current one and time on which this changed



### defaultDecayPeriod
```solidity
function defaultDecayPeriod(
) external returns (uint256)
```
Same as `defaults` but only returns decay period



### defaultDecayPeriodVotes
```solidity
function defaultDecayPeriodVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred default decay period

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### virtualDefaultDecayPeriod
```solidity
function virtualDefaultDecayPeriod(
) external returns (uint104, uint104, uint48)
```
Describes previous default decay amount that had place, current one and time on which this changed



### referralShare
```solidity
function referralShare(
) external returns (uint256)
```
Same as `shareParameters` but only returns referral share



### referralShareVotes
```solidity
function referralShareVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred referral share

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### virtualReferralShare
```solidity
function virtualReferralShare(
) external returns (uint104, uint104, uint48)
```




### governanceShare
```solidity
function governanceShare(
) external returns (uint256)
```
Same as `shareParameters` but only returns governance share



### governanceShareVotes
```solidity
function governanceShareVotes(
  address user
) external returns (uint256)
```
Returns user stance to preferred governance share

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 


### virtualGovernanceShare
```solidity
function virtualGovernanceShare(
) external returns (uint104, uint104, uint48)
```




### setGovernanceWallet
```solidity
function setGovernanceWallet(
  address newGovernanceWallet
) external
```
Changes governance wallet

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`newGovernanceWallet` | address | 


### setFeeCollector
```solidity
function setFeeCollector(
  address newFeeCollector
) external
```
Changes fee collector wallet

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`newFeeCollector` | address | 


### defaultFeeVote
```solidity
function defaultFeeVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for default fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### discardDefaultFeeVote
```solidity
function discardDefaultFeeVote(
) external
```
Retracts `msg.senders`'s vote for default fee



### defaultSlippageFeeVote
```solidity
function defaultSlippageFeeVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for default slippage fee

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### discardDefaultSlippageFeeVote
```solidity
function discardDefaultSlippageFeeVote(
) external
```
Retracts `msg.senders`'s vote for default slippage fee



### defaultDecayPeriodVote
```solidity
function defaultDecayPeriodVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for default decay period

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### discardDefaultDecayPeriodVote
```solidity
function discardDefaultDecayPeriodVote(
) external
```
Retracts `msg.senders`'s vote for default decay period



### referralShareVote
```solidity
function referralShareVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for referral share

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### discardReferralShareVote
```solidity
function discardReferralShareVote(
) external
```
Retracts `msg.senders`'s vote for referral share



### governanceShareVote
```solidity
function governanceShareVote(
  uint256 vote
) external
```
Records `msg.senders`'s vote for governance share

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### discardGovernanceShareVote
```solidity
function discardGovernanceShareVote(
) external
```
Retracts `msg.senders`'s vote for governance share



### _notifyStakeChanged
```solidity
function _notifyStakeChanged(
  address account,
  uint256 newBalance
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`newBalance` | uint256 | 


## Events
### DefaultFeeVoteUpdate
```solidity
event DefaultFeeVoteUpdate(
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

### DefaultSlippageFeeVoteUpdate
```solidity
event DefaultSlippageFeeVoteUpdate(
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

### DefaultDecayPeriodVoteUpdate
```solidity
event DefaultDecayPeriodVoteUpdate(
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

### ReferralShareVoteUpdate
```solidity
event ReferralShareVoteUpdate(
  address user,
  uint256 referralShare,
  bool isDefault,
  uint256 amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 
|`referralShare` | uint256 | 
|`isDefault` | bool | 
|`amount` | uint256 | 

### GovernanceShareVoteUpdate
```solidity
event GovernanceShareVoteUpdate(
  address user,
  uint256 governanceShare,
  bool isDefault,
  uint256 amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | 
|`governanceShare` | uint256 | 
|`isDefault` | bool | 
|`amount` | uint256 | 

### GovernanceWalletUpdate
```solidity
event GovernanceWalletUpdate(
  address governanceWallet
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`governanceWallet` | address | 

### FeeCollectorUpdate
```solidity
event FeeCollectorUpdate(
  address feeCollector
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`feeCollector` | address | 

