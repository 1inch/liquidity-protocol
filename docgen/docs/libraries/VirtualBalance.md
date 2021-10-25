# VirtualBalance





## Functions
### set
```solidity
function set(
  struct VirtualBalance.Data self,
  uint256 balance
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct VirtualBalance.Data | 
|`balance` | uint256 | 


### update
```solidity
function update(
  struct VirtualBalance.Data self,
  uint256 decayPeriod,
  uint256 realBalance
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct VirtualBalance.Data | 
|`decayPeriod` | uint256 | 
|`realBalance` | uint256 | 


### scale
```solidity
function scale(
  struct VirtualBalance.Data self,
  uint256 decayPeriod,
  uint256 realBalance,
  uint256 num,
  uint256 denom
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct VirtualBalance.Data | 
|`decayPeriod` | uint256 | 
|`realBalance` | uint256 | 
|`num` | uint256 | 
|`denom` | uint256 | 


### current
```solidity
function current(
  struct VirtualBalance.Data self,
  uint256 decayPeriod,
  uint256 realBalance
) internal returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct VirtualBalance.Data | 
|`decayPeriod` | uint256 | 
|`realBalance` | uint256 | 


