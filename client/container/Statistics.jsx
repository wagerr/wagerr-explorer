
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import React from 'react';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import SearchBar from '../component/SearchBar';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import BettingStat from './BettingStat'
import MasternodeStat from './MasternodeStat'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText } from 'reactstrap';
import classnames from 'classnames';


class Statistics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'betting'

    }
  }


  render() {
    return (
      <div className="content content-top" id="body-content">

        <ExplorerMenu onSearch={this.props.handleSearch} />
        <div className="content__wrapper_total">
          <ExplorerOverviewMenu />
          <SearchBar
            className="search--mobile mr-3"
            onSearch={this.props.handleSearch}
            placeholder="Search Blockchain" />

          <div className="content_search_wrapper">
            <div className="content_page_title">
              <span>Statistics</span>
            </div>
          </div>
          <div className="content__wrapper">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === 'betting' })}
                  onClick={() => { this.setState({ activeTab: 'betting' }) }}>
                  Betting Stats
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === 'masternode' })}
                  onClick={() => { this.setState({ activeTab: 'masternode' }) }}>
                  Masternode Stats
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === 'network' })}
                  onClick={() => { this.setState({ activeTab: 'network' }) }}>
                  Network Stats
          </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="betting">
                <BettingStat />
              </TabPane>
              <TabPane tabId="masternode">
                <MasternodeStat />
              </TabPane>
              <TabPane tabId="network">

              </TabPane>
            </TabContent>
          </div>
        </div>


      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getCoins: () => Actions.getCoinsWeek(dispatch),
  getBetActions: () => Actions.getBetActionsWeek(dispatch),
  getTXs: () => Actions.getTXsWeek(dispatch),
  getBetPerWeek: () => Actions.getBetPerWeek(dispatch)
});

const mapState = state => ({
  coin: state.coin
});

export default connect(mapState, mapDispatch)(Statistics);
