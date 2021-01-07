
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import CardBigTable from "../component/Card/CardBigTable";
class Peer extends Component {
  static propTypes = {
    getPeers: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'ip', title: 'Address' },
        { key: 'ver', title: 'Protocol' },
        { key: 'subver', title: 'Sub-version' },
        { key: 'country', title: 'Country' },
      ],
      loading: true,
      peers: []
    };
  };

  componentDidMount() {
    this.props
      .getPeers()
      .then(peers => this.setState({ peers, loading: false }))
      .catch(error => this.setState({ error, loading: false }));
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }

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
              <span>Connections</span>
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
              <HorizontalRule title="Connections" />
              <CardBigTable
                cols={this.state.cols}
                data={this.state.peers.map(peer => ({
                  ...peer,
                  ip: (
                    <div>
                      <img
                        className="flag"
                        src={`/img/flag/${peer.countryCode ? peer.countryCode.toLowerCase() : 'xx'}.gif`}
                        title={peer.country} /> { peer.ip}
                    </div>
                  )
                }))} />
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getPeers: () => Actions.getPeers()
});

export default connect(null, mapDispatch)(Peer);
