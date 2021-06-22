const BetAction = require('../../model/betaction')
const BetEvent = require('../../model/betevent');
const BetParlay = require('../../model/betparlay');
const Coin = require('../../model/coin');
const Tx = require('../../model/tx');
const BetResult = require('../../model/betresult');
const config = require('../../config');
const _ =require('lodash');


async function getBettingChartData(filter) {

        let qry = [  {$project : {
            year : {
                $year : "$createdAt"
            },
            month : {
                $month : "$createdAt"
            },
            week : {
                $week : "$createdAt"
            },
            day : {
                $dayOfMonth : "$createdAt"
            },
            _id : 1,
            betValue:1,
            payout:1,
            completed:1
        
        }
        },
        {
                $unionWith: {
                    coll: "betparlays",
                    pipeline: [{
                        $project: {
                            year : {
                                $year : "$createdAt"
                            },
                            month : {
                                $month : "$createdAt"
                            },
                            week : {
                                $week : "$createdAt"
                            },
                            day : {
                                $dayOfMonth : "$createdAt"
                            },
                            _id : 1,
                            betValue:1,
                            payout:1,
                            completed:1
        
                        }
                    }]
                }
            },
            {
                $match : { 
                    "completed": true
             }
            }]
        
        let groupingIds = {}
        let sort = {}

        /* if(!["7d","30d","90d" ].includes(filter)){
            groupingIds = {
                year: "$year",
                week: "$week"
            }
           sort = {
                $sort: {
                    "_id.year": 1,
                    "_id.week":1
                }
            }

        } else { */
            groupingIds = {
                year: "$year",
                month: "$month",
                day: "$day"
            } 

            sort = {
                $sort: {
                    "_id.year":-1,
                    "_id.month":-1,
                    "_id.day": 1
            
                }
            }
        //}


        let grp =  {
            $group : {
                _id : groupingIds,
                totalBetValue : {
                    $sum : "$betValue"
                },
                totalPayout : {
                    $sum : "$payout"
                }
            }
        }
        
        let project = { $project : {
            supplyChange: { $subtract: [ "$totalPayout", "$totalBetValue" ] },
            totalBetValue:1,
            totalPayout:1,
            }
        }
        
        
        qry.push(grp,project,sort)

        if (filter == "7d") qry.push({ $limit: 7 })
        
        if (filter == "30d") qry.push({ $limit: 30 })
            
        if(filter == "90d") qry.push({ $limit: 90 })
        
        let result = await BetAction.aggregate(qry).allowDiskUse(true)
  
      return result;
  
    
  
  }
async function getBettingData() {
    const betSingleCount = await BetAction.countDocuments({completed: true});
    const betSingleSum = await BetAction.aggregate([
        {
            $match: { "completed": true }
        },
        {
            $group: { 
                _id: null, 
                totalBetValue: { $sum: "$betValue" }, 
                totalPayout: {$sum: "$payout"},
                totalBetUSD: {$sum: "$betValueUSD"}  
              }
        }
      ]).allowDiskUse(true)

   
   const firstRecordSingle = await BetAction.findOne().sort({createdAt: 1});
   const lastRecordSingle = await BetAction.findOne().sort({createdAt: -1});

   const totalDaysSingle = Math.round(Math.abs((lastRecordSingle.createdAt - firstRecordSingle.createdAt) / (24 * 60 * 60 * 1000)));
   
  const totalBetSingle = betSingleSum[0].totalBetValue;
  const totalPayoutSingle = betSingleSum[0].totalPayout;
  const totalBetSingleUSD = betSingleSum[0].totalBetUSD;

  const burnMintSingle = totalPayoutSingle - totalBetSingle
  const burnMintPercentSingle = ((totalPayoutSingle - totalBetSingle)/totalBetSingle) * 100
  const betSingleUSDDaily = totalBetSingleUSD/totalDaysSingle;
  const betSingleUSDAnnualized = betSingleUSDDaily * 365


  
  
  const betParlayCount = await BetParlay.countDocuments({completed: true});
  const betParlaySum = await BetParlay.aggregate([
      {
          $match: { "completed": true }
      },
      {
          $group: { 
              _id: null,
              totalBetValue: { $sum: "$betValue" },
              totalPayout: {$sum: "$payout"},
              totalBetUSD: {$sum: "$betValueUSD"}  
          }
      }
    ]).allowDiskUse(true)

    
   const firstRecordParlay = await BetParlay.findOne().sort({createdAt: 1});
   const lastRecordParlay = await BetParlay.findOne().sort({createdAt: -1});

   const totalDaysParlay = Math.round(Math.abs((lastRecordParlay.createdAt - firstRecordParlay.createdAt) / (24 * 60 * 60 * 1000)));
   

    const totalBetParlay = betParlaySum[0].totalBetValue;
    const totalPayoutParlay = betParlaySum[0].totalPayout;
    const totalBetParlayUSD = betParlaySum[0].totalBetUSD;

    const burnMintParlay = totalPayoutParlay - totalBetParlay
    const burnMintPercentParlay = ((totalPayoutParlay - totalBetParlay)/totalBetParlay) * 100
    const betParlayUSDDaily = totalBetParlayUSD/totalDaysParlay;
    const betParlayUSDAnnualized = betParlayUSDDaily * 365

    const data = {
        singleBets: {
          betCount: betSingleCount,
          totalBet: totalBetSingle,
          burnMint: burnMintSingle,
          burnMintRate: burnMintPercentSingle,
          betUSD: totalBetSingleUSD,
          betDaily: betSingleUSDDaily,
          betAnnualized: betSingleUSDAnnualized

        },
        parlayBets: {
          betCount: betParlayCount,
          totalBet: totalBetParlay,
          burnMint: burnMintParlay,
          burnMintRate: burnMintPercentParlay,
          betUSD: totalBetParlayUSD,
          betDaily: betParlayUSDDaily,
          betAnnualized: betParlayUSDAnnualized
        }
    }

    return data;
  }

async function getParlayLegData() {
    const legData = await BetParlay.aggregate([
        {
            $unwind: "$legs"
        },
        {
            $group: {
                _id: '$_id',
                size: {
                    $sum: 1
                },
                betValue: {
                    "$first": "$betValue"
                },
                payout: {
                    "$first": "$payout"
                },
                result: {
                    "$first": "$betResultType"
                }
            }
        },
        {
            $group: {
                _id: '$size',
                count: {
                    $sum: 1
                },
                totalBet: {
                    $sum: "$betValue"
                },
                totalPayout: {
                    $sum: "$payout"
                },
                wins: {
                    "$sum": { "$cond": [{ "$eq": ["$result", "win"] }, 1, 0] }
                },
            }
        },
        {
            $sort:{_id:-1}
        }
    ]);

   for(i=0; i < legData.length; i++) {
    legData[i].winPercent =   (legData[i].wins * 100) / legData[i].count
    legData[i].burn = legData[i].totalPayout - legData[i].totalBet
    legData[i].burnRate = ((legData[i].totalPayout - legData[i].totalBet)/legData[i].totalBet) * 100
   }

   return legData;
    
}
async function getBetDataByLeague() {

    
    const betData = await BetAction.aggregate([
        {
            $match: { 
                completed: true 
            }
        },
        { 
            $group: {
                _id: '$eventId',
                totalBet: {
                    $sum: "$betValue"
                },
                totalPayout: {
                    $sum: "$payout"
                }
            }
    
        },{
        $lookup: {
            from: 'betevents',
            localField: '_id',
            foreignField: 'eventId',
            as: 'betEvent'
        }
    },
    {
        $project: {
            eventId: "$eventId",
            totalBet: "$totalBet",
            totalPayout: "$totalPayout",
            event: { "$first": "$betEvent" }
    
        }
    },
    {
        $group: {
            _id: '$event.league',
            betSum: {
                $sum: "$totalBet"
            },
            payoutSum: {
                $sum: "$totalPayout"
            }
        }
    
    },
    {
        $sort: {
            betSum: -1
        }
    }, 
    {
        $set: {
            supplyChange: { $subtract: [ "$payoutSum", "$betSum" ] }
         }
      }
    
    ]).allowDiskUse(true)

const top10 = _.slice(betData,0,20);
const others = _.slice(betData,20)

otherObj = {
    _id:'Others',
    betSum:0,
    payoutSum:0,
    supplyChange:0
}

others.forEach((o) => {
    otherObj.betSum = otherObj.betSum + o.betSum
    otherObj.payoutSum = otherObj.payoutSum + o.payoutSum
    otherObj.supplyChange = otherObj.supplyChange + o.supplyChange
})

const legueData = _.concat(top10,[otherObj])
    
    return legueData;
    
    }

const getBettingStatData = async (req, res) => {
    try {
        const filter = req.query.filter;
        const chartData = await getBettingChartData(filter);
        const bettingData = await getBettingData();
        const parlayLegData = await getParlayLegData();
        const betByLeague = await getBetDataByLeague();

        const data = {
            chartData:chartData,
            bettingData: bettingData,
            parlayLegData: parlayLegData,
            betByLeagueChartData: betByLeague
        } 

        res.json(data)

} catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
}

const getMasternodeData = async(req,res) => {

    const filter = req.query.filter

    let coinLatest =  await Coin.find({}).sort({createdAt: -1}).limit(1)

    coinLatest = coinLatest[0]
    
    //genera masternode info
    const masternodeCount = coinLatest.mnsOn
    const collateral = 25000
    const supplyLockedPercent = (masternodeCount * collateral  * 100) / coinLatest.supply 
    const cost = collateral * coinLatest.usd
    
    
    //oracle reward information
    let lastOraclePayoutTX = await Tx.findOne({"vout.address":config.coin.oracle_wallet_address}).sort({createdAt: -1})
    
    const payout = lastOraclePayoutTX.vout.reduce((a, t) => {
        if (t.address === config.coin.oracle_wallet_address) {
          return a + t.value
        } else {
          return a
        }
      }, 0.0)
    
    const lastOraclePayout=payout;
    const unpaidAccreward = coinLatest.oracleBalance / coinLatest.mnsOn;  
    const oracleYearlyEst = coinLatest.oracleProfitPerSecond * 60 * 60 * 24 * 365 / coinLatest.mnsOn;
    const oracleAnnualizedAPR = ((coinLatest.oracleProfitPerSecond * 60 * 60 * 24 / coinLatest.mnsOn) * 36500) / 25000 
    
    //block reward Information
    
    const blockReward = 2.85; // fixed
    const blockPerDay = 1440; //fixed
    const yearlyEstBlockReward = 1440 * 2.85 * 365 / coinLatest.mnsOn
    const blockRewardEmmisionPercent =  2 // 2% fixed
    
    
    //oracle/masternode reward
    const oracleMNYearlyEstimate = oracleYearlyEst + yearlyEstBlockReward
    const oracleMNAnnualAPR = oracleAnnualizedAPR + blockRewardEmmisionPercent

    let groupingIds = {}
    let sort = {}
    let limit = {}
    
   /*  if (!["7d", "30d", "90d"].includes(filter)) {
        groupingIds = {
            year: "$year",
            week: "$week"
        }
        sort = {
            $sort: {
                "_id.year": 1,
                "_id.week": 1
            }
        }

    } else { */
        groupingIds = {
            year: "$year",
            month: "$month",
            day: "$day"
        }

        sort = {
            $sort: {
                "_id.year": -1,
                "_id.month": -1,
                "_id.day": 1
            }
        }
    //}
    
    const unwind = {
        $unwind: {
            path: '$payoutTx.vout',
        }
    }

    const groupById = {
        $group: {
            _id: {
                id: '$_id',
                createdAt: '$createdAt'
            },
            "oraclePayouts": {
                "$sum": {
                    "$cond": [
                        { "$in": ["$payoutTx.vout.address", [config.coin.oracle_payout_address[0]]] },
                        "$payoutTx.vout.value",
                        0
                    ]
                }
            }

        }
    }

    const project = {
        $project: {
            year: {
                $year: "$_id.createdAt"
            },
            month: {
                $month: "$_id.createdAt"
            },
            week: {
                $week: "$_id.createdAt"
            },
            day: {
                $dayOfMonth: "$_id.createdAt"
            },
            oraclePayouts: { '$add': ['$oraclePayouts', 2.85] }
        }
    }

    const groupByDate = {
        $group: {
            _id: groupingIds,
            oraclePayouts: {
                $sum: '$oraclePayouts'
            }
        }
    }

    const qry = []
    qry.push(unwind, groupById, project, groupByDate, sort)

    if (filter == "7d") qry.push({ $limit: 7 })

    if (filter == "30d") qry.push({ $limit: 30 })

    if (filter == "90d") qry.push({ $limit: 90 })

    
    let oracleMNChartData = await BetResult.aggregate(qry)

    const resData = {
        masternodeInfo: {
            masternodeCount: masternodeCount,
            collateral: collateral,
            supplyLockedPercent: supplyLockedPercent,
            cost: cost
        },
        oracleRewardInfo: {
            lastOraclePayout: lastOraclePayout,
            unpaidAccuredreward: unpaidAccreward,
            oracleYearlyEstReward: oracleYearlyEst,
            oracleAnnualized: oracleAnnualizedAPR
        },
        blockRewardInfo: {
            blockReward: blockReward,
            blockPerDay: blockPerDay,
            yearlyEst: yearlyEstBlockReward,
            blockRewardPercent: blockRewardEmmisionPercent
        },
        oracleMasternodeRewardInfo: {
            yearlyEstimate: oracleMNYearlyEstimate,
            oracleMNAnnual: oracleMNAnnualAPR
        },
        oracleMNChartData: oracleMNChartData
    }


    res.json(resData)
}

  module.exports = {
    getBettingStatData,
    getMasternodeData
  }
  