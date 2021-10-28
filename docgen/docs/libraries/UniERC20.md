# UniERC20





## Functions
### isETH
```solidity
function isETH(
  contract IERC20 token
) internal returns (bool)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 


### uniBalanceOf
```solidity
function uniBalanceOf(
  contract IERC20 token,
  address account
) internal returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 
|`account` | address | 


### uniTransfer
```solidity
function uniTransfer(
  contract IERC20 token,
  address payable to,
  uint256 amount
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 
|`to` | address payable | 
|`amount` | uint256 | 


### uniTransferFrom
```solidity
function uniTransferFrom(
  contract IERC20 token,
  address payable from,
  address to,
  uint256 amount
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 
|`from` | address payable | 
|`to` | address | 
|`amount` | uint256 | 


### uniSymbol
```solidity
function uniSymbol(
  contract IERC20 token
) internal returns (string)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 


