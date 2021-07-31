import Component from "core/Component";
import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar";
import Wallet from "../../core/Wallet";

export default class GlobalMenuDesktop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      walletInstalled: Wallet.instance.walletInstalled,
      walletConnected: false,
      walletBalance: 0,
    };
    console.log("walletInstalled ", Wallet.instance.walletInstalled);
    setInterval(Wallet.instance.updateWalletBalance, 40000);
  }

  connectWallet = async (wallet) => {
    await Wallet.instance.connectWallet(wallet);
    const balance = await Wallet.instance.updateWalletBalance();
    this.setState({
      walletConnected: true,
      walletBalance: balance,
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

      let disabledList = ["/bethistory", "/lottos", "/betting", "/help"];
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
    console.log("explore_class --:", explore_class);
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
                      <span className="global-menu-desktop_wallet_balance">
                        {this.state.walletBalance} WGR
                      </span>
                      <div className="global-menu-desktop_wallet_connection_status">
                        <div className="wallet_connection_status_mark"></div>
                        <span className="wallet_connection_status_text">
                          Wallet Connected
                        </span>
                        <p style={{ color: "#03a358" }}>
                          <a
                            href=""
                            onClick={(e) => {
                              this.setState({ walletConnected: false }),
                                e.preventDefault();
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
                          {this.state.walletInstalled["MM"] ? (
                            <button
                              className="wallet_connection_button"
                              onClick={async () => {
                                await this.connectWallet("MM");
                                Wallet.instance.walletChanged.next("MM");
                              }}
                            >
                              BSC
                            </button>
                          ) : null}
                          &nbsp; &nbsp;
                          {this.state.walletInstalled["WGR"] ? (
                            <button
                              className="wallet_connection_button"
                              onClick={async () => {
                                await this.connectWallet("WGR");
                                Wallet.instance.walletChanged.next("WGR");
                              }}
                            >
                              WGR
                            </button>
                          ) : null}
                        </div>
                      }
                      {this.state.walletInstalled["MM"] == false &&
                      this.state.walletInstalled["WGR"] == false ? (
                        <p className="wallet_connection_status_text">
                          No Wallet Installed
                        </p>
                      ) : null}
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
