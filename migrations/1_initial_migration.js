const GovernanceMothership = artifacts.require('./inch/GovernanceMothership.sol');
const ExchangeGovernance = artifacts.require('./ExchangeGovernance.sol');
const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');
const GovernanceRewards = artifacts.require('./governance/GovernanceRewards.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const POOL_OWNER = {
    mainnet: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'mainnet-fork': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
};

const REWARD_DISTRIBUTION = {
    mainnet: '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
    'mainnet-fork': '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
};

const TOKEN = {
    mainnet: '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
    'mainnet-fork': '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
};

const MOTHERSHIP = {
    mainnet: '0x37216868Bfb4e70Ec290e18e2C7F5D7d9901F7bF',
    'mainnet-fork': '0x37216868Bfb4e70Ec290e18e2C7F5D7d9901F7bF',
};

const EXCHANGE_GOV = {
    mainnet: '0xB33839E05CE9Fc53236Ae325324A27612F4d110D',
    'mainnet-fork': '0xB33839E05CE9Fc53236Ae325324A27612F4d110D',
}

const GOV_REWARDS = {
    mainnet: '0xd120D5171d1BcceA4fEE705289Df5fc0C3721100',
    'mainnet-fork': '0xd120D5171d1BcceA4fEE705289Df5fc0C3721100',
};

const FEE_COLLECTOR = {
    mainnet: '0xF5ab9Bf279284fB8e3De1C3BF0B0b4A6Fb0Bb538',
    'mainnet-fork': '0xF5ab9Bf279284fB8e3De1C3BF0B0b4A6Fb0Bb538',
};

const POOLS = {
    mainnet: {
        'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
        'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
        'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
        'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
        'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN.mainnet],
        // 'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN.mainnet],
    },
    'mainnet-fork': {
        'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
        'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
        'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
        'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
        'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN['mainnet-fork']],
        // 'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN['mainnet-fork']],
    },
};

const FARM_REWARDS = {
    mainnet: {
        'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0'],
        'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0'],
        'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0'],
        'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '0'],
        'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN.mainnet, '0'],
        // 'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN.mainnet, '0'],
    },
    'mainnet-fork': {
        'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0'],
        'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0'],
        'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0'],
        'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '0'],
        'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN['mainnet'], '0'],
        // 'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN['mainnet'], '0'],
    },
};

const DEPLOYER = {
    mainnet: '0xCB06dF7F0Be5B8Bb261d294Cf87C794EB9Da85b1',
    'mainnet-fork': '0xCB06dF7F0Be5B8Bb261d294Cf87C794EB9Da85b1',
};

const GOV_WALLET = {
    mainnet: '0x7e11a8887A2c445883AcC453738635bC3aCDAdb6',
    'mainnet-fork': '0x7e11a8887A2c445883AcC453738635bC3aCDAdb6',
};

const FACTORY = {
    mainnet: '0xE1b8Ff58432916CCfBF65a467B66fa4313Dc04d3',
    'mainnet-fork': '0xE1b8Ff58432916CCfBF65a467B66fa4313Dc04d3',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network === 'test' || network === 'coverage') {
            // migrations are not required for testing
            return;
        }

        // TODO: rm
        if (network === 'mainnet') {
            return;
        }

        const account = '0x11799622F4D98A24514011E8527B969f7488eF47';
        console.log('Deployer account: ' + account);
        console.log('Deployer balance: ' + (await web3.eth.getBalance(account)) / 1e18 + ' ETH');

        const token = (network in TOKEN) ? await TokenMock.at(TOKEN[network]) : await deployer.deploy(TokenMock, 'BOOM', 'BOOM', 18);
        const governanceMothership = (network in MOTHERSHIP) ? await GovernanceMothership.at(MOTHERSHIP[network]) : await deployer.deploy(GovernanceMothership, token.address);

        // Exchange Governance

        let exchangeGovernance;
        if (network in EXCHANGE_GOV) {
            exchangeGovernance = await ExchangeGovernance.at(EXCHANGE_GOV[network]);
        } else {
            exchangeGovernance = await deployer.deploy(ExchangeGovernance, governanceMothership.address);

            if ((await governanceMothership.owner()) == account) {
                await governanceMothership.addModule(exchangeGovernance.address);
            } else {
                console.log(
                    'Do not forget to governanceMothership.addModule(exchangeGovernance.address), where:\n' +
                    ` - governanceMothership = ${governanceMothership.address}\n` +
                    ` - exchangeGovernance = ${exchangeGovernance.address}\n` +
                    ` - governanceMothership.owner() = ${await governanceMothership.owner()}\n`
                );
            }
        }

        // Mooniswap Factory

        const mooniswapDeployer = (network in DEPLOYER) ? await MooniswapDeployer.at(DEPLOYER[network]) : await deployer.deploy(MooniswapDeployer);
        let mooniswapFactory;
        if (network in FACTORY) {
            mooniswapFactory = await MooniswapFactory.at(FACTORY[network]);
        } else {
            mooniswapFactory = await deployer.deploy(
                MooniswapFactory,
                POOL_OWNER[network],
                mooniswapDeployer.address,
                governanceMothership.address,
            );

            if ((await governanceMothership.owner()) == account) {
                await governanceMothership.addModule(mooniswapFactory.address);
            } else {
                console.log(
                    'Do not forget to governanceMothership.addModule(mooniswapFactory.address), where:\n' +
                    ` - governanceMothership = ${governanceMothership.address}\n` +
                    ` - mooniswapFactory = ${mooniswapFactory.address}\n` +
                    ` - governanceMothership.owner() = ${await governanceMothership.owner()}\n`
                );
            }
        }
        // await governanceMothership.removeModule('0xDA3ed1906ddC653b39d5ef05111c46F5D0EEB8b2'); // old mooniswapFactory

        // Governance

        let govRewards;
        if (network in GOV_REWARDS) {
            govRewards = await GovernanceRewards.at(GOV_REWARDS[network]);
        } else {
            govRewards = await deployer.deploy(GovernanceRewards, token.address, governanceMothership.address);

            if ((await governanceMothership.owner()) == account) {
                await governanceMothership.addModule(govRewards.address);
            } else {
                console.log(
                    'Do not forget to governanceMothership.addModule(govRewards.address), where:\n' +
                    ` - governanceMothership = ${governanceMothership.address}\n` +
                    ` - govRewards = ${govRewards.address}\n` +
                    ` - governanceMothership.owner() = ${await governanceMothership.owner()}\n`
                );
            }
        }

        if ((await mooniswapFactory.owner()) == account) {
            await mooniswapFactory.setGovernanceWallet(GOV_WALLET[network]);
        } else {
            console.log(
                'Do not forget to mooniswapFactory.setGovernanceWallet(GOV_WALLET[network]), where:\n' +
                ` - mooniswapFactory = ${mooniswapFactory.address}\n` +
                ` - GOV_WALLET[network] = ${GOV_WALLET[network]}\n` +
                ` - mooniswapFactory.owner() = ${await mooniswapFactory.owner()}\n`
            );
        }

        if ((await govRewards.owner()) == account) {
            await govRewards.setRewardDistribution(GOV_WALLET[network]);
        } else {
            console.log(
                'Do not forget to govRewards.setRewardDistribution(GOV_WALLET[network]), where:\n' +
                ` - govRewards = ${govRewards.address}\n` +
                ` - GOV_WALLET[network] = ${GOV_WALLET[network]}\n` +
                ` - govRewards.owner() = ${await govRewards.owner()}\n`
            );
        }

        let feeCollector;
        if (network in FEE_COLLECTOR) {
            feeCollector = await ReferralFeeReceiver.at(FEE_COLLECTOR[network]);
        } else {
            feeCollector = await deployer.deploy(ReferralFeeReceiver, token.address, mooniswapFactory.address);

            if ((await mooniswapFactory.owner()) == account) {
                await mooniswapFactory.setFeeCollector(feeCollector.address);
            } else {
                console.log(
                    'Do not forget to mooniswapFactory.setFeeCollector(feeCollector.address), where:\n' +
                    ` - mooniswapFactory = ${mooniswapFactory.address}\n` +
                    ` - feeCollector = ${feeCollector.address}\n` +
                    ` - mooniswapFactory.owner() = ${await mooniswapFactory.owner()}\n`
                );
            }
        }

        // Transfer Ownership

        if ((await governanceMothership.owner()) == account) {
            await governanceMothership.transferOwnership(POOL_OWNER[network]);
        } else if ((await governanceMothership.owner()) != POOL_OWNER[network]) {
            console.log(
                'Do not forget to governanceMothership.transferOwnership(POOL_OWNER[network]), where:\n' +
                ` - governanceMothership = ${governanceMothership.address}\n` +
                ` - POOL_OWNER[network] = ${POOL_OWNER[network]}\n` +
                ` - governanceMothership.owner() = ${await governanceMothership.owner()}\n`
            );
        }

        if ((await govRewards.owner()) == account) {
            await govRewards.transferOwnership(POOL_OWNER[network]);
        } else if ((await govRewards.owner()) != POOL_OWNER[network]) {
            console.log(
                'Do not forget to govRewards.transferOwnership(POOL_OWNER[network]), where:\n' +
                ` - govRewards = ${govRewards.address}\n` +
                ` - POOL_OWNER[network] = ${POOL_OWNER[network]}\n` +
                ` - govRewards.owner() = ${await govRewards.owner()}\n`
            );
        }

        await Promise.all(
            Object.entries(POOLS[network]).map(
                ([, [token0, token1]]) => mooniswapFactory.deploy(token0, token1)
            )
        );

        const pools = {};
        for (const [pair, [token0, token1]] of Object.entries(POOLS[network])) {
            const pool = await mooniswapFactory.pools(token0, token1);
            console.log(`Deployed pool (${pair}): ${pool}`);
            pools[pair] = pool;
        }

        for (const [pair, [token0, token1, reward]] of Object.entries(FARM_REWARDS[network])) {
            const pool = pools[pair];
            console.log(`Deploying farm for pool (${pair}): ${pool}`);
            const poolRewards = await deployer.deploy(FarmingRewards, pool, token.address);
            if (reward != '0') {
                await poolRewards.setRewardDistribution(account);
                await token.transfer(poolRewards.address, FARM_REWARDS[network][poolName]);
                await poolRewards.notifyRewardAmount(FARM_REWARDS[network][poolName]);
            }
            await poolRewards.setRewardDistribution(REWARD_DISTRIBUTION[network])
        }
    });
};
