
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';

import GlobalMenuDesktop from './GlobalMenuDesktop';
import ExplorerMenuMobile from './ExplorerMenuMobile';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import connect from 'react-redux/es/connect/connect'
import { globalMenuData } from './globalMenuData'

class GlobalMenu extends Component {
  render() {
    const { t } = this.props;
    const menuData = globalMenuData(t);
    return (
      <div className="global-menu-wrapper">
        <ExplorerMenuMobile links={menuData} onSearch={ this.props.onSearch } />
        <GlobalMenuDesktop links={ menuData } location={ this.props.location } handleSearch={this.props.handleSearch} />
      </div>
    )
  }
}

export default compose(
  translate('GlobalMenu'),
  withRouter
)(GlobalMenu);

