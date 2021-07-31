import Client from "@wagerr-wdk/client";
import utils from "../component/utils/utils";
import InjectedProvider from "@wagerr-wdk/injected-provider";
import Web3 from "web3";
import BEP20Token from "../abis/BEP20Token.json";
import Betting from "../abis/Betting.json";
import { Subject } from "rxjs";

export default class Wallet {
  static instance = Wallet.instance || new Wallet();

  walletInstalled = { WGR: false, MM: false };
  client = null; //web3 metamask or wagerr extenstion wallet
  currentProvider = null; //metamask(MM) or wagerr(WGR)
  bscWgr = null; //token contract
  bscBetting = null; //betting contract
  currentProviderAccounts = null; // all metamask accounts
  bettingContractAddress = null; //betting contract account

  constructor() {
    if (window.providerManager) {
      this.walletInstalled["WGR"] = true;
    }
    if (window.ethereum) {
      this.walletInstalled["MM"] = true;
    }
    this.walletChanged = new Subject();
  }
  ether = (n) => {
    return new this.client.utils.BN(
      this.client.utils.toWei(n.toString(), "ether")
    );
  };

  init_contracts = async () => {
    try {
      this.bscWgr = new this.client.eth.Contract(
        BEP20Token.abi,
        "0xfa2dfd4f223535e0780d8e17e43b97d23aab88a9"
      );

      const netId = await this.client.eth.net.getId();
      this.bscBetting = new this.client.eth.Contract(
        Betting.abi,
        Betting.networks[netId].address
      );
      this.bettingContractAddress = Betting.networks[netId].address;
      this.currentProviderAccounts = await this.client.eth.getAccounts();
    } catch (e) {
      console.log("Error:", e);
      window.alert("Contract not deployed to current network");
    }
  };

  connectWallet = async (wallet) => {
    if (wallet == "WGR") {
      this.client = new Client();
      this.client.addProvider(
        new InjectedProvider(window.providerManager.getProviderFor("WGR"))
      );
      await window.providerManager.enable();
      this.currentProvider = "WGR";
    } else if (wallet == "MM") {
      this.client = new Web3(window.ethereum);
      await window.ethereum.enable();
      this.currentProvider = "MM";
      await this.init_contracts();
      window.ethereum.on("accountsChanged", function (accounts) {
        window.location.reload();
      });
    }
  };

  updateWalletBalance = async () => {
    if (this.currentProvider == "WGR") {
      let resAddrs = await this.client.wallet.getUsedAddresses();

      if (resAddrs.length == 0) resAddrs = ["x"];
      const balance = await this.client.chain.getBalance(resAddrs);

      return utils.prettyBalance(balance);
    } else if (this.currentProvider == "MM") {
      const balance = await this.bscWgr.methods
        .balanceOf(this.currentProviderAccounts[0])
        .call();
      return parseFloat(this.client.utils.fromWei(balance)).toFixed(2);
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
      spentaddresses = [this.currentProviderAccounts[0]];
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
        await this.updateWalletBalance();
        return res;
      } catch (e) {
        console.log("Error: Sending Bet:", e);
        alert("There is an error:" + e);
      }
    }
    if (this.currentProvider == "MM") {
      try {
        await this.bscWgr.methods
          .approve(this.bettingContractAddress, this.ether(amount))
          .send({ from: this.currentProviderAccounts[0] });
        const res = await this.bscBetting.methods
          .doBet(opcode, this.ether(amount))
          .send({ from: this.currentProviderAccounts[0] });
        await this.updateWalletBalance();
        return res;
      } catch (e) {
        console.log("Error: Sending Bet:", e);
        alert("There is an error:" + e.message);
      }
    }

    if (this.currentProvider == null) {
      alert("no wallet connected.");
      return null;
    }
  };

  getLastBetCrosschainTx = async () => {
    const betIndex = await this.bscBetting.methods.betIndex().call();
    const lastBet = await this.bscBetting.methods
      .Bets(Number(betIndex) - 1)
      .call();
    console.log(lastBet, betIndex);
    return lastBet.betTxId;
  };
}
