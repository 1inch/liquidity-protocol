
## MooniswapFactoryGovernance

### Functions list
- [constructor(_mothership) public](#constructor)
- [shutdown() external](#shutdown)
- [isActive() external](#isactive)
- [shareParameters() external](#shareparameters)
- [defaults() external](#defaults)
- [defaultFee() external](#defaultfee)
- [defaultFeeVotes(user) external](#defaultfeevotes)
- [virtualDefaultFee() external](#virtualdefaultfee)
- [defaultSlippageFee() external](#defaultslippagefee)
- [defaultSlippageFeeVotes(user) external](#defaultslippagefeevotes)
- [virtualDefaultSlippageFee() external](#virtualdefaultslippagefee)
- [defaultDecayPeriod() external](#defaultdecayperiod)
- [defaultDecayPeriodVotes(user) external](#defaultdecayperiodvotes)
- [virtualDefaultDecayPeriod() external](#virtualdefaultdecayperiod)
- [referralShare() external](#referralshare)
- [referralShareVotes(user) external](#referralsharevotes)
- [virtualReferralShare() external](#virtualreferralshare)
- [governanceShare() external](#governanceshare)
- [governanceShareVotes(user) external](#governancesharevotes)
- [virtualGovernanceShare() external](#virtualgovernanceshare)
- [setGovernanceWallet(newGovernanceWallet) external](#setgovernancewallet)
- [setFeeCollector(newFeeCollector) external](#setfeecollector)
- [defaultFeeVote(vote) external](#defaultfeevote)
- [discardDefaultFeeVote() external](#discarddefaultfeevote)
- [defaultSlippageFeeVote(vote) external](#defaultslippagefeevote)
- [discardDefaultSlippageFeeVote() external](#discarddefaultslippagefeevote)
- [defaultDecayPeriodVote(vote) external](#defaultdecayperiodvote)
- [discardDefaultDecayPeriodVote() external](#discarddefaultdecayperiodvote)
- [referralShareVote(vote) external](#referralsharevote)
- [discardReferralShareVote() external](#discardreferralsharevote)
- [governanceShareVote(vote) external](#governancesharevote)
- [discardGovernanceShareVote() external](#discardgovernancesharevote)
- [_notifyStakeChanged(account, newBalance) internal](#_notifystakechanged)

### Events list
- [DefaultFeeVoteUpdate(user, fee, isDefault, amount) ](#defaultfeevoteupdate)
- [DefaultSlippageFeeVoteUpdate(user, slippageFee, isDefault, amount) ](#defaultslippagefeevoteupdate)
- [DefaultDecayPeriodVoteUpdate(user, decayPeriod, isDefault, amount) ](#defaultdecayperiodvoteupdate)
- [ReferralShareVoteUpdate(user, referralShare, isDefault, amount) ](#referralsharevoteupdate)
- [GovernanceShareVoteUpdate(user, governanceShare, isDefault, amount) ](#governancesharevoteupdate)
- [GovernanceWalletUpdate(governanceWallet) ](#governancewalletupdate)
- [FeeCollectorUpdate(feeCollector) ](#feecollectorupdate)

### Functions
### constructor

```solidity
constructor(address _mothership) public
```

### shutdown

```solidity
function shutdown() external
```

### isActive

```solidity
function isActive() external view returns (bool)
```
True if contract is currently working and wasn't stopped. Otherwise, false

### shareParameters

```solidity
function shareParameters() external view returns (uint256, uint256, address, address)
```
Returns information about mooniswap shares

### defaults

```solidity
function defaults() external view returns (uint256, uint256, uint256)
```
Initial settings that contract was created

### defaultFee

```solidity
function defaultFee() external view returns (uint256)
```
Same as `defaults` but only returns fee

### defaultFeeVotes

```solidity
function defaultFeeVotes(address user) external view returns (uint256)
```
Returns user stance to preferred default fee

### virtualDefaultFee

```solidity
function virtualDefaultFee() external view returns (uint104, uint104, uint48)
```
Describes previous default fee that had place, current one and time on which this changed

### defaultSlippageFee

```solidity
function defaultSlippageFee() external view returns (uint256)
```
Same as `defaults` but only returns slippage fee

### defaultSlippageFeeVotes

```solidity
function defaultSlippageFeeVotes(address user) external view returns (uint256)
```
Returns user stance to preferred default slippage fee

### virtualDefaultSlippageFee

```solidity
function virtualDefaultSlippageFee() external view returns (uint104, uint104, uint48)
```
Describes previous default slippage fee that had place, current one and time on which this changed

### defaultDecayPeriod

```solidity
function defaultDecayPeriod() external view returns (uint256)
```
Same as `defaults` but only returns decay period

### defaultDecayPeriodVotes

```solidity
function defaultDecayPeriodVotes(address user) external view returns (uint256)
```
Returns user stance to preferred default decay period

### virtualDefaultDecayPeriod

```solidity
function virtualDefaultDecayPeriod() external view returns (uint104, uint104, uint48)
```
Describes previous default decay amount that had place, current one and time on which this changed

### referralShare

```solidity
function referralShare() external view returns (uint256)
```
Same as `shareParameters` but only returns referral share

### referralShareVotes

```solidity
function referralShareVotes(address user) external view returns (uint256)
```
Returns user stance to preferred referral share

### virtualReferralShare

```solidity
function virtualReferralShare() external view returns (uint104, uint104, uint48)
```

### governanceShare

```solidity
function governanceShare() external view returns (uint256)
```
Same as `shareParameters` but only returns governance share

### governanceShareVotes

```solidity
function governanceShareVotes(address user) external view returns (uint256)
```
Returns user stance to preferred governance share

### virtualGovernanceShare

```solidity
function virtualGovernanceShare() external view returns (uint104, uint104, uint48)
```

### setGovernanceWallet

```solidity
function setGovernanceWallet(address newGovernanceWallet) external
```
Changes governance wallet

### setFeeCollector

```solidity
function setFeeCollector(address newFeeCollector) external
```
Changes fee collector wallet

### defaultFeeVote

```solidity
function defaultFeeVote(uint256 vote) external
```
Records `msg.senders`'s vote for default fee

### discardDefaultFeeVote

```solidity
function discardDefaultFeeVote() external
```
Retracts `msg.senders`'s vote for default fee

### defaultSlippageFeeVote

```solidity
function defaultSlippageFeeVote(uint256 vote) external
```
Records `msg.senders`'s vote for default slippage fee

### discardDefaultSlippageFeeVote

```solidity
function discardDefaultSlippageFeeVote() external
```
Retracts `msg.senders`'s vote for default slippage fee

### defaultDecayPeriodVote

```solidity
function defaultDecayPeriodVote(uint256 vote) external
```
Records `msg.senders`'s vote for default decay period

### discardDefaultDecayPeriodVote

```solidity
function discardDefaultDecayPeriodVote() external
```
Retracts `msg.senders`'s vote for default decay period

### referralShareVote

```solidity
function referralShareVote(uint256 vote) external
```
Records `msg.senders`'s vote for referral share

### discardReferralShareVote

```solidity
function discardReferralShareVote() external
```
Retracts `msg.senders`'s vote for referral share

### governanceShareVote

```solidity
function governanceShareVote(uint256 vote) external
```
Records `msg.senders`'s vote for governance share

### discardGovernanceShareVote

```solidity
function discardGovernanceShareVote() external
```
Retracts `msg.senders`'s vote for governance share

### _notifyStakeChanged

```solidity
function _notifyStakeChanged(address account, uint256 newBalance) internal
```

### Events
### DefaultFeeVoteUpdate

```solidity
event DefaultFeeVoteUpdate(address user, uint256 fee, bool isDefault, uint256 amount)
```

### DefaultSlippageFeeVoteUpdate

```solidity
event DefaultSlippageFeeVoteUpdate(address user, uint256 slippageFee, bool isDefault, uint256 amount)
```

### DefaultDecayPeriodVoteUpdate

```solidity
event DefaultDecayPeriodVoteUpdate(address user, uint256 decayPeriod, bool isDefault, uint256 amount)
```

### ReferralShareVoteUpdate

```solidity
event ReferralShareVoteUpdate(address user, uint256 referralShare, bool isDefault, uint256 amount)
```

### GovernanceShareVoteUpdate

```solidity
event GovernanceShareVoteUpdate(address user, uint256 governanceShare, bool isDefault, uint256 amount)
```

### GovernanceWalletUpdate

```solidity
event GovernanceWalletUpdate(address governanceWallet)
```

### FeeCollectorUpdate

```solidity
event FeeCollectorUpdate(address feeCollector)
```

