export const Coins = (chain) => {
  const coins = {
    bsc: {
      /*  BNB: {
        symbol: "BNB",
        mainCoin: true,
        testnet: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", //testnet
        mainnet: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", //mainnet
      },*/
      WGR: {
        symbol: "WGR",
        testnet: "0xFA2Dfd4f223535E0780d8e17e43B97d23AAB88a9",
        mainnet: "0xdbf8265b1d5244a13424f13977723acf5395eab2",
      },
      /* BUSD: {
        symbol: "BUSD",
        testnet: "0x78867bbeef44f2326bf8ddd1941a4439382ef2a7",
        mainnet: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      },*/
    },
    cronos: {},
  };

  return coins[chain];
};
export const Networks = () => {
  return {
    97: {
      chainIdHex: "0x61",
      name: "testnet",
      contractAddress: "0x5ef0260999de24bd65aF05e706527355267De286",
      chain: "bsc",
      explorer: "https://testnet.bscscan.com",
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
      coins: Coins("bsc"),
    },
    /*56: {
      chainIdHex: "0x38",
      name: "mainnet",
      contractAddress: "0xc249F8011EE09f7CAea548e2bB16C20e8A6981DB",
      chain: "bsc",
      explorer: "https://bscscan.com",
      rpcUrl: "https://bsc-dataseed1.binance.org",
      coins: Coins("bsc"),
    },*/
  };
};

export default {
  Coins,
  Networks,
};
