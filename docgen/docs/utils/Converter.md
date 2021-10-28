# Converter

Base contract for maintaining tokens whitelist



## Functions
### constructor
```solidity
function constructor(
  contract IERC20 _inchToken,
  contract IMooniswapFactory _mooniswapFactory
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_inchToken` | contract IERC20 | 
|`_mooniswapFactory` | contract IMooniswapFactory | 


### receive
```solidity
function receive(
) external
```




### updatePathWhitelist
```solidity
function updatePathWhitelist(
  contract IERC20 token,
  bool whitelisted
) external
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 
|`whitelisted` | bool | 


### _validateSpread
```solidity
function _validateSpread(
  contract Mooniswap mooniswap
) internal returns (bool)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`mooniswap` | contract Mooniswap | 


### _maxAmountForSwap
```solidity
function _maxAmountForSwap(
  contract IERC20[] path,
  uint256 amount
) internal returns (uint256 srcAmount, uint256 dstAmount)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`path` | contract IERC20[] | 
|`amount` | uint256 | 


### _swap
```solidity
function _swap(
  contract IERC20[] path,
  uint256 initialAmount,
  address payable destination
) internal returns (uint256 amount)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`path` | contract IERC20[] | 
|`initialAmount` | uint256 | 
|`destination` | address payable | 


