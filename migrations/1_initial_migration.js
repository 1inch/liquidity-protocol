const Migrations = artifacts.require('./Migrations.sol');
const GovernanceMothership = artifacts.require('./inch/GovernanceMothership.sol');
const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');
const GovernanceFeeReceiver = artifacts.require('./governance/GovernanceFeeReceiver.sol');
const Rewards = artifacts.require('./governance/rewards/Rewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const POOL_OWNER = {
    kovan: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'kovan-fork': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    test: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    coverage: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        await deployer.deploy(Migrations);

        const token = await deployer.deploy(TokenMock, 'BOOM', 'BOOM', 18);
        const governanceMothership = await deployer.deploy(GovernanceMothership, token.address);

        // Mooniswap Factory

        const mooniswapDeployer = await deployer.deploy(MooniswapDeployer);
        const mooniswapFactory = await deployer.deploy(
            MooniswapFactory,
            POOL_OWNER[network],
            mooniswapDeployer.address,
            governanceMothership.address,
        );
        await governanceMothership.addModule(mooniswapFactory.address);

        // Governance

        const rewards = await deployer.deploy(Rewards, token.address, governanceMothership.address);
        await governanceMothership.addModule(rewards.address);

        const governanceFeeReceiver = await deployer.deploy(GovernanceFeeReceiver, token.address, rewards.address, mooniswapFactory.address);
        await mooniswapFactory.setGovernanceFeeReceiver(governanceFeeReceiver.address);
        await rewards.setRewardDistribution(governanceFeeReceiver.address);

        const referralFeeReceiver = await deployer.deploy(ReferralFeeReceiver, token.address, mooniswapFactory.address);
        await mooniswapFactory.setReferralFeeReceiver(referralFeeReceiver.address);

        // Transfer Ownership

        await governanceMothership.transferOwnership(POOL_OWNER[network]);
        await rewards.transferOwnership(POOL_OWNER[network]);
    });
};
