import Client from "@wagerr-wdk/client";
import Web3Modal from "web3modal";
import utils from "../../component/utils/utils";
import InjectedProvider from "@wagerr-wdk/injected-provider";
import { ethers } from "ethers";
import BEP20Token from "../../abis/BEP20Token.json";
import Betting from "../../abis/BettingV4.json";
import { Subject } from "rxjs";
import { getCrosschainBetByTxId } from "../Actions";
import { Coins } from "./bscCoins";
import { Providers } from "./providers";

export default class Wallet {
  static instance = Wallet.instance || new Wallet();
  client = null; //web3 metamask or wagerr extenstion wallet
  currentProvider = null; //metamask(MM) or wagerr(WGR) network
  bscCoin = null; //token contract
  bscBetting = null; //betting contract
  currentProviderAccounts = null; // all metamask accounts
  bettingContractAddress = "0x511CF9C7F335726200743b2925537d0E614e5db2";
  networkName = "";
  WGR = Coins()["WGR"]; //wgr bsc contract address
  currentBscCoin = this.WGR;

  constructor() {
    this.providerEvents = new Subject();
  }
  setCurrentBscCoin = (coin) => {
    this.currentBscCoin = Coins()[coin];
    this.init_coin(this.currentBscCoin);
  };
  init_coin = (coin) => {
    this.bscCoin = new ethers.Contract(
      coin[this.networkName], //token address
      BEP20Token.abi,
      this.client //provider
    );
  };

  init_contracts = () => {
    try {
      this.bscBetting = new ethers.Contract(
        this.bettingContractAddress,
        Betting.abi,
        this.client
      );
      this.init_coin(this.currentBscCoin);
      this.currentProviderAccount = this.client.getSigner();
    } catch (e) {
      console.log("Error:", e);

      window.alert("Contract not deployed to current network");
      this.disconnect();
    }
  };
  getProvider = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: Providers(),
      theme: "dark",
    });
    const provider = await web3Modal.connect();
    return provider;
  };

  connectWallet = async (wallet) => {
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
      this.networkName = (await this.client.getNetwork()).name;
      this.currentProvider = "MM";
      this.init_contracts();
      this.subscribe(this.client);
    }
    console.log(this.client);
  };

  subscribe = (client) => {
    //Subscribe to account change
    client.provider.on("accountChanged", (accounts) => {
      this.providerEvents.next("accountChanged");
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
            .betWithBNB(opcode, {
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
        .approve(this.bettingContractAddress, balance); //approving whole wallet balance.
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
      this.bettingContractAddress
    );

    const amt = ethers.utils.parseEther(amount.toString());

    return amt.gt(allowance);
  };

  getInputAmount = async (amount) => {
    try {
      const feeWGR = await this.bscBetting.convertFeeToCoin(
        this.WGR[this.networkName]
      );

      if (this.currentBscCoin.symbol == "WGR") {
        return ethers.utils.formatEther(
          ethers.utils.parseEther(amount.toString()).add(feeWGR)
        );
      }
      const res = await this.bscBetting.getAmountInMin(
        this.currentBscCoin[this.networkName],
        this.WGR[this.networkName],
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
      this.currentBscCoin[this.networkName]
    );

    return ethers.utils.formatEther(res);
  };
  getCrosschainTx = async (txId) => {
    const bet = await getCrosschainBetByTxId(txId);

    return bet ? bet.wgrBetTx : undefined;
  };
}
