const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');

// const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    ETH: '0x0000000000000000000000000000000000000000',
    TORN: '0x77777feddddffc19ff86db637967013e6c6a116c',
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
    //     'ETH-TORN': [TOKENS.ETH, TOKENS.TORN, 4 * WEEK],
    // },
    // 'mainnet-fork': {
    //     'ETH-TORN': [TOKENS.ETH, TOKENS.TORN, 4 * WEEK],
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
                const poolRewards = await deployer.deploy(FarmingRewards, pool, TOKENS.INCH, duration);
                await poolRewards.setRewardDistribution(REWARD_DISTRIBUTION[network]);
                await poolRewards.transferOwnership(POOL_OWNER[network]);
            }
        }
    });
};
