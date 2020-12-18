
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import {generateBettingMenu}  from './bettingMenuData'
import { Link } from 'react-router-dom';

class BettingMobileMenu extends Component {
  static propTypes = {
    events: PropTypes.array,
  };
  
  constructor(props) {
    super(props);

    this.state = {
      sports: []
    }
  }

  render() {
    return (
      <div className='menu-explorer'>
        {
          generateBettingMenu(this.props.events).map((i, index) =>
            <div
              className='menu-explorer__item'
              key={index}
            >
              <img src={`/img/uiupdate/betting_${i.href}_${this.props.location.pathname.includes(i.href) ? 'red' : 'white'}.png`} />
              <Link to={'/betting/' + i.href} style={{ color: this.props.location.pathname.includes(i.href) ? '#B50102' : '#FFF' }}>{i.label}</Link>
            </div>)
        }
      </div>
    )
  }
}

const mapState = state => ({
  events: state.events
});

export default compose(
  translate('menu'),
  connect(mapState),
  withRouter
)(BettingMobileMenu);

