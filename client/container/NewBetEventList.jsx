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

class NewBetEventList extends Component {
  render() {
    return (
      <div className="content content-top" id="body-content">
        <ExplorerMenu onSearch={this.props.handleSearch} />
        <div className="content__wrapper_total">
          <div className="content_search_wrapper">
            <div className="content_page_title">
              <span>Betting Events</span>
            </div>
          </div>

          <div className="content__wrapper">
            <div>
              <div className='card'>
                <div className="card__title direction-row">
                  <div>Bet Status </div>
                </div>

                <div className="card__body">
                  <div className="card__border bg-eee">
                    <span className="flex-center flex-1 font-14">TOTAL BET</span>
                    <span className="flex-center flex-1 font-14 card__borders">TOTAL MINT</span>
                    <span className="flex-center flex-1 font-14">NET SUPPLY CHANGE</span>
                  </div>
                  <div className="card__border">
                    <span className="flex-center flex-1 font-14">323534543534543554435 WGR</span>
                    <span className="flex-center flex-1 font-14 card__borders">323534543534543554435 WGR</span>
                    <span className="flex-center flex-1 font-14">323534543534543554435 WGR</span>
                  </div>
                </div>
              </div>

              <div className="m-t-50">
                <div className="search__card flex-center">
                  <img src={'/img/uiupdate/search.png'} alt={'search'} />
                </div>
                <input
                  className="search__input search__input__icon"
                  placeholder={'Find team names, event ids, sports or tournaments.'}
                />
              </div>

              <div className="animated fadeInUp w3-tables w3-responsive">
                <div className="w3-tables__title">
                  <div>BET EVENTS </div>
                  <div className="align-row-center">
                    <span className="mr-10">Net Odds:</span>
                    <Switch />
                    <div className="w3-tables__title__dropdown">
                      <div>10</div>
                      <div className="flex-column">
                        <img src={'/img/uiupdate/up.png'} alt={'up'} />
                        <img src={'/img/uiupdate/down.png'} alt={'down'} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="slick-slider">
                  <div className="slick-slider__leftarrow">
                    <img src={'/img/uiupdate/left_arrow.png'} alt={'left arrow'} />
                  </div>
                  <div className="slick-slider__row">
                    {
                      demo_sports.map((item, index) =>
                        <center className={`slick-slider__item ${demo_sports.length - 1 == index && 'border-none'}`} key={index}>
                          <img src={'/img/uiupdate/' + item.icon} alt={'sports'} />
                          <p>{item.label}</p>
                        </center>)
                    }
                  </div>
                  <div className="slick-slider__rightarrow">
                    <img src={'/img/uiupdate/right_arrow.png'} alt={'right arrow'} />
                  </div>
                </div>

                <div className="slick-slider" style={{ border: 'none' }}>
                  <div className="slick-slider__leftarrow">
                    <img src={'/img/uiupdate/left_arrow.png'} alt={'left arrow'} />
                  </div>
                  <div className="slick-slider__row">
                    {
                      demo_cups.map((item, index) =>
                        <center className={`slick-slider__cup ${demo_cups.length - 1 == index && 'border-none'}`} key={index}>
                          <img src={'/img/uiupdate/' + item.icon} alt={'sports'} />
                          <div>{item.label}</div>
                        </center>)
                    }
                  </div>
                  <div className="slick-slider__rightarrow">
                    <img src={'/img/uiupdate/right_arrow.png'} alt={'right arrow'} />
                  </div>
                </div>

                <table className="w3-table-all">
                  <tbody>
                    <tr className="table-header-long">
                      <th className="text-center">START TIME</th>
                      <th className="text-center">ID</th>
                      <th className="text-center">NAME</th>
                      <th className="text-center">HOME</th>
                      <th className="text-center">AWAY</th>
                      <th className="text-center">1</th>
                      <th className="text-center">X</th>
                      <th className="text-center">2</th>
                      <th className="text-center">SUPPLY CHANGE</th>
                      <th className="text-center">BET AMOUNT</th>
                      <th className="text-center">BET STATUS</th>
                      <th className="text-center">DETAIL</th>
                    </tr>
                    {
                      MOKEDATA.map((item, index) =>

                        <tr key={index} className="table-hover">
                          <td>{item.time}</td>
                          <td>{item.id}</td>
                          <td className="text-center">{item.name}</td>
                          <td className="text-right">{item.home}</td>
                          <td className="text-right">{item.away}</td>
                          <td>{item.one}</td>
                          <td>{item.x}</td>
                          <td>{item.two}</td>
                          <td>
                            <center>
                              <div className="td-supply">
                                {item.supply_change}
                              </div>
                            </center>
                          </td>
                          <td>
                            <center>
                              <div className="td-supply-plus">
                                {item.bet_amount}
                              </div>
                            </center>
                          </td>
                          <td className="text-center">{item.bet_status}</td>
                          <td className="text-center">
                            <Link to={'/explorer/betevents/:' + item.id}>{item.detail}</Link></td>
                        </tr>
                      )}
                  </tbody>
                </table>
                <div className="table-footer">
                  <div>{'<<'}</div>
                  <div>{'<'}</div>
                  <div>{1}</div>
                  <div>{2}</div>
                  <div>{3}</div>
                  <div>{4}</div>
                  <div>{5}</div>
                  <div>{6}</div>
                  <div>{7}</div>
                  <div>{8}</div>
                  <div>{9}</div>
                  <div>{10}</div>
                  <div>{11}</div>
                  <div>{12}</div>
                  <div>{13}</div>
                  <div>{14}</div>
                  <div>{15}</div>
                  <div>{16}</div>
                  <div>{17}</div>
                  <div>{18}</div>
                  <div>{19}</div>
                  <div>{20}</div>
                  <div>{21}</div>
                  <div>{22}</div>
                  <div>{23}</div>
                  <div>{24}</div>
                  <div>{25}</div>
                  <div>{26}</div>
                  <div>{27}</div>
                  <div>{28}</div>
                  <div>{29}</div>
                  <div>{30}</div>
                  <div>{31}</div>
                  <div>{32}</div>
                  <div>{33}</div>
                  <div>{34}</div>
                  <div>{35}</div>
                  <div>{36}</div>
                  <div>{'>'}</div>
                  <div>{'>>'}</div>
                </div>
              </div>

            </div>
            <Footer />
          </div>
        </div>
      </div>
    );

  };
}

const mapDispatch = dispatch => ({
  getBetEventsInfo: query => Actions.getBetEventsInfo(query),
  getBetQuery: query => Actions.getBetQuery(query),
})

export default compose(
  connect(null, mapDispatch),
  translate('betEventList'),
)(NewBetEventList);

const MOKEDATA = [
  { time: '2019-12-12 12:12:12 UTC', id: 4022, name: 'UEFA Europa League', home: 'Rangers', away: 'Young Boys FC', one: 1.9, x: 4.14, two: 4.43, supply_change: '0.00', bet_amount: '0.00', bet_status: 'OPEN', detail: 'See Detail' },
  { time: '2019-12-12 12:12:12 UTC', id: 4021, name: 'UEFA Europa League', home: 'Rangers', away: 'Young Boys FC', one: 1.9, x: 4.14, two: 4.43, supply_change: '0.00', bet_amount: '0.00', bet_status: 'OPEN', detail: 'See Detail' },
  { time: '2019-12-12 12:12:12 UTC', id: 4020, name: 'UEFA Europa League', home: 'Rangers', away: 'Young Boys FC', one: 1.9, x: 4.14, two: 4.43, supply_change: '0.00', bet_amount: '-25.00', bet_status: 'OPEN', detail: 'See Detail' },
  { time: '2019-12-12 12:12:12 UTC', id: 4019, name: 'UEFA Europa League', home: 'Borussia Monchenglabach', away: 'Istanbul Basaksehir', one: 1.9, x: 4.14, two: 4.43, supply_change: '+15.00', bet_amount: '0.00', bet_status: 'OPEN', detail: 'See Detail' },
  { time: '2019-12-12 12:12:12 UTC', id: 4018, name: 'UEFA Europa League', home: 'Rangers', away: 'Young Boys FC', one: 1.9, x: 4.14, two: 4.43, supply_change: '0.00', bet_amount: '0.00', bet_status: 'OPEN', detail: 'See Detail' },
  { time: '2019-12-12 12:12:12 UTC', id: 4017, name: 'UEFA Europa League', home: 'Rangers', away: 'Young Boys FC', one: 1.9, x: 4.14, two: 4.43, supply_change: '0.00', bet_amount: '0.00', bet_status: 'OPEN', detail: 'See Detail' },
  { time: '2019-12-12 12:12:12 UTC', id: 4016, name: 'UEFA Europa League', home: 'Rangers', away: 'Young Boys FC', one: 1.9, x: 4.14, two: 4.43, supply_change: '0.00', bet_amount: '0.00', bet_status: 'OPEN', detail: 'See Detail' },
]

const demo_sports = [
  { id: 1, label: 'All Events', icon: 'explorer_sportbetting_allevent.png' },
  { id: 2, label: 'Soccer', icon: 'explorer_sportbetting_soccor.png' },
  { id: 3, label: 'Esports', icon: 'explorer_sportbetting_esport.png' },
  { id: 4, label: 'Baseball', icon: 'explorer_sportbetting_baseball.png' },
  { id: 5, label: 'Basketball', icon: 'explorer_sportbetting_basketball.png' },
  { id: 6, label: 'Football', icon: 'explorer_sportbetting_soccor.png' },
  { id: 7, label: 'Hockey', icon: 'explorer_sportbetting_hockey.png' },
  { id: 8, label: 'Aussie Rules', icon: 'explorer_sportbetting_aussie_rules.png' },
  { id: 9, label: 'Cricket', icon: 'explorer_sportbetting_cricket.png' },
  { id: 10, label: 'MMA', icon: 'explorer_sportbetting_mma.png' },
  { id: 11, label: 'Rugby League', icon: 'explorer_sportbetting_rugby_league.png' },
  { id: 12, label: 'Rugby Union', icon: 'explorer_sportbetting_rugby_league.png' },
]

const demo_cups = [
  { id: 1, label: 'UEFA European Cup', icon: 'explorer_sportbetting_UEFA_cup.png' },
  { id: 2, label: 'FIFA World Cup', icon: 'explorer_sportbetting_womanworld_cup.png' },
  { id: 3, label: 'CAF Africa Cup', icon: 'explorer_sportbetting_world_cup.png' },
  { id: 4, label: 'Champions League', icon: 'explorer_sportbetting_africa_cup.png' },
  { id: 5, label: 'FIFA Women\'s World Cup', icon: 'explorer_sportbetting_champions_league.png' },
  { id: 6, label: 'UEFA European Cup', icon: 'explorer_sportbetting_UEFA_cup.png' },
  { id: 7, label: 'FIFA World Cup', icon: 'explorer_sportbetting_womanworld_cup.png' },
  { id: 8, label: 'CAF Africa Cup', icon: 'explorer_sportbetting_world_cup.png' },
]