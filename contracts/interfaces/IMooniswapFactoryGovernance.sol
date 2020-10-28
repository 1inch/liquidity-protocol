// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


interface IMooniswapFactoryGovernance {
    struct GovernanceParameters {
        uint256 referralShare;
        uint256 governanceShare;
        address governanceFeeReceiver;
    }

    function parameters() external view returns(GovernanceParameters memory);

    function defaultFee() external view returns(uint256);
    function defaultDecayPeriod() external view returns(uint256);
    function referralShare() external view returns(uint256);
    function governanceShare() external view returns(uint256);
    function governanceFeeReceiver() external view returns(address);
}
