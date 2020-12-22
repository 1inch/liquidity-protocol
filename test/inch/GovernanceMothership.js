const { ether, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const GovernanceMothership = artifacts.require('GovernanceMothership');
const GovernanceModuleMock = artifacts.require('GovernanceModuleMock');
const TokenMock = artifacts.require('TokenMock');

contract('GovernanceMothership', function ([wallet1, wallet2]) {
    beforeEach(async function () {
        this.token = await TokenMock.new('INCH', 'INCH', 18);
        this.governanceMothership = await GovernanceMothership.new(this.token.address);
    });

    describe('modules', async function () {
        it('should add module', async function () {
            await this.governanceMothership.addModule(wallet1);
            // todo: use expectEvent
        });

        it('should not add module twice', async function () {
            await this.governanceMothership.addModule(wallet1);
            await expectRevert(this.governanceMothership.addModule(wallet1), 'Module already registered');
        });

        it('should not remove non-existent module', async function () {
            await expectRevert(this.governanceMothership.removeModule(wallet1), 'Module was not registered');
        });

        it('should remove module', async function () {
            await this.governanceMothership.addModule(wallet1);
            await this.governanceMothership.removeModule(wallet1);
            // todo: use expectEvent
        });
    });

    describe('staking', async function () {
        beforeEach(async function () {
            this.rewards = await GovernanceModuleMock.new(this.governanceMothership.address);
            this.governanceMothership.addModule(this.rewards.address);
            await this.token.mint(wallet1, ether('10'));
            await this.token.approve(this.governanceMothership.address, ether('10'));
        });

        it('should transfer tokens and notify on stake', async function () {
            await this.governanceMothership.stake(ether('10'));
            expect(await this.governanceMothership.balanceOf(wallet1)).to.be.bignumber.equal(ether('10'));
            expect(await this.governanceMothership.totalSupply()).to.be.bignumber.equal(ether('10'));
            expect(await this.rewards.balanceOf(wallet1)).to.be.bignumber.equal(ether('10'));
            expect(await this.rewards.totalSupply()).to.be.bignumber.equal(ether('10'));
            expect(await this.token.balanceOf(this.governanceMothership.address)).to.be.bignumber.equal(ether('10'));
            expect(await this.token.balanceOf(wallet1)).to.be.bignumber.equal(ether('0'));
        });

        it('should transfer tokens and notify on unstake', async function () {
            await this.governanceMothership.stake(ether('10'));
            await this.governanceMothership.unstake(ether('5'));
            expect(await this.governanceMothership.balanceOf(wallet1)).to.be.bignumber.equal(ether('5'));
            expect(await this.governanceMothership.totalSupply()).to.be.bignumber.equal(ether('5'));
            expect(await this.rewards.balanceOf(wallet1)).to.be.bignumber.equal(ether('5'));
            expect(await this.rewards.totalSupply()).to.be.bignumber.equal(ether('5'));
            expect(await this.token.balanceOf(this.governanceMothership.address)).to.be.bignumber.equal(ether('5'));
            expect(await this.token.balanceOf(wallet1)).to.be.bignumber.equal(ether('5'));
        });
    });

    describe('notify new module', async function () {
        beforeEach(async function () {
            await this.token.mint(wallet2, ether('10'));
            await this.token.approve(this.governanceMothership.address, ether('10'), { from: wallet2 });
            await this.governanceMothership.stake(ether('10'), { from: wallet2 });
            this.rewards = await GovernanceModuleMock.new(this.governanceMothership.address);
            this.governanceMothership.addModule(this.rewards.address);
        });

        it('should notify', async function () {
            await this.governanceMothership.notify({ from: wallet2 });
            expect(await this.rewards.balanceOf(wallet2)).to.be.bignumber.equal(ether('10'));
            expect(await this.rewards.totalSupply()).to.be.bignumber.equal(ether('10'));
        });

        it('should notifyFor', async function () {
            await this.governanceMothership.notifyFor(wallet2);
            expect(await this.rewards.balanceOf(wallet2)).to.be.bignumber.equal(ether('10'));
            expect(await this.rewards.totalSupply()).to.be.bignumber.equal(ether('10'));
        });
    });

    it('should batchNotifyFor', async function () {
        await this.token.mint(wallet1, ether('10'));
        await this.token.approve(this.governanceMothership.address, ether('10'));
        await this.governanceMothership.stake(ether('10'));
        await this.token.mint(wallet2, ether('10'));
        await this.token.approve(this.governanceMothership.address, ether('10'), { from: wallet2 });
        await this.governanceMothership.stake(ether('10'), { from: wallet2 });
        this.rewards = await GovernanceModuleMock.new(this.governanceMothership.address);
        this.governanceMothership.addModule(this.rewards.address);

        await this.governanceMothership.batchNotifyFor([wallet1, wallet2]);
        expect(await this.rewards.balanceOf(wallet1)).to.be.bignumber.equal(ether('10'));
        expect(await this.rewards.balanceOf(wallet2)).to.be.bignumber.equal(ether('10'));
        expect(await this.rewards.totalSupply()).to.be.bignumber.equal(ether('20'));
    });
});
