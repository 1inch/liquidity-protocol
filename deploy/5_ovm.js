const hre = require('hardhat');
const { getChainId, ethers } = hre;

const OWNER = '0x7e11a8887A2c445883AcC453738635bC3aCDAdb6';

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('running deploy script');
    console.log('network id ', await getChainId());

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const MooniswapFactory = await ethers.getContractFactory('MooniswapFactory-ovm');
    const ReferralFeeReceiver = await ethers.getContractFactory('ReferralFeeReceiver-ovm');

    const tokenAddress = (await deployments.get('TokenMock-ovm')).address;
    const mothershipAddress = (await deployments.get('GovernanceMothership-ovm')).address;

    const mooniswapDeployerDeployment = await deploy('MooniswapDeployer-ovm', {
        from: deployer,
        skipIfAlreadyDeployed: false,
    });

    console.log(`MooniswapDeployer deployed to: ${mooniswapDeployerDeployment.address}`);

    const mooniswapFactoryDeployment = await deploy('MooniswapFactory-ovm', {
        args: [OWNER, mooniswapDeployerDeployment.address, mothershipAddress],
        from: deployer,
        skipIfAlreadyDeployed: false,
    });

    console.log(`MooniswapFactory deployed to: ${mooniswapFactoryDeployment.address}`);

    console.log(
        'Do not forget to governanceMothership.addModule(mooniswapFactory.address), where:\n' +
        ` - governanceMothership = ${mothershipAddress}\n` +
        ` - mooniswapFactory = ${mooniswapFactoryDeployment.address}\n`,
    );

    const feeCollectorDeployment = await deploy('ReferralFeeReceiver-ovm', {
        args: [tokenAddress, mooniswapFactoryDeployment.address],
        from: deployer,
        skipIfAlreadyDeployed: false,
    });

    const mooniswapFactory = MooniswapFactory.attach(mooniswapFactoryDeployment.address);
    const feeCollector = ReferralFeeReceiver.attach(feeCollectorDeployment.address);

    const tx1 = await mooniswapFactory.setGovernanceWallet(OWNER);
    const tx2 = await mooniswapFactory.setFeeCollector(feeCollector.address);
    await tx1.wait();
    await tx2.wait();
    const tx3 = await feeCollector.transferOwnership(OWNER);
    const tx4 = await mooniswapFactory.transferOwnership(OWNER);
    await tx3.wait();
    await tx4.wait();
};

module.exports.skip = async () => false;
