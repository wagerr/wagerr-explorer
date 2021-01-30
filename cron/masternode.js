
require('babel-polyfill');
require('../lib/cron');

const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const locker = require('../lib/locker');
const moment = require('moment');
const { log } = console;
// Models.
const Masternode = require('../model/masternode');

console.log('Running masternode cron job');

/**
 * Get a list of the mns and request IP information
 * from freegeopip.net.
 */
async function syncMasternode() {
  const date = moment().utc().startOf('minute').toDate();

  await Masternode.deleteMany({});

  // Increase the timeout for masternode.
  rpc.timeout(20000); // 10 secs

  const mns = await rpc.call('listmasternodes');
  const inserts = [];
  await forEach(mns, async (mn) => {
    const masternode = new Masternode({
      active: mn.activetime,
      addr: mn.addr,
      createdAt: date,
      lastAt: new Date(mn.lastseen * 1000),
      lastPaidAt: new Date(mn.lastpaid * 1000),
      network: mn.network,
      rank: mn.rank,
      status: mn.status,
      txHash: mn.txhash,
      txOutIdx: mn.outidx,
      ver: mn.version
    });

    inserts.push(masternode);
  });

  if (inserts.length) {
    await Masternode.insertMany(inserts);
  }

  console.log('Finish masternode cron job');
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'masternode';
  let code = 0;

  try {
    locker.lock(type);
    await syncMasternode();
    locker.unlock(type);
  } catch(err) {
    log(err);
    code = 1;
    exit(code);
  } finally {
    code = 0;
    exit(code);
  }
}

update();
