# Mooniswap

1inch Mooniswap pool



## Functions
### constructor
```solidity
function constructor(
  contract IERC20 _token0,
  contract IERC20 _token1,
  string name,
  string symbol,
  contract IMooniswapFactoryGovernance _mooniswapFactoryGovernance
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_token0` | contract IERC20 | 
|`_token1` | contract IERC20 | 
|`name` | string | 
|`symbol` | string | 
|`_mooniswapFactoryGovernance` | contract IMooniswapFactoryGovernance | 


### getTokens
```solidity
function getTokens(
) external returns (contract IERC20[] tokens)
```
Returns pair of tokens as [token0, token1]



### tokens
```solidity
function tokens(
  uint256 i
) external returns (contract IERC20)
```
Same as token0 or token1

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`i` | uint256 | 


### getBalanceForAddition
```solidity
function getBalanceForAddition(
  contract IERC20 token
) public returns (uint256)
```
Returns actual addition balance

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 


### getBalanceForRemoval
```solidity
function getBalanceForRemoval(
  contract IERC20 token
) public returns (uint256)
```
Returns actual removal balance

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 


### getReturn
```solidity
function getReturn(
  contract IERC20 src,
  contract IERC20 dst,
  uint256 amount
) external returns (uint256)
```
Returns how many `dst` tokens will be returned for `amount` of `src` tokens

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`src` | contract IERC20 | 
|`dst` | contract IERC20 | 
|`amount` | uint256 | 


### deposit
```solidity
function deposit(
  uint256[2] maxAmounts,
  uint256[2] minAmounts
) external returns (uint256 fairSupply, uint256[2] receivedAmounts)
```
Same as `depositFor` but for `msg.sender`

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`maxAmounts` | uint256[2] | 
|`minAmounts` | uint256[2] | 


### depositFor
```solidity
function depositFor(
  uint256[2] maxAmounts,
  uint256[2] minAmounts,
  address target
) public returns (uint256 fairSupply, uint256[2] receivedAmounts)
```
Deposits from `minAmounts` to `maxAmounts` tokens to the pool


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`maxAmounts` | uint256[2] | Maximum allowed amounts sender is ready to deposit  
|`minAmounts` | uint256[2] | Minimum allowed amounts sender is ready to deposit  
|`target` | address | Address that receives LP tokens  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`fairSupply`| uint256 | Amount of LP tokens minted 
|`receivedAmounts`| uint256[2] | Actual amount somewhere in allowed boundaries

### withdraw
```solidity
function withdraw(
  uint256 amount,
  uint256[] minReturns
) external returns (uint256[2] withdrawnAmounts)
```
Same as `withdrawFor` but for `msg.sender`

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`amount` | uint256 | 
|`minReturns` | uint256[] | 


### withdrawFor
```solidity
function withdrawFor(
  uint256 amount,
  uint256[] minReturns,
  address payable target
) public returns (uint256[2] withdrawnAmounts)
```
Withdraws funds from the pool


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`amount` | uint256 | Amount of LP tokens to withdraw  
|`minReturns` | uint256[] | Minimum amounts sender is ready to receive  
|`target` | address payable | Address that receives funds  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`withdrawnAmounts`| uint256[2] | Actual amount that were withdrawn

### swap
```solidity
function swap(
  contract IERC20 src,
  contract IERC20 dst,
  uint256 amount,
  uint256 minReturn,
  address referral
) external returns (uint256 result)
```
Same as `swapFor` but for `msg.sender`

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`src` | contract IERC20 | 
|`dst` | contract IERC20 | 
|`amount` | uint256 | 
|`minReturn` | uint256 | 
|`referral` | address | 


### swapFor
```solidity
function swapFor(
  contract IERC20 src,
  contract IERC20 dst,
  uint256 amount,
  uint256 minReturn,
  address referral,
  address payable receiver
) public returns (uint256 result)
```
Swaps specified amount of source tokens to destination tokens


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`src` | contract IERC20 | Source token  
|`dst` | contract IERC20 | Destination token  
|`amount` | uint256 | Amount of source tokens to swap  
|`minReturn` | uint256 | Minimum amounts sender is ready to receive  
|`referral` | address | Swap referral  
|`receiver` | address payable | Address that receives funds  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`result`| uint256 | Amount of `dst` tokens that were transferred to `receiver`

### _getReturn
```solidity
function _getReturn(
  contract IERC20 src,
  contract IERC20 dst,
  uint256 amount,
  uint256 srcBalance,
  uint256 dstBalance,
  uint256 fee,
  uint256 slippageFee
) internal returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`src` | contract IERC20 | 
|`dst` | contract IERC20 | 
|`amount` | uint256 | 
|`srcBalance` | uint256 | 
|`dstBalance` | uint256 | 
|`fee` | uint256 | 
|`slippageFee` | uint256 | 


### rescueFunds
```solidity
function rescueFunds(
  contract IERC20 token,
  uint256 amount
) external
```
Allows contract owner to withdraw funds that was send to contract by mistake

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | contract IERC20 | 
|`amount` | uint256 | 


## Events
### Error
```solidity
event Error(
  string reason
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`reason` | string | 

### Deposited
```solidity
event Deposited(
  address sender,
  address receiver,
  uint256 share,
  uint256 token0Amount,
  uint256 token1Amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`sender` | address | 
|`receiver` | address | 
|`share` | uint256 | 
|`token0Amount` | uint256 | 
|`token1Amount` | uint256 | 

### Withdrawn
```solidity
event Withdrawn(
  address sender,
  address receiver,
  uint256 share,
  uint256 token0Amount,
  uint256 token1Amount
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`sender` | address | 
|`receiver` | address | 
|`share` | uint256 | 
|`token0Amount` | uint256 | 
|`token1Amount` | uint256 | 

### Swapped
```solidity
event Swapped(
  address sender,
  address receiver,
  address srcToken,
  address dstToken,
  uint256 amount,
  uint256 result,
  uint256 srcAdditionBalance,
  uint256 dstRemovalBalance,
  address referral
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`sender` | address | 
|`receiver` | address | 
|`srcToken` | address | 
|`dstToken` | address | 
|`amount` | uint256 | 
|`result` | uint256 | 
|`srcAdditionBalance` | uint256 | 
|`dstRemovalBalance` | uint256 | 
|`referral` | address | 

### Sync
```solidity
event Sync(
  uint256 srcBalance,
  uint256 dstBalance,
  uint256 fee,
  uint256 slippageFee,
  uint256 referralShare,
  uint256 governanceShare
)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`srcBalance` | uint256 | 
|`dstBalance` | uint256 | 
|`fee` | uint256 | 
|`slippageFee` | uint256 | 
|`referralShare` | uint256 | 
|`governanceShare` | uint256 | 

