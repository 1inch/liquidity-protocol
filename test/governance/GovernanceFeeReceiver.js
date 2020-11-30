const { ether, time } = require('@openzeppelin/test-helpers');
const constants = require('@openzeppelin/test-helpers/src/constants');
const { expect } = require('chai');
const { trackReceivedToken, timeIncreaseTo } = require('../helpers/utils.js');

const Mooniswap = artifacts.require('Mooniswap');
const MooniswapDeployer = artifacts.require('MooniswapDeployer');
const MooniswapFactory = artifacts.require('MooniswapFactory');
const GovernanceFeeReceiver = artifacts.require('GovernanceFeeReceiver');
const Rewards = artifacts.require('Rewards');
const TokenMock = artifacts.require('TokenMock');

contract('GovernanceFeeReceiver', function ([wallet1, wallet2]) {
    beforeEach(async function () {
        this.DAI = await TokenMock.new('DAI', 'DAI', 18);
        this.token = await TokenMock.new('INCH', 'INCH', 18);
        this.deployer = await MooniswapDeployer.new();
        this.factory = await MooniswapFactory.new(wallet1, this.deployer.address, wallet1);
        this.rewards = await Rewards.new(this.token.address, wallet1);
        this.feeReceiver = await GovernanceFeeReceiver.new(this.token.address, this.rewards.address, this.factory.address);
        await this.rewards.setRewardDistribution(this.feeReceiver.address);
        await this.feeReceiver.updatePathWhitelist(constants.ZERO_ADDRESS, true);

        await this.factory.setGovernanceFeeReceiver(this.feeReceiver.address);
        this.factory.notifyStakeChanged(wallet1, '1');
        this.rewards.notifyStakeChanged(wallet1, '1');
        await this.factory.defaultFeeVote(ether('0.1'));
        expect(await this.factory.defaultFee()).to.be.bignumber.equal('0');
        await timeIncreaseTo((await time.latest()).addn(86500));
        expect(await this.factory.defaultFee()).to.be.bignumber.equal(ether('0.1'));
        await this.factory.governanceShareVote(ether('0.25'));
        expect(await this.factory.governanceShare()).to.be.bignumber.equal('0');
        await timeIncreaseTo((await time.latest()).addn(86500));
        expect(await this.factory.governanceShare()).to.be.bignumber.equal(ether('0.25'));

        await this.factory.deploy(constants.ZERO_ADDRESS, this.DAI.address);
        this.mooniswap = await Mooniswap.at(await this.factory.pools(constants.ZERO_ADDRESS, this.DAI.address));

        await this.factory.deploy(constants.ZERO_ADDRESS, this.token.address);
        this.tokenMooniswap = await Mooniswap.at(await this.factory.pools(constants.ZERO_ADDRESS, this.token.address));

        await this.DAI.mint(wallet1, ether('270'));
        await this.DAI.approve(this.mooniswap.address, ether('270'));
        await this.mooniswap.deposit([ether('1'), ether('270')], ['0', '0'], { value: ether('1'), from: wallet1 });

        await this.token.mint(wallet1, ether('100'));
        await this.token.approve(this.tokenMooniswap.address, ether('100'));
        await this.tokenMooniswap.deposit([ether('1'), ether('100')], ['0', '0'], { value: ether('1'), from: wallet1 });

        await timeIncreaseTo((await time.latest()).addn(86500));
    });

    describe('test', async function () {
        it('test', async function () {
            await this.mooniswap.swap(constants.ZERO_ADDRESS, this.DAI.address, ether('1'), '0', constants.ZERO_ADDRESS, { value: ether('1'), from: wallet2 });
            await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
            await this.feeReceiver.unwrapLPTokens(this.mooniswap.address);
            await this.feeReceiver.swap([constants.ZERO_ADDRESS, this.token.address]);
            await this.feeReceiver.swap([this.DAI.address, constants.ZERO_ADDRESS, this.token.address]);
            await timeIncreaseTo((await time.latest()).add((await this.rewards.DURATION()).divn(2)));
            expect(await this.rewards.earned(wallet1)).to.be.bignumber.equal('889046414196468429');
            await timeIncreaseTo((await time.latest()).add(await this.rewards.DURATION()).addn(10000));
            expect(await this.rewards.earned(wallet1)).to.be.bignumber.equal('1778086948475779200');

            const received = await trackReceivedToken(
                this.token,
                wallet1,
                () => this.rewards.getReward(),
            );
            expect(received).to.be.bignumber.equal('1778086948475779200');
            expect(await this.rewards.earned(wallet1)).to.be.bignumber.equal('0');
        });
    });
});
