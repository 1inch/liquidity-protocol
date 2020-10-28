// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Vote.sol";


library Voting {
    using SafeMath for uint256;
    using Vote for Vote.Data;

    struct Data {
        uint256 result;
        uint256 _scaledResult;
        mapping(address => Vote.Data) votes;
    }

    function updateVote(
        Voting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 balance,
        uint256 totalSupply,
        uint256 defaultVote
    ) internal returns(uint256 newResult, bool changed) {
        return _update(self, user, oldVote, newVote, balance, balance, totalSupply, defaultVote);
    }

    function updateBalance(
        Voting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        uint256 oldBalance,
        uint256 newBalance,
        uint256 newTotalSupply,
        uint256 defaultVote
    ) internal returns(uint256 newResult, bool changed) {
        Vote.Data memory newVote = newBalance == 0 ? Vote.init() : oldVote;
        return _update(self, user, oldVote, newVote, oldBalance, newBalance, newTotalSupply, defaultVote);
    }

    function _update(
        Voting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 oldBalance,
        uint256 newBalance,
        uint256 newTotalSupply,
        uint256 defaultVote
    ) private returns(uint256 newResult, bool changed) {
        uint256 oldScaledResult = self._scaledResult;
        uint256 newScaledResult = oldScaledResult
            .add(newBalance.mul(newVote.get(defaultVote)))
            .sub(oldBalance.mul(oldVote.get(defaultVote)));
        newResult = newTotalSupply == 0 ? defaultVote : newScaledResult.div(newTotalSupply);

        if (newScaledResult != oldScaledResult) {
            self._scaledResult = newScaledResult;
        }

        if (newResult != self.result) {
            self.result = newResult;
            changed = true;
        }

        if (!newVote.eq(oldVote)) {
            self.votes[user] = newVote;
        }
    }
}
