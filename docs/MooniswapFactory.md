
## MooniswapFactory

### Functions list
- [constructor(_poolOwner, _mooniswapDeployer, _governanceMothership) public](#constructor)
- [getAllPools() external](#getallpools)
- [pools(tokenA, tokenB) external](#pools)
- [deploy(tokenA, tokenB) public](#deploy)
- [sortTokens(tokenA, tokenB) public](#sorttokens)

### Events list
- [Deployed(mooniswap, token1, token2) ](#deployed)

### Functions
### constructor

```solidity
constructor(address _poolOwner, contract IMooniswapDeployer _mooniswapDeployer, address _governanceMothership) public
```

### getAllPools

```solidity
function getAllPools() external view returns (contract Mooniswap[])
```

### pools

```solidity
function pools(contract IERC20 tokenA, contract IERC20 tokenB) external view returns (contract Mooniswap pool)
```
returns a pool for tokens pair. Zero address result means that pool doesn't exist yet

### deploy

```solidity
function deploy(contract IERC20 tokenA, contract IERC20 tokenB) public returns (contract Mooniswap pool)
```

### sortTokens

```solidity
function sortTokens(contract IERC20 tokenA, contract IERC20 tokenB) public pure returns (contract IERC20, contract IERC20)
```

### Events
### Deployed

```solidity
event Deployed(contract Mooniswap mooniswap, contract IERC20 token1, contract IERC20 token2)
```

