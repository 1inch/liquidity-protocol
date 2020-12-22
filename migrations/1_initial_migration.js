const GovernanceMothership = artifacts.require('./inch/GovernanceMothership.sol');
const ExchangeGovernance = artifacts.require('./ExchangeGovernance.sol');
const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');
const GovernanceFeeReceiver = artifacts.require('./governance/GovernanceFeeReceiver.sol');
const GovernanceRewards = artifacts.require('./governance/GovernanceRewards.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const POOL_OWNER = {
    mainnet: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'mainnet-fork': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
};

const REWARD_DISTRIBUTION = {
    mainnet: '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'mainnet-fork': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
};

const TOKEN = {
    mainnet: '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
    'mainnet-fork': '0x28ed0b47EeE1F467D182620a333Fe69415Ba9AC9',
};

const MOTHERSHIP = {
    mainnet: '0x37216868Bfb4e70Ec290e18e2C7F5D7d9901F7bF',
    'mainnet-fork': '0x37216868Bfb4e70Ec290e18e2C7F5D7d9901F7bF',
};

const GOV_REWARDS = {
    mainnet: '0xd120D5171d1BcceA4fEE705289Df5fc0C3721100',
    'mainnet-fork': '0xd120D5171d1BcceA4fEE705289Df5fc0C3721100',
};

const POOLS = {
    mainnet: {
        // 'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
        // 'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
        // 'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
        // 'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
        // 'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN.mainnet],
        'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN.mainnet],
    },
    'mainnet-fork': {
        // 'ETH-DAI': ['0x0000000000000000000000000000000000000000', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
        // 'ETH-USDC': ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
        // 'ETH-USDT': ['0x0000000000000000000000000000000000000000', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
        // 'ETH-WBTC': ['0x0000000000000000000000000000000000000000', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
        // 'ETH-1INCH': ['0x0000000000000000000000000000000000000000', TOKEN['mainnet-fork']],
        'DAI-1INCH': ['0x6B175474E89094C44Da98b954EedeAC495271d0F', TOKEN['mainnet-fork']],
    },
};

const FARM_REWARDS = {
    mainnet: {
        // 'ETH-DAI': '0',
        // 'ETH-USDC': '0',
        // 'ETH-USDT': '0',
        // 'ETH-WBTC': '0',
        // 'ETH-1INCH': '20000000000000000000000',
        'DAI-1INCH': '20000000000000000000000',
    },
    'mainnet-fork': {
        // 'ETH-DAI': '0',
        // 'ETH-USDC': '0',
        // 'ETH-USDT': '0',
        // 'ETH-WBTC': '0',
        // 'ETH-1INCH': '20000000000000000000000',
        'DAI-1INCH': '20000000000000000000000',
    },
};

const DEPLOYER = {
    mainnet: '0xffD3a027EceDB619E08Bbf5aADb4F1898FE093a7',
    'mainnet-fork': '0xffD3a027EceDB619E08Bbf5aADb4F1898FE093a7',
};

const FACTORY = {
    mainnet: '0x5a8C574Bfb9ACdA1AbAa4bAA28b49C2f52C3909e',
    'mainnet-fork': '0x5a8C574Bfb9ACdA1AbAa4bAA28b49C2f52C3909e',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network === 'test' || network === 'coverage') {
            // migrations are not required for testing
            return;
        }

        const token = (network in TOKEN) ? await TokenMock.at(TOKEN[network]) : await deployer.deploy(TokenMock, 'BOOM', 'BOOM', 18);
        const governanceMothership = (network in MOTHERSHIP) ? await GovernanceMothership.at(MOTHERSHIP[network]) : await deployer.deploy(GovernanceMothership, token.address);

        // Exchange Governance

        const exchangeGovernance = await deployer.deploy(ExchangeGovernance, governanceMothership.address);
        await governanceMothership.addModule(exchangeGovernance.address);

        // Mooniswap Factory

        const mooniswapDeployer = (network in DEPLOYER) ? await MooniswapDeployer.at(DEPLOYER[network]) : await deployer.deploy(MooniswapDeployer);
        const mooniswapFactory = (network in FACTORY) ? await MooniswapFactory.at(FACTORY[network]) : await deployer.deploy(
            MooniswapFactory,
            POOL_OWNER[network],
            mooniswapDeployer.address,
            governanceMothership.address,
        );
        await governanceMothership.addModule(mooniswapFactory.address);
        // await governanceMothership.removeModule('0xDA3ed1906ddC653b39d5ef05111c46F5D0EEB8b2'); // old mooniswapFactory

        // Governance

        const govRewards = (network in GOV_REWARDS) ? await GovernanceRewards.at(GOV_REWARDS[network]) : await deployer.deploy(GovernanceRewards, token.address, governanceMothership.address);
        await governanceMothership.addModule(govRewards.address);

        const governanceFeeReceiver = await deployer.deploy(GovernanceFeeReceiver, token.address, govRewards.address, mooniswapFactory.address);
        await mooniswapFactory.setGovernanceFeeReceiver(governanceFeeReceiver.address);
        await govRewards.setRewardDistribution(governanceFeeReceiver.address);

        const referralFeeReceiver = await deployer.deploy(ReferralFeeReceiver, token.address, mooniswapFactory.address);
        await mooniswapFactory.setReferralFeeReceiver(referralFeeReceiver.address);

        // Transfer Ownership

        await governanceMothership.transferOwnership(POOL_OWNER[network]);
        await govRewards.transferOwnership(POOL_OWNER[network]);

        for (const [, [token0, token1]] of Object.entries(POOLS[network])) {
            await mooniswapFactory.deploy(token0, token1);
        }

        for (const [poolName, [token0, token1]] of Object.entries(POOLS[network])) {
            const pool = await mooniswapFactory.pools(token0, token1);
            const poolRewards = await deployer.deploy(FarmingRewards, pool, token.address);
            await poolRewards.setRewardDistribution(REWARD_DISTRIBUTION[network]);
            await token.transfer(poolRewards.address, FARM_REWARDS[network][poolName]);
            await poolRewards.notifyRewardAmount(FARM_REWARDS[network][poolName]);
        }
    });
};
