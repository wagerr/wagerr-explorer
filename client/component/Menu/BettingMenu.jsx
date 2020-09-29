
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';

import BettingMenuDesktop from './BettingMenuDesktop';
import BettingMenuMobile from './BettingMenuMobile';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { genMenuData } from './explorerMenuData'

class BettingMenu extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired
  };

  render() {
    const { t } = this.props;
    const menuData = genMenuData(t)
    return (
      <div className="menu-wrapper">
        {/* <BettingMenuMobile links={menuData} onSearch={this.props.onSearch} /> */}
        <BettingMenuDesktop links={menuData} location={this.props.location} />
      </div>
    )
  }
}

export default compose(
  translate('menu'),
  withRouter
)(BettingMenu);

