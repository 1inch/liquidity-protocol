
## Mooniswap

### Types list
- [Balances](#balances)
- [SwapVolumes](#swapvolumes)
- [Fees](#fees)

### Functions list
- [constructor(_token0, _token1, name, symbol, _mooniswapFactoryGovernance) public](#constructor)
- [getTokens() external](#gettokens)
- [tokens(i) external](#tokens)
- [getBalanceForAddition(token) public](#getbalanceforaddition)
- [getBalanceForRemoval(token) public](#getbalanceforremoval)
- [getReturn(src, dst, amount) external](#getreturn)
- [deposit(maxAmounts, minAmounts) external](#deposit)
- [depositFor(maxAmounts, minAmounts, target) public](#depositfor)
- [withdraw(amount, minReturns) external](#withdraw)
- [withdrawFor(amount, minReturns, target) public](#withdrawfor)
- [swap(src, dst, amount, minReturn, referral) external](#swap)
- [swapFor(src, dst, amount, minReturn, referral, receiver) public](#swapfor)
- [_getReturn(src, dst, amount, srcBalance, dstBalance, fee, slippageFee) internal](#_getreturn)
- [rescueFunds(token, amount) external](#rescuefunds)

### Events list
- [Error(reason) ](#error)
- [Deposited(sender, receiver, share, token0Amount, token1Amount) ](#deposited)
- [Withdrawn(sender, receiver, share, token0Amount, token1Amount) ](#withdrawn)
- [Swapped(sender, receiver, srcToken, dstToken, amount, result, srcAdditionBalance, dstRemovalBalance, referral) ](#swapped)
- [Sync(srcBalance, dstBalance, fee, slippageFee, referralShare, governanceShare) ](#sync)

### Types
### Balances

```solidity
struct Balances {
  uint256 src;
  uint256 dst;
}
```
### SwapVolumes

```solidity
struct SwapVolumes {
  uint128 confirmed;
  uint128 result;
}
```
### Fees

```solidity
struct Fees {
  uint256 fee;
  uint256 slippageFee;
}
```

### Functions
### constructor

```solidity
constructor(contract IERC20 _token0, contract IERC20 _token1, string name, string symbol, contract IMooniswapFactoryGovernance _mooniswapFactoryGovernance) public
```

### getTokens

```solidity
function getTokens() external view returns (contract IERC20[] tokens)
```
Returns pair of tokens as [token0, token1]

### tokens

```solidity
function tokens(uint256 i) external view returns (contract IERC20)
```
Same as token0 or token1

### getBalanceForAddition

```solidity
function getBalanceForAddition(contract IERC20 token) public view returns (uint256)
```
Returns actual addition balance

### getBalanceForRemoval

```solidity
function getBalanceForRemoval(contract IERC20 token) public view returns (uint256)
```
Returns actual removal balance

### getReturn

```solidity
function getReturn(contract IERC20 src, contract IERC20 dst, uint256 amount) external view returns (uint256)
```
Returns how many `dst` tokens will be returned for `amount` of `src` tokens

### deposit

```solidity
function deposit(uint256[2] maxAmounts, uint256[2] minAmounts) external payable returns (uint256 fairSupply, uint256[2] receivedAmounts)
```
Same as `depositFor` but for `msg.sender`

### depositFor

```solidity
function depositFor(uint256[2] maxAmounts, uint256[2] minAmounts, address target) public payable returns (uint256 fairSupply, uint256[2] receivedAmounts)
```
Deposits from `minAmounts` to `maxAmounts` tokens to the pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxAmounts | uint256[2] | Maximum allowed amounts sender is ready to deposit |
| minAmounts | uint256[2] | Minimum allowed amounts sender is ready to deposit |
| target | address | Address that receives LP tokens |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
fairSupply | uint256 | Amount of LP tokens minted |
receivedAmounts | uint256[2] | Actual amount somewhere in allowed boundaries |

### withdraw

```solidity
function withdraw(uint256 amount, uint256[] minReturns) external returns (uint256[2] withdrawnAmounts)
```
Same as `withdrawFor` but for `msg.sender`

### withdrawFor

```solidity
function withdrawFor(uint256 amount, uint256[] minReturns, address payable target) public returns (uint256[2] withdrawnAmounts)
```
Withdraws funds from the pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | Amount of LP tokens to withdraw |
| minReturns | uint256[] | Minimum amounts sender is ready to receive |
| target | address payable | Address that receives funds |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
withdrawnAmounts | uint256[2] | Actual amount that were withdrawn |

### swap

```solidity
function swap(contract IERC20 src, contract IERC20 dst, uint256 amount, uint256 minReturn, address referral) external payable returns (uint256 result)
```
Same as `swapFor` but for `msg.sender`

### swapFor

```solidity
function swapFor(contract IERC20 src, contract IERC20 dst, uint256 amount, uint256 minReturn, address referral, address payable receiver) public payable returns (uint256 result)
```
Swaps specified amount of source tokens to destination tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| src | contract IERC20 | Source token |
| dst | contract IERC20 | Destination token |
| amount | uint256 | Amount of source tokens to swap |
| minReturn | uint256 | Minimum amounts sender is ready to receive |
| referral | address | Swap referral |
| receiver | address payable | Address that receives funds |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
result | uint256 | Amount of `dst` tokens that were transferred to `receiver` |

### _getReturn

```solidity
function _getReturn(contract IERC20 src, contract IERC20 dst, uint256 amount, uint256 srcBalance, uint256 dstBalance, uint256 fee, uint256 slippageFee) internal view returns (uint256)
```

### rescueFunds

```solidity
function rescueFunds(contract IERC20 token, uint256 amount) external
```
Allows contract owner to withdraw funds that was send to contract by mistake

### Events
### Error

```solidity
event Error(string reason)
```

### Deposited

```solidity
event Deposited(address sender, address receiver, uint256 share, uint256 token0Amount, uint256 token1Amount)
```

### Withdrawn

```solidity
event Withdrawn(address sender, address receiver, uint256 share, uint256 token0Amount, uint256 token1Amount)
```

### Swapped

```solidity
event Swapped(address sender, address receiver, address srcToken, address dstToken, uint256 amount, uint256 result, uint256 srcAdditionBalance, uint256 dstRemovalBalance, address referral)
```

### Sync

```solidity
event Sync(uint256 srcBalance, uint256 dstBalance, uint256 fee, uint256 slippageFee, uint256 referralShare, uint256 governanceShare)
```

