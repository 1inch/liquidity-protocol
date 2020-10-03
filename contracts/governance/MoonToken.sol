// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MoonToken is ERC20, Ownable {
    // solhint-disable-next-line no-empty-blocks
    constructor() public ERC20("MOON Token", "MOON") {}

    function mint(uint256 amount, address to) external onlyOwner {
        _mint(to, amount);
    }

    // TODO: add permit
}
