import Component from '../../core/Component';
import React from 'react';
import ClientUtils from '../utils/utils';


export default class CardTxLegInfo extends Component {

    constructor(props) {
        super(props);
      };


      render() {
        const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;
          return (
            <div className="card--block" style={{padding:'5px 10px'}}>
                  {
                      this.props.isParlay ? <div className="card--block">
                          <div className="card__row">
                              <h3 className="inner__title">Parlay Bet - Leg {this.props.leg.index}</h3>
                          </div>
                      </div> : null

                  }
          <div className="card__row">
            <span className="card__label">Event ID</span>
            <span className="card__result">{ this.props.leg.eventId }</span>
          </div>  
          <div className="card__row">
            <span className="card__label">League</span>
            <span className="card__result">{ this.props.leg.league }</span>
          </div>  
          <div className="card__row">
            <span className="card__label">Home</span>
            <span className="card__result">{ this.props.leg.homeTeam }</span>
          </div> 
          <div className="card__row">
            <span className="card__label">Away</span>
            <span className="card__result">{ this.props.leg.awayTeam }</span>
          </div> 
          <div className="card__row">
            <span className="card__label">Market</span>
            <span className="card__result">{ this.props.leg.market }</span>
          </div>  
          {(typeof this.props.leg.Total != "undefined") && <div className="card__row">
            <span className="card__label">Total</span>
            <span className="card__result">{ this.props.leg.Total}</span>
          </div>}
          {(typeof this.props.leg.Spread != "undefined") && <div className="card__row">
            <span className="card__label">Spread</span>
            <span className="card__result">{ this.props.leg.Spread}</span>
          </div>}
          <div className="card__row">
            <span className="card__label">Price</span>
            <span className="card__result">{ ClientUtils.convertToOdds(this.props.leg.price, toggleSwitchOddsStyle, toggleSwitchOdds) }</span>
          </div>  
          {
          this.props.isParlay == false ? <div className="card__row">
            <span className="card__label">BetValue</span>
            <span className="card__result">{ this.props.leg.betValue } WGR / { this.props.leg.betValueUSD.toFixed(2) } USD</span>
          </div> : null
          }

          <div className="card__row">
            <span className="card__label">Result</span>
            <span className="card__result text-capitalize">{ this.props.leg.betResult ? this.props.leg.betResult : this.props.leg.betResultType} </span>
          </div>     
        </div>  
          );
      }

}