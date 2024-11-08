
## VirtualVote

### Types list
- [Data](#data)

### Functions list
- [current(self) internal](#current)

### Types
### Data

```solidity
struct Data {
  uint104 oldResult;
  uint104 result;
  uint48 time;
}
```

### Functions
### current

```solidity
function current(struct VirtualVote.Data self) internal view returns (uint256)
```

