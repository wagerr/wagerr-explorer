import Actions from '../core/Actions'
import Component from '../core/Component'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import sortBy from 'lodash/sortBy'

import HorizontalRule from '../component/HorizontalRule'
import Pagination from '../component/Pagination'
import Table from '../component/SuperTable'
import Select from '../component/Select'

import Icon from '../component/Icon';
import Switch from "react-switch";
import _ from 'lodash'

import { PAGINATION_PAGE_SIZE, FILTER_EVENTS_OPTIONS } from '../constants'
import { timeStamp24Format } from '../../lib/date'
import numeral from 'numeral'
import { compose } from 'redux'
import { translate } from 'react-i18next'

const convertToAmericanOdds = (odds) => {
  console.log('s:', odds);
  odds = parseFloat(odds);
  let ret = parseInt((odds - 1) * 100);
  console.log('ret1:', ret);
  if (odds < 2)
    ret = Math.round((-100) / (odds - 1));
  console.log('ret2:', ret);
  if (odds == 0) ret = 0;

  if (ret > 0)  ret = `+${ret}`  
  console.log('e:', ret);
  return ret;
}

class BetEventList extends Component {
  static defaultProps = {
    placeholder: 'Find team names, event ids, sports or tournaments.',
  }

  static propTypes = {
    getBetEventsInfo: PropTypes.func.isRequired,
    getBetQuery: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)
    const { t } = props;

    this.debounce = null
    this.state = {
      error: null,
      loading: true,
      events: [],
      pages: 0,
      page: 1,
      size: 50,
      filterBy: 'All',
      search: '',
      toggleSwitch: true,
      toggleSwitchOdds: false,      
      toggleSwitchOddsStyle: false,
    }
  };

  componentDidMount() {
    this.getBetEventsInfo()
  };

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce)
      this.debounce = null
    }
  };

  getBetEventsInfo = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce)
      }

      const searchValue = this.state.search;

      let getMethod = this.props.getBetEventsInfo;

      const params = {
        limit: this.state.size,
        skip: (this.state.page - 1) * this.state.size,
        opened_or_completed: this.state.toggleSwitch
      };

      if (this.state.filterBy !== 'All') {
        getMethod = this.props.getBetEventsInfo;
        params.sport = this.state.filterBy;
      }


      if (this.state.search) {
        getMethod = this.props.getBetEventsInfo;
        params.search = this.state.search;
      }

      this.debounce = setTimeout(() => {
        getMethod(params)
          .then(({ data, pages }) => {
            if (this.debounce) {              
              data.map(item => {
                let totalBet = 0;
                let totalMint = 0;
                item.actions.forEach(action => totalBet += action.betValue)
                if (item.results) {
                  item.results.forEach(result => {
                    let startIndex = 2
                    if (
                      result.payoutTx.vout[1] &&
                      result.payoutTx.vout[2] &&
                      result.payoutTx.vout[1].address === result.payoutTx.vout[2].address
                    ) {
                      startIndex = 3
                    }
                    for (let i = startIndex; i < result.payoutTx.vout.length - 1; i++) {
                      totalMint += result.payoutTx.vout[i].value
                    }
                  })
                }
                item.totalBet = totalBet
                item.totalMint = totalMint
                item.events.sort(function(a,b){
                  return b.blockHeight - a.blockHeight;
                })
              })
              this.setState({ events: data, pages, loading: false })
            }
          })
          .catch(error => {
            console.log('error', error);
            this.setState({ error, loading: false })
          })
      }, 800)
    })
  }

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();

      this.getBetEventsInfo();
    }
  };

  handleChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  }

  handleFilterBy = value => this.setState({filterBy: value}, () => {
    this.setState({
      search: '',
    }, () => {
      this.getBetEventsInfo()
    });
  });

  handlePage = page => this.setState({ page }, this.getBetEventsInfo)
  
  handleSize = size => this.setState({size, page: 1})


  TestMyFilter = (data, type) => {
    let results = [];
    if (type === 'All') {
      results = data;
    } else {
      results = data.filter((event) => {
        return event.events[0].transaction.sport === type
      });
    }
    return results;
  }

  handleToggleChange = (toggleSwitch) => {
    this.setState({ toggleSwitch }, this.getBetEventsInfo);
    console.log(toggleSwitch);
  }

  handleToggleChangeOdds = (toggleSwitchOdds) => {
    this.setState({ toggleSwitchOdds });
    console.log(toggleSwitchOdds);
  }

  handleToggleChangeOddsStyle = (toggleSwitchOddsStyle) => {
    this.setState({ toggleSwitchOddsStyle });
    console.log(toggleSwitchOddsStyle);
  }

  render () {
    const { props } = this;

    const { t } = props;
    const cols = [
      { key: 'start', title: t('startingnow') },
      { key: 'event', title: t('eventId') },
      { key: 'name', title: t('name') },
      // {key: 'round', title: t('round')},
      { key: 'homeTeam', title: t('homeTeam') },
      { key: 'awayTeam', title: t('awayTeam') },
      { key: 'homeOdds', title: '1' },
      { key: 'drawOdds', title: 'x' },
      { key: 'awayOdds', title: '2' },
      { key: 'supplyChange', title: t('supplyChange') },
      { key: 'betAmount', title: t('betAmount') },
      { key: 'betStatus', title: t('betStatus') },
      { key: 'seeDetail', title: t('detail') },
    ]
    if (!!this.state.error) {
      return this.renderError(this.state.error)
    } else if (this.state.loading) {
      return this.renderLoading()
    }
    const selectOptions = PAGINATION_PAGE_SIZE
    const selectFilterOptions = FILTER_EVENTS_OPTIONS

    const select = (
      <Select
        onChange={value => this.handleSize(value)}
        selectedValue={this.state.size}
        options={selectOptions} />
    )

    const filterSport = (
      <Select
        onChange={value => this.handleFilterBy(value)}
        selectedValue={this.state.filterBy}
        options={selectFilterOptions} />
    );

    const searchBar = (
      <div className="animated fadeIn" style={{ width: '100%' }}>
        <div className={ `search ${ props.className ? props.className : '' }` }>
          <input
            className="search__input"
            onKeyPress={ e => this.handleKeyPress(e) }
            onChange={ e => this.handleChange(e) }
            placeholder={ props.placeholder }
            value={this.state.search}
          />
          <Icon name="search" className="search__icon" />
        </div>
      </div>
    )
    ;


    return (
      <div>
        {searchBar}
        <div className="row">
          <div class="col-4">
            <div style={{alignItems:'center',marginTop:'20px'}}>
              <span>Completed / Opened</span>
            </div>
            <label htmlFor="material-switch" style={{marginTop:'10px'}}>
              <Switch
                checked={this.state.toggleSwitch}
                onChange={this.handleToggleChange}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
                id="material-switch"
            />
            </label>       
          </div>
          <div class="col-4" style={{textAlign:'center'}}>
            <div style={{alignItems:'center',marginTop:'20px'}}>
              <span>Decimal Odds/ American Odds</span>
            </div>
            <label htmlFor="material-switch1" style={{marginTop:'10px'}}>
              <Switch
                checked={this.state.toggleSwitchOddsStyle}
                onChange={this.handleToggleChangeOddsStyle}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
                id="material-switch"
            />
            </label>       
          </div>
          <div class="col-4" style={{textAlign:'right'}}>
            <div style={{alignItems:'center',marginTop:'20px'}}>
              <span>On Chain Odds / Effective Odds</span>
            </div>
            <label htmlFor="material-switch2" style={{marginTop:'10px', alignItems:'center'}}>
              <Switch
                checked={this.state.toggleSwitchOdds}
                onChange={this.handleToggleChangeOdds}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
                id="material-switch"
            />
            </label>       
          </div>
        </div>
        
        <HorizontalRule
          select={select}
          filterSport={filterSport}
          title={t('title')}/>
        {this.state.events.length == 0  &&  this.renderError('No search results found within provided filters') } 
        {this.state.events.length > 0  &&  
        <Table
          className={'table-responsive table--for-betevents'}
          cols={cols}
          data={this.state.events.map((event) => {
            const betAmount = event.actions.reduce((acc, action) => { 
              return acc + action.betValue
            }, 0.0
            )

            let betStatus = t('open')
            const eventTime = parseInt(event.events[0].timeStamp);
            const eventData = event.events[0];

            if (event.results.length > 1) {
              for (const result of event.results) {
                if (result.result.indexOf('REFUND') !== -1) {
                  betStatus = <span className={`badge badge-info`}>{result.result}</span>
                }
              }
            }
            else if (event.results.length > 0) {
              for (const result of event.results) {
                const awayVsHome = result.transaction ? (result.transaction.awayScore - result.transaction.homeScore) : 0;
                let outcome;
                if (awayVsHome > 0) {
                  // outcome = 'Away Win';
                  outcome = eventData.awayTeam;
                }

                if (awayVsHome < 0) {
                  // outcome = 'Home Win';
                  outcome = eventData.homeTeam;
                }

                if (awayVsHome === 0) {
                  outcome = 'Draw';
                }

                if (result.result && result.result.includes('Refund')) {
                  outcome = result.result;
                }

                if (outcome) {
                  betStatus = <span className={`badge badge-info`}>{outcome}</span>
                }
              }
            } else {
              if ((eventTime - (20 * 60 * 1000)) < Date.now()) {
                betStatus = t('waitForStart')
                if (eventTime < Date.now()) {
                  betStatus = t('started')
                  if (event.results.length === 0) {
                    betStatus = <span className={`badge badge-warning`}>{t('waitingForOracle')}</span>
                  }
                  
                }
              }
            }
            
            let homeOdds = (event.events[0].homeOdds / 10000)
            let drawOdds = (event.events[0].drawOdds / 10000)
            let awayOdds = (event.events[0].awayOdds / 10000)

            let orighomeOdds = (event.events[0].homeOdds / 10000)
            let origdrawOdds = (event.events[0].drawOdds / 10000)
            let origawayOdds = (event.events[0].awayOdds / 10000)



            if (this.state.toggleSwitchOdds){
              homeOdds = homeOdds == 0 ? homeOdds : (1 + (homeOdds - 1) * 0.94).toFixed(2);              
              drawOdds = drawOdds == 0 ? drawOdds : (1 + (drawOdds - 1) * 0.94).toFixed(2);              
              awayOdds = awayOdds == 0 ? awayOdds : (1 + (awayOdds - 1) * 0.94).toFixed(2);              
            }
                        
            if (this.state.toggleSwitchOddsStyle){
              console.log('----', homeOdds, awayOdds, drawOdds)
              homeOdds = convertToAmericanOdds(homeOdds);
              drawOdds = convertToAmericanOdds(drawOdds);
              awayOdds = convertToAmericanOdds(awayOdds);
              console.log(homeOdds, awayOdds, drawOdds)
            }

            if (event.events.length > 1) {
              let lastHomeOdds = (event.events[1].homeOdds / 10000)
              let lastDrawOdds = (event.events[1].drawOdds / 10000)
              let lastAwayOdds = (event.events[1].awayOdds / 10000)
              if (orighomeOdds > lastHomeOdds) {
                homeOdds = homeOdds + ' ↑'
              } else if (homeOdds < lastHomeOdds) {
                homeOdds = homeOdds + ' ↓'
              }
              if (origdrawOdds > lastDrawOdds) {
                drawOdds = drawOdds + ' ↑'
              } else if (drawOdds < lastDrawOdds) {
                drawOdds = drawOdds + ' ↓'
              }
              if (origawayOdds > lastAwayOdds) {
                awayOdds = awayOdds + ' ↑'
              } else if (awayOdds < lastAwayOdds) {
                awayOdds = awayOdds + ' ↓'
              }
            }
            return {
              ...event,
              start: <Link to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>
                {timeStamp24Format(event.events[0].timeStamp)} </Link>
              ,
              event: (
                <Link to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>
                  {event.events[0].eventId}
                </Link>
              ),
              name: <Link to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>
                {event.events[0].league}</Link>,
              round: <Link to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>
              </Link>,
              homeTeam: <Link to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>{event.events[0].homeTeam}</Link>,
              awayTeam: <Link to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>{event.events[0].awayTeam}</Link>,
              homeOdds: homeOdds,
              drawOdds: drawOdds,
              awayOdds: awayOdds,
              supplyChange: <span className={`badge badge-${event.totalMint - event.totalBet < 0 ? 'danger' : 'success'}`}>
                {numeral(event.totalMint - event.totalBet).format('0,0.00')}
              </span>,
              betAmount: <span className={`badge badge-danger`}>{numeral(betAmount).format('0,0.00')}</span>,
              betStatus: betStatus,
              seeDetail: <Link to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>{t('seeDetail')}</Link>
            }
          })} />}
        
        {this.state.pages > 0 && <Pagination
          current={this.state.page}
          className="float-right"
          onPage={this.handlePage}
          total={this.state.pages} />}
        <div className="clearfix" />
      </div>
    )
  };
}

const mapDispatch = dispatch => ({
  getBetEventsInfo: query => Actions.getBetEventsInfo(query),
  getBetQuery: query => Actions.getBetQuery(query),
})

export default compose(
  connect(null, mapDispatch),
  translate('betEventList'),
)(BetEventList);
