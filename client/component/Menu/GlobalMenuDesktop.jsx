
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';
import SearchBar from '../SearchBar';

export default class GlobalMenuDesktop extends Component {
  static propTypes = {
    links: PropTypes.array
  };

  static defaultProps = {
    links: []
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: true,
    }
  }

  getLinks = () => {
    const { props, state } = this;

    return props.links.map((i, idx) => {
      const isActive = props.location.pathname.includes(i.href === '#' ? 'help': i.href);
      const iconSource = i.icon;
      return (
        <div
          className={`global-menu-desktop__item ${isActive ? (props.location.pathname.includes('explorer') ? 'global-menu-desktop__item--is-active' : 'global-menu-desktop__item2--is-active') : ''}`}
        >
          <Link
            key={idx}
            to={i.href}
            className="w3-dropdown-hover"
          >
            <img
              alt={i.label}
              className="global-menu-desktop__item-icon "
              src={iconSource}
              title={this.state.isOpen ? null : i.label} />
            <span className="w3-button global-menu-desktop__item-label " >{i.label}</span>
            {
              i.submenu && <div className="w3-dropdown-content w3-bar-block ">
                {i.submenu.map((x, key) =>
                <Link to={x.href} key={key} >
                  <div className='global-menu-desktop__item__submenu__text'>
                    {x.label}
                  </div>
                </Link>
              )}
              </div>}
          </Link>
        </div>
      )
    })
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {

    const { pathname } = this.props.location;
    const explore_class = !pathname.includes('explorer') && 'global-menu-desktop-explore';

    return (
      <div className={pathname.includes('help') && 'h-140'}>
        <div className={`global-menu-desktop ${explore_class}`}>
          <div className="global-menu-desktop__content-wrapper">
            <div className="global-menu-desktop__header">
              <div className="global-menu-desktop_logo_section">
                <img src="/img/uiupdate/logo.png" className="global-menu-desktop__logo" />
              </div>
              <div className="global-menu-desktop_links">
                {this.getLinks()}
              </div>
              <div className="global-menu-desktop_wallet_setion">
                <div className="global-menu-desktop_wallet_connection">
                  <span className="global-menu-desktop_wallet_balance">0 WGR</span>
                  <div className="global-menu-desktop_wallet_connection_status">
                    <div className="wallet_connection_status_mark"></div>
                    <span className="wallet_connection_status_text">Wallet Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            pathname.includes('explorer') &&
            <SearchBar
              className="d-none d-md-block"
              onSearch={this.props.handleSearch}
            />}
        </div>
      </div>
    )
  }
}
