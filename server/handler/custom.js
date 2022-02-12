const _ = require("lodash");
const Coin = require("../../model/coin");
const BetAction = require("../../model/betaction");
const BetParlay = require("../../model/betparlay");
const config = require("../../config");
const TX = require("../../model/tx");
const BLOCK = require("../../model/block");
const { BigNumber } = require("bignumber.js");
const UTXO = require("../../model/utxo");
const { rpc } = require("../../lib/cron");
const Price = require("../../model/price");
const Statistic = require("../../model/statistic");
const Mapping = require("../../model/mappingname");
const getBetStatus = async (req, res) => {
  try {
    const txs = await TX.aggregate([
      {
        $match: {
          $or: [
            { "vout.address": { $in: config.coin.oracle_payout_address } },
            { "vin.address": { $in: config.coin.oracle_payout_address } },
          ],
        },
      },
      { $sort: { blockHeight: -1 } },
    ])
      .allowDiskUse(true)
      .exec();

    const staked = txs
      .filter((tx) => tx.vout[0].address === "NON_STANDARD")
      .reduce(
        (acc, tx) =>
          acc
            .minus(
              tx.vin.reduce((a, t) => {
                if (config.coin.oracle_payout_address.includes(t.address)) {
                  return a.plus(BigNumber(t.value));
                } else {
                  return a;
                }
              }, BigNumber(0.0))
            )
            .plus(
              tx.vout.reduce((a, t) => {
                if (config.coin.oracle_payout_address.includes(t.address)) {
                  return a.plus(BigNumber(t.value));
                } else {
                  return a;
                }
              }, BigNumber(0.0))
            ),
        BigNumber(0.0)
      );
    const coinInfo = await Coin.findOne().sort({ createdAt: -1 });
    res.json({ totalBet: coinInfo.totalBet, totalOracleProfit: staked });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getCustomSupply = async (req, res) => {
  try {
    const info = await rpc.call("getinfo");
    res.json(info.moneysupply);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getTotalPayout = async (req, res) => {
  try {
    const statistic = await Statistic.findOne().sort({ createdAt: -1 });
    res.json({
      totalpayout: {
        wgr: statistic.totalPayout + 102107516.1294,
        usd: statistic.totalPayoutUSD + 102107516.1294 * 0.1,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getAddressesInfo = async (req, res) => {
  req.clearTimeout();
  try {
    const hashlist = req.params.hashlist.split(",");
    //console.log('getAddressesInfo hashlist', hashlist);
    let results = {};

    const txs = await TX.aggregate([
      {
        $match: {
          $or: [
            { "vout.address": { $in: hashlist } },
            { "vin.address": { $in: hashlist } },
          ],
        },
      },
      { $sort: { blockHeight: -1 } },
    ])
      .allowDiskUse(true)
      .exec();

    for (const hash of hashlist) {
      if (typeof results[hash] === "undefined") {
        results[hash] = {
          sent: BigNumber(0.0),
          received: BigNumber(0.0),
          staked: BigNumber(0.0),
          balance: BigNumber(0.0),
          tx_counts: 0,
        };
      }
    }

    txs.map((tx) => {
      let is_tx = {};

      if (tx.vout[0].address !== "NON_STANDARD") {
        for (const t of tx.vin) {
          if (hashlist.includes(t.address)) {
            results[t.address]["sent"] = results[t.address]["sent"].plus(
              t.value
            );
            is_tx[t.address] = 1;
          }
        }

        for (const t of tx.vout) {
          if (hashlist.includes(t.address)) {
            results[t.address]["received"] = results[t.address][
              "received"
            ].plus(t.value);
            is_tx[t.address] = 1;
          }
        }
      } else {
        for (const t of tx.vin) {
          if (hashlist.includes(t.address)) {
            results[t.address]["staked"] = results[t.address]["staked"].plus(
              t.value
            );
            is_tx[t.address] = 1;
          }
        }

        for (const t of tx.vout) {
          if (hashlist.includes(t.address)) {
            results[t.address]["staked"] = results[t.address]["staked"].plus(
              t.value
            );
            is_tx[t.address] = 1;
          }
        }
      }
      for (const address of Object.keys(is_tx)) {
        results[address].tx_counts++;
      }
      return tx;
    });

    for (let key of Object.keys(results)) {
      let item = results[key];
      item.balance = item.received.plus(item.staked).minus(item.sent);
    }

    console.log("tx length", txs.length);

    // const sent = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
    //   .reduce((acc, tx) => acc.plus(tx.vin.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))), BigNumber(0.0));

    // const received = txs.filter((tx) => tx.vout[0].address !== 'NON_STANDARD')
    //   .reduce((acc, tx) => acc.plus(tx.vout.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))), BigNumber(0.0));

    // const staked = txs.filter((tx) => tx.vout[0].address === 'NON_STANDARD')
    //   .reduce((acc, tx) => acc.minus(tx.vin.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))).plus(tx.vout.reduce((a, t) => {
    //     if (hashlist.includes(t.address)) {
    //       return a.plus(BigNumber(t.value));
    //     }

    //     return a;
    //   }, BigNumber(0.0))), BigNumber(0.0));

    // const balance = received.plus(staked).minus(sent);
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getBetsForAccount = async (req, res) => {
  req.clearTimeout();
  try {
    const hashlist = req.params.hashlist.split(",");
    let results = [];

    const txs = await TX.aggregate([
      {
        $match: {
          $or: [
            { "vout.address": { $in: hashlist } },
            { "vin.address": { $in: hashlist } },
          ],
        },
      },
      { $sort: { blockHeight: -1 } },
      {
        $lookup: {
          from: "betactions",
          let: {
            txId: "$txId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$txId", "$txId"],
                },
              },
            },
            {
              $lookup: {
                from: "betevents",
                localField: "eventId",
                foreignField: "eventId",
                as: "event",
              },
            },
            {
              $unwind: "$event",
            },
          ],

          as: "betTxs",
        },
      },
      {
        $lookup: {
          from: "betparlays",
          localField: "txId",
          foreignField: "txId",
          as: "parlayTxs",
        },
      },
    ])
      .allowDiskUse(true)
      .exec();

    txs.map((tx) => {
      for (const bet of tx.betTxs) {
        results.push(bet);
      }

      for (const parlay of tx.parlayTxs) {
        results.push(parlay);
      }
    });

    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getunspenttransactions = async (req, res) => {
  try {
    const hashlist = req.params.hashlist.split(",");
    const txs = await UTXO.find({ address: { $in: hashlist } });
    let result = JSON.parse(JSON.stringify(txs));
    result = result.map((tx) => {
      tx.satoshi = parseInt(tx.value * 100000000);
      return tx;
    });
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const gettransaction = async (req, res) => {
  if (!req.query.hash || !isNaN(req.query.hash)) {
    throw new Error("Transaction hash must be a string!");
  }
  const hash = req.query.hash;
  try {
    const rawTx = await TX.findOne({ txId: hash }).lean();
    if (!rawTx) {
      return res.json({
        txid: hash,
        confirmations: 0,
        status: {
          confirmed: false,
          block_height: -1,
          block_hash: "",
          block_time: Math.floor(new Date().getTime() / 1000),
        },
      });
    }
    const block = await BLOCK.findOne({ height: rawTx.blockHeight });

    const txinfo = _.merge(
      { txid: rawTx.txId,
        confirmations: block.confirmations,
        status: {
          confirmed: block.confirmations > 0,
          block_height: block.height,
          block_hash: block.hash,
          block_time: Math.floor(new Date(block.createdAt).getTime() / 1000),
        },
      },
      rawTx
    );
    res.json(txinfo);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getMapping = async (req, res) => {
  try {
    const search = req.params.search;

    const results = await Mapping.aggregate([
      {
        $match: {
          name: { $regex: `.*${search}.*`, $options: "i" },
        },
      },
    ]);

    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

module.exports = {
  getBetStatus,
  getCustomSupply,
  getTotalPayout,
  getAddressesInfo,
  getBetsForAccount,
  getunspenttransactions,
  gettransaction,
  getMapping,
};
