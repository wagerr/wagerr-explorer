require('babel-polyfill');
const { exit } = require('../lib/cron');
const locker = require('../lib/locker');
const Price = require('../model/price');
const moment = require('moment');
const readline = require('readline');
const fs = require('fs');
const config = require('../config');
const fetch = require('../lib/fetch');
const BetResult = require('../model/betresult');
const BetAction = require('../model/betaction');
const BetParlay = require('../model/betparlay');
const { rpc } = require('../lib/cron');
const { log } = console;

async function start(){
  try {
    const betresults = await BetResult.find({});
    for (betresult of betresults){

      const prices = await Price.aggregate([
        {$project: {diff: {$abs: {$subtract: [betresult.createdAt, '$createdAt']}}, doc: '$$ROOT'}},
        {$sort: {diff: 1}},
        {$limit: 1}
      ]);

      console.log('--------resyncing betactions in betresult-------------')
      const betactions = await BetAction.find({completed: false, eventId: betresult.eventId});
      if (betactions && betactions.length > 0){        
        for (const action of betactions){        
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
                action.payoutDate = betresult.createdAt
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
      console.log('--------resyncing betparlays in betresult-------------')
      const betparlays = await BetParlay.find({
        "legs.eventId": betresult.eventId,        
        "completed": false
      });

      if (betparlays && betparlays.length > 0){
        try {                                 
          for (const betItem of betparlays){      
            if (betItem.txId){                                                                   
                const res = await rpc.call('getbetbytxid', [betItem.txId]);  
                if (betItem.txId){                                                                   
                  const res = await rpc.call('getbetbytxid', [betItem.txId]);  
                  if (res){                  
                    const betinfo = res[0];                                                      
                    if (betinfo.legs.length >= 1){                                                            
                      betItem.completed = betinfo.completed == 'yes'? true: false;
                      betItem.betResultType = betinfo.betResultType;
                      betItem.payout = 0;
                      betItem.payoutUSD = 0;
                      if(betinfo.payout != 'pending') {
                        betItem.payout = betinfo.payout;
                        betItem.payoutUSD = prices[0].doc.usd * betinfo.payout;
                        betItem.payoutDate = betresult.createdAt
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
          }
        } catch (e) {
          response = { error: true, fullError: e};
        }                
      }   
    }
  } catch (err){
    console.log(err);
  }
}

async function update() {
  const type = 'resyncingResults';
  let code = 0;

  try {
    locker.lock(type);
    await start();
    locker.unlock(type);
  } catch (err) {
    log(err);
    code = 1;
    exit(code);
  } finally {
    code = 0;
    exit(code);
    
  }
}


update();