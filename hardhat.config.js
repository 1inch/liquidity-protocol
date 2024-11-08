require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-truffle5');
require('hardhat-deploy');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('solidity-docgen');
require('dotenv').config();

const { oneInchTemplates } = require('@1inch/solidity-utils/docgen');
const networks = require('./hardhat.networks');

module.exports = {
    solidity: {
        version: '0.6.12',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks,
    etherscan: {
        apiKey: process.env.MAINNET_ETHERSCAN_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    gasReporter: {
        enable: true,
        currency: 'USD',
    },
    docgen: {
        outputDir: 'docs',
        templates: oneInchTemplates(),
        pages: 'files',
        exclude: ['mocks'],
    },
};
