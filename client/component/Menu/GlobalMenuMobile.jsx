
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';
import SearchBar from '../SearchBar';

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

    return props.links.map((i, idx) => {
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
        <div className="menu-mobile__note">
          <Link key={idx} className="menu-mobile__item" to={i.href} onClick={this.handleToggle} >
            <img
              alt={i.label}
              className="menu-mobile__icon"
              src={i.icon}
              title={this.state.isOpen ? null : i.label} />
            <span className="menu-mobile__item-label" style={{ color: '#fff', marginLeft: -14 }}>{i.label}</span>
          </Link>
          {i.submenu && <ul style={{ marginLeft: 24 }}>
            {i.submenu.map((item, index) => <li key={index}><Link to={item.href} style={{ color: '#fff' }}>{item.label}</Link></li>)}
          </ul>}
        </div>
      )
    })
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    return (
      <div className={`menu-mobile ${this.state.isOpen ? 'menu-mobile--open' : 'menu-mobile--close'}`}>
        <div className="menu-mobile__search-wrapper">
          {/* <SearchBar
            className="search--mobile mr-3"
            onSearch={ this.props.onSearch }
            placeholder="Search Blockchain" /> */}
          <a onClick={this.handleToggle} >
            <Icon name="bars" className="menu-mobile__toggle" onClick={this.handleToggle} />
          </a>
          <img src="/img/uiupdate/logo.png" class="global-menu-desktop__logo" className='mobile-logo'/>
          <div className="global-menu-desktop_wallet_setion">
            <div className="global-menu-desktop_wallet_connection">
              <span className="global-menu-desktop_wallet_balance">0 WGR</span>
              <div className="desktop_wallet_connection_status">
                <div className="wallet_connection_status_mark"></div>
                <span className="wallet_connection_status_text">Wallet Connected</span>
              </div>
            </div>
          </div>
          
        </div>
        <div className="menu-mobile__item-wrapper" >
          {this.getLinks()}
        </div>
      </div>
    )
  }
}
