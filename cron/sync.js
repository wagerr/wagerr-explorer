const { exit } = require('../lib/cron');
const locker = require('../lib/locker');

const betUpdate = require('./bet');
const lottoUpdate = require('./lotto');
const errorUpdates = require('./errors');
const unmatchedSpreads = require('./spreads');

const { log } = console;

const type = 'sync';
let code = 0;

async function exec() {
  try {
  locker.lock(type);
  
  log('------------------------------');
  log('--- RUNNING SYNC FUNCTIONS ---');
  log('------------------------------');
  
  log('[1] RUNNING BET SYNC WORKER...');
  await betUpdate()

  log('------------------------------');
  log('[2] RUNNING LOTTO SYNC WORKER...');
  await lottoUpdate();
  
  log('------------------------------');
  log('[3] RUNNING ERRORS CHECK WORKER..');
  await errorUpdates();

  log('------------------------------');
  log('SYNC FUNCTIONS COMPLETED');
   
  locker.unlock(type);
  // .then(() => {
  //   log('------------------------------');
  //   log('[4]CHECKING UNMATCHED SPREADS...');
  //   return unmatchedSpreads();
  // })
    
  } catch(err) {
    log(err)
    code = 1;
    exit(code);
  } finally {
    code = 0;
    exit(code);
  }
   
}



exec();