// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

contract MooniswapConstants {
    uint256 internal constant _MAX_FEE = 0.1e18; // 10%
    uint256 internal constant _MAX_SHARE = 0.5e18; // 50%
    uint256 internal constant _MAX_DECAY_PERIOD = 1 hours;
    uint256 internal constant _FEE_DENOMINATOR = 1e18;
}
