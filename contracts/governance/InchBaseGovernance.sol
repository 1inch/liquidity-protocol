// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract InchBaseGovernance {
    using SafeMath for uint256;

    IERC20 public immutable inchToken;

    mapping (address => uint256) private _balances;
    uint256 private _totalSupply;

    constructor(IERC20 _inchToken) public {
        inchToken = _inchToken;
    }

    function balanceOf(address account) public view returns(uint256) {
        return _balances[account];
    }

    function totalSupply() public view returns(uint256) {
        return _totalSupply;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Empty stake is not allowed");
        _beforeStake(msg.sender, amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        _totalSupply = _totalSupply.add(amount);
        inchToken.transferFrom(msg.sender, address(this), amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Empty unstake is not allowed");
        _beforeUnstake(msg.sender, amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _totalSupply = _totalSupply.sub(amount);
        inchToken.transfer(msg.sender, amount);
    }

    // solhint-disable-next-line no-empty-blocks
    function _beforeStake(address account, uint256 amount) internal virtual { }

    // solhint-disable-next-line no-empty-blocks
    function _beforeUnstake(address account, uint256 amount) internal virtual { }
}
