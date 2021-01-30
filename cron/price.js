require('babel-polyfill');
const { exit } = require('../lib/cron');
const locker = require('../lib/locker');
const Price = require('../model/price');
const moment = require('moment');
const readline = require('readline');
const fs = require('fs');
const config = require('../config');
const fetch = require('../lib/fetch');
const { log } = console;

async function start(){
  try {

   /* const startDateMilliSecond = 1499299200000; //'2017-07-06T012:00:00.000+00:00';
    let  startDate  = new Date(startDateMilliSecond);
    
    console.log(startDate);
    let lastRecordDate = await Price.findOne({}).sort('-createdAt')
    if(lastRecordDate)
    {
    startDate = lastRecordDate.createdAt;
    }
    
    //end date , 7 days
    
    let endDate = new Date(startDate.getTime() + 7 * 24*60*60*1000);
    
    console.log(startDate,endDate)
    const apiUrl = `https://http-api.livecoinwatch.com/coins/history/range?coin=WGR&start=${startDate.getTime()}&end=${endDate.getTime()}&currency=USD`
    let market = await fetch(apiUrl);
    
    let priceData = market.data;
    
    let objs=[];
    
    for(var p1 in priceData) {
    let p = priceData[p1]
    objs.push({usd: p.rate, createdAt:new Date(p.date)});
    }
    
    await Price.insertMany(objs);
    */
    
    const usdUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ config.coinMarketCap.tickerId }&CMC_PRO_API_KEY=937ce6ea-d220-4a0c-9439-23f9e28993b3&convert=USD`;
    let market = await fetch(usdUrl);

    market = market.data ? market.data[`${ config.coinMarketCap.tickerId }`] : {};
    const date = moment().utc().startOf('minute').toDate(); 
    console.log(market);
    if (market.id){      
      const price = new Price({
        usd: market.quote.USD.price, 
        createdAt: date
      });
      await price.save();
      console.log(date);
    }

  } catch (err){
    console.log(err);
  }
}

async function update() {
  const type = 'price';
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