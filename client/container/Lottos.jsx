
import Component from '../core/Component';
import React from 'react';
import Card from '../component/Card';

export default class Lottos extends Component {
  render() {
    return (
      <div className='m-20'>
        <div>
          <div className='row chain-game animated fadeInUp'>
            <img src={'/img/uiupdate/quote.png'} alt={'WGR'} className='quote-img'/>
            <div className='col-md-4 col-sm-12 align-center p-20'>
              <br/>
              <img src={'/img/uiupdate/white_logo.png'} alt={'WGR'} className='wgr-img'/>
              <div className='chain-title'>LOTTO JACKPOT</div>
              <br/>
              <div className='chain-sm-title'>Game Start:</div>
              <div>Dec 2nd 2019 07:06 AM</div>
              <div className='chain-sm-title'>Game End:</div>
              <div>Dec 9th 2019 07:06 AM</div>
              <div className='chain-btn'>BUY TICKET</div>
              <div className='chain-italic'>(Entry Fee: 100 WGR)</div>
            </div>
            <div className='col-md-8 col-sm-12 align-center p-20'>
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
        </div>
        <div className='m-12'>
          <h2>CG Lotto Bet History</h2>
          <Card>
            <div className='m-20 flex-center'>
              <div className='card__chain'>No Chain Games transactions to list. Buy a ticket to enter the lotto.</div>
            </div>
          </Card>
        </div>
      </div>
    );
  };
}
