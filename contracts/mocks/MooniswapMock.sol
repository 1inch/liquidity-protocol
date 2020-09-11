// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../Mooniswap.sol";
import "./MooniFactoryMock.sol";


contract MooniswapMock is Mooniswap {
    IMooniFactory private immutable _factory;

    constructor(IERC20[] memory assets, string memory name, string memory symbol)
        public Mooniswap(assets, name, symbol)
    {
        _factory = new MooniFactoryMock();
    }

    function factory() public view override returns(IMooniFactory) {
        return _factory;
    }
}
