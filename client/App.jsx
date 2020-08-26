
import Actions from './core/Actions';
import Component from './core/Component';
import { connect } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { isAddress, isBlock, isTX } from '../lib/blockchain';
import { Link, Route, Switch } from 'react-router-dom';
import promise from 'bluebird';
import PropTypes from 'prop-types';
import React from 'react';
import searchHistory from '../lib/searchHistory';

// Route Containers
import Address from './container/Address';
import API from './container/API';
import Block from './container/Block';
import CoinInfo from './container/CoinInfo';
import Error404 from './container/Error404';
import FAQ from './container/FAQ';
import Masternode from './container/Masternode';
import Movement from './container/Movement';
import Overview from './container/Overview';
import Peer from './container/Peer';
import Statistics from './container/Statistics';
import Top100 from './container/Top100';
import TX from './container/TX';
import BetEventList from './container/BetEventList';
import LottoList from './container/LottoList';
import LottoEvent from './container/LottoEvent';
import BetEvent from './container/BetEvent';
import Governance from './container/Governance';

// Layout
import CoinSummary from './container/CoinSummary';
import Footer from './component/Footer';
import Icon from './component/Icon';
import Loading from './component/Loading';
import GlobalMenu from './component/Menu/GlobalMenu';
import Notification from './component/Notification';
import SearchBar from './component/SearchBar';
import SearchEventBar from './component/SearchEventBar';
import Lottos from './container/Lottos';
import Bethistory from './container/Bethistory';
import Betting from './container/Betting';
import Help from './container/Help';
import NewBetEventList from './container/NewBetEventList';
import NewBetEvent from './container/NewBetEvent';
import ExplorerMenu from './component/Menu/ExplorerMenu';

class App extends Component {
  static propTypes = {
    // Dispatch
    getCoins: PropTypes.func.isRequired,
    getIsBlock: PropTypes.func.isRequired,
    getTXs: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      init: true,
      limit: 10,
      searches: [],
    };
    this.timer = { coins: null, txs: null };
  };

  componentWillMount() {
    this.setState({ searches: searchHistory.get() });
  };

  componentDidMount() {
    promise.all([
      this.props.getCoins({ limit: 12 }),
      this.props.getTXs({ limit: 10 })
    ])
      .then(() => {
        this.getCoins();
        this.getTXs();
        this.setState({ init: false });
      })
      .catch(error => this.setState({ error }, () => {
        this.getCoins();
        this.getTXs();
      }));
  };

  componentWillUnmount() {
    if (this.timer.coins) {
      clearTimeout(this.timer.coins);
    }
    if (this.timer.txs) {
      clearTimeout(this.timer.txs);
    }
    this.timer = { coins: null, txs: null };
  };

  getCoins = () => {
    if (this.timer.coins) {
      clearTimeout(this.timer.coins);
    }

    this.timer.coins = setTimeout(() => {
      this.props
        .getCoins({ limit: 12 })
        .then(this.getCoins)
        .catch(this.getCoins);
    }, 30000); // 30 seconds
  };

  getTXs = () => {
    if (this.timer.txs) {
      clearTimeout(this.timer.txs);
    }

    this.timer.txs = setTimeout(() => {
      this.props
        .getTXs({ limit: 10 })
        .then(this.getTXs)
        .catch(this.getTXs);
    }, 30000); // 30 seconds
  };

  handleRemove = (term) => {
    this.setState({ searches: searchHistory.del(term) });
  };

  isBetEventId = (s) => {
    return typeof (s) === 'string' && s.length === 4 && isNaN(s);
  };

  handleSearch = (term) => {
    // If term doesn't match then ignore.
    if (!isTX(term) && !isBlock(term) && !isAddress(term) && !this.isBetEventId(term)) {
      return;
    }

    // Add to search history using localStorage.
    this.setState({ searches: searchHistory.add(term) });

    // Setup path for search.
    let path = '/#/';
    if (isAddress(term)) {
      document.location.href = `/#/address/${term}`;
    } else if (this.isBetEventId(term)) {
      document.location.href = `/#/bet/event/${encodeURIComponent(term)}`;
    } else if (!isNaN(term)) {
      document.location.href = `/#/block/${term}`;
    } else {
      this.props
        .getIsBlock(term)
        .then((is) => {
          document.location.href = `/#/${is ? 'block' : 'tx'}/${term}`;
        });
    }
  };

  handleEventSearch = (term) => {
    if (term == '') document.location.href = `/#/betevents`
    else document.location.href = `/#/betevents?search=${term}`
  }

  render() {
    if (this.state.init) {
      return (
        <Loading />
      );
    }

    return (
      <HashRouter>
        <div className="page-wrapper">
          <GlobalMenu handleSearch={this.handleSearch}/>                   
          <Switch>
            <Route exact path="/" render={(props) => <Overview {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer" render={(props) => <Overview {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/movement" render={(props) => <Movement {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/movement/:page" render={(props) => <Movement {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/address/:hash" render={(props) => <Address {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/api" render={(props) => <API {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/block/:hash" render={(props) => <Block {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/coin" render={(props) => <CoinInfo {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/faq" render={(props) => <FAQ {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/governance" render={(props) => <Governance {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/masternode" render={(props) => <Masternode {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/masternode/:page" render={(props) => <Masternode {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            {/* <Route exact path="/explorer/betevents" render={(props) => <BetEventList {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch}/>} /> */}
            {/* <Route exact path="/explorer/betevents/:page" render={(props) => <BetEventList {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch}/>} /> */}
            <Route exact path="/explorer/lottos" render={(props) => <LottoList {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/peer" render={(props) => <Peer {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/statistics" render={(props) => <Statistics {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/tx/:hash" render={(props) => <TX {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/bet/event/:eventId" render={(props) => <BetEvent {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/lotto/event/:eventId" render={(props) => <LottoEvent {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />

            {/* --New Route added-- */}
            <Route exact path="/explorer/betevents" render={(props) => <NewBetEventList {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/explorer/betevents/:page" render={(props) => <NewBetEvent {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/bethistory" render={(props) => <Bethistory {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/lottos" render={(props) => <Lottos {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/help" render={(props) => <Help {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/allevent" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/soccor" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/esport" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/baseball" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/basketball" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/football" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/hockey" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/aussie_rules" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/cricket" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/mma" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/rugby_league" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting/rugby_union" render={(props) => <Betting {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            {/* --New Route added-- */}

            <Route component={Error404} />

          </Switch>
        </div>
        {/*<div className="page-wrapper">
          <ExplorerMenu onSearch={ this.handleSearch } />
          <div className="content" id="body-content">
            <div className="content__wrapper">              
              {<CoinSummary
                onRemove={ this.handleRemove }
                onSearch={ this.handleSearch }
                searches={ this.state.searches.reverse() } />}
              <SearchBar
                className="d-none d-md-block mb-3"
                onSearch={ this.handleSearch } />
              <SearchEventBar
                className="d-none d-md-block mb-3"
                onSearch={ this.handleEventSearch } 
              />  
              <div className="content__inner-wrapper">
                <Switch>
                  <Route exact path="/" component={ Overview } />
                  <Route exact path="/address/:hash" component={ Address } />
                  <Route exact path="/api" component={ API } />
                  <Route exact path="/block/:hash" component={ Block } />
                  <Route exact path="/coin" component={ CoinInfo } />
                  <Route exact path="/faq" component={ FAQ } />
                  <Route exact path="/governance" component={ Governance } />
                  <Route exact path="/masternode" component={ Masternode } />
                  <Route exact path="/masternode/:page" component={ Masternode } />
                  <Route exact path="/betevents" component={ BetEventList } />
                  <Route exact path="/betevents/:page" component={ BetEventList } />
                  <Route exact path="/lottos" component={ LottoList } />
                  <Route exact path="/movement" component={ Movement } />
                  <Route exact path="/movement/:page" component={ Movement } />
                  <Route exact path="/peer" component={ Peer } />
                  <Route exact path="/statistics" component={ Statistics } />
                  <Route exact path="/top" component={ Top100 } />
                  <Route exact path="/tx/:hash" component={ TX } />
                  <Route exact path="/bet/event/:eventId" component={ BetEvent } />
                  <Route exact path="/lotto/event/:eventId" component={ LottoEvent } />
                  <Route component={ Error404 } />
                </Switch>
              </div>
              <Footer />
            </div>
          </div>
        </div>*/}
      </HashRouter>
    );
  };
}

const mapDispatch = dispatch => ({
  getCoins: query => Actions.getCoinHistory(dispatch, query),
  getIsBlock: query => Actions.getIsBlock(query),
  getTXs: query => Actions.getTXLatest(dispatch, query)
});

const mapState = state => ({

});

export default connect(mapState, mapDispatch)(App);
