const config = {
  api: {
    host: 'https://explorer.wagerr.com',
    port: '8087' || '8087',
    prefix: '/api',
    timeout: '30s'
  },
  coinMarketCap: {
    tickerId: '1779'
  },
  db: {
    host: 'mongo' || 'mongo',
    port: '27017' || '27017',
    name: 'wagerrx4' || 'wagerrx',
    user: 'wagerrun' || 'wagerru',
    pass: 'wagerrpass2020' || 'wagerrpass2019'
  },
  freegeoip: {
    api: 'https://extreme-ip-lookup.com/json/'
  },
  faucet:{
    wait_time: 1440,
    percent: 0.02,
    limit: 500
  },
  rpc: {
    host: 'rpcnode' || 'rpcnode',
    port: '55003' || 8332,
    user: 'wagerr' || 'wagerr',
    pass: 'this' || 'thiswagerrpass',
    timeout: 8000, // 8 seconds
  },
  coin:{
    testnet: 'MainNet' || 'MainNet',
    // testnet address, replace with mainnet if needed, oracle/dev address changed after 1501000, index [0] should be new one.
    oracle_payout_address: ['TDunmyDASGDjYwhTF3SeDLsnDweyEBpfnP','TGFKr64W3tTMLZrKBhMAou9wnQmdNMrSG2'], 
    dev_payout_address: ['TDunmyDASGDjYwhTF3SeDLsnDweyEBpfnP','TLceyDrdPLBu8DK6UZjKu4vCDUQBGPybcY'], 
  },
  redis:{
    host: 'redis' || 'localhost',
  },
  crons: {
    start: '',
  },
};

module.exports = config;
