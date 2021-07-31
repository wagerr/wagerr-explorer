
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import React from 'react';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import SearchBar from '../component/SearchBar';
import Select from '../component/Select'
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import BettingStat from './BettingStat'
import MasternodeStat from './MasternodeStat'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText } from 'reactstrap';
import classnames from 'classnames';
import { CHART_TIME_FRAME } from '../constants'


class Statistics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'betting',
      filter:'90d'

    }
  }

  handleFilterBy = value => this.setState({ filter: value });

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
          <div className='card'>
              <div className='card__body'>
            <Nav tabs>
              <NavItem >
                <NavLink
                  className={classnames({ 'tab':true, 'tab__active': this.state.activeTab === 'betting'})}
                  onClick={() => { this.setState({ activeTab: 'betting' }) }}>
                  Betting Stats
          </NavLink>
              </NavItem>
              <NavItem >
                <NavLink
                className={classnames({'tab':true ,'tab__active': this.state.activeTab === 'masternode'})}
                  onClick={() => { this.setState({ activeTab: 'masternode' }) }}>
                  Masternode Stats
          </NavLink>
              </NavItem>
              <NavItem className="ml-auto mr-2 mt-2 mb-2">
              
                <Select
                  onChange={value => this.handleFilterBy(value)}
                  selectedValue={this.state.filter}
                  options={CHART_TIME_FRAME} 
                  />

              
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}  className="pr-3 pl-3">
              <TabPane tabId="betting">
                <BettingStat timeFrame={this.state.filter}/>
              </TabPane>
              <TabPane tabId="masternode">
                <MasternodeStat timeFrame={this.state.filter}/>
              </TabPane>
              <TabPane tabId="network">

              </TabPane>
            </TabContent>
            </div>
            </div>
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
