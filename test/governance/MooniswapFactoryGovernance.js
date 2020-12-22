const { ether, time, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { timeIncreaseTo } = require('../helpers/utils.js');

const MooniswapFactoryGovernance = artifacts.require('MooniswapFactoryGovernance');

contract('MooniswapFactoryGovernance', function ([_, wallet1, wallet2, wallet3]) {
    beforeEach(async function () {
        this.mooniswapFactoryGovernance = await MooniswapFactoryGovernance.new(_);
        await this.mooniswapFactoryGovernance.notifyStakeChanged(_, ether('1'));
        await this.mooniswapFactoryGovernance.notifyStakeChanged(wallet3, ether('1'));
    });

    describe('fee', async function () {
        it('should correctly vote for fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.01'));
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.01'));
        });

        it('should reject big fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await expectRevert(
                this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.2')),
                'Fee vote is too high',
            );
        });

        it('should discard fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.01'));
            await this.mooniswapFactoryGovernance.discardDefaultFeeVote();
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
        });

        it('should reset fee vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.01'));
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
        });
    });

    describe('slippage fee', async function () {
        it('should correctly vote for slippage fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('1'));
            await this.mooniswapFactoryGovernance.defaultSlippageFeeVote(ether('0.5'));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('1'));
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('0.5'));
        });

        it('should reject big slippage fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('1'));
            await expectRevert(
                this.mooniswapFactoryGovernance.defaultSlippageFeeVote(ether('2')),
                'Slippage fee vote is too high',
            );
        });

        it('should discard slippage fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('1'));
            await this.mooniswapFactoryGovernance.defaultSlippageFeeVote(ether('0.5'));
            await this.mooniswapFactoryGovernance.discardDefaultSlippageFeeVote();
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('1'));
        });

        it('should reset slippage fee vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('1'));
            await this.mooniswapFactoryGovernance.defaultSlippageFeeVote(ether('0.5'));
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('1'));
        });
    });

    describe('decay period', async function () {
        it('should correctly vote for decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120');
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('120');
        });

        it('should reject big decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
            await expectRevert(
                this.mooniswapFactoryGovernance.defaultDecayPeriodVote('4000'),
                'Decay period vote is too high',
            );
        });

        it('should reject small decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
            await expectRevert(
                this.mooniswapFactoryGovernance.defaultDecayPeriodVote('10'),
                'Decay period vote is too low',
            );
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
        });

        it('should discard decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120');
            await this.mooniswapFactoryGovernance.discardDefaultDecayPeriodVote();
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
        });

        it('should reset decay period vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120');
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
        });
    });

    describe('referral share', async function () {
        it('should correctly vote for referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.05'));
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
        });

        it('should reject big referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
            await expectRevert(
                this.mooniswapFactoryGovernance.referralShareVote(ether('0.4')),
                'Referral share vote is too high',
            );
        });

        it('should reject small referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
            await expectRevert(
                this.mooniswapFactoryGovernance.referralShareVote('10000'),
                'Referral share vote is too low',
            );
        });

        it('should discard referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.05'));
            await this.mooniswapFactoryGovernance.discardReferralShareVote();
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reset referral share vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.05'));
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
        });
    });

    describe('governance share', async function () {
        it('should correctly vote for governance share', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.1'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reject big governance share', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await expectRevert(
                this.mooniswapFactoryGovernance.governanceShareVote(ether('0.4')),
                'Gov share vote is too high',
            );
        });

        it('should discard governance share', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.1'));
            await this.mooniswapFactoryGovernance.discardGovernanceShareVote();
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
        });

        it('should reset governance share vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.1'));
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            await timeIncreaseTo((await time.latest()).addn(86500));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
        });
    });

    describe('multi-user', async function () {
        it('3 users', async function () {
            await this.mooniswapFactoryGovernance.notifyStakeChanged(wallet1, ether('1'));
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.006'), { from: wallet1 });
            await this.mooniswapFactoryGovernance.defaultSlippageFeeVote(ether('0.5'), { from: wallet1 });
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120', { from: wallet1 });
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.06'), { from: wallet1 });
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.1'), { from: wallet1 });

            await this.mooniswapFactoryGovernance.notifyStakeChanged(wallet2, ether('1'));
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.003'), { from: wallet2 });
            await this.mooniswapFactoryGovernance.defaultSlippageFeeVote(ether('0.6'), { from: wallet2 });
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('60', { from: wallet2 });
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.07'), { from: wallet2 });
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.09'), { from: wallet2 });

            await timeIncreaseTo((await time.latest()).addn(86500));

            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.0045'));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('0.55'));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('90');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.065'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.095'));

            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.009'));
            await this.mooniswapFactoryGovernance.defaultSlippageFeeVote(ether('0.4'));
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('300');
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.08'));
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.05'));

            await timeIncreaseTo((await time.latest()).addn(86500));

            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.006'));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('0.5'));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('160');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.07'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.08'));

            await this.mooniswapFactoryGovernance.notifyStakeChanged(wallet1, '0');

            await timeIncreaseTo((await time.latest()).addn(86500));

            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.006'));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('0.5'));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('180');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.075'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.07'));

            await this.mooniswapFactoryGovernance.discardDefaultFeeVote();
            await this.mooniswapFactoryGovernance.discardDefaultSlippageFeeVote();
            await this.mooniswapFactoryGovernance.discardDefaultDecayPeriodVote();
            await this.mooniswapFactoryGovernance.discardReferralShareVote();
            await this.mooniswapFactoryGovernance.discardGovernanceShareVote();

            await timeIncreaseTo((await time.latest()).addn(86500));

            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.003'));
            expect(await this.mooniswapFactoryGovernance.defaultSlippageFee()).to.be.bignumber.equal(ether('0.6'));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('60');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.07'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.09'));
        });
    });
});
