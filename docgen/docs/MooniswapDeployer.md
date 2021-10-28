# MooniswapDeployer

Helper contract to deploy mooniswap pools



## Functions
### deploy
```solidity
function deploy(
  contract IERC20 token1,
  contract IERC20 token2,
  string name,
  string symbol,
  address poolOwner
) external returns (contract Mooniswap pool)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token1` | contract IERC20 | 
|`token2` | contract IERC20 | 
|`name` | string | 
|`symbol` | string | 
|`poolOwner` | address | 


