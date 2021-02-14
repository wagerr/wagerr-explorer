
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardEarnings from '../component/Card/CardEarnings';
import CardExchanges from '../component/Card/CardExchanges';
import CardLinks from '../component/Card/CardLinks';
import CardROI from '../component/Card/CardROI';
import HorizontalRule from '../component/HorizontalRule';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
class CoinInfo extends Component {
  static propTypes = {
    coin: PropTypes.object.isRequired
  };

  render() {
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
            {/* <SearchBar
              className="d-none d-md-block"
              onSearch={this.props.handleSearch} />           */}
            <div className="content_page_title">
              <span>Coin Info</span>
            </div>
          </div>
          <div className="content__wrapper">
            {/* <SearchEventBar
              className="d-none d-md-block mb-3"
              onSearch={this.props.handleEventSearch}
            /> */}
            <div>
              <HorizontalRule title="Coin Info" />
              <div className="row">
                <div className="col-md-12 col-lg-8">
                  <div>
                    <img className="img-fluid" src="/img/largelogo.svg" />
                  </div>
                  <div className="row">
                    <div className="col-sm-12 col-md-3">
                      <CardLinks />
                      <CardExchanges />
                    </div>
                    <div className="col-md-12 col-lg-4">
                  <CardROI coin={this.props.coin} />
                </div>
                  </div>
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

});

const mapState = state => ({
  coin: state.coins.length ? state.coins[0] : {},
  txs: state.txs
});

export default connect(mapState, mapDispatch)(CoinInfo);
