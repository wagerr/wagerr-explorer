require('babel-polyfill')
const blockchain = require('../lib/blockchain')
const {exit, rpc} = require('../lib/cron')
const {forEachSeries} = require('p-iteration')
const locker = require('../lib/locker')
const util = require('./util')
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
async function syncBlocksForStatistic (start, stop, clean = false) {
  if (clean) {
    await Statistic.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  }  

  if (stop - start > 50000) stop = start + 50000;
   
  const latest_statistic = await Statistic.findOne({blockHeight: { $lt: start}}).sort({blockHeight: -1});  

  let totalBet =  latest_statistic && latest_statistic.totalBet ? latest_statistic.totalBet : 0
  let totalMint =  latest_statistic && latest_statistic.totalMint ? latest_statistic.totalMint : 0
  let totalPayout =  latest_statistic && latest_statistic.totalPayout ? latest_statistic.totalPayout : 0
  let totalPayoutUSD =  latest_statistic && latest_statistic.totalPayoutUSD ? latest_statistic.totalPayoutUSD : 0

  // console.log('totalBet', totalBet);
  // console.log('totalMint', totalMint);
  // console.log('totalPayout', totalPayout);
  // console.log('totalPayoutUSD', totalPayoutUSD);

  const blocks = await Block.find({height: { $gte: start , $lte: stop}})

  const betData = await BetAction.aggregate([
    {$match: {blockHeight: { $gte: start , $lte: stop}}},
    { $group: { _id: "$blockHeight", total: { $sum: '$betValue' }, totalpayout: { $sum: '$payout' }, totalpayoutUSD: { $sum: '$payoutUSD' } } }
  ]);
  

  let betactionBetData = {};
  let betactionPayoutData = {}
  let betactionPayoutUSDData = {}
  for (const item_bet_data of betData){
    betactionBetData[item_bet_data._id] = item_bet_data.total;
    betactionPayoutData[item_bet_data._id] = item_bet_data.totalpayout;
    betactionPayoutUSDData[item_bet_data._id] = item_bet_data.totalpayoutUSD
  }
  //console.log("betbetactionBetDataData", betactionBetData, betactionPayoutData);


  const parlayData = await BetParlay.aggregate([
    {$match: {blockHeight: { $gte: start , $lte: stop}}},
    { $group: { _id: '$blockHeight', total: { $sum: '$betValue' }, totalpayout: { $sum: '$payout' }, totalpayoutUSD: { $sum: '$payoutUSD' } } }
  ]);

  let parlayBetData = {};
  let parlayPayoutData = {};
  let parlayPayoutUSDData = {};
  for (const item_parlay_data of parlayData){
    parlayBetData[item_parlay_data._id] = item_parlay_data.total;
    parlayPayoutData[item_parlay_data._id] = item_parlay_data.totalpayout;
    parlayPayoutUSDData[item_parlay_data._id] = item_parlay_data.totalpayoutUSD
  }

  const resultDatas = await BetResult.aggregate([
    {$match: {blockHeight: { $gte: start , $lte: stop}}},
  ]);

  let resultPayoutDatas = {};
  for (const item_result of resultDatas){
    if (resultPayoutDatas[item_result.blockHeight]){
      resultPayoutDatas[item_result.blockHeight].push(item_result);
    } else {
      resultPayoutDatas[item_result.blockHeight] = [];
      resultPayoutDatas[item_result.blockHeight].push(item_result);
    }    
  }

  let batchStatistic = [];

  for (let block of blocks) {
    if (betactionBetData[block.height]){
      totalBet = totalBet + betactionBetData[block.height]
    }

    if (parlayBetData[block.height]){
      totalBet = totalBet + parlayBetData[block.height]
    }

    let resultData = resultPayoutDatas[block.height]
    if (resultData && resultData.length !== 0 ){
      resultData.forEach(queryResult => {
        let startIndex = 2
        let obj_checked = false;
        
        if (typeof queryResult.payoutTx !== "undefined" && typeof queryResult.payoutTx.vout !== "undefined"){
          if (queryResult.payoutTx.vout.length > 2){
            if (typeof queryResult.payoutTx.vout[1].address !== "undefined" && typeof queryResult.payoutTx.vout[2].address !== "undefined")
            {
              obj_checked = true;
            }
          }
        }
        if (obj_checked){
          if (queryResult.payoutTx.vout[1].address === queryResult.payoutTx.vout[2].address) {
            startIndex = 3
          }
        }
        for (let i = startIndex; i < queryResult.payoutTx.vout.length - 1; i++) {
          totalMint = totalMint + queryResult.payoutTx.vout[i].value
        }
      })
    }

    
      let total_bet_wgr = 0;
      let total_bet_usd = 0;
      let total_parlay_wgr = 0;
      let total_parlay_usd = 0;
          
      if (betactionPayoutData[block.height]){
        total_bet_wgr = betactionPayoutData[block.height]
        total_bet_usd = betactionPayoutUSDData[block.height]
      }

      if (parlayPayoutData[block.height]){
        total_parlay_wgr = parlayPayoutData[block.height]
        total_parlay_usd = parlayPayoutUSDData[block.height]
      }
        
      totalPayout = totalPayout + (total_bet_wgr + total_parlay_wgr);
      totalPayoutUSD = totalPayoutUSD + (total_bet_usd + total_parlay_usd);
   
    // console.log('totalBet', totalBet);
    // console.log('totalMint', totalMint);
    // console.log('totalPayout', totalPayout);
    // console.log('totalPayoutUSD', totalPayoutUSD);
   
  let statistic = new Statistic({
    blockHeight: block.height,
    createdAt: block.createdAt,
    totalBet: totalBet,
    totalMint: totalMint,
    totalPayout: totalPayout,
    totalPayoutUSD: totalPayoutUSD
  })

  batchStatistic.push(statistic);
}

await Statistic.insertMany(batchStatistic);

console.log('syncBlocksForStatistic', start, stop);
}

/**
 * Handle locking.
 */
async function update () {
  const type = 'statistic'
  let code = 0
 
  try {
    log('Running statistic cron job');
    const statistic = await Statistic.findOne().sort({blockHeight: -1})
    const betResult = await BetResult.findOne().sort({blockHeight: -1})

    let clean = true // Always clear for now.
    let dbStatisticHeight =  statistic && statistic.blockHeight ? statistic.blockHeight : 10000

    let startHeight = dbStatisticHeight

    
    let dbResultHeight =  betResult && betResult.blockHeight ? betResult.blockHeight : 1

    let stopHeight = [dbResultHeight].sort().reverse()[0]

    // If heights provided then use them instead.
    if (!isNaN(process.argv[2])) {
      clean = true
      startHeight = parseInt(process.argv[2], 10)
    }
    if (!isNaN(process.argv[3])) {
      clean = true
      stopHeight = parseInt(process.argv[3], 10)
    }
    console.log(startHeight, stopHeight, clean)
    // If nothing to do then exit.
    if (startHeight >= stopHeight) {
      return
    }
    // If starting from genesis skip.
    else if (startHeight === 0) {
      startHeight = 10000
    }
    locker.lock(type)
    await syncBlocksForStatistic(startHeight, stopHeight, clean)
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
