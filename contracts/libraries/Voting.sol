// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/IMooniFactory.sol";
import "./Vote.sol";


library Voting {
    using SafeMath for uint256;
    using Vote for Vote.Data;

    struct Data {
        uint256 result;
        mapping(address => Vote.Data) votes;
    }

    function update(
        Voting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 oldBalance,
        uint256 newBalance,
        uint256 oldTotalSupply,
        uint256 newTotalSupply,
        function() external view returns(uint256) defaultVoteFn
    ) internal returns(uint256 newResult, bool changed) {
        uint256 defaultVote = (newVote.isDefault() || oldVote.isDefault()) ? defaultVoteFn() : 0;

        uint256 oldResult = self.result;
        newResult = oldResult;
        newResult = newResult.mul(oldTotalSupply);
        newResult = newResult.add(newBalance.mul(newVote.get(defaultVote)));
        newResult = newResult.sub(oldBalance.mul(oldVote.get(defaultVote)));
        newResult = newResult.div(newTotalSupply);

        if (newResult != oldResult) {
            self.result = newResult;
            changed = true;
        }

        if (!newVote.eq(oldVote)) {
            self.votes[user] = newVote;
        }
    }
}
