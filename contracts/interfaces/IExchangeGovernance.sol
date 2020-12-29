// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;


interface IExchangeGovernance {
    function parameters() external view returns(uint256, uint256, uint256);

    function leftoverReferralShare() external view returns(uint256);
    function leftoverGovernanceShare() external view returns(uint256);
    function leftoverTeamShare() external view returns(uint256);
}
