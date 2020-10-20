const { ether, time, expectRevert } = require('@openzeppelin/test-helpers');
const constants = require('@openzeppelin/test-helpers/src/constants');
const { expect } = require('chai');
const { timeIncreaseTo } = require('../helpers/utils.js');

const Mooniswap = artifacts.require('Mooniswap');
const MooniFactory = artifacts.require('MooniFactory');
const Token = artifacts.require('TokenMock');


contract('MooniswapGovernance', function ([_, wallet1]) {
    beforeEach(async function () {
        this.DAI = await Token.new('DAI', 'DAI', 18);
        this.mooniFactory = await MooniFactory.new(_);
        await this.mooniFactory.deploy(constants.ZERO_ADDRESS, this.DAI.address);
        this.mooniswap = await Mooniswap.at(await this.mooniFactory.pools(constants.ZERO_ADDRESS, this.DAI.address));
        await this.DAI.mint(_, ether('270'));
        await this.DAI.approve(this.mooniswap.address, ether('270'));

        await this.mooniswap.deposit([ether('1'), ether('270')], ['0', '0'], { value: ether('1') });
        expect(await this.mooniswap.balanceOf(_)).to.be.bignumber.equal(ether('270'));
        await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
    });

    describe('fee', async function () {
        it('should correctly vote for fee', async function () {
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('0');
            await this.mooniswap.feeVote(ether('0.1'));
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('99999999999999999');
        });

        it('should reject big fee', async function () {
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('0');
            await expectRevert(
                this.mooniswap.feeVote(ether('0.2')),
                'Fee vote is too high',
            );
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('0');
        });

        it('should discard fee', async function () {
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('0');
            expect(await this.mooniswap.totalSupply()).to.be.bignumber.equal(ether('270').addn(1000));
            await this.mooniswap.feeVote(ether('0.1'));
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('99999999999999999');
            await this.mooniswap.discardFeeVote();
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('0');
        });

        it('should reset fee vote on transfer', async function () {
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('0');
            await this.mooniswap.feeVote(ether('0.1'));
            await this.mooniswap.transfer(wallet1, ether('270'));
            expect(await this.mooniswap.fee()).to.be.bignumber.equal('0');
        });
    });

    describe('decay period', async function () {
        it('should correctly vote for decay period', async function () {
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
            await this.mooniswap.decayPeriodVote('120');
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('120');
        });

        it('should reject big decay period', async function () {
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
            await expectRevert(
                this.mooniswap.decayPeriodVote('4000'),
                'Decay period vote is too high',
            );
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
        });

        it('should reject small decay period', async function () {
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
            await expectRevert(
                this.mooniswap.decayPeriodVote('10'),
                'Decay period vote is too low',
            );
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
        });

        it('should discard decay period', async function () {
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
            await this.mooniswap.decayPeriodVote('120');
            await this.mooniswap.discardDecayPeriodVote();
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
        });

        it('should reset decay period vote on transfer', async function () {
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
            await this.mooniswap.decayPeriodVote('120');
            await this.mooniswap.transfer(wallet1, ether('270'));
            expect(await this.mooniswap.decayPeriod()).to.be.bignumber.equal('300');
        });
    });
});
