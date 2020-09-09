// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../interfaces/IMooniFactory.sol";

contract MooniFactoryMock is IMooniFactory {
    uint256 private _fee;

    function fee() external view override returns(uint256) {
        return _fee;
    }

    function setFee(uint256 newFee) external {
        _fee = newFee;
    }
}
