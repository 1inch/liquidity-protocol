// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../interfaces/IGovernanceModule.sol";


abstract contract BaseGovernanceModule is IGovernanceModule {
    address public immutable mothership;

    modifier onlyMothership() {
        require(msg.sender == mothership, "Access restricted to mothership");

        _;
    }

    constructor(address _mothership) public {
        mothership = _mothership;
    }
}
