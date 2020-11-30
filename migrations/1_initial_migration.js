const Migrations = artifacts.require('./Migrations.sol');
const GovernanceMothership = artifacts.require('./inch/GovernanceMothership.sol');
const MooniswapDeployer = artifacts.require('./MooniswapDeployer.sol');
const MooniswapFactory = artifacts.require('./MooniswapFactory.sol');
const Rewards = artifacts.require('./governance/rewards/Rewards.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

const POOL_OWNER = {
    'kovan': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef',
    'development': '0x1cB37a0606003654b302bbD8fea408BFa066c6Ef'
};

module.exports = function(deployer, network) {
    let token, governanceMothership, mooniswapDeployer, mooniswapFactory, poolOwner;
    deployer.deploy(Migrations);

    deployer.deploy(TokenMock, 'BOOM', 'BOOM', 18)
        .then((t) => {
            token = t;
            deployer.deploy(GovernanceMothership, token.address)
                .then((gm) => {
                    governanceMothership = gm;
                    deployer.deploy(MooniswapDeployer).then((md) => {
                        mooniswapDeployer = md;
                        deployer.deploy(
                            MooniswapFactory,
                            POOL_OWNER[network],
                            mooniswapDeployer.address,
                            governanceMothership.address
                        )
                            .then((mf) => {
                                mooniswapFactory = mf;
                                deployer.deploy(Rewards);
                            });
                    });
                });
        });
};
