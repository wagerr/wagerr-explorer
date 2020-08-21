
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';

export default class BettingMenuDesktop extends Component {
  static propTypes = {
    links: PropTypes.array
  };

  static defaultProps = {
    links: []
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    }
  }

  getLinks = () => {
    const { props, state } = this;

    return demo_sports.map((i, idx) => {
      const isActive = props.location.pathname.includes(i.href);
      // const iconSource = i.icon.split('.svg')[0] + '_white.svg';
      return (
        <Link
          key={idx}
          to={'/betting/' + i.href}
          className={`betting-menu ${isActive && 'betting-menu--active'}`}
        >
          <img
            alt={i.href}
            className="betting-menu-desktop__item-icon"
            src={`/img/uiupdate/betting_${i.href}_${isActive?'red':'white'}.png`}
            title={this.state.isOpen ? null : i.label} />
          <div className="menu-betting-label flex-1" >{i.label}</div>
          <div className="menu-betting-label ft-12" >{i.count > 0 && "(" + i.count + ")"}</div>
        </Link>
      )
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

const demo_sports = [
  { id: 1, label: 'All Events', count: 80, href: 'allevent'},
  { id: 2, label: 'Soccer', count: 62, href: 'soccor'},
  { id: 3, label: 'Esports', count: 0, href: 'esport'},
  { id: 4, label: 'Baseball', count: 0, href: 'baseball'},
  { id: 5, label: 'Basketball', count: 4, href: 'basketball'},
  { id: 6, label: 'Football', count: 2, href: 'football'},
  { id: 7, label: 'Hockey', count: 9, href: 'hockey'},
  { id: 8, label: 'Aussie Rules', count: 0, href: 'aussie_rules'},
  { id: 9, label: 'Cricket', count: 0, href: 'cricket'},
  { id: 10, label: 'MMA', count: 0, href: 'mma'},
  { id: 11, label: 'Rugby League', count: 0, href: 'rugby_league'},
  { id: 12, label: 'Rugby Union', count: 3, href: 'rugby_union'},

]