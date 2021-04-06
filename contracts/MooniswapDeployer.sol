// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./Mooniswap.sol";


contract Proxy {
    // solhint-disable-next-line no-complex-fallback, payable-fallback
    fallback() external {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory ret) = 0x1D0aE300Eec4093cee4367c00b228D10a5C7aC63.delegatecall(msg.data);
        require(success); // solhint-disable-line reason-string
        // solhint-disable-next-line no-inline-assembly
        assembly {
            return(add(ret, 0x20), mload(ret))
        }
    }
}

contract MooniswapDeployer {
    function deploy(
        IERC20 token1,
        IERC20 token2,
        string calldata name,
        string calldata symbol,
        address poolOwner
    ) external returns(Mooniswap pool) {
        pool = Mooniswap(address(new Proxy()));
        pool.init(token1, token2, name, symbol, IMooniswapFactoryGovernance(msg.sender));
        pool.transferOwnership(poolOwner);
    }
}
