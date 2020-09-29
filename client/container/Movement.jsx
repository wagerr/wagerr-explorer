
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTXs from '../component/Card/CardTXs';
import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Select from '../component/Select';

import { PAGINATION_PAGE_SIZE } from '../constants';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import CardBigTable from "../component/Card/CardBigTable";
import {Link} from "react-router-dom";
import {date24Format} from "../../lib/date";
import numeral from "numeral";

class Movement extends Component {
  static propTypes = {
    getTXs: PropTypes.func.isRequired,
    setTXs: PropTypes.func.isRequired,
    tx: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.debounce = null;
    this.state = {
      error: null,
      loading: true,
      pages: 0,
      page: 1,
      size: 10,
      txs: []
    };

    this.props.history.listen((location, action) => {
      let page = location.pathname.split('/movement/')[1];
      if (typeof page == 'undefined') page = 1;
      setTimeout(this.updatePage(page));
    });
  };

  componentDidMount() {
    let page = this.props.match.params.page;
    if (typeof page == 'undefined') page = 1;

    this.setState({ page:parseInt(page) }, this.getTXs);
  };

  updatePage = (page) => {
    this.setState({ page:parseInt(page) }, this.getTXs);
  }

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce);
      this.debounce = null;
    }
  };

  getTXs = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(() => {
        this.props
          .getTXs({
            limit: this.state.size,
            skip: (this.state.page - 1) * this.state.size
          })
          .then(({ pages, txs }) => {
            if (this.debounce) {
              this.setState({ pages, txs, loading: false }, () => {
                if (txs.length
                  && this.props.tx.blockHeight < txs[0].blockHeight) {
                  this.props.setTXs(txs);
                }
              });
            }
          })
          .catch(error => this.setState({ error, loading: false }));
      }, 800);
    });
  };

  handlePage = page => {
    this.props.history.push('/movement/'+page)
  }

  handleSize = size => this.setState({ size, page: 1 }, this.getTXs);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const select = (
      <Select
        onChange={ value => this.handleSize(value) }
        selectedValue={ this.state.size }
        options={ selectOptions } />
    );
    return (
      <div className="content content-top" id="body-content">
        <ExplorerMenu onSearch={ this.props.handleSearch } />
        <div className="content__wrapper_total">
        <ExplorerOverviewMenu />

          <div className="content_search_wrapper">
            <div className="content_page_title">
              <span>Movement</span>
            </div>
          </div>
          <div className="content__wrapper">
            <CoinSummary
              onRemove={this.props.handleRemove}
              onSearch={this.props.handleSearch}
              searches={this.props.searches} />
            <div>
              <HorizontalRule
                select={ select }
                title="Movement"
              />
              <CardBigTable
                  data={ this.state.txs.map(tx => {
                    let blockValue = 0.0;
                    if (tx.vout && tx.vout.length) {
                      tx.vout.forEach(vout => blockValue += vout.value);
                    }

                    return ({
                      ...tx,
                      blockHeight: (
                          <Link to={ `/block/${ tx.blockHeight }` }>
                            { tx.blockHeight }
                          </Link>
                      ),
                      createdAt: date24Format(tx.createdAt),
                      txId: (
                          <Link to={ `/tx/${ tx.txId }` }>
                            { tx.txId }
                          </Link>
                      ),
                      vout: (
                          <span className={ `badge badge-${ blockValue < 0 ? 'danger' : 'success' }` }>
                { numeral(blockValue).format('0,0.00000000') }
              </span>
                      )
                    });
                  }) }
                  cols= {[
                    { key: 'blockHeight', title: 'Block Height', className: 'w-m-120' },
                    { key: 'txId', title: 'Transaction Hash' },
                    { key: 'vout', title: 'Amount' },
                    { key: 'createdAt', title: 'Time', className: 'w-m-160' },
                  ]}
              />
              {/*<CardTXs txs={ this.state.txs } />*/}
              <Pagination
                current={ this.state.page }
                className="float-right"
                onPage={ this.handlePage }
                total={ this.state.pages } />
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
  getTXs: query => Actions.getTXs(null, query),
  setTXs: txs => Actions.setTXs(dispatch, txs)
});

const mapState = state => ({
  tx: state.txs.length ? state.txs[0] : {}
});

export default connect(mapState, mapDispatch)(Movement);
