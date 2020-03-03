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
    const usdUrl = `https://api.coinmarketcap.com/v2/ticker/${ config.coinMarketCap.tickerId }/?convert=USD`;
    let market = await fetch(usdUrl);

    market = market.data ? market.data : {};
    const date = moment().utc().startOf('minute').toDate(); 
    
    if (market.id){      
      const price = new Price({
        usd: market.quotes.USD.price,
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