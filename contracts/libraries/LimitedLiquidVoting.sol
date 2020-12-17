// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./VirtualVote.sol";
import "./Vote.sol";


library LimitedLiquidVoting {
    using SafeMath for uint256;
    using Vote for Vote.Data;
    using VirtualVote for VirtualVote.Data;

    struct Data {
        VirtualVote.Data data;
        uint256 _weightedSum;
        uint256 _votedTotalSupply;
        mapping(address => Vote.Data) votes;
    }

    function updateVote(
        LimitedLiquidVoting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 balance,
        uint256 defaultVote,
        function(address, uint256, bool, uint256) emitEvent
    ) internal {
        return _update(self, user, oldVote, newVote, balance, balance, defaultVote, emitEvent);
    }

    function updateBalance(
        LimitedLiquidVoting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        uint256 oldBalance,
        uint256 newBalance,
        uint256 defaultVote,
        function(address, uint256, bool, uint256) emitEvent
    ) internal {
        return _update(self, user, oldVote, newBalance == 0 ? Vote.init() : oldVote, oldBalance, newBalance, defaultVote, emitEvent);
    }

    function _update(
        LimitedLiquidVoting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 oldBalance,
        uint256 newBalance,
        uint256 defaultVote,
        function(address, uint256, bool, uint256) emitEvent
    ) private {
        uint256 oldWeightedSum = self._weightedSum;
        uint256 newWeightedSum = oldWeightedSum;
        uint256 oldVotedTotalSupply = self._votedTotalSupply;
        uint256 newVotedTotalSupply = oldVotedTotalSupply;

        if (!oldVote.isDefault()) {
            newWeightedSum = newWeightedSum.sub(oldBalance.mul(oldVote.get(defaultVote)));
            newVotedTotalSupply = oldVotedTotalSupply.sub(oldBalance);
        }

        if (!newVote.isDefault()) {
            newWeightedSum = newWeightedSum.add(newBalance.mul(newVote.get(defaultVote)));
            newVotedTotalSupply = oldVotedTotalSupply.add(newBalance);
        }

        if (newWeightedSum != oldWeightedSum) {
            self._weightedSum = newWeightedSum;
        }

        if (newVotedTotalSupply != oldVotedTotalSupply) {
            self._votedTotalSupply = newVotedTotalSupply;
        }

        {
            uint256 newResult = newVotedTotalSupply == 0 ? defaultVote : newWeightedSum.div(newVotedTotalSupply);
            VirtualVote.Data memory data = self.data;

            if (newResult != data.result) {
                self.data.oldResult = uint104(data.current());
                self.data.result = uint104(newResult);
                self.data.time = uint48(block.timestamp);
            }
        }

        if (!newVote.eq(oldVote)) {
            self.votes[user] = newVote;
        }

        emitEvent(user, newVote.get(defaultVote), newVote.isDefault(), newBalance);
    }
}
