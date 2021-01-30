import PropTypes from 'prop-types'
import React from 'react'

import Card from './Card'
import { Link } from 'react-router-dom'
import numeral from 'numeral'
import { compose } from 'redux'
import { translate } from 'react-i18next'
import {
  OPCODE_CHANED_BLOCK
} from '../../constants';

const CardBetResult = ({eventInfo, t}) => {
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

    totalBet += MLHomeBetAmount + MLAwayBetAmount + MLDrawBetAmount;

    totalMint +=  MoneyLineBets.home.reduce((acc, bet) => acc + bet.payout, 0.0);
    totalMint +=  MoneyLineBets.away.reduce((acc, bet) => acc + bet.payout, 0.0);
    totalMint +=  MoneyLineBets.draw.reduce((acc, bet) => acc + bet.payout, 0.0);

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
    //const SDrawBetAmount = SpreadsBets.draw.reduce((acc, bet) => acc + bet.betValue, 0.0);
    
    totalBet +=  SHomeBetAmount + SAwayBetAmount; //+ SDrawBetAmount;

    totalMint += SpreadsBets.home.reduce((acc, bet) => acc + bet.payout, 0.0);
    totalMint += SpreadsBets.away.reduce((acc, bet) => acc + bet.payout, 0.0);

    // Over / Under
    let over = [];
    let under = [];

    eventInfo.overBets.map((event) => {
      over.push(event);
  });

  eventInfo.underBets.map((event) => {
    under.push(event);
});

    const THomeBetAmount = over.reduce((acc, bet) => acc + bet.betValue, 0.0);
    const TAwayBetAmount = under.reduce((acc, bet) => acc + bet.betValue, 0.0);
    
    totalBet += THomeBetAmount + TAwayBetAmount;
    totalMint += over.reduce((acc, bet) => acc + bet.payout, 0.0);
    totalMint += under.reduce((acc, bet) => acc + bet.payout, 0.0)

    // End of calculations here
  
    const supplyChange = totalMint - totalBet
    const resultDisplay = (resultData) => {
      const { transaction } = resultData;
      //TODO: create centralize function for score divider -> (resultData.blockHeight+1 >= OPCODE_CHANED_BLOCK)? 100 : 10
      let resultSection;
      let divider = resultData.blockHeight+1 >= OPCODE_CHANED_BLOCK? 100 : 10;
      if (transaction.homeScore > transaction.awayScore) {
        resultSection = (
          <span>
            {`${resultData.result}`} <br />
            <strong>{`Home ${transaction.homeScore / divider} `}</strong> 
            {`Away ${transaction.awayScore / divider}`}
          </span>
        );
      } else if (transaction.homeScore < transaction.awayScore) {
        resultSection = (
          <span>
            {resultData.result} <br />
            {`Home ${transaction.homeScore / divider} `}
            <strong>{`Away ${transaction.awayScore / divider}`}</strong>
          </span>
        );
      } else {
        resultSection = (
          <span>
            {resultData.result} <br />
            {`Home ${transaction.homeScore / divider} `}
            {`Away ${transaction.awayScore / divider}`}
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
