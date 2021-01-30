const {
  outcomeMapping,
  resultMapping,
} = require('../lib/op_code');
const {exit, rpc} = require('../lib/cron')
const Block = require('../model/block');
const Betupdate = require('../model/betupdate');
const Betspread = require('../model/betspread');
const Bettotal = require('../model/bettotal');
const Transaction = require('../model/transaction');
const BetAction = require('../model/betaction');
const BetParlay = require('../model/betparlay');
const BetEvent = require('../model/betevent');
const BetResult = require('../model/betresult');
const Price = require('../model/price')
const BetError = require('../model/beterror');

const TX = require('../model/tx');

const invalidIds = require('./_invalid_ids.js');

const { log } = console;

async function getBetData() {
  const betEvent = await BetEvent.findOne().sort({ blockHeight: -1 });
  const betAction = await BetAction.findOne().sort({ blockHeight: -1 });
  const betResult = await BetResult.findOne().sort({ blockHeight: -1 });

  return {
    betEvent,
    betAction,
    betResult,
  };
}

async function deleteBetData(start, stop) {
  await BetAction.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  await BetEvent.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  await BetResult.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  await Betupdate.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  await Betspread.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  await BetParlay.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
}


async function recordCheck(rType, val, recordType = '_id') {
  let response;
  try {
    response = await rType.findOne({ [recordType]: val });
  } catch (e) {
    log('bet.js:recordCheck');
    log(e);
  }

  if (!response && recordType === '_id') {
    if (invalidIds.includes(val)) {
      return true;
    }
  }

  return response;
}

async function createError(_id, rpctx, block, transaction, transactionType) {
  return BetError.create({
    _id: `error-${_id}`,
    txId: rpctx.get('txid'),
    blockHeight: block.height,
    createdAt: block.createdAt,
    eventId: transaction.eventId,
    opCode: transaction.opCode,
    transaction,
    completed: false,
    txType: transactionType,
    txErrorId: _id
  });
}

function handleError(msg, e, transaction) {
  log(msg);
  log(transaction);
  log(e);
}

async function logError(err, dataType, height, transaction, originalRecord, event) {
  if (err && err.message && err.message.includes('duplicate key error collection')) {
    return null;
  }

  if (height) {
    handleError(
      `Error ${dataType} at height ${height}`,
      err,
      transaction,
    );
  }

  if (originalRecord) {
    log(originalRecord);
  }

  if (event) {
    log(event);
  }

  return log(err);
}

// async function verifyBetOdds(record, rtype) {
//   const { eventId } = record;

//   try {
//     if (rtype === 'update' || rtype === 'create') {
//       const updates = await Betupdate.find({
//         eventId: `${eventId}`,
//         createdAt: { $gt: record.createdAt },
//       });
 
//       const nextUpdate = updates[0];
//       const queryParams = { $gt: record.createdAt };

//       if (nextUpdate) {
//         queryParams['$lt'] = nextUpdate.createdAt;
//       }

//       // Updates betactions data
//       const actions = await BetAction.find({
//         eventId: `${eventId}`,
//         createdAt: queryParams,
//       });

//       if (actions.length > 0) {
//         for (let x = 0; x < actions.length; x += 1) {
//           const thisAction = actions[x];
//           let updated = false;
//           let opObject;
//           ({ opObject } = record);

//           if (!opObject) {
//             opObject = record.transaction;
//           }

//           if (thisAction.homeOdds != opObject.get('homeOdds')) {
//             updated = true;
//             thisAction.homeOdds = opObject.get('homeOdds');
//           }

//           if (thisAction.drawOdds != opObject.get('drawOdds')) {
//             updated = true;
//             thisAction.drawOdds = opObject.get('drawOdds');
//           }

//           if (thisAction.awayOdds != opObject.get('awayOdds')) {
//             updated = true;
//             thisAction.awayOdds = opObject.get('awayOdds');
//           }

//           if (updated) {
//             await thisAction.save()
//             if (rtype == 'create') {
//               // log('Event create update');
//             }
//             // log(`Odds for event#${thisAction.eventId} action were updated`);
//           }
//         }
//       }

//       // Updates betspreads data
//       const betspreads = await Betspread.find({
//         eventId: `${eventId}`,
//         createdAt: queryParams,
//       });

//       if (betspreads.length > 0) {
//         for (let y = 0; y < betspreads.length; y += 1) {
//           const thisSpread = betspreads[y];
//           let updated = false;
//           let opObject;
//           ({ opObject } = record);

//           if (!opObject) {
//             opObject = record.transaction;
//           }

//           if (thisSpread.mhomeOdds != opObject.get('homeOdds')) {
//             updated = true;
//             thisSpread.mhomeOdds = opObject.get('homeOdds');
//           }

//           if (thisSpread.mawayOdds != opObject.get('awayOdds')) {
//             updated = true;
//             thisSpread.mawayOdds = opObject.get('awayOdds');
//           }

//           const spreadPoints = Math.abs(thisSpread.homePoints);

//           const homePoints = (thisSpread.mhomeOdds < thisSpread.mawayOdds) ? -(spreadPoints) : spreadPoints;
//           const awayPoints = (thisSpread.mhomeOdds > thisSpread.mawayOdds) ? -(spreadPoints) : spreadPoints;

//           thisSpread.matched = true;
//           thisSpread.homePoints = homePoints;
//           thisSpread.awayPoints = awayPoints;


//           if (updated) {
//             await thisSpread.save()
//             if (rtype == 'create') {
//               // log('Event create update');
//             }
//             // log(`Data for event#${thisSpread.eventId} spread was updated`);
//           }
//         }
//       }

//       return record;
//     }


//     if (rtype === 'action') {
//       await Betupdate.find({
//         eventId: `${eventId}`,
//         createdAt: { $gt: record.createdAt },
//       });
//     }
//   } catch (e) {
//     log(e)
//   }

//   return record;
// }

async function verifyBetOdds(record, rtype) {
  const { eventId } = record;

  try {
    if (rtype === 'update' || rtype === 'create') {
      // Updates betactions data
      const actions = await BetAction.find({
        eventId: `${eventId}`
      });

      if (actions.length > 0) {
        for (let x = 0; x < actions.length; x += 1) {                    
          const thisAction = actions[x];

          const res = await rpc.call('getbetbytxid', [thisAction.txId]);  
          if (res && res.length > 0){    
            const betinfo = res[0].legs[0];
            let updated = false;
  
            if (thisAction.homeOdds != betinfo.lockedEvent.homeOdds) {
              updated = true;
              thisAction.homeOdds = betinfo.lockedEvent.homeOdds;
            }
  
            if (thisAction.drawOdds != betinfo.lockedEvent.drawOdds) {
              updated = true;
              thisAction.drawOdds = betinfo.lockedEvent.drawOdds;
            }
  
            if (thisAction.awayOdds != betinfo.lockedEvent.awayOdds) {
              updated = true;
              thisAction.awayOdds = betinfo.lockedEvent.awayOdds;
            }
  
            if (updated) {
              await thisAction.save()
            }
          }           
        }
      }

      // Updates betspreads data
      // const betspreads = await Betspread.find({
      //   eventId: `${eventId}`        
      // });

      // if (betspreads.length > 0) {
      //   for (let y = 0; y < betspreads.length; y += 1) {
      //     const thisSpread = betspreads[y];
      //     const res = await rpc.call('getbetbytxid', [thisSpread.txId]);  

      //     if (res && res.length > 0){     
      //       let updated = false;            
      //       const betinfo = res[0].legs[0];
      //       if (thisSpread.mhomeOdds != betinfo.lockedEvent.homeOdds) {
      //         updated = true;
      //         thisSpread.mhomeOdds = betinfo.lockedEvent.homeOdds;
      //       }
  
      //       if (thisSpread.mawayOdds != betinfo.lockedEvent.awayOdds) {
      //         updated = true;
      //         thisSpread.mawayOdds = betinfo.lockedEvent.awayOdds;
      //       }
  
      //       const spreadPoints = betinfo.lockedEvent.spreadPoints;
  
      //       const homePoints = spreadPoints;
      //       const awayPoints = -spreadPoints;
  
      //       thisSpread.matched = true;
      //       thisSpread.homePoints = homePoints;
      //       thisSpread.awayPoints = awayPoints;
  
  
      //       if (updated) {
      //         await thisSpread.save()
      //       }
      //     }
      //   }
      // }


      const betparlays = await BetParlay.find({
        eventId: `${eventId}`        
      });

      if (betparlays.length > 0) {
        for (let z = 0; z < betparlays.length; z += 1) {
          const thisParlay = betparlays[z];
          const res = await rpc.call('getbetbytxid', [thisParlay.txId]);  

          if (res){                  
            const betinfo = res[0];                                                      
            if (betinfo.legs.length > 1){                                                             
              const legs = [];
              for (const leg of betinfo.legs){                    
                const item = {
                  eventId: leg['event-id'],  
                  outcome: leg.outcome,  
                  market: `${outcomeMapping[leg.outcome]}`,
                  resultType: leg.legResultType,  
                  eventResultType: leg.lockedEvent.eventResultType, 
                  homeOdds: leg.lockedEvent.homeOdds, 
                  drawOdds: leg.lockedEvent.drawOdds,
                  awayOdds: leg.lockedEvent.awayOdds,
                  spreadHomePoints: leg.lockedEvent.spreadPoints,                        
                  spreadAwayPoints: -leg.lockedEvent.spreadPoints,                        
                  spreadHomeOdds: leg.lockedEvent.spreadHomeOdds,
                  spreadAwayOdds: leg.lockedEvent.spreadAwayOdds,
                  totalPoints: leg.lockedEvent.totalPoints,
                  totalOverOdds: leg.lockedEvent.totalOverOdds,
                  totalUnderOdds: leg.lockedEvent.totalUnderOdds,
                  startingTime: leg.lockedEvent.starting,
                  homeTeam: leg.lockedEvent.home,
                  awayTeam: leg.lockedEvent.away,
                  league: leg.lockedEvent.tournament,
                  homeScore: leg.lockedEvent.homeScore != 'undefined' ? leg.lockedEvent.homeScore : 0,
                  awayScore: leg.lockedEvent.awayScore != 'undefined' ? leg.lockedEvent.awayScore : 0
                };                      
                legs.push(item);
              }
              //console.log('legs', legs);
              thisParlay.legs = legs;
            }
            await thisParlay.save()
          }
        }
      }
      return record;
    }

    if (rtype === 'action') {
      await Betupdate.find({
        eventId: `${eventId}`,
        createdAt: { $gt: record.createdAt },
      });
    }
  } catch (e) {
    log("verifyBetOdds",e)
    //exit();
  }

  return record;
}

async function verifySpreadActions(record, rtype) {
  const { eventId } = record;

  try {
    if (rtype === 'update' || rtype === 'create') {
      // const updates = await Betspread.find({
      //   eventId: `${eventId}`,
      //   createdAt: { $gt: record.createdAt },
      // });

      // const nextUpdate = updates[0];
      // const queryParams = { $gte: record.createdAt };

      // if (nextUpdate) {
      //   queryParams['$lt'] = nextUpdate.createdAt;
      // }

      const actions = await BetAction.find({
        eventId: `${eventId}`,
        //createdAt: queryParams,
        'transaction.outcome': { $in: [4, 5] },
      });

      if (actions.length > 0) {
        for (let x = 0; x < actions.length; x += 1) {                    
          const thisAction = actions[x];

          const res = await rpc.call('getbetbytxid', [thisAction.txId]);  
          if (res && res.length > 0){    
            const betinfo = res[0].legs[0];
            let updated = false;
  
            if (thisAction.spreadHomeOdds != betinfo.lockedEvent.spreadHomeOdds) {
              updated = true;
              thisAction.spreadHomeOdds = betinfo.lockedEvent.spreadHomeOdds;
            }
  
            if (thisAction.spreadAwayOdds != betinfo.lockedEvent.spreadAwayOdds) {
              updated = true;
              thisAction.spreadAwayOdds = betinfo.lockedEvent.spreadAwayOdds;
            }
  
            if (thisAction.spreadHomePoints != betinfo.lockedEvent.spreadPoints) {
              updated = true;
              thisAction.spreadHomePoints = betinfo.lockedEvent.spreadPoints;
            }

            if (thisAction.spreadAwayPoints != -betinfo.lockedEvent.spreadPoints) {
              updated = true;
              thisAction.spreadAwayPoints = -betinfo.lockedEvent.spreadPoints;
            }
  
            if (updated) {
              await thisAction.save()
            }
          }           
        }
      }
      
      // if (actions.length > 0) {
      //   for (let x = 0; x < actions.length; x += 1) {
      //     const thisAction = actions[x];
      //     let updated = false;

      //     if (thisAction.spreadHomeOdds != record.homeOdds) {
      //       updated = true;
      //       thisAction.spreadHomeOdds = record.homeOdds;
      //     }

      //     if (thisAction.spreadAwayOdds != record.awayOdds) {
      //       updated = true;
      //       thisAction.spreadAwayOdds = record.awayOdds;
      //     }

      //     if (thisAction.spreadHomePoints != record.homePoints) {
      //       updated = true;
      //       thisAction.spreadHomePoints = record.homePoints;
      //     }


      //     if (thisAction.spreadAwayPoints != record.awayPoints) {
      //       updated = true;
      //       thisAction.spreadAwayPoints = record.awayPoints;
      //     }

      //     if (updated) {
      //       await thisAction.save()
      //       if (rtype == 'create') {
      //         // log('Event create update');
      //       }
      //       // log(`Spread data for event#${thisAction.eventId} action was updated`);
      //     }
      //   }
      // }

      return record;
    }


    if (rtype === 'action') {
      await Betupdate.find({
        eventId: `${eventId}`,
        createdAt: { $gt: record.createdAt },
      });
    }
  } catch (e) {
    log("verifySpreadActions:",e)
  }

  return record;
}

async function waitForData(eventId, time = 50) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const data = await BetEvent.find({
        $or: [
          { eventId },
          { evntId: `${eventId}` },
        ],
      });
      return resolve(data);
    }, time);
  });
}

async function getEventData(block, eventId, waitTime = 50) {
  let originalRecord = await BetEvent.findOne({
    eventId: `${eventId}`,
  });

  if (originalRecord == null || originalRecord == undefined) {
    const data = await waitForData(eventId, waitTime);
    originalRecord = data[0];
  }

  let event = {};
  // Getting money line updates that are less or equal to the block the transaction is contained in
  const updates = await Betupdate.find({
    eventId: `${eventId}`,
    blockHeight: { $lt: block.height },
    createdAt: { $lte: block.createdAt },
  });

  // Get thebettotals that are less or equal to the block the transaction is contained in
  const betTotals = await Bettotal.find({
    eventId: `${eventId}`,
    blockHeight: { $lt: block.height },
    createdAt: { $lte: block.createdAt },
  });

  if (updates && updates.length > 0) {
    const lastRecord = updates[updates.length - 1].opObject;
    event = {
      homeOdds: lastRecord.get('homeOdds'),
      awayOdds: lastRecord.get('awayOdds'),
      drawOdds: lastRecord.get('drawOdds'),
    };
  } else {
    event = originalRecord;
  }

  if (betTotals && betTotals.length > 0) {
    const lastTotal = betTotals[betTotals.length - 1];
    let recheck;

    if (event === null) {
      recheck = await waitForData(eventId, 100);
      event = recheck[0];
    }    
    event.points = lastTotal ? lastTotal.points : 0;
    event.overOdds = lastTotal ? lastTotal.overOdds : 0;
    event.underOdds = lastTotal? lastTotal.underOdds : 0;
  }

  return { event, updates, betTotals, originalRecord };
}

async function saveOPTransaction(block, rpcTx, vout, transaction, waitTime = 50) {
  const rpctx = rpcTx;
  let createResponse;

  if (rpctx.get === undefined) {
    rpctx.get = (param) => {
      return rpctx[param];
    }
  }

  if (['peerlessEvent'].includes(transaction.txType)) {
    const _id = `${transaction.eventId}${rpctx.get('txid')}${block.height}`;
    const skipRecord = await recordCheck(BetEvent, _id);

    if (skipRecord) {
      return skipRecord;
    }

    try {
      createResponse = await BetEvent.create({
        _id,
        txId: rpctx.get('txid'),
        blockHeight: block.height,
        createdAt: block.createdAt,
        eventId: transaction.eventId,
        timeStamp: transaction.timestamp,
        league: transaction.tournament,
        info: `R${transaction.round}`,
        homeTeam: transaction.homeTeam,
        awayTeam: transaction.awayTeam,
        homeOdds: transaction.homeOdds,
        awayOdds: transaction.awayOdds,
        drawOdds: transaction.drawOdds,
        opString: JSON.stringify(transaction),
        opCode: transaction.opCode,
        transaction,
        matched: true,
      });

      await verifyBetOdds(createResponse, 'create');
    } catch (e) {
      createResponse = e;

      logError(e, 'creating bet event', block.height, transaction);
    }

    return createResponse;
  }

  if (['peerlessUpdateOdds'].includes(transaction.txType)) {    
    const _id = `${transaction.eventId}${rpctx.get('txid')}${block.height}`;

    const updateExists = await recordCheck(Betupdate, _id);

    if (updateExists) {
      return updateExists;
    }
    
    const resultExists = await recordCheck(BetResult, `${transaction.eventId}`, 'eventId');

    if (!resultExists) {
      try {
        const event = await BetEvent.findOne({eventId: `${transaction.eventId}`}).sort({
          createdAt: -1
        });

        if (event) {
          event.homeOdds = `${transaction.homeOdds}`;
          event.awayOdds = `${transaction.awayOdds}`;
          event.drawOdds = `${transaction.drawOdds}`;

          // if (transaction.eventId == "6118"){
          //   console.log('transaction.homeOdds', transaction.homeOdds)
          // }

          try {
            await event.save();
          } catch (e) {
            logError(e, 'saving odds update', block.height, transaction);
          }
        }
      } catch (e) {
        logError(e, 'finding odds update', block.height, transaction);
      }
    }

    try {
      createResponse = await Betupdate.create({
        _id,
        txId: rpctx.get('txid'),
        blockHeight: block.height,
        createdAt: block.createdAt,
        opCode: transaction.opCode,
        type: transaction.type,
        txType: transaction.txType,
        eventId: transaction.eventId,
        opObject: transaction,
        matched: true,
      });
      
      await verifyBetOdds(createResponse, 'update');
    } catch (e) {
      logError(e, 'creating event update', block.height, transaction);
    }

    return createResponse;
  }

  if (['peerlessParlayBet'].includes(transaction.txType)) {
    //console.log('-------peerlessParlayBet----------');
    const _id = `parlay${rpctx.get('txid')}${block.height}`;
    const betExists = await recordCheck(BetAction, _id);    
    if (betExists) {    
      return betExists;
    }
    const legs = [];
    const eventIds = [];
    for (let legindex=0; legindex < transaction.legCounts; legindex++){            
      const eventId = transaction.betdata[legindex].eventId;
      const outcome = transaction.betdata[legindex].outcome;
      eventIds.push(eventId);
      try {
        const { event, originalRecord } = await getEventData(block, eventId, waitTime);
          
        const eventRecord = event || {};
        let lastSpread;
  
        if ([4, 5].includes(outcome)) {
          const spreadRecords = await Betspread.find({
            eventId: eventId,
            blockHeight: { $lt: block.height },
            createdAt: { $lt: block.createdAt },
          });
  
          lastSpread = spreadRecords[spreadRecords.length - 1];
          //console.log('lastSpread', lastSpread);
        }
        //console.log('eventrecord', eventRecord);
        const leg = {
          eventId,  
          outcome,
          market: `${outcomeMapping[outcome]}`,
          homeOdds: eventRecord.homeOdds || 0,
          awayOdds: eventRecord.awayOdds || 0,
          drawOdds: eventRecord.drawOdds || 0,
          spreadHomePoints: lastSpread ? lastSpread.homePoints : 0,
          spreadAwayPoints: lastSpread ? lastSpread.awayPoints : 0,
          spreadHomeOdds: lastSpread ? lastSpread.homeOdds : 0,
          spreadAwayOdds: lastSpread ? lastSpread.awayOdds : 0,   
          totalPoints: eventRecord.points || 0,
          totalOverOdds: eventRecord.overOdds || 0,
          totalUnderOdds: eventRecord.underOdds || 0,
          startingTime: originalRecord.timeStamp,
          homeTeam: originalRecord.homeTeam,
          awayTeam: originalRecord.awayTeam,
          league: originalRecord.league
        };
        //console.log(leg);
        legs.push(leg);

      } catch (e) {
        logError(e, 'retrieving event data ', block.height, transaction);        
      }  
    }

    try {
      const prices = await Price.aggregate([
        {$project: {diff: {$abs: {$subtract: [block.createdAt, '$createdAt']}}, doc: '$$ROOT'}},
        {$sort: {diff: 1}},
        {$limit: 1}
      ]);
      
      const betValueUSD = prices[0].doc.usd * vout.value;
      
      createResponse = await BetParlay.create({
        _id,
        txId: rpctx.get('txid'),
        blockHeight: block.height,
        createdAt: block.createdAt,
        eventId: eventIds.join(','),
        betChoose: `Parlay`,
        betValue: vout.value,
        betValueUSD: betValueUSD,
        opString: JSON.stringify(transaction),
        opCode: transaction.opCode,
        homeOdds: 0,
        awayOdds: 0,
        drawOdds: 0,        
        transaction,        
        legs: legs,        
      }); 
      //console.log('peerlessParlayBet - create Action', createResponse);
    } catch (e) {
      logError(e, 'creating bet action ', block.height, transaction);
    }
    return true;
  }

  if (['peerlessBet'].includes(transaction.txType)) {
    const _id = `${transaction.eventId}${transaction.outcome}${rpctx.get('txid')}${block.height}`;
    const betExists = await recordCheck(BetAction, _id);        
    if (betExists) {
      // log(`Bet update ${_id} already on record`);
      return betExists;
    }
  
    try {
      const { event, originalRecord } = await getEventData(block, transaction.eventId, waitTime);      
        
      const eventRecord = event || {};
      let lastSpread;

      if ([4, 5].includes(transaction.outcome)) {
        const spreadRecords = await Betspread.find({
          eventId: transaction.eventId,
          blockHeight: { $lt: block.height },
          createdAt: { $lt: block.createdAt },
        });

        lastSpread = spreadRecords[spreadRecords.length - 1];
        //console.log('lastSpread', lastSpread);
      }

      try {
        const prices = await Price.aggregate([
          {$project: {diff: {$abs: {$subtract: [block.createdAt, '$createdAt']}}, doc: '$$ROOT'}},
          {$sort: {diff: 1}},
          {$limit: 1}
        ]);
        
        const betValueUSD = prices[0].doc.usd * vout.value;

        const res = await rpc.call('getbetbytxid', [rpctx.get('txid')]);  
        if (res && res.length > 0){              
          const leg = res[0].legs[0];
          //console.log('peerlessbet', leg);

          // eventId: leg['event-id'],  
          // outcome: leg.outcome,  
          // market: `${outcomeMapping[leg.outcome]}`,
          // resultType: leg.legResultType,  
          // eventResultType: leg.lockedEvent.eventResultType, 
          // homeOdds: leg.lockedEvent.homeOdds, 
          // drawOdds: leg.lockedEvent.drawOdds,
          // awayOdds: leg.lockedEvent.awayOdds,
          // spreadHomePoints: leg.lockedEvent.spreadPoints,                        
          // spreadAwayPoints: -leg.lockedEvent.spreadPoints,                        
          // spreadHomeOdds: leg.lockedEvent.spreadHomeOdds,
          // spreadAwayOdds: leg.lockedEvent.spreadAwayOdds,
          // totalPoints: leg.lockedEvent.totalPoints,
          // totalOverOdds: leg.lockedEvent.totalOverOdds,
          // totalUnderOdds: leg.lockedEvent.totalUnderOdds,
          // startingTime: leg.lockedEvent.starting,
          // homeTeam: leg.lockedEvent.home,
          // awayTeam: leg.lockedEvent.away,
          // league: leg.lockedEvent.tournament,
          // homeScore: leg.lockedEvent.homeScore,
          // awayScore: leg.lockedEvent.awayScore

          createResponse = await BetAction.create({
            _id,
            txId: rpctx.get('txid'),
            blockHeight: block.height,
            createdAt: block.createdAt,
            eventId: transaction.eventId,
            betChoose: outcomeMapping[transaction.outcome],
            betValue: vout.value,
            betValueUSD: betValueUSD,
            opString: JSON.stringify(transaction),
            opCode: transaction.opCode,
            homeOdds: leg.lockedEvent.homeOdds || 0,
            awayOdds: leg.lockedEvent.awayOdds || 0,
            drawOdds: leg.lockedEvent.drawOdds || 0,
            points: eventRecord.points || 0,
            overOdds: eventRecord.overOdds || 0,
            underOdds: eventRecord.underOdds || 0,
            spreadHomePoints: leg.lockedEvent.spreadPoints || 0,
            spreadAwayPoints: -leg.lockedEvent.spreadPoints || 0,
            spreadHomeOdds: leg.lockedEvent.spreadHomeOdds || 0,
            spreadAwayOdds: leg.lockedEvent.spreadAwayOdds || 0,
            transaction,
            matched: !event ? false : true,
          }); 
  
          if (!event) {
            log(`Error finding event#${transaction.eventId} data. Creating transaction error record at height ${block.height}`);
            await createError(_id, rpctx, block, transaction, 'BetAction');
          }
        }
      } catch (e) {
        logError(e, 'creating bet action ', block.height, transaction, originalRecord, event);
      }
    } catch (e) {
      logError(e, 'retrieving event data ', block.height, transaction);
    }

    return createResponse;
  }

  if (['peerlessSpreadsMarket'].includes(transaction.txType)) {
    const _id = `SM${transaction.eventId}${rpctx.get('txid')}${block.height}`;    
    const spreadExists = await recordCheck(Betspread, _id);
    let mhomeOdds;
    let mawayOdds;
    let matched;
    
    if (spreadExists) {
      return spreadExists;
    }
    
    //console.log('peerlessSpreadsMarket', transaction);
    const { spreadPoints } = transaction;
    
    const moneyLine = await Betupdate.find({
      eventId: transaction.eventId,
      createdAt: { $lte: block.createdAt },
    });

    let lastMoneyLine = moneyLine[moneyLine.length - 1];

    // const homePoints = (transaction.homeOdds < transaction.awayOdds) ? -(spreadPoints) : spreadPoints;
    // const awayPoints = (transaction.homeOdds > transaction.awayOdds) ? -(spreadPoints) : spreadPoints;

    if (!lastMoneyLine) {
      let moneyLineEvent = await BetEvent.findOne({ eventId: `${transaction.eventId}` });

      if (!moneyLineEvent) {
        let moneyLineData = await waitForData(transaction.eventId, 150);
        moneyLineEvent = moneyLineData[0];
      }
      lastMoneyLine = moneyLineEvent;
      try {
        lastMoneyLine.opObject = lastMoneyLine.transaction;
        mhomeOdds = lastMoneyLine.opObject.get('homeOdds');
        mawayOdds = lastMoneyLine.opObject.get('awayOdds');
        matched = true;
      } catch (e) {
        // console.log(`Unmatched spread for event#${transaction.eventId} at height ${block.height}`);
        mhomeOdds = transaction.homeOdds;
        mawayOdds = transaction.awayOdds;;
        matched = false;
      }
    }

    // mhomeOdds = lastMoneyLine.opObject.get('homeOdds');
    // mawayOdds = lastMoneyLine.opObject.get('awayOdds');

    //const homePoints = (mhomeOdds < mawayOdds) ? -(spreadPoints) : spreadPoints;
    //const awayPoints = (mhomeOdds > mawayOdds) ? -(spreadPoints) : spreadPoints;

    const homePoints = spreadPoints;
    const awayPoints = -(spreadPoints);

    try {
      createResponse = await Betspread.create({
        _id,
        txId: rpctx.get('txid'),
        blockHeight: block.height,
        createdAt: block.createdAt,
        opCode: transaction.opCode,
        type: transaction.type,
        txType: transaction.txType,
        eventId: transaction.eventId,
        opObject: transaction,
        homeOdds: transaction.homeOdds,
        awayOdds: transaction.awayOdds,
        betValue: vout.value,
        value: transaction.betValue,
        transaction,
        homePoints,
        awayPoints,
        mhomeOdds,
        mawayOdds,
        matched,
      });

      await verifySpreadActions(createResponse, 'update');
    } catch (e) {
      logError(e, 'creating spreads data', block.height, transaction);
    }

    return createResponse;
  }

  if (['peerlessTotalsMarket'].includes(transaction.txType)) {
    const _id = `TM${transaction.eventId}${rpctx.get('txid')}${block.height}`;
    const spreadExists = await recordCheck(Bettotal, _id);

    if (spreadExists) {
      return spreadExists;
    }

    try {
      createResponse = await Bettotal.create({
        _id,
        txId: rpctx.get('txid'),
        blockHeight: block.height,
        createdAt: block.createdAt,
        opCode: transaction.opCode,
        type: transaction.type,
        txType: transaction.txType,
        eventId: transaction.eventId,
        opObject: transaction,
        points: transaction.spreadPoints,
        overOdds: transaction.homeOdds,
        underOdds: transaction.awayOdds,
        matched: true,
      });
    } catch (e) {
      logError(e, 'creating peerless totals market', block.height, transaction);
    }

    return createResponse;
  }

  if (['peerlessResult'].includes(transaction.txType)) {
    const _id = `${transaction.eventId}${rpctx.get('txid')}${block.height}`;
    const resultExists = await recordCheck(BetResult, _id);

    if (resultExists) {
      return resultExists;
    }

    
    try {
      
      const prices = await Price.aggregate([
        {$project: {diff: {$abs: {$subtract: [block.createdAt, '$createdAt']}}, doc: '$$ROOT'}},
        {$sort: {diff: 1}},
        {$limit: 1}
      ]);
      
      let resultPayoutTxs = await TX.find({ blockHeight: block.height + 1 });

      createResponse = await BetResult.create({
        _id,
        txId: rpctx.get('txid'),
        blockHeight: block.height,
        createdAt: block.createdAt,
        eventId: transaction.eventId,
        result: resultMapping[transaction.resultType],
        opString: JSON.stringify(transaction),
        payoutTx: resultPayoutTxs[0],
        transaction,
        matched: true,
      });
      
      const events = await BetEvent.find({eventId: `${transaction.eventId}`})
      try {
        if (events.length > 0){
          for (i=0; i<events.length; i++){
            const event = events[i];
            event.status = "completed";
            event.completedAt = block.createdAt;
            await event.save();
          }          
        }      
      } catch (e) {
        logError(e, 'saving status update', block.height, transaction);
      }

      const actions = await BetAction.find({eventId: `${transaction.eventId}`});
      if (actions && actions.length > 0){        
        for (const action of actions){        
          if (action != null){              
            const res = await rpc.call('getbetbytxid', [action.txId]);  
            if (res){                  
              const betinfo = res[0];
              action.completed = betinfo.completed == 'yes' ? true : false;
              action.betResultType = betinfo.betResultType;
              action.payout = 0;
              action.payoutUSD = 0;
              if(betinfo.payout != 'pending') {
                action.payout = betinfo.payout;
                action.payoutUSD = prices[0].doc.usd * betinfo.payout;
              }
              action.payoutTxId = betinfo.payoutTxHash;
              action.payoutNout = betinfo.payoutTxOut != 'pending' ? betinfo.payoutTxOut : 0;
              if (betinfo.legs.length > 0){
                const leg = betinfo.legs[0]
                action.homeScore = leg.lockedEvent.homeScore != "undefined" ? leg.lockedEvent.homeScore : 0,
                action.awayScore = leg.lockedEvent.awayScore != "undefined" ? leg.lockedEvent.awayScore : 0
              }              
              try {
                await action.save()
              } catch (e_save) {
                console.log(e_save);
              }
            }            
          } 
        }
      }
      
      const betparlays = await BetParlay.find({"legs.eventId": `${transaction.eventId}`});      
      if (betparlays && betparlays.length > 0){
        try {                                 
          for (const betItem of betparlays){      
            if (betItem.txId){                                                                   
                const res = await rpc.call('getbetbytxid', [betItem.txId]);  
                if (res){                  
                  const betinfo = res[0];                                                      
                  if (betinfo.legs.length > 1){                                                            
                    betItem.completed = betinfo.completed == 'yes'? true: false;
                    betItem.betResultType = betinfo.betResultType;
                    betItem.payout = 0;
                    betItem.payoutUSD = 0;
                    if(betinfo.payout != 'pending') {
                      betItem.payout = betinfo.payout;
                      betItem.payoutUSD = prices[0].doc.usd * betinfo.payout;
                    } 
                    betItem.payoutTxId = betinfo.payoutTxHash;                      
                    betItem.payoutNout = betinfo.payoutTxOut != 'pending' ? betinfo.payoutTxOut : 0;
                    const legs = [];
                    for (const leg of betinfo.legs){                    
                      const item = {
                        eventId: leg['event-id'],  
                        outcome: leg.outcome,  
                        market: `${outcomeMapping[leg.outcome]}`,
                        resultType: leg.legResultType,  
                        eventResultType: leg.lockedEvent.eventResultType, 
                        homeOdds: leg.lockedEvent.homeOdds, 
                        drawOdds: leg.lockedEvent.drawOdds,
                        awayOdds: leg.lockedEvent.awayOdds,
                        spreadHomePoints: leg.lockedEvent.spreadPoints,                        
                        spreadAwayPoints: -leg.lockedEvent.spreadPoints,                        
                        spreadHomeOdds: leg.lockedEvent.spreadHomeOdds,
                        spreadAwayOdds: leg.lockedEvent.spreadAwayOdds,
                        totalPoints: leg.lockedEvent.totalPoints,
                        totalOverOdds: leg.lockedEvent.totalOverOdds,
                        totalUnderOdds: leg.lockedEvent.totalUnderOdds,
                        startingTime: leg.lockedEvent.starting,
                        homeTeam: leg.lockedEvent.home,
                        awayTeam: leg.lockedEvent.away,
                        league: leg.lockedEvent.tournament,
                        homeScore: leg.lockedEvent.homeScore != "undefined" ? leg.lockedEvent.homeScore : 0,
                        awayScore: leg.lockedEvent.awayScore != "undefined" ? leg.lockedEvent.awayScore : 0
                      };                      
                      legs.push(item);
                    }                    
                    betItem.legs = legs;
                  } 
                  try {
                    await betItem.save()       
                  } catch (e_save){
                    console.log(e_save);
                  }
                  
                }                               
              
            }            
          }
        } catch (e) {
          response = { error: true, fullError: e};
        }                
      }      
    } catch (e) {
      createResponse = e;
      logError(e, ' creating bet result', block.height, transaction);
    }

    return createResponse;
  }

  const transactionId = `${transaction.txType}-${rpctx.get('txid')}${block.height}`;
  const transactionsExists = await recordCheck(Transaction, transactionId);

  if (transactionsExists) {
    return transactionsExists;
  }

  return Transaction.create({
    _id: transactionId,
    txId: rpctx.get('txid'),
    blockHeight: block.height,
    createdAt: block.createdAt,
    opCode: transaction.opCode,
    type: transaction.type,
    txType: transaction.txType,
    opObject: transaction,
    betValue: vout.value || 0,
    matched: false,
  });
}

module.exports = {
  deleteBetData,
  recordCheck,
  saveOPTransaction,
  getBetData,
  getEventData,
};
