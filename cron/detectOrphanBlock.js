require('babel-polyfill');
const { exit, rpc } = require('../lib/cron');
const locker = require('../lib/locker');
const Block = require('../model/block');
const blockchain = require('../lib/blockchain');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const STXO = require('../model/stxo');
const BetAction = require('../model/betaction');
const BetEvent = require('../model/betevent');
const BetResult = require('../model/betresult');
const BetParlay = require('../model/betparlay');
const { forEachSeries } = require('p-iteration');
const util = require('./util');
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

const {
  syncBlocksForBet  
} = require('./methods');


async function syncBlocks(start, stop, clean = false) {
  log(start, stop);

  if (clean) {
    await Block.deleteMany({ height: { $gte: start, $lte: stop } });
    await TX.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await UTXO.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await STXO.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await  BetAction.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await  BetParlay.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await  BetEvent.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await  BetResult.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  }

  for(let height = start; height <= stop; height++) {
    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

    //if (rpcblock.confirmations < 1) break; 
    const block = new Block({
      hash,
      height,
      bits: rpcblock.bits,
      confirmations: rpcblock.confirmations,
      createdAt: new Date(rpcblock.time * 1000),
      diff: rpcblock.difficulty,
      merkle: rpcblock.merkleroot,
      nonce: rpcblock.nonce,
      prev: rpcblock.prevblockhash ? rpcblock.prevblockhash : 'GENESIS',
      size: rpcblock.size,
      txs: rpcblock.tx ? rpcblock.tx : [],
      ver: rpcblock.version
    });

    const rpctxs = [];

    await forEachSeries(block.txs, async (txhash) => {
      const rpctx = await util.getTX(txhash);
      rpctxs.push(rpctx);

      if (blockchain.isPoS(block)) {
        await util.addPoS(block, rpctx);
      } else {
        await util.addPoW(block, rpctx);
      }
    });

    block.rpctxs = rpctxs;
    try {
      await block.save();
      log(`Height: ${ block.height } Hash: ${ block.hash }`);
    } catch (e) {
      logError(e, block.height);
    }
  }
}

async function start(){
  try {
    const end_block = await Block.findOne().sort({ height: -1});
    let dbHeight = end_block && end_block.height && (end_block.height - 5) > 1  ? end_block.height - 5 : 1;
    console.log('dbHeight', dbHeight);
    const blocks = await Block.find({height: {$lt: dbHeight}, confirmations: {$lt: 3}}).sort({ height: -1});
    for (const block of blocks){
      const rpcblock = await rpc.call('getblock', [block.hash]);
      block.confirmations = rpcblock.confirmations
      await block.save();
      if (block.confirmations < 3){
        await syncBlocks(block.height-1, block.height, true);
        await syncBlocksForBet(block.height-1, block.height, true);
      }
    }
  } catch (err){
    console.log(err);
  }
}

async function update() {
  const type = 'detectOrphanBlock';
  let code = 0;

  try {
    locker.lock(type);
    await start();
    locker.unlock(type);
  } catch (err) {
    log(err);
    code = 1;
    exit(code);
  } finally {
    code = 0;
    exit(code);
  }
}


update();