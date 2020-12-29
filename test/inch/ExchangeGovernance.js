const { ether, time, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { timeIncreaseTo } = require('../helpers/utils.js');

const ExchangeGovernance = artifacts.require('ExchangeGovernance');

contract('ExchangeGovernance', function ([_, wallet1, wallet2]) {
    beforeEach(async function () {
        this.exchangeGovernance = await ExchangeGovernance.new(_);
        await this.exchangeGovernance.notifyStakeChanged(_, ether('1'));
    });

    async function checkDefaultParams (exchangeGovernance) {
        return checkParams(exchangeGovernance, ether('0.34'), ether('0.33'), ether('0.33'));
    }

    async function checkParams (exchangeGovernance, govShare, refShare, teamShare) {
        const params = await exchangeGovernance.parameters();
        return params[0].eq(govShare) && params[1].eq(refShare) && params[2].eq(teamShare);
    }

    it('should correctly vote for shares', async function () {
        expect(await checkDefaultParams(this.exchangeGovernance)).to.be.true;
        await this.exchangeGovernance.leftoverShareVote(ether('0.8'), ether('0.1'));
        expect(await checkDefaultParams(this.exchangeGovernance)).to.be.true;
        await timeIncreaseTo((await time.latest()).addn(86500));
        expect(await checkParams(this.exchangeGovernance, ether('0.8'), ether('0.1'), ether('0.1'))).to.be.true;
    });

    it('should reject big shares', async function () {
        expect(await checkDefaultParams(this.exchangeGovernance)).to.be.true;
        await expectRevert(
            this.exchangeGovernance.leftoverShareVote(ether('0.6'), ether('0.6')),
            'Leftover shares are too high',
        );
    });

    it('should discard shares vote', async function () {
        expect(await checkDefaultParams(this.exchangeGovernance)).to.be.true;
        await this.exchangeGovernance.leftoverShareVote(ether('0.8'), ether('0.1'));
        await this.exchangeGovernance.discardLeftoverShareVote();
        await timeIncreaseTo((await time.latest()).addn(86500));
        expect(await checkDefaultParams(this.exchangeGovernance)).to.be.true;
    });

    it('should reset fee vote on unstake', async function () {
        expect(await checkDefaultParams(this.exchangeGovernance)).to.be.true;
        await this.exchangeGovernance.leftoverShareVote(ether('0.8'), ether('0.1'));
        await this.exchangeGovernance.notifyStakeChanged(_, '0');
        await timeIncreaseTo((await time.latest()).addn(86500));
        expect(await checkDefaultParams(this.exchangeGovernance)).to.be.true;
    });

    it('3 users', async function () {
        await this.exchangeGovernance.notifyStakeChanged(wallet1, ether('1'));
        await this.exchangeGovernance.leftoverShareVote(ether('0.3'), ether('0.6'), { from: wallet1 });

        await this.exchangeGovernance.notifyStakeChanged(wallet2, ether('1'));
        await this.exchangeGovernance.leftoverShareVote(ether('0.2'), ether('0'), { from: wallet2 });

        await timeIncreaseTo((await time.latest()).addn(86500));

        expect(await checkParams(this.exchangeGovernance, ether('0.28'), ether('0.31'), ether('0.41'))).to.be.true;

        await this.exchangeGovernance.leftoverShareVote(ether('0.7'), ether('0.15'));

        await timeIncreaseTo((await time.latest()).addn(86500));

        expect(await checkParams(this.exchangeGovernance, ether('0.4'), ether('0.25'), ether('0.35'))).to.be.true;

        await this.exchangeGovernance.notifyStakeChanged(wallet1, '0');

        await timeIncreaseTo((await time.latest()).addn(86500));

        expect(await checkParams(this.exchangeGovernance, ether('0.45'), ether('0.075'), ether('0.475'))).to.be.true;

        await this.exchangeGovernance.discardLeftoverShareVote();

        await timeIncreaseTo((await time.latest()).addn(86500));

        expect(await checkParams(this.exchangeGovernance, ether('0.27'), ether('0.165'), ether('0.565'))).to.be.true;
    });
});
