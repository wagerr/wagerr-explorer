
import Component from '../core/Component';
import React from 'react';
import Card from '../component/Card';

export default class Betting extends Component {
  render() {
    return (
      <div className='m-20'>
        <h2>Betting</h2>
        <Card>
          <div className='m-20 flex-center'>
            <div>Looks like Wallet Not Connected</div>
            <div>Go to <span className='link'>Help</span>  to install wallet</div>
          </div>
        </Card>
      </div>
    );
  };
}
