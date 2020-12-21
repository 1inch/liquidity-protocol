// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";


contract StepVesting is Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event ReceiverChanged(address oldWallet, address newWallet);

    uint256 public immutable deployed;
    IERC20 public immutable token;
    address public immutable source;
    uint256 public immutable cliffDuration;
    uint256 public immutable stepDuration;
    uint256 public immutable cliffAmount;
    uint256 public immutable stepAmount;
    uint256 public immutable numOfSteps;

    address public receiver;
    uint256 public claimed;

    modifier onlyReceiver {
        require(msg.sender == receiver, "access denied");
        _;
    }

    constructor(
        IERC20 _token,
        address _source,
        uint256 _cliffDuration,
        uint256 _stepDuration,
        uint256 _cliffAmount,
        uint256 _stepAmount,
        uint256 _numOfSteps,
        address _receiver
    ) public {
        deployed = block.timestamp;
        token = _token;
        source = _source;
        cliffDuration = _cliffDuration;
        stepDuration = _stepDuration;
        cliffAmount = _cliffAmount;
        stepAmount = _stepAmount;
        numOfSteps = _numOfSteps;
        setReceiver(_receiver);
    }

    function available() public view returns(uint256) {
        return claimable().sub(claimed);
    }

    function claimable() public view returns(uint256) {
        if (block.timestamp < deployed.add(cliffDuration)) {
            return 0;
        }

        uint256 passedSinceCliff = block.timestamp.sub(deployed.add(cliffDuration));
        uint256 stepsPassed = Math.min(numOfSteps, passedSinceCliff.div(stepDuration));
        return cliffAmount.add(
            stepsPassed.mul(stepAmount)
        );
    }

    function setReceiver(address _receiver) public onlyOwner {
        emit ReceiverChanged(receiver, _receiver);
        receiver = _receiver;
    }

    function kill() external onlyOwner {
        _pause();
    }

    function claim() external onlyReceiver whenNotPaused {
        uint256 amount = available();
        claimed = claimed.add(amount);
        token.safeTransferFrom(source, msg.sender, amount);
    }
}
