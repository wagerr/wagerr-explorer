import blockchain from '../../../lib/blockchain';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import Card from './Card';

const CardROI = ({coin,totalROI}) => {
    const mncoins = blockchain.mncoins;
    const mns = coin.mnsOff + coin.mnsOn;
    const subsidy = blockchain.getMNSubsidy(coin.blocks, mns, coin.supply);
    const roi = blockchain.getROI(subsidy, coin.mnsOn);

    return (
        <Card title="Info">
            <div className="p-5-10 bg-eee">
                <div className="h3">
                    {coin.mnsOn} / {mns}
                </div>
                <div className="h5">
                    Active/Total Masternodes
                </div>
            </div>
            <div className="p-5-10 bg-eee">
                <div className="h3">
                    {numeral(coin.totalROI).format('0,0.00')} %
                </div>
                <div className="h5">
                    Oracle Masternode ROI
                </div>
            </div>
            <div className="p-5-10 bg-eee">
                <div className="h3">
                    {numeral(coin.supply ? coin.supply : 0.0).format('0,0.00000000')} WGR
                </div>
                <div className="h5">
                    Coin Supply (Total)
                </div>
            </div>
            {/* <div className="mb-3">
        <div className="h3">
          { numeral(coin.supply ? coin.supply - (mns * mncoins) : 0.0).format('0,0.00000000') } WGR
        </div>
        <div className="h5">
          Coin Supply (Circulating)
        </div>
      </div> */}
            <div className="p-5-10">
                <div className="h3">
                    {numeral(coin.btc).format('0,0.00000000')} BTC
                </div>
                <div className="h5">
                    Market Cap BTC
                </div>
            </div>
            <div className="p-5-10 bg-eee">
                <div className="h3">
                    {numeral(coin.cap).format('$0,0.00')}
                </div>
                <div className="h5">
                    Market Cap USD
                </div>
            </div>
            <div className="p-5-10">
                <div className="h3">
                    {numeral(mns * mncoins).format('0,0.00000000')} WGR
                </div>
                <div className="h5">
                    Coins Locked
                </div>
            </div>
            <div className="p-5-10 bg-eee">
                <div className="h3 ">
                    {numeral(mncoins * coin.btcPrice).format('0,0.00000000')} BTC
                    / {numeral(mncoins * coin.usd).format('$0,0.00')}
                </div>
                <div className="h5">
                    Masternode Worth
                </div>
            </div>
        </Card>
    );
};

CardROI.propTypes = {
    coin: PropTypes.object.isRequired
};

export default CardROI;
