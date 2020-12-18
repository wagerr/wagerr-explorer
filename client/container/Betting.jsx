import Component from '../core/Component';
import { compose } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import React from 'react';
import Card from '../component/Card';
import BettingMenuDesktop from '../component/Menu/BettingMenuDesktop';
import BettingMobileMenu from '../component/Menu/BettingMobileMenu';
import BettingSlips from './BettingSlips';
import EventList from './EventList';
import PubSub from 'pubsub-js';

class Betting extends Component {
 
  constructor(props) {
    super(props)
    this.state = { 
      sport:"allevent"
    }
    
  }

  componentWillReceiveProps(props) {
    const sport = props.match.params.id;
    PubSub.publish('sport-changed',sport)
  }
  
  render() {
    
    return (
      <div className='content'>
        <div className="menu-wrapper">
          <BettingMenuDesktop location={this.props.location} />
        </div>
        <div className="content__wrapper_total">
          <BettingMobileMenu />
          <div className="row m-20">
            <div className="col-lg-9 col-md-12">
              <EventList toggleSwitchOddsStyle={this.props.toggleSwitchOddsStyle} toggleSwitchOdds={this.props.toggleSwitchOdds} />
            </div>
            <div className="col-lg-3 col-md-12">
              <BettingSlips />
            </div>
          </div>
        </div>
        {this.state.connected && <div className='m-20'>
          <h2>Betting</h2>
          <Card>
            <div className='m-20 flex-center'>
              <div>Looks like Wallet Not Connected</div>
              <div>Go to <span className='link'>Help</span>  to install wallet</div>
            </div>
          </Card>
        </div>}
      </div>
    );
  };
}

export default compose(
  translate('betting'),
)(Betting);