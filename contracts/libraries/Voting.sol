// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/IMooniFactory.sol";

library Vote {
    struct Data {
        uint256 value;
    }

    function eq(Vote.Data memory self, Vote.Data memory vote) internal pure returns(bool) {
        return self.value == vote.value;
    }

    function init() internal pure returns(Vote.Data memory data) {
        return Vote.Data({
            value: 0
        });
    }

    function init(uint256 vote) internal pure returns(Vote.Data memory data) {
        return Vote.Data({
            value: vote + 1
        });
    }

    function set(Data storage self, uint256 value) internal {
        self.value = value + 1;
    }

    function discard(Data storage self) internal {
        self.value = 0;
    }

    function isDefault(Data memory self) internal pure returns(bool) {
        return self.value == 0;
    }

    function get(Data memory self, uint256 defaultVote) internal pure returns(uint256) {
        if (self.value > 0) {
            return self.value - 1;
        }
        return defaultVote;
    }

    function getFn(Data memory self, function() external view returns(uint256) defaultVoteFn) internal view returns(uint256) {
        if (self.value > 0) {
            return self.value - 1;
        }
        return defaultVoteFn();
    }
}


library Voting {
    using SafeMath for uint256;
    using Vote for Vote.Data;

    struct Data {
        uint256 result;
        mapping(address => Vote.Data) votes;
    }

    function set(Data storage self, address voter, uint256 vote) internal {
        self.votes[voter].set(vote);
    }

    function discard(Data storage self, address voter) internal {
        self.votes[voter].discard();
    }

    function updateVote(
        Voting.Data storage self,
        address user,
        Vote.Data memory newVote,
        uint256 oldBalance,
        uint256 newBalance,
        uint256 oldTotalSupply,
        uint256 newTotalSupply,
        function() external view returns(uint256) defaultVoteFn
    ) internal returns(uint256 newResult, bool changed) {
        Vote.Data memory oldVote = self.votes[msg.sender];
        uint256 defaultVote = (newVote.isDefault() || oldVote.isDefault()) ? defaultVoteFn() : 0;

        uint256 result = self.result;
        newResult = result;
        newResult = newResult.mul(oldTotalSupply);
        newResult = newResult.add(newBalance.mul(newVote.get(defaultVote)));
        newResult = newResult.sub(oldBalance.mul(oldVote.get(defaultVote)));
        newResult = newResult.div(newTotalSupply);

        if (newResult != result) {
            self.result = newResult;
            changed = true;
        }

        if (!newVote.eq(oldVote)) {
            self.votes[user] = newVote;
        }
    }
}
