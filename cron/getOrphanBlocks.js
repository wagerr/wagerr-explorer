
require('babel-polyfill');
const blockchain = require('../lib/blockchain');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
const TX = require('../model/tx');
const TXNew = require('../model/txNew');
const { BigNumber } = require('bignumber.js');
const readline = require('readline');
const fs = require('fs');
async function findOrphanBlock(){

  const address = "WRBs8QD22urVNeGGYeAMP765ncxtUA1Rv2"
  const block_height = 1096060;
  // const txs = await TX
  // .aggregate([
  //   {
  //     $match: {blockHeight: {$lte: block_height}}  //1096060
  //   },
  //   { $match: { $or: [{ 'vout.address': address }, { 'vin.address': address }] } },
  //   { $sort: { blockHeight: -1 } },
  // ])
  // .allowDiskUse(true)
  // .exec();

  // let i = 0;
  // const sents = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')

  const txs_new = await TXNew
  .aggregate([
    {
      $match: {blockHeight: {$lte: block_height}}
    },
    { $match: { $or: [{ 'vout.address': address }, { 'vin.address': address }] } },
    { $sort: { blockHeight: -1 } },
  ])
  .allowDiskUse(true)
  .exec();

  let j = 0;
  const sent_new = txs_new.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')

  for (j=0; j<sent_new.length; j++){    
    const tx_new = sent_new[j];
    const tx = await TX.findOne({_id: tx_new._id});
    
    let tx_new_value = BigNumber(0.0);
    tx_new_value =  tx_new.vin.reduce((a, t) => {      
      if (t.address === address) {
        return a.plus(BigNumber(t.value));
      }
      return a;
    }, BigNumber(0.0));

    let tx_value = BigNumber(0.0);
    tx_value = tx.vin.reduce((a, t) => {      
      if (t.address === address) {
        return a.plus(BigNumber(t.value));
      }
      return a;
    }, BigNumber(0.0));

    //console.log(tx_value, tx_new_value);
    if (tx_new_value.toNumber() != tx_value.toNumber()){
      console.log('----------------------');
      console.log(tx_new_value.toNumber(), tx_value.toNumber());
      console.log(tx.blockHeight, tx_new.blockHeight);
      console.log('----------------------');
    }
  }

  exit(0);  
}

//findOrphanBlock();

async function findTx(blockHeight){
  const address = "WRBs8QD22urVNeGGYeAMP765ncxtUA1Rv2"

  const txs_new = await TXNew
  .aggregate([
    {
      $match: {blockHeight: blockHeight}
    },
    { $match: { $or: [{ 'vout.address': address }, { 'vin.address': address }] } },
    { $sort: { blockHeight: -1 } }    
  ])
  .allowDiskUse(true)
  .exec();

  const sent_new = txs_new.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')

  const txs = await TX
  .aggregate([
    {
      $match: {blockHeight: blockHeight}
    },
    { $match: { $or: [{ 'vout.address': address }, { 'vin.address': address }] } },
    { $sort: { blockHeight: -1 } },
  ])
  .allowDiskUse(true)
  .exec();

  const sents = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')

  
  for (let i = 0; i< sent_new.length; i++){
    const tx_new = sent_new[i];
    console.log(tx_new.txId, tx_new.vin.length);

    let sum = BigNumber(0.0);  
    for (let j = 0; j<tx_new.vin.length; j++){
      let t = tx_new.vin[j];
      if (t.address === address) {
        sum = sum.plus(BigNumber(t.value));
      }      
    }

    console.log(sum.toNumber());
  }

  console.log('---------------');
  for (let i = 0; i< sents.length; i++){
    const tx= sents[i];
    let tx_new = null;
    for (let i1 = 0; i1 < sent_new.length; i1++){
      if (sent_new[i1].txId == tx.txId){
        tx_new = sent_new[i1];
      }
    }
    
    console.log(tx.txId, tx_new.txId, tx.vin.length, tx_new.vin.length);

    //let sum = BigNumber(0.0);  
    for (let j = 0; j<tx.vin.length; j++){
      let t = tx.vin[j];
      if (t.address === address) {
        for (let k = 0; k< tx_new.vin.length; k++){
          t_new = tx_new.vin[k];
          if (t_new.txId == t.txId) {                        
            break;
          }      
        }

        if (t.value != t_new.value) {
          console.log(t.txId, t_new.txId);
          console.log(t.value, t_new.value);
        }
      }      
    }
    //console.log(sum.toNumber());
  }
}

findTx(1030374);
