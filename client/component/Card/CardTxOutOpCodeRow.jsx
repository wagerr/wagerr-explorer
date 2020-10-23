
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config'
import Table from '../Table';
import BetModal from '../Modal';
import { TXS } from '../../constants';

Number.prototype.toFixedNoRounding = function(n) {
  const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
  const a = this.toString().match(reg)[0];
  const dot = a.indexOf(".");
  if (dot === -1) { // integer, insert decimal dot and pad up zeros
      return a + "." + "0".repeat(n);
  }
  const b = n - (a.length - dot) + 1;
  return b > 0 ? (a + "0".repeat(b)) : a;
}

const convertToOdds = (odds, is_American, is_Decimal) => {
  let ret = odds;
  if (is_American){
    odds = parseFloat(odds);
    ret = parseInt((odds - 1) * 100);

    if (odds < 2)
      ret = Math.round((-100) / (odds - 1));

    if (odds == 0) ret = 0;
  }

  if (is_Decimal){
    ret = ret == 0 ? ret : (1 + (ret - 1) * 0.94).toFixedNoRounding(2);
  }
  
  if (ret > 0) ret = `+${ret}`
  return ret;
}

export default class CardTxOutOpCodeRow extends Component {

  constructor(props) {
    super(props);
  };

  render() {    
    let txAddress;
    const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;
    return (
      <div className="card--block opcode">
        <div className="card__row">        
          <BetModal buttonLabel={txAddress = this.props.tx.address} className="test" address={this.props.tx.address} />
        </div>
        {
          (typeof this.props.tx.eventId != "undefined") && <div className="card--block" style={{padding:'5px 10px'}}>
          <div className="card__row">
            <span className="card__label">Event ID</span>
            <span className="card__result">{ this.props.tx.eventId }</span>
          </div>  
          <div className="card__row">
            <span className="card__label">League</span>
            <span className="card__result">{ this.props.tx.league }</span>
          </div>  
          <div className="card__row">
            <span className="card__label">Home</span>
            <span className="card__result">{ this.props.tx.homeTeam }</span>
          </div> 
          <div className="card__row">
            <span className="card__label">Away</span>
            <span className="card__result">{ this.props.tx.awayTeam }</span>
          </div> 
          <div className="card__row">
            <span className="card__label">Market</span>
            <span className="card__result">{ this.props.tx.market }</span>
          </div>  
          {(typeof this.props.tx.Total != "undefined") && <div className="card__row">
            <span className="card__label">Total</span>
            <span className="card__result">{ this.props.tx.Total}</span>
          </div>}
          {(typeof this.props.tx.Spread != "undefined") && <div className="card__row">
            <span className="card__label">Spread</span>
            <span className="card__result">{ this.props.tx.Spread}</span>
          </div>}
          <div className="card__row">
            <span className="card__label">Price</span>
            <span className="card__result">{ convertToOdds(this.props.tx.price, toggleSwitchOddsStyle, toggleSwitchOdds) }</span>
          </div>  
          <div className="card__row">
            <span className="card__label">BetValue</span>
            <span className="card__result">{ this.props.tx.betValue } WGR / { this.props.tx.betValueUSD.toFixed(3) } USD</span>
          </div>           
        </div>        
        }        
      </div>      
    );
  };
}
