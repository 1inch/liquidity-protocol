# Vote





## Functions
### eq
```solidity
function eq(
  struct Vote.Data self,
  struct Vote.Data vote
) internal returns (bool)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct Vote.Data | 
|`vote` | struct Vote.Data | 


### init
```solidity
function init(
) internal returns (struct Vote.Data data)
```




### init
```solidity
function init(
  uint256 vote
) internal returns (struct Vote.Data data)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`vote` | uint256 | 


### isDefault
```solidity
function isDefault(
  struct Vote.Data self
) internal returns (bool)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct Vote.Data | 


### get
```solidity
function get(
  struct Vote.Data self,
  uint256 defaultVote
) internal returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct Vote.Data | 
|`defaultVote` | uint256 | 


### get
```solidity
function get(
  struct Vote.Data self,
  function () view external returns (uint256) defaultVoteFn
) internal returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct Vote.Data | 
|`defaultVoteFn` | function () view external returns (uint256) | 


