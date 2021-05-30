const TX = require('../model/tx');
require('babel-polyfill');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
const { BigNumber } = require('bignumber.js');
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
const BetParlay = require('../model/betparlay');

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


async function getAddressBalance(address){
  try {
    const txs = await TX
      .aggregate([
        { $match: { $or: [{ 'vout.address': address }, { 'vin.address': address }] } },
        { $sort: { blockHeight: -1 } },
      ])
      .allowDiskUse(true)
      .exec();

    const sent = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
      .reduce((acc, tx) => acc.plus(tx.vin.reduce((a, t) => {
        if (t.address === address) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))), BigNumber(0.0));

    const received = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
      .reduce((acc, tx) => acc.plus(tx.vout.reduce((a, t) => {
        if (t.address === address) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))), BigNumber(0.0));

    const staked = txs.filter((tx) => tx.vout[0].address === 'NON_STANDARD')
      .reduce((acc, tx) => acc.minus(tx.vin.reduce((a, t) => {
        if (t.address === address) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))).plus(tx.vout.reduce((a, t) => {
        if (t.address === address) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))), BigNumber(0.0));

    const balance = received.plus(staked).minus(sent);
   return {
      balance: balance.toNumber(),
      sent: sent.toNumber(),
      staked: staked.toNumber(),
      received: received.toNumber()
    }
  } catch (err) {
    console.log(err);
    return 0;
  }
}

/**
 * Get the coin related information including things
 * like price coinmarketcap.com or coingecko data.
 */
async function syncCoin() {
  console.log('syncCoin');
  
  const coin = await Coin.findOne().sort({createdAt: -1});
  const last_block = await Block.findOne().sort({createdAt:-1})
  let last_block_date = last_block && last_block.createdAt ? moment(last_block.createdAt).toDate() : moment('2021-01-07T07:03:00.000+00:00').toDate()
  let last_date =  coin && coin.createdAt ? moment(coin.createdAt).toDate() : moment('2021-01-07T07:03:00.000+00:00').toDate()
  let ytd = moment('2021-01-07T07:03:00.000+00:00').toDate() 

  
  let totalBetSingleYTD = 0;
  let totalBetParlayYTD = 0;
  let totalMintParlayYTD = 0;

  let totalBetPending = 0;

  let totalBet = 0;
  let totalMint = 0;
  

  let totalBetYTD = 0;
  let totalMintYTD = 0;

  const betData = await BetAction.aggregate([
    {
      $sort: {
        payoutDate: -1
      }
    },
    {
      $match: { 
        $and:[
        { payoutDate: { $gte: last_date } },
        { payoutDate: { $lt: last_block_date } }
      ] 
    }
  }

  ]).allowDiskUse(true);

  const parlayData = await BetParlay.aggregate([
    {
      $sort: {
        payoutDate: -1
      }
    },
    {
      $match: { 
        $and:[
        { payoutDate: { $gte: last_date } },
        { payoutDate: { $lt: last_block_date } }
      ] 
    }
  }

  ]).allowDiskUse(true);

  const pendingBetData = await BetAction.aggregate([

    {
      $match: { 
        $and: [
          {completed: false },
          {createdAt: {$gt: moment('2021-01-01T00:00:00.000+00:00').toDate()} }
        ]
        
    }
  }

  ]).allowDiskUse(true);

  const pendingParlayData = await BetParlay.aggregate(
    [ {
      $match: { 
        $and: [
          {completed: false },
          {createdAt: {$gt: moment('2021-01-01T00:00:00.000+00:00').toDate()} }
        ]
        
    }
  }
]).allowDiskUse(true);


  const resultDatas = await BetResult.aggregate([
    {
      $sort: {
        "payoutTx.createdAt": -1
      }
    },
    {
      $match: {
        $and:[
        {"payoutTx.createdAt": {
          $gte: last_date
        } },
        {"payoutTx.createdAt": {
          $lt: last_block_date
        } }
      ]
      },
    }
    ]).allowDiskUse(true);

  
    betData.forEach(action => {
     
        totalBetSingleYTD += action.betValue
        totalMintYTD += action.payout
        
    })
  
    pendingBetData.forEach(action => {
      totalBetPending += action.betValue
   })

    parlayData.forEach(action => {

        totalBetParlayYTD += action.betValue
        totalMintParlayYTD += action.payout
        totalMintYTD += action.payout
        
    })

  pendingParlayData.forEach(action => {

    totalBetPending += action.betValue
  })
    
  resultDatas.forEach(result => {
    // const { payoutTx } = result;
    let startIndex = 2
    if (result.payoutTx && result.payoutTx.vout.length < 3) {
      console.log(result.payoutTx);
    } else {
      if (result.payoutTx.vout[1].address === result.payoutTx.vout[2].address) {
        startIndex = 3
      }
      for (let i = startIndex; i < result.payoutTx.vout.length - 1; i++) {
           if(result.payoutTx.vout[i].address === config.coin.oracle_payout_address[0] || result.payoutTx.vout[i].address === config.coin.dev_payout_address[0])
          {
            totalMintYTD += result.payoutTx.vout[i].value
          }
       
        
    }
  }

  }) 
  
  
  
  totalBetYTD = totalBetSingleYTD + totalBetParlayYTD // totalBet YTD
 
  if (coin && typeof coin.createdAt != "undefined") {
    totalMint = coin.totalMint +  totalMintYTD;
    totalBet = coin.totalBet +  totalBetYTD;
    totalBetParlay = coin.totalBetParlay + totalBetParlayYTD
    totalMintParlay = coin.totalMintParlay + totalMintParlayYTD
    totalBetYTD = coin.totalBetYTD + totalBetYTD
    totalMintYTD = coin.totalMintYTD + totalMintYTD
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

  const firstSentFromOracle = (await TX.find({'vin.address': config.coin.oracle_payout_address[0]})
    .sort({blockHeight: 1})
    .limit(1).exec())[0]
  let payoutPerSecond = 0
  if (firstSentFromOracle){
    const oracleTxs = await TX
      .aggregate([
        {
          $match: {
            $and: [
              {'blockHeight': {$gt: firstSentFromOracle.blockHeight}},
              {'vout.address': config.coin.oracle_payout_address[0]}
            ]
          }
        },
        {$sort: {blockHeight: 1}}
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
    payoutPerSecond = payout / (moment().unix() - moment(firstSentFromOracle.createdAt).unix())
  }

  const oracleBalance = (await getAddressBalance(config.coin.oracle_payout_address[0])).balance

  const profitOraclePerDay = payoutPerSecond * 60 * 60 * 24 / masternodes.stable;
  const rewardMasternodePerDay = 2.85 * 1440 / masternodes.stable;
  const totalROI = (profitOraclePerDay + rewardMasternodePerDay) * 36500 / 25000

console.log('syncCoin3');

try {
  const priceTicker = 'https://api.coingecko.com/api/v3/simple/price?ids=wagerr&vs_currencies=btc%2Cusd&include_market_cap=true';
 
  let ticker = await fetch(priceTicker);
  let usdPrice, btcPrice, marketCapUsd, marketCapBtc;

  if (ticker.wagerr) {
    usdPrice = ticker.wagerr.usd;
    btcPrice = ticker.wagerr.btc;
    marketCapUsd = ticker.wagerr.usd_market_cap;
    marketCapBtc = ticker.wagerr.btc_market_cap;
  }
  
  console.log('syncCoin5');
  
  const nextSuperBlock = await rpc.call('getnextsuperblock')

  const coin = new Coin({
    cap: marketCapUsd,
    capEur: 0,//eurMarket.quote.EUR.market_cap,
    createdAt: last_block_date,
    blocks: info.blocks,
    btc: marketCapBtc,
    btcPrice: btcPrice,
    diff: info.difficulty,
    mnsOff: masternodes.total - masternodes.stable,
    mnsOn: masternodes.stable,
    netHash: nethashps,
    peers: info.connections,
    status: 'Online',
    supply: info.moneysupply,
    usd: usdPrice,
    eur: 0,//eurMarket.quote.EUR.price,
    totalBetParlay: totalBetParlay,
    totalMintParlay: totalMintParlay,
    oracleBalance: oracleBalance,
    totalBet: totalBet,
    totalPendingBet: totalBetPending,
    totalMint: totalMint,
    totalBetYTD: totalBetYTD,
    totalMintYTD: totalMintYTD,
    oracleProfitPerSecond: payoutPerSecond,
    totalROI: totalROI,
    nextSuperBlock:nextSuperBlock
  });

  await coin.save();

} catch(err) {
  log(err)
}
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
