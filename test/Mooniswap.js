const { constants, time, ether, expectRevert, BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const { trackReceivedToken, trackReceivedTokenAndTx, /* countInstructions, */ timeIncreaseTo } = require('./helpers/utils.js');

async function checkBalances (mooniswap, token, expectedBalance, expectedAdditionBalance, expectedRemovalBalance) {
    const balance = await token.balanceOf(mooniswap.address);
    const additionBalance = await mooniswap.getBalanceForAddition(token.address);
    const removalBalance = await mooniswap.getBalanceForRemoval(token.address);
    expect(balance).to.be.bignumber.equal(expectedBalance);
    expect(additionBalance).to.be.bignumber.equal(expectedAdditionBalance);
    expect(removalBalance).to.be.bignumber.equal(expectedRemovalBalance);
}

const money = {
    ether,
    eth: ether,
    zero: ether('0'),
    oneWei: ether('0').addn(1),
    weth: ether,
    dai: ether,
};

const MooniswapDeployer = artifacts.require('MooniswapDeployer');
const MooniswapFactory = artifacts.require('MooniswapFactory');
const Mooniswap = artifacts.require('Mooniswap');
const Token = artifacts.require('TokenMock');

contract('Mooniswap', function ([_, wallet1, wallet2, wallet3]) {
    beforeEach(async function () {
        this.DAI = await Token.new('DAI', 'DAI');
        this.WETH = await Token.new('WETH', 'WETH');
        while (this.WETH.address.toLowerCase() > this.DAI.address.toLowerCase()) {
            this.WETH = await Token.new('WETH', 'WETH');
        }
        this.factory = await MooniswapFactory.new(wallet1, constants.ZERO_ADDRESS, _);
    });

    describe('Creation', async function () {
        it('should be denied with empty name', async function () {
            await expectRevert(
                Mooniswap.new(this.WETH.address, this.DAI.address, '', 'MOON', this.factory.address),
                'Mooniswap: name is empty',
            );
        });

        it('should be denied with empty symbol', async function () {
            await expectRevert(
                Mooniswap.new(this.WETH.address, this.DAI.address, 'Mooniswap', '', this.factory.address),
                'Mooniswap: symbol is empty',
            );
        });

        it('should be denied with token duplicates', async function () {
            await expectRevert(
                Mooniswap.new(this.DAI.address, this.DAI.address, 'Mooniswap', 'MOON', this.factory.address),
                'Mooniswap: duplicate tokens',
            );

            await expectRevert(
                Mooniswap.new(constants.ZERO_ADDRESS, constants.ZERO_ADDRESS, 'Mooniswap', 'MOON', this.factory.address),
                'Mooniswap: duplicate tokens',
            );
        });

        it('should be allowed for different tokens and non-empty name and symbol', async function () {
            await Mooniswap.new(this.WETH.address, this.DAI.address, 'Mooniswap', 'MOON', this.factory.address);
        });
    });

    describe('Raw ETH support', async function () {
        beforeEach(async function () {
            this.deployer = await MooniswapDeployer.new();
            this.factory = await MooniswapFactory.new(wallet1, this.deployer.address, _);
            await this.factory.notifyStakeChanged(wallet1, ether('1'));
            await this.factory.defaultSlippageFeeVote('0', { from: wallet1 });
            await timeIncreaseTo((await time.latest()).addn(86500));
            await this.factory.deploy(constants.ZERO_ADDRESS, this.DAI.address);
            this.mooniswap = await Mooniswap.at(await this.factory.pools(constants.ZERO_ADDRESS, this.DAI.address));
            await this.DAI.mint(wallet1, money.dai('270'));
            await this.DAI.mint(wallet2, money.dai('2700'));
            await this.DAI.approve(this.mooniswap.address, money.dai('270'), { from: wallet1 });
            await this.DAI.approve(this.mooniswap.address, money.dai('2700'), { from: wallet2 });

            await this.mooniswap.deposit([money.eth('1'), money.dai('270')], [money.zero, money.zero], { value: money.eth('1'), from: wallet1 });
            expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
            await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
        });

        it('should support ETH to DAI', async function () {
            const wethAdditionBalance = await this.mooniswap.getBalanceForAddition(constants.ZERO_ADDRESS);
            const daiRemovalBalance = await this.mooniswap.getBalanceForRemoval(this.DAI.address);
            const result = await this.mooniswap.getReturn(constants.ZERO_ADDRESS, this.DAI.address, money.eth('1'));
            expect(wethAdditionBalance).to.be.bignumber.equal(money.eth('1'));
            expect(daiRemovalBalance).to.be.bignumber.equal(money.dai('270'));
            expect(result).to.be.bignumber.equal(money.dai('135'));

            const received = await trackReceivedToken(
                this.DAI,
                wallet2,
                () => this.mooniswap.swap(constants.ZERO_ADDRESS, this.DAI.address, money.eth('1'), money.zero, constants.ZERO_ADDRESS, { value: money.eth('1'), from: wallet2 }),
            );
            expect(received).to.be.bignumber.equal(money.dai('135'));
        });

        it('should support DAI to ETH', async function () {
            const daiAdditionBalance = await this.mooniswap.getBalanceForAddition(this.DAI.address);
            const ethRemovalBalance = await this.mooniswap.getBalanceForRemoval(constants.ZERO_ADDRESS);
            const result = await this.mooniswap.getReturn(this.DAI.address, constants.ZERO_ADDRESS, money.dai('270'));
            expect(daiAdditionBalance).to.be.bignumber.equal(money.dai('270'));
            expect(ethRemovalBalance).to.be.bignumber.equal(money.eth('1'));
            expect(result).to.be.bignumber.equal(money.eth('0.5'));

            const received = await trackReceivedToken(
                constants.ZERO_ADDRESS,
                wallet2,
                () => this.mooniswap.swap(this.DAI.address, constants.ZERO_ADDRESS, money.dai('270'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
            );
            expect(received).to.be.bignumber.equal(money.eth('0.5'));
        });
    });

    describe('Referral', async function () {
        beforeEach(async function () {
            this.deployer = await MooniswapDeployer.new();
            this.factory = await MooniswapFactory.new(wallet1, this.deployer.address, _);
            await this.factory.notifyStakeChanged(wallet1, ether('1'));
            await this.factory.defaultSlippageFeeVote('0', { from: wallet1 });
            await timeIncreaseTo((await time.latest()).addn(86500));
            await this.factory.deploy(this.WETH.address, this.DAI.address);
            this.mooniswap = await Mooniswap.at(await this.factory.pools(this.WETH.address, this.DAI.address));
            await this.WETH.mint(wallet1, new BN('1000'));
            await this.DAI.mint(wallet1, new BN('1000'));
            await this.WETH.mint(wallet2, new BN('1000000000000'));
            await this.WETH.approve(this.mooniswap.address, new BN('1000'), { from: wallet1 });
            await this.DAI.approve(this.mooniswap.address, new BN('10000'), { from: wallet1 });
            await this.WETH.approve(this.mooniswap.address, new BN('1000000000000'), { from: wallet2 });

            await this.factory.notifyStakeChanged(wallet1, '1');
            await this.factory.defaultFeeVote(money.weth('0.003'));
        });

        it('referral reward should be 1/10 of value increase', async function () {
            await this.mooniswap.deposit([new BN('1000'), new BN('1000')], [money.zero, money.zero], { from: wallet1 });
            await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
            await this.mooniswap.swap(this.WETH.address, this.DAI.address, new BN('1000000000000'), money.zero, wallet3, { from: wallet2 });
            expect(await this.mooniswap.balanceOf(wallet3)).to.be.bignumber.equal('9990');
        });
    });

    describe('Actions', async function () {
        beforeEach(async function () {
            this.deployer = await MooniswapDeployer.new();
            this.factory = await MooniswapFactory.new(wallet1, this.deployer.address, _);
            await this.factory.notifyStakeChanged(wallet1, ether('1'));
            await this.factory.defaultSlippageFeeVote('0', { from: wallet1 });
            await timeIncreaseTo((await time.latest()).addn(86500));
            await this.factory.deploy(this.WETH.address, this.DAI.address);
            this.mooniswap = await Mooniswap.at(await this.factory.pools(this.WETH.address, this.DAI.address));
            await this.WETH.mint(wallet1, money.weth('1'));
            await this.DAI.mint(wallet1, money.dai('270'));
            await this.WETH.mint(wallet2, money.weth('10'));
            await this.DAI.mint(wallet2, money.dai('2700'));
            await this.WETH.approve(this.mooniswap.address, money.weth('1'), { from: wallet1 });
            await this.DAI.approve(this.mooniswap.address, money.dai('270'), { from: wallet1 });
            await this.WETH.approve(this.mooniswap.address, money.weth('10'), { from: wallet2 });
            await this.DAI.approve(this.mooniswap.address, money.dai('2700'), { from: wallet2 });
        });

        describe('Initial deposits', async function () {
            it('should be denied for zero amount', async function () {
                await expectRevert(
                    this.mooniswap.deposit([money.weth('0'), money.dai('270')], [money.zero, money.zero], { from: wallet1 }),
                    'Mooniswap: amount is zero',
                );

                await expectRevert(
                    this.mooniswap.deposit([money.weth('1'), money.dai('0')], [money.zero, money.zero], { from: wallet1 }),
                    'Mooniswap: amount is zero',
                );
            });

            it('should check minAmounts on deposit', async function () {
                this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });

                await expectRevert(
                    this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.weth('1').addn(1), money.dai('270')], { from: wallet2 }),
                    'Mooniswap: minAmount not reached',
                );

                await expectRevert(
                    this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.weth('1'), money.dai('270').addn(1)], { from: wallet2 }),
                    'Mooniswap: minAmount not reached',
                );
            });

            it('should be allowed with zero minReturn', async function () {
                /* const tx = */ await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
                // expect(await countInstructions(tx.transactionHash, 'SSTORE')).to.be.equal(18);
            });

            it('should be allowed with strict minReturn', async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
            });

            it('should give the same shares for the same deposits', async function () {
                /* const tx1 = */ await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
                // expect(await countInstructions(tx1.transactionHash, ['SSTORE', 'SLOAD'])).to.be.deep.equal([18, 56]);

                /* const tx2 = */ await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.weth('1'), money.dai('270')], { from: wallet2 });
                expect(await this.mooniswap.balanceOf(wallet2)).to.be.bignumber.equal(money.dai('270').addn(1000));
                // expect(await countInstructions(tx2.transactionHash, ['SSTORE', 'SLOAD'])).to.be.deep.equal([17, 45]);
            });

            it('should give the proportional shares for the proportional deposits', async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));

                await this.mooniswap.deposit([money.weth('10'), money.dai('2700')], [money.weth('10'), money.dai('2700')], { from: wallet2 });
                expect(await this.mooniswap.balanceOf(wallet2)).to.be.bignumber.equal(money.dai('2700').addn(10000));
            });

            it('should give the right shares for the repeated deposits', async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));

                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.weth('1'), money.dai('270')], { from: wallet2 });
                expect(await this.mooniswap.balanceOf(wallet2)).to.be.bignumber.equal(money.dai('270').addn(1000));

                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.weth('1'), money.dai('270')], { from: wallet2 });
                expect(await this.mooniswap.balanceOf(wallet2)).to.be.bignumber.equal(money.dai('540').addn(2000));
            });

            it('should give less share on unbalanced deposits', async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));

                await this.mooniswap.deposit([money.weth('1'), money.dai('271')], [money.weth('1'), money.dai('270')], { from: wallet2 });
                expect(await this.mooniswap.balanceOf(wallet2)).to.be.bignumber.equal(money.dai('270').addn(1000));
                expect(await this.DAI.balanceOf(wallet2)).to.be.bignumber.equal(money.dai('2430'));
            });
        });

        describe('Deposits', async function () {
            it('should work without dust (mitigated with fairSupplyCached)', async function () {
                await this.mooniswap.deposit(['73185705953920517', '289638863448966403'], [money.zero, money.zero], { from: wallet1 });

                const received = await trackReceivedToken(
                    this.DAI,
                    this.mooniswap.address,
                    () => this.mooniswap.deposit(['73470488055448580', '217583468484493826'], [money.zero, money.zero], { from: wallet1 }),
                );
                expect(received).to.be.bignumber.equal('217583468484493826');
            });
        });

        describe('Swaps', async function () {
            beforeEach(async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
                await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()).addn(10));
            });

            it('should not swap token to itself', async function () {
                const result = await this.mooniswap.getReturn(this.WETH.address, this.WETH.address, money.weth('1'));
                expect(result).to.be.bignumber.equal(money.zero);

                await expectRevert(
                    this.mooniswap.swap(this.WETH.address, this.WETH.address, money.weth('1'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                    'Mooniswap: return is not enough',
                );
            });

            it('should fail on too small minReturn argument', async function () {
                await expectRevert(
                    this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('1'), money.dai('135').addn(1), constants.ZERO_ADDRESS, { from: wallet2 }),
                    'Mooniswap: return is not enough',
                );
            });

            it('should give 50% of tokenB for 100% of tokenA swap as designed by x*y=k', async function () {
                const wethAdditionBalance = await this.mooniswap.getBalanceForAddition(this.WETH.address);
                const daiRemovalBalance = await this.mooniswap.getBalanceForRemoval(this.DAI.address);
                const result = await this.mooniswap.getReturn(this.WETH.address, this.DAI.address, money.weth('1'));
                expect(wethAdditionBalance).to.be.bignumber.equal(money.weth('1'));
                expect(daiRemovalBalance).to.be.bignumber.equal(money.dai('270'));
                expect(result).to.be.bignumber.equal(money.dai('135'));

                const [received] = await trackReceivedTokenAndTx(
                    this.DAI,
                    wallet2,
                    () => this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('1'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                );

                expect(received).to.be.bignumber.equal(money.dai('135'));
                // expect(await countInstructions(tx.transactionHash, 'SSTORE')).to.be.equal(10);
                // expect(await countInstructions(tx.transactionHash, 'SLOAD')).to.be.equal(26);
            });

            it('should fail after shutting down factory', async function () {
                const wethAdditionBalance = await this.mooniswap.getBalanceForAddition(this.WETH.address);
                const daiRemovalBalance = await this.mooniswap.getBalanceForRemoval(this.DAI.address);
                const result = await this.mooniswap.getReturn(this.WETH.address, this.DAI.address, money.weth('1'));
                expect(wethAdditionBalance).to.be.bignumber.equal(money.weth('1'));
                expect(daiRemovalBalance).to.be.bignumber.equal(money.dai('270'));
                expect(result).to.be.bignumber.equal(money.dai('135'));

                await this.factory.shutdown();

                await expectRevert(
                    this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('1'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                    'Mooniswap: factory shutdown',
                );
            });

            it('should give additive results for the swaps of the same direction', async function () {
                // Pre-second swap checks
                const wethAdditionBalance1 = await this.mooniswap.getBalanceForAddition(this.WETH.address);
                const daiRemovalBalance1 = await this.mooniswap.getBalanceForRemoval(this.DAI.address);
                const result1 = await this.mooniswap.getReturn(this.WETH.address, this.DAI.address, money.weth('0.5'));
                expect(wethAdditionBalance1).to.be.bignumber.equal(money.weth('1'));
                expect(daiRemovalBalance1).to.be.bignumber.equal(money.dai('270'));
                expect(result1).to.be.bignumber.equal(money.dai('90'));

                // The first swap of 0.5 WETH to DAI
                const received1 = await trackReceivedToken(
                    this.DAI,
                    wallet2,
                    () => this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('0.5'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                );
                expect(received1).to.be.bignumber.equal(money.dai('90'));

                // Pre-second swap checks
                const wethAdditionBalance2 = await this.mooniswap.getBalanceForAddition(this.WETH.address);
                const daiRemovalBalance2 = await this.mooniswap.getBalanceForRemoval(this.DAI.address);
                const result2 = await this.mooniswap.getReturn(this.WETH.address, this.DAI.address, money.weth('0.5'));
                expect(wethAdditionBalance2).to.be.bignumber.equal(money.weth('1.5'));
                expect(daiRemovalBalance2).to.be.bignumber.equal(money.dai('180'));
                expect(result2).to.be.bignumber.equal(money.dai('45'));

                // The second swap of 0.5 WETH to DAI
                const received2 = await trackReceivedToken(
                    this.DAI,
                    wallet2,
                    () => this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('0.5'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                );
                expect(received2).to.be.bignumber.equal(money.dai('45'));

                // Two 0.5 WETH swaps are equal to the 1 WETH swap
                expect(received1.add(received2)).to.be.bignumber.equal(money.dai('135'));
            });

            it('should affect reverse price', async function () {
                // Pre-second swap checks
                const wethAdditionBalance1 = await this.mooniswap.getBalanceForAddition(this.WETH.address);
                const daiRemovalBalance1 = await this.mooniswap.getBalanceForRemoval(this.DAI.address);
                const result1 = await this.mooniswap.getReturn(this.WETH.address, this.DAI.address, money.weth('1'));
                expect(wethAdditionBalance1).to.be.bignumber.equal(money.weth('1'));
                expect(daiRemovalBalance1).to.be.bignumber.equal(money.dai('270'));
                expect(result1).to.be.bignumber.equal(money.dai('135'));

                const started = (await time.latest()).addn(10);
                await timeIncreaseTo(started);

                // The first swap of 1 WETH to 135 DAI
                const received1 = await trackReceivedToken(
                    this.DAI,
                    wallet2,
                    () => this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('1'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                );
                expect(received1).to.be.bignumber.equal(money.dai('135'));

                // Checks at the start of the decay period
                const daiAdditionBalance2 = await this.mooniswap.getBalanceForAddition(this.DAI.address);
                const wethRemovalBalance2 = await this.mooniswap.getBalanceForRemoval(this.WETH.address);
                const result2 = await this.mooniswap.getReturn(this.DAI.address, this.WETH.address, money.dai('270'));
                expect(daiAdditionBalance2).to.be.bignumber.equal(money.weth('270'));
                expect(wethRemovalBalance2).to.be.bignumber.equal(money.dai('1'));
                expect(result2).to.be.bignumber.equal(money.weth('0.5'));

                await timeIncreaseTo(started.add((await this.mooniswap.decayPeriod()).divn(2).addn(1)));

                // Checks at the middle of the decay period
                const daiAdditionBalance3 = await this.mooniswap.getBalanceForAddition(this.DAI.address);
                const wethRemovalBalance3 = await this.mooniswap.getBalanceForRemoval(this.WETH.address);
                const result3 = await this.mooniswap.getReturn(this.DAI.address, this.WETH.address, money.dai('202.5'));
                expect(daiAdditionBalance3).to.be.bignumber.equal(money.dai('202.5'));
                expect(wethRemovalBalance3).to.be.bignumber.equal(money.weth('1.5'));
                expect(result3).to.be.bignumber.equal(money.weth('0.75'));

                await timeIncreaseTo(started.add(await this.mooniswap.decayPeriod()).addn(1));

                // Checks at the end of the decay period
                const daiAdditionBalance4 = await this.mooniswap.getBalanceForAddition(this.DAI.address);
                const wethRemovalBalance4 = await this.mooniswap.getBalanceForRemoval(this.WETH.address);
                const result4 = await this.mooniswap.getReturn(this.DAI.address, this.WETH.address, money.dai('135'));
                expect(daiAdditionBalance4).to.be.bignumber.equal(money.dai('135'));
                expect(wethRemovalBalance4).to.be.bignumber.equal(money.weth('2'));
                expect(result4).to.be.bignumber.equal(money.weth('1'));

                // swap back 135 DAI to 1 ETH
                const received2 = await trackReceivedToken(
                    this.WETH,
                    wallet2,
                    () => this.mooniswap.swap(this.DAI.address, this.WETH.address, money.dai('135'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                );
                expect(received2).to.be.bignumber.equal(money.weth('1'));
            });

            // TODO: fix test
            it.skip('should do multiple cross swaps', async function () {
                const started = (await time.latest()).addn(10);
                await timeIncreaseTo(started);

                expect(await trackReceivedToken(
                    this.DAI,
                    wallet2,
                    () => this.mooniswap.swap(
                        this.WETH.address,
                        this.DAI.address,
                        money.weth('1'),
                        money.zero,
                        constants.ZERO_ADDRESS,
                        { from: wallet2 },
                    ),
                )).to.be.bignumber.equal(money.dai('135'));

                await checkBalances(this.mooniswap, this.WETH, money.weth('2'), money.weth('2'), money.weth('1'));
                await checkBalances(this.mooniswap, this.DAI, money.dai('135'), money.dai('270'), money.dai('135'));

                expect(await trackReceivedToken(
                    this.WETH,
                    wallet2,
                    () => this.mooniswap.swap(
                        this.DAI.address,
                        this.WETH.address,
                        money.dai('270'),
                        money.zero,
                        constants.ZERO_ADDRESS,
                        { from: wallet2 },
                    ),
                )).to.be.bignumber.equal(money.weth('0.5'));

                await checkBalances(this.mooniswap, this.WETH, money.weth('1.5'), money.weth('2'), money.weth('0.5'));
                await checkBalances(this.mooniswap, this.DAI, money.dai('405'), money.dai('540'), money.dai('135'));

                await timeIncreaseTo(started.add((await this.mooniswap.decayPeriod()).divn(2)));

                await checkBalances(this.mooniswap, this.WETH, money.weth('1.5'), money.weth('1.75'), money.weth('1'));
                await checkBalances(this.mooniswap, this.DAI, money.dai('405'), money.dai('472.5'), money.dai('270'));

                expect(await trackReceivedToken(
                    this.DAI,
                    wallet2,
                    () => this.mooniswap.swap(
                        this.WETH.address,
                        this.DAI.address,
                        money.weth('1.75'),
                        money.zero,
                        constants.ZERO_ADDRESS,
                        { from: wallet2 },
                    ),
                )).to.be.bignumber.equal(money.dai('135'));

                await checkBalances(this.mooniswap, this.WETH, money.weth('3.25'), money.weth('3.5'), money.weth('1'));
                await checkBalances(this.mooniswap, this.DAI, money.dai('270'), money.dai('472.5'), money.dai('135'));

                expect(await trackReceivedToken(
                    this.WETH,
                    wallet2,
                    () => this.mooniswap.swap(
                        this.DAI.address,
                        this.WETH.address,
                        money.dai('472.5'),
                        money.zero,
                        constants.ZERO_ADDRESS,
                        { from: wallet2 },
                    ),
                )).to.be.bignumber.equal(money.weth('0.5'));

                await checkBalances(this.mooniswap, this.WETH, money.weth('2.75'), money.weth('3.5'), money.weth('0.5'));
                await checkBalances(this.mooniswap, this.DAI, money.dai('742.5'), money.dai('945'), money.dai('135'));
            });
        });

        describe('Deposits after swaps', async function () {
            beforeEach(async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
                await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
            });

            it('should deposit imbalanced amount after swap', async function () {
                const started = (await time.latest()).addn(10);
                await timeIncreaseTo(started);

                await this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('1'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 });

                await timeIncreaseTo(started.add((await this.mooniswap.decayPeriod()).divn(2)));

                const received2 = await trackReceivedToken(
                    this.mooniswap,
                    wallet2,
                    () => this.mooniswap.deposit(
                        [money.weth('2'), money.dai('135')],
                        [money.weth('2'), money.dai('135')],
                        { from: wallet2 },
                    ),
                );

                expect(received2).to.be.bignumber.equal(money.dai('270').addn(1000));
            });

            it('should keep rates after imbalanced deposit', async function () {
                const started = (await time.latest()).addn(10);
                await timeIncreaseTo(started);

                await this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('1'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 });

                await checkBalances(this.mooniswap, this.WETH, money.weth('2'), money.weth('2'), money.weth('1'));
                await checkBalances(this.mooniswap, this.DAI, money.dai('135'), money.dai('270'), money.dai('135'));

                await timeIncreaseTo(started.add((await this.mooniswap.decayPeriod()).divn(2)).addn(1));

                await checkBalances(this.mooniswap, this.WETH, money.weth('2'), money.weth('2'), money.weth('1.5'));
                await checkBalances(this.mooniswap, this.DAI, money.dai('135'), money.dai('202.5'), money.dai('135'));

                const received = await trackReceivedToken(
                    this.mooniswap,
                    wallet2,
                    () => this.mooniswap.deposit(
                        [money.weth('2'), money.dai('135')],
                        [money.weth('2'), money.dai('135')],
                        { from: wallet2 },
                    ),
                );
                expect(received).to.be.bignumber.equal(money.dai('270').addn(1000));

                // All the balances are double since it was 100% deposit
                await checkBalances(this.mooniswap, this.WETH, money.weth('4'), money.weth('4'), '3033333333333333332');
                await checkBalances(this.mooniswap, this.DAI, money.dai('270'), money.dai('400.5'), money.dai('270'));
            });
        });

        describe('Withdrawals', async function () {
            beforeEach(async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
                await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
            });

            it('should be able to exit fully', async function () {
                await this.mooniswap.withdraw(money.dai('270'), [], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.zero);
                expect(await this.DAI.balanceOf(this.mooniswap.address)).to.be.bignumber.equal('1000');
                expect(await this.WETH.balanceOf(this.mooniswap.address)).to.be.bignumber.equal('4');
            });

            it('should be able to exit partially', async function () {
                await this.mooniswap.withdraw(money.dai('135'), [], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('135'));
                expect(await this.DAI.balanceOf(this.mooniswap.address)).to.be.bignumber.equal(money.dai('135').addn(500));
                expect(await this.WETH.balanceOf(this.mooniswap.address)).to.be.bignumber.equal(money.weth('0.5').addn(2));

                await this.mooniswap.withdraw(money.dai('135'), [], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.zero);
                expect(await this.DAI.balanceOf(this.mooniswap.address)).to.be.bignumber.equal('1000');
                expect(await this.WETH.balanceOf(this.mooniswap.address)).to.be.bignumber.equal('4');
            });

            it('2 users should be able to exit', async function () {
                await this.mooniswap.deposit(
                    [money.weth('1'), money.dai('270')],
                    [money.weth('1'), money.dai('270')],
                    { from: wallet2 },
                );

                await this.mooniswap.withdraw(money.dai('270'), [], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.zero);
                expect(await this.DAI.balanceOf(this.mooniswap.address)).to.be.bignumber.equal(money.dai('270').addn(1000));
                expect(await this.WETH.balanceOf(this.mooniswap.address)).to.be.bignumber.equal(money.weth('1').addn(4));

                await this.mooniswap.withdraw(money.dai('270').addn(1000), [], { from: wallet2 });
                expect(await this.mooniswap.balanceOf(wallet2)).to.be.bignumber.equal(money.zero);
                expect(await this.DAI.balanceOf(this.mooniswap.address)).to.be.bignumber.equal('1000');
                expect(await this.WETH.balanceOf(this.mooniswap.address)).to.be.bignumber.equal('4');
            });
        });

        describe('Rounding', async function () {
            for (const i of ['13', '452', '8000', '14991', '98625']) {
                it('should round virtual balances on withdrawals correctly', async function () {
                    await this.mooniswap.deposit(['100', '100'], [money.zero, money.zero], { from: wallet1 });
                    expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal('99000');
                    await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
                    await this.mooniswap.withdraw(i, [], { from: wallet1 });
                    expect(await this.mooniswap.totalSupply()).to.be.bignumber.equal((100000 - i).toString());
                    const daiBalance = await this.DAI.balanceOf(this.mooniswap.address);
                    const wethBalance = await this.WETH.balanceOf(this.mooniswap.address);
                    expect(await this.mooniswap.getBalanceForAddition(this.DAI.address)).to.be.bignumber.equal(daiBalance);
                    expect(await this.mooniswap.getBalanceForRemoval(this.DAI.address)).to.be.bignumber.equal(daiBalance);
                    expect(await this.mooniswap.getBalanceForAddition(this.WETH.address)).to.be.bignumber.equal(wethBalance);
                    expect(await this.mooniswap.getBalanceForRemoval(this.WETH.address)).to.be.bignumber.equal(wethBalance);
                });
            }
        });

        describe('Fee', async function () {
            beforeEach(async function () {
                await this.mooniswap.deposit([money.weth('1'), money.dai('270')], [money.zero, money.zero], { from: wallet1 });
                expect(await this.mooniswap.balanceOf(wallet1)).to.be.bignumber.equal(money.dai('270'));
                await timeIncreaseTo((await time.latest()).add(await this.mooniswap.decayPeriod()));
            });

            it('should swap with fee', async function () {
                const result = await this.mooniswap.getReturn(this.WETH.address, this.DAI.address, money.eth('1'));
                expect(result).to.be.bignumber.equal(money.dai('135'));

                /* const tx = */ await this.mooniswap.feeVote(money.weth('0.003'), { from: wallet1 });
                // expect(await countInstructions(tx.transactionHash, ['SSTORE', 'SLOAD'])).to.be.deep.equal([4, 9]);
                await timeIncreaseTo((await time.latest()).addn(86500));

                const result2 = await this.mooniswap.getReturn(this.WETH.address, this.DAI.address, money.eth('1'));
                expect(result2).to.be.bignumber.equal('134797195793690535871');

                const received1 = await trackReceivedToken(
                    this.DAI,
                    wallet2,
                    () => this.mooniswap.swap(this.WETH.address, this.DAI.address, money.weth('1'), money.zero, constants.ZERO_ADDRESS, { from: wallet2 }),
                );
                expect(received1).to.be.bignumber.equal('134797195793690535871');
            });
        });
    });
});
