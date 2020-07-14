import PropTypes from 'prop-types'
import React from 'react'

import Card from './Card'
import { Link } from 'react-router-dom'
import numeral from 'numeral'
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { OpcodeChangedBlock } from '../../constants';
const CardBetResult = ({eventInfo, data, t}) => {
  if (eventInfo.results.length !== 0) {
    const results = eventInfo.results
    let totalBet = 0
    let totalMint = 0

    // Money Line

    let MoneyLineBets = { home: [], away: [], draw: [] };

    eventInfo.homeBets.map((event) => {
      if (event.betChoose == 'Money Line - Home Win') {
        MoneyLineBets.home.push(event);
      }
    });
    
    eventInfo.awayBets.map((event) => {
      if (event.betChoose == 'Money Line - Away Win') {
        MoneyLineBets.away.push(event);
      }
    });
    
    eventInfo.drawBets.map((event) => {
      if (event.betChoose == 'Money Line - Draw') {
        MoneyLineBets.draw.push(event);
      }
    });

    const MLHomeBetAmount = MoneyLineBets.home.reduce((acc, bet) => acc + bet.betValue, 0.0);
    const MLAwayBetAmount = MoneyLineBets.away.reduce((acc, bet) => acc + bet.betValue, 0.0);
    const MLDrawBetAmount = MoneyLineBets.draw.reduce((acc, bet) => acc + bet.betValue, 0.0);

    const MLHomeBetPayout = MoneyLineBets.home.reduce((acc, bet) => acc + bet.payout, 0.0);
    const MLAwayBetPayout = MoneyLineBets.away.reduce((acc, bet) => acc + bet.payout, 0.0);
    const MLDrawBetPayout = MoneyLineBets.draw.reduce((acc, bet) => acc + bet.payout, 0.0);
    
    totalBet += MLHomeBetAmount + MLAwayBetAmount + MLDrawBetAmount;
    totalMint += MLHomeBetPayout + MLAwayBetPayout + MLDrawBetPayout;

    // Spreads
    let SpreadsBets = { home: [], away: [], draw: [] };

    eventInfo.spreadHomeBets.map((event) => {
      //if (event.betChoose.includes('Spreads - Home')) {
        SpreadsBets.home.push(event);
      //}
    });
    eventInfo.spreadAwayBets.map((event) => {
      //if (event.betChoose.includes('Spreads - Away')) {
        SpreadsBets.away.push(event);
      //}
    });
    
    // eventInfo.drawBets.map((event) => {
    //   if (event.betChoose.includes('Spreads - Draw')) {
    //     SpreadsBets.draw.push(event);
    //   }
    // });

    const SHomeBetAmount = SpreadsBets.home.reduce((acc, bet) => acc + bet.betValue, 0.0);
    const SAwayBetAmount = SpreadsBets.away.reduce((acc, bet) => acc + bet.betValue, 0.0);

    const SHomeBetPayout = SpreadsBets.home.reduce((acc, bet) => acc + bet.payout, 0.0);
    const SAwayBetPayout = SpreadsBets.away.reduce((acc, bet) => acc + bet.payout, 0.0);
    //const SDrawBetAmount = SpreadsBets.draw.reduce((acc, bet) => acc + bet.betValue, 0.0);
    
    totalBet +=  SHomeBetAmount + SAwayBetAmount; //+ SDrawBetAmount;
    totalMint += SHomeBetPayout + SAwayBetPayout;

    // Over / Under
    let over = [];
    let under = [];

    data.betActions.map((event) => {
      if (event.betChoose.includes('Totals - Over')) {
        over.push(event);
      } else if (event.betChoose.includes('Totals - Under')) {
        under.push(event);
      }
    });

    const THomeBetAmount = over.reduce((acc, bet) => acc + bet.betValue, 0.0);
    const TAwayBetAmount = under.reduce((acc, bet) => acc + bet.betValue, 0.0);
    
    const THomeBetPayout = over.reduce((acc, bet) => acc + bet.payout, 0.0);
    const TAwayBetPayout = under.reduce((acc, bet) => acc + bet.payout, 0.0);

    console.log('eventInfo', eventInfo);
    console.log('data', data);
    totalBet += THomeBetAmount + TAwayBetAmount;
    totalMint += THomeBetPayout + TAwayBetPayout;

    // End of calculations here
  
    // if (eventInfo.results.length > 0) {
    //   eventInfo.results.forEach(result =>{
    //     let startIndex = 2
    //     if (result.payoutTx.vout[1].address === result.payoutTx.vout[2].address) {
    //       startIndex = 3
    //     }
    //     for (let i = startIndex; i < result.payoutTx.vout.length - 1; i++) {
    //       totalMint += result.payoutTx.vout[i].value
    //     }
    //   })
    // }    
    const supplyChange = totalMint - totalBet
    const resultDisplay = (resultData) => {
      const { transaction } = resultData;      
      let scoreDivider = 10
      if (transaction.blockHeight > OpcodeChangedBlock){
        scoreDivider = 100
      }
      let resultSection;
      if (transaction.homeScore > transaction.awayScore) {
        console.log('card betresult transaction:', transaction);
        resultSection = (
          <span>
            {`${resultData.result}`} <br />
            <strong>{`Home ${transaction.homeScore / scoreDivider} `}</strong>
            {`Away ${transaction.awayScore / scoreDivider}`}
          </span>
        );
      } else if (transaction.homeScore < transaction.awayScore) {
        resultSection = (
          <span>
            {resultData.result} <br />
            {`Home ${transaction.homeScore / scoreDivider} `}
            <strong>{`Away ${transaction.awayScore / scoreDivider}`}</strong>
          </span>
        );
      } else {
        resultSection = (
          <span>
            {resultData.result} <br />
            {`Home ${transaction.homeScore / scoreDivider} `}
            {`Away ${transaction.awayScore / scoreDivider}`}
          </span>
        );
      }

      return resultSection;
    };

    return <Card title={t('betResult')} className="card--status">
      {results.map((resultItem) => <div key={resultItem.txId}>
        <div className="card__row">
          <span className="card__label">{t('result')}:</span>
          <span className="card__result">
            {resultDisplay(resultItem)}
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">{t('txId')}:</span>
          <span className="card__result">
        <Link to={`/tx/${ resultItem.txId}`}>
      {resultItem.txId}
        </Link>
        </span>
        </div>
        <div className="card__row">
          <span className="card__label">{t('payoutBlock')}:</span>
          <span className="card__result">
        <Link to={`/block/${resultItem.blockHeight + 1}`}>{resultItem.blockHeight + 1}</Link>
        </span>
        </div>
      </div>)}


      <div className="card__row">
        <span className="card__label">{t('betAmount')}:</span>
        <span className="card__result">
          <span className={`badge badge-danger`}>
            {numeral(totalBet).format('0,0.00000000')}</span>
        </span>
      </div>
      <div className="card__row">
        <span className="card__label">{t('payoutAmount')}:</span>
        <span className="card__result">
          <span className={`badge badge-success`}>
            {numeral(totalMint).format('0,0.00000000')}</span>
        </span>
      </div>
      <div className="card__row">
        <span className="card__label">{t('supplyChange')}:</span>
        <span className="card__result">
        <span className={`badge badge-${ supplyChange < 0 ? 'danger' : 'success' }`}>
                {numeral(supplyChange).format('0,0.00000000')}
              </span>
          </span>
      </div>
    </Card>
  } else {
    return <Card title="Bet Result" className="card--status">
      <div className="card__row">
        <span className="card__label">{t('result')}:</span>
        <span className="card__result">
              {t('waitingForOracle')}
            </span>
      </div>
    </Card>
  }

}

CardBetResult.propTypes = {
  eventInfo: PropTypes.object
}

export default compose(
  translate('betEvent')
)(CardBetResult);
