
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { date24Format } from '../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import sortBy from 'lodash/sortBy';

import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Table from '../component/Table';
import Select from '../component/Select';

import { PAGINATION_PAGE_SIZE } from '../constants';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import CardBigTable from "../component/Card/CardBigTable";
class Masternode extends Component {
  static propTypes = {
    getMNs: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.debounce = null;
    this.state = {
      error: null,
      loading: true,
      mns: [],
      pages: 0,
      page: 1,
      size: 10
    };


    this.props.history.listen((location, action) => {
      let page = location.pathname.split('/masternode/')[1];
      if (typeof page == 'undefined') page = 1;
      setTimeout(this.updatePage(page));
    });
  };

  componentDidMount() {
    let page = this.props.match.params.page;
    if (typeof page == 'undefined') page = 1;

    this.setState({ page: parseInt(page) }, this.getMNs);
  };

  updatePage = (page) => {
    this.setState({ page: parseInt(page) }, this.getMNs);
  }

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce);
      this.debounce = null;
    }
  };

  getMNs = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(() => {
        this.props
          .getMNs({
            limit: this.state.size,
            skip: (this.state.page - 1) * this.state.size
          })
          .then(({ mns, pages }) => {
            if (this.debounce) {
              this.setState({ mns, pages, loading: false });
            }
          })
          .catch(error => this.setState({ error, loading: false }));
      }, 800);
    });
  };

  handlePage = page => {
    this.props.history.push('/masternode/' + page)
  }

  handleSize = size => this.setState({ size, page: 1 }, this.getMNs);

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

    // Calculate the future so we can use it to
    // sort by lastPaid in descending order.
    const future = moment().add(2, 'years').utc().unix();

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
              <span>Masternodes</span>
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
              <HorizontalRule
                select={select}
                title="Masternodes" />
              <CardBigTable
                cols={[
                  { key: 'lastPaidAt', title: 'Last Paid', className: 'w-m-160' },
                  { key: 'active', title: 'Active', className: 'w-m-120' },
                  { key: 'addr', title: 'Address' },
                  { key: 'txHash', title: 'Collateral TX' },
                  { key: 'txOutIdx', title: 'Index' },
                  { key: 'ver', title: 'Version' },
                  { key: 'status', title: 'Status' },
                ]}
                data={sortBy(this.state.mns.map((mn) => {
                  const lastPaidAt = moment(mn.lastPaidAt).utc();
                  const isEpoch = lastPaidAt.unix() === 0;

                  return {
                    ...mn,
                    active: moment().subtract(mn.active, 'seconds').utc().fromNow(),
                    addr: (
                      <Link to={`/address/${mn.addr}`}>
                        { `${mn.addr.substr(0, 20)}...`}
                      </Link>
                    ),
                    lastPaidAt: isEpoch ? 'N/A' : date24Format(mn.lastPaidAt),
                    txHash: (
                      <Link to={`/tx/${mn.txHash}`}>
                        { `${mn.txHash.substr(0, 20)}...`}
                      </Link>
                    )
                  };
                }), ['status'])}
              />

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
  getMNs: query => Actions.getMNs(query)
});

export default connect(null, mapDispatch)(Masternode);
