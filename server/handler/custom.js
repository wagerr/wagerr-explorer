const Coin = require('../../model/coin')
const BetAction = require('../../model/betaction')
const BetParlay = require('../../model/betparlay')
const config = require('../../config')
const TX = require('../../model/tx')
const { BigNumber } = require('bignumber.js')
const UTXO = require('../../model/utxo');
const { rpc } = require('../../lib/cron');
const Price = require('../../model/price');
const getBetStatus = async (req, res) => {
  try {
    const txs = await TX
      .aggregate([
        {$match: {$or: [{'vout.address': config.coin.oracle_payout_address}, {'vin.address': config.coin.oracle_payout_address}]}},
        {$sort: {blockHeight: -1}}
      ])
      .allowDiskUse(true)
      .exec()

    const staked = txs.filter(tx => tx.vout[0].address === 'NON_STANDARD')
      .reduce((acc, tx) => acc.minus(tx.vin.reduce((a, t) => {
        if (t.address === config.coin.oracle_payout_address) {
          return a.plus(BigNumber(t.value))
        } else {
          return a
        }
      }, BigNumber(0.0))).plus(tx.vout.reduce((a, t) => {
        if (t.address === config.coin.oracle_payout_address) {
          return a.plus(BigNumber(t.value))
        } else {
          return a
        }
      }, BigNumber(0.0))), BigNumber(0.0))
    const coinInfo = await  Coin.findOne()
      .sort({createdAt: -1})
    res.json({totalBet: coinInfo.totalBet, totalOracleProfit: staked})
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message || err)
  }
}

const getCustomSupply = async (req, res) => {
  try {
    const info = await rpc.call('getinfo');
    res.json(info.moneysupply);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getTotalPayout = async (req, res) => {
  try {
    const betactions = await BetAction.find({completed: true});  
    const total_bet_wgr = betactions.reduce((sum, action) => {
      return sum + action.payout;
    }, 0);

    let total_bet_usd = 0;

    for (action of betactions){
      const prices = await Price.aggregate([
        { $project: { diff: { $abs: { $subtract: [action.createdAt, '$createdAt'] } }, doc: '$$ROOT' } },
        { $sort: { diff: 1 } },
        { $limit: 1 }
      ]);
      total_bet_usd = total_bet_usd + action.payout * prices[0].doc.usd;
    }

    const betparlays = await BetParlay.find({completed: true});  
    const total_parlay_wgr = betparlays.reduce((sum, parlay) => {
      return sum + parlay.payout;
    }, 0);

    let total_parlay_usd = 0;
    for (parlay of betparlays){
      const prices = await Price.aggregate([
        { $project: { diff: { $abs: { $subtract: [parlay.createdAt, '$createdAt'] } }, doc: '$$ROOT' } },
        { $sort: { diff: 1 } },
        { $limit: 1 }
      ]);
      total_parlay_usd = total_parlay_usd + parlay.payout * prices[0].doc.usd;
    }


    
    const total_wgr = total_bet_wgr + total_parlay_wgr;
    const total_usd = total_bet_usd + total_parlay_usd;

    res.json({totalpayout: {wgr: total_wgr, usd: total_usd}})

  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getAddressesInfo = async (req, res) => {
  
  req.clearTimeout();
  try {
    const hashlist = req.params.hashlist.split(',');
    console.log('getAddressesInfo hashlist', hashlist);
    let results = {};

    const txs = await TX
      .aggregate([
        { $match: { $or: [{ 'vout.address': {$in: hashlist} }, { 'vin.address': {$in: hashlist} }] } },
        { $sort: { blockHeight: -1 } },
      ])
      .allowDiskUse(true)
      .exec();    
    
    for (const hash of hashlist){
      if (typeof results[hash] === 'undefined'){
        results[hash] = {
          sent : BigNumber(0.0),
          received : BigNumber(0.0),
          staked : BigNumber(0.0),  
          balance: BigNumber(0.0),
          tx_counts: 0
        }     
      }
    }

    txs.map((tx) => {      
      let is_tx = {};

      if (tx.vout[0].address !== 'NON_STANDARD'){
        for (const t of tx.vin){
          if (hashlist.includes(t.address)) {              
            results[t.address]['sent'] = results[t.address]['sent'].plus(t.value);  
            is_tx[t.address] = 1;
          }  
        }

        for (const t of tx.vout){
          if (hashlist.includes(t.address)) {              
            results[t.address]['received'] = results[t.address]['received'].plus(t.value);  
            is_tx[t.address] = 1;
          }  
        }
      } else {
        for (const t of tx.vin){
          if (hashlist.includes(t.address)) {              
            results[t.address]['staked'] = results[t.address]['staked'].plus(t.value);  
            is_tx[t.address] = 1;
          }  
        }

        for (const t of tx.vout){
          if (hashlist.includes(t.address)) {              
            results[t.address]['staked'] = results[t.address]['staked'].plus(t.value);  
            is_tx[t.address] = 1;
          }  
        }
      }
      for (const address of Object.keys(is_tx)){
        results[address].tx_counts++;        
      }
      return tx;
    })

    for (let key of Object.keys(results)){
      let item = results[key];
      item.balance = item.received.plus(item.staked).minus(item.sent);
    }

    console.log('tx length', txs.length);

    // const sent = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
    //   .reduce((acc, tx) => acc.plus(tx.vin.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))), BigNumber(0.0));

    // const received = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
    //   .reduce((acc, tx) => acc.plus(tx.vout.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))), BigNumber(0.0));

    // const staked = txs.filter((tx) => tx.vout[0].address === 'NON_STANDARD')
    //   .reduce((acc, tx) => acc.minus(tx.vin.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))).plus(tx.vout.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))), BigNumber(0.0));

    // const balance = received.plus(staked).minus(sent);
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

module.exports = {
  getBetStatus,
  getCustomSupply,
  getTotalPayout,
  getAddressesInfo
}
