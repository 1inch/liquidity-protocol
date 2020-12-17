module.exports = function (deployer, network) {
    return deployer.then(async () => {
        if (network == 'test' || network == 'coverage') {
            // migrations are not required for testing
            return;
        }
    });
};
