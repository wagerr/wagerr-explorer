
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

  renderParlayBetItem(betItem) {
    return (
    <div className="card--block" style={{padding:'5px 20px'}}>
      <div className="card__row">
      <span className="card__label">Event ID</span>
      <span className="card__result">{ betItem.eventId }</span>
    </div>  
    <div className="card__row">
      <span className="card__label">League</span>
      <span className="card__result">{ betItem.league }</span>
    </div>  
    <div className="card__row">
      <span className="card__label">Home</span>
      <span className="card__result">{ betItem.homeTeam }</span>
    </div> 
    <div className="card__row">
      <span className="card__label">Away</span>
      <span className="card__result">{ betItem.awayTeam }</span>
    </div> 
    <div className="card__row">
      <span className="card__label">Market</span>
      <span className="card__result">{ betItem.market }</span>
    </div>  
    {(typeof betItem.Total != "undefined") && <div className="card__row">
      <span className="card__label">Total</span>
      <span className="card__result">{ betItem.Total}</span>
    </div>}
    {(typeof betItem.Spread != "undefined") && <div className="card__row">
      <span className="card__label">Spread</span>
      <span className="card__result">{ betItem.Spread}</span>
    </div>}
    <div className="card__row">
      <span className="card__label">Price</span>
      <span className="card__result">{ betItem.price }</span>
    </div>  
    <div className="card__row">
      <span className="card__label">BetValue</span>
      <span className="card__result">{ betItem.betValue } WGR / { betItem.betValueUSD.toFixed(3) } USD</span>
    </div>           
  </div>   
    )
  }

  render() {    
    let txAddress;

    if (typeof this.props.tx.legs !== "undefined"){
      let totalPrice = 1;
      for (const item of this.props.tx.legs){
        totalPrice = totalPrice * item.price;
      }

      return (
        <div className="card--block opcode">
          <div className="card__row">        
            <span className="test" address={this.props.tx.address}>
              {this.props.tx.address}
            </span>
          </div>
          <div className="card--block" style={{padding:'5px 0px', fontWeight:'bold'}}>
            <div className="card__row">
              <span className="card__label">Bet Type</span>
              <span className="card__result">Parlay</span>
            </div>  
          </div>  
          <div className="card--block" style={{fontWeight:'bold'}}>
            {
              this.props.tx.legs.map((betItem, legIndex) =>       
                  <div className="card--block" key={betItem.eventId}>
                  <div className="card__row">        
                    <span style={{fontWeight: 'bold'}}>
                      Leg {legIndex+1}
                    </span>
                  </div> 
                  <div className="card--block" key={betItem.eventId} style={{padding:'0px 15px'}}>
                  <div className="card__row">
                    <span className="card__label">Event ID</span>
                    <span className="card__result"><Link to={`/bet/event/${encodeURIComponent(betItem.eventId)}`}>{ betItem.eventId }</Link></span>
                  </div>  
                  <div className="card__row">
                    <span className="card__label">League</span>
                    <span className="card__result">{ betItem.league }</span>
                  </div>  
                  <div className="card__row">
                    <span className="card__label">Home</span>
                    <span className="card__result">{ betItem.homeTeam }</span>
                  </div> 
                  <div className="card__row">
                    <span className="card__label">Away</span>
                    <span className="card__result">{ betItem.awayTeam }</span>
                  </div> 
                  <div className="card__row">
                    <span className="card__label">Market</span>
                    <span className="card__result">{ betItem.market.replace('Parlay - ', '') }</span>
                  </div>  
                  {(typeof betItem.Total != "undefined") && <div className="card__row">
                    <span className="card__label">Total</span>
                    <span className="card__result">{ betItem.Total}</span>
                  </div>}
                  {(typeof betItem.Spread != "undefined") && <div className="card__row">
                    <span className="card__label">Spread</span>
                    <span className="card__result">{ betItem.Spread}</span>
                  </div>}
                  <div className="card__row">
                    <span className="card__label">Price</span>
                    <span className="card__result">{ betItem.price }</span>
                  </div>           
                  </div>
                </div>
              )
            }
            <div className="card__row">
               <span className="card__label">Total Price</span>
               <span className="card__result">{ totalPrice.toFixed(3) } </span>
            </div>  
            <div className="card__row">
               <span className="card__label">BetValue</span>
               <span className="card__result">{ this.props.tx.betValue } WGR / { this.props.tx.betValueUSD.toFixed(3) } USD</span>
            </div>  
          </div>

        </div>
      )
    } else {
      return (
        <div className="card--block opcode">
          <div className="card__row">        
            <BetModal buttonLabel={txAddress = this.props.tx.address} className="test" address={this.props.tx.address} />
          </div>        
          {
            (typeof this.props.tx.eventId != "undefined" && typeof this.props.tx.legs == "undefined") && <div className="card--block" style={{padding:'5px 10px'}}>
            <div className="card__row">
              <span className="card__label">Event ID</span>
              <span className="card__result"><Link to={`/bet/event/${encodeURIComponent(this.props.tx.eventId)}`}>{ this.props.tx.eventId }</Link></span>
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
              <span className="card__result">{ this.props.tx.betValue } WGR / { this.props.tx.betValueUSD.toFixed(3) } USD</span>
            </div>           
          </div>        
          }        
        </div>      
      );
    }
  };
}
