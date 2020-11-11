const { ether, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const MooniswapFactoryGovernance = artifacts.require('MooniswapFactoryGovernance');

contract('MooniswapFactoryGovernance', function ([_, wallet1, wallet2]) {
    beforeEach(async function () {
        this.mooniswapFactoryGovernance = await MooniswapFactoryGovernance.new(_);
        await this.mooniswapFactoryGovernance.notifyStakeChanged(_, ether('1'));
    });

    describe('fee', async function () {
        it('should correctly vote for fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.1'));
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reject big fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await expectRevert(
                this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.2')),
                'Fee vote is too high',
            );
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
        });

        it('should discard fee', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.1'));
            await this.mooniswapFactoryGovernance.discardDefaultFeeVote();
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
        });

        it('should reset fee vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.1'));
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal('0');
        });
    });

    describe('decay period', async function () {
        it('should correctly vote for decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120');
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('120');
        });

        it('should reject big decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
            await expectRevert(
                this.mooniswapFactoryGovernance.defaultDecayPeriodVote('4000'),
                'Decay period vote is too high',
            );
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
        });

        it('should reject small decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
            await expectRevert(
                this.mooniswapFactoryGovernance.defaultDecayPeriodVote('10'),
                'Decay period vote is too low',
            );
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
        });

        it('should discard decay period', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120');
            await this.mooniswapFactoryGovernance.discardDefaultDecayPeriodVote();
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
        });

        it('should reset decay period vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120');
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('300');
        });
    });

    describe('referral share', async function () {
        it('should correctly vote for referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.1'));
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reject big referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await expectRevert(
                this.mooniswapFactoryGovernance.referralShareVote(ether('0.4')),
                'Referral share vote is too high',
            );
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
        });

        it('should reject small referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await expectRevert(
                this.mooniswapFactoryGovernance.referralShareVote('10000'),
                'Referral share vote is too low',
            );
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
        });

        it('should discard referral share', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.2'));
            await this.mooniswapFactoryGovernance.discardReferralShareVote();
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
        });

        it('should reset referral share vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.2'));
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
        });
    });

    describe('governance share', async function () {
        it('should correctly vote for governance share', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.1'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reject big governance share', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await expectRevert(
                this.mooniswapFactoryGovernance.governanceShareVote(ether('0.4')),
                'Gov share vote is too high',
            );
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
        });

        it('should discard governance share', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.2'));
            await this.mooniswapFactoryGovernance.discardGovernanceShareVote();
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
        });

        it('should reset governance share vote on unstake', async function () {
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.2'));
            await this.mooniswapFactoryGovernance.notifyStakeChanged(_, '0');
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
        });
    });

    describe('multi-user', async function () {
        it('3 users', async function () {
            await this.mooniswapFactoryGovernance.notifyStakeChanged(wallet1, ether('1'));
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.06'), { from: wallet1 });
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('120', { from: wallet1 });
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.03'), { from: wallet1 });
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.12'), { from: wallet1 });

            await this.mooniswapFactoryGovernance.notifyStakeChanged(wallet2, ether('1'));
            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.03'), { from: wallet2 });
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('60', { from: wallet2 });
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.04'), { from: wallet2 });
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.09'), { from: wallet2 });

            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.03'));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('160');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.04'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.07'));

            await this.mooniswapFactoryGovernance.defaultFeeVote(ether('0.09'));
            await this.mooniswapFactoryGovernance.defaultDecayPeriodVote('600');
            await this.mooniswapFactoryGovernance.referralShareVote(ether('0.23'));
            await this.mooniswapFactoryGovernance.governanceShareVote(ether('0.21'));

            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.06'));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('260');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.14'));

            await this.mooniswapFactoryGovernance.notifyStakeChanged(wallet1, '0');

            expect(await this.mooniswapFactoryGovernance.defaultFee()).to.be.bignumber.equal(ether('0.06'));
            expect(await this.mooniswapFactoryGovernance.defaultDecayPeriod()).to.be.bignumber.equal('330');
            expect(await this.mooniswapFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.135'));
            expect(await this.mooniswapFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.15'));
        });
    });
});
