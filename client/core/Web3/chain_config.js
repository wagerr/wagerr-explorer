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
    cronos: {
      WGR: {
        symbol: "WGR",
        testnet: "0x4EaC16E4D2bB1f737F0eC307617F38eF9b1e7D5e",
        mainnet: "0x",
      },
      CRO: {
        symbol: "CRO",
        mainCoin: true,
        testnet: "0xca2503482e5D6D762b524978f400f03E38d5F962",
        mainnet: "0x",
      },
    },
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
      tokenABI: "BEP20Token.json",
      contractABI: "BettingV4-bsc.json",
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
    338: {
      chainIdHex: "0x152",
      name: "testnet",
      contractAddress: "0xfB41d43b533151e473A40f8a9a40aDD3D2E1475d",
      chain: "cronos",
      tokenABI: "CRC20Token.json",
      contractABI: "BettingV4-cronos.json",
      explorer: "https://cronos.crypto.org/explorer/testnet3",
      rpcUrl: "https://cronos-testnet-3.crypto.org:8545",
      coins: Coins("cronos"),
    },
  };
};
export const currentNetwork = () => {
  if (!localStorage.currentNetwork) {
    localStorage.currentNetwork = JSON.stringify(Networks()["97"]);

  }
  return JSON.parse(localStorage.currentNetwork);
}

export const setCurrentNetwork = (network) => {
  localStorage.currentNetwork =  JSON.stringify(network);
};
  
export default {
  Coins,
  Networks,
  currentNetwork,
  setCurrentNetwork,
};
