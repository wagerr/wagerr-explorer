export const Coins = () => {
  return {
    BNB: {
      symbol: "BNB",
      bnbt: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", //testnet
      bnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", //mainnet
    },
    WGR: {
      symbol: "WGR",
      bnbt: "0xFA2Dfd4f223535E0780d8e17e43B97d23AAB88a9",
      bnb: "0xdbf8265b1d5244a13424f13977723acf5395eab2",
    },
    BUSD: {
      symbol: "BUSD",
      bnbt: "0x78867bbeef44f2326bf8ddd1941a4439382ef2a7",
      bnb: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    },
  };
};

export default {
  Coins,
};
