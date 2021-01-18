
import Component from '../../core/Component';
import React from 'react';
import { Link } from 'react-router-dom';
import BetModal from '../Modal';
import CardTxLegInfo from './CardTxLegInfo'

export default class CardTxOutOpCodeRow extends Component {

  constructor(props) {
    super(props);
  };

  render() {
    let txAddress;
    const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;
    console.log(this.props)
    let effectiveOdds = 1;
    return (
      <div className="card--block opcode">
        <div className="card__row">
          <BetModal buttonLabel={txAddress = this.props.tx.address} className="test" address={this.props.tx.address} />
        </div>
        {
          this.props.tx.isParlay ? <div style={{backgroundColor:"white"}}> {this.props.tx.legs.map((leg, index) => {
            leg.betResultType = this.props.tx.betResultType
            leg.betValue = this.props.tx.betValue
            leg.betValueUSD = this.props.tx.betValueUSD
            leg.completed = this.props.tx.completed
            leg.index = index + 1
            effectiveOdds = effectiveOdds * leg.price
            return <CardTxLegInfo leg={leg} toggleSwitchOdds={toggleSwitchOdds} isParlay={true} toggleSwitchOddsStyle={toggleSwitchOddsStyle} />

          })}

          <div style={{backgroundColor:"#eee"}}>
            <div className="card__row">
              <span className="card__label" ><strong>Effective Odds</strong></span>
              <span className="card__result">{effectiveOdds.toFixed(2)}</span>
            </div>
            <div className="card__row">
              <span className="card__label" ><strong>BetValue</strong></span>
              <span className="card__result">{this.props.tx.betValue} WGR / {this.props.tx.betValueUSD.toFixed(2)} USD</span>
            </div>

            {this.props.tx.betResultType == "win" ? <div className="card__row">
              <span className="card__label" ><strong>Payout</strong></span>
              <span className="card__result">{this.props.tx.payout.toFixed(2)} / WGR</span>
            </div> : null
            }

            {this.props.tx.betResultType == "win" ? <div className="card__row">
              <span className="card__label" ><strong>Payout Tx Hash</strong></span>
              <span className="card__result"><Link to={`/tx/${this.props.tx.payoutTxId}`}>{this.props.tx.payoutTxId.substr(0, 5) + '...'}</Link></span>
            </div> : null
            }
            </div>


          </div> : (this.props.tx.eventId !== undefined) && <div style={{backgroundColor:"#eee"}}>
            <CardTxLegInfo leg={this.props.tx} isParlay={false} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle} />

            {this.props.tx.betResultType == "win" ? <div className="card__row">
              <span className="card__label" ><strong>Payout</strong></span>
              <span className="card__result">{this.props.tx.payout.toFixed(2)} / WGR</span>
            </div> : null
            }

            {this.props.tx.betResultType == "win" ? <div className="card__row">
              <span className="card__label" ><strong>Payout Tx Hash</strong></span>
              <span className="card__result"><Link to={`/tx/${this.props.tx.payoutTxId}`}>{this.props.tx.payoutTxId.substr(0, 5) + '...'}</Link></span>
            </div> : null
            }
          </div>
        }
      </div>
    );
  };
}
