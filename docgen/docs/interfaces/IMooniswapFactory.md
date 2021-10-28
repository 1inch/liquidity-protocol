# IMooniswapFactory

Extends `IMooniswapFactoryGovernance` with information about pools



## Functions
### pools
```solidity
function pools(
  contract IERC20 token0,
  contract IERC20 token1
) external returns (contract Mooniswap)
```
returns a pool for tokens pair. Zero address result means that pool doesn't exist yet

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token0` | contract IERC20 | 
|`token1` | contract IERC20 | 


### isPool
```solidity
function isPool(
  contract Mooniswap mooniswap
) external returns (bool)
```
True if address is currently listed as a moonswap pool. Otherwise, false

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`mooniswap` | contract Mooniswap | 


