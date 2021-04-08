const hre = require('hardhat');
const { getChainId, ethers } = hre;
const { ether } = require('@openzeppelin/test-helpers');


const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    RENDGB: '0x31a0D1A199631D244761EEba67e8501296d2E383',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const OWNER = '0x6C2B100edf5d8474E3A3D458Ae693F24B37D1EF3';
const DGB_DISTRIBUTOR = OWNER;

const FARMING_REWARDS = {
    '1INCH-RENDGB': {
        tokens: [TOKENS.INCH, TOKENS.RENDGB],
        baseReward: {
            token: TOKENS.INCH,
            duration: 4 * WEEK,
            rewardDistribution: OWNER,
        },
        extraRewards: [
            {
                token: TOKENS.RENDGB,
                duration: 4 * WEEK,
                rewardDistribution: DGB_DISTRIBUTOR,
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

        const args = [poolAddress, baseReward.token, baseReward.duration, baseReward.rewardDistribution, ether('1').toString()];
        const farmingRewardsDeployment = await deploy('FarmingRewards', {
            args: args,
            from: deployer,
        });

        console.log(`FarmingRewards ${pair} deployed to: ${farmingRewardsDeployment.address}`);

        const farmingRewards = FarmingRewards.attach(farmingRewardsDeployment.address);
        for (const reward of extraRewards) {
            const addGiftTxn = await farmingRewards.addGift(reward.token, reward.duration, reward.rewardDistribution, ether('10000000000').toString());
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
