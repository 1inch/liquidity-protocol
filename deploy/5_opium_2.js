const hre = require('hardhat');
const { getChainId, ethers } = hre;

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    OPIUM: '0x888888888889C00c67689029D7856AAC1065eC11',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const OWNER = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';
const OPIUM_DISTRIBUTOR = '0xDbC2F7f3bCcccf54F1bdA43C57E8aB526e379DF1';

const FARMING_REWARDS = {
    '1INCH-OPIUM': {
        tokens: [TOKENS.INCH, TOKENS.OPIUM],
        baseReward: {
            token: TOKENS.INCH,
            duration: 6 * 4 * WEEK,
            rewardDistribution: OWNER,
        },
        extraRewards: [
            {
                token: TOKENS.OPIUM,
                duration: WEEK,
                rewardDistribution: OPIUM_DISTRIBUTOR,
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
            const addGiftTxn = await farmingRewards.addGift(reward.token, reward.duration, reward.rewardDistribution);
            await addGiftTxn.wait();
        }

        const transferOwnershipTxn = await farmingRewards.transferOwnership(OWNER);
        await transferOwnershipTxn.wait();

        await hre.run('verify:verify', {
            address: farmingRewardsDeployment.address,
            constructorArguments: [poolAddress, baseReward.token, baseReward.duration, baseReward.rewardDistribution],
        });
    }
};

module.exports.skip = async () => true;
