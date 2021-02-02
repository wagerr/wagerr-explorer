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
  console.log('syncPayoutData');
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
  console.log('syncCoin');
  const date = moment().utc().startOf('minute').toDate();

  const coins = await Coin.find({}).sort({createdAt: -1}).limit(1);
  console.log(coins);

  let last_date = moment('1970-01-01T00:00:00.000+00:00').toDate();

  if (coins.length > 0 && typeof coins[0].lastResultCreatedAt != "undefined") {
    console.log('abc');
    last_date = moment(coins[0].lastResultCreatedAt).toDate();
  }
  console.log(last_date);

  const queryResults = await BetResult.aggregate([
    {
      $match:{
        createdAt: {$gt: last_date}
      }
    },
    {
      $group: {
        _id: '$eventId',
        results: {
          $push: '$$ROOT'
        },
      },
    },{
      $project: {
        _id: '$_id',
        createdAt: { $max: '$results.createdAt'},
      },
    },{
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: 'betparlays',
        localField: '_id',
        foreignField: 'eventId',
        as: 'parlays'
      }
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
  ]).allowDiskUse(true);

  console.log(queryResults);

  let totalBet = 0;
  let totalMint = 0;
 
  queryResults.forEach(queryResult => {
    queryResult.actions.forEach(action => {
      totalBet += action.betValue
    })
    queryResult.parlays.forEach(action => {
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

  if (coins.length > 0 && typeof coins[0].lastResultCreatedAt != "undefined") {
    totalMint = coins[0].totalMint +  totalMint;
    totalBet = coins[0].totalBet +  totalBet;
  }

  console.log('syncCoin4', totalMint, totalBet);
  
  rpc.timeout(50000)
  const info = await rpc.call('getinfo');  
  const masternodes = await rpc.call('getmasternodecount');
  console.log('syncCoin1');
  const nethashps = await rpc.call('getnetworkhashps');
  const utxo = await UTXO.aggregate([
    {$match: {address: {$ne: 'ZERO_COIN_MINT'}}},
    {$match: {address: {$not: /OP_RETURN/}}},
    {$group: {_id: 'supply', total: {$sum: '$value'}}}
  ])
  console.log('syncCoin2');
  const lastSentFromOracle = (await TX.find({'vin.address': config.coin.oracle_payout_address[0]})
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
              {'vout.address': config.coin.oracle_payout_address[0]}
            ]
          }
        },
        {$sort: {blockHeight: -1}}
      ])
      .allowDiskUse(true)
      .exec()

    const payout = oracleTxs.reduce((acc, tx) => acc + tx.vout.reduce((a, t) => {
      if (t.address === config.coin.oracle_payout_address[0]) {
        return a + t.value
      } else {
        return a
      }
    }, 0.0), 0.0)
    payoutPerSecond = payout / (moment().unix() - moment(lastSentFromOracle.createdAt).unix())
  }
  console.log('syncCoin3');



  const usdUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ config.coinMarketCap.tickerId }&CMC_PRO_API_KEY=5319954a-0d37-45da-883e-d36ce1d0f047&convert=USD`;
  const btcUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ config.coinMarketCap.tickerId }&CMC_PRO_API_KEY=9fb9f39e-e942-4fc9-a699-47efcc622ea0&convert=BTC`;
  //const eurUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ config.coinMarketCap.tickerId }&CMC_PRO_API_KEY=937ce6ea-d220-4a0c-9439-23f9e28993b3&convert=EUR`;
  
  let usdMarket = await fetch(usdUrl);
  let btcMarket = await fetch(btcUrl);
  //let eurMarket = await fetch(eurUrl);
  
   if (usdMarket.data) {
     usdMarket = usdMarket.data ? usdMarket.data[`${ config.coinMarketCap.tickerId }`] : {};
   }

   if (btcMarket.data) {
     btcMarket = btcMarket.data ? btcMarket.data[`${ config.coinMarketCap.tickerId }`] : {};
   }

  // if (eurMarket.data) {
  //   eurMarket = eurMarket.data ? eurMarket.data[`${ config.coinMarketCap.tickerId }`] : {};
  // }

  
  //console.log(btcMarket, usdMarket);
  console.log('syncCoin5');
  
  const nextSuperBlock = await rpc.call('getnextsuperblock')
  if (queryResults.length > 0 && typeof queryResults[0].createdAt != "undefined"){
    console.log(queryResults[0]);
    last_date = moment(queryResults[0].createdAt).toDate();
  }
  
  const coin = new Coin({
    cap: usdMarket.quote.USD.market_cap,
    capEur: 0,//eurMarket.quote.EUR.market_cap,
    createdAt: date,
    blocks: info.blocks,
    lastResultCreatedAt: last_date,
    btc: btcMarket.quote.BTC.market_cap,
    btcPrice: btcMarket.quote.BTC.price,
    diff: info.difficulty,
    mnsOff: masternodes.total - masternodes.stable,
    mnsOn: masternodes.stable,
    netHash: nethashps,
    peers: info.connections,
    status: 'Online',
    supply: info.moneysupply,
    usd: usdMarket.quote.USD.price,
    eur: 0,//eurMarket.quote.EUR.price,
    totalBet: totalBet,
    totalMint: totalMint,
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
