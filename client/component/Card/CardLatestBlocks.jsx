
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config';

import Card from './Card';
import CountUp from '../CountUp';
import numeral from 'numeral'
import CardTable from './CardTable';

export default class CardLatestBlocks extends Component {
  static defaultProps = {
    totalBet: 0,
    totalMint: 0.0
  };

  static propTypes = {
    totalBet: PropTypes.number.isRequired,
    totalMint: PropTypes.number.isRequired
  };

  render() {

    return (
      <div className="animated fadeInUp">
      <CardTable title="Bet Status" className="card--status" >
        <div className="card__row bg-eee">
          <span className="w-10">936217</span>
          <span className="w-40">fbef8932kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf</span>
          <span className="w-10">112.37000000</span>
          <span className="w-10">-97 seconds</span>
          <span className="w-10">3</span>
          <span className="w-20">2019-12-12 12:12:12 UTC</span>
        </div>
        <div className="card__row">
          <span className="w-10">936217</span>
          <span className="w-40">fbef8932kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf</span>
          <span className="w-10">112.37000000</span>
          <span className="w-10">-97 seconds</span>
          <span className="w-10">3</span>
          <span className="w-20">2019-12-12 12:12:12 UTC</span>
        </div>
        <div className="card__row bg-eee">
          <span className="w-10">936217</span>
          <span className="w-40">fbef8932kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf</span>
          <span className="w-10">112.37000000</span>
          <span className="w-10">-97 seconds</span>
          <span className="w-10">3</span>
          <span className="w-20">2019-12-12 12:12:12 UTC</span>
        </div>
      </CardTable>
      </div>
    );
  };
}
