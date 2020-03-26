
require('babel-polyfill');
const blockchain = require('../lib/blockchain');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
// Models.
const Block = require('../model/block');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const STXO = require('../model/stxo');

const { log } = console;

function handleError(msg, e) {
  log(msg);
  log(e);
}

async function logError(err, height) {
  if (err && err.message && err.message.includes('duplicate key error collection')) {
    return null;
  }

  if (height) {
    return handleError(
      `Error recording block data at height ${height}`,
      err,
    );
  }

  return log(err);
}

/**
 * Process the blocks and transactions.
 * @param {Number} start The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */
async function syncBlocks(start, stop, clean = false) {
  log(start, stop);

  if (clean) {
    await Block.deleteMany({ height: { $gte: start, $lte: stop } });
    await TX.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await UTXO.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await STXO.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  }

  for(let height = start; height <= stop; height++) {
    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

    if (rpcblock.confirmations < 1) {
      console.log('orphan - block', height);
    }    
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'block';
  let code = 0;

  try {
    const info = await rpc.call('getinfo');
    const block = await Block.findOne().sort({ height: -1});

    // let clean = true; // Always clear for now.
    let dbHeight = block && block.height ? block.height : 1;
    let rpcHeight = info.blocks;

    // If heights provided then use them instead.
    if (!isNaN(process.argv[2])) {
      // clean = true;
      dbHeight = parseInt(process.argv[2], 10);
    }
    if (!isNaN(process.argv[3])) {
      // clean = true;
      rpcHeight = parseInt(process.argv[3], 10);
    }
    // If nothing to do then exit.
    if (dbHeight >= rpcHeight) {
      return;
    }
    // If starting from genesis skip.
    else if (dbHeight === 0) {
      dbHeight = 1;
    }

    locker.lock(type);
    await syncBlocks(dbHeight, rpcHeight, true);
  } catch(err) {
    logError(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch(err) {
      logError(err);
      code = 1;
    }
    exit(code);
  }
}

update();
