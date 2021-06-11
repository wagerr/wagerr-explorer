
import blockchain from '../../../lib/blockchain';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';

const CardEarnings = ({ coin }) => {
  const subsidy = blockchain.getMNSubsidy(coin.blocks, coin.mnsOn, coin.supply);
  const day = blockchain.getMNBlocksPerDay(coin.mnsOn) * subsidy;
  const week = blockchain.getMNBlocksPerWeek(coin.mnsOn) * subsidy;
  const month = blockchain.getMNBlocksPerMonth(coin.mnsOn) * subsidy;
  const year = blockchain.getMNBlocksPerYear(coin.mnsOn) * subsidy;

  const nbtc = v => numeral(v).format('0,0.00000000');
  const nusd = v => numeral(v).format('$0,0.00');
  
  return (
    <Card title="Estimated Earnings (COIN/BTC/USD)">
      <div className="row p-5-0 bg-eee">
        <div className="col-sm-12 col-md-3">
          DAILY
        </div>
        <div className="col-sm-12 col-md-9">
          { nbtc(day) } WGR / { nbtc(day * coin.btcPrice) } BTC / { nusd(day * coin.usd) } USD
        </div>
      </div>
      <div className="row p-5-0">
        <div className="col-sm-12 col-md-3">
          WEEKLY
        </div>
        <div className="col-sm-12 col-md-9">
          { nbtc(week) } WGR / { nbtc(week * coin.btcPrice) } BTC / { nusd(week * coin.usd) } USD
        </div>
      </div>
      <div className="row p-5-0 bg-eee">
        <div className="col-sm-12 col-md-3">
          MONTHLY
        </div>
        <div className="col-sm-12 col-md-9">
          { nbtc(month) } WGR / { nbtc(month * coin.btcPrice) } BTC / { nusd(month * coin.usd) } USD
        </div>
      </div>
      <div className="row p-5-0">
        <div className="col-sm-12 col-md-3">
          YEARLY
        </div>
        <div className="col-sm-12 col-md-9">
          { nbtc(year) } WGR / { nbtc(year * coin.btcPrice) } BTC / { nusd(year * coin.usd) } USD
        </div>
      </div>
      
    </Card>
  );
};

CardEarnings.propTypes = {
  coin: PropTypes.object.isRequired
};

export default CardEarnings;
