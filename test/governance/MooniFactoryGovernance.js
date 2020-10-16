const { ether, expectRevert } = require('@openzeppelin/test-helpers');
const constants = require('@openzeppelin/test-helpers/src/constants');
const { expect } = require('chai');

const MooniFactoryGovernance = artifacts.require('MooniFactoryGovernance');

contract('MooniFactoryGovernance', function ([_, wallet1]) {
    beforeEach(async function () {
        this.mooniFactoryGovernance = await MooniFactoryGovernance.new();
    });

    describe('fee', async function () {
        it('should correctly set fee', async function () {
            expect(await this.mooniFactoryGovernance.fee()).to.be.bignumber.equal('0');
            await this.mooniFactoryGovernance.setFee(ether('0.1'));
            expect(await this.mooniFactoryGovernance.fee()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reject big fee', async function () {
            expect(await this.mooniFactoryGovernance.fee()).to.be.bignumber.equal('0');
            await expectRevert(
                this.mooniFactoryGovernance.setFee(ether('0.2')),
                'Factory: fee is too high',
            );
            expect(await this.mooniFactoryGovernance.fee()).to.be.bignumber.equal('0');
        });
    });

    describe('decay period', async function () {
        it('should correctly set decay period', async function () {
            expect(await this.mooniFactoryGovernance.decayPeriod()).to.be.bignumber.equal('300');
            await this.mooniFactoryGovernance.setDecayPeriod('120');
            expect(await this.mooniFactoryGovernance.decayPeriod()).to.be.bignumber.equal('120');
        });

        it('should reject big decay period', async function () {
            expect(await this.mooniFactoryGovernance.decayPeriod()).to.be.bignumber.equal('300');
            await expectRevert(
                this.mooniFactoryGovernance.setDecayPeriod('4000'),
                'Factory: decay period is too big',
            );
            expect(await this.mooniFactoryGovernance.decayPeriod()).to.be.bignumber.equal('300');
        });

        it('should reject small decay period', async function () {
            expect(await this.mooniFactoryGovernance.decayPeriod()).to.be.bignumber.equal('300');
            await expectRevert(
                this.mooniFactoryGovernance.setDecayPeriod('10'),
                'Factory: decay period is small',
            );
            expect(await this.mooniFactoryGovernance.decayPeriod()).to.be.bignumber.equal('300');
        });
    });

    describe('referral share', async function () {
        it('should correctly set referral share', async function () {
            expect(await this.mooniFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await this.mooniFactoryGovernance.setReferralShare(ether('0.1'));
            expect(await this.mooniFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reject big referral share', async function () {
            expect(await this.mooniFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await expectRevert(
                this.mooniFactoryGovernance.setReferralShare(ether('0.4')),
                'Factory: ref share is too big',
            );
            expect(await this.mooniFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
        });

        it('should reject small referral share', async function () {
            expect(await this.mooniFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
            await expectRevert(
                this.mooniFactoryGovernance.setReferralShare('10000'),
                'Factory: ref share is too small',
            );
            expect(await this.mooniFactoryGovernance.referralShare()).to.be.bignumber.equal(ether('0.05'));
        });
    });

    describe('governance share', async function () {
        it('should correctly set governance share', async function () {
            expect(await this.mooniFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await this.mooniFactoryGovernance.setGovernanceShare(ether('0.1'));
            expect(await this.mooniFactoryGovernance.governanceShare()).to.be.bignumber.equal(ether('0.1'));
        });

        it('should reject big governance share', async function () {
            expect(await this.mooniFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
            await expectRevert(
                this.mooniFactoryGovernance.setGovernanceShare(ether('0.4')),
                'Factory: gov share is too big',
            );
            expect(await this.mooniFactoryGovernance.governanceShare()).to.be.bignumber.equal('0');
        });
    });

    describe('governance fee receiver', async function () {
        it('should correctly set governance fee receiver', async function () {
            expect(await this.mooniFactoryGovernance.governanceFeeReceiver()).to.be.equal(constants.ZERO_ADDRESS);
            await this.mooniFactoryGovernance.setGovernanceFeeReceiver(wallet1);
            expect(await this.mooniFactoryGovernance.governanceFeeReceiver()).to.be.equal(wallet1);
        });
    });
});
