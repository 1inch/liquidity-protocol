const GovernanceMothership = artifacts.require('./inch/GovernanceMothership.sol');
const ExchangeGovernance = artifacts.require('./ExchangeGovernance.sol');
const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const Mooniswap = artifacts.require('./Mooniswap.sol');
const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');
const GovernanceRewards = artifacts.require('./governance/GovernanceRewards.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const TOKENS = {
    ETH: '0x0000000000000000000000000000000000000000',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'
}

const TOKEN = {
    mainnet: '0x111111111117dC0aa78b770fA6A738034120C302',
    'mainnet-fork': '0x111111111117dC0aa78b770fA6A738034120C302',
};

const POOL_OWNER = {
    mainnet: '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
    'mainnet-fork': '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
};

const REWARD_DISTRIBUTION = {
    mainnet: '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
    'mainnet-fork': '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
};

const MOTHERSHIP = {
    mainnet: '0xA0446D8804611944F1B527eCD37d7dcbE442caba',
    'mainnet-fork': '0xA0446D8804611944F1B527eCD37d7dcbE442caba',
};

const EXCHANGE_GOV = {
    mainnet: '0xB33839E05CE9Fc53236Ae325324A27612F4d110D',
    'mainnet-fork': '0xB33839E05CE9Fc53236Ae325324A27612F4d110D',
}

const GOV_REWARDS = {
    mainnet: '0x0F85A912448279111694F4Ba4F85dC641c54b594',
    'mainnet-fork': '0x0F85A912448279111694F4Ba4F85dC641c54b594',
};

const FEE_COLLECTOR = {
    mainnet: '0x2eeA44E40930b1984F42078E836c659A12301E40',
    'mainnet-fork': '0x2eeA44E40930b1984F42078E836c659A12301E40',
};

const POOLS = {
    mainnet: {
        // 'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
        // 'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
        // 'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
        // 'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
        // 'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN.mainnet],
        // 'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN.mainnet],
    },
    'mainnet-fork': {
        // 'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
        // 'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
        // 'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
        // 'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
        // 'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN.mainnet],
        // 'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN['mainnet-fork']],
    },
};

const FARM_REWARDS = {
    mainnet: {
        // 'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0'],
        // 'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0'],
        // 'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0'],
        // 'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '0'],
        // 'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN.mainnet, '0'],
        // 'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN.mainnet, '0'],
    },
    'mainnet-fork': {
        // 'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0'],
        // 'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0'],
        // 'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0'],
        // 'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '0'],
        // 'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN.mainnet, '0'],
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
    mainnet: '0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643',
    'mainnet-fork': '0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network === 'test' || network === 'coverage') {
            // migrations are not required for testing
            return;
        }

        // TODO: rm
        // if (network === 'mainnet') {
        //     console.log('Skipping mainnet deployment');
        //     return;
        // }
        // if (network === 'mainnet-fork') {
        //     console.log('Skipping mainnet-fork deployment');
        //     return;
        // }

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

        if (await mooniswapFactory.governanceWallet() != GOV_WALLET[network]) {
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
        }

        if (await govRewards.rewardDistribution() != GOV_WALLET[network]) {
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

        console.log(`Deploying ${Object.entries(POOLS[network]).length} pools...`);
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
            if (!pool) {
                console.log(`Skipping farm deployment for pool ${pair}`);
                continue;
            }

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
