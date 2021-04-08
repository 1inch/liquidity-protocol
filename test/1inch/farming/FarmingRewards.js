const { time, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const { takeSnapshot, restoreSnapshot } = require('../../helpers/utils.js');

const Mooniswap = artifacts.require('Mooniswap');
const MooniswapDeployer = artifacts.require('MooniswapDeployer');
const MooniswapFactory = artifacts.require('MooniswapFactory');
const FarmingRewards = artifacts.require('FarmingRewards');
const Token = artifacts.require('TokenMock');
const TokenWithDecimals = artifacts.require('CustomDecimalsTokenMock');

const money = {
    ether,
    eth: ether,
    zero: ether('0'),
    oneWei: ether('0').addn(1),
    weth: ether,
    dai: ether,
};

const DAY = 24 * 3600;
const WEEK = 7 * DAY;

const DECIMALS = 18;

const TOKENS_1 = money.dai('1');
const TOKENS_20 = money.dai('20');
const TOKENS_50 = money.dai('50');
const TOKENS_100 = money.dai('100');
const TOKENS_1000 = money.dai('1000');
const TOKENS_2499 = money.dai('2499');
const TOKENS_4499 = money.dai('4499');
const TOKENS_5000 = money.dai('5000');
const TOKENS_7000 = money.dai('7000');
const TOKENS_7499 = money.dai('7499');
const TOKENS_27500 = money.dai('27500');
const TOKENS_35000 = money.dai('35000');

const roundBy1 = bn => bn.div(TOKENS_1).mul(TOKENS_1);

describe('FarmingRewards', async function () {
    let _, firstNotifier, secondNotifier, liquidityProvider, stakerOne, stakerTwo, randomGuy;

    // Contracts
    let lpToken,
        firstRewardToken,
        secondRewardToken,
        externalRewardToken,
        farmingRewards;

    // Helpers
    let lastSnapshotId;

    beforeEach(async () => {
        /**
         * WARNING: DUE TO SNAPSHOT BEING TAKEN BEFORE EACH TEST CASE, AVOID INHERITED `BEFORE` AND `BEFORE EACH` HOOKS THAT MODIFY STATE
         */
        lastSnapshotId = await takeSnapshot();
    });

    afterEach(async () => {
        await restoreSnapshot(lastSnapshotId);
    });

    before(async () => {
        [_, firstNotifier, secondNotifier, liquidityProvider, stakerOne, stakerTwo, randomGuy] = await web3.eth.getAccounts();

        // Deploy mock tokens
        const token1 = await Token.new('One', 'ONE');
        let token2 = await Token.new('Two', 'TWO');
        while (token2.address.toLowerCase() < token1.address.toLowerCase()) {
            token2 = await Token.new('Two', 'TWO');
        }
        await token1.mint(liquidityProvider, money.dai(TOKENS_100));
        await token2.mint(liquidityProvider, money.dai(TOKENS_100));

        firstRewardToken = await Token.new('FIRST', 'FIRST');
        secondRewardToken = await Token.new('SECOND', 'SECOND');
        externalRewardToken = await Token.new('External Rewards Token', 'MOAR');
        await firstRewardToken.mint(firstNotifier, TOKENS_35000);
        await secondRewardToken.mint(secondNotifier, TOKENS_7000);
        await externalRewardToken.mint(randomGuy, TOKENS_5000);

        // Deploy Mooniswap
        const deployer = await MooniswapDeployer.new();
        const factory = await MooniswapFactory.new(liquidityProvider, deployer.address, liquidityProvider);
        await factory.deploy(token1.address, token2.address);
        lpToken = await Mooniswap.at(await factory.pools(token1.address, token2.address));

        // Fill Mooniswap
        await token1.approve(lpToken.address, TOKENS_100, { from: liquidityProvider });
        await token2.approve(lpToken.address, TOKENS_100, { from: liquidityProvider });

        await lpToken.deposit([TOKENS_100, TOKENS_100], [money.zero, money.zero], { from: liquidityProvider });

        // Deploy FarmingRewards
        farmingRewards = await FarmingRewards.new(
            lpToken.address,
            firstRewardToken.address,
            WEEK,
            firstNotifier,
            ether('1'),
            { from: _ },
        );
    });

    describe('Constructor & Settings', () => {
        it('should properly set initial values', async () => {
            // LP and Farming tokens
            expect(await farmingRewards.mooniswap()).to.be.equal(lpToken.address);
            expect(await farmingRewards.name()).to.be.equal('Farming: 1inch Liquidity Pool (ONE-TWO)');
            expect(await farmingRewards.symbol()).to.be.equal('farm-1LP-ONE-TWO');
            expect(await farmingRewards.decimals()).to.be.bignumber.equal(DECIMALS.toString());

            // Token rewards
            const tokenReward = await farmingRewards.tokenRewards(0);
            expect(tokenReward.gift).to.be.equal(firstRewardToken.address);
            expect(tokenReward.duration).to.be.bignumber.equal(WEEK.toString());
            expect(tokenReward.rewardDistribution).to.be.equal(firstNotifier);
            expect(tokenReward.periodFinish).to.be.bignumber.equal('0');
            expect(tokenReward.rewardRate).to.be.bignumber.equal('0');
            expect(tokenReward.lastUpdateTime).to.be.bignumber.equal('0');
            expect(tokenReward.rewardPerTokenStored).to.be.bignumber.equal('0');
        });

        it('should set owner on constructor', async () => {
            const ownerAddress = await farmingRewards.owner();
            expect(ownerAddress).to.be.equal(_);
        });
    });

    describe('Function permissions', () => {
        it('only notifier can call notifyRewardAmount', async () => {
            const rewardValue = TOKENS_1;
            await firstRewardToken.transfer(farmingRewards.address, rewardValue, { from: firstNotifier });

            await expectRevert(
                farmingRewards.notifyRewardAmount(0, rewardValue, { from: randomGuy }),
                'Access denied',
            );
            await farmingRewards.notifyRewardAmount(0, rewardValue, { from: firstNotifier });
        });

        it('only notifier address can call setDuration', async () => {
            await time.increase(WEEK);
            await expectRevert(
                farmingRewards.setDuration(0, WEEK / 2, { from: randomGuy }),
                'Access denied',
            );
            await farmingRewards.setDuration(0, WEEK / 2, { from: firstNotifier });
        });

        it('only owner address can call setRewardDistribution', async () => {
            await expectRevert(
                farmingRewards.setRewardDistribution(0, randomGuy, { from: randomGuy }),
                'Ownable: caller is not the owner',
            );
            await farmingRewards.setRewardDistribution(0, randomGuy, { from: _ });
        });
    });

    describe('External Rewards Recovery', () => {
        const amount = TOKENS_5000;

        it('only owner can call externalRewardToken', async () => {
            await externalRewardToken.transfer(farmingRewards.address, amount, { from: randomGuy });

            await expectRevert(
                farmingRewards.rescueFunds(externalRewardToken.address, amount, { from: randomGuy }),
                'Ownable: caller is not the owner',
            );
            await farmingRewards.rescueFunds(externalRewardToken.address, amount, { from: _ });
        });

        it('should revert if recovering more staked tokens than totalSupply', async () => {
            // Stake to increase totalSupply()
            const deposit = TOKENS_100;
            await lpToken.approve(farmingRewards.address, deposit, { from: liquidityProvider });
            await farmingRewards.stake(deposit, { from: liquidityProvider });

            await expectRevert(
                farmingRewards.rescueFunds(lpToken.address, deposit, {
                    from: _,
                }),
                'Can\'t withdraw staked tokens',
            );
        });

        it('should recover staked tokens surplus', async () => {
            const tip = TOKENS_1;
            await lpToken.transfer(farmingRewards.address, tip, { from: liquidityProvider });
            await farmingRewards.rescueFunds(lpToken.address, tip, { from: _ });
            expect(await lpToken.balanceOf(_)).to.be.bignumber.equal(tip);
        });

        it('should revert if recovering gift token', async () => {
            await expectRevert(
                farmingRewards.rescueFunds(firstRewardToken.address, amount, {
                    from: _,
                }),
                'Can\'t rescue gift',
            );
        });

        it('should retrieve external token from FarmingRewards, reduce contracts balance and increase owners balance', async () => {
            await externalRewardToken.transfer(farmingRewards.address, amount, { from: randomGuy });

            const ownerMOARBalanceBefore = await externalRewardToken.balanceOf(_);

            await farmingRewards.rescueFunds(externalRewardToken.address, amount, { from: _ });
            const ownerMOARBalanceAfter = await externalRewardToken.balanceOf(_);

            expect(await externalRewardToken.balanceOf(farmingRewards.address)).to.be.bignumber.equal(money.zero);
            expect(ownerMOARBalanceAfter.sub(ownerMOARBalanceBefore)).to.be.bignumber.equal(amount);
        });
    });

    describe('lastTimeRewardApplicable()', () => {
        it('should return 0', async () => {
            expect(await farmingRewards.lastTimeRewardApplicable(0)).to.be.bignumber.equal(money.zero);
        });

        describe('when updated', () => {
            it('should equal current timestamp', async () => {
                const rewardValue = TOKENS_1;
                await firstRewardToken.transfer(farmingRewards.address, rewardValue, { from: firstNotifier });

                await farmingRewards.notifyRewardAmount(0, rewardValue, { from: firstNotifier });

                const cur = await time.latest();
                const lastTimeReward = await farmingRewards.lastTimeRewardApplicable(0);

                expect(cur.toString()).to.be.equal(lastTimeReward.toString());
            });
        });
    });

    describe('rewardPerToken()', () => {
        it('should return 0', async () => {
            expect(await farmingRewards.rewardPerToken(0)).to.be.bignumber.equal(money.zero);
        });

        it('should be > 0', async () => {
            const totalToStake = TOKENS_100;

            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            const totalSupply = await farmingRewards.totalSupply();
            expect(totalSupply).to.be.bignumber.equal(totalToStake);

            const rewardValue = TOKENS_5000;
            await firstRewardToken.transfer(farmingRewards.address, rewardValue, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, rewardValue, {
                from: firstNotifier,
            });

            await time.increase(DAY);

            const rewardPerToken = await farmingRewards.rewardPerToken(0);
            expect(rewardPerToken).to.be.bignumber.greaterThan(money.zero);
        });
    });

    describe('stake()', () => {
        it('staking increases staking balance', async () => {
            const totalToStake = TOKENS_100;
            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });

            const initialStakeBal = await farmingRewards.balanceOf(stakerOne);
            const initialLpBal = await lpToken.balanceOf(stakerOne);

            await farmingRewards.stake(totalToStake, { from: stakerOne });

            const postStakeBal = await farmingRewards.balanceOf(stakerOne);
            const postLpBal = await lpToken.balanceOf(stakerOne);

            expect(postLpBal.add(totalToStake)).to.be.bignumber.equal(initialLpBal);
            expect(postStakeBal.sub(totalToStake)).to.be.bignumber.equal(initialStakeBal);
        });

        it('cannot stake 0', async () => {
            await expectRevert(farmingRewards.stake('0'), 'Cannot stake 0');
        });
    });

    describe('earned()', () => {
        it('should be 0 when not staking', async () => {
            expect(await farmingRewards.earned(0, stakerOne)).to.be.bignumber.equal(money.zero);
        });

        it('should be > 0 when staking', async () => {
            const totalToStake = TOKENS_100;
            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            const rewardValue = TOKENS_5000;
            await firstRewardToken.transfer(farmingRewards.address, rewardValue, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, rewardValue, {
                from: firstNotifier,
            });

            await time.increase(DAY);

            const earned = await farmingRewards.earned(0, stakerOne);

            expect(earned).to.be.bignumber.greaterThan(money.zero);
        });

        it('rewardRate should increase if new rewards come before DURATION ends', async () => {
            const totalToDistribute = TOKENS_5000;

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            const tokenRewardInitial = await farmingRewards.tokenRewards(0);

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            const tokenRewardLater = await farmingRewards.tokenRewards(0);

            expect(tokenRewardInitial.rewardRate).to.be.bignumber.greaterThan(money.zero);
            expect(tokenRewardLater.rewardRate).to.be.bignumber.greaterThan(tokenRewardInitial.rewardRate);
        });

        it('rewards token balance should rollover after DURATION', async () => {
            const totalToStake = TOKENS_100;
            const totalToDistribute = TOKENS_5000;

            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            await time.increase(WEEK);
            const earnedFirst = await farmingRewards.earned(0, stakerOne);

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            await time.increase(WEEK);
            const earnedSecond = await farmingRewards.earned(0, stakerOne);

            expect(earnedSecond).to.be.bignumber.equal(earnedFirst.add(earnedFirst));
        });
    });

    describe('getReward()', () => {
        it('should increase rewards token balance', async () => {
            const totalToStake = TOKENS_100;
            const totalToDistribute = TOKENS_5000;

            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            await time.increase(DAY);

            const initialRewardBal = await firstRewardToken.balanceOf(stakerOne);
            const initialEarnedBal = await farmingRewards.earned(0, stakerOne);
            await farmingRewards.getReward(0, { from: stakerOne });
            const postRewardBal = await firstRewardToken.balanceOf(stakerOne);
            const postEarnedBal = await farmingRewards.earned(0, stakerOne);

            expect(postEarnedBal).to.be.bignumber.lessThan(initialEarnedBal);
            expect(postRewardBal).to.be.bignumber.greaterThan(initialRewardBal);
        });
    });

    describe('setDuration()', () => {
        const seventyDays = DAY * 70;

        it('should increase rewards duration before starting distribution', async () => {
            const tokenReward = await farmingRewards.tokenRewards(0);
            expect(tokenReward.duration).to.be.bignumber.equal(WEEK.toString());

            await farmingRewards.setDuration(0, seventyDays, { from: firstNotifier });
            const newTokenReward = await farmingRewards.tokenRewards(0);
            expect(newTokenReward.duration).to.be.bignumber.equal(seventyDays.toString());
        });

        it('should revert when setting setDuration before the period has finished', async () => {
            const totalToStake = TOKENS_100;
            const totalToDistribute = TOKENS_5000;

            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            await time.increase(DAY);

            await expectRevert(
                farmingRewards.setDuration(0, seventyDays, { from: firstNotifier }),
                'Not finished yet',
            );
        });

        it('should update when setting setDuration after the period has finished', async () => {
            const totalToStake = TOKENS_100;
            const totalToDistribute = TOKENS_5000;

            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            await time.increase(DAY * 8);

            await farmingRewards.setDuration(0, seventyDays, { from: firstNotifier });

            const tokenReward = await farmingRewards.tokenRewards(0);
            expect(tokenReward.duration).to.be.bignumber.equal(seventyDays.toString());
        });
    });

    describe('withdraw()', () => {
        it('cannot withdraw if nothing staked', async () => {
            await expectRevert(farmingRewards.withdraw(TOKENS_100), 'Burn amount exceeds balance');
        });

        it('should increases lp token balance and decreases staking balance', async () => {
            const totalToStake = TOKENS_100;
            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            const initialStakingTokenBal = await lpToken.balanceOf(stakerOne);
            const initialStakeBal = await farmingRewards.balanceOf(stakerOne);

            await farmingRewards.withdraw(totalToStake, { from: stakerOne });

            const postStakingTokenBal = await lpToken.balanceOf(stakerOne);
            const postStakeBal = await farmingRewards.balanceOf(stakerOne);

            expect(postStakeBal.add(totalToStake)).to.be.bignumber.equal(initialStakeBal);
            expect(initialStakingTokenBal.add(totalToStake)).to.be.bignumber.equal(postStakingTokenBal);
        });

        it('cannot withdraw 0', async () => {
            await expectRevert(farmingRewards.withdraw('0'), 'Cannot withdraw 0');
        });
    });

    describe('exit()', () => {
        it('should retrieve all earned and increase rewards bal', async () => {
            const totalToStake = TOKENS_100;
            const totalToDistribute = TOKENS_5000;

            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            await time.increase(DAY);

            const initialRewardBal = await firstRewardToken.balanceOf(stakerOne);
            const initialEarnedBal = await farmingRewards.earned(0, stakerOne);
            await farmingRewards.exit({ from: stakerOne });
            const postRewardBal = await firstRewardToken.balanceOf(stakerOne);
            const postEarnedBal = await farmingRewards.earned(0, stakerOne);

            expect(postEarnedBal).to.be.bignumber.lessThan(initialEarnedBal);
            expect(postEarnedBal).to.be.bignumber.equal(money.zero);
            expect(postRewardBal).to.be.bignumber.greaterThan(initialRewardBal);
        });
    });

    describe('notifyRewardAmount()', () => {
        let localFarmingRewards;

        before(async () => {
            localFarmingRewards = await FarmingRewards.new(
                lpToken.address,
                firstRewardToken.address,
                WEEK,
                firstNotifier,
                ether('1'),
                { from: _ },
            );
        });

        it('Reverts if the provided reward is greater than the balance.', async () => {
            const rewardValue = TOKENS_1000;
            await firstRewardToken.transfer(localFarmingRewards.address, rewardValue, { from: firstNotifier });
            await expectRevert(
                localFarmingRewards.notifyRewardAmount(0, rewardValue.add(TOKENS_1), {
                    from: firstNotifier,
                }),
                'Reward is too big',
            );
        });

        it('Reverts if the provided reward is greater than the balance, plus rolled-over balance.', async () => {
            const rewardValue = TOKENS_1000;
            await firstRewardToken.transfer(localFarmingRewards.address, rewardValue, { from: firstNotifier });
            await localFarmingRewards.notifyRewardAmount(0, rewardValue, {
                from: firstNotifier,
            });
            await firstRewardToken.transfer(localFarmingRewards.address, rewardValue, { from: firstNotifier });
            // Now take into account any leftover quantity.
            await expectRevert(
                localFarmingRewards.notifyRewardAmount(0, rewardValue.add(TOKENS_1), {
                    from: firstNotifier,
                }),
                'Reward is too big',
            );
        });
    });

    describe('Integration Tests', () => {
        it('stake and claim', async () => {
            // Transfer some LP Tokens to user
            const totalToStake = TOKENS_100;
            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });

            // Stake LP Tokens
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            const totalToDistribute = TOKENS_35000;
            // Transfer Rewards to the RewardsDistribution contract address
            await firstRewardToken.transfer(farmingRewards.address, totalToDistribute, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, totalToDistribute, {
                from: firstNotifier,
            });

            // Period finish should be ~7 days from now
            const tokenReward = await farmingRewards.tokenRewards(0);
            const curTimestamp = await time.latest();
            expect(parseInt(tokenReward.periodFinish.toString(), 10), curTimestamp + DAY * 7);

            // Reward duration is 7 days, so we'll
            // Time travel by 6 days to prevent expiration
            await time.increase(DAY * 6);

            // Reward rate and reward per token
            const tokenRewardAfter = await farmingRewards.tokenRewards(0);
            expect(tokenRewardAfter.rewardRate).to.be.bignumber.greaterThan(money.zero);

            const rewardPerToken = await farmingRewards.rewardPerToken(0);
            expect(rewardPerToken).to.be.bignumber.greaterThan(money.zero);

            // Make sure we earned in proportion to reward per token
            const rewardRewardsEarned = await farmingRewards.earned(0, stakerOne);
            expect(rewardRewardsEarned).to.be.bignumber.equal(rewardPerToken.mul(totalToStake).div(TOKENS_1));

            // Make sure after withdrawing, we still have the ~amount of rewardRewards
            // The two values will be a bit different as time has "passed"
            const initialWithdraw = TOKENS_20;
            await farmingRewards.withdraw(initialWithdraw, { from: stakerOne });
            expect(await lpToken.balanceOf(stakerOne)).to.be.bignumber.equal(initialWithdraw);

            const rewardRewardsEarnedPostWithdraw = await farmingRewards.earned(0, stakerOne);
            expect(rewardRewardsEarnedPostWithdraw).to.be.bignumber.greaterThan(money.zero);

            // Get rewards
            const initialRewardBal = await firstRewardToken.balanceOf(stakerOne);
            await farmingRewards.getReward(0, { from: stakerOne });
            const postRewardRewardBal = await firstRewardToken.balanceOf(stakerOne);

            expect(postRewardRewardBal).to.be.bignumber.greaterThan(initialRewardBal);

            // Exit
            const preExitLPBal = await lpToken.balanceOf(stakerOne);
            await farmingRewards.exit({ from: stakerOne });
            const postExitLPBal = await lpToken.balanceOf(stakerOne);
            expect(postExitLPBal).to.be.bignumber.greaterThan(preExitLPBal);
        });
    });

    describe('Second gift integration test', () => {
        it('simultaneous gifts for one staker', async () => {
            await farmingRewards.addGift(secondRewardToken.address, WEEK, secondNotifier, ether('1'), { from: _ });

            // Transfer some LP Tokens to user
            const totalToStake = TOKENS_100;
            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });

            // Stake LP Tokens
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            const firstRewardAmount = TOKENS_35000;
            await firstRewardToken.transfer(farmingRewards.address, firstRewardAmount, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, firstRewardAmount, {
                from: firstNotifier,
            });

            const secondRewardAmount = TOKENS_7000;
            await secondRewardToken.transfer(farmingRewards.address, secondRewardAmount, { from: secondNotifier });
            await farmingRewards.notifyRewardAmount(1, secondRewardAmount, {
                from: secondNotifier,
            });

            const start = (await time.latest()).add(time.duration.seconds(10));

            await time.increaseTo(start.add(time.duration.days(1)));

            const firstRewardRewardsEarned = await farmingRewards.earned(0, stakerOne);
            expect(roundBy1(firstRewardRewardsEarned)).to.be.bignumber.equal(TOKENS_5000);

            const secondRewardRewardsEarned = await farmingRewards.earned(1, stakerOne);
            expect(roundBy1(secondRewardRewardsEarned)).to.be.bignumber.equal(TOKENS_1000);

            const firstRewardBalBefore = await firstRewardToken.balanceOf(stakerOne);
            const secondRewardBalBefore = await secondRewardToken.balanceOf(stakerOne);
            const preExitLPBal = await lpToken.balanceOf(stakerOne);
            await farmingRewards.exit({ from: stakerOne });
            const firstRewardBalAfter = await firstRewardToken.balanceOf(stakerOne);
            const secondRewardBalAfter = await secondRewardToken.balanceOf(stakerOne);
            const postExitLPBal = await lpToken.balanceOf(stakerOne);

            expect(roundBy1(firstRewardBalAfter).sub(TOKENS_5000)).to.be.bignumber.equal(firstRewardBalBefore);
            expect(roundBy1(secondRewardBalAfter).sub(TOKENS_1000)).to.be.bignumber.equal(secondRewardBalBefore);
            expect(postExitLPBal.sub(totalToStake)).to.be.bignumber.equal(preExitLPBal);
        });

        it('one gift after another for two stakers', async () => {
            // FIRST REWARD = 35k for 1w
            // 1x: +--------------+ = 20k for 4d + 7.5k for 3d = 27.5k
            // 1x:         +------+ =  0k for 4d + 7.5k for 3d =  7.5k
            //
            // SECOND REWARD = 7k for 1w (after 2 days)
            // 1x:     +--------------+ = 2k for 2d + 2.5k for 5d = 4.5k
            // 1x:         +----------+ = 0k for 2d + 2.5k for 5d = 2.5k
            //

            await farmingRewards.addGift(secondRewardToken.address, WEEK, secondNotifier, ether('1'), { from: _ });

            // Transfer some LP Tokens to stakers
            const totalToStake = TOKENS_50;
            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });
            await lpToken.transfer(stakerTwo, totalToStake, { from: liquidityProvider });

            // Stake LP Tokens from staker #1
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerOne });
            await farmingRewards.stake(totalToStake, { from: stakerOne });

            // Notify first reward
            const firstRewardAmount = TOKENS_35000;
            await firstRewardToken.transfer(farmingRewards.address, firstRewardAmount, { from: firstNotifier });
            await farmingRewards.notifyRewardAmount(0, firstRewardAmount, {
                from: firstNotifier,
            });

            const start = (await time.latest()).add(time.duration.seconds(10));

            await time.increaseTo(start.add(time.duration.days(2)));

            // TODO: CHECKS

            const secondRewardAmount = TOKENS_7000;
            await secondRewardToken.transfer(farmingRewards.address, secondRewardAmount, { from: secondNotifier });
            await farmingRewards.notifyRewardAmount(1, secondRewardAmount, {
                from: secondNotifier,
            });

            // TODO: CHECKS

            await time.increaseTo(start.add(time.duration.days(4)));

            // TODO: CHECKS

            // Stake LP Tokens from staker #2
            await lpToken.approve(farmingRewards.address, totalToStake, { from: stakerTwo });
            await farmingRewards.stake(totalToStake, { from: stakerTwo });

            await time.increaseTo(start.add(time.duration.days(9)));

            // TODO: CHECKS

            const firstRewardRewardsEarnedOne = await farmingRewards.earned(0, stakerOne);
            const firstRewardRewardsEarnedTwo = await farmingRewards.earned(0, stakerTwo);
            expect(roundBy1(firstRewardRewardsEarnedOne)).to.be.bignumber.equal(TOKENS_27500);
            expect(roundBy1(firstRewardRewardsEarnedTwo)).to.be.bignumber.equal(TOKENS_7499);

            const secondRewardRewardsEarnedOne = await farmingRewards.earned(1, stakerOne);
            const secondRewardRewardsEarnedTwo = await farmingRewards.earned(1, stakerTwo);
            expect(roundBy1(secondRewardRewardsEarnedOne)).to.be.bignumber.equal(TOKENS_4499);
            expect(roundBy1(secondRewardRewardsEarnedTwo)).to.be.bignumber.equal(TOKENS_2499);

            const firstRewardBalBefore = await firstRewardToken.balanceOf(stakerOne);
            const secondRewardBalBefore = await secondRewardToken.balanceOf(stakerOne);
            const preExitLPBal = await lpToken.balanceOf(stakerOne);
            await farmingRewards.exit({ from: stakerOne });
            const firstRewardBalAfter = await firstRewardToken.balanceOf(stakerOne);
            const secondRewardBalAfter = await secondRewardToken.balanceOf(stakerOne);
            const postExitLPBal = await lpToken.balanceOf(stakerOne);

            expect(roundBy1(firstRewardBalAfter).sub(TOKENS_27500)).to.be.bignumber.equal(firstRewardBalBefore);
            expect(roundBy1(secondRewardBalAfter).sub(TOKENS_4499)).to.be.bignumber.equal(secondRewardBalBefore);
            expect(postExitLPBal.sub(totalToStake)).to.be.bignumber.equal(preExitLPBal);
        });
    });

    describe('low decimals', () => {
        let localFarmingRewards;
        let lowDecimalsToken;
        const EXPECTED_REWARD_RATE = '1653439153439153439153439153439153439';
        const EXPECTED_REWARD_RATE_PER_TOKEN_STORED = '16534391534391534';

        before(async () => {
            lowDecimalsToken = await TokenWithDecimals.new('Low', 'LOW', 8);
            await lowDecimalsToken.mint(firstNotifier, TOKENS_35000);
            localFarmingRewards = await FarmingRewards.new(
                lpToken.address,
                lowDecimalsToken.address,
                WEEK,
                firstNotifier,
                ether('10000000000'),
                { from: _ },
            );
            // Transfer some LP Tokens to user
            const totalToStake = TOKENS_100;
            await lpToken.transfer(stakerOne, totalToStake, { from: liquidityProvider });

            // Stake LP Tokens
            await lpToken.approve(localFarmingRewards.address, totalToStake, { from: stakerOne });
            await localFarmingRewards.stake(totalToStake, { from: stakerOne });
        });

        it('Should properly scale', async () => {
            const rewardValue = '100000000000000';
            await lowDecimalsToken.transfer(localFarmingRewards.address, rewardValue, { from: firstNotifier });
            await localFarmingRewards.notifyRewardAmount(0, rewardValue, { from: firstNotifier });
            let rewardInfo = await localFarmingRewards.tokenRewards(0);
            expect(rewardInfo.rewardRate).to.be.bignumber.equal(EXPECTED_REWARD_RATE);
            await localFarmingRewards.notifyRewardAmount(0, '0', { from: firstNotifier });
            rewardInfo = await localFarmingRewards.tokenRewards(0);
            expect(rewardInfo.rewardPerTokenStored).to.be.bignumber.equal(EXPECTED_REWARD_RATE_PER_TOKEN_STORED);
        });

        it('Should work with decimals=1', async () => {
            const oneDecimalToken = await TokenWithDecimals.new('One', 'ONE', 1);
            await oneDecimalToken.mint(firstNotifier, TOKENS_35000);
            const rewardValue = '10000000';
            await localFarmingRewards.addGift(oneDecimalToken.address, WEEK, firstNotifier, ether('1').mul(ether('1')).divn(10), { from: _ });
            await oneDecimalToken.transfer(localFarmingRewards.address, rewardValue, { from: firstNotifier });
            await localFarmingRewards.notifyRewardAmount(1, rewardValue, { from: firstNotifier });
            let rewardInfo = await localFarmingRewards.tokenRewards(1);
            expect(rewardInfo.rewardRate).to.be.bignumber.equal(EXPECTED_REWARD_RATE);
            await localFarmingRewards.notifyRewardAmount(1, '0', { from: firstNotifier });
            rewardInfo = await localFarmingRewards.tokenRewards(1);
            expect(rewardInfo.rewardPerTokenStored).to.be.bignumber.equal(EXPECTED_REWARD_RATE_PER_TOKEN_STORED);
        });

        it('Should work with decimals=0', async () => {
            const oneDecimalToken = await TokenWithDecimals.new('Zero', '0', 0);
            await oneDecimalToken.mint(firstNotifier, TOKENS_35000);
            const rewardValue = '1000000';
            await localFarmingRewards.addGift(oneDecimalToken.address, WEEK, firstNotifier, ether('1').mul(ether('1')), { from: _ });
            await oneDecimalToken.transfer(localFarmingRewards.address, rewardValue, { from: firstNotifier });
            await localFarmingRewards.notifyRewardAmount(1, rewardValue, { from: firstNotifier });
            let rewardInfo = await localFarmingRewards.tokenRewards(1);
            expect(rewardInfo.rewardRate).to.be.bignumber.equal(EXPECTED_REWARD_RATE);
            await localFarmingRewards.notifyRewardAmount(1, '0', { from: firstNotifier });
            rewardInfo = await localFarmingRewards.tokenRewards(1);
            expect(rewardInfo.rewardPerTokenStored).to.be.bignumber.equal(EXPECTED_REWARD_RATE_PER_TOKEN_STORED);
        });
    });
});
