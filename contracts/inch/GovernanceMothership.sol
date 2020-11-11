// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./IGovernanceModule.sol";


contract GovernanceMothership is Ownable {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    event AddModule(address indexed module);
    event RemoveModule(address indexed module);

    IERC20 public immutable inchToken;

    mapping (address => uint256) private _balances;
    uint256 private _totalSupply;
    EnumerableSet.AddressSet private _modules;

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

        uint256 newBalance = _balances[msg.sender].add(amount);
        _balances[msg.sender] = newBalance;
        _totalSupply = _totalSupply.add(amount);
        inchToken.transferFrom(msg.sender, address(this), amount);

        _notifyFor(msg.sender, newBalance);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Empty unstake is not allowed");

        uint256 newBalance = _balances[msg.sender].sub(amount);
        _balances[msg.sender] = newBalance;
        _totalSupply = _totalSupply.sub(amount);
        inchToken.transfer(msg.sender, amount);

        _notifyFor(msg.sender, newBalance);
    }

    function notify() external {
        _notifyFor(msg.sender, _balances[msg.sender]);
    }

    function notifyFor(address account) external {
        _notifyFor(account, _balances[account]);
    }

    function addModule(address module) external onlyOwner {
        require(_modules.add(module), "Module already registered");
        emit AddModule(module);
    }

    function removeModule(address module) external onlyOwner {
        require(_modules.remove(module), "Module was not registered");
        emit RemoveModule(module);
    }

    function _notifyFor(address account, uint256 balance) private {
        uint256 modulesLength = _modules.length();
        for (uint256 i = 0; i < modulesLength; ++i) {
            IGovernanceModule(_modules.at(i)).notifyStakeChanged(account, balance);
        }
    }
}
