
import Component from '../core/Component';
import React from 'react';
import Card from '../component/Card';

export default class Bethistory extends Component {
  render() {
    return (
      <div className='m-20 bet-history'>
        <h2>Bet Transaction History</h2>
        <div className='card__bethistory'>
          <Card>
            <div className='m-20 flex-center card__bethistory__pad'>
              <div>Looks like Wallet Not Connected</div>
              <div>Go to <span className='link'>Help</span>  to install wallet</div>
            </div>
          </Card>
        </div>
      </div>
    );
  };
}
