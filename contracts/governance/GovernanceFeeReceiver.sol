// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../utils/Converter.sol";
import "./rewards/IRewardDistributionRecipient.sol";


contract GovernanceFeeReceiver is Converter {
    IRewardDistributionRecipient public immutable rewards;

    receive() external payable {
        // solhint-disable-next-line avoid-tx-origin
        require(msg.sender != tx.origin, "ETH transfer forbidden");
    }

    constructor(IERC20 _targetToken, IRewardDistributionRecipient _rewards, IMooniswapFactory _mooniswapFactory)
        public Converter(_targetToken, _mooniswapFactory)
    {
        rewards = _rewards;
    }

    function unwrapLPTokens(Mooniswap mooniswap) external validSpread(mooniswap) {
        mooniswap.withdraw(mooniswap.balanceOf(address(this)), new uint256[](0));
    }

    function swap(IERC20[] memory path) external {
        uint256 amount = _maxAmountForSwap(path, path[0].uniBalanceOf(address(this)));
        uint256 result = _swap(path, amount, payable(address(rewards)));
        rewards.notifyRewardAmount(result);
    }
}
