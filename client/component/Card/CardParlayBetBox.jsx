import Component from '../../core/Component';
import React from 'react';
import _ from 'lodash';


export default class CardParlayBetBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            legs: [],
            totalOdds: 0,
            betAmount:"",
            potentialReturn: 0
        }

        this.walletClient = null
    }
    componentWillReceiveProps(props) { 

        const parlayslips = props.parlaySlips;
        parlayslips.forEach((event) => {
        switch(event.outcome) {
            case 1:
                event.effectiveOddValue = event.odds[0].mlHomeEO
                break;
            case 2:
                event.effectiveOddValue = event.odds[0].mlAwayEO
                break;
            case 3:
                event.effectiveOddValue = event.odds[0].mlDrawEO
                break;
            case 4:
                event.effectiveOddValue = event.odds[1].spreadHomeEO
                break;
            case 5:
                event.effectiveOddValue = event.odds[1].spreadAwayEO
                break;
            case 6:
                event.effectiveOddValue = event.odds[2].totalsOverEO
                break;
            case 7:
                event.effectiveOddValue = event.odds[2].totalsUnderEO
                break;
            
        }

    })
        
       const totalodds = _.round(_.reduce(parlayslips, (mul,s) => mul * parseFloat(s.effectiveOddValue),1),2)
       const legs = parlayslips.map((s) => {
       return {
           eventid:s.event_id, 
           outcome:s.outcome
        }
    })
      
       this.setState({
           legs: legs,
           totalOdds:totalodds,
           potentialReturn: _.round(this.state.betAmount * totalodds,2)
        })
    }


    handleChange = (e) => {
        console.log(e.target.value)
        this.setState({
            betAmount:e.target.value,
            potentialReturn: _.round(e.target.value * this.state.totalOdds,2)
        })
        
    }

    doBet = () => {

    }

    render() {
        return (
            
            <div className="place-bet-box">
                        <div className="total-parlay">
                            <span>Total Legs : {this.state.legs.length}</span>
                            <span>Total Odds : {this.state.totalOdds}</span>
                        </div>
                        <div className="parlay-form">
                            <label className="total-parlay">
                                <span className="span_bet">BET</span>
                                <input type="text" className="bet-value" placeholder="Enter bet amount" onChange={this.handleChange} value={this.state.betAmount} /><span className="afterInput"></span>
                                
                            </label>
                            { this.state.betAmount > 0 && (this.state.betAmount < 25 || this.state.betAmount > 10000)  && <p className="text-center"> (Min 25 - Max 10000)</p> }
                            <label className="place-bet-box__label">Potential Returns : <span>{this.state.potentialReturn} tWGR</span></label>
                            <button className="btn-place-bet" disabled= {this.state.betAmount < 25 || this.state.betAmount > 10000 || this.state.legs.length < 2 }>PLACE BET</button>
                        </div>
                    </div>
        )

    }
}