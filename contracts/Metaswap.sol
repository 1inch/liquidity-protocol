// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./libraries/UniERC20.sol";
import "./libraries/ABDKMath64x64.sol";


contract MetaswapPool is ERC20 {
    address public immutable metaswap;
    IERC20 public immutable token0;
    IERC20 public immutable token1;
    uint256 public immutable weight0;
    uint256 public immutable weight1;

    modifier onlyMetaswap {
        require(msg.sender == metaswap, "MetaswapPool: access denied");
        _;
    }

    constructor(
        IERC20 _token0,
        IERC20 _token1,
        uint256 _weight0,
        uint256 _weight1,
        string memory name,
        string memory symbol
    ) public ERC20(name, symbol) {
        metaswap = msg.sender;
        token0 = _token0;
        token1 = _token1;
        weight0 = _weight0;
        weight1 = _weight1;
    }

    function mint(address account, uint256 amount) external onlyMetaswap {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external onlyMetaswap {
        _burn(account, amount);
    }
}


library Invariant {
    using SafeMath for uint256;

    struct Data {
        uint256 profit;
        uint128 balance0;
        uint128 balance1;
    }

    function add(Data memory self, uint256 balance0, uint256 balance1, uint256 newProfit) internal pure returns(Data memory) {
        if (self.balance0 == 0 && self.balance1 == 0) {
            return Data({
                profit: newProfit,
                balance0: uint128(balance0),
                balance1: uint128(balance1)
            });
        }
        else {
            return Data({
                profit: newProfit,
                balance0: uint128(uint256(self.balance0).mul(newProfit).div(self.profit).add(balance0)),
                balance1: uint128(uint256(self.balance1).mul(newProfit).div(self.profit).add(balance1))
            });
        }
    }
}


contract Metaswap {
    using SafeMath for uint256;
    using UniERC20 for IERC20;
    using ABDKMath64x64 for int128;
    using Invariant for Invariant.Data;

    struct TokensWeights {
        uint128 weight0;
        uint128 weight1;
    }

    uint256 private constant _BASE_SUPPLY = 1000;
    uint256 private constant _MAX_WEIGHT = 100;

    string public name;
    string public symbol;
    TokensWeights public tokensWeights;
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint256 public profit = 1e18;
    mapping(uint256 => mapping(uint256 => MetaswapPool)) public pools;
    mapping(uint256 => mapping(uint256 => mapping(address => Invariant.Data))) public invariants;

    constructor(IERC20 _token0, IERC20 _token1, string memory _name, string memory _symbol) public {
        require(bytes(_name).length > 0, "Metaswap: name is empty");
        require(bytes(_symbol).length > 0, "Metaswap: symbol is empty");
        require(_token0 != _token1, "Metaswap: duplicate tokens");

        token0 = _token0;
        token1 = _token1;
        name = _name;
        symbol = _symbol;
        tokensWeights = TokensWeights({
            weight0: 1,
            weight1: 1
        });
    }

    function deposit(uint256[2] memory weights, uint256[2] memory amounts) external payable returns(uint256 fairSupply) {
        require(weights[0] > 0 && weights[0] <= _MAX_WEIGHT, "Metaswap: invalid weights[0]");
        require(weights[1] > 0 && weights[1] <= _MAX_WEIGHT, "Metaswap: invalid weights[1]");
        require(amounts[0] > 0 && amounts[1] > 0, "Metaswap: invalid amounts");

        MetaswapPool pool = _getOrCreatePool(weights[0], weights[1]);

        if (pool.totalSupply() == 0) {
            fairSupply = _BASE_SUPPLY.mul(99);
            pool.mint(address(this), _BASE_SUPPLY); // Donate up to 1%

            // Use the greatest token amount but not less than 99k for the initial supply
            fairSupply = Math.max(fairSupply, Math.max(amounts[0], amounts[1]));
        }
        else {
            
        }

        Invariant.Data memory inv = invariants[weights[0]][weights[1]][msg.sender];
        invariants[weights[0]][weights[1]][msg.sender] = inv.add(amounts[0], amounts[1], profit);

        token0.uniTransferFrom(msg.sender, address(this), amounts[0]);
        token1.uniTransferFrom(msg.sender, address(this), amounts[1]);

        require(fairSupply > 0, "Metaswap: result is not enough");
        pool.mint(msg.sender, fairSupply);
    }

    function getReturn(
        uint256 srcBalance,
        uint256 dstBalance,
        uint256 srcWeight,
        uint256 dstWeight,
        uint256 amount
    ) public pure returns(uint256) {
        return _getReturn(
            ABDKMath64x64.fromUInt(srcBalance),
            ABDKMath64x64.fromUInt(dstBalance),
            ABDKMath64x64.fromUInt(srcWeight),
            ABDKMath64x64.fromUInt(dstWeight),
            ABDKMath64x64.fromUInt(amount)
        ).toUInt();
    }

    function _getReturn(
        int128 srcBalance,
        int128 dstBalance,
        int128 srcWeight,
        int128 dstWeight,
        int128 amount
    ) private pure returns(int128) {
        // x^n * y^m = (x+a)^n * (y-b)^m
        // b = y - y * (x/(x+a))^(n/m)
        int128 xxa = srcBalance.div(srcBalance.add(amount));
        int128 xxamn = _powFrac(xxa, srcWeight, dstWeight);
        return dstBalance.sub(dstBalance.mul(xxamn));
    }

    function _powFrac(uint256 value, uint256 numerator, uint256 denominator) private pure returns(int128) {
        return _powFrac(
            ABDKMath64x64.fromUInt(value),
            ABDKMath64x64.fromUInt(numerator),
            ABDKMath64x64.fromUInt(denominator)
        );
    }

    function _powFrac(int128 value, int128 numerator, int128 denominator) private pure returns(int128) {
        // x^(n/m) = exp2(log2(x)*n/m)
        return ABDKMath64x64.exp_2(ABDKMath64x64.log_2(value).mul(numerator).div(denominator));
    }

    function _getOrCreatePool(uint256 weight0, uint256 weight1) internal returns(MetaswapPool pool) {
        pool = pools[weight0][weight1];
        if (pool == MetaswapPool(0)) {
            pool = new MetaswapPool(token0, token1, weight0, weight1, name, symbol);
            pools[weight0][weight1] = pool;
        }
    }
}
