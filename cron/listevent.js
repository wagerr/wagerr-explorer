require('babel-polyfill')
require('../lib/cron')
const config = require('../config')
const {exit, rpc} = require('../lib/cron')
const fetch = require('../lib/fetch')
const {forEach} = require('p-iteration')
const locker = require('../lib/locker')
const moment = require('moment')
// Models.
const ListEvent = require('../model/listevent')
const { log } = console;

console.log('Running listevent cron job');

/**
 * Get a list of the mns and request IP information
 * from freegeopip.net.
 */
async function syncListEvents () {
  const date = moment().utc().startOf('minute').toDate()

  await ListEvent.deleteMany({})

  // Increase the timeout for listevents.
  rpc.timeout(10000) // 10 secs

  const events = await rpc.call('listevents')
  const inserts = []
  await forEach(events, async (event) => {
    const listEvent = new ListEvent({
      event_id: event.event_id,
      sport: event.sport,
      tournament: event.tournament,
      starting: event.starting,
      tester: event.tester,
      teams: event.teams,
      odds: event.odds
    })

    inserts.push(listEvent)
  })

  if (inserts.length) {
    await ListEvent.insertMany(inserts)
  }
}

/**
 * Handle locking.
 */
async function update () {
  const type = 'listevent'
  let code = 0

  try {
    locker.lock(type)
    await syncListEvents()
    locker.unlock(type)
    
  } catch (err) {
    log(err)
    code = 1
    exit(code)
  } finally {
    code = 0
    exit(code)
    
  }
}

update()
