
import Component from '../../core/Component';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';

export default class CardOracleMNRoi extends Component {
  
  render() {
    return (
      <div className="animated fadeInUp">
        <Card className="card--market" title="Total Oracle Masternode ROI">
          <p className="card__data-main bariol text-center">
          {numeral(this.props.totalROI).format('0,0.00')} % APR
          </p>          
        </Card>
      </div>
    );
  };
}
