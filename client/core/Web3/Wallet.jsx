import Client from "@wagerr-wdk/client";
import Web3Modal from "web3modal";
import utils from "../../component/utils/utils";
import InjectedProvider from "@wagerr-wdk/injected-provider";
import { ethers } from "ethers";
import { Subject } from "rxjs";
import { getCrosschainBetByTxId } from "../Actions";
import { currentNetwork,setCurrentNetwork } from "./chain_config";
import { Providers } from "./providers";

export default class Wallet {
  static instance = Wallet.instance || new Wallet();
  client = null; //web3 metamask or wagerr extenstion wallet
  currentProvider = null; //metamask(MM) or wagerr(WGR) network
  coinContract = null; //token contract
  bettingContract = null; //betting contract
  currentProviderAccount = null;
  currentNetwork = currentNetwork();
  WGR = null; //wgr chain contract address
  currentCoin = null;

  constructor() {
    this.providerEvents = new Subject();

    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: Providers(),
      theme: "dark",
    });
  }
  setCurrentCoin = (coin) => {
    this.currentCoin = this.currentNetwork.coins[coin];
    this.init_coin(this.currentCoin);
  };

  setCurrentNetwork = (network) => {
    this.currentNetwork = network;
    setCurrentNetwork(network);
  };

  init_coin = (coin) => {
    const Token = require(`../../abis/${this.currentNetwork.tokenABI}`);
    
    this.coinContract = new ethers.Contract(
      coin[this.currentNetwork.name], //token address for network
      Token.abi,
      this.client //provider
    );
  };

  init_contracts = () => {
    try {
      const Betting = require(`../../abis/BettingV4-${this.currentNetwork.chain}.json`);
      this.bettingContract = new ethers.Contract(
        this.currentNetwork.contractAddress,
        Betting.abi,
        this.client
      );

      this.WGR = this.currentNetwork.coins["WGR"]; // get WGR contract config
      this.currentCoin = this.WGR; //get WGR as default betting coin.
      this.init_coin(this.currentCoin);

      this.currentProviderAccount = this.client.getSigner();
    } catch (e) {
      console.log("Error:", e);

      window.alert(e);
      this.disconnect();
    }
  };
  getProvider = async () => {
    const provider = await this.web3Modal.connect();
    return provider;
  };

  connectWallet = async () => {
    const provider = await this.getProvider();

    if (provider.isWagerrChainWallet) {
      this.client = new Client();
      this.client.addProvider(
        new InjectedProvider(provider.getProviderFor("WGR"))
      );
      await provider.enable();
      this.currentProvider = "WGR";
    } else {
      const providerChainId = provider ? provider.chainId : "0x00";

      if (
        this.currentNetwork.chainIdHex !== providerChainId &&
        this.currentNetwork.chainIdHex !== "0x" + providerChainId.toString(16)
      ) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: this.currentNetwork.chainIdHex }],
          })
          
        } catch (e) {
          if (e.code === 4902 || e) {
            try {
              await provider.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: this.currentNetwork.chainIdHex,
                    chainName:
                      this.currentNetwork.chain +
                      "-" +
                      this.currentNetwork.name,
                    rpcUrls: [this.currentNetwork.rpcUrl]
                  },
                ],
              });
            } catch (e) {
              throw e;
            }
          } else {
            throw e;
          }
        }
      }
      this.client = new ethers.providers.Web3Provider(provider);

      this.currentProvider = "MM";
      this.init_contracts();
      this.subscribe(this.client);
    }
    this.providerEvents.next("walletConnected"); //update history,balance
  };

  subscribe = (client) => {
    //Subscribe to account change
    client.provider.on("accountsChanged", (accounts) => {
      this.providerEvents.next("accountsChanged");
      console.log("account changed:", accounts);
    });
    // Subscribe to chainId change
    client.provider.on("chainChanged", (chainId) => {
      //window.location.reload();
      this.providerEvents.next("chainChanged");
      console.log("chain changed:", chainId);
    });

    // Subscribe to provider disconnection
    client.provider.on("disconnect", (error) => {
      this.providerEvents.next("disconnect");
      console.log("disconnected", error);
    });
  };

  disconnect = async () => {
    if (this.client && this.client.provider && this.client.provider.close) {
      await this.client.provider.close();
    }
    this.currentProvider = null;
    this.web3Modal.clearCachedProvider();
  };
  getWalletBalance = async () => {
    if (this.currentProvider == "WGR") {
      let resAddrs = await this.client.wallet.getUsedAddresses();

      if (resAddrs.length == 0) resAddrs = ["x"];
      const balance = await this.client.chain.getBalance(resAddrs);

      return utils.prettyBalance(balance);
    } else if (this.currentProvider == "MM") {
      const balance = await this.balanceOfCurrentCoin();
      return parseFloat(ethers.utils.formatEther(balance)).toFixed(2);
    }
  };

  getSpentAddresses = async () => {
    let spentaddresses;
    if (this.currentProvider == "WGR") {
      spentaddresses = await this.client.wallet.getUsedAddresses();
      spentaddresses = spentaddresses.map((addr) => {
        return addr.address;
      });
    } else if (this.currentProvider == "MM") {
      spentaddresses = [await this.currentProviderAccount.getAddress()];
    }

    return spentaddresses;
  };

  sendBet = async (opcode, amount) => {
    if (this.currentProvider == "WGR") {
      try {
        const res = await this.client.chain.sendTransaction(
          opcode,
          amount * 10 ** 8
        );

        return res;
      } catch (e) {
        console.log("Error: Sending Bet:", e);
        alert("There is an error:" + e);
      }
    }
    if (this.currentProvider == "MM") {
      try {
        let amt = ethers.utils.parseEther(amount.toString());

        let res = null;
        if (this.currentCoin.symbol == "WGR") {
          res = await this.bettingContract
            .connect(this.currentProviderAccount)
            .betWithWGR(opcode, amt);
        } else if (this.currentCoin.mainCoin) {
          res = await this.bettingContract
            .connect(this.currentProviderAccount)
            .betWithNativeCoin(opcode, {
              value: amt,
            });
        } else {
          res = await this.bettingContract
            .connect(this.currentProviderAccount)
            .betWithToken(opcode, this.currentCoin.symbol, amt);
        }

        return res;
      } catch (e) {
        console.log("Error: Sending Bet:", e);
        const errMsg = e.data ? e.data.message : e.message;
        alert("There is an error:" + errMsg);
      }
    }

    if (this.currentProvider == null) {
      alert("no wallet connected.");
      return null;
    }
  };

  balanceOfCurrentCoin = async () => {
    let balance = 0,
      address = await this.currentProviderAccount.getAddress();

    if (this.currentCoin.mainCoin) {
      balance = await this.client.getBalance(address);
    } else {
      balance = await this.coinContract.balanceOf(address);
    }

    return balance;
  };

  approve = async (amount) => {
    if (this.currentProvider == null) {
      alert("no wallet connected.");
      return null;
    }
    try {
      const balance = await this.balanceOfCurrentCoin();

      const amt = ethers.utils.parseEther(amount.toString());

      if (amt.gt(balance)) {
        alert("Not enough balance.");
        return;
      }

      const approve = await this.coinContract
        .connect(this.currentProviderAccount)
        .approve(this.currentNetwork.contractAddress, balance); //approving whole wallet balance.
      await approve.wait();

      return true;
    } catch (e) {
      console.log("Error: Approval:", e);
      const errMsg = e.data ? e.data.message : e.message;
      alert("There is an error:" + errMsg);
      return false;
    }
  };

  needApproval = async (amount) => {
    if (this.currentCoin.mainCoin) false;
    const allowance = await this.coinContract.allowance(
      await this.currentProviderAccount.getAddress(),
      this.currentNetwork.contractAddress
    );

    const amt = ethers.utils.parseEther(amount.toString());

    return amt.gt(allowance);
  };

  getInputAmount = async (amount) => {
    try {
      const feeWGR = await this.bettingContract.convertFeeToCoin(
        this.WGR[this.currentNetwork.name]
      );

      if (this.currentCoin.symbol == "WGR") {
        return ethers.utils.formatEther(
          ethers.utils.parseEther(amount.toString()).add(feeWGR)
        );
      }
      const res = await this.bettingContract.getAmountInMin(
        this.currentCoin[this.currentNetwork.name],
        this.WGR[this.currentNetwork.name],
        ethers.utils.parseEther(amount.toString()).add(feeWGR)
      );

      return ethers.utils.formatEther(res);
    } catch (e) {
      console.log("Error: getAmountInMin", e);
      return 0;
    }
  };

  getFee = async () => {
      const res = await this.bettingContract.convertFeeToCoin(
        this.currentCoin[this.currentNetwork.name]
      );

      return ethers.utils.formatEther(res);
  };
  getCrosschainTx = async (txId) => {
    const bet = await getCrosschainBetByTxId({ chain: this.currentNetwork.chain, txid: txId });

    return bet ? bet.wgrBetTx : undefined;
  };
}
