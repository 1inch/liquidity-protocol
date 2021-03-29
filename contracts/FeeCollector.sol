// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./libraries/UniERC20.sol";
import "./utils/BalanceAccounting.sol";


contract FeeCollector is Ownable, BalanceAccounting {
    using SafeMath for uint256;
    using UniERC20 for IERC20;

    IERC20 public immutable token;
    uint256 private immutable _k00;
    uint256 private immutable _k01;
    uint256 private immutable _k02;
    uint256 private immutable _k03;
    uint256 private immutable _k04;
    uint256 private immutable _k05;
    uint256 private immutable _k06;
    uint256 private immutable _k07;
    uint256 private immutable _k08;
    uint256 private immutable _k09;
    uint256 private immutable _k10;
    uint256 private immutable _k11;
    uint256 private immutable _k12;
    uint256 private immutable _k13;
    uint256 private immutable _k14;
    uint256 private immutable _k15;
    uint256 private immutable _k16;
    uint256 private immutable _k17;
    uint256 private immutable _k18;
    uint256 private immutable _k19;

    struct TokenInfo {
        uint256 totalShares;
        uint256 auctionStarted;
        mapping(address => uint256) userShare;
        mapping(address => uint256) userLastAuctionClaimed;
        mapping(uint256 => uint256) auctionSettlementPrice;
    }

    uint112 public minValue;
    uint112 public maxValue;
    uint32 public period;
    uint256 public auctionRestarted;
    mapping(IERC20 => TokenInfo) public tokenInfo;

    constructor(
        IERC20 _token,
        uint256 _minValue,
        uint256 _maxValue,
        uint256 _deceleration
    ) public {
        require(_deceleration > 0 && _deceleration < 1e36, "Invalid deceleration");
        require(_minValue < _maxValue, "Invalid min and max values");
        require(_maxValue * 1e36 > 1e36, "Max value is too huge"); // check overflow

        token = _token;

        uint256 z;
        _k00 = z = _deceleration;
        _k01 = z = z * z / 1e36;
        _k02 = z = z * z / 1e36;
        _k03 = z = z * z / 1e36;
        _k04 = z = z * z / 1e36;
        _k05 = z = z * z / 1e36;
        _k06 = z = z * z / 1e36;
        _k07 = z = z * z / 1e36;
        _k08 = z = z * z / 1e36;
        _k09 = z = z * z / 1e36;
        _k10 = z = z * z / 1e36;
        _k11 = z = z * z / 1e36;
        _k12 = z = z * z / 1e36;
        _k13 = z = z * z / 1e36;
        _k14 = z = z * z / 1e36;
        _k15 = z = z * z / 1e36;
        _k16 = z = z * z / 1e36;
        _k17 = z = z * z / 1e36;
        _k18 = z = z * z / 1e36;
        _k19 = z = z * z / 1e36;
        require(z == 0, "Deceleration is too slow");

        setMinMax(_minValue, _maxValue);
    }

    // v1 -> max * dec ^ time
    // v1 * x -> max * dec ^ time * x
    // dec ^ time * x = dec ^ time2
    // x = dec ^ (time2 - time)
    // time + log(x) / log(dec) = time2

    function setMinMax(uint256 _minValue, uint256 _maxValue) public onlyOwner {
        uint256 l = 0;
        uint256 r = 2**20;
        uint256[20] memory table = decelerationTable();
        while (l != r) {
            uint256 m = (l + r) / 2;
            uint256 p = _priceForTime(m, _minValue, _maxValue, table);
            if (p > _minValue) {
                l = m + 1;
            } else {
                r = m;
            }
        }

        minValue = _minValue;
        maxValue = _maxValue;
        period = r;
    }

    function decelerationTable() public pure returns(uint256[20] memory) {
        return [
            _k00, _k01, _k02, _k03, _k04,
            _k05, _k06, _k07, _k08, _k09,
            _k10, _k11, _k12, _k13, _k14,
            _k15, _k16, _k17, _k18, _k19
        ];
    }

    function price() public view returns(uint256 result) {
        return priceForTime(block.timestamp);
    }

    function priceForTime(uint256 time) public view returns(uint256) {
        return _priceForTime(time, minValue, maxValue, decelerationTable());
    }

    // cost1 = max * deceleration^time1
    // cost2 = max * deceleration^time2
    // cost1 * k = cost2
    // deceleration^time1 * k = deceleration^(time1+shift)
    // deceleration^time1 * k = deceleration^time1 * deceleration^shift
    // k = deceleration^shift

    function _priceForTime(uint256 time, uint256 _minValue, uint256 _maxValue, uint256[20] memory table) private view returns(uint256 result) {
        result = _maxValue;
        uint256 secs = time.sub(started).mod(period);
        for (uint i = 0; time > 0 && i < table.length; i++) {
            if (time & 1 != 0) {
                result = result * table[i] / 1e36;
            }
            time >>= 1;
        }
    }

    function name() external view returns(string memory) {
        return string(abi.encodePacked("FeeCollector: ", token.uniName()));
    }

    function symbol() external view returns(string memory) {
        return string(abi.encodePacked("fee-", token.uniSymbol()));
    }

    function decimals() external view returns(uint8) {
        return uint8(token.uniDecimals());
    }

    // struct UserInfo {
    //     uint256 balance;
    //     mapping(IERC20 => mapping(uint256 => uint256)) share;
    //     mapping(IERC20 => uint256) firstUnprocessedEpoch;
    // }

    // struct EpochBalance {
    //     uint256 totalSupply;
    //     uint256 token0Balance;
    //     uint256 token1Balance;
    //     uint256 inchBalance;
    // }

    // struct TokenInfo {
    //     mapping(uint256 => EpochBalance) epochBalance;
    //     uint256 firstUnprocessedEpoch;
    //     uint256 currentEpoch;
    // }

    // mapping(address => UserInfo) public userInfo;
    // mapping(IERC20 => TokenInfo) public tokenInfo;

    // // solhint-disable-next-line no-empty-blocks
    // constructor(IERC20 _inchToken, IMooniswapFactory _mooniswapFactory) public Converter(_inchToken, _mooniswapFactory) {}

    // function updateReward(address referral, uint256 amount) external override {
    //     Mooniswap mooniswap = Mooniswap(msg.sender);
    //     TokenInfo storage token = tokenInfo[mooniswap];
    //     UserInfo storage user = userInfo[referral];
    //     uint256 currentEpoch = token.currentEpoch;

    //     // Add new reward to current epoch
    //     user.share[mooniswap][currentEpoch] = user.share[mooniswap][currentEpoch].add(amount);
    //     token.epochBalance[currentEpoch].totalSupply = token.epochBalance[currentEpoch].totalSupply.add(amount);

    //     // Collect all processed epochs and advance user token epoch
    //     _collectProcessedEpochs(user, token, mooniswap, currentEpoch);
    // }

    // function freezeEpoch(Mooniswap mooniswap) external nonReentrant validPool(mooniswap) validSpread(mooniswap) {
    //     TokenInfo storage token = tokenInfo[mooniswap];
    //     uint256 currentEpoch = token.currentEpoch;
    //     require(token.firstUnprocessedEpoch == currentEpoch, "Previous epoch is not finalized");

    //     IERC20[] memory tokens = mooniswap.getTokens();
    //     uint256 token0Balance = tokens[0].uniBalanceOf(address(this));
    //     uint256 token1Balance = tokens[1].uniBalanceOf(address(this));
    //     mooniswap.withdraw(mooniswap.balanceOf(address(this)), new uint256[](0));
    //     token.epochBalance[currentEpoch].token0Balance = tokens[0].uniBalanceOf(address(this)).sub(token0Balance);
    //     token.epochBalance[currentEpoch].token1Balance = tokens[1].uniBalanceOf(address(this)).sub(token1Balance);
    //     token.currentEpoch = currentEpoch.add(1);
    // }

    // function trade(Mooniswap mooniswap, IERC20[] memory path) external nonReentrant validPool(mooniswap) validPath(path) {
    //     TokenInfo storage token = tokenInfo[mooniswap];
    //     uint256 firstUnprocessedEpoch = token.firstUnprocessedEpoch;
    //     EpochBalance storage epochBalance = token.epochBalance[firstUnprocessedEpoch];
    //     require(firstUnprocessedEpoch.add(1) == token.currentEpoch, "Prev epoch already finalized");

    //     IERC20[] memory tokens = mooniswap.getTokens();
    //     uint256 availableBalance;
    //     if (path[0] == tokens[0]) {
    //         availableBalance = epochBalance.token0Balance;
    //     } else if (path[0] == tokens[1]) {
    //         availableBalance = epochBalance.token1Balance;
    //     } else {
    //         revert("Invalid first token");
    //     }

    //     (uint256 amount, uint256 returnAmount) = _maxValueForSwap(path, availableBalance);
    //     if (returnAmount == 0) {
    //         // get rid of dust
    //         if (availableBalance > 0) {
    //             require(availableBalance == amount, "availableBalance is not dust");
    //             for (uint256 i = 0; i + 1 < path.length; i += 1) {
    //                 Mooniswap _mooniswap = mooniswapFactory.pools(path[i], path[i+1]);
    //                 require(_validateSpread(_mooniswap), "Spread is too high");
    //             }
    //             if (path[0].isETH()) {
    //                 tx.origin.transfer(availableBalance);  // solhint-disable-line avoid-tx-origin
    //             } else {
    //                 path[0].safeTransfer(address(mooniswap), availableBalance);
    //             }
    //         }
    //     } else {
    //         uint256 receivedAmount = _swap(path, amount, payable(address(this)));
    //         epochBalance.inchBalance = epochBalance.inchBalance.add(receivedAmount);
    //     }

    //     if (path[0] == tokens[0]) {
    //         epochBalance.token0Balance = epochBalance.token0Balance.sub(amount);
    //     } else {
    //         epochBalance.token1Balance = epochBalance.token1Balance.sub(amount);
    //     }

    //     if (epochBalance.token0Balance == 0 && epochBalance.token1Balance == 0) {
    //         token.firstUnprocessedEpoch = firstUnprocessedEpoch.add(1);
    //     }
    // }

    // function claim(Mooniswap[] memory pools) external {
    //     UserInfo storage user = userInfo[msg.sender];
    //     for (uint256 i = 0; i < pools.length; ++i) {
    //         Mooniswap mooniswap = pools[i];
    //         TokenInfo storage token = tokenInfo[mooniswap];
    //         _collectProcessedEpochs(user, token, mooniswap, token.currentEpoch);
    //     }

    //     uint256 balance = user.balance;
    //     if (balance > 1) {
    //         // Avoid erasing storage to decrease gas footprint for referral payments
    //         user.balance = 1;
    //         inchToken.transfer(msg.sender, balance - 1);
    //     }
    // }

    // function claimCurrentEpoch(Mooniswap mooniswap) external nonReentrant validPool(mooniswap) {
    //     TokenInfo storage token = tokenInfo[mooniswap];
    //     UserInfo storage user = userInfo[msg.sender];
    //     uint256 currentEpoch = token.currentEpoch;
    //     uint256 balance = user.share[mooniswap][currentEpoch];
    //     if (balance > 0) {
    //         user.share[mooniswap][currentEpoch] = 0;
    //         token.epochBalance[currentEpoch].totalSupply = token.epochBalance[currentEpoch].totalSupply.sub(balance);
    //         mooniswap.transfer(msg.sender, balance);
    //     }
    // }

    // function claimFrozenEpoch(Mooniswap mooniswap) external nonReentrant validPool(mooniswap) {
    //     TokenInfo storage token = tokenInfo[mooniswap];
    //     UserInfo storage user = userInfo[msg.sender];
    //     uint256 firstUnprocessedEpoch = token.firstUnprocessedEpoch;
    //     uint256 currentEpoch = token.currentEpoch;

    //     require(firstUnprocessedEpoch.add(1) == currentEpoch, "Epoch already finalized");
    //     require(user.firstUnprocessedEpoch[mooniswap] == firstUnprocessedEpoch, "Epoch funds already claimed");

    //     user.firstUnprocessedEpoch[mooniswap] = currentEpoch;
    //     uint256 share = user.share[mooniswap][firstUnprocessedEpoch];

    //     if (share > 0) {
    //         EpochBalance storage epochBalance = token.epochBalance[firstUnprocessedEpoch];
    //         uint256 totalSupply = epochBalance.totalSupply;
    //         user.share[mooniswap][firstUnprocessedEpoch] = 0;
    //         epochBalance.totalSupply = totalSupply.sub(share);

    //         IERC20[] memory tokens = mooniswap.getTokens();
    //         epochBalance.token0Balance = _transferTokenShare(tokens[0], epochBalance.token0Balance, share, totalSupply);
    //         epochBalance.token1Balance = _transferTokenShare(tokens[1], epochBalance.token1Balance, share, totalSupply);
    //         epochBalance.inchBalance = _transferTokenShare(inchToken, epochBalance.inchBalance, share, totalSupply);
    //     }
    // }

    // function _transferTokenShare(IERC20 token, uint256 balance, uint256 share, uint256 totalSupply) private returns(uint256 newBalance) {
    //     uint256 amount = balance.mul(share).div(totalSupply);
    //     if (amount > 0) {
    //         token.uniTransfer(msg.sender, amount);
    //     }
    //     return balance.sub(amount);
    // }

    // function _collectProcessedEpochs(UserInfo storage user, TokenInfo storage token, Mooniswap mooniswap, uint256 currentEpoch) private {
    //     // Early return for the new users
    //     if (user.share[mooniswap][user.firstUnprocessedEpoch[mooniswap]] == 0) {
    //         user.firstUnprocessedEpoch[mooniswap] = currentEpoch;
    //         return;
    //     }

    //     uint256 userEpoch = user.firstUnprocessedEpoch[mooniswap];
    //     uint256 tokenEpoch = token.firstUnprocessedEpoch;
    //     uint256 epochCount = Math.min(2, tokenEpoch.sub(userEpoch)); // 0, 1 or 2 epochs
    //     if (epochCount == 0) {
    //         return;
    //     }

    //     // Claim 1 or 2 processed epochs for the user
    //     uint256 collected = _collectEpoch(user, token, mooniswap, userEpoch);
    //     if (epochCount > 1) {
    //         collected = collected.add(_collectEpoch(user, token, mooniswap, userEpoch + 1));
    //     }
    //     user.balance = user.balance.add(collected);

    //     // Update user token epoch counter
    //     bool emptySecondEpoch = user.share[mooniswap][userEpoch + 1] == 0;
    //     user.firstUnprocessedEpoch[mooniswap] = (epochCount == 2 || emptySecondEpoch) ? currentEpoch : userEpoch + 1;
    // }

    // function _collectEpoch(UserInfo storage user, TokenInfo storage token, Mooniswap mooniswap, uint256 epoch) private returns(uint256 collected) {
    //     uint256 inchBalance = token.epochBalance[epoch].inchBalance;
    //     uint256 share = user.share[mooniswap][epoch];
    //     uint256 totalSupply = token.epochBalance[epoch].totalSupply;

    //     collected = inchBalance.mul(share).div(totalSupply);

    //     user.share[mooniswap][epoch] = 0;
    //     token.epochBalance[epoch].totalSupply = totalSupply.sub(share);
    //     token.epochBalance[epoch].inchBalance = inchBalance.sub(collected);
    // }
}
