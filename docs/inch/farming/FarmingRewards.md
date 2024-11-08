
## FarmingRewards

### Functions list
- [constructor(_mooniswap, _gift, _duration, _rewardDistribution, scale) public](#constructor)
- [name() external](#name)
- [symbol() external](#symbol)
- [decimals() external](#decimals)
- [stake(amount) public](#stake)
- [withdraw(amount) public](#withdraw)
- [exit() external](#exit)
- [fee() public](#fee)
- [slippageFee() public](#slippagefee)
- [decayPeriod() public](#decayperiod)
- [feeVotes(user) external](#feevotes)
- [slippageFeeVotes(user) external](#slippagefeevotes)
- [decayPeriodVotes(user) external](#decayperiodvotes)
- [feeVote(vote) external](#feevote)
- [slippageFeeVote(vote) external](#slippagefeevote)
- [decayPeriodVote(vote) external](#decayperiodvote)
- [discardFeeVote() external](#discardfeevote)
- [discardSlippageFeeVote() external](#discardslippagefeevote)
- [discardDecayPeriodVote() external](#discarddecayperiodvote)
- [_mint(account, amount) internal](#_mint)
- [_burn(account, amount) internal](#_burn)
- [rescueFunds(token, amount) external](#rescuefunds)

### Events list
- [Staked(user, amount) ](#staked)
- [Withdrawn(user, amount) ](#withdrawn)
- [FeeVoteUpdate(user, fee, isDefault, amount) ](#feevoteupdate)
- [Transfer(from, to, value) ](#transfer)
- [SlippageFeeVoteUpdate(user, slippageFee, isDefault, amount) ](#slippagefeevoteupdate)
- [DecayPeriodVoteUpdate(user, decayPeriod, isDefault, amount) ](#decayperiodvoteupdate)

### Functions
### constructor

```solidity
constructor(contract Mooniswap _mooniswap, contract IERC20 _gift, uint256 _duration, address _rewardDistribution, uint256 scale) public
```

### name

```solidity
function name() external view returns (string)
```

### symbol

```solidity
function symbol() external view returns (string)
```

### decimals

```solidity
function decimals() external view returns (uint8)
```

### stake

```solidity
function stake(uint256 amount) public
```
Stakes `amount` of tokens into farm

### withdraw

```solidity
function withdraw(uint256 amount) public
```
Withdraws `amount` of tokens from farm

### exit

```solidity
function exit() external
```
Withdraws all staked funds and rewards

### fee

```solidity
function fee() public view returns (uint256)
```
Current fee

### slippageFee

```solidity
function slippageFee() public view returns (uint256)
```
Current slippage

### decayPeriod

```solidity
function decayPeriod() public view returns (uint256)
```
Current decay period

### feeVotes

```solidity
function feeVotes(address user) external view returns (uint256)
```
Returns user stance to preferred fee

### slippageFeeVotes

```solidity
function slippageFeeVotes(address user) external view returns (uint256)
```
Returns user stance to preferred slippage fee

### decayPeriodVotes

```solidity
function decayPeriodVotes(address user) external view returns (uint256)
```
Returns user stance to preferred decay period

### feeVote

```solidity
function feeVote(uint256 vote) external
```
Records `msg.senders`'s vote for fee

### slippageFeeVote

```solidity
function slippageFeeVote(uint256 vote) external
```
Records `msg.senders`'s vote for slippage fee

### decayPeriodVote

```solidity
function decayPeriodVote(uint256 vote) external
```
Records `msg.senders`'s vote for decay period

### discardFeeVote

```solidity
function discardFeeVote() external
```
Retracts `msg.senders`'s vote for fee

### discardSlippageFeeVote

```solidity
function discardSlippageFeeVote() external
```
Retracts `msg.senders`'s vote for slippage fee

### discardDecayPeriodVote

```solidity
function discardDecayPeriodVote() external
```
Retracts `msg.senders`'s vote for decay period

### _mint

```solidity
function _mint(address account, uint256 amount) internal
```

### _burn

```solidity
function _burn(address account, uint256 amount) internal
```

### rescueFunds

```solidity
function rescueFunds(contract IERC20 token, uint256 amount) external
```
Allows contract owner to withdraw funds that was send to contract by mistake

### Events
### Staked

```solidity
event Staked(address user, uint256 amount)
```

### Withdrawn

```solidity
event Withdrawn(address user, uint256 amount)
```

### FeeVoteUpdate

```solidity
event FeeVoteUpdate(address user, uint256 fee, bool isDefault, uint256 amount)
```

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

### SlippageFeeVoteUpdate

```solidity
event SlippageFeeVoteUpdate(address user, uint256 slippageFee, bool isDefault, uint256 amount)
```

### DecayPeriodVoteUpdate

```solidity
event DecayPeriodVoteUpdate(address user, uint256 decayPeriod, bool isDefault, uint256 amount)
```

