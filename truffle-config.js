const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey = '';
const kovanEndpointUrl = '';
const mainnetEndpointUrl = '';
const bscEndpointUrl = '';

module.exports = {
    networks: {
        kovan: {
            provider: function() {
                return new HDWalletProvider({
                    privateKeys: [privateKey],
                    providerOrUrl: kovanEndpointUrl,
                    pollingInterval: 5000
                });
            },
            gas: 5000000,
            gasPrice: 160000000000, // 160 wgei
            network_id: 42
        },
        mainnet: {
            provider: function() {
                return new HDWalletProvider({
                    privateKeys: [privateKey],
                    providerOrUrl: mainnetEndpointUrl,
                    pollingInterval: 5000
                });
            },
            gas: 6000000,
            gasPrice: 160000000000, // 160 wgei
            network_id: 1
        },
        bsc: {
            provider: function() {
                return new HDWalletProvider({
                    privateKeys: [privateKey],
                    providerOrUrl: bscEndpointUrl,
                    pollingInterval: 5000
                });
            },
            gas: 6000000,
            gasPrice: 1000000000, // 1 wgei
            network_id: 56
        }
    },
    compilers: {
        solc: {
            version: '0.6.12',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1000
                }
            }
        }
    },
    plugins: [
        'solidity-coverage',
        'truffle-plugin-verify'
    ],
    api_keys: {
        etherscan: ''
    },
    mocha: { // https://github.com/cgewecke/eth-gas-reporter
        reporter: 'eth-gas-reporter',
        reporterOptions: {
            currency: 'USD',
            gasPrice: 10,
            onlyCalledMethods: true,
            showTimeSpent: true,
            excludeContracts: ['Migrations', 'mocks']
        }
    }
};
