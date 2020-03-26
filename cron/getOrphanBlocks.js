
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



async function findOrphanBlock(){
  const blocks = await Block.find({confirmations: {$lt: 1}});
  console.log(blocks);
  exit(0);
  
}

findOrphanBlock();
