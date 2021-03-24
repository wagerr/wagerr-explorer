
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config'
import Table from '../Table';
import BetModal from '../Modal';
import CardTxOutOpCodeRow from './CardTxOutOpCodeRow'
import { TXS } from '../../constants';
import CardBigTable from "./CardBigTable";

export default class CardTXOut extends Component {
  static defaultProps = {
    txs: []
  };

  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'address', title: 'Address' },
        { key: 'value', title: 'Amount' }
      ]
    };
  };

  render() {
    let txAddress;
    const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;
    return (
      <CardBigTable
        cols={ this.state.cols }
        data={ this.props.txs.map(tx => ({
          ...tx,
          address: (tx.address.indexOf('OP_RETURN 1|') !== -1 || tx.address.indexOf('OP_RETURN 2|') !== -1 || tx.address.indexOf('OP_RETURN 3|') !== -1) ?
              <Link to={`/bet/event/${ encodeURIComponent(tx.address.split('|')[2]) }`}>{tx.address}</Link>
              :  (tx.address.indexOf('OP_RETURN') !== -1 ) ? <CardTxOutOpCodeRow tx={tx} toggleSwitchOdds={toggleSwitchOdds} toggleSwitchOddsStyle={toggleSwitchOddsStyle}/> : <Link to={`/address/${tx.address}`}>{tx.address}</Link>,
          value: (
            (config.coin.oracle_payout_address.includes(tx.address)) ?
              <span>  <span className="badge badge-success">Oracle</span>
              <span className="badge badge-success">
              {numeral(tx.value).format('0,0.00')} WGR
            </span></span>
              : (config.coin.dev_payout_address.includes(tx.address)) ?
              <span>  <span className="badge badge-success">Dev</span>
              <span className="badge badge-success">
              {numeral(tx.value).format('0,0.00')} WGR
            </span></span>
              :
              <span className="badge badge-success">
              {numeral(tx.value).format('0,0.00')} WGR
            </span>
          )
        }))}/>
    );
  };
}
