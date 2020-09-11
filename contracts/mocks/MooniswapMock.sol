// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../Mooniswap.sol";
import "./MooniFactoryMock.sol";


contract MooniswapMock is Mooniswap {
    IMooniFactory private immutable _factory;

    constructor(IERC20 token0, IERC20 token1, string memory name, string memory symbol)
        public Mooniswap(token0, token1, name, symbol)
    {
        _factory = new MooniFactoryMock();
    }

    function factory() public view override returns(IMooniFactory) {
        return _factory;
    }
}
