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
import queryString from 'query-string'
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from './CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import CardBigTable from "../component/Card/CardBigTable";
import ExplorerOverviewMenu from "../component/Menu/ExplorerOverviewMenu";
import GlobalSwitch from "../component/Menu/GlobalSwitch";
import Utils from '../core/utils'
import ClientUtils from '../component/utils/utils';
import { UncontrolledTooltip } from 'reactstrap';

const convertToAmericanOdds = (odds) => {

  odds = parseFloat(odds);
  let ret = parseInt((odds - 1) * 100);

  if (odds < 2)
    ret = Math.round((-100) / (odds - 1));

  if (odds == 0) ret = 0;

  if (ret > 0) ret = `+${ret}`

  return ret;
}

class BetParlays extends Component {
  static propTypes = {
    getParlayBetsInfo: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    const { t } = props;

    this.debounce = null
    this.state = {
      error: null,
      loading: true,
      parlaybets: [],
      pages: 0,
      page: 1,
      size: 50,
      filterBy: 'All',
      search: '',
      toggleSwitch: props.toggleSwitch,
    }

    this.props.history.listen((location, action) => {
      let page = location.pathname.split('/betparlays/')[1];
      if (typeof page == 'undefined') page = 1;
      setTimeout(this.updatePage(page));
    });
  };

  componentDidMount() {
    const values = queryString.parse(this.props.location.search); //this.props.match ? this.props.match.params : '';    
    const search = values.search ? values.search : '';

    let page = this.props.match.params.page;
    if (typeof page == 'undefined') page = 1;

    this.setState({ search, page }, this.getParlayBetsInfo)
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.toggleSwitch !== this.props.toggleSwitch) {
      this.getParlayBetsInfo();
    }
  };

  updatePage = (page) => {
    this.setState({ page: parseInt(page) }, this.getParlayBetsInfo);
  }

  componentWillReceiveProps(nextProps) {
    const nextvalues = queryString.parse(nextProps.location.search);
    const nextsearch = nextvalues.search ? nextvalues.search : '';
    if (nextsearch !== this.state.search) {
      this.setState({ search: nextsearch }, this.getParlayBetsInfo);
    }
  }

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce)
      this.debounce = null
    }
  };

  getParlayBetsInfo = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce)
      }

      let getMethod = this.props.getParlayBetsInfo;
      const params = {
        limit: this.state.size,
        skip: (this.state.page - 1) * this.state.size,
        opened_or_completed: !this.props.toggleSwitch
      };

      if (this.state.search) {
        getMethod = this.props.getParlayBetsInfo;
        params.search = this.state.search;
      }

      this.debounce = setTimeout(() => {
        getMethod(params)
          .then(({ data, pages }) => {
            if (this.debounce) {
              data.map(item => {
                let totalBet = item.betValue;
                let totalMint = 0;
                item.supplyChange = 0;
                if (item.completed) {
                  totalMint = item.payout;
                }
                if (item.betResultType == 'lose') {
                  item.supplyChange = -totalBet;
                } else if (item.betResultType == 'refund') {
                  item.supplyChange = 0;
                } else {
                  item.supplyChange = (totalMint - totalBet);  
                }
              })
              this.setState({ parlaybets: data, pages, loading: false })
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

      this.getParlayBetsInfo();
    }
  };

  handleChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  }

  handlePage = page => {
    this.props.history.push('/betparlays/' + page)
  }

  handleSize = size => this.setState({ size, page: 1 }, () => {
    this.getParlayBetsInfo()
  });

  handleParlayBetSearch = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();

      const term = ev.target.value.trim();
      ev.target.value = '';

      if (!!term) {
        this.props.onParlaySearch(term);
      }
    }
  };
  shortendMarket(market) {
    if(!market) return null;
    return market.replace("Spreads","SPD").replace("Money Line","ML").replace("Total","TL").replace('Win','')
  }

  render() {
    const { props } = this;
    const { t } = props;
    const { toggleSwitch, handleToggleChange } = props;
    const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;
    const { width } = this.state;

    let cols = [
      { key: 'betTime', title: t('Bet Time') },
      { key: 'txId', title: t('TxId') },
      { key: 'leg1', title: t('Leg1') },
      { key: 'leg2', title: t('Leg2') },
      { key: 'leg3', title: t('Leg3') },
      { key: 'leg4', title: t('Leg4') },
      { key: 'leg5', title: t('Leg5') },
      { key: 'supplyChange', title: t('Supply Change') },
      { key: 'betAmount', title: t('Bet Amount') },
      { key: 'betStatus', title: t('Bet Status') },
      { key: 'effectiveOdds', title: t('Total Parlay Odds') }
    ];

    
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
              <span>Parlay Betting</span>
            </div>
          </div>
          <div className="content__wrapper">
            <CoinSummary
              onRemove={this.props.handleRemove}
              onSearch={this.props.handleSearch}
              searches={this.props.searches}
              onlyBet={true}
              isParlay={true}
            />
            <div className="animated fadeInUp m-t-20 m-h-20 m--b-25">
              <div className="search__card flex-center">
                <img src={'/img/uiupdate/search.png'} alt={'search'} />
              </div>
              <input
                className="search__input search__input__icon"
                placeholder={'Find parlay bet by tx id'}
                onKeyPress={this.handleParlayBetSearch}
              />
            </div>
            <div>
              <HorizontalRule
                // select={select}                                
                title={'PARLAY BETS'}
              />
              {this.state.parlaybets.length == 0 && this.renderError('No search results found within provided filters')}

              <div style={{ width: Utils.tableWidth(width) }}>
                <div className="w3-tables__title">
                  <div>PARLAY BETS </div>
                  <div className="d-flex flex-row align-items-center">
                    <span className='ft-12 mr-2'>Completed:</span>
                    <Switch
                      checked={toggleSwitch}
                      onChange={handleToggleChange}
                      onColor="#86d3ff"
                      onHandleColor="#2693e6"
                      handleDiameter={18}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={15}
                      width={30}
                      className="react-switch mr-3"
                      id="material-switch"
                    />
                    {select}
                  </div>
                </div>
                {this.state.parlaybets.length > 0 &&
                  <CardBigTable
                    className={'table-responsive table--for-betevents'}
                    black={true}
                    cols={cols}
                    data={this.state.parlaybets.map((bet) => {
                      const betAmount = bet.betValue;
                      const betTime = moment(bet.createdAt).utc().local().format('YYYY-MM-DD HH:mm:ss');
                      const betTxId = bet.txId.substr(0, 5) + '...';
                      let betStatus = bet.betResultType;
                      if (bet.completed == false) {
                        betStatus = "Pending"
                      } else {
                        betStatus = "Completed"
                      }
                      const legs = [];
                      let effectiveOdds = 1;
                      for (let j = 0; j < 5; j++) {
                        if (bet.legs[j] !== undefined) {
                          legs[j] = bet.legs[j];
                          effectiveOdds = effectiveOdds * (toggleSwitchOdds == true ?  ClientUtils.getEffectiveodds(ClientUtils.getOddFromLeg(bet.legs[j])):ClientUtils.getOddFromLeg(bet.legs[j]))
                        } else {
                          legs[j] = '';
                        }
                      }
                      const supplyChange = numeral(bet.supplyChange).format('0,0.00');

                      return {
                        ...bet,
                        betTime: betTime,
                        txId: (
                          <Link to={`/tx/${encodeURIComponent(bet.txId)}`}>
                            {betTxId}
                          </Link>
                        ),
                        leg1: <span  className={`badge badge-${legs[0].resultType == 'lose' ? 'danger' : legs[0].resultType == 'pending' ? 'info' : legs[0].resultType == 'win' ? 'success' : 'warning'}`} id={ "_" + legs[0]._id}>
                          {legs[0].resultType ? <span> {legs[0].resultType} <hr style={{backgroundColor: 'white'}}/>  {legs[0].eventId.toString()}  <br/> { this.shortendMarket(legs[0].market)} </span>: null}
                          <UncontrolledTooltip placement="right" target={"_" + legs[0]._id} autohide={false}>
                          <Link to={`/bet/event/${legs[0].eventId}`} >
                            {legs[0].league}
                            <br/>
                            {legs[0].homeTeam + " vs " + legs[0].awayTeam}
                            <br/>
                           </Link>
                          </UncontrolledTooltip> 
                         </span>,
                        leg2: <span className={`badge badge-${legs[1].resultType == 'lose' ? 'danger' : legs[1].resultType == 'pending' ? 'info' : legs[1].resultType == 'win' ? 'success' : 'warning'}`} id={ "_" + legs[1]._id}>
                          {legs[1].resultType ? <span> {legs[1].resultType} <hr style={{backgroundColor: 'white'}}/>  {legs[1].eventId.toString()}  <br/> { this.shortendMarket(legs[1].market)} </span>: null}
                          <UncontrolledTooltip placement="right" target={"_" + legs[1]._id} autohide={false}>
                          <Link to={`/bet/event/${legs[1].eventId}`} >
                          {legs[1].league}
                            <br/>
                            {legs[1].homeTeam + " vs " + legs[1].awayTeam}
                            <br/>
                           </Link>
                          </UncontrolledTooltip> 
                          </span>,
                        leg3: <span className={`badge badge-${legs[2].resultType == 'lose' ? 'danger' : legs[2].resultType == 'pending' ? 'info' : legs[2].resultType == 'win' ? 'success' : 'warning'}`} id={ "_" + legs[2]._id}>
                          {legs[2].resultType ? <span> {legs[2].resultType} <hr style={{backgroundColor: 'white'}}/>  {legs[2].eventId.toString()}  <br/> { this.shortendMarket(legs[2].market)} </span>: null}
                          <UncontrolledTooltip placement="right" target={"_" + legs[2]._id} autohide={false}>
                          <Link to={`/bet/event/${legs[2].eventId}`} >
                          {legs[2].league}
                            <br/>
                            {legs[2].homeTeam + " vs " + legs[2].awayTeam}
                            <br/>
                           </Link>
                          </UncontrolledTooltip> 
                          </span>,
                        leg4: <span className={`badge badge-${legs[3].resultType == 'lose' ? 'danger' : legs[3].resultType == 'pending' ? 'info' : legs[3].resultType == 'win' ? 'success' : 'warning'}`} id={ "_" + legs[3]._id}>
                          {legs[3].resultType ? <span> {legs[3].resultType} <hr style={{backgroundColor: 'white'}}/>  {legs[3].eventId.toString()}  <br/> { this.shortendMarket(legs[3].market)} </span>: null}
                          <UncontrolledTooltip placement="right" target={"_" + legs[3]._id} autohide={false}>
                          <Link to={`/bet/event/${legs[3].eventId}`} >
                          {legs[3].league}
                            <br/>
                            {legs[3].homeTeam + " vs " + legs[3].awayTeam}
                            <br/>
                          </Link>
                          </UncontrolledTooltip> 
                          </span>,
                        leg5: <span className={`badge badge-${legs[4].resultType == 'lose' ? 'danger' : legs[4].resultType == 'pending' ? 'info' : legs[4].resultType == 'win' ? 'success' : 'warning'}`} id={ "_" + legs[4]._id}>
                          {legs[4].resultType ? <span> {legs[4].resultType} <hr style={{backgroundColor: 'white'}}/>  {legs[4].eventId.toString()}  <br/> { this.shortendMarket(legs[4].market)} </span>: null}
                          <UncontrolledTooltip placement="right" target={"_" + legs[4]._id} autohide={false}>
                          <Link to={`/bet/event/${legs[4].eventId}`} >
                          {legs[4].league}
                            <br/>
                            {legs[4].homeTeam + " vs " + legs[4].awayTeam}
                            <br/>
                          </Link>
                          </UncontrolledTooltip> 
                          </span>,
                        supplyChange: <span className={`badge badge-${bet.supplyChange < 0 ? 'danger' : 'success'}`}>
                          {supplyChange}
                        </span>,
                        betAmount: <span className={`badge badge-danger`}>{numeral(betAmount).format('0,0.00')}</span>,
                        betStatus: <span style={{ fontWeight: 'bold' }}>{betStatus}</span>,
                        effectiveOdds: <span style={{ fontWeight: 'bold' }}>{ClientUtils.convertToOdds(effectiveOdds,toggleSwitchOddsStyle,toggleSwitchOdds,true)}</span>
                      }
                    })}
                  />
                }
              </div>

              {this.state.pages > 0 && <Pagination
                current={this.state.page}
                className="float-right"
                onPage={this.handlePage}
                total={this.state.pages} />}
              <div className="clearfix" />
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getParlayBetsInfo: query => Actions.getParlayBetsInfo(query)
})

export default compose(
  connect(null, mapDispatch),
  translate('BetParlays'),
)(BetParlays);