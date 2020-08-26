
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { bettingMenuData } from './bettingMenuData'
import { Link } from 'react-router-dom';

class BettingMobileMenu extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired
  };

  render() {
    const { t } = this.props;
    const menuData = bettingMenuData(t)
    return (
      <div className='menu-explorer'>
        {
          menuData.map((i, index) =>
            <div
              className='menu-explorer__item' 
              key={index}
            >
              <img src={'/img/uiupdate/' + i.icon} />
              <div style={{ color: '#fff'}}>{i.label}</div>
            </div>)
        }
      </div>
    )
  }
}

export default compose(
  translate('menu'),
  withRouter
)(BettingMobileMenu);

