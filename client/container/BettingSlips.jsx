
import Component from '../core/Component';
import React from 'react';
import CardSingleBetSlip from '../component/Card/CardSingleBetSlip'
import CardParlayBetSlip from '../component/Card/CardParlayBetSlip'
import CardParlayBetBox from '../component/Card/CardParlayBetBox'
import PubSub from 'pubsub-js';

export default class BettingSlips extends Component {

    constructor(props) {
        super(props)
        this.state = {
            currentSelection: 'single',
            currentSlips: {
                single: [],
                parlay: []
            }
        }

        PubSub.subscribe('event-clicked', this.addBetSlip)

    }

    changeBetType = (e) => {
        console.log(e.target.value)
        this.setState({
            currentSelection: e.target.value
        },()=> {
        PubSub.publish('betType-changed', this.state.currentSelection)
        })
    }

    clearBetSlips = () => {
        if(this.state.currentSelection === 'single')
        {   let parlayArray = [...this.state.currentSlips.parlay]
            this.setState({currentSlips: {
                single: [],
                parlay: parlayArray
            }})
        } 

        if(this.state.currentSelection === 'parlay') {
            let singleArray = [...this.state.currentSlips.single]
            this.setState({
                currentSlips: {
                    single: singleArray,
                    parlay: []
                }
            })
            PubSub.publish('parlay-changed',['clear'])
        }

        
    }

    removeBetSlip = (eventid, type) => {

        if (type === 'single') {
            let singleArray = [...this.state.currentSlips.single]
            const index = singleArray.findIndex((e) => e.event_id == eventid)
            if (index !== -1) {
                singleArray.splice(index, 1);
                this.setState({
                    currentSlips: {
                        single: singleArray,
                        parlay: [...this.state.currentSlips.parlay]
                    }
                })
            }
        }

        if (type === 'parlay') {
            let parlayArray = [...this.state.currentSlips.parlay]
            const index = parlayArray.findIndex((e) => e.event_id == eventid)
            if (index !== -1) {
                parlayArray.splice(index, 1);
                this.setState({
                    currentSlips: {
                        single: [...this.state.currentSlips.single],
                        parlay: parlayArray
                    }
                })

                PubSub.publish('parlay-changed', ['removed', eventid])
            }
        }
    }
    addBetSlip = (msg, data) => {
        let event = data[0]
        let outcome = data[1]

        if (this.state.currentSelection == 'single') {
            let singleslips = [...this.state.currentSlips.single]
            event.outcome = outcome;
            console.log("addbetslipsingle", event)
            singleslips.push(event)

            this.setState({
                currentSlips: {
                    single: singleslips,
                    parlay: [...this.state.currentSlips.parlay]
                }
            })
        }

        if (this.state.currentSelection == 'parlay') {
            let parlayslips = [...this.state.currentSlips.parlay]

            if(parlayslips.length == 5) return;
            
            event.outcome = outcome;
            console.log("addbetslipparlay", event)
            parlayslips.push(event)

            this.setState({
                currentSlips: {
                    single: [...this.state.currentSlips.single],
                    parlay: parlayslips

                }
            })
            PubSub.publish('parlay-changed', ['added', event.event_id])
        }
    }

    render() {
        return (
            <div className="betslip-container">
                <div className="bet-select" onChange={this.changeBetType} >
                    <label className="radio-container" >Single
                         <input type="radio" name="bet" value="single" checked={this.state.currentSelection === 'single'} />
                        <span className="checkmark"></span>
                    </label>
                    <label className="radio-container">Parlay
                     <input type="radio" name="bet" value="parlay" disabled="true" checked={this.state.currentSelection === 'parlay'} />
                        <span className="checkmark"></span>
                    </label>
                    <button id="clearSlip" className="btn-clear-slip" onClick={this.clearBetSlips}>CLEAR SLIP</button>
                </div>
                <div className='bet-black-card bet-slip-card animated fadeInUp'>{

                    this.state.currentSelection == 'single' ? 
                        
                            this.state.currentSlips.single.map(slp => {
                                return <CardSingleBetSlip event={slp} removeBetSlip={() => this.removeBetSlip(slp.event_id, 'single')} />

                            })
                        

                    
                        : 
                            this.state.currentSlips.parlay.map(slp => {
                                return <CardParlayBetSlip event={slp} removeBetSlip={() => this.removeBetSlip(slp.event_id, 'parlay')} />
                            })
                        
                        }
                        
                </div>
                { 
                    this.state.currentSelection === 'parlay' && <CardParlayBetBox parlaySlips={this.state.currentSlips.parlay}/>
                    }
            </div>


        )
    }
}

