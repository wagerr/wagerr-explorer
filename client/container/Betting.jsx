
import Component from '../core/Component';
import React from 'react';
import Card from '../component/Card';
import BettingMenu from '../component/Menu/BettingMenu';
import CardBettingTable from '../component/Card/CardBettingTable';

export default class Betting extends Component {
  state = {
    connected: false
  }
  render() {
    return (
      <div className='content'>
        <BettingMenu onSearch={this.props.handleSearch} />
        <div className="content__wrapper_total m-20">
          <div className="row">
            <div className="col-lg-9 col-md-12">
              <div className="bet-search">
                <div>Showing 80 events 1</div>
                <input placeholder={'Search...'} />
              </div>
              <CardBettingTable />
              <CardBettingTable />
              <CardBettingTable />
              <CardBettingTable />
            </div>
            <div className="col-lg-3 col-md-12">
              <div className='bet-black-card'>
                <div className='bet-black-card__title'>BET SLIP</div>
                <div className='bet-black-card__body'>
                  <div>Your bet slip is empty.</div>
                  <div className='mt-12'>Please make one or more selections in order to place bets.</div>
                </div>
              </div>
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
