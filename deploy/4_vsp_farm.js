const hre = require('hardhat');
const { getChainId, ethers } = hre;

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    VSP: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const OWNER = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';
const VSP_DISTRIBUTOR = OWNER;

const FARMING_REWARDS = {
    '1INCH-VSP': {
        tokens: [TOKENS.INCH, TOKENS.VSP],
        baseReward: {
            token: TOKENS.INCH,
            duration: 4 * WEEK,
            rewardDistribution: OWNER,
        },
        extraRewards: [
            {
                token: TOKENS.VSP,
                duration: 4 * WEEK,
                rewardDistribution: VSP_DISTRIBUTOR,
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
