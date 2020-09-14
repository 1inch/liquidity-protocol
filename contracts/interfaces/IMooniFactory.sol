// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;


interface IMooniFactory {
    function fee() external view returns(uint256);
    function decayPeriod() external view returns(uint256);
}
