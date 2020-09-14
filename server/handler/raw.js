const { rpc } = require('../../lib/cron');
const Block = require('../../model/block');
const UTXO = require('../../model/utxo');
const TX = require('../../model/tx');
const { BigNumber } = require('bignumber.js');

const sendRawTransaction = async (req, res) => {
    req.clearTimeout();
    const hexstring = req.body.hexstring
    try {

        const hex = await rpc.call('sendrawtransaction', [hexstring]);
        res.json(hex);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

const getblockbyhash = async (req, res) => {
    req.clearTimeout();
    if (!req.query.hash || !isNaN(req.query.hash)) {
        throw new Error('Transaction hash must be a string!');
    }
    const hash = req.query.hash
    try {

        const blockinfo = await rpc.call('getblock', [hash]);
        const data = {
            id: blockinfo.hash,
            height: blockinfo.height,
            timestamp: blockinfo.time,
            difficulty: blockinfo.difficulty,
            size: blockinfo.size,
            previousblockhash: blockinfo.previousblockhash,
            parentblockhash: blockinfo.nextblockhash,
            nonce: blockinfo.nonce,
            confirmations: blockinfo.confirmations            
        };
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

const gettransaction = async (req, res) => {
    req.clearTimeout();
    if (!req.query.hash || !isNaN(req.query.hash)) {
        throw new Error('Transaction hash must be a string!');
    }
    const hash = req.query.hash
    try {

        const hex = await rpc.call('getrawtransaction', [hash]);
        const txinfo = await rpc.call('decoderawtransaction', [hex]);
        res.json(txinfo);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
}
const getunspenttransactions = async (req, res) => {
    try {
        if (!req.query.address || !isNaN(req.query.address)) {
            throw new Error('Param must have address');
        }

        const txs = await UTXO.findOne({ address: req.query.address });
        res.json(txs);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
}

const getfeeinfo = async (req, res) => {
    req.clearTimeout();
    if (!req.query.blocks) {
        throw new Error('params must have a blocks!');
    }
    const blocks = parseInt(req.query.blocks)
    try {
        const data = await rpc.call('getfeeinfo', [blocks]);        
        console.log(data);
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
}

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
        tx_counts: txs.length,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message || err);
    }
  };

const getblocktransactions = async (req, res) => {
    try {
      console.log('hash:', req.query.blockhash);
      const query = { hash: req.query.blockhash }

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

module.exports = {
    getAddress,
    sendRawTransaction,
    getblockbyhash,
    gettransaction,
    getunspenttransactions,
    getfeeinfo,
    getblocktransactions
};
