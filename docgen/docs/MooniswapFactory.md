# MooniswapFactory

Factory that holds list of deployed pools



## Functions
### constructor
```solidity
function constructor(
  address _poolOwner,
  contract IMooniswapDeployer _mooniswapDeployer,
  address _governanceMothership
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_poolOwner` | address | 
|`_mooniswapDeployer` | contract IMooniswapDeployer | 
|`_governanceMothership` | address | 


### getAllPools
```solidity
function getAllPools(
) external returns (contract Mooniswap[])
```




### pools
```solidity
function pools(
  contract IERC20 tokenA,
  contract IERC20 tokenB
) external returns (contract Mooniswap pool)
```
returns a pool for tokens pair. Zero address result means that pool doesn't exist yet

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenA` | contract IERC20 | 
|`tokenB` | contract IERC20 | 


### deploy
```solidity
function deploy(
  contract IERC20 tokenA,
  contract IERC20 tokenB
) public returns (contract Mooniswap pool)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenA` | contract IERC20 | 
|`tokenB` | contract IERC20 | 


### sortTokens
```solidity
function sortTokens(
  contract IERC20 tokenA,
  contract IERC20 tokenB
) public returns (contract IERC20, contract IERC20)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenA` | contract IERC20 | 
|`tokenB` | contract IERC20 | 


## Events
### Deployed
```solidity
event Deployed(
  contract Mooniswap mooniswap,
  contract IERC20 token1,
  contract IERC20 token2
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`mooniswap` | contract Mooniswap | 
|`token1` | contract IERC20 | 
|`token2` | contract IERC20 | 

