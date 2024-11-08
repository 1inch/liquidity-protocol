
## IMooniswapFactory

### Functions list
- [pools(token0, token1) external](#pools)
- [isPool(mooniswap) external](#ispool)

### Functions
### pools

```solidity
function pools(contract IERC20 token0, contract IERC20 token1) external view returns (contract Mooniswap)
```
returns a pool for tokens pair. Zero address result means that pool doesn't exist yet

### isPool

```solidity
function isPool(contract Mooniswap mooniswap) external view returns (bool)
```
True if address is currently listed as a moonswap pool. Otherwise, false

