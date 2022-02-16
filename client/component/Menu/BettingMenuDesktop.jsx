
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { generateBettingMenu } from './bettingMenuData'

import { Link } from 'react-router-dom';

class BettingMenuDesktop extends Component {
  static propTypes = {
    events: PropTypes.array,
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: true,
      sports: []
    }
  }

  getLinks = () => {
    const { props } = this;

    return generateBettingMenu(this.props.events).map((i, idx) => {
      const isActive = props.location.pathname.includes(i.href);
      const isDisabled = !(i.count > 0);
      return isDisabled ? (
        <div className="betting-menu">
          <img
            alt={i.href}
            className="betting-menu-desktop__item-icon"
            src={`/img/uiupdate/betting_${i.href}_${
              isActive ? "red" : "white"
            }.png`}
            title={this.state.isOpen ? null : i.label}
          />
          <div className="menu-betting-label flex-1">{i.label}</div>
          <div className="menu-betting-label ft-12">
            {i.count > 0 && "(" + i.count + ")"}
          </div>
        </div>
      ) : (
        <Link
          key={idx}
          to={"/betting/" + i.href}
          className={`betting-menu ${isActive && "betting-menu--active"}`}
        >
          <img
            alt={i.href}
            className="betting-menu-desktop__item-icon"
            src={`/img/uiupdate/betting_${i.href}_${
              isActive ? "red" : "white"
            }.png`}
            title={this.state.isOpen ? null : i.label}
          />
          <div className="menu-betting-label flex-1">{i.label}</div>
          <div className="menu-betting-label ft-12">
            {i.count > 0 && "(" + i.count + ")"}
          </div>
        </Link>
      );
    }
    )
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    return (
      <div className={`menu-desktop p-0 ${this.state.isOpen ? 'menu-desktop--open' : 'menu-desktop--close'}`}>
        <p className="menu-desktop__title">FILTER BY SPORT</p>
        {this.getLinks()}
      </div>
    )
  }
}

const mapState = state => ({
  events: state.events
});

export default compose(
  translate('menu'),
  connect(mapState)
)(BettingMenuDesktop);