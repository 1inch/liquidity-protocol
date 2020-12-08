// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../../Mooniswap.sol";
import "../../utils/BalanceAccounting.sol";
import "../../libraries/Voting.sol";


contract FarmingVoter is MooniswapConstants, BalanceAccounting {
    using Vote for Vote.Data;
    using Voting for Voting.Data;

    event FeeVoteUpdate(address indexed user, uint256 fee, bool isDefault, uint256 amount);
    event SlippageFeeVoteUpdate(address indexed user, uint256 slippageFee, bool isDefault, uint256 amount);
    event DecayPeriodVoteUpdate(address indexed user, uint256 decayPeriod, bool isDefault, uint256 amount);

    Mooniswap public immutable mooniswap;
    IMooniswapFactoryGovernance public immutable mooniswapFactoryGovernance;
    Voting.Data private _fee;
    Voting.Data private _slippageFee;
    Voting.Data private _decayPeriod;

    constructor(Mooniswap _mooniswap) public {
        mooniswap = _mooniswap;
        mooniswapFactoryGovernance = _mooniswap.mooniswapFactoryGovernance();
    }

    function fee() public view returns(uint256) {
        return _fee.result;
    }

    function slippageFee() public view returns(uint256) {
        return _slippageFee.result;
    }

    function decayPeriod() public view returns(uint256) {
        return _decayPeriod.result;
    }

    function feeVotes(address user) external view returns(uint256) {
        return _fee.votes[user].get(mooniswapFactoryGovernance.defaultFee);
    }

    function slippageFeeVotes(address user) external view returns(uint256) {
        return _slippageFee.votes[user].get(mooniswapFactoryGovernance.defaultSlippageFee);
    }

    function decayPeriodVotes(address user) external view returns(uint256) {
        return _decayPeriod.votes[user].get(mooniswapFactoryGovernance.defaultDecayPeriod);
    }

    function feeVote(uint256 vote) external {
        require(vote <= _MAX_FEE, "Fee vote is too high");

        _fee.updateVote(msg.sender, _fee.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), totalSupply(), mooniswapFactoryGovernance.defaultFee(), _emitFeeVoteUpdate);
        mooniswap.feeVote(_fee.result);
    }

    function slippageFeeVote(uint256 vote) external {
        require(vote <= _MAX_SLIPPAGE_FEE, "Slippage fee vote is too high");

        _slippageFee.updateVote(msg.sender, _slippageFee.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), totalSupply(), mooniswapFactoryGovernance.defaultSlippageFee(), _emitSlippageFeeVoteUpdate);
        mooniswap.slippageFeeVote(_slippageFee.result);
    }

    function decayPeriodVote(uint256 vote) external {
        require(vote <= _MAX_DECAY_PERIOD, "Decay period vote is too high");
        require(vote >= _MIN_DECAY_PERIOD, "Decay period vote is too low");

        _decayPeriod.updateVote(msg.sender, _decayPeriod.votes[msg.sender], Vote.init(vote), balanceOf(msg.sender), totalSupply(), mooniswapFactoryGovernance.defaultDecayPeriod(), _emitDecayPeriodVoteUpdate);
        mooniswap.decayPeriodVote(_decayPeriod.result);
    }

    function discardFeeVote() external {
        _fee.updateVote(msg.sender, _fee.votes[msg.sender], Vote.init(), balanceOf(msg.sender), totalSupply(), mooniswapFactoryGovernance.defaultFee(), _emitFeeVoteUpdate);
        mooniswap.feeVote(_fee.result);
    }

    function discardSlippageFeeVote() external {
        _slippageFee.updateVote(msg.sender, _slippageFee.votes[msg.sender], Vote.init(), balanceOf(msg.sender), totalSupply(), mooniswapFactoryGovernance.defaultSlippageFee(), _emitSlippageFeeVoteUpdate);
        mooniswap.slippageFeeVote(_slippageFee.result);
    }

    function discardDecayPeriodVote() external {
        _decayPeriod.updateVote(msg.sender, _decayPeriod.votes[msg.sender], Vote.init(), balanceOf(msg.sender), totalSupply(), mooniswapFactoryGovernance.defaultDecayPeriod(), _emitDecayPeriodVoteUpdate);
        mooniswap.decayPeriodVote(_decayPeriod.result);
    }

    function _emitFeeVoteUpdate(address account, uint256 newFee, bool isDefault, uint256 newBalance) private {
        emit FeeVoteUpdate(account, newFee, isDefault, newBalance);
    }

    function _emitSlippageFeeVoteUpdate(address account, uint256 newSlippageFee, bool isDefault, uint256 newBalance) private {
        emit SlippageFeeVoteUpdate(account, newSlippageFee, isDefault, newBalance);
    }

    function _emitDecayPeriodVoteUpdate(address account, uint256 newDecayPeriod, bool isDefault, uint256 newBalance) private {
        emit DecayPeriodVoteUpdate(account, newDecayPeriod, isDefault, newBalance);
    }

    function _mint(address account, uint256 amount) internal override {
        uint256 balance = balanceOf(account);
        uint256 newBalance = balance.add(amount);
        super._mint(account, amount);
        uint256 newTotalSupply = totalSupply();

        _updateVotes(account, balance, newBalance, newTotalSupply);
    }

    function _burn(address account, uint256 amount) internal override {
        uint256 balance = balanceOf(account);
        uint256 newBalance = balance.add(amount);
        super._burn(account, amount);
        uint256 newTotalSupply = totalSupply();

        _updateVotes(account, balance, newBalance, newTotalSupply);
    }

    function _updateVotes(address account, uint256 balance, uint256 newBalance, uint256 newTotalSupply) private {
        _fee.updateBalance(account, _fee.votes[account], balance, newBalance, newTotalSupply, _DEFAULT_FEE, _emitFeeVoteUpdate);
        mooniswap.feeVote(_fee.result);
        _slippageFee.updateBalance(account, _slippageFee.votes[account], balance, newBalance, newTotalSupply, _DEFAULT_SLIPPAGE_FEE, _emitSlippageFeeVoteUpdate);
        mooniswap.slippageFeeVote(_slippageFee.result);
        _decayPeriod.updateBalance(account, _decayPeriod.votes[account], balance, newBalance, newTotalSupply, _DEFAULT_DECAY_PERIOD, _emitDecayPeriodVoteUpdate);
        mooniswap.decayPeriodVote(_decayPeriod.result);
    }
}
