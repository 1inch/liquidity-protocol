
## ReferralFeeReceiver

### Types list
- [UserInfo](#userinfo)
- [EpochBalance](#epochbalance)
- [TokenInfo](#tokeninfo)

### Functions list
- [constructor(_inchToken, _mooniswapFactory) public](#constructor)
- [updateRewards(receivers, amounts) external](#updaterewards)
- [updateReward(referral, amount) public](#updatereward)
- [freezeEpoch(mooniswap) external](#freezeepoch)
- [trade(mooniswap, path) external](#trade)
- [claim(pools) external](#claim)
- [claimCurrentEpoch(mooniswap) external](#claimcurrentepoch)
- [claimFrozenEpoch(mooniswap) external](#claimfrozenepoch)

### Types
### UserInfo

```solidity
struct UserInfo {
  uint256 balance;
  mapping(contract IERC20 => mapping(uint256 => uint256)) share;
  mapping(contract IERC20 => uint256) firstUnprocessedEpoch;
}
```
### EpochBalance

```solidity
struct EpochBalance {
  uint256 totalSupply;
  uint256 token0Balance;
  uint256 token1Balance;
  uint256 inchBalance;
}
```
### TokenInfo

```solidity
struct TokenInfo {
  mapping(uint256 => struct ReferralFeeReceiver.EpochBalance) epochBalance;
  uint256 firstUnprocessedEpoch;
  uint256 currentEpoch;
}
```

### Functions
### constructor

```solidity
constructor(contract IERC20 _inchToken, contract IMooniswapFactory _mooniswapFactory) public
```

### updateRewards

```solidity
function updateRewards(address[] receivers, uint256[] amounts) external
```
Same as `updateReward` but for multiple accounts

### updateReward

```solidity
function updateReward(address referral, uint256 amount) public
```
Adds specified `amount` as reward to `receiver`

### freezeEpoch

```solidity
function freezeEpoch(contract Mooniswap mooniswap) external
```
Freezes current epoch and creates new as an active one

### trade

```solidity
function trade(contract Mooniswap mooniswap, contract IERC20[] path) external
```
Perform chain swap described by `path`. First element of `path` should match either token of the `mooniswap`.
The last token in chain should always be `1INCH`

### claim

```solidity
function claim(contract Mooniswap[] pools) external
```
Collects `msg.sender`'s tokens from pools and transfers them to him

### claimCurrentEpoch

```solidity
function claimCurrentEpoch(contract Mooniswap mooniswap) external
```
Collects current epoch `msg.sender`'s tokens from pool and transfers them to him

### claimFrozenEpoch

```solidity
function claimFrozenEpoch(contract Mooniswap mooniswap) external
```
Collects frozen epoch `msg.sender`'s tokens from pool and transfers them to him

