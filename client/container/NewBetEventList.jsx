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
import CardBetEvents from '../component/Card/CardBetEvents'
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu'

class NewBetEventList extends Component {
  render() {
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
                    <span className="flex-center flex-1 font-14">323534543534 WGR</span>
                    <span className="flex-center flex-1 font-14 card__borders">323534543534 WGR</span>
                    <span className="flex-center flex-1 font-14">323534543534 WGR</span>
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

              <CardBetEvents />
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