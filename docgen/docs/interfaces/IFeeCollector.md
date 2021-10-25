# IFeeCollector

Fee collector interface



## Functions
### updateReward
```solidity
function updateReward(
  address receiver,
  uint256 amount
) external
```
Adds specified `amount` as reward to `receiver`

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`receiver` | address | 
|`amount` | uint256 | 


### updateRewards
```solidity
function updateRewards(
  address[] receivers,
  uint256[] amounts
) external
```
Same as `updateReward` but for multiple accounts

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`receivers` | address[] | 
|`amounts` | uint256[] | 


