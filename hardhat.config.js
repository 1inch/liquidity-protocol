require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-truffle5');
require('solidity-coverage');
require('hardhat-gas-reporter');
require('dotenv').config();

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
    networks: {
        hardhat: {
            blockGasLimit: 10000000,
        },
    },
    gasReporter: {
        enable: true,
        currency: 'USD',
    },
};
