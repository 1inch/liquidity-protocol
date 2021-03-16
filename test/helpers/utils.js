const { constants, time, time: { advanceBlock } } = require('@openzeppelin/test-helpers');
const { promisify } = require('util');

async function trackReceivedToken (token, wallet, txPromise) {
    return (await trackReceivedTokenAndTx(token, wallet, txPromise))[0];
}

async function trackReceivedTokenAndTx (token, wallet, txPromise) {
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

    return [postBalance.sub(preBalance).add(txFees), txResult];
}

async function timeIncreaseTo (seconds) {
    await network.provider.send("evm_setNextBlockTimestamp", [seconds.toNumber()]);
    await network.provider.send("evm_mine");
}

async function countInstructions (txHash, instruction) {
    const trace = await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        method: 'debug_traceTransaction',
        params: [txHash, {}],
        id: new Date().getTime(),
    });

    const str = JSON.stringify(trace);

    if (Array.isArray(instruction)) {
        return instruction.map(instr => {
            return str.split('"' + instr.toUpperCase() + '"').length - 1;
        });
    }

    return str.split('"' + instruction.toUpperCase() + '"').length - 1;
}

/**
 * Sends JSON RPC call with payload to the node
 * @param {Object} payload JSON RPC payload
 */
async function send(payload) {
    return promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        id: new Date().getTime(),
        ...payload,
    });
}

/**
 *  Takes a snapshot and returns the ID of the snapshot for restoring later.
 * @returns {string} id
 */
async function takeSnapshot () {
    const { result } = await send({ method: 'evm_snapshot', params: [] });
    await advanceBlock();

    return result;
}

/**
 *  Restores a snapshot that was previously taken with takeSnapshot
 *  @param {string} id The ID that was returned when takeSnapshot was called.
 */
async function restoreSnapshot (id) {
    await send({
        method: 'evm_revert',
        params: [id],
    });
    await advanceBlock();
}

module.exports = {
    trackReceivedToken,
    trackReceivedTokenAndTx,
    countInstructions,
    timeIncreaseTo,
    takeSnapshot,
    restoreSnapshot
};
