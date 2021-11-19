const { exit, rpc } = require('../../lib/cron');
const Block = require('../../model/block');
const Coin = require('../../model/coin');
const Masternode = require('../../model/masternode');
const Peer = require('../../model/peer');
const Rich = require('../../model/rich');
const TX = require('../../model/tx');
const UTXO = require('../../model/utxo');
const BetAction = require('../../model/betaction');
const BetUpdate = require('../../model/betupdate');
const BetTotal = require('../../model/bettotal');
const BetSpread = require('../../model/betspread');
const BetEvent = require('../../model/betevent');
const BetPayout = require('../../model/betpayout');
const BetResult = require('../../model/betresult');
const BetParlay = require('../../model/betparlay');
const ListEvent = require('../../model/listevent');
const BetError = require('../../model/beterror');
const MappingName = require('../../model/mappingname');
const Statistic = require('../../model/statistic');
const STXO = require('../../model/stxo');
const { forEachSeries } = require('p-iteration');


async function clear() {
await Block.deleteMany({ height: { $gte: 1501000 } });
await TX.deleteMany({ blockHeight: { $gte: 1501000 } });
await UTXO.deleteMany({ blockHeight: { $gte: 1501000 } });
await STXO.deleteMany({ blockHeight: { $gte: 1501000 } });
await  BetAction.deleteMany({ blockHeight: { $gte: 1501000 } });
await  BetParlay.deleteMany({ blockHeight: { $gte: 1501000 } });
await  BetEvent.deleteMany({ blockHeight: { $gte: 1501000 } });
await  BetResult.deleteMany({ blockHeight: { $gte: 1501000 } });

await BetTotal.deleteMany({ blockHeight: { $gte: 1501000 }});
await BetSpread.deleteMany({ blockHeight: { $gte: 1501000 }});
await BetUpdate.deleteMany({ blockHeight: { $gte: 1501000 }});
await BetError.deleteMany({ blockHeight: { $gte: 1501000 }});

}

clear();