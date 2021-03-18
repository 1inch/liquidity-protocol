const { getChainId, ethers } = require('hardhat');

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    ARCX: '0xED30Dd7E50EdF3581AD970eFC5D9379Ce2614AdB',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const OWNER = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('running deploy script');
    console.log('network id ', await getChainId());

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const mooniswapFactoryAddress = (await deployments.get('MooniswapFactory')).address;
    const MooniswapFactory = await ethers.getContractFactory('MooniswapFactory');
    const mooniswapFactory = MooniswapFactory.attach(mooniswapFactoryAddress);

    const poolAddress = await mooniswapFactory.pools(TOKENS.ARCX, TOKENS.INCH);

    if (poolAddress === '0x0000000000000000000000000000000000000000') {
        console.log('Skipping farm deployment. Pool does not exist.');
        return;
    } else {
        console.log(`Pool address: ${poolAddress}`);
    }

    const farmingRewardsDeployment = await deploy('FarmingRewards', {
        args: [poolAddress, TOKENS.INCH, 4 * WEEK, OWNER],
        from: deployer,
        skipIfAlreadyDeployed: true,
    });

    console.log('FarmingRewards deployed to:', farmingRewardsDeployment.address);

    const FarmingRewards = await ethers.getContractFactory('FarmingRewards');
    const farmingRewards = FarmingRewards.attach(farmingRewardsDeployment.address);
    await farmingRewards.addGift(TOKENS.ARCX, WEEK, OWNER);
    await farmingRewards.transferOwnership(OWNER);
};

module.exports.skip = async () => true;
