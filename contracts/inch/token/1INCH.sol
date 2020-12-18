// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "./ERC20Permit.sol";


contract OneInch is ERC20Permit, ERC20Burnable {
    constructor(address[] memory recepients, uint256[] memory amounts) public ERC20("1INCH Token", "1INCH") EIP712("1INCH Token", "1") {
        require(recepients.length == amounts.length, "arrays length does not match");
        for (uint256 i = 0; i < recepients.length; i++) {
            _mint(recepients[i], amounts[i]);
        }
        require(totalSupply() == 1.5e9 ether, "incorrect distribution");
    }
}
