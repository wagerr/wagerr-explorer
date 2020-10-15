import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'
import Card from './Card'
import { timeStamp24Format } from '../../../lib/date'
import numeral from 'numeral'
import { compose } from 'redux'
import { translate } from 'react-i18next'
import connect from 'react-redux/es/connect/connect'

const convertToAmericanOdds = (odds) => {

  odds = parseFloat(odds);
  let ret = parseInt((odds - 1) * 100);

  if (odds < 2)
      ret = Math.round((-100) / (odds - 1));

  if (odds == 0) ret = 0;

  if (ret > 0) ret = `+${ret}`

  return ret;
}

const CardMoneyLineEvent = ({eventInfo, t}) => {
  if (eventInfo) {
    let MoneyLineBets = { home: [], away: [], draw: [] };

    const sortHomeBets = eventInfo.homeBets.map((event) => {
      if (event.betChoose == 'Money Line - Home Win') {
        MoneyLineBets.home.push(event);
      }
    });
    const sortAwayBets = eventInfo.awayBets.map((event) => {
      if (event.betChoose == 'Money Line - Away Win') {
        MoneyLineBets.away.push(event);
      }
    });
    const sortDrawBets = eventInfo.drawBets.map((event) => {
      if (event.betChoose == 'Money Line - Draw') {
        MoneyLineBets.draw.push(event);
      }
    });

    const MLHomeBetAmount = MoneyLineBets.home.reduce((acc, bet) => acc + bet.betValue, 0.0);
    const MLAwayBetAmount = MoneyLineBets.away.reduce((acc, bet) => acc + bet.betValue, 0.0);
    const MLDrawBetAmount = MoneyLineBets.draw.reduce((acc, bet) => acc + bet.betValue, 0.0);

    return <div className="card--status">
      <h2 className='ml-2'>Money Line</h2>
      <div className="card__row bg-eee">
        <span className="card__label">{t('time')}:</span>
        <span className="card__result">{timeStamp24Format(eventInfo.events[0].timeStamp)}</span>        
      </div>
      <div className="card__row">
        <span className="card__label">{t('league')}:</span>
        <span className="card__result">{eventInfo.events[0].league}</span>
      </div>
      <div className="card__row bg-eee">
        <span className="card__label">{t('homeTeam')}:</span>
        <span className="card__result">
               {eventInfo.events[0].homeTeam}
            </span>
      </div>
      <div className="card__row">
        <span className="card__label">{t('awayTeam')}:</span>
        <span className="card__result">
                {eventInfo.events[0].awayTeam}
          </span>
      </div>
      <div className="card__row bg-eee">
        <span className="card__label">{t('homeBetNum')}:</span>
        <span
          className="card__result">{MoneyLineBets.home.length}</span>
      </div>
      <div className="card__row">
        <span className="card__label">{t('homeBetAmount')}:</span>
        <span className="card__result"> <span className={`badge badge-danger`}>
                {numeral(MLHomeBetAmount).format('0,0.00000000')}</span></span>
      </div>
      <div className="card__row bg-eee">
        <span className="card__label">{t('drawBetNum')}:</span>
        <span
          className="card__result">{MoneyLineBets.draw.length}</span>
      </div>
      <div className="card__row">
        <span className="card__label">{t('drawBetAmount')}:</span>
        <span className="card__result">
           <span className={`badge badge-danger`}>
                {numeral(MLDrawBetAmount).format('0,0.00000000')}</span></span>
      </div>
      <div className="card__row bg-eee">
        <span className="card__label">{t('awayBetNum')}:</span>
        <span
          className="card__result">{MoneyLineBets.away.length}</span>
      </div>
      <div className="card__row">
        <span className="card__label">{t('awayBetAmount')}:</span>
        <span className="card__result"><span className={`badge badge-danger`}>
               {numeral(MLAwayBetAmount).format('0,0.00000000')}</span>
          </span>
      </div>
    </div>
  } else {
    return <div title="Bet Event" className="card--status">
      <div className="card__row">
        {t('cantFindEvent')}
      </div>
    </div>
  }

}

CardMoneyLineEvent.propTypes = {
  eventInfo: PropTypes.object
}

export default compose(
  translate('betEvent')
)(CardMoneyLineEvent);
