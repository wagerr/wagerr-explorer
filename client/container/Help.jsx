
import Component from '../core/Component';
import React from 'react';
import Card from '../component/Card';

export default class Help extends Component {
  render() {
    return (
      <div className='m-20'>
          <h2>How to bet here</h2>
          <div className='chain-game'>
            <img src={'/img/uiupdate/quote.png'} alt={'WGR'} className='quote-img'/>
            <div className='align-center p-20'>
              <div className='chain-xs-title'>Current Jackpot</div>
              <div className='chain-text'>400 <span>  WGR</span></div>
              <div className='bg-1'>
                <div className='chain-item'>
                  <div className='chain-xs-title'>Winner's Prize</div>
                  <div className='font-17'>320</div>
                  <div className='chain-sm-title'>WGR</div>
                </div>
                <div className='chain-item-center'>
                  <div className='chain-xs-title'>Masternode Reward</div>
                  <div className='font-17'>8</div>
                  <div className='chain-sm-title'>WGR</div>
                </div>
                <div className='chain-item'>
                  <div className='chain-xs-title'>Burn</div>
                  <div className='font-17'>72</div>
                  <div className='chain-sm-title'>WGR</div>
                </div>
              </div>
              <div className='bg-1'>
                <div className='chain-item'>
                  <div className='chain-xs-title'>Lotto ID</div>
                  <div className='font-17'>18</div>
                  <div className='chain-sm-title'>WGR</div>
                </div>
                <div className='chain-item-center'>
                  <div className='chain-xs-title'>Tickets Sold</div>
                  <div className='font-17'>4</div>
                  <div className='chain-sm-title'>WGR</div>
                </div>
                <div className='chain-item'>
                  <div className='chain-xs-title'>Ticket Price</div>
                  <div className='font-17'>100</div>
                  <div className='chain-sm-title'>WGR</div>
                </div>
              </div>
            </div>
        </div>
        <Card>
          <div className='m-20 flex-center'>
            <div>No Chain Games transactions to list. Buy a ticket to enter the lotto.</div>
          </div>
        </Card>
      </div>
    );
  };
}
