
import Actions from './core/Actions';
import Component from './core/Component';
import { connect } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { isAddress, isBlock, isTX } from '../lib/blockchain';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
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
import BetParlays from './container/BetParlays';

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
// import NewBetEventList from './container/NewBetEventList';
import NewBetEvent from './container/NewBetEvent';
import NewBetParlay from './container/NewBetParlay';

import ExplorerMenu from './component/Menu/ExplorerMenu';
import GlobalSwitch from './component/Menu/GlobalSwitch';
import Popup from 'react-popup';

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
      toggleSwitch: localStorage.getItem('toggleCompletedAndOpen') != undefined ? localStorage.getItem('toggleCompletedAndOpen') == 'true' : false,
      toggleSwitchOdds: localStorage.getItem('toggleOddsFee') != undefined ? localStorage.getItem('toggleOddsFee') == 'true' : false,
      toggleSwitchOddsStyle: localStorage.getItem('toggleOddsStyle') != undefined ? localStorage.getItem('toggleOddsStyle') == 'true' : false,
 
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

  handleParlaySearch = (term) => {
    if (term == '') document.location.href = `/#/betparlays`
    else document.location.href = `/#/betparlays?search=${term}`
  }

  handleToggleChange = (toggleSwitch) => {
    console.log('toggleSwitch', toggleSwitch);
    localStorage.setItem('toggleCompletedAndOpen', toggleSwitch);
    this.setState({toggleSwitch});
  }

  handleToggleChangeOdds = (toggleSwitchOdds) => {
    localStorage.setItem('toggleOddsFee', toggleSwitchOdds);
    this.setState({toggleSwitchOdds});
  }

  handleToggleChangeOddsStyle = (toggleSwitchOddsStyle) => {
    localStorage.setItem('toggleOddsStyle', toggleSwitchOddsStyle);
    this.setState({toggleSwitchOddsStyle});
  }

  render() {
    if (this.state.init) {
      return (
        <Loading />
      );
    }

    const { toggleSwitch, toggleSwitchOdds, toggleSwitchOddsStyle } = this.state;

    return (
      <HashRouter>
        <div className="page-wrapper">
          <Popup />
          <GlobalMenu handleSearch={this.handleSearch}/>   
          <GlobalSwitch 
              toggleSwitch={toggleSwitch}
              toggleSwitchOdds={toggleSwitchOdds}
              toggleSwitchOddsStyle={toggleSwitchOddsStyle}
              handleToggleChange={this.handleToggleChange}
              handleToggleChangeOdds={this.handleToggleChangeOdds}
              handleToggleChangeOddsStyle={this.handleToggleChangeOddsStyle}
          />
          <Switch>
            <Route exact path="/" render={(props) => <Overview {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/movement" render={(props) => <Movement {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/movement/:page" render={(props) => <Movement {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/address/:hash" render={(props) => <Address {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/api" render={(props) => <API {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/block/:hash" render={(props) => <Block {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/coin" render={(props) => <CoinInfo {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/faq" render={(props) => <FAQ {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/governance" render={(props) => <Governance {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/masternode" render={(props) => <Masternode {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/masternode/:page" render={(props) => <Masternode {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            
            <Route exact path="/betevents" render={(props) => <BetEventList {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} handleToggleChange={this.handleToggleChange} toggleSwitch={toggleSwitch} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle}/>} />
            <Route exact path="/betparlays" render={(props) => <BetParlays {...props} onParlaySearch={this.handleParlaySearch} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleToggleChange={this.handleToggleChange} handleEventSearch={this.handleEventSearch} toggleSwitch={toggleSwitch} />} />
            <Route exact path="/betevents/:page" render={(props) => <BetEventList {...props} handleToggleChange={this.handleToggleChange} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} toggleSwitch={toggleSwitch} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle}/>} />
            <Route exact path="/betparlays/:page" render={(props) => <BetParlays {...props} handleToggleChange={this.handleToggleChange} onParlaySearch={this.handleParlaySearch}  handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} toggleSwitch={toggleSwitch} />} />
            <Route exact path="/bet/event/:eventId" render={(props) => <NewBetEvent {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle} />} />
            <Route exact path="/lottos" render={(props) => <LottoList {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/peer" render={(props) => <Peer {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/statistics" render={(props) => <Statistics {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/tx/:hash" render={(props) => <TX {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle}/>} />
            <Route exact path="/lotto/event/:eventId" render={(props) => <LottoEvent {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />

            <Route exact path="/bethistory" render={(props) => <Bethistory {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/lottos" render={(props) => <Lottos {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/help" render={(props) => <Help {...props} handleSearch={this.handleSearch} handleRemove={this.handleRemove} searches={this.state.searches.reverse()} handleEventSearch={this.handleEventSearch} />} />
            <Route exact path="/betting" render={(props) => <Betting {...props} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle}/>}  />
            <Route exact path="/betting/:id" render={(props) => <Betting {...props} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle}/>} />

            <Route component={Error404} />

          </Switch>
        </div>       
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
