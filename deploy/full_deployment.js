const hre = require('hardhat');
const { getChainId, ethers } = hre;

const OWNER = '0x910bf2d50fA5e014Fd06666f456182D4Ab7c8bd2';

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('running deploy script');
    console.log('network id ', await getChainId());

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const MooniswapFactory = await ethers.getContractFactory('MooniswapFactory');
    const ReferralFeeReceiver = await ethers.getContractFactory('ReferralFeeReceiver');

    const tokenAddress = (await deployments.get('TokenMock')).address;
    const mothershipAddress = (await deployments.get('GovernanceMothership')).address;

    const mooniswapDeployerDeployment = await deploy('MooniswapDeployer', {
        from: deployer,
        skipIfAlreadyDeployed: true,
    });

    console.log(`MooniswapDeployer deployed to: ${mooniswapDeployerDeployment.address}`);

    const mooniswapFactoryDeployment = await deploy('MooniswapFactory', {
        args: [OWNER, mooniswapDeployerDeployment.address, mothershipAddress],
        from: deployer,
        skipIfAlreadyDeployed: true,
    });

    console.log(`MooniswapFactory deployed to: ${mooniswapFactoryDeployment.address}`);

    const feeCollectorDeployment = await deploy('ReferralFeeReceiver', {
        args: [tokenAddress, mooniswapFactoryDeployment.address],
        from: deployer,
        skipIfAlreadyDeployed: true,
    });

    console.log(`FeeCollector deployed to: ${feeCollectorDeployment.address}`);

    const mooniswapFactory = MooniswapFactory.attach(mooniswapFactoryDeployment.address);
    const feeCollector = ReferralFeeReceiver.attach(feeCollectorDeployment.address);

    const setGovernanceWalletTxn = await mooniswapFactory.setGovernanceWallet(OWNER);
    const setFeeCollectorTxn = await mooniswapFactory.setFeeCollector(feeCollector.address);
    const feeCollectorOwnershipTxn = await feeCollector.transferOwnership(OWNER);

    await Promise.all([
        setGovernanceWalletTxn.wait(),
        setFeeCollectorTxn.wait(),
        feeCollectorOwnershipTxn.wait(),
    ]);

    const mooniswapFactoryOwnershipTxn = await mooniswapFactory.transferOwnership(OWNER);
    await mooniswapFactoryOwnershipTxn.wait();

    await hre.run('verify:verify', {
        address: mooniswapDeployerDeployment.address,
    });

    await hre.run('verify:verify', {
        address: mooniswapFactoryDeployment.address,
        constructorArguments: [OWNER, mooniswapDeployerDeployment.address, mothershipAddress],
    });

    await hre.run('verify:verify', {
        address: feeCollectorDeployment.address,
        constructorArguments: [tokenAddress, mooniswapFactoryDeployment.address],
    });
};

module.exports.skip = async () => true;
