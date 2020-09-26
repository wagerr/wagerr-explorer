
import Component from '../../core/Component';
import { date24Format } from '../../../lib/date';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';
import CardBigTable from "./CardBigTable";

export default class CardBlockTXs extends Component {
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
        { key: 'txId', title: 'Transaction ID' },
        { key: 'recipients', title: 'Recipients' },
        { key: 'createdAt', title: 'Time', className: 'w-m-160' },
      ]
    };
  };

  render() {
    return (
      <div className="animated fadeIn">
      <CardBigTable
        cols={ this.state.cols }
        data={ this.props.txs.map(tx => ({
          ...tx,
          createdAt: date24Format(tx.createdAt),
          recipients: tx.vout.length,
          txId: (
            <Link to={ `/explorer/tx/${ tx.txId }` }>{ tx.txId }</Link>
          )
        })) } />
        </div>
    );
  };
}
