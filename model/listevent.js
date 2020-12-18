
const mongoose = require('mongoose');

/**
 * Listevent
 *
 * Connected betevent to the network.
 */
/* {
  "event_id": 77826,
  "sport": "Soccer",
  "tournament": "Brazil Serie A",
  "starting": 1607902200,
  "tester": 1666,
  "teams": {
    "home": "Vasco da Gama",
    "away": "Fluminense"
  },
  "odds": [
    {
      "mlHome": 33500,
      "mlAway": 24600,
      "mlDraw": 35100
    },
    {
      "favorite": "away",
      "spreadPoints": 0,
      "spreadHome": 0,
      "spreadAway": 0
    },
    {
      "totalsPoints": 25,
      "totalsOver": 24600,
      "totalsUnder": 16800
    }
  ]
}*/

const ListEvent = mongoose.model('ListEvent', new mongoose.Schema({
  __v: { select: false, type: Number },
  event_id: { index: true, required: true, type: Number },
  sport: {require: true, type:String},
  tournament: { required: true, type: String },
  tester: { required: false, type: Number },
  starting: { index: true,  required: true, type: String },
  teams:  { required: true, type: Object },
  odds: { required: true, type: [Object]}
}, { versionKey: false }), 'listevents');


module.exports =  ListEvent;
