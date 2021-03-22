const hre = require('hardhat');
const { getChainId, ethers } = hre;

const WEEK = 7 * 24 * 60 * 60;

const TOKENS = {
    ETH: '0x0000000000000000000000000000000000000000',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    INCH: '0x111111111117dC0aa78b770fA6A738034120C302',
};

const FARMING_REWARDS = {
    'ETH-1INCH': [TOKENS.ETH, TOKENS.INCH, 4 * WEEK],
    'USDC-1INCH': [TOKENS.USDC, TOKENS.INCH, 4 * WEEK],
    'WBTC-1INCH': [TOKENS.WBTC, TOKENS.INCH, 4 * WEEK],
};

const OWNER = '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1';

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('running deploy script');
    console.log('network id ', await getChainId());

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const MooniswapFactory = await ethers.getContractFactory('MooniswapFactory');
    const FarmingRewards = await ethers.getContractFactory('FarmingRewards');

    const mooniswapFactory = MooniswapFactory.attach((await deployments.get('MooniswapFactory')).address);

    for (const [pair, [token0, token1, duration]] of Object.entries(FARMING_REWARDS)) {
        const poolAddress = await mooniswapFactory.pools(token0, token1);
        if (poolAddress === '0x0000000000000000000000000000000000000000') {
            console.log('Skipping farm deployment. Pool does not exist.');
            continue;
        } else {
            console.log(`Pool address: ${poolAddress}`);
        }

        const farmingRewardsDeployment = await deploy('FarmingRewards', {
            args: [poolAddress, TOKENS.INCH, duration, OWNER],
            from: deployer,
        });

        console.log(`FarmingRewards ${pair} deployed to: ${farmingRewardsDeployment.address}`);

        await hre.run('verify:verify', {
            address: farmingRewardsDeployment.address,
            constructorArguments: [poolAddress, TOKENS.INCH, duration, OWNER],
        });

        const farmingRewards = FarmingRewards.attach(farmingRewardsDeployment.address);
        await farmingRewards.transferOwnership(OWNER);
    }
};

module.exports.skip = async () => true;
