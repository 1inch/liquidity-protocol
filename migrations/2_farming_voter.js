const FarmingVoter = artifacts.require('./inch/FarmingVoter.sol');

const FACTORY = {
    mainnet: '0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643',
    'mainnet-fork': '0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643',
};

const FARMING_VOTER = {
    mainnet: '0x11a5504D869409D6E43D6ee18B41c6E7F16B09dC',
    'mainnet-fork': '0x11a5504D869409D6E43D6ee18B41c6E7F16B09dC',
};

module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network === 'test' || network === 'coverage') {
            // migrations are not required for testing
            return;
        }

        const account = '0x11799622F4D98A24514011E8527B969f7488eF47';
        console.log('Deployer account: ' + account);
        console.log('Deployer balance: ' + (await web3.eth.getBalance(account)) / 1e18 + ' ETH');

        (network in FARMING_VOTER) ? await FarmingVoter.at(FARMING_VOTER[network]) : await deployer.deploy(FarmingVoter, FACTORY[network]);
    });
};
