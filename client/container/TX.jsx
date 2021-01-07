
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTX from '../component/Card/CardTX';
import CardTXIn from '../component/Card/CardTXIn';
import CardTXOut from '../component/Card/CardTXOut';
import HorizontalRule from '../component/HorizontalRule';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchEventBar from '../component/SearchEventBar';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import Footer from '../component/Footer';
class TX extends Component {
  static propTypes = {
    getTX: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    // We get this from the store to force confirmation
    // updates when the system updates.
    tx: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
      tx: {
        blockHeight: 0,
        vin: [],
        vout: []
      }
    };

    this.props.history.listen((location, action) => {
      const { params: { hash } } = this.props.match;      
      if (!!this.state.tx.txId && hash !== this.state.tx.txId) {
        setTimeout(this.getTX());
      }
    });
  };

  componentDidMount() {    
    this.getTX();
  };

  componentDidUpdate() {
    
    // const { params: { hash } } = this.props.match;
    // console.log('componentDidUpdate', hash);
    // if (!!this.state.tx.txId && hash !== this.state.tx.txId) {
    //   setTimeout(this.getTX());
    // }
  };

  getTX() {
    this.setState({ loading: true }, () => {
      this.props
        .getTX(this.props.match.params.hash)
        .then(tx => this.setState({ tx, loading: false }))
        .catch(error => this.setState({ error, loading: false }));
    });
  };

  
  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;
    return (
      
      <div className="content content-top" id="body-content">
        <ExplorerMenu onSearch={ this.props.handleSearch } />        
        <div className="content__wrapper_total"> 
        <ExplorerOverviewMenu onSearch={ this.props.handleSearch } />          
          <div className="content_search_wrapper">                      
            <div className="content_page_title">
              <span>Transaction Info</span>
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
              <HorizontalRule title="Transaction Info" />
              <CardTX height={ this.props.tx.blockHeight } tx={ this.state.tx } />
              <div className="row">
                <div className="col">
                  <HorizontalRule title="Sending Addresses" />
                  <CardTXIn txs={ this.state.tx.vin } />
                </div>
                <div className="col">
                  <HorizontalRule title="Recipients" />
                  <CardTXOut txs={ this.state.tx.vout } toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle}/>
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
  getTX: query => Actions.getTX(query)
});

const mapState = state => ({
  tx: state.txs.length
    ? state.txs[0]
    : { blockHeight: state.coin.blocks }
});

export default connect(mapState, mapDispatch)(TX);
