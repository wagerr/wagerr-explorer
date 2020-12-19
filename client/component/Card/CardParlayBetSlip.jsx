import Component from '../../core/Component';
import React from 'react';


export default class CardParlayBetSlip extends Component {
    constructor(props) {
        super(props)
        this.state = {
            event: null
        }
    }
    componentDidMount() {
        this.prepareSlip()
    }

    prepareSlip = () => {
        const {event} = this.props;
        switch(event.outcome) {
            case 1:
                event.outComeTeam = event.teams.home
                event.selectedOddValue = event.odds[0].mlHome
                event.effectiveOddValue = event.odds[0].mlHomeEO
                break;
            case 2:
                event.outComeTeam = event.teams.away
                event.selectedOddValue = event.odds[0].mlAway
                event.effectiveOddValue = event.odds[0].mlAwayEO
                break;
            case 3:
                event.outComeTeam = ""
                event.selectedOddValue = event.odds[0].mlDraw
                event.effectiveOddValue = event.odds[0].mlDrawEO
                break;
            case 4:
                event.outComeTeam = event.teams.home
                event.selectedOddValue = event.odds[1].spreadHome
                event.effectiveOddValue = event.odds[1].spreadHomeEO
                event.handicap = "Handicape " + event.spreadPoints
                break;
            case 5:
                event.outComeTeam = event.teams.away
                event.selectedOddValue = event.odds[1].spreadAway
                event.effectiveOddValue = event.odds[1].spreadAwayEO
                event.handicap = "Handicape " + event.spreadPoints
                break;
            case 6:
                event.outComeTeam = "Over " + event.odds[2].totalsPoints
                event.selectedOddValue = event.odds[2].totalsOver
                event.effectiveOddValue = event.odds[2].totalsOverEO
                break;
            case 7:
                event.outComeTeam = "Under " + event.odds[2].totalsPoints
                event.selectedOddValue = event.odds[2].totalsUnder
                event.effectiveOddValue = event.odds[2].totalsUnderEO
                break;
            
        }
        this.setState({event: event})
        
        }

    render() {
        const { props } = this
        return(
            
            this.state.event && <div>
               
                 <div className="bet-slip-box">
                  <div className="slip-body">
                    <div className="slip-title">
                      <span>{this.state.event.teams.home} vs {this.state.event.teams.away}</span>
                      <button className="slip-close" onClick={ props.removeBetSlip}>x</button>
                    </div>
                    <label>YOUR PICK :</label>
                    <label className="team-name">{this.state.event.outComeTeam}</label>
                    <span className="slip-body__points">{this.state.event.selectedOddValue}</span>
                  </div>
                   </div>
                 
        </div>
        )

    }
}