
## MooniswapGovernance

### Types list
- [ParamsHelper](#paramshelper)

### Functions list
- [constructor(_mooniswapFactoryGovernance) internal](#constructor)
- [setMooniswapFactoryGovernance(newMooniswapFactoryGovernance) external](#setmooniswapfactorygovernance)
- [fee() public](#fee)
- [slippageFee() public](#slippagefee)
- [decayPeriod() public](#decayperiod)
- [virtualFee() external](#virtualfee)
- [virtualSlippageFee() external](#virtualslippagefee)
- [virtualDecayPeriod() external](#virtualdecayperiod)
- [feeVotes(user) external](#feevotes)
- [slippageFeeVotes(user) external](#slippagefeevotes)
- [decayPeriodVotes(user) external](#decayperiodvotes)
- [feeVote(vote) external](#feevote)
- [slippageFeeVote(vote) external](#slippagefeevote)
- [decayPeriodVote(vote) external](#decayperiodvote)
- [discardFeeVote() external](#discardfeevote)
- [discardSlippageFeeVote() external](#discardslippagefeevote)
- [discardDecayPeriodVote() external](#discarddecayperiodvote)
- [_beforeTokenTransfer(from, to, amount) internal](#_beforetokentransfer)

### Events list
- [FeeVoteUpdate(user, fee, isDefault, amount) ](#feevoteupdate)
- [SlippageFeeVoteUpdate(user, slippageFee, isDefault, amount) ](#slippagefeevoteupdate)
- [DecayPeriodVoteUpdate(user, decayPeriod, isDefault, amount) ](#decayperiodvoteupdate)

### Types
### ParamsHelper

```solidity
struct ParamsHelper {
  address from;
  address to;
  bool updateFrom;
  bool updateTo;
  uint256 amount;
  uint256 balanceFrom;
  uint256 balanceTo;
  uint256 newTotalSupply;
}
```

### Functions
### constructor

```solidity
constructor(contract IMooniswapFactoryGovernance _mooniswapFactoryGovernance) internal
```

### setMooniswapFactoryGovernance

```solidity
function setMooniswapFactoryGovernance(contract IMooniswapFactoryGovernance newMooniswapFactoryGovernance) external
```

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

### virtualFee

```solidity
function virtualFee() external view returns (uint104, uint104, uint48)
```
Describes previous fee that had place, current one and time on which this changed

### virtualSlippageFee

```solidity
function virtualSlippageFee() external view returns (uint104, uint104, uint48)
```
Describes previous slippage fee that had place, current one and time on which this changed

### virtualDecayPeriod

```solidity
function virtualDecayPeriod() external view returns (uint104, uint104, uint48)
```
Describes previous decay period that had place, current one and time on which this changed

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

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be to transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

### Events
### FeeVoteUpdate

```solidity
event FeeVoteUpdate(address user, uint256 fee, bool isDefault, uint256 amount)
```

### SlippageFeeVoteUpdate

```solidity
event SlippageFeeVoteUpdate(address user, uint256 slippageFee, bool isDefault, uint256 amount)
```

### DecayPeriodVoteUpdate

```solidity
event DecayPeriodVoteUpdate(address user, uint256 decayPeriod, bool isDefault, uint256 amount)
```

