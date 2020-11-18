// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Vote.sol";


library LiquidVoting {
    using SafeMath for uint256;
    using Vote for Vote.Data;

    uint256 private constant _VOTING_DECAY_PERIOD = 1 days;

    struct VirtualData {
        uint104 oldResult;
        uint104 result;
        uint48 time;
    }

    struct Data {
        VirtualData data;
        uint256 _scaledResult;
        mapping(address => Vote.Data) votes;
    }

    function current(LiquidVoting.VirtualData memory self) internal view returns(uint256) {
        uint256 timePassed = Math.min(_VOTING_DECAY_PERIOD, block.timestamp.sub(self.time));
        uint256 timeRemain = _VOTING_DECAY_PERIOD.sub(timePassed);
        return uint256(self.oldResult).mul(timeRemain).add(
            uint256(self.result).mul(timePassed)
        ).div(_VOTING_DECAY_PERIOD);
    }

    function updateVote(
        LiquidVoting.Data storage self,
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
        LiquidVoting.Data storage self,
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
        LiquidVoting.Data storage self,
        address user,
        Vote.Data memory oldVote,
        Vote.Data memory newVote,
        uint256 oldBalance,
        uint256 newBalance,
        uint256 newTotalSupply,
        uint256 defaultVote
    ) private returns(uint256 newResult, bool changed) {
        uint256 oldScaledResult = self._scaledResult;
        VirtualData memory data = self.data;

        uint256 newScaledResult = oldScaledResult
            .add(newBalance.mul(newVote.get(defaultVote)))
            .sub(oldBalance.mul(oldVote.get(defaultVote)));
        newResult = newTotalSupply == 0 ? defaultVote : newScaledResult.div(newTotalSupply);

        if (newScaledResult != oldScaledResult) {
            self._scaledResult = newScaledResult;
        }

        if (newResult != data.result) {
            self.data.oldResult = uint104(current(data));
            self.data.result = uint104(newResult);
            self.data.time = uint48(block.timestamp);
            changed = true;
        }

        if (!newVote.eq(oldVote)) {
            self.votes[user] = newVote;
        }
    }
}
