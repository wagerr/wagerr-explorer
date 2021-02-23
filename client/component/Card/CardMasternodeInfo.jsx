
import Component from '../../core/Component';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';

export default class CardMasternodeInfo extends Component {
  
  render() {
    return (
      <div className="animated fadeInUp">
        <Card className="card--status" title="Masternode info">
        <div className="card__row bg-eee">
          <span className="card__label">Masternode Requirement</span>
          <span className="card__result">
           25000 WGR
          </span>          
        </div>
        <div className="card__row">
          <span className="card__label">Masternode Cost </span>
          <span className="card__result">
           ${ numeral(25000 * this.props.usd).format('0,0') } (25000 WGR * {numeral(this.props.usd).format('0,0.00')}) 
          </span>          
        </div>   
        <div className="card__row bg-eee">
          <span className="card__label">Supply Locked </span>
          <span className="card__result">
           {25000 * this.props.online} WGR
          </span>          
        </div>       
        </Card>
      </div>
    );
  };
}
