require('babel-polyfill')
const blockchain = require('../lib/blockchain')
const {exit, rpc} = require('../lib/cron')
const {forEachSeries} = require('p-iteration')
const locker = require('../lib/locker')
const util = require('./util')
const moment = require('moment');
const config = require('../config');
const { log } = console;
// Models.
const Block = require('../model/block')
const Price = require('../model/price')
const Statistic = require('../model/statistic')
const TX = require('../model/tx')
const BetResult = require('../model/betresult')
const BetAction = require('../model/betaction')
const BetParlay = require('../model/betparlay')



/**
 * Process the blocks and transactions.
 * @param {Number} start The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */
async function syncBlocksForStatistic () {
  const latest_statistic = await Statistic.findOne().sort({createdAt: -1})
  const last_block = await Block.findOne().sort({createdAt:-1})
  let last_block_date = last_block && last_block.createdAt ? moment(last_block.createdAt).toDate() : moment('1970-01-01T00:00:00.000+00:00').toDate()
  let last_date =  latest_statistic && latest_statistic.createdAt ? moment(latest_statistic.createdAt).toDate() : moment('1970-01-01T00:00:00.000+00:00').toDate()
 
  let totalBet =  latest_statistic && latest_statistic.totalBet ? latest_statistic.totalBet : 0
  let totalMint =  latest_statistic && latest_statistic.totalMint ? latest_statistic.totalMint : 0
  let totalPayout =  latest_statistic && latest_statistic.totalPayout ? latest_statistic.totalPayout : 0
  let totalPayoutUSD =  latest_statistic && latest_statistic.totalPayoutUSD ? latest_statistic.totalPayoutUSD : 0

  // console.log('totalBet', totalBet);
  // console.log('totalMint', totalMint);
  // console.log('totalPayout', totalPayout);
  // console.log('totalPayoutUSD', totalPayoutUSD);


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

   total_single_bet_wgr = 0
   total_parlay_bet_wgr = 0

   total_single_bet_payout = 0
   total_parlay_bet_payout = 0
   
   total_single_bet_payout_usd = 0 
   total_parlay_bet_payout_usd = 0


  betData.forEach(action => {
    total_single_bet_wgr += action.betValue
    total_single_bet_payout += action.payout
    total_single_bet_payout_usd += action.payoutUSD

  })


  parlayData.forEach(action => {
    
    total_parlay_bet_wgr += action.betValue
    total_parlay_bet_payout += action.payout
    total_parlay_bet_payout_usd += action.payoutUSD
      
  }) 
    
 
      totalBet = totalBet + (total_single_bet_wgr + total_parlay_bet_wgr)
      totalPayout = totalPayout + (total_single_bet_payout + total_parlay_bet_payout);
      totalPayoutUSD = totalPayoutUSD + (total_single_bet_payout_usd + total_parlay_bet_payout_usd);
      totalMint = totalPayout;

      let duplicateTxs = {};
      resultDatas.forEach(result => {
        if(duplicateTxs[result.payoutTx.txId]) return;
        duplicateTxs[result.payoutTx.txId]=1;
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
                totalMint += result.payoutTx.vout[i].value // oracle/dev reward
              }
           
            
        }
      }
    
      }) 
   
    // console.log('totalBet', totalBet);
    // console.log('totalMint', totalMint);
    // console.log('totalPayout', totalPayout);
    // console.log('totalPayoutUSD', totalPayoutUSD);
   
  
  let statistic = new Statistic({
    createdAt: last_block_date,
    totalBet: totalBet,
    totalMint: totalMint,
    totalPayout: totalPayout,
    totalPayoutUSD: totalPayoutUSD
  })

  await statistic.save()


console.log('syncBlocksForStatistic', last_date);
}

/**
 * Handle locking.
 */
async function update () {
  const type = 'statistic'
  let code = 0
 
  try {
    log('Running statistic cron job');
    
    
    locker.lock(type)
    await syncBlocksForStatistic()
    locker.unlock(type)
  } catch (err) {
    log(err)
    code = 1
    exit(code)
  } finally {
    code = 0
    exit(code)
  }
}

update()
