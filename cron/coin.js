const TX = require('../model/tx');
require('babel-polyfill');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Coin = require('../model/coin');
const UTXO = require('../model/utxo');
const BetResult = require('../model/betresult');
const BetAction = require('../model/betaction');
const blockchain = require('../lib/blockchain');

const { forEachSeries } = require('p-iteration');

const util = require('./util');
// Models.
const Block = require('../model/block');

const { log } = console;

log('Running coin cron job');

async function syncPayoutData() {
  const betresults = await BetResult.find({ payoutTx: null });

  for (let x = 0; x < betresults.length; x += 1) {
    let result = betresults[x];

    let resultPayoutTxs = await TX.find({blockHeight: result.blockHeight+1});
    if (resultPayoutTxs.length === 0) {
      const block = await Block.findOne({ height: (result.blockHeight + 1) }).sort({ height: -1});
      for (let y = 0; y < block.rpctxs.length; y += 1) {
        const rpctx = block.rpctxs[y];
        if (blockchain.isPoS(block)) {
          try {
            await util.addPoS(block, rpctx);
            log('Ran addPoS');
          } catch (e) {
            log('Error adding PoS');
          }
        } else {
          try {
            await util.addPoW(block, rpctx);
            log('Ran addPoW');
          } catch (e) {
            log('Error adding PoW');
          }
        }
      }

      // log('Attaching to result');
      resultPayoutTxs = await TX.find({blockHeight: block.height+1});
      // log(resultPayoutTxs);

      result.payoutTx = resultPayoutTxs[0];
    } else {
      result.payoutTx = resultPayoutTxs[0];
    }

    try {
      await result.save();
      log(`betResult at height ${result.blockHeight} updated`);
    } catch (e) {
      log(e);
    }
  }


  log(betresults.length);
}


/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function syncCoin() {
  const date = moment().utc().startOf('minute').toDate();
  rpc.timeout(20000)
  const info = await rpc.call('getinfo');
  const masternodes = await rpc.call('getmasternodecount');
  const nethashps = await rpc.call('getnetworkhashps');
  const utxo = await UTXO.aggregate([
    {$match: {address: {$ne: 'ZERO_COIN_MINT'}}},
    {$match: {address: {$not: /OP_RETURN/}}},
    {$group: {_id: 'supply', total: {$sum: '$value'}}}
  ])

  const lastSentFromOracle = (await TX.find({'vin.address': config.coin.oracle_payout_address})
    .sort({blockHeight: -1})
    .limit(1).exec())[0]
  let payoutPerSecond = 0
  if (lastSentFromOracle){
    const oracleTxs = await TX
      .aggregate([
        {
          $match: {
            $and: [
              {'blockHeight': {$gt: lastSentFromOracle.blockHeight}},
              {'vout.address': config.coin.oracle_payout_address}
            ]
          }
        },
        {$sort: {blockHeight: -1}}
      ])
      .allowDiskUse(true)
      .exec()

    const payout = oracleTxs.reduce((acc, tx) => acc + tx.vout.reduce((a, t) => {
      if (t.address === config.coin.oracle_payout_address) {
        return a + t.value
      } else {
        return a
      }
    }, 0.0), 0.0)
    payoutPerSecond = payout / (moment().unix() - moment(lastSentFromOracle.createdAt).unix())
  }

  const queryResults = await BetResult.aggregate([
    {
      $group: {
        _id: '$eventId',
        results: {
          $push: '$$ROOT'
        },
      },
    },
    {
      $lookup: {
        from: 'betactions',
        localField: '_id',
        foreignField: 'eventId',
        as: 'actions'
      }
    }, {
      $lookup: {
        from: 'betresults',
        localField: '_id',
        foreignField: 'eventId',
        as: 'results'
      }
    }
  ])

  let totalBet = 0;
  let totalMint = 0;

  queryResults.forEach(queryResult => {
    queryResult.actions.forEach(action => {
      totalBet += action.betValue
    })
    queryResult.results.forEach(result => {
      // const { payoutTx } = result;
      let startIndex = 2
      if (result.payoutTx && result.payoutTx.vout.length < 3) {
        console.log(result.payoutTx);
      } else {
        if (result.payoutTx.vout[1].address === result.payoutTx.vout[2].address) {
          startIndex = 3
        }
        for (let i = startIndex; i < result.payoutTx.vout.length - 1; i++) {
          totalMint += result.payoutTx.vout[i].value
        }
      }
    })

  })

  // Setup the coinmarketcap.com api url.
  const eurUrl = `https://api.coinmarketcap.com/v2/ticker/${ config.coinMarketCap.tickerId }/?convert=EUR`;
  const btcUrl = `https://api.coinmarketcap.com/v2/ticker/${ config.coinMarketCap.tickerId }/?convert=BTC`;

  let eurMarket = await fetch(eurUrl);
  let btcMarket = await fetch(btcUrl);

  if (eurMarket.data) {
    eurMarket = eurMarket.data ? eurMarket.data : {};
  }

  if (btcMarket.data) {
    btcMarket = btcMarket.data ? btcMarket.data : {};
  }

  const nextSuperBlock = await rpc.call('getnextsuperblock')

  const coin = new Coin({
    cap: eurMarket.quotes.USD.market_cap,
    capEur: eurMarket.quotes.EUR.market_cap,
    createdAt: date,
    blocks: info.blocks,
    btc: btcMarket.quotes.BTC.market_cap,
    btcPrice: btcMarket.quotes.BTC.price,
    diff: info.difficulty,
    mnsOff: masternodes.total - masternodes.stable,
    mnsOn: masternodes.stable,
    netHash: nethashps,
    peers: info.connections,
    status: 'Online',
    supply: info.moneysupply,
    usd: eurMarket.quotes.USD.price,
    eur: eurMarket.quotes.EUR.price,
    totalBet: totalBet + 99071397.1752,
    totalMint: totalMint + 102107516.1294,
    oracleProfitPerSecond: payoutPerSecond,
    nextSuperBlock:nextSuperBlock
  });

  await coin.save();
  console.log('Finished coin sync function');
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'coin';
  let code = 0;

  try {
    locker.lock(type);
    await syncPayoutData();
    await syncCoin();
  } catch(err) {
    log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch(err) {
      log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
