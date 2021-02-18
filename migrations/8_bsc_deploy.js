// const assert = require('assert');

// const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
// const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
// const ReferralFeeReceiver = artifacts.require('./ReferralFeeReceiver.sol');

// const OWNER = '0x50A7291bF833303904A6313af274cC8A71044788';
// const MOTHERSHIP = '0x73F0a6927A3c04E679074e70DFb9105F453e799D';
// const GOV_WALLET = '0x7e11a8887A2c445883AcC453738635bC3aCDAdb6';
// const INCH = '0x111111111117dC0aa78b770fA6A738034120C302';


// module.exports = function (deployer, network) {
//     return deployer.then(async () => {
//         assert(network === 'bsc');

//         const account = '0x11799622F4D98A24514011E8527B969f7488eF47';
//         console.log('Deployer account: ' + account);
//         console.log('Deployer balance: ' + (await web3.eth.getBalance(account)) / 1e18 + ' ETH');


//         // Mooniswap Factory

//         const mooniswapDeployer = await deployer.deploy(MooniswapDeployer);

//         const mooniswapFactory = await deployer.deploy(
//             MooniswapFactory,
//             OWNER,
//             mooniswapDeployer.address,
//             MOTHERSHIP,
//         );

//         console.log(
//             'Do not forget to governanceMothership.addModule(mooniswapFactory.address), where:\n' +
//             ` - governanceMothership = ${MOTHERSHIP}\n` +
//             ` - mooniswapFactory = ${mooniswapFactory.address}\n`,
//         );

//         const feeCollector = await deployer.deploy(ReferralFeeReceiver, INCH, mooniswapFactory.address);

//         await Promise.all([
//             mooniswapFactory.setFeeCollector(feeCollector.address),
//             mooniswapFactory.setGovernanceWallet(GOV_WALLET),
//         ]);
//         await Promise.all([
//             feeCollector.transferOwnership(OWNER),
//             mooniswapFactory.transferOwnership(OWNER),
//         ]);
//     });
// };

module.exports = function (deployer, network) {
};
