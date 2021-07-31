import Client from '@wagerr-wdk/client';
import utils from '../component/utils/utils';
import InjectedProvider from '@wagerr-wdk/injected-provider';
import promise from 'bluebird';

export default class Wallet {
    static instance = Wallet.instance || new Wallet()

    constructor() {
        if (!window.providerManager) {
            this.walletInstalled = false
            return;
        } else {
            this.walletInstalled = true
        }

        this.wgrClient = new Client();
        this.wgrClient.addProvider(new InjectedProvider(window.providerManager.getProviderFor('WGR')));


    }

    connectWallet() {

        return new promise((resolve, reject) => {
            if (!this.walletInstalled) reject("no wallet installed");
            window.providerManager.enable().then((res) => {
                resolve(res)
            }).catch((e) => {
                reject(e)
            })
        })

    }

    updateWalletBalance = () => {

        return new promise((resolve, reject) => {
        if (!this.walletInstalled) reject("no wallet installed");
          this.wgrClient.wallet.getUsedAddresses()
            .then((resAddrs) => {
                if (resAddrs.length == 0) resAddrs = ['x']
                return this.wgrClient.chain.getBalance(resAddrs)
            })
            .then((balance) => {
                resolve(utils.prettyBalance(balance))
            }).catch((e) => {
                reject(e)
            })
        })

    }

    getSpentAddresses = async () => {
        return new promise((resolve, reject) => {
      this.wgrClient.wallet.getUsedAddresses().then((spentaddresses) => {
        spentaddresses = spentaddresses.map((addr) => {
            return addr.address
          })
        resolve(spentaddresses)
    }).catch((e) => {
        reject(e)
    })
      
});

    }

    sendBet(opcode, amount) {
        return new promise((resolve, reject) => {
            if (!this.walletInstalled) reject("no wallet installed");
            this.wgrClient.chain.sendTransaction(opcode, amount * (10 ** 8)).then(res => {
                this.updateWalletBalance()
                resolve(res)
            }).catch(e => {
                reject(e)
            })
        })
    }
}