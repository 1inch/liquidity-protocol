// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";


contract InchRewards {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public constant DURATION = 1 days;

    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rate = 1e18;
    uint256 public lastUpdateTime;
    IERC20 public immutable lpToken;

    uint256 public totalSupply;
    mapping(address => uint256) private _balances;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount, uint256 scaledAmount);
    event Withdrawn(address indexed user, uint256 amount, uint256 scaledAmount);

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function scaledBalanceOf(address account) public view virtual returns (uint256) {
        return _balances[account].mul(rate).div(1e18);
    }

    modifier updateRate() {
        uint256 newAmount = totalSupply.mul(rate).add(
            rewardRate.mul(
                lastTimeRewardApplicable().sub(lastUpdateTime)
            )
        );
        rate = newAmount.div(totalSupply);

        _;
    }

    constructor(IERC20 _lpToken) public {
        lpToken = _lpToken;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function stake(uint256 amount) public updateRate() {
        require(amount > 0, "Cannot stake 0");
        uint256 scaledAmount = amount.mul(1e18).div(rate);
        totalSupply = totalSupply.add(scaledAmount);
        _balances[msg.sender] = _balances[msg.sender].add(scaledAmount);
        lpToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount, scaledAmount);
    }

    function withdraw(uint256 amount) public updateRate() {
        require(amount > 0, "Cannot withdraw 0");
        uint256 scaledAmount = amount.mul(rate).div(1e18);
        totalSupply = totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        lpToken.safeTransfer(msg.sender, scaledAmount);
        emit Withdrawn(msg.sender, amount, scaledAmount);
    }

    function notifyRewardAmount()
        external
        updateRate()
    {
        uint256 reward = lpToken.balanceOf(address(this)).sub(totalSupply.mul(rate));
        rewardRate = reward.div(DURATION);
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(DURATION);
        emit RewardAdded(reward);
    }
}
