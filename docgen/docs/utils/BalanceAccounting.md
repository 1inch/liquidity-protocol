# BalanceAccounting

Provides helper methods for token-like contracts



## Functions
### totalSupply
```solidity
function totalSupply(
) public returns (uint256)
```




### balanceOf
```solidity
function balanceOf(
  address account
) public returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 


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


### _set
```solidity
function _set(
  address account,
  uint256 amount
) internal returns (uint256 oldAmount)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`amount` | uint256 | 


