
## IMooniswapFactoryGovernance

### Functions list
- [shareParameters() external](#shareparameters)
- [defaults() external](#defaults)
- [defaultFee() external](#defaultfee)
- [defaultSlippageFee() external](#defaultslippagefee)
- [defaultDecayPeriod() external](#defaultdecayperiod)
- [virtualDefaultFee() external](#virtualdefaultfee)
- [virtualDefaultSlippageFee() external](#virtualdefaultslippagefee)
- [virtualDefaultDecayPeriod() external](#virtualdefaultdecayperiod)
- [referralShare() external](#referralshare)
- [governanceShare() external](#governanceshare)
- [governanceWallet() external](#governancewallet)
- [feeCollector() external](#feecollector)
- [isFeeCollector() external](#isfeecollector)
- [isActive() external](#isactive)

### Functions
### shareParameters

```solidity
function shareParameters() external view returns (uint256 referralShare, uint256 governanceShare, address governanceWallet, address referralFeeReceiver)
```
Returns information about mooniswap shares

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
referralShare | uint256 | Referrals share |
governanceShare | uint256 | Governance share |
governanceWallet | address | Governance wallet address |
referralFeeReceiver | address | Fee collector address |

### defaults

```solidity
function defaults() external view returns (uint256 defaultFee, uint256 defaultSlippageFee, uint256 defaultDecayPeriod)
```
Initial settings that contract was created

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
defaultFee | uint256 | Default fee |
defaultSlippageFee | uint256 | Default slippage fee |
defaultDecayPeriod | uint256 | Decay period for virtual amounts |

### defaultFee

```solidity
function defaultFee() external view returns (uint256)
```
Same as `defaults` but only returns fee

### defaultSlippageFee

```solidity
function defaultSlippageFee() external view returns (uint256)
```
Same as `defaults` but only returns slippage fee

### defaultDecayPeriod

```solidity
function defaultDecayPeriod() external view returns (uint256)
```
Same as `defaults` but only returns decay period

### virtualDefaultFee

```solidity
function virtualDefaultFee() external view returns (uint104, uint104, uint48)
```
Describes previous default fee that had place, current one and time on which this changed

### virtualDefaultSlippageFee

```solidity
function virtualDefaultSlippageFee() external view returns (uint104, uint104, uint48)
```
Describes previous default slippage fee that had place, current one and time on which this changed

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

### governanceShare

```solidity
function governanceShare() external view returns (uint256)
```
Same as `shareParameters` but only returns governance share

### governanceWallet

```solidity
function governanceWallet() external view returns (address)
```
Same as `shareParameters` but only returns governance wallet address

### feeCollector

```solidity
function feeCollector() external view returns (address)
```
Same as `shareParameters` but only returns fee collector address

### isFeeCollector

```solidity
function isFeeCollector(address) external view returns (bool)
```
True if address is current fee collector or was in the past. Otherwise, false

### isActive

```solidity
function isActive() external view returns (bool)
```
True if contract is currently working and wasn't stopped. Otherwise, false

