const { exit, rpc } = require('../../lib/cron');
const BetResult = require('../../model/betresult');
const BetAction = require('../../model/betaction');
const BetParlay = require('../../model/betparlay');
const moment = require('moment');


async function checkBetTx() {

    let bets = await BetAction.aggregate([
       { $match:  { "payoutDate": { $gte: moment('2021-01-01T00:00:00.000+00:00').toDate() } } }
    ]).allowDiskUse(true);

    let parlays = await BetParlay.aggregate([
        { $match:  { "payoutDate": { $gte: moment('2021-01-01T00:00:00.000+00:00').toDate() } } }
    ]).allowDiskUse(true);

    let payoutTXsBets = {}
    for (i = 0; i < bets.length; i++) {
        payoutTXsBets[bets[i].payoutTxId] = 1
    }

    for (i = 0; i < parlays.length; i++) {
        payoutTXsBets[parlays[i].payoutTxId] = 1
    }

    let payoutTxCount = 0
    for(tx in payoutTXsBets) {
        payoutTxCount += payoutTXsBets[tx]
    }

    console.log("BetPayoutTxCount: ", payoutTxCount);

    let betResults = await BetResult.aggregate([
        { $match:{ "payoutTx.createdAt": { $gte: moment('2021-01-01T00:00:00.000+00:00').toDate() } }}
    ]).allowDiskUse(true);

    let payoutTXsResults = {}

    console.log(betResults.length)

    for (i = 0; i < betResults.length; i++) {

        if(payoutTXsResults[betResults[i].payoutTx.txId]) {
            console.log(betResults[i].payoutTx.txId)
        }
        payoutTXsResults[betResults[i].payoutTx.txId] = 1
    }

    let betResultTxCount = 0
    for(tx in payoutTXsResults) {
        betResultTxCount += payoutTXsResults[tx]
    }

    console.log("BetResulTxCount: ", betResultTxCount);
}

checkBetTx()