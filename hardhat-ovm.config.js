require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-truffle5');
require('@eth-optimism/plugins/hardhat/compiler');
require('hardhat-deploy');
require('dotenv').config();

module.exports = {
    ovm: {
        solcVersion: '0.6.12',
    },
    solidity: {
        version: '0.6.12',
        settings: {
            optimizer: {
                enabled: true,
                runs: 0,
            },
            debug: {
                revertStrings: 'strip',
            },
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    networks: {
        'optimism-kovan': {
            url: 'https://kovan.optimism.io',
            chainId: 69,
            gasPrice: 0,
            gas: 6000000,
            accounts: [process.env.OPTIMISM_KOVAN_PRIVATE_KEY],
        },
    },
};
