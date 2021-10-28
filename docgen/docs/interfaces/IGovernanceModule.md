# IGovernanceModule

Interface for governance notifications



## Functions
### notifyStakeChanged
```solidity
function notifyStakeChanged(
  address account,
  uint256 newBalance
) external
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`newBalance` | uint256 | 


### notifyStakesChanged
```solidity
function notifyStakesChanged(
  address[] accounts,
  uint256[] newBalances
) external
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`accounts` | address[] | 
|`newBalances` | uint256[] | 


