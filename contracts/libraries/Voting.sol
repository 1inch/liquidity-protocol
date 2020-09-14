// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "../interfaces/IMooniFactory.sol";


library Voting {
    function get(mapping(address => uint256) storage votes, address voter, IMooniFactory factory) internal view returns(uint256) {
        uint256 vote = votes[voter];
        if (vote == 0) {
            vote = factory.fee();
        } else {
            vote = vote - 1;
        }
        return vote;
    }

    function set(mapping(address => uint256) storage votes, address voter, uint256 vote) internal returns(uint256) {
        votes[voter] = vote + 1;
    }

    function discard(mapping(address => uint256) storage votes, address voter) internal returns(uint256) {
        votes[voter] = 0;
    }
}
