
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { genMenuData } from './explorerMenuData'
import { Link } from 'react-router-dom';

class ExplorerOverviewMenu extends Component {
  render() {
    const { t } = this.props;
    const { pathname } = this.props.location;
    const menuData = genMenuData(t)
    return (
      <div className='menu-explorer'>
        {
          menuData.map((i, index) =>
            <div
              className='menu-explorer__item'
              key={index}
            >
              <img src={i.icon.split('.svg')[0] + '_white.svg'} />
              <Link to={i.href} style={{ color: pathname.includes(i.href) ? (index === 0 && pathname.length > 10 ? '#FFF' : '#B50102') : '#fff' }}>{i.label}</Link>
            </div>)
        }
      </div>
    )
  }
}

export default compose(
  translate('menu'),
  withRouter
)(ExplorerOverviewMenu);

