// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IFeeCollector.sol";
import "./libraries/SafeERC20.sol";
import "./libraries/Sqrt.sol";
import "./libraries/VirtualBalance.sol";
import "./governance/MooniswapGovernance.sol";


contract Mooniswap is MooniswapGovernance {
    using Sqrt for uint256;
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using VirtualBalance for VirtualBalance.Data;

    struct Balances {
        uint256 src;
        uint256 dst;
    }

    struct Fees {
        uint256 fee;
        uint256 slippageFee;
    }

    event Error(string reason);

    event Deposited(
        address indexed sender,
        address indexed receiver,
        uint256 share,
        uint256 token0Amount,
        uint256 token1Amount
    );

    event Withdrawn(
        address indexed sender,
        address indexed receiver,
        uint256 share,
        uint256 token0Amount,
        uint256 token1Amount
    );

    event Swapped(
        address indexed sender,
        address indexed receiver,
        address indexed srcToken,
        address dstToken,
        uint256 amount,
        uint256 result,
        uint256 srcAdditionBalance,
        uint256 dstRemovalBalance,
        address referral
    );

    event Sync(
        uint256 srcBalance,
        uint256 dstBalance,
        uint256 fee,
        uint256 slippageFee,
        uint256 referralShare,
        uint256 governanceShare
    );

    uint256 private constant _BASE_SUPPLY = 1000;  // Total supply on first deposit

    IERC20 public token0;
    IERC20 public token1;
    mapping(IERC20 => VirtualBalance.Data) public virtualBalancesForAddition;
    mapping(IERC20 => VirtualBalance.Data) public virtualBalancesForRemoval;

    string private _name;
    string private _symbol;

    modifier whenNotShutdown {
        require(mooniswapFactoryGovernance.isActive(), "Mooniswap: factory shutdown");
        _;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    constructor(string memory name_, string memory symbol_) public ERC20(name_, symbol_) {
        require(bytes(name_).length > 0, "Mooniswap: name is empty");
        require(bytes(symbol_).length > 0, "Mooniswap: symbol is empty");
        _name = name_;
        _symbol = symbol_;
    }

    function init(
        IERC20 token0_,
        IERC20 token1_,
        string memory name_,
        string memory symbol_,
        IMooniswapFactoryGovernance _mooniswapFactoryGovernance
    ) external {
        require(bytes(name_).length > 0, "Mooniswap: name is empty");
        require(bytes(symbol_).length > 0, "Mooniswap: symbol is empty");
        require(token0_ != token1_, "Mooniswap: duplicate tokens");
        token0 = token0_;
        token1 = token1_;
        _name = name_;
        _symbol = symbol_;
        _init(_mooniswapFactoryGovernance);
    }

    function getTokens() external view returns(IERC20[] memory tokens) {
        tokens = new IERC20[](2);
        tokens[0] = token0;
        tokens[1] = token1;
    }

    function tokens(uint256 i) external view returns(IERC20) {
        if (i == 0) {
            return token0;
        } else if (i == 1) {
            return token1;
        } else {
            revert("Pool has two tokens");
        }
    }

    function getBalanceForAddition(IERC20 token) public view returns(uint256) {
        uint256 balance = token.balanceOf(address(this));
        return Math.max(virtualBalancesForAddition[token].current(balance), balance);
    }

    function getBalanceForRemoval(IERC20 token) public view returns(uint256) {
        uint256 balance = token.balanceOf(address(this));
        return Math.min(virtualBalancesForRemoval[token].current(balance), balance);
    }

    function getReturn(IERC20 src, IERC20 dst, uint256 amount) external view returns(uint256) {
        return _getReturn(src, dst, amount, getBalanceForAddition(src), getBalanceForRemoval(dst), fee(), slippageFee());
    }

    function deposit(uint256[2] memory maxAmounts, uint256[2] memory minAmounts) external returns(uint256 fairSupply, uint256[2] memory receivedAmounts) {
        return depositFor(maxAmounts, minAmounts, msg.sender);
    }

    function depositFor(uint256[2] memory maxAmounts, uint256[2] memory minAmounts, address target) public nonReentrant returns(uint256 fairSupply, uint256[2] memory receivedAmounts) {
        IERC20[2] memory _tokens = [token0, token1];

        uint256 totalSupply = totalSupply();

        if (totalSupply == 0) {
            fairSupply = _BASE_SUPPLY.mul(99);
            _mint(address(this), _BASE_SUPPLY); // Donate up to 1%

            for (uint i = 0; i < maxAmounts.length; i++) {
                fairSupply = Math.max(fairSupply, maxAmounts[i]);

                require(maxAmounts[i] > 0, "Mooniswap: amount is zero");
                require(maxAmounts[i] >= minAmounts[i], "Mooniswap: minAmount not reached");

                _tokens[i].safeTransferFrom(msg.sender, address(this), maxAmounts[i]);
                receivedAmounts[i] = maxAmounts[i];
            }
        }
        else {
            uint256[2] memory realBalances;
            for (uint i = 0; i < realBalances.length; i++) {
                realBalances[i] = _tokens[i].balanceOf(address(this));
            }

            // Pre-compute fair supply
            fairSupply = type(uint256).max;
            for (uint i = 0; i < maxAmounts.length; i++) {
                fairSupply = Math.min(fairSupply, totalSupply.mul(maxAmounts[i]).div(realBalances[i]));
            }

            uint256 fairSupplyCached = fairSupply;

            for (uint i = 0; i < maxAmounts.length; i++) {
                require(maxAmounts[i] > 0, "Mooniswap: amount is zero");
                uint256 amount = realBalances[i].mul(fairSupplyCached).add(totalSupply - 1).div(totalSupply);
                require(amount >= minAmounts[i], "Mooniswap: minAmount not reached");

                _tokens[i].safeTransferFrom(msg.sender, address(this), amount);
                receivedAmounts[i] = _tokens[i].balanceOf(address(this)).sub(realBalances[i]);
                fairSupply = Math.min(fairSupply, totalSupply.mul(receivedAmounts[i]).div(realBalances[i]));
            }

            for (uint i = 0; i < maxAmounts.length; i++) {
                virtualBalancesForRemoval[_tokens[i]].scale(realBalances[i], totalSupply.add(fairSupply), totalSupply);
                virtualBalancesForAddition[_tokens[i]].scale(realBalances[i], totalSupply.add(fairSupply), totalSupply);
            }
        }

        require(fairSupply > 0, "Mooniswap: result is not enough");
        _mint(target, fairSupply);

        emit Deposited(msg.sender, target, fairSupply, receivedAmounts[0], receivedAmounts[1]);
    }

    function withdraw(uint256 amount, uint256[] memory minReturns) external returns(uint256[2] memory withdrawnAmounts) {
        return withdrawFor(amount, minReturns, msg.sender);
    }

    function withdrawFor(uint256 amount, uint256[] memory minReturns, address target) public nonReentrant returns(uint256[2] memory withdrawnAmounts) {
        IERC20[2] memory _tokens = [token0, token1];

        uint256 totalSupply = totalSupply();
        _burn(msg.sender, amount);

        for (uint i = 0; i < _tokens.length; i++) {
            IERC20 token = _tokens[i];

            uint256 preBalance = token.balanceOf(address(this));
            uint256 value = preBalance.mul(amount).div(totalSupply);
            token.safeTransfer(target, value);
            withdrawnAmounts[i] = value;
            require(i >= minReturns.length || value >= minReturns[i], "Mooniswap: result is not enough");

            virtualBalancesForAddition[token].scale(preBalance, totalSupply.sub(amount), totalSupply);
            virtualBalancesForRemoval[token].scale(preBalance, totalSupply.sub(amount), totalSupply);
        }

        emit Withdrawn(msg.sender, target, amount, withdrawnAmounts[0], withdrawnAmounts[1]);
    }

    function swap(IERC20 src, IERC20 dst, uint256 amount, uint256 minReturn, address referral) external returns(uint256 result) {
        return swapFor(src, dst, amount, minReturn, referral, msg.sender);
    }

    function swapFor(IERC20 src, IERC20 dst, uint256 amount, uint256 minReturn, address referral, address receiver) public nonReentrant whenNotShutdown returns(uint256 result) {
        Balances memory balances = Balances({
            src: src.balanceOf(address(this)),
            dst: dst.balanceOf(address(this))
        });
        uint256 confirmed;
        Balances memory virtualBalances;
        Fees memory fees = Fees({
            fee: fee(),
            slippageFee: slippageFee()
        });
        (confirmed, result, virtualBalances) = _doTransfers(src, dst, amount, minReturn, receiver, balances, fees);
        emit Swapped(msg.sender, receiver, address(src), address(dst), confirmed, result, virtualBalances.src, virtualBalances.dst, referral);
        _mintRewards(confirmed, result, referral, balances, fees);
    }

    function _doTransfers(IERC20 src, IERC20 dst, uint256 amount, uint256 minReturn, address receiver, Balances memory balances, Fees memory fees)
        private returns(uint256 confirmed, uint256 result, Balances memory virtualBalances)
    {
        virtualBalances.src = virtualBalancesForAddition[src].current(balances.src);
        virtualBalances.src = Math.max(virtualBalances.src, balances.src);
        virtualBalances.dst = virtualBalancesForRemoval[dst].current(balances.dst);
        virtualBalances.dst = Math.min(virtualBalances.dst, balances.dst);
        src.safeTransferFrom(msg.sender, address(this), amount);
        confirmed = src.balanceOf(address(this)).sub(balances.src);
        result = _getReturn(src, dst, confirmed, virtualBalances.src, virtualBalances.dst, fees.fee, fees.slippageFee);
        require(result > 0 && result >= minReturn, "Mooniswap: return is not enough");
        dst.safeTransfer(receiver, result);

        // Update virtual balances to the same direction only at imbalanced state
        if (virtualBalances.src != balances.src) {
            virtualBalancesForAddition[src].set(virtualBalances.src.add(confirmed));
        }
        if (virtualBalances.dst != balances.dst) {
            virtualBalancesForRemoval[dst].set(virtualBalances.dst.sub(result));
        }
        // Update virtual balances to the opposite direction
        virtualBalancesForRemoval[src].update(balances.src);
        virtualBalancesForAddition[dst].update(balances.dst);
    }

    function _mintRewards(uint256 confirmed, uint256 result, address referral, Balances memory balances, Fees memory fees) private {
        (uint256 referralShare, uint256 governanceShare, address govWallet, address feeCollector) = mooniswapFactoryGovernance.shareParameters();

        uint256 refReward;
        uint256 govReward;

        uint256 invariantRatio = uint256(1e36);
        invariantRatio = invariantRatio.mul(balances.src.add(confirmed)).div(balances.src);
        invariantRatio = invariantRatio.mul(balances.dst.sub(result)).div(balances.dst);
        if (invariantRatio > 1e36) {
            // calculate share only if invariant increased
            invariantRatio = invariantRatio.sqrt();
            uint256 invIncrease = totalSupply().mul(invariantRatio.sub(1e18)).div(invariantRatio);

            refReward = (referral != address(0)) ? invIncrease.mul(referralShare).div(MooniswapConstants._FEE_DENOMINATOR) : 0;
            govReward = (govWallet != address(0)) ? invIncrease.mul(governanceShare).div(MooniswapConstants._FEE_DENOMINATOR) : 0;

            if (feeCollector == address(0)) {
                if (refReward > 0) {
                    _mint(referral, refReward);
                }
                if (govReward > 0) {
                    _mint(govWallet, govReward);
                }
            }
            else if (refReward > 0 || govReward > 0) {
                uint256 len = (refReward > 0 ? 1 : 0) + (govReward > 0 ? 1 : 0);
                address[] memory wallets = new address[](len);
                uint256[] memory rewards = new uint256[](len);

                wallets[0] = referral;
                rewards[0] = refReward;
                if (govReward > 0) {
                    wallets[len - 1] = govWallet;
                    rewards[len - 1] = govReward;
                }

                try IFeeCollector(feeCollector).updateRewards(wallets, rewards) {
                    _mint(feeCollector, refReward.add(govReward));
                }
                catch {
                    emit Error("updateRewards() failed");
                }
            }
        }

        emit Sync(balances.src, balances.dst, fees.fee, fees.slippageFee, refReward, govReward);
    }

    /*
        spot_ret = dx * y / x
        uni_ret = dx * y / (x + dx)
        slippage = (spot_ret - uni_ret) / spot_ret
        slippage = dx * dx * y / (x * (x + dx)) / (dx * y / x)
        slippage = dx / (x + dx)
        ret = uni_ret * (1 - slip_fee * slippage)
        ret = dx * y / (x + dx) * (1 - slip_fee * dx / (x + dx))
        ret = dx * y / (x + dx) * (x + dx - slip_fee * dx) / (x + dx)

        x = amount * denominator
        dx = amount * (denominator - fee)
    */
    function _getReturn(IERC20 src, IERC20 dst, uint256 amount, uint256 srcBalance, uint256 dstBalance, uint256 fee, uint256 slippageFee) internal view returns(uint256) {
        if (src > dst) {
            (src, dst) = (dst, src);
        }
        if (amount > 0 && src == token0 && dst == token1) {
            uint256 taxedAmount = amount.sub(amount.mul(fee).div(MooniswapConstants._FEE_DENOMINATOR));
            uint256 srcBalancePlusTaxedAmount = srcBalance.add(taxedAmount);
            uint256 ret = taxedAmount.mul(dstBalance).div(srcBalancePlusTaxedAmount);
            uint256 feeNumerator = MooniswapConstants._FEE_DENOMINATOR.mul(srcBalancePlusTaxedAmount).sub(slippageFee.mul(taxedAmount));
            uint256 feeDenominator = MooniswapConstants._FEE_DENOMINATOR.mul(srcBalancePlusTaxedAmount);
            return ret.mul(feeNumerator).div(feeDenominator);
        }
    }
}
