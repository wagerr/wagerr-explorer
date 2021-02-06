
const mongoose = require('mongoose');

/**
 * BetEvent
 *
 */

const BetLeg = new mongoose.Schema({  
  eventId: { required: true, type: String },  
  outcome: { required: true, type: Number },
  market: { required: true, type: String },
  resultType: { required: true, type: String, default: 'pending' },  
  eventResultType: { required: true, type: String, default: 'pending' }, 
  homeOdds: { required: true, type: String },
  drawOdds: { required: true, type: String },
  awayOdds: { required: true, type: String },
  spreadHomePoints: { required: false, type: Number },  
  spreadAwayPoints: { required: false, type: Number },  
  spreadHomeOdds: { required: false, type: Number },
  spreadAwayOdds: { required: false, type: Number },
  totalPoints: { required: false, type: Number },
  totalOverOdds: { required: false, type: Number },
  totalUnderOdds: { required: false, type: Number },
  startingTime: { required: true, type: Number },
  homeTeam: {  required: true, type: String },
  awayTeam: {  required: true, type: String },
  league: { required: true, type: String },
  homeScore: {  required: false, type: Number },
  awayScore: {  required: false, type: Number },
});

const BetParlay = mongoose.model('BetParlay', new mongoose.Schema({
  _id: { required: true, type: String },
  txId: { index: true, required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  createdAt: { required: true, type: Date },
  eventId: { index: true, required: true, type: String },
  betValue: { required: true, type: Number },
  betValueUSD: { required: true, type: Number },
  betChoose: { required: true, type: String },
  opString: { required: true, type: String },
  opCode: { required: false, type: String},
  homeOdds: { required: true, type: String },
  drawOdds: { required: true, type: String },
  awayOdds: { required: true, type: String },
  points: { required: false, type: Number },
  overOdds: { required: false, type: Number },
  underOdds: { required: false, type: Number },
  transaction: { required: false, type: Map },
  matched: { required: false, type: Boolean, default: false },
  fixed: { required: false, type: Boolean, default: false },
  visibility: { required: false, type: Boolean, default: true },
  spreadHomePoints: { required: false, type: Number },
  spreadAwayPoints: { required: false, type: Number },
  spreadHomeOdds: { required: false, type: Number },
  spreadAwayOdds: { required: false, type: Number },
  legs: { required: true, type: [BetLeg], default: []},
  completed: { required: true, type: Boolean, default: false },
  betResultType: { required: true, type: String, default:'pending' },
  payout: { required: false, type: Number },
  payoutUSD: { required: false, type: Number },
  payoutDate: { index:true,required: false, type: Date },
  payoutTxId: { required: false, type: String },
  payoutNout: { required: false, type: String },
}, { versionKey: false }), 'betparlays');

module.exports =  BetParlay;
