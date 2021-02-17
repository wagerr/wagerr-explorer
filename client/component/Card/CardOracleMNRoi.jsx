
import Component from '../../core/Component';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';

export default class CardOracleMNRoi extends Component {
  static defaultProps = {
    usd: 0.0,
  };

  static propTypes = {
    usd: PropTypes.number.isRequired,
  };

  

  render() {

    const profitOraclePerDay = this.props.oracleProfitPerSecond * 60 * 60 * 24 / this.props.online;
    const rewardMasternodePerDay = 2.85 * 1440 / this.props.online;
    const masternodeROI = (profitOraclePerDay + rewardMasternodePerDay) * 36500 / 25000
    return (
      <div className="animated fadeInUp">
        <Card className="card--market" title="Total Oracle Masternode ROI">
          <p className="card__data-main bariol text-center">
          {numeral(masternodeROI).format('0,0.00')} % APR
          </p>          
        </Card>
      </div>
    );
  };
}
