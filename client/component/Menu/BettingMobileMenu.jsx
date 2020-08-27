
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
              <img src={`/img/uiupdate/betting_${i.href}_${this.props.location.pathname.includes(i.href) ? 'red' : 'white'}.png`} />
              <Link to={'/betting/' + i.href} style={{ color: this.props.location.pathname.includes(i.href) ? '#B50102' : '#FFF' }}>{i.label}</Link>
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

