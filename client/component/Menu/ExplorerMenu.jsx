
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';
import ExplorerMenuDesktop from './ExplorerMenuDesktop';
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { genMenuData } from './explorerMenuData'

class ExplorerMenu extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired
  };

  render() {
    const { t } = this.props;
    const menuData = genMenuData(t)
    return (
      <div className="menu-wrapper">
        <ExplorerMenuDesktop links={ menuData } location={ this.props.location } />
      </div>
    )
  }
}

export default compose(
  translate('menu'),
  withRouter
)(ExplorerMenu);

