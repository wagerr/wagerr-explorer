import Component from "core/Component";
import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar";
import Wallet from "../../core/Web3/Wallet";
import {
  UncontrolledDropdown,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Coins } from "../../core/Web3/bsc_config";

export default class GlobalMenuDesktop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      walletConnected: false,
      walletBalance: 0,
      currentBscCoin: "WGR",
    };

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

      alert(e.message);
    }
  };

  updateWalletBalance = async () => {
    const balance = await Wallet.instance.getWalletBalance();
    this.setState({
      walletBalance: balance,
    });
  };

  setBscCoin = async (coin) => {
    Wallet.instance.setCurrentBscCoin(coin);
    const balance = await Wallet.instance.getWalletBalance();
    this.setState({
      walletBalance: balance,
      currentBscCoin: coin,
    });
  };
  getLinks = () => {
    const { props, state } = this;

    return props.links.map((i, idx) => {
      const { pathname } = this.props.location;

      let explore_class = false;
      if (
        !pathname.includes("/bethistory") &&
        !pathname.includes("betting") &&
        !pathname.includes("lottos") &&
        !pathname.includes("help")
      )
        explore_class = true;

      let isActive = false;
      let isDisabled = false;

      let disabledList = ["/lottos", , "/help"];
      if (disabledList.includes(i.href)) isDisabled = true;

      if (pathname.includes("help") && i.href === "/help") isActive = true;
      if (pathname.includes("lottos") && i.href === "/lottos") isActive = true;
      if (pathname.includes("betting") && i.href === "/betting")
        isActive = true;
      if (pathname.includes("bethistory") && i.href === "/bethistory")
        isActive = true;
      if (explore_class && i.href === "/") isActive = true;
      const iconSource = isDisabled ? i.gicon : i.icon;

      return (
        <Link
          to={i.href}
          key={idx}
          className={`${
            isDisabled && "disabled-link"
          } global-menu-desktop__item ${
            isActive
              ? explore_class
                ? "global-menu-desktop__item--is-active"
                : "global-menu-desktop__item2--is-active"
              : ""
          }`}
        >
          <div className="w3-dropdown-hover">
            <img
              alt={i.label}
              className="global-menu-desktop__item-icon"
              style={{ opacity: 0.9 }}
              src={iconSource}
              title={this.state.isOpen ? null : i.label}
            />
            <span
              className={`w3-button global-menu-desktop__item-label ${
                isDisabled && "global-menu-desktop__item-label--disabled"
              }`}
            >
              {i.label}
            </span>
            {i.submenu && (
              <div className="w3-dropdown-content w3-bar-block ">
                {i.submenu.map((x, key) => (
                  <Link to={x.href} key={key}>
                    <div className="global-menu-desktop__item__submenu__text">
                      {x.label}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Link>
      );
    });
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const { pathname } = this.props.location;
    let explore_class = "";
    if (
      pathname.includes("/bethistory") ||
      pathname.includes("betting") ||
      pathname.includes("lottos") ||
      pathname.includes("help")
    )
      explore_class = "global-menu-desktop-unexplorer";

    return (
      <div className={pathname.includes("help") ? "h-140" : ""}>
        <div className={`global-menu-desktop ${explore_class}`}>
          <div className="global-menu-desktop__content-wrapper">
            <div className="global-menu-desktop__header">
              <div className="global-menu-desktop_logo_section">
                <img
                  src="/img/uiupdate/wgrlogomodernICONallwhite.svg"
                  className="global-menu-desktop__logo"
                />
              </div>
              <div className="global-menu-desktop_links">{this.getLinks()}</div>

              <div className="global-menu-desktop_wallet_setion">
                <div className="global-menu-desktop_wallet_connection text-center">
                  {this.state.walletConnected ? (
                    <div>
                      <span>
                        {Wallet.instance.currentProvider == "MM" ? (
                          <UncontrolledDropdown size="sm">
                            <DropdownToggle
                              caret
                              tag="a"
                              style={{ color: "white" }}
                            >
                              <div className="wallet_connection_status_mark"></div>
                              {this.state.currentBscCoin}
                            </DropdownToggle>
                            <DropdownMenu>
                              {Object.keys(Coins()).map((c) => {
                                return (
                                  <DropdownItem
                                    key={c}
                                    onClick={() => {
                                      this.setBscCoin(c);
                                    }}
                                  >
                                    {c}
                                  </DropdownItem>
                                );
                              })}
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        ) : (
                          <p style={{ color: "white" }}>
                            <div className="wallet_connection_status_mark"></div>
                            WGR
                          </p>
                        )}
                      </span>
                      <span className="global-menu-desktop_wallet_balance">
                        {this.state.walletBalance} {this.state.currentBscCoin} (
                        <img
                          src={
                            Wallet.instance.network?.chain
                              ? `/img/${Wallet.instance.network.chain}_logo.svg`
                              : "/img/wgr_logo.svg"
                          }
                          width="24"
                          height="24"
                        />{" "}
                        {Wallet.instance.network?.name || "wagerr"})
                      </span>
                      <div className="global-menu-desktop_wallet_connection_status">
                        <p style={{ color: "#03a358" }}>
                          <a
                            href=""
                            onClick={async (e) => {
                              this.setState({ walletConnected: false }),
                                e.preventDefault(),
                                await Wallet.instance.disconnect(),
                                clearInterval(this.balanceRefresher);
                            }}
                          >
                            Switch Wallet
                          </a>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="global-menu-desktop_wallet_connection_status">
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
                </div>
              </div>
            </div>
          </div>
          {explore_class !== "global-menu-desktop-unexplorer" && (
            <SearchBar
              className="d-none d-md-block"
              onSearch={this.props.handleSearch}
            />
          )}
        </div>
      </div>
    );
  }
}
