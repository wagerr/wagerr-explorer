const _ = require('lodash');
const moment = require('moment');
const { BigNumber } = require('bignumber.js');
const { forEach } = require('p-iteration');

const { getSubsidy } = require('../../lib/blockchain');
const chain = require('../../lib/blockchain');
const { rpc } = require('../../lib/cron');
const { CarverAddressType, CarverMovementType, CarverTxType } = require('../../lib/carver2d');
const { CarverAddress, CarverMovement, CarverAddressMovement } = require('../../model/carver2d');
const  opCode = require('../../lib/op_code')
// System models for query and etc.
const Block = require('../../model/block');
const Coin = require('../../model/coin');
const Price = require('../../model/price');
const Masternode = require('../../model/masternode');
const Peer = require('../../model/peer');
const Rich = require('../../model/rich');
const TX = require('../../model/tx');
const UTXO = require('../../model/utxo');
const STXO = require('../../model/stxo');
const ListEvent = require('../../model/listevent');
const BetEvent = require('../../model/betevent');
const BetUpdate = require('../../model/betupdate');
const BetAction = require('../../model/betaction');
const BetParlay = require('../../model/betparlay');
const BetResult = require('../../model/betresult');
const Proposal = require('../../model/proposal');
const Statistic = require('../../model/statistic');
const Betspread = require('../../model/betspread');
const Bettotal = require('../../model/bettotal');
// Lotto models
const LottoEvent = require('../../model/lottoevent');
const LottoBet = require('../../model/lottobet');
const LottoResult = require('../../model/lottoresult');

// util functions

const displayNum = (num, divider) => {
  const value = num > 0 ? `+${num / divider}` : `${num / divider}`;

  return value;
};

/**
 * Get transactions and unspent transactions by address.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAddress = async (req, res) => {
  req.clearTimeout();
  try {
    const txs = await TX
      .aggregate([
        { $match: { $or: [{ 'vout.address': req.params.hash }, { 'vin.address': req.params.hash }] } },
        { $sort: { blockHeight: -1 } },
      ])
      .allowDiskUse(true)
      .exec();

    const sent = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
      .reduce((acc, tx) => acc.plus(tx.vin.reduce((a, t) => {
        if (t.address === req.params.hash) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))), BigNumber(0.0));

    const received = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
      .reduce((acc, tx) => acc.plus(tx.vout.reduce((a, t) => {
        if (t.address === req.params.hash) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))), BigNumber(0.0));

    const staked = txs.filter((tx) => tx.vout[0].address === 'NON_STANDARD')
      .reduce((acc, tx) => acc.minus(tx.vin.reduce((a, t) => {
        if (t.address === req.params.hash) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))).plus(tx.vout.reduce((a, t) => {
        if (t.address === req.params.hash) {
          return a.plus(BigNumber(t.value));
        }

        return a;
      }, BigNumber(0.0))), BigNumber(0.0));

    const balance = received.plus(staked).minus(sent);
    res.json({
      balance: balance.toNumber(),
      sent: sent.toNumber(),
      staked: staked.toNumber(),
      received: received.toNumber(),
      txs,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Will return the average block time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgBlockTime = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = 90.0;
  let cutOff = moment().utc().add(60, 'seconds').unix();
  let loading = true;

  // Generate the average.
  const getAvg = async () => {
    loading = true;

    try {
      const date = moment.utc().subtract(24, 'hours').toDate();
      const blocks = await Block.find({ createdAt: { $gt: date } });
      const seconds = 24 * 60 * 60;

      cache = seconds / blocks.length;
      cutOff = moment().utc().add(60, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      if (!cache) {
        cache = 0.0;
      }

      loading = false;
    }
  };

  // Load the initial cache.
  getAvg();

  return async (req, res) => {
    res.json(cache || 0.0);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getAvg();
    }
  };
};

/**
 * Will return the average masternode payout time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgMNTime = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = 24.0;
  let cutOff = moment().utc().add(5, 'minutes').unix();
  let loading = true;

  // Generate the average.
  const getAvg = async () => {
    loading = true;

    try {
      const date = moment.utc().subtract(24, 'hours').toDate();
      const blocks = await Block.find({ createdAt: { $gt: date } });
      const mns = await Masternode.find();

      cache = (24.0 / (blocks.length / mns.length));
      cutOff = moment().utc().add(5, 'minutes').unix();
    } catch (err) {
      console.log(err);
    } finally {
      if (!cache) {
        cache = 0.0;
      }

      loading = false;
    }
  };

  // Load the initial cache.
  getAvg();

  return async (req, res) => {
    res.json(cache || 0.0);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getAvg();
    }
  };
};

/**
 * Get block by hash or height.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getBlock = async (req, res) => {
  try {
    const query = isNaN(req.params.hash)
      ? { hash: req.params.hash }
      : { height: req.params.hash };
    const block = await Block.findOne(query);
    if (!block) {
      res.status(404).send('Unable to find the block!');
      return;
    }

    const txs = await TX.find({ txId: { $in: block.txs }});

    res.json({ block, txs });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return the coin information.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoin = (req, res) => {
  Coin.findOne()
    .sort({ createdAt: -1 })
    .then((doc) => {
      res.json({ ...doc._doc, wgr: 1 });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get history of coin information.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinHistory = (req, res) => {
  Coin.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 12) // 12x5=60 mins
    .sort({ createdAt: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return all the coins for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinsWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getCoins = async () => {
    loading = true;

    try {
      const start = moment().utc().subtract(8, 'days').toDate();
      const end = moment().utc().toDate();
      const qry = [
        // Select last 7 days of coins.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { createdAt: 1 } }
      ];

      cache = await Coin.aggregate(qry);
      cutOff = moment().utc().add(90, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getCoins();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getCoins();
    }
  };
};

/**
 * Will return true if a block hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getIsBlock = async (req, res) => {
  try {
    let isBlock = false;

    // Search for block hash.
    const block = await Block.findOne({ hash: req.params.hash });
    if (block) {
      isBlock = true;
    }

    res.json(isBlock);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodes = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await Masternode.find().sort({ lastPaidAt: -1, status: 1 }).countDocuments();
    const mns = await Masternode.find().skip(skip).limit(limit).sort({ lastPaidAt: -1, status: 1 });

    res.json({ mns, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get a masternode by wallet adress hash from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeByAddress = async (req, res) => {
  try {
    const { hash } = req.params;
    const mns = await Masternode.findOne({ addr: hash });

    res.json({ mns });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeCount = async (req, res) => {
  try {
    const coin = await Coin.findOne().sort({ createdAt: -1 });

    res.json({ enabled: coin.mnsOn, total: coin.mnsOff + coin.mnsOn });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the list of peers from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getPeer = (req, res) => {
  Peer.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 500)
    .sort({ ip: 1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get coin supply information for usage.
 * https://github.com/coincheckup/crypto-supplies
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getSupply = async (req, res) => {
  try {
    const info = await rpc.call('getinfo');
    res.json(info.moneysupply);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the top 100 addresses from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTop100 = (req, res) => {
  Rich.find()
    .limit(100)
    .sort({ value: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

const getTop1002 = async (req, res) => {
  try {
    const docs = await cache.getFromCache("top100", moment().utc().add(1, 'hours').unix(), async () => {
      const top100Addresses = await CarverAddress.find({ carverAddressType: CarverAddressType.Address }, { sequence: 0 })
        .limit(100)
        .sort({ balance: -1 }).populate({ path: "lastMovement", select: { carverMovement: 1 }, populate: { path: 'carverMovement', select: { date: 1 } } }); //@todo remove lastMovement;

      // For each address split them into 3 address (MN,POS,POW). Add each address to an array.
      const addressesToFetch = top100Addresses.reduce((addressesToFetch, address) => {
        return [
          ...addressesToFetch,
          `${address.label}:MN`,
          `${address.label}:POS`,
          `${address.label}:POW`
        ]
      }, []);
      const rewardAddressBalances = await CarverAddress.find({ label: { $in: addressesToFetch } }, { _id: 0, label: 1, valueOut: 1 })

      // For each top 100 address find any matching rewards addresses and calculate the total rewards for that address
      const addressesWithBalances = top100Addresses.map((address) => {
        // Calculate the total rewards sum for a specific address
        const rewardsSumValue = rewardAddressBalances.reduce((sum, rewardAddress) => {
          return sum + ([`${address.label}:MN`, `${address.label}:POS`, `${address.label}:POW`].includes(rewardAddress.label) ? rewardAddress.valueOut : 0);
        }, 0);

        return {
          ...address.toObject(),
          rewardsSumValue
        }
      });

      return addressesWithBalances;
    });

    res.json(docs);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXLatest = (req, res) => {
  TX.find()
    .limit(10)
    .sort({ blockHeight: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return the transaction information for given hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTX = async (req, res) => {
  try {
    const query = isNaN(req.params.hash)
      ? { txId: req.params.hash }
      : { height: req.params.hash };
    let tx = await TX.findOne(query);
    if (!tx) {
      res.status(404).send('Unable to find the transaction!');
      return;
    }

    // Get the transactions that are found in the
    // vin section of the tx.
    const vin = [];
    await forEach(tx.vin, async (vi) => {
      if (tx.vout[0].address === 'NON_STANDARD' && !vi.coinbase) {
        vin.push({ coinstake: true });
      } else if (vi.isZcSpend) {
        vin.push({ isZcSpend: true, value: vi.sequence });
      } else if (vi.txId) {
        const t = await TX.findOne({ txId: vi.txId });
        if (t) {
          t.vout.forEach((vo) => {
            if (vo.n === vi.vout) {
              vin.push({ address: vo.address, value: vo.value });
            }
          });
        }
      } else if (vi.coinbase) {
        vin.push(vi);
      }
    });

    tx = tx.toObject();
    for (let i=0; i<tx.vout.length; i++){
      vout = tx.vout[i];
      if (vout.address.indexOf('OP_RETURN 1|') == -1 || vout.address.indexOf('OP_RETURN 2|') == -1 || vout.address.indexOf('OP_RETURN 3|') == -1) {
        if (vout.address.indexOf('OP_RETURN') !== -1){          
          let betaction = await BetAction.findOne({txId: tx.txId});
          if (betaction){
            if (betaction.betChoose.includes('Home')) {
              betaction.odds = betaction.homeOdds / 10000
            } else if (betaction.betChoose.includes('Away')) {
              betaction.odds = betaction.awayOdds / 10000
            } else {
              betaction.odds = betaction.drawOdds / 10000
            }
            if (betaction.betChoose.includes('Money Line')) {
              tx.vout[i].price = betaction.odds;
            } else if (betaction.betChoose.includes('Spreads')) {
              const betChoose = betaction.betChoose.replace('Spreads - ', '');
              tx.vout[i].price = betChoose == 'Away' ? betaction.spreadAwayOdds / 10000 : betaction.spreadHomeOdds / 10000;
              tx.vout[i].Spread = betChoose == 'Away' ? displayNum(betaction.spreadAwayPoints, 10) : displayNum(betaction.spreadHomePoints, 10);
            } else if (betaction.betChoose.includes('Totals')) {
              tx.vout[i].price = betaction.betChoose.includes('Over') ? betaction.overOdds / 10000 : betaction.underOdds / 10000
              tx.vout[i].Total = (betaction.points / 10).toFixed(1)
            };
            tx.vout[i].market = betaction.betChoose;
            tx.vout[i].eventId = betaction.eventId;

            // const prices = await Price.aggregate([
            //   {$project: {diff: {$abs: {$subtract: [betaction.createdAt, '$createdAt']}}, doc: '$$ROOT'}},
            //   {$sort: {diff: 1}},
            //   {$limit: 1}
            // ]);

            tx.vout[i].betValue = betaction.betValue;
            tx.vout[i].betValueUSD = betaction.betValueUSD;
            tx.vout[i].isParlay = 0;
            // if (prices.length > 0){
            //   tx.vout[i].betValueUSD = prices[0].doc.usd * betaction.betValue;
            // }
            tx.vout[i].betResultType = betaction.betResultType;
            tx.vout[i].completed = betaction.completed;
            tx.vout[i].payout = betaction.payout;
            tx.vout[i].payoutTxId = betaction.payoutTxId;
            tx.vout[i].payoutNout = betaction.payoutNout;

            betevent = await BetEvent.findOne({eventId: betaction.eventId});
            if (betevent){
              tx.vout[i].homeTeam = betevent.homeTeam
              tx.vout[i].awayTeam = betevent.awayTeam
              tx.vout[i].league = betevent.league
            }
            continue;
          }          
          let betparlay = await BetParlay.findOne({txId: tx.txId});
          if (betparlay){
            tx.vout[i].payout = betparlay.payout;
            tx.vout[i].payoutTxId = betparlay.payoutTxId;
            tx.vout[i].payoutNout = betparlay.payoutNout;
            tx.vout[i].betValueUSD = betparlay.betValueUSD;
            tx.vout[i].betValue = betparlay.betValue;
            tx.vout[i].completed = betparlay.completed;
            tx.vout[i].betResultType = betparlay.betResultType;
            tx.vout[i].isParlay = 1;
            tx.vout[i].market = 'Parlay';
            const legs = [];
            for (let leg of betparlay.legs){
              const leg_item = {};
              let odds = leg.drawOdds / 10000;              
              if (leg.market.includes('Home')) {
                odds = leg.homeOdds / 10000
              } else if (leg.market.includes('Away')) {
                odds = leg.awayOdds / 10000
              } 

              if (leg.market.includes('Money Line')) {
                leg_item.price = odds;
              } else if (leg.market.includes('Spreads')) {
                const betChoose = leg.market.replace('Spreads - ', '');
                leg_item.price = betChoose == 'Away' ? leg.spreadAwayOdds / 10000 : leg.spreadHomeOdds / 10000;
                leg_item.Spread = betChoose == 'Away' ? displayNum(leg.spreadAwayPoints, 10) : displayNum(leg.spreadHomePoints, 10);
              } else if (leg.market.includes('Totals')) {
                leg_item.price = leg.market.includes('Over') ? leg.totalOverOdds / 10000 : leg.totalUnderOdds / 10000
                leg_item.Total = (leg.totalPoints / 10).toFixed(1)
              };
              leg_item.eventId = leg.eventId;
              leg_item.homeTeam = leg.homeTeam;
              leg_item.awayTeam = leg.awayTeam;
              leg_item.league = leg.league;
              leg_item.market = leg.market;
              leg_item.outcome = leg.outcome;
              leg_item.betResult = leg.resultType;
              leg_item.eventResult = leg.eventResultType;
              legs.push(leg_item);
            }  
            tx.vout[i].legs = legs;          
          }          
        }
      }
    }
    res.json({ ...tx, vin });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXs = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await TX.find().sort({ blockHeight: -1 }).countDocuments();
    const txs = await TX.find().skip(skip).limit(limit).sort({ blockHeight: -1 });

    res.json({ txs, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return all the transactions for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXsWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getTXs = async () => {
    loading = true;

    try {
      const start = moment().utc().startOf('day').subtract(7, 'days')
        .toDate();
      const end = moment().utc().endOf('day').subtract(1, 'days')
        .toDate();
      const qry = [
        // Select last 7 days of txs.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Convert createdAt date field to date string.
        { $project: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
        // Group by date string and build total/sum.
        { $group: { _id: '$date', total: { $sum: 1 } } },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { _id: 1 } }
      ];

      cache = await TX.aggregate(qry);
      cutOff = moment().utc().add(90, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getTXs();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getTXs();
    }
  };
};

const getListEvents = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await ListEvent.find().sort({ starting: 1 }).countDocuments();
    const events = await ListEvent.find().skip(skip).limit(limit).sort({ starting: 1});

    res.json({ events, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetEvents = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    if (req.query.eventId) {
      const { eventId } = req.query;
      const total = await BetEvent.find({
        eventId,
        visibility: true,
      }).sort({ createdAt: -1 }).countDocuments();
      const events = await BetEvent.find({
        eventId,
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: -1 });
      res.json({
        events,
        pages: total <= limit ? 1 : Math.ceil(total / limit),
      });
    } else {
      const total = await BetEvent.find({
        visibility: true,
      }).sort({ createdAt: -1 }).countDocuments();
      const events = await BetEvent.find({
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: -1 });
      res.json({ events, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};
const getBetHotEvents = async (req, res) => {
  try {
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : 200;
    if (limit > 200) limit = 200;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    let timestamp = Date.now();
    
    let query = [];
    if (req.query.max_time){
      if (req.query.max_time < timestamp)  {
        res.json({events:[]});
      } else {
        if (req.query.min_time){
          if (req.query.min_time < timestamp){
            req.query.min_time = timestamp;
          }
          query = [
            {
              $addFields: {
                convertedTimestamp: {
                  $toDouble: "$timeStamp"
                }
              }
            }, 
            {
              $match:{
                convertedTimestamp: {
                  $lt: Number(req.query.max_time),
                  $gt: Number(req.query.min_time)
                }
              }
            }
          ]
        } else {
          query = [
            {
              $addFields: {
                convertedTimestamp: {
                  $toDouble: "$timeStamp"
                }
              }
            },
            {
              $match:{
                convertedTimestamp: {
                  $lt: Number(req.query.max_time),
                  $gt: timestamp
                }
              }
            }
          ]
        }
      }
    } else {
      query=[
        {
          $addFields: {
            convertedTimestamp: {
              $toLong: "$timeStamp"
            }
          }
        },
        {
          $match: {
            convertedTimestamp: {$gt: timestamp}
          }
        }
      ];
    }

    query.push({
      $match: {
        "visibility": true
      }
    });

    query.push({
      $match:{ 
        status: { $ne: 'completed' } 
      }      
    });

    let totalquery = query;
    totalquery = totalquery.concat([{
      $count: "totalcount"
    }]);    
    
    let total = await BetEvent.aggregate(totalquery);

    total = total.length > 0?total[0].totalcount : 0;



    query.push({
      $lookup: {
        from: 'betactions',
        localField: 'eventId',
        foreignField: 'eventId',
        as: 'actions',
      },
    });

    query.push({
      $addFields: {
        totalBetAmount: {
          $sum: "$actions.betValue"
        }
      }
    });

    query.push({
      $sort: {totalBetAmount: -1}        
    });
    
    query = query.concat([
      {
        $skip: skip,
      },{
        $limit: limit
      }
    ]);

    console.log(query);
    let events = await BetEvent.aggregate(query);
    let formattedEvents = []
    if (events.length > 0) {
      for (let i=0; i<events.length; i++){        
        const e = JSON.parse(JSON.stringify(events[i]));
        const event = {};
        event.eventId = e.eventId;
        event.timeStamp = e.timeStamp;
        event.league = e.league;
        event.homeTeam = e.homeTeam;
        event.awayTeam = e.awayTeam;
        event.homeOdds = e.transaction.homeOdds;
        event.awayOdds = e.transaction.awayOdds;
        event.drawOdds = e.transaction.drawOdds;
        event.sport = e.transaction.sport;
        const betupdates = await BetUpdate.find({
          eventId: e.eventId,
          visibility: true
        }).sort({createdAt: 1});
        if (betupdates.length > 0){
          const update = JSON.parse(JSON.stringify(betupdates[betupdates.length-1]));

          event.Latest_MoneyLine_Price = {
            home: update.opObject.homeOdds / 10000,
            draw: update.opObject.drawOdds / 10000,
            away: update.opObject.awayOdds / 10000,
          };
        } else {
          event.Latest_MoneyLine_Price = {
            home: event.homeOdds / 10000,
            draw: event.drawOdds / 10000,
            away: event.awayOdds / 10000,
          };
        }

        const betspreads = await Betspread.find({
          eventId: e.eventId,
          visibility: true
        }).sort({createdAt: 1});

        if (betspreads.length > 0){
          event.Latest_Spread_Number = `${displayNum(betspreads[betspreads.length-1].homePoints, 10)}/${displayNum(betspreads[betspreads.length-1].awayPoints, 10)}`;
          event.Latest_Spread_Price = {
            home: betspreads[betspreads.length-1].homeOdds / 10000,
            away: betspreads[betspreads.length-1].awayOdds / 10000,
          }
        }

        const bettotals = await Bettotal.find({
          eventId: e.eventId,
          visibility: true
        }).sort({createdAt: 1});

        if (bettotals.length > 0){
          event.Latest_Total_Number = bettotals[bettotals.length-1].points / 10;
          event.Latest_Total_Price = {
            over: bettotals[bettotals.length-1].overOdds / 10000,
            under: bettotals[bettotals.length-1].underOdds / 10000,
          }
        }

        formattedEvents.push(event);
      };
    } 
    res.json({ events: formattedEvents, pages: total <= limit ? 1 : Math.ceil(total / limit)});
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};
const getBetOpenEvents = async (req, res) => {
  try {
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : 200;
    if (limit > 200) limit = 200;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    let timestamp = Date.now();

    let query = [];
    if (req.query.max_time){
      if (req.query.max_time < timestamp)  {
        res.json({events:[]});
      } else {
        if (req.query.min_time){
          if (req.query.min_time < timestamp){
            req.query.min_time = timestamp;
          }
          query = [
            {
              $addFields: {
                convertedTimestamp: {
                  $toDouble: "$timeStamp"
                }
              }
            }, 
            {
              $match:{
                convertedTimestamp: {
                  $lt: Number(req.query.max_time),
                  $gt: Number(req.query.min_time)
                }
              }
            }
          ]
        } else {
          query = [
            {
              $addFields: {
                convertedTimestamp: {
                  $toDouble: "$timeStamp"
                }
              }
            },
            {
              $match:{
                convertedTimestamp: {
                  $lt: Number(req.query.max_time),
                  $gt: timestamp
                }
              }
            }
          ]
        }
      }
    } else {
      query=[
        {
          $addFields: {
            convertedTimestamp: {
              $toLong: "$timeStamp"
            }
          }
        },
        {
          $match: {
            convertedTimestamp: {$gt: timestamp}
          }
        }
      ];
    }
    
    query.push({
      $match: {
        "visibility": true
      }
    });

    query.push({
      $match:{ 
        status: { $ne: 'completed' } 
      }      
    });
    
    if (req.query.sport){
      query.push({
        $match: {
          "transaction.sport": req.query.sport
        }
      });
    }

    if (req.query.league){
      query.push({
        $match: {
          "league": req.query.league
        }
      });
    }

    let counterquery  = query;
    counterquery = counterquery.concat([{
        $group:{
          _id: {
            "sport": '$transaction.sport',
            "league": '$league'
          }, 
          'count':{$sum:1}     
        }
      }      
    ]);    

    let counterdata = await BetEvent.aggregate(counterquery);  
    let totalquery = query;
    
    totalquery = totalquery.concat([{
      $count: "totalcount"
    }]);    
    
    let total = await BetEvent.aggregate(totalquery);

    total = total.length > 0?total[0].totalcount : 0;
    
    query = query.concat([
      {
        $sort: {
          convertedTimestamp: 1,
        }
      },{
        $skip: skip,
      },{
        $limit: limit
      }
    ]);

    let events = await BetEvent.aggregate(query);
    events.sort(function(a,b){
      return Number(a.timeStamp) - Number(b.timeStamp);
    })

    const formattedEvents = [];
    const counters = {};

    if (counterdata.length > 0){
      for (let k=0; k < counterdata.length; k++){
        const item = counterdata[k]._id;        
        console.log(item);
        if (counters[item.sport] == undefined){                    
          counters[item.sport] = {};
        }
        
        if (counters[item.sport][item.league] == undefined){
          counters[item.sport][item.league] = counterdata[k].count;
        }        
      }
    }

    if (events.length > 0) {
      for (let i=0; i<events.length; i++){
        const e = events[i];
        const event = JSON.parse(JSON.stringify(e));

        event.homeOdds = event.transaction.homeOdds;
        event.awayOdds = event.transaction.awayOdds;
        event.drawOdds = event.transaction.drawOdds;

        const betupdates = await BetUpdate.find({
          eventId: event.eventId,
          visibility: true
        }).sort({createdAt: 1});
        if (betupdates.length > 0){
          const update = JSON.parse(JSON.stringify(betupdates[betupdates.length-1]));

          event.Latest_MoneyLine_Price = {
            home: update.opObject.homeOdds / 10000,
            draw: update.opObject.drawOdds / 10000,
            away: update.opObject.awayOdds / 10000,
          };
        } else {
          event.Latest_MoneyLine_Price = {
            home: event.homeOdds / 10000,
            draw: event.drawOdds / 10000,
            away: event.awayOdds / 10000,
          };
        }

        const betspreads = await Betspread.find({
          eventId: event.eventId,
          visibility: true
        }).sort({createdAt: 1});

        if (betspreads.length > 0){
          event.Latest_Spread_Number = `${displayNum(betspreads[betspreads.length-1].homePoints, 10)}/${displayNum(betspreads[betspreads.length-1].awayPoints, 10)}`;
          event.Latest_Spread_Price = {
            home: betspreads[betspreads.length-1].homeOdds / 10000,
            away: betspreads[betspreads.length-1].awayOdds / 10000,
          }
        }

        const bettotals = await Bettotal.find({
          eventId: event.eventId,
          visibility: true
        }).sort({createdAt: 1});

        if (bettotals.length > 0){
          event.Latest_Total_Number = bettotals[bettotals.length-1].points / 10;
          event.Latest_Total_Price = {
            over: bettotals[bettotals.length-1].overOdds / 10000,
            under: bettotals[bettotals.length-1].underOdds / 10000,
          }
        }

        formattedEvents.push(event);
      };
    }
    res.json({ events: formattedEvents, pages: total <= limit ? 1 : Math.ceil(total / limit), counters: counters});

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetActions = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    if (req.query.eventId) {
      const { eventId } = req.query;
      const total = await BetAction.find({
        eventId,
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const actions = await BetAction.find({
        eventId,
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ actions, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } else {
      const total = await BetAction.find({
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const actions = await BetAction.find({
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ actions, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetResults = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    if (req.query.eventId) {
      const { eventId } = req.query;
      const total = await BetResult.find({
        eventId,
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results = await BetResult.find({
        eventId,
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ results, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } else {
      const total = await BetResult.find({
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results = await BetResult.find({
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ results, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetspreads = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    if (req.query.eventId) {
      const { eventId } = req.query;
      const total = await Betspread.find({
        eventId: `${eventId}`,
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results = await Betspread.find({
        eventId: `${eventId}`,
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ results, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } else {
      const total = await Betspread.find({
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results = await Betspread.find({
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ results, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetTotals = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    if (req.query.eventId) {
      const { eventId } = req.query;
      const total = await Bettotal.find({
        eventId: `${eventId}`,
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results = await Bettotal.find({
        eventId: `${eventId}`,
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ results, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } else {
      const total = await Bettotal.find({
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results = await Bettotal.find({
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({ results, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetUpdates = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    if (req.query.eventId) {
      const { eventId } = req.query;
      const total_update = await BetUpdate.find({
        eventId: `${eventId}`,
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results_update = await BetUpdate.find({
        eventId: `${eventId}`,
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });

      const betupdates = { results:results_update, pages: total_update <= limit ? 1 : Math.ceil(total_update / limit) };

      // const total_total = await Bettotal.find({
      //   eventId: `${eventId}`,
      //   visibility: true,
      // }).sort({ createdAt: 1 }).countDocuments();
      // const results_total = await Bettotal.find({
      //   eventId: `${eventId}`,
      //   visibility: true,
      // }).skip(skip).limit(limit).sort({ createdAt: 1 });

      // const bettotals = { results: results_total, pages: total_total <= limit ? 1 : Math.ceil(total_total / limit) };

      // const total_spread = await Betspread.find({
      //   eventId: `${eventId}`,
      //   visibility: true,
      // }).sort({ createdAt: 1 }).countDocuments();
      // const results_spread = await Betspread.find({
      //   eventId: `${eventId}`,
      //   visibility: true,
      // }).skip(skip).limit(limit).sort({ createdAt: 1 });

      // const betspreads = { results: results_spread, pages: total_spread <= limit ? 1 : Math.ceil(total_spread / limit) };
      res.json(betupdates);
    } else {
      const total_update = await BetUpdate.find({
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results_update = await BetUpdate.find({
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });

      // const total_total = await Bettotal.find({
      //   visibility: true,
      // }).sort({ createdAt: 1 }).countDocuments();
      // const results_total = await Bettotal.find({
      //   visibility: true,
      // }).skip(skip).limit(limit).sort({ createdAt: 1 });

      // const total_spread = await Betspread.find({
      //   visibility: true,
      // }).sort({ createdAt: 1 }).countDocuments();
      // const results_spread = await Betspread.find({
      //   visibility: true,
      // }).skip(skip).limit(limit).sort({ createdAt: 1 });


      //const bettotals = { results: results_total, pages: total_total <= limit ? 1 : Math.ceil(total_total / limit) };
      const betupdates = { results:results_update, pages: total_update <= limit ? 1 : Math.ceil(total_update / limit) };
      //const betspreads = { results: results_spread, pages: total_spread <= limit ? 1 : Math.ceil(total_spread / limit) };

      res.json(betupdates);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getData = async (Model, req, res, visibility = true) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

    if (req.query.eventId) {
      const { eventId } = req.query;

      const queryParam = {
        eventId: `${eventId}`,
      };

      if (visibility) {
        queryParam.visibility =  true;
      }

      const total = await Model
        .find(queryParam)
        .sort({ createdAt: 1 })
        .countDocuments();

      const results = await Model
      .find(queryParam)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 });

      res.json({ results, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } else {
      const total = await Model.find({
        visibility: true,
      }).sort({ createdAt: 1 }).countDocuments();
      const results = await Model.find({
        visibility: true,
      }).skip(skip).limit(limit).sort({ createdAt: 1 });
      res.json({
        data: results,
        actions: results,
        results,
        pages: total <= limit ? 1 : Math.ceil(total / limit),
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetParlayBetsInfo = async (req, res) => {
  req.clearTimeout();
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
  const opened_or_completed = req.query.opened_or_completed == 'true' ? false: true;
  const { query } = req;
  const { search } = query;

  const totalMatches = {
    $and: [],
  };

  if (search) {
    totalMatches.$and.push({ txId: search });
  }
  
  let sort = {
    createdAt: -1,
  }

  totalMatches.$and.push({'completed': opened_or_completed});  
  try {
    const totalParams = [
      {
        $match: totalMatches,
      },
      {
        $count: 'count',
      },
    ];

    const total = await BetParlay.aggregate(totalParams);

    const resultParams = [      
      {
        $match: totalMatches,
      },
      {
        $sort: sort
      },
      {
        $skip: skip,
      }, {
        $limit: limit,
      }
    ];
    console.log('totalMatches',totalMatches);
    console.log("resultParams", resultParams);
    let result = await BetParlay.aggregate(resultParams);
    let pages = total.length > 0 ? (total[0].count <= limit ? 1 : Math.ceil(total[0].count / limit)): 0;

    return res.json({
      data: result,
      pages: pages,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message || err);
  }
};

// Modified this a bit - kyle h
const getDataListing = async (Model, actions, results, req, res) => {
  req.clearTimeout();
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
  const opened_or_completed = req.query.opened_or_completed;
  const { query } = req;
  const { search } = query;
  const { sport } = query;

  const orParams = [];

  if (isNaN(search)) {
    orParams.push({ txId: search },);
    orParams.push({ homeTeam: { $regex: `.*${search}.*`, $options: 'i' } });
    orParams.push({ awayTeam: { $regex: `.*${search}.*`, $options: 'i' } });
    orParams.push({ tournament: { $regex: `.*${search}.*`, $options: 'i' } });
    orParams.push({ 'transaction.tournament': { $regex: `.*${search}.*`, $options: 'i' } });
  } else {
    orParams.push({ blockHeight: search });
    orParams.push({ eventId: search });
  }

  const totalMatches = {
    $and: [],
  };

  if (sport) {
    totalMatches.$and.push({ 'transaction.sport': { $regex: `.*${sport || search}.*`, $options: 'i' }});    
  }

  if (search) {
    totalMatches.$and.push({ $or: orParams });
  }

  let match =  {$ne: 'completed'};
  let sort = {
    timeStamp: 1,
  }

  if (opened_or_completed == 'false'){
    match =  'completed';

    sort = {
      timeStamp: -1,
    }
  }

  totalMatches.$and.push({'status': match})

  console.log('match', match, sort);
  try {
    const totalParams = [
      {
        $match: totalMatches,
      },
      {
        $group: {
          _id: '$eventId',
        },
      }, {
        $count: 'count',
      },
    ];
    const total = await Model.aggregate(totalParams);

    const resultParams = [      
      {
        $match: totalMatches,
      },
      {
        $addFields: { convertedTimestamp: { $toLong: "$timeStamp" } }
      },
      {
        $addFields: { convertedTimestamp: { $toLong: "$timeStamp" } }
      }, 
      {
        $group: {
          _id: '$eventId',
          events: {
            $push: '$$ROOT',
          },
        },
      },     
      {
        $project: {
          _id: '$_id',
          events: '$events',
          timeStamp: { $max: '$events.convertedTimestamp'},
          completedAt: { $max: '$events.completedAt'},
        },
      },
      {
        $sort: sort
      },
      {
        $skip: skip,
      }, {
        $limit: limit,
      },
      {
        $lookup: {
          from: actions,
          localField: '_id',
          foreignField: 'eventId',
          as: 'actions',
        },
      },
      {
        $lookup: {
          from: results,
          localField: '_id',
          foreignField: 'eventId',
          as: 'results',
        },
      }
    ];

    let result = await Model.aggregate(resultParams);
    let pages = total.length > 0 ? (total[0].count <= limit ? 1 : Math.ceil(total[0].count / limit)): 0;
    //console.log('result', result);
    return res.json({
      data: result,
      pages: pages,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message || err);
  }
};

const getAltDataListing = async (Model, actions, results, req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
  try {
    const total = await Model.aggregate([
      {
        $group: {
          _id: '$eventId',
        },
      }, {
        $count: 'count',
      },
    ]);
    const result = await Model.aggregate([
      {
        $group: {
          _id: '$eventId',
          events: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          events: '$events',
          createdAt: { $arrayElemAt: ['$events.createdAt', 0] },
        },
      },
      {
        $sort: {
          createdAt: -1,
          _id: -1,
        },
      }, {
        $skip: skip,
      }, {
        $limit: limit,
      }, {
        $lookup: {
          from: actions,
          localField: '_id',
          foreignField: 'eventId',
          as: 'actions',
        },
      }, {
        $lookup: {
          from: results,
          localField: '_id',
          foreignField: 'eventId',
          as: 'results',
        },
      },
    ]);
    return res.json({
      data: result,
      pages: total[0].count <= limit ? 1 : Math.ceil(total[0].count / limit),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message || err);
  }
};

const getLottoEvents = async (req, res) => getAltDataListing(LottoEvent, 'lottobets', 'lottoresults', req, res);
// const getLottoEvents = async (req, res) =>  getData(LottoEvent, req, res);
const getLottoBets = async (req, res) => getData(LottoBet, req, res, false);
const getLottoResults = async (req, res) => getData(LottoResult, req, res);

const getBetActioinsWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getBetActioinsWeek = async () => {
    loading = true;

    try {
      const start = moment()
        .utc()
        .startOf('day')
        .subtract(7, 'days')
        .toDate();
      const end = moment()
        .utc()
        .endOf('day')
        .subtract(1, 'days')
        .toDate();
      const qry = [
        // Select last 7 days of bets.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Convert createdAt date field to date string.
        { $project: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
        // Group by date string and build total/sum.
        { $group: { _id: '$date', total: { $sum: 1 } } },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { _id: 1 } },
      ];

      cache = await BetAction.aggregate(qry);
      cutOff = moment().utc().add(90, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getBetActioinsWeek();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getBetActioinsWeek();
    }
  };
};

const getBetEventInfo = async (req, res) => {
  const { eventId } = req.params;  
  let results;
  try {
    results = await BetResult.find({
      eventId,
      visibility: true,
    }).sort({ createdAt: 1 });
  } catch (e) {
    console.log('Bet Event Not Published');
  }
  try {
    const events = await BetEvent.find({
      eventId,
      visibility: true,
    }).sort({ createdAt: -1 });
    const homeTeamNames = [];
    const awayTeamNames = [];
    events.forEach((event) => {
      if (homeTeamNames.indexOf(event.homeTeam) === -1) {
        homeTeamNames.push(event.homeTeam);
      }
      if (awayTeamNames.indexOf(event.awayTeam) === -1) {
        awayTeamNames.push(event.awayTeam);
      }
    });

    // We add how home teams are represented in bets with new opCodes
    homeTeamNames.push('Money Line - Home Win');
    //homeTeamNames.push('Spreads - Home');
    // We add how home teams are represented in bets with new opCodes
    awayTeamNames.push('Money Line - Away Win');
    //awayTeamNames.push('Spreads - Away');
    // We create the array that contains draw values
    const drawResults = ['DRW', 'Money Line - Draw'];

    const homeBets = await BetAction.find({
      eventId,
      visibility: true,
      betChoose: { $in: homeTeamNames },
    });

    const awayBets = await BetAction.find({
      eventId,
      visibility: true,
      betChoose: { $in: awayTeamNames },
    });
    const drawBets = await BetAction.find({
      eventId,
      visibility: true,
      betChoose: { $in: drawResults },
    });
    const spreadHomeBets = await BetAction.find({
      eventId,
      visibility: true,
      betChoose: "Spreads - Home",
    });
    const spreadAwayBets = await BetAction.find({
      eventId,
      visibility: true,
      betChoose: "Spreads - Away",
    });

    const overBets = await BetAction.find({
      eventId,
      visibility: true,
      betChoose: "Totals - Over",
    });

    const underBets = await BetAction.find({
      eventId,
      visibility: true,
      betChoose: "Totals - Under",
    });

    let H2HEvents = [];
    let BetTotals = [];
    let BetSpreads = [];
    if (events.length > 0) {
      H2HEvents_Home = await BetEvent.find({
        homeTeam:events[0].homeTeam,
        awayTeam:events[0].awayTeam,
        visibility: true,
        createdAt: {$lt: events[0].createdAt}
      }).sort({ createdAt: -1 });

      H2HEvents_Away = await BetEvent.find({
        homeTeam:events[0].awayTeam,
        awayTeam:events[0].homeTeam,
        visibility: true,
        createdAt: {$lt: events[0].createdAt}
      }).sort({ createdAt: -1 });

      H2HEvents_Home = H2HEvents_Home.concat(H2HEvents_Away);
      H2HEvents_Home.sort(function(a,b){return b.createdAt - a.createdAt});
      //H2HEvents =tx.toObject();
      for (i=0; i<H2HEvents_Home.length; i++){
        if (typeof H2HEvents_Home[i] !== "undefined"){
          const h2hevent_results = await BetResult.find({
            eventId: H2HEvents_Home[i].eventId,
            visibility: true,
          }).sort({ createdAt: 1 });
          console.log(H2HEvents_Home[i]);
          event_item = H2HEvents_Home[i].toObject();
          event_item.results = h2hevent_results;
          H2HEvents.push(event_item);
        }
      }


      const results_total = await Bettotal.find({
        eventId: `${eventId}`,
        visibility: true,
      }).sort({ createdAt: 1 });

      for (i=0; i<results_total.length; i++){
        total_item = results_total[i].toObject();
        BetTotals.push(total_item);
      }

      const results_spread = await Betspread.find({
        eventId: `${eventId}`,
        visibility: true,
      }).sort({ createdAt: 1 });

      for (i=0; i<results_spread.length; i++){
        spread_item = results_spread[i].toObject();
        BetSpreads.push(spread_item);
      }
    }

    // These will return only one event with the latest updated odds
    // (with possibility of duplicates), but contains the original odds the event was created with.
    // We update them to these original
    // values for the frontend
    const formattedEvents = [];

    if (events.length > 0) {
      await events.forEach((e) => {
        const event = JSON.parse(JSON.stringify(e));

        event.homeOdds = event.transaction.homeOdds;
        event.awayOdds = event.transaction.awayOdds;
        event.drawOdds = event.transaction.drawOdds;

        formattedEvents.push(event);
      });
      // We also query event updates
      const updates = await BetUpdate.find({
        eventId: `${eventId}`,
        blockHeight: {$gt: events[0].blockHeight},
        visibility: true,
      }).sort({ createdAt: 1 });

      await updates.forEach((u) => {
        const update = JSON.parse(JSON.stringify(u));

        update.homeOdds = update.opObject.homeOdds;
        update.awayOdds = update.opObject.awayOdds;
        update.drawOdds = update.opObject.drawOdds;

        formattedEvents.push(update);

        /* if (
          update.homeOdds > 0
          && update.awayOdds > 0
          && update.drawOdds > 0
        ) {
          formattedEvents.push(update);
        } */
      });
    }
    console.log('getBetEventInfo', eventId, events[0].eventId);
    res.json({
      events: formattedEvents,
      homeBets,
      awayBets,
      drawBets,
      spreadHomeBets,
      spreadAwayBets,
      overBets,
      underBets,
      results,
      BetTotals,
      BetSpreads,
      H2HEvents,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getLottoEventInfo = async (req, res) => {
  const { eventId } = req.params;
  let results;
  try {
    results = await LottoResult.find({
      eventId,
      visibility: true,
    }).sort({createdAt: 1})
  } catch (e) {
    console.log(e);
    console.log('Lot Event Not Published');
  }

  try {
    const events = await LottoEvent.find({
      eventId,
      visibility: true,
    }).sort({ createdAt: 1 });

    const bets = await LottoBet.find({ eventId, visibility: true });

    // These will return only one event with the latest updated odds
    // (with possibility of duplicates), but contains the original odds the event was created with.
    // We update them to these original values for the frontend

    res.json({ events, bets, results });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetEventsInfo = async (req, res) => getDataListing(BetEvent, 'betactions', 'betresults', req, res);


const getBetQuery2 = async (req, res) => {
  try {
    const { query } = req;
    const { search } = query;

    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0

    if (!query) {
      return res.status(500).json({ error: true, message: 'No search specified' });
    }

    const params = [];

    if (isNaN(search)) {
      params.push({ txId: search },);
      params.push({ homeTeam: { $regex: `.*${search}.*` } });
      params.push({ awayTeam: { $regex: `.*${search}.*` } });
      params.push({ tournament: { $regex: `.*${search}.*` } });
      params.push({ 'transaction.sport': { $regex: `.*${search}.*` } });
      params.push({ 'transaction.tournament': search });
      params.push({ 'transaction.tournament': { $regex: `.*${search}.*` } });
    } else {
      params.push({ blockHeight: search });
      params.push({ eventId: search });
    }

    const total = await BetEvent.find({
      $or: params,
    }).sort({createdAt: 1}).countDocuments()

    const results = await BetEvent.find({
      $or: params,
    }).skip(skip).limit(limit).sort({createdAt: 1});


    return res.json({ results, count: results.length, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch (err) {
    console.log(err)
    return res.status(500).send(err.message || err)
  }
};

// Modified this a bit - kyle h
const getDataQuery = async (Model, actions, results, req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
  const { query } = req;
  const { search } = query;
  const { sport } = query;

  const orParams = [];

  if (isNaN(search)) {
    orParams.push({ txId: search },);
    orParams.push({ homeTeam: { $regex: `.*${search}.*`, $options: 'i' } });
    orParams.push({ awayTeam: { $regex: `.*${search}.*`, $options: 'i' } });
    orParams.push({ tournament: { $regex: `.*${search}.*`, $options: 'i' } });
    orParams.push({ 'transaction.tournament': { $regex: `.*${search}.*`, $options: 'i' } });
  } else {
    orParams.push({ blockHeight: search });
    orParams.push({ eventId: search });
  }

  const totalMatches = {
    $and: [],
  };

  const resultMatches = {
    $and: [],
  };

  if (sport) {
    totalMatches.$and.push({ 'transaction.sport': { $regex: `.*${sport || search}.*`, $options: 'i' }});
    resultMatches.$and.push({ 'transaction.sport': { $regex: `.*${sport || search}.*`, $options: 'i' }});
  }

  if (search) {
    totalMatches.$and.push({ $or: orParams });
    resultMatches.$and.push({ $or: orParams })
  }


  try {
    const totalParams = [
      {
        $match: totalMatches,
      },
      {
        $group: {
          _id: '$eventId',
        },
      }, {
        $count: 'count',
      },
    ];

    const resultParams = [
      {
        $match: resultMatches,
      },
      {
        $group: {
          _id: '$eventId',
          events: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          events: '$events',
          timeStamp: { $arrayElemAt: ['$events.timeStamp', 0] },
        },
      },
      {
        $sort: {
          timeStamp: -1,
          _id: -1,
        },
      }, {
        $skip: skip,
      }, {
        $limit: limit,
      }, {
        $lookup: {
          from: actions,
          localField: '_id',
          foreignField: 'eventId',
          as: 'actions',
        },
      }, {
        $lookup: {
          from: results,
          localField: '_id',
          foreignField: 'eventId',
          as: 'results',
        },
      },
    ];

    const total = await Model.aggregate(totalParams);
    const result = await Model.aggregate(resultParams);


    const pages = total && total[0] ? (total[0].count <= limit ? 1 : Math.ceil(total[0].count / limit)) : 1;

    res.json({
      data: result,
      pages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetQuery = (req, res) => getDataQuery(BetEvent, 'betactions', 'betresults', req, res);

const getCurrentProposals = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await Proposal.find().sort({ createdAt: -1 }).countDocuments();
    const pps = await Proposal.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const block = await Block.findOne().sort({ height: -1 });
    const coin = await Coin.findOne().sort({ createdAt: -1 });
    const allocatedPps = _.filter(pps, (o) => o.alloted);
    let totalAllocated = 0;
    if (allocatedPps.length > 0) {
      totalAllocated = allocatedPps[0].totalBudgetAlloted;
    }
    console.log(coin);
    const { nextSuperBlock } = coin;
    const totalBudget = ((getSubsidy(block.height) / 100) * 10) * 1440 * 30;
    res.json({
      pps,
      currentBlock: block.height,
      nextSuperBlock,
      totalBudget,
      totalAllocated,
      pages: total <= limit ? 1 : Math.ceil(total / limit)
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBettotalUSD = async (req, res) => {
  req.clearTimeout();
  const qry = [
    {
      $group: {
        _id: null,
        total: {
            $sum: "$betValueUSD"
        }
      }
    }
  ];

  const result = await BetAction.aggregate(qry).allowDiskUse(true);
  console.log('result', result);
  const total = result[0].total + 8482657;
  return res.json({totalUSD:total});
}

const getBetStats = async (req, res) => {
  req.clearTimeout();
  let start_time = req.query.start_time ? req.query.start_time : null;
  let end_time = req.query.end_time ? req.query.end_time : null;
  const duration = req.query.duration ? req.query.duration : null;
  const games = req.query.games ? parseInt(req.query.games, 10) : 0;
  const team1 = req.query.team1? req.query.team1: '';
  const team2 = req.query.team2? req.query.team2: '';
  const sport = req.query.sport? req.query.sport: '';
  const league = req.query.league? req.query.league: '';

  if (start_time && end_time){
    console.log(start_time, end_time);
  } else if (duration) {
    if (duration > 14)  duration = 14;
    start_time = moment().utc().subtract(duration*24, 'hour').unix();
    end_time = moment().unix();
  }

  try {
    if (start_time && end_time){
      // let cutOff = moment().utc().subtract(duration*24, 'hour').unix();
      // console.log('cutOff', cutOff);
      // console.log(team1, team2);
      let qry = [
        {
          $match: {
            $and: [
              {createdAt: {$gte: new Date(start_time * 1000)}},
              {createdAt: {$lte: new Date(end_time * 1000)}}
            ]
          }
        },
        {
          $sort: {
            createdAt: -1,
          }
        },{
          $lookup: {
            from: 'betevents',
            localField: 'eventId',
            foreignField: 'eventId',
            as: 'events',
          },
        }
      ];
      if (league != ''){
        qry.push({
          $match: {
            "events.league": league
          }
        });
      }
      if (sport != ''){
        qry.push({
          $match: {
            "events.transaction.sport": sport
          }
        });
      }
      if (team1 != '' && team2 != ''){
        qry.push({
          $match: {
            $or: [
              { $and: [ { "events.homeTeam": team1 }, { "events.awayTeam": team2 } ] },
              { $and: [ { "events.homeTeam": team2 }, { "events.awayTeam": team1 } ] },
            ]
          }
        });
      } else if (team1 != '') {
        qry.push({
          $match: {
            $or: [
              { "events.homeTeam": team1 }, { "events.awayTeam": team1 }
            ]
          }
        });
      }

      const results = await BetAction.aggregate(qry).allowDiskUse(true);

      let volume = {
        total: {
          totalBetWagerr: 0,
          totalBetUSD: 0
        }
      };
      let events = {
        total: 0
      };
      let bets = {
        total: 0
      };
      let backup_events = [];
      let undefined_count = 0;

      console.log(start_time, end_time, results.length);
      let i=0;

      for (i=0; i<results.length; i++){
        const action = results[i];
        const event = action.events[0];
        if (typeof event === "undefined"){
          undefined_count++;
          console.log('undefined event', action,  undefined_count);
          continue;
        }

        if (typeof volume[event.transaction.sport] == "undefined"){
          volume[event.transaction.sport] = {}
          volume[event.transaction.sport].totalBetWagerr = 0;
          volume[event.transaction.sport].totalBetUSD = 0;
        }

        if (typeof events[event.transaction.sport] == "undefined"){
          events[event.transaction.sport] = 0
        }

        if (typeof bets[event.transaction.sport] == "undefined"){
          bets[event.transaction.sport] = 0
        }

        if (!backup_events.includes(event.eventId)){
          backup_events.push(event.eventId);
          events.total++;
          events[event.transaction.sport]++;
        }

        bets.total++;
        bets[event.transaction.sport]++;

        volume.total.totalBetWagerr = volume.total.totalBetWagerr + action.betValue;
        volume[event.transaction.sport].totalBetWagerr = volume[event.transaction.sport].totalBetWagerr + action.betValue;
        volume.total.totalBetUSD = volume.total.totalBetUSD + action.betValueUSD;
        volume[event.transaction.sport].totalBetUSD = volume[event.transaction.sport].totalBetUSD + action.betValueUSD;
        // const prices = await Price.aggregate([
        //   {$project: {diff: {$abs: {$subtract: [action.createdAt, '$createdAt']}}, doc: '$$ROOT'}},
        //   {$sort: {diff: 1}},
        //   {$limit: 1}
        // ]);

        // if (prices.length > 0){
        //   volume.total.totalBetUSD = volume.total.totalBetUSD + prices[0].doc.usd * action.betValue;
        //   volume[event.transaction.sport].totalBetUSD = volume[event.transaction.sport].totalBetUSD + prices[0].doc.usd * action.betValue;
        // }
      }
      return res.json({stats: {volume: volume, events:events, bets: bets}, start_time: start_time,  end_time:end_time});
    } else if (games > 0) {
      qry = [{
        $match: {
          status: "completed"
        }
      }
      ];

      if (team1 != '' && team2 != ''){
        qry.push({
          $match: {
            $or: [
              { $and: [ { "homeTeam": team1 }, { "awayTeam": team2 } ] },
              { $and: [ { "homeTeam": team2 }, { "awayTeam": team1 } ] },
            ]
          }
        });
      } else if (team1 != '') {
        qry.push({
          $match: {
            $or: [
              { "homeTeam": team1 }, { "awayTeam": team1 }
            ]
          }
        });
      }

      if (sport != ''){
        qry.push({
          $match: {
            "transaction.sport": sport
          }
        });
      }

      if (league != ''){
        qry.push({
          $match: {
            "league": league
          }
        });
      }

      qry = qry.concat([
        {
          $sort: {
            completedAt: -1,
          }
        },{
          $limit: games
        }, {
          $lookup: {
            from: 'betactions',
            localField: 'eventId',
            foreignField: 'eventId',
            as: 'actions',
          }
        }
      ]);

      const results = await BetEvent.aggregate(qry).allowDiskUse(true);
      console.log('qry', qry);
      let totalBetWagerr = 0;
      let totalBetUSD = 0;
      for (i = 0; i < results.length; i++){
        const item = results[i];
        for (j = 0; j< item.actions.length; j++){
          const action = item.actions[j];
          totalBetWagerr = totalBetWagerr + action.betValue;
          totalBetUSD = totalBetUSD + action.betValueUSD;
          // const prices = await Price.aggregate([
          //   {$project: {diff: {$abs: {$subtract: [action.createdAt, '$createdAt']}}, doc: '$$ROOT'}},
          //   {$sort: {diff: 1}},
          //   {$limit: 1}
          // ]);

          // if (prices.length > 0){
          //   totalBetUSD = totalBetUSD + prices[0].doc.usd * action.betValue;
          // }
        }
      }
      return res.json({totalBetWagerr: totalBetWagerr, totalBetUSD: totalBetUSD});
    } else {
      data = [];
      return res.json(data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
}


const getBetInfoByPayout = async (req, res) => {
  const payoutTx = req.query.payoutTx ? req.query.payoutTx:null;
  const nOut = req.query.nOut ? req.query.nOut:null;
  if (!payoutTx || !nOut){
    res.status(500).send("Param is missed");
  }

  try {
    const params = [
      {txHash: payoutTx, nOut: parseInt(nOut)}
    ];
    const info = await rpc.call('getpayoutinfo', [params]);
    if (info && info.length > 0 && info[0].found){
      const payoutInfo = info[0].payoutInfo;
      const betinfo = await rpc.call('getbetbytxid', [payoutInfo.betTxHash]);
      if (betinfo && betinfo.length > 0){
        res.json(betinfo[0]);
        return;
      }
        
      // const betaction = await BetAction.findOne({txId: payoutInfo.betTxHash});
      // if (betaction){
      //   res.json(betaction);
      //   return;
      // }

      // const betparlay = await BetParlay.findOne({txId: payoutInfo.betTxHash});
      // if (betparlay){
      //   res.json(betparlay);
      //   return;
      // }
    }    
    res.json([]);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }

}

const getTeamEventInfo = async (req, res) => {
  const team = req.query.team ? req.query.team:null;
  const limit = req.query.limit? (req.query.limit > 200? 200: parseInt(req.query.limit)) : 200;
  const skip = req.query.skip? parseInt(req.query.skip):0;
  const sport = req.query.sport? req.query.sport:null;
  console.log('limit', limit);
  if (!team){
    res.status(500).send("team field is missed");
  }

  let qry = [
    {
      $match: {
        $or: [
          { "homeTeam": team}, { "awayTeam": team},
        ]
      }
    }
  ];

  if (sport){
    qry.push({
      $match: {
        "transaction.sport": sport
      }
    });
  }

  let totalParams = qry.concat([    
    {
      $group: {
        _id: '$eventId',
      },
    }, {
      $count: 'count',
    },
  ]);

  const total = await BetEvent.aggregate(totalParams);
  const pages = total && total[0] ? (total[0].count <= limit ? 1 : Math.ceil(total[0].count / limit)) : 1;

  qry = qry.concat([{
    $addFields: { convertedTimestamp: { $toLong: "$timeStamp" } }
  },{
    $sort: {
      convertedTimestamp: -1,
    }
  },{
    $skip: skip,
  },{
    $limit: limit
  }]);

  const events = await BetEvent.aggregate(qry).allowDiskUse(true);
  let formattedEvents = [];
  if (events.length > 0) {
    for (let i=0; i<events.length; i++){
      let e = events[i];
      e = JSON.parse(JSON.stringify(e));
      let event = {}
      event.status = e.status == "completed" ? e.status : "open"
      event.timeStamp = e.timeStamp;
      event.eventId = e.eventId;
      event.homeTeam = e.homeTeam;
      event.league = e.league;
      event.awayTeam = e.awayTeam;
      const betupdates = await BetUpdate.find({
        eventId: event.eventId,
        visibility: true
      }).sort({createdAt: 1});
      if (betupdates.length > 0){
        const update = JSON.parse(JSON.stringify(betupdates[betupdates.length-1]));
        event.moneyline = {
          home: update.opObject.homeOdds / 10000,
          draw: update.opObject.drawOdds / 10000,
          away: update.opObject.awayOdds / 10000,
        };
      } else {
        event.moneyline = {
          home: e.transaction.homeOdds / 10000,
          draw: e.transaction.drawOdds / 10000,
          away: e.transaction.awayOdds / 10000,
        };
      }

      const betspreads = await Betspread.find({
        eventId: e.eventId,
        visibility: true
      }).sort({createdAt: 1});

      if (betspreads.length > 0){
        event.spread = {
          homePoints: `${displayNum(betspreads[betspreads.length-1].homePoints, 10)}`,
          awayPoints: `${displayNum(betspreads[betspreads.length-1].awayPoints, 10)}`,
          home: betspreads[betspreads.length-1].homeOdds / 10000,
          away: betspreads[betspreads.length-1].awayOdds / 10000,
        }
      }

      const bettotals = await Bettotal.find({
        eventId: e.eventId,
        visibility: true
      }).sort({createdAt: 1});

      if (bettotals.length > 0){
        event.totals = {
          totalsLine: bettotals[bettotals.length-1].points / 10,
          overOdds: bettotals[bettotals.length-1].overOdds / 10000,
          underOdds: bettotals[bettotals.length-1].underOdds / 10000,
        }
      }

      const betresults = await BetResult.find({
        eventId: e.eventId,
        visibility: true
      }).sort({createdAt: 1});

      if (betresults.length > 0){
        const result = JSON.parse(JSON.stringify(betresults[betresults.length-1]))
        event.result = {
          homePoints: result.transaction.homeScore/10,
          awayPoints: result.transaction.awayScore/10
        }
      }
      formattedEvents.push(event);
    };
  }

  return res.json({matches: formattedEvents, pages: pages});
}

const getStatisticPerWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getStatistic = async () => {
    loading = true;

    try {
      const start = moment()
        .utc()
        .startOf('week')
        .subtract(7, 'weeks')
        .toDate();
      const end = moment()
        .utc()
        .endOf('week')
        .toDate();
      const qry = [
        // Select last 7 weeks of bets.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Convert createdAt date field to date string.
        {
          $project: {
            week: {
              $dateToString: {
                format: '%Y-%U',
                date: '$createdAt',
              },
            },
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            totalBet: '$totalBet',
            totalMint: '$totalMint',
          },
        },
        // Group by date string and build total/sum.
        {
          $group: {
            _id: '$week',
            date: { $first: '$date' },
            totalBet: { $first: '$totalBet' },
            totalMint: { $first: '$totalMint' },
          },
        },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { _id: 1 } },
      ];

      cache = await Statistic.aggregate(qry);
      cutOff = moment()
        .utc()
        .add(90, 'seconds')
        .unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getStatistic();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getStatistic();
    }
  };
};

module.exports = {
  getAddress,
  getAvgBlockTime,
  getAvgMNTime,
  getBlock,
  getCoin,
  getCoinHistory,
  getCoinsWeek,
  getIsBlock,
  getMasternodes,
  getMasternodeByAddress,
  getMasternodeCount,
  getPeer,
  getSupply,
  getTop100,
  getTXLatest,
  getTX,
  getTXs,
  getTXsWeek,
  getListEvents,
  getBetEvents,
  getBetOpenEvents,
  getBetQuery,
  getBetActions,
  getBetResults,
  getBetActioinsWeek,
  getBetEventInfo,
  getBetEventsInfo,
  getBetParlayBetsInfo,
  getCurrentProposals,
  getStatisticPerWeek,
  getBetspreads,
  getBetTotals,
  getBetUpdates,
  getLottoEvents,
  getLottoBets,
  getLottoResults,
  getLottoEventInfo,
  getBetStats,
  getTeamEventInfo,
  getBettotalUSD,
  getBetHotEvents,
  getBetInfoByPayout
};
