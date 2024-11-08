
## ExplicitLiquidVoting

### Types list
- [Data](#data)

### Functions list
- [updateVote(self, user, oldVote, newVote, balance, defaultVote, emitEvent) internal](#updatevote)
- [updateBalance(self, user, oldVote, oldBalance, newBalance, defaultVote, emitEvent) internal](#updatebalance)

### Types
### Data

```solidity
struct Data {
  struct VirtualVote.Data data;
  uint256 _weightedSum;
  uint256 _votedSupply;
  mapping(address => struct Vote.Data) votes;
}
```

### Functions
### updateVote

```solidity
function updateVote(struct ExplicitLiquidVoting.Data self, address user, struct Vote.Data oldVote, struct Vote.Data newVote, uint256 balance, uint256 defaultVote, function (address,uint256,bool,uint256) emitEvent) internal
```

### updateBalance

```solidity
function updateBalance(struct ExplicitLiquidVoting.Data self, address user, struct Vote.Data oldVote, uint256 oldBalance, uint256 newBalance, uint256 defaultVote, function (address,uint256,bool,uint256) emitEvent) internal
```

