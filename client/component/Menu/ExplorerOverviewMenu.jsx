
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { genMenuData } from './explorerMenuData'
import { Link } from 'react-router-dom';

class ExplorerOverviewMenu extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired
  };

  render() {
    const { t } = this.props;
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
              <Link to={i.href} style={{ color: '#fff'}}>{i.label}</Link>
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

