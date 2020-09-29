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

const convertToAmericanOdds = (odds) => {
  
    odds = parseFloat(odds);
    let ret = parseInt((odds - 1) * 100);
    
    if (odds < 2)
      ret = Math.round((-100) / (odds - 1));
    
    if (odds == 0) ret = 0;
  
    if (ret > 0)  ret = `+${ret}`  
    
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
      this.setState({ page:parseInt(page) }, this.getParlayBetsInfo);
    }
  
    componentWillReceiveProps(nextProps) {
        const nextvalues = queryString.parse(nextProps.location.search);
        const nextsearch = nextvalues.search ? nextvalues.search : '';      
        if (nextsearch !== this.state.search) {
          this.setState({ search:nextsearch }, this.getParlayBetsInfo);
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
          opened_or_completed: this.state.toggleSwitch
        };
  
        if (this.state.search) {
          getMethod = this.props.getParlayBetsInfo;
          params.search = this.state.search;
        }
        console.log('params', params);
        this.debounce = setTimeout(() => {
          getMethod(params)
            .then(({ data, pages }) => {            
              if (this.debounce) {              
                data.map(item => {                
                  let totalBet = item.betValue;
                  let totalMint = 0;
                  item.supplyChange = 0;
                  if (item.completed){
                    totalMint = item.payout;
                  }
                  if (item.betResultType == 'lose'){
                    item.supplyChange = -totalBet;  
                  } else if (item.betResultType == 'refund'){
                    item.supplyChange = 0;  
                  } else {
                    item.supplyChange = (totalMint - totalBet) * 97 / 94;    
                  }    
                  console.log('item', item);
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
      this.props.history.push('/betparlays/'+page) 
    }
  
    handleSize = size => this.setState({size, page: 1})
  
    handleParlayBetSearch = (term) => {
      this.props.onParlaySearch(term);
    }

    render() {
        const { props } = this;
        const { t } = props;
        const { toggleSwitch } = props;
        const { width } = this.state;

        let cols = [
            { key: 'betTime', title: t('BetTime') },
            { key: 'txId', title: t('TxId') },
            { key: 'leg1', title: t('Leg1') },
            { key: 'leg2', title: t('Leg2') },
            { key: 'leg3', title: t('Leg3') },
            { key: 'leg4', title: t('Leg4') },
            { key: 'leg5', title: t('Leg5') },
            { key: 'supplyChange', title: t('Supply Change') },
            { key: 'betAmount', title: t('Bet Amount') },
            { key: 'betStatus', title: t('betStatus') },
            { key: 'seeDetail', title: t('detail') },
          ];
          
        if (toggleSwitch){
            delete cols[7];      
        }    
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

                    <div className="content_search_wrapper">

                        <div className="content_page_title">
                            <span>Betting Events</span>
                        </div>
                    </div>
                    <div className="content__wrapper">
                        <CoinSummary
                            onRemove={this.props.handleRemove}
                            onSearch={this.props.handleSearch}
                            searches={this.props.searches}
                        />
                        <div>
                            <HorizontalRule
                                select={select}                                
                                title={'PARLAY BETS'}
                            />
                            {this.state.parlaybets.length == 0 && this.renderError('No search results found within provided filters')}

                            <div style={{ width: Utils.tableWidth(width) }}>
                                {this.state.parlaybets.length > 0 &&
                                    <CardBigTable
                                        className={'table-responsive table--for-betevents'}
                                        cols={cols}
                                        data={this.state.parlaybets.map((bet) => {
                                            const betAmount = bet.betValue;
                                            const betTime = moment(bet.createdAt).utc().local().format('YYYY-MM-DD HH:mm:ss');            
                                            const betTxId = bet.txId.substr(0, 5) + '...';    
                                            let betStatus = bet.betResultType;
                                            if (bet.completed == false){
                                              betStatus = "Pending"
                                            } else {
                                              betStatus = "Completed"
                                            }
                                            const legs = [];
                                            for (let j = 0; j < 5; j++){
                                              if (bet.legs[j] !== undefined){
                                                legs[j] = bet.legs[j].resultType;
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
                                                  leg1: <span className={`badge badge-${legs[0] == 'lose' ? 'danger' : legs[0] == 'pending'  ?  'info' : legs[0] == 'win' ? 'success' : 'warning'}`}>{legs[0]}</span>,
                                                  leg2: <span className={`badge badge-${legs[1] == 'lose' ? 'danger' : legs[1] == 'pending'  ?  'info' : legs[1] == 'win' ? 'success' : 'warning'}`}>{legs[1]}</span>,
                                                  leg3: <span className={`badge badge-${legs[2] == 'lose' ? 'danger' : legs[2] == 'pending'  ?  'info' : legs[2] == 'win' ? 'success' : 'warning'}`}>{legs[2]}</span>,
                                                  leg4: <span className={`badge badge-${legs[3] == 'lose' ? 'danger' : legs[3] == 'pending'  ?  'info' : legs[3] == 'win' ? 'success' : 'warning'}`}>{legs[3]}</span>,
                                                  leg5: <span className={`badge badge-${legs[4] == 'lose' ? 'danger' : legs[4] == 'pending'  ?  'info' : legs[4] == 'win' ? 'success' : 'warning'}`}>{legs[4]}</span>,
                                                  supplyChange: <span className={`badge badge-${bet.supplyChange < 0 ? 'danger' : 'success'}`}>
                                                    {supplyChange}
                                                  </span>,
                                                  betAmount: <span className={`badge badge-danger`}>{numeral(betAmount).format('0,0.00')}</span>,
                                                  betStatus: <span style={{fontWeight:'bold'}}>{betStatus}</span>,
                                                  seeDetail: <Link to={`/tx/${encodeURIComponent(bet.txId)}`}>{t('seeDetail')}</Link>
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