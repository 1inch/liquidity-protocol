
## Vote

### Types list
- [Data](#data)

### Functions list
- [eq(self, vote) internal](#eq)
- [init() internal](#init)
- [init(vote) internal](#init)
- [isDefault(self) internal](#isdefault)
- [get(self, defaultVote) internal](#get)
- [get(self, defaultVoteFn) internal](#get)

### Types
### Data

```solidity
struct Data {
  uint256 value;
}
```

### Functions
### eq

```solidity
function eq(struct Vote.Data self, struct Vote.Data vote) internal pure returns (bool)
```

### init

```solidity
function init() internal pure returns (struct Vote.Data data)
```

### init

```solidity
function init(uint256 vote) internal pure returns (struct Vote.Data data)
```

### isDefault

```solidity
function isDefault(struct Vote.Data self) internal pure returns (bool)
```

### get

```solidity
function get(struct Vote.Data self, uint256 defaultVote) internal pure returns (uint256)
```

### get

```solidity
function get(struct Vote.Data self, function () view external returns (uint256) defaultVoteFn) internal view returns (uint256)
```

