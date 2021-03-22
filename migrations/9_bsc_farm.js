// const assert = require('assert');

const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    BNB: '0x0000000000000000000000000000000000000000',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const POOL_OWNER = {
    bsc: '0x6C2B100edf5d8474E3A3D458Ae693F24B37D1EF3',
};

const REWARD_DISTRIBUTION = {
    bsc: '0x6C2B100edf5d8474E3A3D458Ae693F24B37D1EF3',
};

const FARM_REWARDS = {
    bsc: {
        // '1INCH-BNB': [TOKENS.INCH, TOKENS.BNB, 4 * WEEK],
    },
};

const FACTORY = {
    bsc: '0xD41B24bbA51fAc0E4827b6F94C0D6DDeB183cD64',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network === 'test' || network === 'coverage') {
            // migrations are not required for testing
            return;
        }

        const account = '0x11799622F4D98A24514011E8527B969f7488eF47';
        console.log('Deployer account: ' + account);
        console.log('Deployer balance: ' + (await web3.eth.getBalance(account)) / 1e18 + ' BNB');

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
