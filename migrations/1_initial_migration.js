const GovernanceMothership = artifacts.require('./inch/GovernanceMothership.sol');
const ExchangeGovernance = artifacts.require('./ExchangeGovernance.sol');
const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const Mooniswap = artifacts.require('./Mooniswap.sol');
const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');
const GovernanceRewards = artifacts.require('./governance/GovernanceRewards.sol');
const FarmingRewards = artifacts.require('./inch/FarmingRewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const TOKENS = {
    ETH: '0x0000000000000000000000000000000000000000',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'
}

const POOL_OWNER = {
    // mainnet: '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
    // 'mainnet-fork': '0x5E89f8d81C74E311458277EA1Be3d3247c7cd7D1',
};

const TOKEN = {
    // mainnet: '0x111111111117dC0aa78b770fA6A738034120C302',
    // 'mainnet-fork': '0x111111111117dC0aa78b770fA6A738034120C302',
};

const MOTHERSHIP = {
    mainnet: '0xA0446D8804611944F1B527eCD37d7dcbE442caba',
    'mainnet-fork': '0xA0446D8804611944F1B527eCD37d7dcbE442caba',
};

const GOV_REWARDS = {
    // mainnet: '0x0F85A912448279111694F4Ba4F85dC641c54b594',
    // 'mainnet-fork': '0x0F85A912448279111694F4Ba4F85dC641c54b594',
};

const POOLS = {
    mainnet: {
        // 'ETH-USDC': [TOKENS.ETH, TOKENS.USDC],
        // 'ETH-DAI': [TOKENS.ETH, TOKENS.DAI],
        // 'ETH-USDT': [TOKENS.ETH, TOKENS.USDT],
        // '1INCH-ETH': [TOKENS.ETH, TOKEN.mainnet],
        // '1INCH-DAI': [TOKENS.DAI, TOKEN.mainnet],
        // '1INCH-WBTC': [TOKENS.WBTC, TOKEN.mainnet],
        // '1INCH-USDC': [TOKENS.USDC, TOKEN.mainnet],
        // '1INCH-USDT': [TOKENS.USDT, TOKEN.mainnet],
        // '1INCH-YFI': [TOKENS.YFI, TOKEN.mainnet],
    },
    'mainnet-fork': {
        // 'ETH-USDC': [TOKENS.ETH, TOKENS.USDC],
        // 'ETH-DAI': [TOKENS.ETH, TOKENS.DAI],
        // 'ETH-USDT': [TOKENS.ETH, TOKENS.USDT],
        // '1INCH-ETH': [TOKENS.ETH, TOKEN['mainnet-fork']],
        // '1INCH-DAI': [TOKENS.DAI, TOKEN['mainnet-fork']],
        // '1INCH-WBTC': [TOKENS.WBTC, TOKEN['mainnet-fork']],
        // '1INCH-USDC': [TOKENS.USDC, TOKEN['mainnet-fork']],
        // '1INCH-USDT': [TOKENS.USDT, TOKEN['mainnet-fork']],
        // '1INCH-YFI': [TOKENS.YFI, TOKEN['mainnet-fork']],
    },
};

// const FARM_REWARDS = {
//     mainnet: {
//         // '1INCH-ETH': '',
//         // '1INCH-DAI': '',
//         // '1INCH-WBTC': '',
//         // '1INCH-USDC': '',
//         // '1INCH-USDT': '',
//         // '1INCH-YFI': '',
//     },
//     'mainnet-fork': {
//         // '1INCH-ETH': '',
//         // '1INCH-DAI': '',
//         // '1INCH-WBTC': '',
//         // '1INCH-USDC': '',
//         // '1INCH-USDT': '',
//         // '1INCH-YFI': '',
//     },
// };

// const FARMING_REWARDS = {
//     mainnet: {
//         // '1INCH-ETH': '',
//         // '1INCH-DAI': '',
//         // '1INCH-WBTC': '',
//         // '1INCH-USDC': '',
//         // '1INCH-USDT': '',
//         // '1INCH-YFI': '',
//     },
//     'mainnet-fork': {
//         // '1INCH-ETH': '',
//         // '1INCH-DAI': '',
//         // '1INCH-WBTC': '',
//         // '1INCH-USDC': '',
//         // '1INCH-USDT': '',
//         // '1INCH-YFI': '',
//     },
// };

const DEPLOYER = {
    // mainnet: '',
    // 'mainnet-fork': '',
};

const GOV_WALLET = {
    mainnet: '',
    'mainnet-fork': '',
};

const FACTORY = {
    // mainnet: '0xC4A8B7e29E3C8ec560cd4945c1cF3461a85a148d',
    // 'mainnet-fork': '0xC4A8B7e29E3C8ec560cd4945c1cF3461a85a148d',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network === 'test' || network === 'coverage') {
            // migrations are not required for testing
            return;
        }

        // const token = await TokenMock.at(TOKEN[network]);
        // console.assert(await token.owner() == POOL_OWNER[network], "Invalid owner");
        const governanceMothership = (network in MOTHERSHIP) ? await GovernanceMothership.at(MOTHERSHIP[network]) : await deployer.deploy(GovernanceMothership, token.address);

        // Exchange Governance

        const exchangeGovernance = await deployer.deploy(ExchangeGovernance, governanceMothership.address);
        // await governanceMothership.addModule(exchangeGovernance.address);

        // Mooniswap Factory

        // const mooniswapDeployer = (network in DEPLOYER) ? await MooniswapDeployer.at(DEPLOYER[network]) : await deployer.deploy(MooniswapDeployer);
        // const mooniswapFactory = (network in FACTORY) ? await MooniswapFactory.at(FACTORY[network]) : await deployer.deploy(
        //     MooniswapFactory,
        //     POOL_OWNER[network],
        //     mooniswapDeployer.address,
        //     governanceMothership.address,
        // );
        // await governanceMothership.addModule(mooniswapFactory.address);

        // Governance

        // const govRewards = (network in GOV_REWARDS) ? await GovernanceRewards.at(GOV_REWARDS[network]) : await deployer.deploy(GovernanceRewards, token.address, governanceMothership.address);
        // await governanceMothership.addModule(govRewards.address);

        // await mooniswapFactory.setGovernanceWallet(GOV_WALLET[network]);
        // await govRewards.setRewardDistribution(GOV_WALLET[network]);

        // const referralFeeReceiver = await deployer.deploy(ReferralFeeReceiver, token.address, mooniswapFactory.address);
        // await mooniswapFactory.setFeeCollector(referralFeeReceiver.address);

        // Transfer Ownership

        // await governanceMothership.transferOwnership(POOL_OWNER[network]);
        // await govRewards.transferOwnership(POOL_OWNER[network]);
        // await mooniswapFactory.transferOwnership(POOL_OWNER[network]);

        // Pools

        // for (const [, [token0, token1]] of Object.entries(POOLS[network])) {
        //     await mooniswapFactory.deploy(token0, token1);
        // }

        // Farming

        // for (const [poolName, [token0, token1]] of Object.entries(POOLS[network])) {
        //     console.log('Farming: ', poolName)
        //     const pool = await mooniswapFactory.pools(token0, token1);
        //     const poolRewards = await deployer.deploy(FarmingRewards, pool, token.address);
        //     // const poolRewards = await FarmingRewards.at('0xD7936052D1e096d48C81Ef3918F9Fd6384108480')
        //     await poolRewards.setRewardDistribution(POOL_OWNER[network]);
        //     await poolRewards.transferOwnership(POOL_OWNER[network]);

        //     // await token.transfer(poolRewards.address, FARM_REWARDS[network][poolName]);
        //     // await poolRewards.notifyRewardAmount(FARM_REWARDS[network][poolName]);
        // }
    });
};
