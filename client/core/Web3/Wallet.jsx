import Client from "@wagerr-wdk/client";
import Web3Modal from "web3modal";
import utils from "../../component/utils/utils";
import InjectedProvider from "@wagerr-wdk/injected-provider";
import { ethers } from "ethers";
import BEP20Token from "../../abis/BEP20Token.json";
import Betting from "../../abis/BettingV4.json";
import { Subject } from "rxjs";
import { getCrosschainBetByTxId } from "../Actions";
import { Coins, Networks } from "./bsc_config";
import { Providers } from "./providers";

export default class Wallet {
  static instance = Wallet.instance || new Wallet();
  client = null; //web3 metamask or wagerr extenstion wallet
  currentProvider = null; //metamask(MM) or wagerr(WGR) network
  bscCoin = null; //token contract
  bscBetting = null; //betting contract
  currentProviderAccounts = null; // all metamask accounts
  network = null;
  WGR = Coins()["WGR"]; //wgr bsc contract address
  currentBscCoin = this.WGR;

  constructor() {
    this.providerEvents = new Subject();

    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: Providers(),
      theme: "dark",
    });
  }
  setCurrentBscCoin = (coin) => {
    this.currentBscCoin = Coins()[coin];
    this.init_coin(this.currentBscCoin);
  };
  init_coin = (coin) => {
    this.bscCoin = new ethers.Contract(
      coin[this.network.name], //token address
      BEP20Token.abi,
      this.client //provider
    );
  };

  init_contracts = () => {
    try {
      this.bscBetting = new ethers.Contract(
        this.network.contractAddress,
        Betting.abi,
        this.client
      );

      this.init_coin(this.currentBscCoin);
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

  getNetwork = () => {
    const chainId = this.client.provider ? this.client.provider.chainId : 0x00;
    return Networks()[parseInt(chainId, 16)];
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
      this.client = new ethers.providers.Web3Provider(provider);
      this.network = this.getNetwork();
      if (!this.network) {
        throw new Error("Unsupported Network");
      }
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
      window.location.reload();
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
    if (this.client.provider && this.client.provider.close) {
      await this.client.provider.close();
    }
    this.network = null;
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
        if (this.currentBscCoin.symbol == "WGR") {
          res = await this.bscBetting
            .connect(this.currentProviderAccount)
            .betWithWGR(opcode, amt);
        } else if (this.currentBscCoin.symbol == "BNB") {
          res = await this.bscBetting
            .connect(this.currentProviderAccount)
            .betWithNativeCoin(opcode, {
              value: amt,
            });
        } else {
          res = await this.bscBetting
            .connect(this.currentProviderAccount)
            .betWithToken(opcode, this.currentBscCoin.symbol, amt);
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
    if (this.currentBscCoin.symbol === "BNB") {
      balance = await this.client.getBalance(address);
    } else {
      balance = await this.bscCoin.balanceOf(address);
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

      const approve = await this.bscCoin
        .connect(this.currentProviderAccount)
        .approve(this.network.contractAddress, balance); //approving whole wallet balance.
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
    if (this.currentBscCoin.symbol == "BNB") false;
    const allowance = await this.bscCoin.allowance(
      await this.currentProviderAccount.getAddress(),
      this.network.contractAddress
    );

    const amt = ethers.utils.parseEther(amount.toString());

    return amt.gt(allowance);
  };

  getInputAmount = async (amount) => {
    try {
      const feeWGR = await this.bscBetting.convertFeeToCoin(
        this.WGR[this.network.name]
      );

      if (this.currentBscCoin.symbol == "WGR") {
        return ethers.utils.formatEther(
          ethers.utils.parseEther(amount.toString()).add(feeWGR)
        );
      }
      const res = await this.bscBetting.getAmountInMin(
        this.currentBscCoin[this.network.name],
        this.WGR[this.network.name],
        ethers.utils.parseEther(amount.toString()).add(feeWGR)
      );

      return ethers.utils.formatEther(res);
    } catch (e) {
      console.log("Error: getAmountInMin", e);
      return 0;
    }
  };

  getFee = async () => {
    const res = await this.bscBetting.convertFeeToCoin(
      this.currentBscCoin[this.network.name]
    );

    return ethers.utils.formatEther(res);
  };
  getCrosschainTx = async (txId) => {
    const bet = await getCrosschainBetByTxId(txId);

    return bet ? bet.wgrBetTx : undefined;
  };
}
