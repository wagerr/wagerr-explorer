import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { date24Format } from '../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';
import { compose } from 'redux'
import { translate } from 'react-i18next';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import CardLatestBlocks from "../component/Card/CardLatestBlocks";
import CardBigTable from "../component/Card/CardBigTable";
class Overview extends Component {
  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      cols: [
        {title: 'Height', key: 'blockHeight'},
        {title: 'Transaction Hash', key: 'txId'},
        {title: 'Value', key: 'vout'},
        'age',
        'recipients',
        {title: 'Created', key: 'createdAt'},
      ]
    };
  };

  render() {
    const { t, i18n, location } = this.props;

    // Setup the list of transactions with age since created.
    const txs = this.props.txs.map(tx => {
      const createdAt = moment(tx.createdAt).utc();
      const diffSeconds = moment().utc().diff(createdAt, 'seconds');
      let blockValue = 0.0;
      if (tx.vout && tx.vout.length) {
        tx.vout.forEach(vout => blockValue += vout.value);
      }

      return ({
        ...tx,
        age: diffSeconds < 0 ? "Just Now" : (diffSeconds < 60 ? `${ diffSeconds } seconds` : createdAt.fromNow(true)),
        blockHeight: (<Link to={ `/block/${ tx.blockHeight }` }>{ tx.blockHeight }</Link>),
        createdAt: date24Format(tx.createdAt),
        recipients: tx.vout.length,
        txId: (<Link to={ `/tx/${ tx.txId }` }>{ tx.txId }</Link>),
        vout: numeral(blockValue).format('0,0.00000000')
      });
    });

    const { pathname } = this.props.location;    

    let is_explorer = false;
    if (!pathname.includes('/bethistory') && !pathname.includes('betting') && !pathname.includes('lottos') && !pathname.includes('help'))
      is_explorer = true

    const explore_class = is_explorer? 'content-top' : '';
    console.log('content-top:', explore_class)

    return (
      <div className={`content ${explore_class}`} id="body-content">
        <ExplorerMenu onSearch={ this.props.handleSearch } />        
        <div className="content__wrapper_total">     
          <ExplorerOverviewMenu onSearch={ this.props.handleSearch }/>     
          <div className="content_search_wrapper">                      
            {/* <SearchBar
              className="d-none d-md-block"
              onSearch={this.props.handleSearch} />           */}
            <div className="content_page_title">
              <span>Overview</span>
            </div>              
          </div>
          <div className="content__wrapper">
            <CoinSummary
              onRemove={this.props.handleRemove}
              onSearch={this.props.handleSearch}
              searches={this.props.searches} />
            {/* <SearchEventBar
              className="d-none d-md-block mb-3"
              onSearch={this.props.handleEventSearch}
            /> */}
            <div>
              <HorizontalRule title={t('latestBlocks')} />
              {/*<CardLatestBlocks data={txs}/>*/}
              <CardBigTable
                data={txs}
                cols= {[
                  {title: 'Height', key: 'blockHeight'},
                  {title: 'Transaction Hash', key: 'txId', className: 'cell-ellipsis'},
                  {title: 'Value', key: 'vout'},
                  {title: 'age', key: 'age', className: 'w-m-80'},
                  {title: 'recipients', key: 'recipients'},
                  {title: 'Created', key: 'createdAt', className: 'w-m-160'},
                ]}
              />
              {/*<Table*/}
              {/*  cols={this.state.cols}*/}
              {/*  data={txs} />*/}
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({

});

const mapState = state => ({
  txs: state.txs
});

export default compose(
  translate('overview'),
  connect(mapState, mapDispatch),
)(Overview);
