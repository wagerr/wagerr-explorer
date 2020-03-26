
require('babel-polyfill');
const blockchain = require('../lib/blockchain');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
const TX = require('../model/tx');
const { BigNumber } = require('bignumber.js');


async function findOrphanBlock(){
  const address = 'Wm5om9hBJTyKqv5FkMSfZ2FDMeGp12fkTe';
  const txs = await TX
  .aggregate([
    { $match: { $or: [{ 'vout.address': address }, { 'vin.address': address }] } },
    { $sort: { blockHeight: -1 } },
  ])
  .allowDiskUse(true)
  .exec();

  let i = 0;
  const sent = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
  .reduce((acc, tx) => acc.plus(tx.vin.reduce((a, t) => {
    i++;
    if (t.address === address) {
      return a.plus(BigNumber(t.value));
    }

    return a;
  }, BigNumber(0.0))), BigNumber(0.0));

  console.log(i);
  exit(0);  
}

findOrphanBlock();
