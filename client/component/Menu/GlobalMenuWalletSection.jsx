import Component from "core/Component";
import React from "react";
import Wallet from "../../core/Web3/Wallet";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  
} from "reactstrap";
import { Networks } from "../../core/Web3/chain_config";

export default class GlobalMenuWalletSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletConnected: false,
      walletBalance: 0,
      currentCoin: "WGR",
      currentNetwork:
        Wallet.instance.currentNetwork.chain +
        "_" +
        Wallet.instance.currentNetwork.name,
    };
  }

  componentDidMount() {
    if (Wallet.instance.web3Modal.cachedProvider) {
      this.connectWallet();
    }
  }
  connectWallet = async () => {
    try {
      Wallet.instance.providerEvents.subscribe(async (event) => {
        if (event == "accountsChanged") {
          await this.updateWalletBalance();
        } else if (event == "walletConnected") {
          await this.updateWalletBalance();
          this.setState({ walletConnected: true });

          this.balanceRefresher = setInterval(() => {
            this.updateWalletBalance();
          }, 30000);
        } else if (event == "chainChanged") {
          //await this.disconnectWallet();
        }
      });

      await Wallet.instance.connectWallet();
    } catch (e) {
      console.log(
        "Error connecting Wallet:",
        typeof e === "string" ? e : e.message
      );

      if (
        (typeof e === "string" && e == "Modal closed by user") ||
        e.message == "User closed modal"
      )
        return;

      if (
        e &&
        e.message == "The method 'wallet_switchEthereumChain' is not supported."
      ) {
        e.message =
          "Network not supported, please changed network from wallet.";
        await this.disconnectWallet();
      }

      alert(typeof e === "string" ? e : e.message);
    }
  };

  disconnectWallet = async () => {
    this.setState({ walletConnected: false }),
      await Wallet.instance.disconnect(),
      clearInterval(this.balanceRefresher);
  };

  updateWalletBalance = async () => {
    try {
      const balance = await Wallet.instance.getWalletBalance();
      this.setState({
        walletBalance: balance,
      });
    } catch (e) {
      console.log(
        "Error getting wallet balance:",
        typeof e === "string" ? e : e.message
      );
      alert(typeof e === "string" ? e : e.message);
      await this.disconnectWallet();
    }
  };

  setCoin = async (coin) => {
    Wallet.instance.setCurrentCoin(coin);
    const balance = await Wallet.instance.getWalletBalance();
    this.setState({
      walletBalance: balance,
      currentCoin: coin,
    });
  };

  setNetwork = async (network) => {
    Wallet.instance.setCurrentNetwork(network);
    this.setState({
      currentNetwork: network.chain + "_" + network.name,
      currentCoin: Object.keys(network.coins)[0],
    });
    await this.disconnectWallet();
  };

  render() {
    return (
      <div className="global-menu_wallet_section">
        <div className="global-menu_wallet_connection">
          <UncontrolledDropdown size="sm">
            {this.state.walletConnected ? (
              <div>
                <span>
                  {Wallet.instance.currentProvider == "MM" ? (
                    <UncontrolledDropdown size="sm">
                      <DropdownToggle caret tag="a" style={{ color: "white" }}>
                        <div className="wallet_connection_status_mark"></div>
                        {this.state.walletBalance} {this.state.currentCoin} (
                        {Wallet.instance.currentNetwork?.name})
                      </DropdownToggle>
                      <DropdownMenu right>
                        {Object.keys(Wallet.instance.currentNetwork.coins).map(
                          (c) => {
                            return (
                              <DropdownItem
                                key={c}
                                onClick={() => {
                                  this.setCoin(c);
                                }}
                              >
                                {c}
                              </DropdownItem>
                            );
                          }
                        )}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  ) : (
                    <p style={{ color: "white" }}>
                      <div className="wallet_connection_status_mark"></div>
                      {this.state.walletBalance} WGR (
                      <img
                        src={
                          Wallet.instance.currentProvider == "MM"
                            ? `/img/${Wallet.instance.currentNetwork.chain}_logo.svg`
                            : "/img/wgr_logo.svg"
                        }
                        width="24"
                        height="24"
                      />{" "}
                      )
                    </p>
                  )}
                </span>

                <div className="global-menu_wallet_connection_status">
                  <p className="wallet_connection_switch_wallet">
                    <a
                      href=""
                      onClick={async (e) => {
                        e.preventDefault();
                        await this.disconnectWallet();
                      }}
                    >
                      Switch Wallet
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="global-menu_wallet_connection_status">
                {
                  <div>
                    <button
                      className="wallet_connection_button"
                      onClick={async () => {
                        await this.connectWallet();
                      }}
                    >
                      Connect Wallet
                    </button>
                  </div>
                }
              </div>
            )}
          </UncontrolledDropdown>
        </div>
        <div className="global-menu_chain_section">
          <UncontrolledDropdown size="sm">
            <DropdownToggle outline>
              <img
                src={`/img/${Wallet.instance.currentNetwork.chain}_logo.svg`}
                width="24"
                height="24"
              />
            </DropdownToggle>
            <DropdownMenu right>
              {Object.values(Networks()).map((n) => {
                return (
                  <DropdownItem
                    style={{
                      textTransform: "uppercase",
                    }}
                    key={n.chain + "_" + n.name}
                    onClick={() => {
                      this.setNetwork(n);
                    }}
                  >
                    {n.chain + "_" + n.name}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </div>
    );
  }
}
