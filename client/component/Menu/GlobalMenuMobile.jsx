
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon';
import ClientUtils from '../utils/utils';
import GlobalMenuWalletSection from "./GlobalMenuWalletSection";
export default class GlobalMenuMobile extends Component {
  static propTypes = {
    links: PropTypes.array
  };

  static defaultProps = {
    links: []
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    }
  }

  getLinks = () => {
    const { props } = this;

    let ignoreFilter = ['/lottos', '/help'];

    let links = props.links.filter(link => {
      return !ignoreFilter.includes(link.href)
    })
    return links.map((i, idx) => {

      if (i.label == 'Get Started') {
        return (
          <a target="_blank" key={idx} className="menu-mobile__item" href={i.href} onClick={this.handleToggle} >
            <img
              alt={i.label}
              className="menu-mobile__icon"
              src={i.icon}
              title={this.state.isOpen ? null : i.label} />
            <span className="menu-mobile__item-label" >{i.label}</span>
          </a>
        )
      }
      return (
        <div className="menu-mobile__note" key={idx} >
          <Link className="menu-mobile__item" to={i.href} onClick={this.handleToggle} >
            <img
              alt={i.label}
              className="menu-mobile__icon"
              src={i.icon}
              title={this.state.isOpen ? null : i.label} />
            <span className="menu-mobile__item-label" style={{ color: '#fff', marginLeft: -14 }}>{i.label}</span>
          </Link>
          {i.submenu && <ul style={{ marginLeft: 24 }}>
            {i.submenu.map((item, index) => <li key={index}>
              <Link to={item.href} style={{ color: '#fff' }} onClick={() => this.setState({ isOpen: false })} >
                {item.label}
              </Link>
            </li>
            )}
          </ul>}
        </div>
      )
    })
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    return (
      <div
        className={`menu-mobile ${
          this.state.isOpen ? "menu-mobile--open" : "menu-mobile--close"
        }`}
      >
        <div className="menu-mobile__search-wrapper">
          <div
            style={{ height: 50, paddingTop: 7, marginBottom: -7 }}
            onMouseLeave={() => this.setState({ isOpen: false })}
          >
            <a onClick={this.handleToggle}>
              <Icon
                name="bars"
                className="menu-mobile__toggle"
                onClick={this.handleToggle}
              />
            </a>
          </div>

          {/* <h5 style={{ color: "#FFF", fontWeight: 700 }}>
            {ClientUtils.getHeader(window.location.hash)}
          </h5> */}
           <img
            src="/img/uiupdate/wgrlogomodernICONallwhite.svg"
            className="global-menu-desktop__logo"
            className="mobile-logo"
          /> 
          <GlobalMenuWalletSection> </GlobalMenuWalletSection>
        </div>
        <div
          className="menu-mobile__item-wrapper"
          onMouseEnter={() => this.setState({ isOpen: true })}
          onMouseLeave={() => this.setState({ isOpen: false })}
        >
          {this.getLinks()}
        </div>
      </div>
    );
  }
}
