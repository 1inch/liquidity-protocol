
## Converter

### Functions list
- [constructor(_inchToken, _mooniswapFactory) public](#constructor)
- [receive() external](#receive)
- [updatePathWhitelist(token, whitelisted) external](#updatepathwhitelist)
- [_validateSpread(mooniswap) internal](#_validatespread)
- [_maxAmountForSwap(path, amount) internal](#_maxamountforswap)
- [_swap(path, initialAmount, destination) internal](#_swap)

### Functions
### constructor

```solidity
constructor(contract IERC20 _inchToken, contract IMooniswapFactory _mooniswapFactory) public
```

### receive

```solidity
receive() external payable
```

### updatePathWhitelist

```solidity
function updatePathWhitelist(contract IERC20 token, bool whitelisted) external
```

### _validateSpread

```solidity
function _validateSpread(contract Mooniswap mooniswap) internal view returns (bool)
```

### _maxAmountForSwap

```solidity
function _maxAmountForSwap(contract IERC20[] path, uint256 amount) internal view returns (uint256 srcAmount, uint256 dstAmount)
```

### _swap

```solidity
function _swap(contract IERC20[] path, uint256 initialAmount, address payable destination) internal returns (uint256 amount)
```

