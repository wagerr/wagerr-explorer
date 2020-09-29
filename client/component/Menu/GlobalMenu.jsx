
import Component from 'core/Component';
import React from 'react';
import { withRouter } from 'react-router';
import GlobalMenuDesktop from './GlobalMenuDesktop';
import GlobalMenuMobile from './GlobalMenuMobile';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { globalMenuData } from './globalMenuData'

class GlobalMenu extends Component {
  render() {
    const { t } = this.props;
    const menuData = globalMenuData(t);
    return (
      <div className="global-menu-wrapper">
        <GlobalMenuMobile links={menuData} onSearch={ this.props.onSearch } />
        <GlobalMenuDesktop links={ menuData } location={ this.props.location } handleSearch={this.props.handleSearch} />
      </div>
    )
  }
}

export default compose(
  translate('GlobalMenu'),
  withRouter
)(GlobalMenu);

