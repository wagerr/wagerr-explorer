import WalletConnectProvider from "@walletconnect/web3-provider";
export const Providers = () => {
  return {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        qrcodeModalOptions: {
          desktopLinks: [],
        },
        rpc: {
          97: "https://data-seed-prebsc-1-s1.binance.org:8545",
          56: "https://bsc-dataseed1.binance.org",
        },
      },
    },

    binancechainwallet: {
      package: true,
    },
    wagerrchainwallet: {
      package: true,
    },
  };
};

export default {
  Providers,
};
