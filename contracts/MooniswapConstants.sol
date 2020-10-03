// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

contract MooniswapConstants {
    uint256 internal constant _FEE_DENOMINATOR = 1e18;

    uint256 internal constant _MIN_REFERRAL_SHARE = 0.0001e18; // 0.01%
    uint256 internal constant _MIN_DECAY_PERIOD = 15 seconds;

    uint256 internal constant _MAX_FEE = 0.1e18; // 10%
    uint256 internal constant _MAX_SHARE = 0.5e18; // 50%
    uint256 internal constant _MAX_DECAY_PERIOD = 1 hours;

    uint256 internal constant _DEFAULT_FEE = 0.00015e18; // 0.15%
    uint256 internal constant _DEFAULT_REFERRAL_SHARE = 0.05e18; // 5%
    uint256 internal constant _DEFAULT_GOVERNANCE_SHARE = 0;
    uint256 internal constant _DEFAULT_DECAY_PERIOD = 5 minutes;
}
