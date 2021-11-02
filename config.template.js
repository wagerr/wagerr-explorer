const config = {
  api: {
    host: "http://95.217.8.192",
    port: "8087" || "8087",
    prefix: "/api",
    timeout: "30s",
  },
  db: {
    host: "localhost",
    port: "27017" || "27017",
    name: "wagerrx" || "wagerrx",
    user: "wagerrru" || "wagerru",
    pass: "this" || "thispass",
  },
  freegeoip: {
    api: "https://extreme-ip-lookup.com/json/",
  },
  crosschain_backend: {
    api: "http://127.0.0.1:4000/api",
  },
  faucet: {
    wait_time: 1440,
    percent: 0.02,
    limit: 500,
  },
  rpc: {
    host: "rpcnode" || "rpcnode",
    port: "55005" || 8332,
    user: "wagerr" || "wagerr",
    pass: "this" || "thispass",
    timeout: 8000, // 8 seconds
  },
  coin: {
    testnet: "MainNet" || "MainNet",
    // testnet address, replace with mainnet if needed, oracle/dev address changed after 1501000, index [0] should be new one.
    oracle_payout_address: ["new", "old"],
    dev_payout_address: ["new", "old"],
    oracle_wallet_address: "WRBs8QD22urVNeGGYeAMP765ncxtUA1Rv2",
  },
  redis: {
    host: "localhost",
  },
  crons: {
    start: "",
  },
};

module.exports = config;
