const GovernanceMothership = artifacts.require('./inch/GovernanceMothership.sol');
const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');
const GovernanceFeeReceiver = artifacts.require('./governance/GovernanceFeeReceiver.sol');
const Rewards = artifacts.require('./governance/GovernanceRewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const POOL_OWNER = {
    kovan: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'kovan-fork': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    test: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    coverage: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    mainnet: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'mainnet-fork': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
};

const TOKEN = {
    kovan: '0x9F6A694123e5599a07f984eb8c0F3A475F553A03',
    'kovan-fork': '0x9F6A694123e5599a07f984eb8c0F3A475F553A03',
    mainnet: '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
    'mainnet-fork': '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        const token = (network in TOKEN) ? await TokenMock.at(TOKEN[network]) : await deployer.deploy(TokenMock, 'BOOM', 'BOOM', 18);
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
