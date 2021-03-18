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
        skipIfAlreadyDeployed: true,
    });

    console.log(`MooniswapDeployer deployed to: ${mooniswapDeployerDeployment.address}`);

    const mooniswapFactoryDeployment = await deploy('MooniswapFactory-ovm', {
        args: [OWNER, mooniswapDeployerDeployment.address, mothershipAddress],
        from: deployer,
        skipIfAlreadyDeployed: true,
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
        skipIfAlreadyDeployed: true,
    });

    const mooniswapFactory = MooniswapFactory.attach(mooniswapFactoryDeployment.address);
    const feeCollector = ReferralFeeReceiver.attach(feeCollectorDeployment.address);

    await mooniswapFactory.setGovernanceWallet(OWNER);
    await mooniswapFactory.setFeeCollector(feeCollector.address);
    await feeCollector.transferOwnership(OWNER);
    await mooniswapFactory.transferOwnership(OWNER);
};

module.exports.skip = async () => true;
