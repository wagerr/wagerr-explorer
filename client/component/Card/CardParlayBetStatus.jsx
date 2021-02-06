
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config';

import Card from './Card';
import CountUp from '../CountUp';
import numeral from 'numeral'

export default class CardParlayBetStatus extends Component {
  static defaultProps = {
    totalBetParlay: 0,
    totalMintParlay: 0.0
  };

  static propTypes = {
    totalBetParlay: PropTypes.number.isRequired,
    totalMintParlay: PropTypes.number.isRequired
  };

  render() {

    return (
      <div className="animated fadeInUp">
      <Card title="Parlay Bet Status" className="card--status" >
        <div className="card__row bg-eee">
          <span className="card__label">TOTAL PARLAY BET:</span>
          <span className="card__result">{numeral(this.props.totalBetParlay).format('0,0.00')} WGR</span>
        </div>
        <div className="card__row">
          <span className="card__label">TOTAL PARLAY MINT:</span>
          <span className="card__result">{numeral(this.props.totalMintParlay).format('0,0.00')} WGR</span>
        </div>
        <div className="card__row bg-eee">
          <span className="card__label">NET SUPPLY CHANGE:</span>
          <span className="card__result">{numeral(this.props.totalMintParlay - this.props.totalBetParlay).format('0,0.00')} WGR</span>
        </div>
      </Card>
      </div>
    );
  };
}
