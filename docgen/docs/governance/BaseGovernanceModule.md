# BaseGovernanceModule

Base governance contract with notification logics



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


