
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config';

import Card from './Card';
import CountUp from '../CountUp';
import numeral from 'numeral'

export default class CardMasternodeReward extends Component {
  static defaultProps = {
    usd: 0.0,
    online: 0,
  };

  static propTypes = {
    usd: PropTypes.number.isRequired,
    online: PropTypes.number.isRequired,
  };

  render() {
    const rewardPerDay = 2.85 * 1440 / this.props.online;
    const rewardPerDayUsd = rewardPerDay * this.props.usd;

    const rewardPerWeek = rewardPerDay * 7;
    const rewardPerWeekUsd = rewardPerWeek * this.props.usd;

    const rewardPerYear = (rewardPerDay * 365.25);
    const rewardPerYearUsd = rewardPerYear * this.props.usd;

    return (
      <div className="animated fadeInUp">
      <Card title="Estimated Masternode Block Rewards(COIN/USD)" className="card--status" >
        <div className="card__row bg-eee">
          <span className="card__label">DAILY</span>
          <span className="card__result">
            <span>{numeral(rewardPerDay).format('0,0.00')} WGR / {numeral(rewardPerDayUsd).format('0,0.00')} USD </span>
          </span>          
        </div>
        <div className="card__row">
          <span className="card__label">WEEKLY</span>
          <span className="card__result">
            <span>{numeral(rewardPerWeek).format('0,0.00')} WGR / {numeral(rewardPerWeekUsd).format('0,0.00')} USD </span>
          </span>          
        </div>
        <div className="card__row bg-eee">
          <span className="card__label">YEARLY</span>
          <span className="card__result">
            <span>{numeral(rewardPerYear).format('0,0.00')} WGR / {numeral(rewardPerYearUsd).format('0,0.00')} USD </span>
          </span>          
        </div>
        <div className="card__row">
          <span  style={{color:"rgba(0, 0, 0,.5)", fontSize: '15px', padding: '5px 0px'}}> Estimates based on current block subsidy and active masternodes</span>
        </div>
      </Card>
      </div>
    );
  };
}
