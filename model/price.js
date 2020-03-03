const mongoose = require('mongoose');

/**
 * Coin
 *
 * Represents the state of the coin in general.
 */
const Price = mongoose.model('Price', new mongoose.Schema({
  __v: { select: false, type: Number },
  createdAt: { index: true, required: true, type: Date },
  usd: { required: true, type: Number },
}, { versionKey: false }), 'prices');

module.exports =  Price;
