import Component from '../../core/Component';
import React from 'react';
import _ from 'lodash';
import { singleToOpcode } from '../utils/betUtils';
import Wallet from '../../core/Wallet';
import { alertPopup } from '../utils/alerts';


export default class CardSingleBetSlip extends Component {

    constructor(props) {
        super(props)
        this.state = {
            event: null,
            betAmount: 0
        }

    }

    componentDidMount() {
        this.prepareSlip()
    }

    handleChange = (e) => {
        this.setState({ betAmount: e.target.value });
    }
    prepareSlip = () => {
        const { event } = this.props;
        switch (event.outcome) {
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
        this.setState({ event: event })

    }

    doBet = () => {
        let opcode = ""
        try {
           opcode = singleToOpcode(this.state.event)
        } catch (e) {
            console.log('invalid opcode: ',e)
            alertPopup('Invalid opcode: '+ e.toString().replace(/Error:/g, ''))
            return
        }

        Wallet.instance.sendBet(opcode, this.state.betAmount).then((res) => {
            this.props.removeBetSlip()

            alertPopup('Bet Sent: (txid: ' + res.hash + ' )')
            console.log(res)
        }).catch((e) => {
            console.log('send bet error: ',e)
            alertPopup('send bet error: '+ e.toString().replace(/Error:/g, ''))
        })

    }

    render() {
        const { props } = this
        return (
            this.state.event &&
            <div className="bet-slip-box">
                <div className="slip-body">
                    <div className="slip-title">
                        <span>{this.state.event.teams.home} vs {this.state.event.teams.away}</span>
                        <button className="slip-close" onClick={props.removeBetSlip}>x</button>
                    </div>
                    <label>YOUR PICK :</label>
                    <label className="team-name">{this.state.event.outComeTeam}</label>
                    <span className="slip-body__points">{this.state.event.selectedOddValue}</span>
                    <form className="bet-form">
                        <input type="text" id="bet-value" className="bet-value" value={this.state.betAmount} onChange={this.handleChange} /><span className='afterElement'></span>
                        <button className="bet-form__btn-bet" disabled={this.state.betAmount < 25 || this.state.betAmount > 10000} onClick={this.doBet}>BET</button>
                    </form>
                    {this.state.betAmount > 0 && (this.state.betAmount < 25 || this.state.betAmount > 10000) && <p className="text-center"> (Min 25 - Max 10000)</p>}
                    <div className="bet-returns">
                        <p>Potential Returns:</p>
                        <p className="total">{_.round(this.state.betAmount * this.state.event.effectiveOddValue, 2)}</p>
                    </div>

                </div>
            </div>

        )

    }



}
