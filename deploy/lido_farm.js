const hre = require('hardhat');
const { getChainId, ethers } = hre;
const { ether } = require('@openzeppelin/test-helpers');

const DAY = 24 * 60 * 60;

const TOKENS = {
    stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
    LDO: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
};

const OWNER = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';
const INCH_DISTRIBUTOR = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';
const LDO_DISTRIBUTOR = '0x0000000000000000000000000000000000000000';

const FARMING_REWARDS = {
    'DAI-stETH': {
        tokens: [TOKENS.DAI, TOKENS.stETH],
        baseReward: {
            token: TOKENS.INCH,
            duration: 30 * DAY,
            rewardDistribution: INCH_DISTRIBUTOR,
            scale: ether('1').toString(),
        },
        extraRewards: [{
            token: TOKENS.LDO,
            duration: 30 * DAY,
            rewardDistribution: LDO_DISTRIBUTOR,
            scale: ether('1').toString(),
        }],
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
            maxFeePerGas: 100000000000,
            maxPriorityFeePerGas: 2000000000,
            skipIfAlreadyDeployed: true,
        });

        console.log(`FarmingRewards ${pair} deployed to: ${farmingRewardsDeployment.address}`);

        const farmingRewards = FarmingRewards.attach(farmingRewardsDeployment.address);
        for (const reward of extraRewards) {
            const addGiftTxn = await farmingRewards.addGift(
                reward.token, reward.duration, reward.rewardDistribution, reward.scale, {
                    maxFeePerGas: 100000000000,
                    maxPriorityFeePerGas: 2000000000,
                },
            );
            await addGiftTxn.wait();
        }

        const transferOwnershipTxn = await farmingRewards.transferOwnership(
            OWNER,
            {
                maxFeePerGas: 100000000000,
                maxPriorityFeePerGas: 2000000000,
            },
        );
        await transferOwnershipTxn.wait();

        await hre.run('verify:verify', {
            address: farmingRewardsDeployment.address,
            constructorArguments: args,
        });
    }
};

module.exports.skip = async () => true;
