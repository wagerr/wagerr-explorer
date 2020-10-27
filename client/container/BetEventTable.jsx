import React, { Component } from 'react';
import sortBy from 'lodash/sortBy';
import numeral from 'numeral';
import { date24Format } from '../../lib/date';
import Table from '../component/Table';
import { Link } from 'react-router-dom';

// actions
import PropTypes from 'prop-types';
import Actions, { getBetEventInfo, getBetTotals } from '../core/Actions';
import { compose } from 'redux';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import CardBigTable from "../component/Card/CardBigTable";

Number.prototype.toFixedNoRounding = function(n) {
  const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
  const a = this.toString().match(reg)[0];
  const dot = a.indexOf(".");
  if (dot === -1) { // integer, insert decimal dot and pad up zeros
      return a + "." + "0".repeat(n);
  }
  const b = n - (a.length - dot) + 1;
  return b > 0 ? (a + "0".repeat(b)) : a;
}

const convertToOdds = (odds, is_American, is_Decimal) => {
  let ret = odds;
  if (is_American){
    odds = parseFloat(odds);
    ret = parseInt((odds - 1) * 100);

    if (odds < 2)
      ret = Math.round((-100) / (odds - 1));

    if (odds == 0) ret = 0;
  }

  if (is_Decimal){
    ret = ret == 0 ? ret : (1 + (ret - 1) * 0.94).toFixedNoRounding(2);
  }
  
  if (ret > 0 && is_American) ret = `+${ret}`
  return ret;
}

class BetEventTable extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    getBetEventInfo: PropTypes.func.isRequired,
    getBetActions: PropTypes.func.isRequired,
    getBetTotals: PropTypes.func.isRequired,
    getBetspreads: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      eventId: '',
      eventInfo: [],
      betActions: [],
      loading: true,
      error: null,
      MoneyLine: [],
      Totals: [],
      Spreads: [],
    }
  };

  componentDidMount() {
    if (this.props.match.params.eventId !== this.state.eventId){
      //console.log('componentDidMount - BetEventTable', this.props.match.params.eventId);
      this.setState({
        eventId: this.props.match.params.eventId,
      }, this.RefreshData(3));  
    }
  };

  RefreshData = (flag = 1) => {
    //this.getBetData(flag);
    this.sortBetData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { params: { eventId } } = this.props.match
    if (prevProps.match.eventId === eventId) return;
    if (prevState.eventId !== eventId) {
      //console.log('componentDidUpdate - BetEventTable', eventId);
      this.setState({
        eventId: this.props.match.params.eventId,
      },this.RefreshData(2));      
    }
  };

  sortBetData = () => {
    // Money Line Data
    const MoneyLineBetData = this.props.data.betActions;
    let MoneyLine = [];
    let Totals = [];
    let Spreads = [];
    MoneyLineBetData.forEach((action) => {
      if (action.betChoose.includes('Money Line')) {
        MoneyLine.push(action);
      } else if (action.betChoose.includes('Totals')) {
        Totals.push(action);
      } else if (action.betChoose.includes('Spreads')) {
        Spreads.push(action);
      };
      this.setState({
        MoneyLine,
        Totals,
        Spreads,
      });      
    });    
  };

  getBetData = (flag) => {
    this.setState({loading: true}, () => {
      //console.log('getBetData', this.state.eventId, flag);
      Promise.all([
        this.props.getBetEventInfo(this.state.eventId),
        this.props.getBetActions(this.state.eventId),
        this.props.getBetTotals(this.state.eventId),
        this.props.getBetspreads(this.state.eventId),
      ]).then((res) => {
        sortBy(res[0].events,['blockHeight']).forEach(event =>{
          res[1].actions.filter(action => { return event.blockHeight < action.blockHeight}).forEach(
            action => {
              if (action.betChoose.includes('Home')) {
                action.odds = action.homeOdds / 10000
              } else if (action.betChoose.includes('Away')) {
                action.odds = action.awayOdds / 10000
              } else {
                action.odds = action.drawOdds / 10000
              }
            });
          this.setState({
            eventInfo: res[0], // 7 days at 5 min = 2016 coins
            betActions: res[1].actions,
            betTotals: res[2].results,
            betSpreads: res[3].results,
            opObject: res[2].results.opObject,
            loading: false,
          });
        });
    })
    .catch((err) => console.log('BetEventTable.jsx', err))
  })};


  render() {
    const { t } = this.props.data;
    const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;

    console.log('toggleSwitchOddsStyle, toggleSwitchOdds', toggleSwitchOddsStyle, toggleSwitchOdds);
    const topOneCols = [
      {key: 'createdAt', title: t('time')},
      {key: 'homeOdds', title: t('homeOdds')},
      {key: 'drawOdds', title: t('drawOdds')},
      {key: 'awayOdds', title: t('awayOdds')},
      {key: 'txId', title: t('txId')},
    ]

    const topTwoCols = [
      {key: 'createdAt', title: t('time')},
      {key: 'homeOdds', title: t('homeOdds')},
      {key: 'spread', title: 'spread'},
      {key: 'awayOdds', title: t('awayOdds')},
      {key: 'txId', title: t('txId')},
    ]

    const topThreeCols = [
      {key: 'createdAt', title: t('time')},
      {key: 'overOdds', title: 'over odds'},
      {key: 'overUnder', title: 'o/u'},
      {key: 'underOdds', title: 'under odds'},
      {key: 'txId', title: t('txId')},
    ]

    const bottomOneCols = [
      {key: 'createdAt', title: t('time')},
      {key: 'bet', title: t('bet')},
      {key: 'odds', title: t('odds')},
      {key: 'value', title: t('value')},
      {key: 'txId', title: t('txId')},
    ]

    const bottomTwoCols = [
      {key: 'createdAt', title: t('time')},
      {key: 'bet', title: t('bet')},
      {key: 'spread', title: 'spread'},
      {key: 'odds', title: t('odds')},
      {key: 'value', title: t('value')},
      {key: 'txId', title: t('txId')},
    ]

    const bottomThreeCols = [
      {key: 'createdAt', title: t('time')},
      {key: 'bet', title: t('bet')},
      {key: 'overUnder', title: 'o/u'},
      {key: 'odds', title: t('odds')},
      {key: 'value', title: t('value')},
      {key: 'txId', title: t('txId')},
    ]

    const displayNum = (num, divider) => {
      const value = num > 0 ? `+${num / divider}` : `${num / divider}`;
      
      return value;
    };

    return (
      <div className="col-sm-12 col-md-12">
      {
        this.props.data.activeTab == 1 &&
        <div>
          <CardBigTable
            cols={topOneCols}
            data={sortBy(this.props.data.eventInfo.events.map((event) => {              
              let homeOdds =  event.homeOdds / 10000
              let drawOdds = event.drawOdds / 10000
              let awayOdds = event.awayOdds / 10000

              homeOdds = convertToOdds(homeOdds, toggleSwitchOddsStyle, toggleSwitchOdds);
              drawOdds = convertToOdds(drawOdds, toggleSwitchOddsStyle, toggleSwitchOdds);
              awayOdds = convertToOdds(awayOdds, toggleSwitchOddsStyle, toggleSwitchOdds);
              
              return {
                ...event,
                createdAt: date24Format(event.createdAt),
                homeOdds: homeOdds,
                drawOdds: drawOdds,
                awayOdds: awayOdds,
                txId: (
                  <Link to={`/tx/${ event.txId }`}>{event.txId}</Link>
                )
              }
            }), ['createdAt'])}
          />
          <CardBigTable
            cols={bottomOneCols}
            data={sortBy(this.state.MoneyLine.map((action) => {
              let Odds = action.odds
              Odds = convertToOdds(Odds, toggleSwitchOddsStyle, toggleSwitchOdds);

              return {
                ...action,
                createdAt: date24Format(action.createdAt),
                bet: action.betChoose.replace('Money Line - ', ''),
                odds: Odds,
                value: action.betValue
                  ? (<span
                    className="badge badge-danger">-{numeral(action.betValue).format('0,0.00000000')} WGR</span>) : 'd',
                txId: (
                  <Link to={`/tx/${ action.txId }`}>{action.txId}</Link>
                )
              }
            }), ['createdAt'])}
          />
      </div>
      }
      {
        this.props.data.activeTab == 2 &&
        <div>
            <CardBigTable
              cols={topTwoCols}
              data={sortBy(this.props.data.betSpreads.map((action) => {

                let homeOdds =  action.homeOdds / 10000                
                let awayOdds = action.awayOdds / 10000

                homeOdds = convertToOdds(homeOdds, toggleSwitchOddsStyle, toggleSwitchOdds);                
                awayOdds = convertToOdds(awayOdds, toggleSwitchOddsStyle, toggleSwitchOdds);

                return {
                  ...action,
                  createdAt: date24Format(action.createdAt),
                  homeOdds: homeOdds,
                  spread: `${displayNum(action.homePoints, 10)}/${displayNum(action.awayPoints, 10)}`,
                  awayOdds: awayOdds,
                  txId: (
                    <Link to={`/tx/${ action.txId }`}>{action.txId}</Link>
                  )
                }
              }), ['createdAt'])}
            />
            <CardBigTable
              cols={bottomTwoCols}
              data={sortBy(this.state.Spreads.map((action) => {
                const betChoose = action.betChoose.replace('Spreads - ', '');
                const spreadNum = Math.abs(parseInt(action.spreadAwayPoints, 10)) / 10;
                let Odds = betChoose == 'Away' ? action.spreadAwayOdds / 10000 : action.spreadHomeOdds / 10000
                Odds = convertToOdds(Odds, toggleSwitchOddsStyle, toggleSwitchOdds);                                

                return {
                  ...action,
                  createdAt: date24Format(action.createdAt),
                  bet: betChoose, // `${action.homeOdds / 10000}/${action.awayOdds / 10000}`,
                  spread: betChoose == 'Away' ? displayNum(action.spreadAwayPoints, 10) : displayNum(action.spreadHomePoints, 10),
                  odds: Odds,
                  value: action.betValue
                    ? (<span
                      className="badge badge-danger">-{numeral(action.betValue).format('0,0.00000000')} WGR</span>) : '',
                  txId: (
                    <Link to={`/tx/${ action.txId }`}>{action.txId}</Link>
                  )
                }
              }), ['createdAt'])}
            />
        </div>
      }
      {
        this.props.data.activeTab == 3 &&
        <div>
          <CardBigTable
            cols={topThreeCols}
            data={sortBy(this.props.data.betTotals.map((action) => {
              let overOdds =  action.overOdds / 10000                
              let underOdds = action.underOdds / 10000

              underOdds = convertToOdds(underOdds, toggleSwitchOddsStyle, toggleSwitchOdds);
              overOdds = convertToOdds(overOdds, toggleSwitchOddsStyle, toggleSwitchOdds);
              
              return {
                ...action,
                createdAt: date24Format(action.createdAt),
                overOdds: overOdds,
                overUnder: action.points / 10,
                underOdds: underOdds,
                txId: (
                  <Link to={`/tx/${ action.txId }`}>{action.txId}</Link>
                )
              }
            }), ['createdAt'])}
          /> 
          <CardBigTable
            cols={bottomThreeCols}
            data={sortBy(this.state.Totals.map((action) => {
              let Odds = action.betChoose.includes('Over') ? action.overOdds / 10000 : action.underOdds / 10000
              Odds = convertToOdds(Odds, toggleSwitchOddsStyle, toggleSwitchOdds);
              return {
                ...action,
                createdAt: date24Format(action.createdAt),
                bet: action.betChoose.replace('Money Line - ', ''),
                // overUnder: ((action.homeOdds / action.awayOdds + action.homeOdds) * 100).toFixed(1),
                overUnder: (action.points / 10).toFixed(1),
                odds: Odds,
                value: action.betValue
                  ? (<span className="badge badge-danger">-{numeral(action.betValue).format('0,0.00000000')} WGR</span>) : '',
                txId: (
                  <Link to={`/tx/${ action.txId }`}>{action.txId}</Link>
                )
              }
            }), ['createdAt'])}
          />
      </div>
      }
      </div>
    );
  }
}

const mapDispatch = dispatch => ({
  getBetEventInfo: query => Actions.getBetEventInfo(query),
  getBetActions: query => Actions.getBetActions(query),
  getBetTotals: query => Actions.getBetTotals(query),
  getBetspreads: query => Actions.getBetspreads(query),
});

// export default BetEventTable;

export default compose(
  translate('betEvent'),
  connect(null, mapDispatch),
)(BetEventTable)
