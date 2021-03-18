const hre = require('hardhat');
const { getChainId, ethers } = hre;

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    ICHI: '0x903bEF1736CDdf2A537176cf3C64579C3867A881',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const OWNER = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';
const ICHI_DISTRIBUTOR = '0x8f3c97DdC88D7A75b8c3f872b525B30932D3014c';

const FARMING_REWARDS = {
    '1INCH-ICHI': {
        tokens: [TOKENS.INCH, TOKENS.ICHI],
        baseReward: {
            token: TOKENS.INCH,
            duration: 4 * WEEK,
            rewardDistribution: OWNER,
        },
        extraRewards: [
            {
                token: TOKENS.ICHI,
                duration: 4 * WEEK,
                rewardDistribution: ICHI_DISTRIBUTOR,
            },
        ],
    },
};

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('running deploy script');
    console.log('network id ', await getChainId());

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const MooniswapFactory = await ethers.getContractFactory('MooniswapFactory');
    const FarmingRewards = await ethers.getContractFactory('FarmingRewards');

    const mooniswapFactory = MooniswapFactory.attach((await deployments.get('MooniswapFactory')).address);

    for (const [pair, { tokens, baseReward, extraRewards }] of Object.entries(FARMING_REWARDS)) {
        const poolAddress = await mooniswapFactory.pools(tokens[0], tokens[1]);
        if (poolAddress === '0x0000000000000000000000000000000000000000') {
            console.log('Skipping farm deployment. Pool does not exist.');
            continue;
        } else {
            console.log(`Pool address: ${poolAddress}`);
        }

        const farmingRewardsDeployment = await deploy('FarmingRewards', {
            args: [poolAddress, baseReward.token, baseReward.duration, baseReward.rewardDistribution],
            from: deployer,
        });

        console.log(`FarmingRewards ${pair} deployed to: ${farmingRewardsDeployment.address}`);

        const farmingRewards = FarmingRewards.attach(farmingRewardsDeployment.address);
        for (const reward of extraRewards) {
            await farmingRewards.addGift(reward.token, reward.duration, reward.rewardDistribution);
        }

        await farmingRewards.transferOwnership(OWNER);

        await hre.run('verify:verify', {
            address: farmingRewardsDeployment.address,
            constructorArguments: [poolAddress, baseReward.token, baseReward.duration, baseReward.rewardDistribution],
        });
    }
};

module.exports.skip = async () => true;
