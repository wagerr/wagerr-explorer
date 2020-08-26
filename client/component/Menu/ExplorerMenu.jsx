
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';

import ExplorerMenuDesktop from './ExplorerMenuDesktop';
import ExplorerMenuMobile from './ExplorerMenuMobile';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import connect from 'react-redux/es/connect/connect'
import { genMenuData } from './explorerMenuData'
import { globalMenuData } from './globalMenuData'


class ExplorerMenu extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired
  };

  render() {
    const { t } = this.props;
    const menuData = genMenuData(t)
    const navData = globalMenuData(t)

    return (
      <div className="menu-wrapper">
        {/* <ExplorerMenuMobile links={navData} onSearch={ this.props.onSearch } /> */}
        <ExplorerMenuDesktop links={ menuData } location={ this.props.location } />
      </div>
    )
  }
}

export default compose(
  translate('menu'),
  withRouter
)(ExplorerMenu);

