
## VirtualBalance

### Types list
- [Data](#data)

### Functions list
- [set(self, balance) internal](#set)
- [update(self, decayPeriod, realBalance) internal](#update)
- [scale(self, decayPeriod, realBalance, num, denom) internal](#scale)
- [current(self, decayPeriod, realBalance) internal](#current)

### Types
### Data

```solidity
struct Data {
  uint216 balance;
  uint40 time;
}
```

### Functions
### set

```solidity
function set(struct VirtualBalance.Data self, uint256 balance) internal
```

### update

```solidity
function update(struct VirtualBalance.Data self, uint256 decayPeriod, uint256 realBalance) internal
```

### scale

```solidity
function scale(struct VirtualBalance.Data self, uint256 decayPeriod, uint256 realBalance, uint256 num, uint256 denom) internal
```

### current

```solidity
function current(struct VirtualBalance.Data self, uint256 decayPeriod, uint256 realBalance) internal view returns (uint256)
```

