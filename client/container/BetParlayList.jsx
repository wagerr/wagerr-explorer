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

const convertToAmericanOdds = (odds) => {
  
  odds = parseFloat(odds);
  let ret = parseInt((odds - 1) * 100);
  
  if (odds < 2)
    ret = Math.round((-100) / (odds - 1));
  
  if (odds == 0) ret = 0;

  if (ret > 0)  ret = `+${ret}`  
  
  return ret;
}

class BetParlayList extends Component {
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
      toggleSwitch: localStorage.getItem('toggleCompletedAndOpen') != undefined? localStorage.getItem('toggleCompletedAndOpen') == 'true' : true,          
      toggleSwitchOdds: localStorage.getItem('toggleOddsFee') != undefined? localStorage.getItem('toggleOddsFee') == 'true' : false,      
      toggleSwitchOddsStyle: localStorage.getItem('toggleOddsStyle') != undefined? localStorage.getItem('toggleOddsStyle') == 'true' : false,
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

      this.debounce = setTimeout(() => {
        getMethod(params)
          .then(({ data, pages }) => {
            console.log(data, pages);
            if (this.debounce) {              
              data.map(item => {
                console.log(item);
                let totalBet = item.betValue;
                let totalMint = 0;
                if (item.completed){
                  totalMint = item.payout;
                }
                item.totalBet = item.totalBet;
                item.totalBet = item.totalMint;
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

  handleToggleChange = (toggleSwitch) => {
    localStorage.setItem('toggleCompletedAndOpen', toggleSwitch);
    this.setState({ toggleSwitch }, this.props.history.push('/betparlays'));         
  }

  handleToggleChangeOdds = (toggleSwitchOdds) => {
    localStorage.setItem('toggleOddsFee', toggleSwitchOdds);
    this.setState({ toggleSwitchOdds });    
  }

  handleToggleChangeOddsStyle = (toggleSwitchOddsStyle) => {
    localStorage.setItem('toggleOddsStyle', toggleSwitchOddsStyle);
    this.setState({ toggleSwitchOddsStyle });    
  }

  render () {
    const { props } = this;

    const { t } = props;
    const cols = [
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
      
    
    if (!!this.state.error) {
      return this.renderError(this.state.error)
    } else if (this.state.loading) {
      return this.renderLoading()
    }
    const selectOptions = PAGINATION_PAGE_SIZE    

    const select = (
      <Select
        onChange={value => this.handleSize(value)}
        selectedValue={this.state.size}
        options={selectOptions} />
    )

    return (
      <div>
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
          {/* <div class="col-4" style={{textAlign:'center'}}>
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
          </div> */}
        </div>
        
        <HorizontalRule
          select={select}          
          title={t('Parlay Bets')}/>
        {this.state.parlaybets.length == 0  &&  this.renderError('No search results found within provided filters') } 
        {this.state.parlaybets.length > 0  &&  
        <Table
          className={'table--for-parlaybets'}
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
            const supplyChange = numeral(bet.totalMint - bet.totalBet).format('0,0.00');
            return {              
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
              supplyChange: <span className={`badge badge-${bet.totalMint - bet.totalBet < 0 ? 'danger' : 'success'}`}>
                {supplyChange}
              </span>,
              betAmount: <span className={`badge badge-danger`}>{numeral(betAmount).format('0,0.00')}</span>,
              betStatus: <span style={{fontWeight:'bold'}}>{betStatus}</span>,
              seeDetail: <Link to={`/tx/${encodeURIComponent(bet.txId)}`}>{t('seeDetail')}</Link>
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
  getParlayBetsInfo: query => Actions.getParlayBetsInfo(query)
})

export default compose(
  connect(null, mapDispatch),
  translate('BetParlayList'),
)(BetParlayList);
