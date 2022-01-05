import Component from "core/Component";
import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar";
import GlobalMenuWalletSection from "./GlobalMenuWalletSection";

export default class GlobalMenuDesktop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
 
  }

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
              <GlobalMenuWalletSection> </GlobalMenuWalletSection>
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
