require('babel-polyfill');
const { exit } = require('../lib/cron');
const locker = require('../lib/locker');
const Price = require('../model/price');
const moment = require('moment');
const readline = require('readline');
const fs = require('fs');

async function startfromJsonFile(){
  try {
    const readInterface = readline.createInterface({
      input: fs.createReadStream('../coins.json'),
      output: process.stdout,
      console: false
    });

    return new Promise((resolve, reject) => {
      readInterface.on('line', function(line) {
        //console.log(line);
        const row = JSON.parse(line);        
        const price = new Price({
          createdAt: new Date(row.createdAt.$date),
          usd: row.usd,
        });
        price.save();
        console.log(row.createdAt);
      });
    })        
  } catch (err){
    console.log(err);
  }
}

async function insertFromFixedValue(start_time,  end_time, fixed_price){
  for (let i = start_time; i < end_time; i = i + 300){
    let date = moment.unix(i).utc().toDate();
    date = new Date(date);
    console.log(date);
    const price = new Price({
      createdAt: date,
      usd: fixed_price,
    });
    await price.save();
  }
}

async function update() {
  const type = 'importprice';
  let code = 0;

  try {
    locker.lock(type);
    await insertFromFixedValue(1583366400, 1585526400, 0.02);
    //await startfromJsonFile();
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