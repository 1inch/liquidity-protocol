# ExplicitLiquidVoting





## Functions
### updateVote
```solidity
function updateVote(
  struct ExplicitLiquidVoting.Data self,
  address user,
  struct Vote.Data oldVote,
  struct Vote.Data newVote,
  uint256 balance,
  uint256 defaultVote,
  function (address,uint256,bool,uint256) emitEvent
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct ExplicitLiquidVoting.Data | 
|`user` | address | 
|`oldVote` | struct Vote.Data | 
|`newVote` | struct Vote.Data | 
|`balance` | uint256 | 
|`defaultVote` | uint256 | 
|`emitEvent` | function (address,uint256,bool,uint256) | 


### updateBalance
```solidity
function updateBalance(
  struct ExplicitLiquidVoting.Data self,
  address user,
  struct Vote.Data oldVote,
  uint256 oldBalance,
  uint256 newBalance,
  uint256 defaultVote,
  function (address,uint256,bool,uint256) emitEvent
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct ExplicitLiquidVoting.Data | 
|`user` | address | 
|`oldVote` | struct Vote.Data | 
|`oldBalance` | uint256 | 
|`newBalance` | uint256 | 
|`defaultVote` | uint256 | 
|`emitEvent` | function (address,uint256,bool,uint256) | 


