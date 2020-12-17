const TokenMock = artifacts.require('./mocks/TokenMock.sol');
const FarmingRewards = artifacts.require('./inch/farming/FarmingRewards.sol');

const TOKEN = {
    kovan: '0x9F6A694123e5599a07f984eb8c0F3A475F553A03',
    'kovan-fork': '0x9F6A694123e5599a07f984eb8c0F3A475F553A03',
    mainnet: '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
    'mainnet-fork': '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
    test: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    coverage: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
};

const POOLS = {
    mainnet: {
        'ETH-INCH': '0x438b5cec447d41cf070c7dec060bb2ecb260579c',
    },
    'mainnet-fork': {
        'ETH-INCH': '0x438b5cec447d41cf070c7dec060bb2ecb260579c',
    },
};

const REWARD_DISTRIBUTION = {
    mainnet: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'mainnet-fork': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
};

const REWARDS = {
    mainnet: {
        'ETH-INCH': '20000000000000000000000',
    },
    'mainnet-fork': {
        'ETH-INCH': '20000000000000000000000',
    },
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network == 'test' || network == 'coverage') {
            // migrations are not required for testing
            return;
        }

        const token = await TokenMock.at(TOKEN[network]);

        for (const [poolName, poolAddr] of Object.entries(POOLS[network])) {
            const poolRewards = await deployer.deploy(FarmingRewards, poolAddr, token.address);
            await poolRewards.setRewardDistribution(REWARD_DISTRIBUTION[network]);
            await token.transfer(poolRewards.address, REWARDS[network][poolName]);
            await poolRewards.notifyRewardAmount(REWARDS[network][poolName]);
        }
    });
};
