import WalletConnectProvider from "@walletconnect/web3-provider";
export const Providers = () => {
  var defaultProvider = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        qrcodeModalOptions: {
          desktopLinks: [],
        },
        rpc: {
          97: "https://data-seed-prebsc-1-s1.binance.org:8545",
          56: "https://bsc-dataseed1.binance.org",
          338: "https://cronos-testnet-3.crypto.org:8545",
          25: "https://evm-cronos.crypto.org",
        },
      },
    },
  };

  //if (window.BinanceChain) {
  defaultProvider["binancechainwallet"] = {
    package: true,
  };
  // }
  if (window.providerManager) {
    defaultProvider["wagerrchainwallet"] = { package: true };
  }

  return defaultProvider;
};

export default {
  Providers,
};
