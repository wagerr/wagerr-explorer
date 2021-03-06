const mongoose = require('mongoose');


const Bettotal = mongoose.model('Bettotal', new mongoose.Schema({
  _id: { required: true, select: false, type: String },
  txId: { index: true, required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  createdAt: { required: true, type: Date },
  opCode: { required: false, type: String },
  opObject: { required: false, type: Map },
  type: { required: false, type: Number },
  eventId: { index: true,  required: true, type: String },
  points: { required: true, type: Number },
  overOdds: { required: true, type: Number },
  underOdds: {  required: true, type: Number },
  txType: { required: false, type: String },
  matched: { required: false, type: Boolean, default: false },
  visibility: { required: false, type: Boolean, default: true }
}, { versionKey: false }), 'bettotals');
  
module.exports =  Bettotal;
  