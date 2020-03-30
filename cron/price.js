require('babel-polyfill');
const { exit } = require('../lib/cron');
const locker = require('../lib/locker');
const Price = require('../model/price');
const moment = require('moment');
const readline = require('readline');
const fs = require('fs');
const config = require('../config');
const fetch = require('../lib/fetch');

async function start(){
  try {
    //const usdUrl = `https://api.coinmarketcap.com/v2/ticker/${ config.coinMarketCap.tickerId }/?convert=USD`;
    const latest_price = await Price.find({}).sort({createdAt: -1}).limit(1);
    console.log(latest_price[0].createdAt);
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
  } catch (err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch (err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}


update();