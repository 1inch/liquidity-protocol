const hre = require('hardhat');
const { getChainId, ethers } = hre;
const { ether } = require('@openzeppelin/test-helpers');

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    ETH: '0x0000000000000000000000000000000000000000',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
    TORN: '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C',
};

const OWNER = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';
const TORN_DISTRIBUTOR = '0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce';

const FARMING_REWARDS = {
    'ETH-TORN': {
        tokens: [TOKENS.ETH, TOKENS.TORN],
        baseReward: {
            token: TOKENS.INCH,
            duration: 4 * WEEK,
            rewardDistribution: OWNER,
            scale: ether('1').toString(),
        },
        extraRewards: [
            {
                token: TOKENS.TORN,
                duration: 4 * WEEK,
                rewardDistribution: TORN_DISTRIBUTOR,
                scale: ether('1').toString(),
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

        const args = [poolAddress, baseReward.token, baseReward.duration, baseReward.rewardDistribution, baseReward.scale];
        const farmingRewardsDeployment = await deploy('FarmingRewards', {
            args: args,
            from: deployer,
        });

        console.log(`FarmingRewards ${pair} deployed to: ${farmingRewardsDeployment.address}`);

        const farmingRewards = FarmingRewards.attach(farmingRewardsDeployment.address);
        for (const reward of extraRewards) {
            const addGiftTxn = await farmingRewards.addGift(reward.token, reward.duration, reward.rewardDistribution, reward.scale);
            await addGiftTxn.wait();
        }

        const transferOwnershipTxn = await farmingRewards.transferOwnership(OWNER);
        await transferOwnershipTxn.wait();

        await hre.run('verify:verify', {
            address: farmingRewardsDeployment.address,
            constructorArguments: args,
        });
    }
};

module.exports.skip = async () => true;
