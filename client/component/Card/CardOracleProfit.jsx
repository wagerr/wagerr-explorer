
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config';

import Card from './Card';
import CountUp from '../CountUp';
import numeral from 'numeral'

export default class CardOracleProfit extends Component {
  static defaultProps = {
    oracleBalance: 0,
    oracleProfitPerSecond: 0,
    btc: 0.0,
    btcPrice: 0.0,
    usd: 0.0,
    online: 0,
  };

  static propTypes = {
    oracleBalance: PropTypes.number,
    oracleProfitPerSecond: PropTypes.number,
    btc: PropTypes.number.isRequired,
    btcPrice: PropTypes.number.isRequired,
    usd: PropTypes.number.isRequired,
    online: PropTypes.number.isRequired,
  };

  render() {
    const profitPerDay = this.props.oracleProfitPerSecond * 60 * 60 * 24 / this.props.online;
    const profitPerDayBtc = profitPerDay * this.props.btcPrice;
    const profitPerDayUsd = profitPerDay * this.props.usd;

    const profitPerWeek = profitPerDay * 7;
    const profitPerWeekBtc = profitPerWeek * this.props.btcPrice;
    const profitPerWeekUsd = profitPerWeek * this.props.usd;

    const profitPerMonth = (profitPerDay * 365.25) / 12;
    const profitPerMonthBtc = profitPerMonth * this.props.btcPrice;
    const profitPerMonthyUsd = profitPerMonth * this.props.usd;

    const profitPerYear = (profitPerDay * 365.25);
    const profitPerYearyBtc = profitPerYear * this.props.btcPrice;
    const profitPerYearUsd = profitPerYear * this.props.usd;

    const oracleBalance = this.props.oracleBalance;
    const unpaidAccuredReward = oracleBalance / this.props.online
    const unpaidAccuredRewardUSD = unpaidAccuredReward * this.props.usd

    return (
      <div className="animated fadeInUp">
      <Card title="Estimated Oracle Earnings(COIN/USD)" className="card--status" >
        <div className="card__row bg-eee">
          <span className="card__label">DAILY</span>
          <span className="card__result">
            <Link to={`/address/${ config.coin.oracle_payout_address[0] }`}>{numeral(profitPerDay).format('0,0.00')} WGR / {numeral(profitPerDayUsd).format('0,0.00')} USD </Link>
          </span>          
        </div>
        <div className="card__row">
          <span className="card__label">WEEKLY</span>
          <span className="card__result">
            <Link to={`/address/${ config.coin.oracle_payout_address[0] }`}>{numeral(profitPerWeek).format('0,0.00')} WGR / {numeral(profitPerWeekUsd).format('0,0.00')} USD </Link>
          </span>          
        </div>
        <div className="card__row bg-eee">
          <span className="card__label">UNPAID ACCRUED REWARDS</span>
          <span className="card__result">
            <Link to={`/address/${ config.coin.oracle_payout_address[0] }`}>{numeral(unpaidAccuredReward).format('0,0.00')} WGR / {numeral(unpaidAccuredRewardUSD).format('0,0.00')} USD </Link>
          </span>          
        </div>
      </Card>
      </div>
    );
  };
}
