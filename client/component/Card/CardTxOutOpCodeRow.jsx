
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

export default class CardTxOutOpCodeRow extends Component {

  constructor(props) {
    super(props);
  };

  render() {    
    let txAddress;
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
            <span className="card__result">{ this.props.tx.price }</span>
          </div>  
          <div className="card__row">
            <span className="card__label">BetValue</span>
            <span className="card__result">{ this.props.tx.betValue } WGR / { this.props.tx.betValueUSD } USD</span>
          </div>           
        </div>        
        }        
      </div>      
    );
  };
}
