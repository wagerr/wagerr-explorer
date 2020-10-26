![Wagerr Logo](https://wagerr.com/build/images/wgrWordsRed.78ec6909.svg)

Wagerr Block Explorer
=====

An advanced explorer based on node-js for the Wagerr block chain. Components dockerized for easy installation.

# Installation Instructions (as Root)

1. Access your VPS or Dedicated Server that runs Ubuntu 18.04 (recommended)

2. Install Docker, NPM, GIT and NODE

```
  apt install docker npm nodejs git
```
3. Clone the wagerr-explorer repo

```
  git clone https://github.com/wagerr/wagerr-explorer
```
4. Change to the wagerr-explorer directory

```
  cd wagerr-explorer
```
5. Create the environment setup file

```
  nano .env
```
6. Paste the following template and adjust variables

```
  MONGODB_HOST=mongo
  MONGODB_PORT=27017
  MONGO_INITDB_ROOT_USERNAME=REPLACE
  MONGO_INITDB_ROOT_PASSWORD=REPLACE
  MONGO_INITDB_DATABASE=admin
  MONGODB_USERNAME=REPLACE
  MONGODB_PASSWORD=REPLACE
  MONGODB_DATABASE=REPLACE
  SERVER_API_HOST=https://explorer.wagerr.com
  SERVER_API_PORT=REPLACE
  REDIS_HOST=redis
  RPC_BIND=rpcnode
  RPC_USER=REPLACE
  RPC_PASS=REPLACE
  RPC_PORT=55003
  COIN_TESTNET='MainNet'
  ORACLE_PAYOUT_ADDRESS=WRBs8QD22urVNeGGYeAMP765ncxtUA1Rv2
  DEV_PAYOUT_ADDRESS=Wm5om9hBJTyKqv5FkMSfZ2FDMeGp12fkTe
  LOTTO_PAYOUT_ADDRESS=Weqz3PFBq3SniYF5HS8kuj72q9FABKzDrP
  API_SERVER=https://explorer.wagerr.com
```
7. Edit the configuration file

```
  nano config.js
```
8. Use the following template and adjust variables

```
  const config = {
    api: {
      host: 'https://explorer.wagerr.com',
      port: 'REPLACE',
      prefix: '/api',
      timeout: '30s'
    },
    coinMarketCap: {
      tickerId: '1779'
    },
    db: {
      host: 'mongo',
      port: '27017',
      name: 'REPLACE',
      user: 'REPLACE',
      pass: 'REPLACE'
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
      host: 'REPLACE',
      port: '55003',
      user: 'REPLACE',
      pass: 'REPLACE',
      timeout: 8000, // 8 seconds
    },
    coin:{
      testnet: 'MainNet' || 'MainNet',
      oracle_payout_address: 'WRBs8QD22urVNeGGYeAMP765ncxtUA1Rv2' || 'TGFKr64W3tTMLZrKBhMAou9wnQmdNMrSG2', // testnet address, replace with mainnet
      dev_payout_address: 'Wm5om9hBJTyKqv5FkMSfZ2FDMeGp12fkTe' || 'TLceyDrdPLBu8DK6UZjKu4vCDUQBGPybcY', // testnet address, replace with mainnet
    },
    redis:{
      host: 'redis' || 'localhost',
    },
    crons: {
      start: '',
    },
  };
```
9. Start docker build process

```
  docker-compose build
```
10. Start the rpcnode docker and allow to fully sync

```
  docker-compose up -d rpcnode (wait for full sync)
```
11. Start the mongo docker

```
  docker-compose up -d mongo
```
12. Start the explorer docker

```
docker-compose up -d
```

[![Discord](https://img.shields.io/discord/374271866308919296.svg)](https://discord.gg/wBhxXss) <a href="https://twitter.com/intent/follow?screen_name=wagerrx"> <img src="https://img.shields.io/twitter/follow/wagerrx.svg?style=social&logo=twitter" alt="follow on Twitter"></a>


```
Progress
-Api integration explorer/overview
-Api integration explorer/movement
-Api integration explorer/masternode
```
