const { constants, time } = require('@openzeppelin/test-helpers');

async function trackReceivedToken (token, wallet, txPromise) {
    const preBalance = web3.utils.toBN(
        (token === constants.ZERO_ADDRESS)
            ? await web3.eth.getBalance(wallet)
            : await token.balanceOf(wallet),
    );

    let txResult = await txPromise();
    if (txResult.receipt) {
        // Fix coverage since testrpc-sc gives: { tx: ..., receipt: ...}
        txResult = txResult.receipt;
    }
    let txFees = web3.utils.toBN('0');
    if (wallet.toLowerCase() === txResult.from.toLowerCase() && token === constants.ZERO_ADDRESS) {
        const receipt = await web3.eth.getTransactionReceipt(txResult.transactionHash);
        const tx = await web3.eth.getTransaction(receipt.transactionHash);
        txFees = web3.utils.toBN(receipt.gasUsed).mul(web3.utils.toBN(tx.gasPrice));
    }

    const postBalance = web3.utils.toBN(
        (token === constants.ZERO_ADDRESS)
            ? await web3.eth.getBalance(wallet)
            : await token.balanceOf(wallet),
    );

    return postBalance.sub(preBalance).add(txFees);
}

async function timeIncreaseTo (seconds) {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise(resolve => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

module.exports = {
    trackReceivedToken,
    timeIncreaseTo,
};
