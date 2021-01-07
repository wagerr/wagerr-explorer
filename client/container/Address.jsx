
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardAddress from '../component/Card/CardAddress';
import CardAddressTXs from '../component/Card/CardAddressTXs';
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
class Address extends Component {
  static propTypes = {
    getAddress: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      address: '',
      balance: 0.0,
      staked: 0.0,
      sent: 0.0,
      received: 0.0,
      error: null,
      loading: true,
      pages: 0,
      page: 1,
      size: 10,
      txs: []
    };
  };

  componentDidMount() {
    this.getAddress();
  };

  componentDidUpdate() {
    if (!!this.state.address
      && this.state.address !== this.props.match.params.hash) {
      if (!this.state.loading) {
        this.getAddress();
      }
    }
  };

  getAddress = () => {
    this.setState({ loading: true }, () => {
      const address = this.props.match.params.hash;
      this.props
        .getAddress({ address })
        .then(({ balance, sent, staked, received, txs }) => {
          this.setState({
            address,
            balance,
            sent,
            staked,
            received,
            txs,
            loading: false,
            pages: Math.ceil(txs.length / this.state.size)
          });
        })
        .catch(error => this.setState({ error, loading: false }));
    });
  };

  handlePage = page => this.setState({ page: parseInt(page, 10) });

  handleSize = size => this.setState({ size: parseInt(size, 10), page: 1 }, () => {
    this.setState({ pages: Math.ceil(this.state.txs.length / this.state.size) });
  });

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const select = (
      <Select
        onChange={value => this.handleSize(value)}
        selectedValue={this.state.size}
        options={selectOptions} />
    );

    // Setup internal pagination.
    let start = (this.state.page - 1) * this.state.size;
    let end = start + this.state.size;

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
              <HorizontalRule title="Wallet Info" />
              <CardAddress
                address={this.state.address}
                balance={this.state.balance}
                sent={this.state.sent}
                staked={this.state.staked}
                received={this.state.received}
                txs={this.state.txs}
              />
              <HorizontalRule select={select} title="Wallet Transactions" />
              <CardAddressTXs
                address={this.state.address}
                txs={this.state.txs.slice(start, end)} />
              <Pagination
                current={this.state.page}
                className="float-right"
                onPage={this.handlePage}
                total={this.state.pages} />
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
  getAddress: query => Actions.getAddress(query)
});

const mapState = state => ({

});

export default connect(mapState, mapDispatch)(Address);
