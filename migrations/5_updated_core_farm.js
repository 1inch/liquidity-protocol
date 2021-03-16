const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');

// const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    ETH: '0x0000000000000000000000000000000000000000',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const POOL_OWNER = {
    mainnet: '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
    'mainnet-fork': '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
};

const REWARD_DISTRIBUTION = {
    mainnet: '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
    'mainnet-fork': '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
};

const FARM_REWARDS = {
    // mainnet: {
    //     'ETH-DAI': [TOKENS.ETH, TOKENS.DAI, 4 * WEEK],
    //     'ETH-USDC': [TOKENS.ETH, TOKENS.USDC, 4 * WEEK],
    //     'ETH-USDT': [TOKENS.ETH, TOKENS.USDT, 4 * WEEK],
    //     'ETH-WBTC': [TOKENS.ETH, TOKENS.WBTC, 4 * WEEK],
    //     'ETH-1INCH': [TOKENS.ETH, TOKENS.INCH, 4 * WEEK],
    // },
    // 'mainnet-fork': {
    //     'ETH-DAI': [TOKENS.ETH, TOKENS.DAI, 4 * WEEK],
    //     'ETH-USDC': [TOKENS.ETH, TOKENS.USDC, 4 * WEEK],
    //     'ETH-USDT': [TOKENS.ETH, TOKENS.USDT, 4 * WEEK],
    //     'ETH-WBTC': [TOKENS.ETH, TOKENS.WBTC, 4 * WEEK],
    //     'ETH-1INCH': [TOKENS.ETH, TOKENS.INCH, 4 * WEEK],
    // },
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

        const mooniswapFactory = await MooniswapFactory.at(FACTORY[network]);

        if (FARM_REWARDS[network] !== undefined) {
            for (const [pair, [token0, token1, duration]] of Object.entries(FARM_REWARDS[network])) {
                const pool = await mooniswapFactory.pools(token0, token1);
                if (pool === '0x0000000000000000000000000000000000000000') {
                    console.log(`Skipping farm deployment for pool ${pair}`);
                    continue;
                }

                console.log(`Deploying farm for pool (${pair}): ${pool}`);
                const poolRewards = await deployer.deploy(FarmingRewards, pool, TOKENS.INCH, duration, REWARD_DISTRIBUTION[network]);
                await poolRewards.transferOwnership(POOL_OWNER[network]);
            }
        }
    });
};
