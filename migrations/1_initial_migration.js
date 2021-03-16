const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const TOKENS = {
    ETH: '0x0000000000000000000000000000000000000000',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const TOKEN = {
    mainnet: TOKENS.INCH,
    'mainnet-fork': TOKENS.INCH,
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

const FEE_COLLECTOR = {
    mainnet: '0x2eeA44E40930b1984F42078E836c659A12301E40',
    'mainnet-fork': '0x2eeA44E40930b1984F42078E836c659A12301E40',
};

const POOLS = {
    mainnet: {
        // 'ETH-DAI': [TOKENS.ETH, TOKENS.DAI],
        // 'ETH-USDC': [TOKENS.ETH, TOKENS.USDC],
        // 'ETH-USDT': [TOKENS.ETH, TOKENS.USDT],
        // 'ETH-WBTC': [TOKENS.ETH, TOKENS.WBTC],
        // 'ETH-1INCH': [TOKENS.ETH, TOKEN.INCH],
        // 'DAI-1INCH': [TOKENS.DAI, TOKEN.INCH],
    },
    'mainnet-fork': {
        // 'ETH-DAI': [TOKENS.ETH, TOKENS.DAI],
        // 'ETH-USDC': [TOKENS.ETH, TOKENS.USDC],
        // 'ETH-USDT': [TOKENS.ETH, TOKENS.USDT],
        // 'ETH-WBTC': [TOKENS.ETH, TOKENS.WBTC],
        // 'ETH-1INCH': [TOKENS.ETH, TOKENS.INCH],
        // 'DAI-1INCH': [TOKENS.DAI, TOKENS.INCH],
    },
};

const FARM_REWARDS = {
    mainnet: {
        // 'ETH-DAI': [TOKENS.ETH, TOKENS.DAI, '0'],
        // 'ETH-USDC': [TOKENS.ETH, TOKENS.USDC, '0'],
        // 'ETH-USDT': [TOKENS.ETH, TOKENS.USDT, '0'],
        // 'ETH-WBTC': [TOKENS.ETH, TOKENS.WBTC, '0'],
        // 'ETH-1INCH': [TOKENS.ETH, TOKEN.INCH, '0'],
        // 'DAI-1INCH': [TOKENS.DAI, TOKEN.INCH, '0'],
    },
    'mainnet-fork': {
        // 'ETH-DAI': [TOKENS.ETH, TOKENS.DAI, '0'],
        // 'ETH-USDC': [TOKENS.ETH, TOKENS.USDC, '0'],
        // 'ETH-USDT': [TOKENS.ETH, TOKENS.USDT, '0'],
        // 'ETH-WBTC': [TOKENS.ETH, TOKENS.WBTC, '0'],
        // 'ETH-1INCH': [TOKENS.ETH, TOKENS.INCH, '0'],
        // 'DAI-1INCH': [TOKENS.DAI, TOKENS.INCH, '0'],
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

        const account = '0x11799622F4D98A24514011E8527B969f7488eF47';
        console.log('Deployer account: ' + account);
        console.log('Deployer balance: ' + (await web3.eth.getBalance(account)) / 1e18 + ' ETH');

        const token = await TokenMock.at(TOKEN[network]);

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
                MOTHERSHIP[network],
            );

            console.log(
                'Do not forget to governanceMothership.addModule(mooniswapFactory.address), where:\n' +
                ` - governanceMothership = ${MOTHERSHIP[network]}\n` +
                ` - mooniswapFactory = ${mooniswapFactory.address}\n`,
            );
        }

        if (await mooniswapFactory.governanceWallet() !== GOV_WALLET[network]) {
            if (await mooniswapFactory.owner() === account) {
                await mooniswapFactory.setGovernanceWallet(GOV_WALLET[network]);
            } else {
                console.log(
                    'Do not forget to mooniswapFactory.setGovernanceWallet(GOV_WALLET[network]), where:\n' +
                    ` - mooniswapFactory = ${mooniswapFactory.address}\n` +
                    ` - GOV_WALLET[network] = ${GOV_WALLET[network]}\n` +
                    ` - mooniswapFactory.owner() = ${await mooniswapFactory.owner()}\n`,
                );
            }
        }

        let feeCollector;
        if (network in FEE_COLLECTOR) {
            feeCollector = await ReferralFeeReceiver.at(FEE_COLLECTOR[network]);
        } else {
            feeCollector = await deployer.deploy(ReferralFeeReceiver, token.address, mooniswapFactory.address);
            await feeCollector.transferOwnership(POOL_OWNER[network]);
        }

        if (await mooniswapFactory.feeCollector() !== feeCollector.address) {
            if ((await mooniswapFactory.owner()) === account) {
                await mooniswapFactory.setFeeCollector(feeCollector.address);
            } else {
                console.log(
                    'Do not forget to mooniswapFactory.setFeeCollector(feeCollector.address), where:\n' +
                    ` - mooniswapFactory = ${mooniswapFactory.address}\n` +
                    ` - feeCollector = ${feeCollector.address}\n` +
                    ` - mooniswapFactory.owner() = ${await mooniswapFactory.owner()}\n`,
                );
            }
        }

        console.log(`Deploying ${Object.entries(POOLS[network]).length} pools...`);
        await Promise.all(
            Object.entries(POOLS[network]).map(
                ([, [token0, token1]]) => mooniswapFactory.deploy(token0, token1),
            ),
        );

        const pools = {};
        for (const [pair, [token0, token1]] of Object.entries(POOLS[network])) {
            const pool = await mooniswapFactory.pools(token0, token1);
            console.log(`Deployed pool (${pair}): ${pool}`);
            pools[pair] = pool;
        }

        for (const [pair] of Object.entries(FARM_REWARDS[network])) {
            const pool = pools[pair];
            if (!pool) {
                console.log(`Skipping farm deployment for pool ${pair}`);
                continue;
            }

            console.log(`Deploying farm for pool (${pair}): ${pool}`);
            const poolRewards = await deployer.deploy(FarmingRewards, pool, token.address, REWARD_DISTRIBUTION[network]);
            await poolRewards.transferOwnership(POOL_OWNER[network]);
        }
    });
};
