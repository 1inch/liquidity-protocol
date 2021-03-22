const hre = require('hardhat');
const { getChainId, ethers } = hre;

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    RENBTC: '0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const OWNER = '0x6C2B100edf5d8474E3A3D458Ae693F24B37D1EF3';
const REN_DISTRIBUTOR = '0x36DA71103A48006879207C879e6c9eF0B006Cc9E';

const FARMING_REWARDS = {
    '1INCH-RENBTC': {
        tokens: [TOKENS.INCH, TOKENS.RENBTC],
        baseReward: {
            token: TOKENS.INCH,
            duration: 4 * WEEK,
            rewardDistribution: OWNER,
        },
        extraRewards: [
            {
                token: TOKENS.RENBTC,
                duration: 4 * WEEK,
                rewardDistribution: REN_DISTRIBUTOR,
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
