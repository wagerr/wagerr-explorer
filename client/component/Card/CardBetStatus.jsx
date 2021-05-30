
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config';
import Switch from "react-switch";

import Card from './Card';
import CountUp from '../CountUp';
import numeral from 'numeral'

export default class CardBetStatus extends Component {
  
  constructor() {
    super();
    this.state = {
      YTD: false
    }
  }

  static defaultProps = {
    totalBet: 0,
    totalMint: 0.0,
    totalBetYTD: 0,
    totalMintYTD:0.0
  };

  static propTypes = {
    totalBet: PropTypes.number.isRequired,
    totalMint: PropTypes.number.isRequired,
    totalBetYTD: PropTypes.number.isRequired,
    totalMintYTD:PropTypes.number.isRequired
  };

  

  render() {

    return (
      <div className="animated fadeInUp">
      <Card title="Bet Status" className="card--status" actionItem={
                            <div>  <span>YTD / Alltime </span> <Switch
                                            checked={this.state.YTD}
                                            onChange={(checked)=>{this.setState({YTD:checked})}}
                                            onColor="#ffff"
                                            offColor="#ffff"
                                            onHandleColor="#ffff"
                                            handleDiameter={18}
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                            height={15}
                                            width={30}
                                            className="react-switch mr-3"
                                            id="material-switch"
                                        />
</div>  
                                  
                                   
        }>
                                    
        <div className="card__row bg-eee">
          <span className="card__label">{this.state.YTD? 'TOTAL BET':'BET (YTD)'} :</span>
          <span className="card__result">{!this.state.YTD? numeral(this.props.totalBetYTD).format('0,0.00'):numeral(this.props.totalBet).format('0,0.00')} WGR</span>
        </div>
        <div className="card__row bg-eee">
          <span className="card__label">TOTAL BET PENDING:</span>
          <span className="card__result">{numeral(this.props.totalBetPending).format('0,0.00')} WGR</span>
        </div>
        <div className="card__row">
          <span className="card__label"> {this.state.YTD? 'TOTAL MINT':'MINT (YTD)'} :</span>
          <span className="card__result">{!this.state.YTD?numeral(this.props.totalMintYTD).format('0,0.00'): numeral(this.props.totalMint).format('0,0.00')} WGR</span>
        </div>
        <div className="card__row bg-eee">
          <span className="card__label">{this.state.YTD? 'NET SUPPLY CHANGE':'NET SUPPLY CHANGE (YTD)'} :</span>
          <span className="card__result">{!this.state.YTD? numeral(this.props.totalMintYTD - this.props.totalBetYTD).format('0,0.00'):numeral(this.props.totalMint - this.props.totalBet).format('0,0.00')} WGR</span>
        </div>
        <div className="card__row">
          <span  style={{color:"rgba(0, 0, 0,.5)", fontSize: '15px', padding: '5px 0px'}}> Please refer to total supply currently, these numbers are being improved</span>
        </div>
      </Card>
      </div>
    );
  };
}
