
import Component from '../../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class CardLatestBlocks extends Component {
  static defaultProps = {
    totalBet: 0,
    totalMint: 0.0
  };

  static propTypes = {
    totalBet: PropTypes.number.isRequired,
    totalMint: PropTypes.number.isRequired
  };

  render() {

    return (
      <div className="animated fadeInUp w3-tables w3-responsive">
        <table className="w3-table-all">
          <tbody>
            <tr className="table-header">
              <th className=''>HEIGHT</th>
              <th className=''>TRANSACTION HASH</th>
              <th className=''>VALUE</th>
              <th className=''>AGE</th>
              <th className='mobile-recipents'></th>
              <th className=''>CREATED</th>
            </tr>
            {
              MOKEDATA.map((item, index) =>
                <tr key={index} className='table-item'>
                  <td className="">{item.height}</td>
                  <td className="cell-ellipsis">{item.hash}</td>
                  <td >{item.value}</td>
                  <td className="mobile-age">{item.age}</td>
                  <td className="">{item.recipents}</td>
                  <td style={{ minWidth: 110 }}>{item.created}</td>
                </tr>)}
          </tbody>
        </table>
      </div>
    );
  };
}

const MOKEDATA = [
  { id: 1, height: '126217', hash: 'fbef8932kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujffbef8932kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf', value: '112.3700000', age: '-97', recipents: '12', created: '2019-12-12 12:12:12 UTC' },
  { id: 2, height: '234432', hash: 'ceewf23fdec 32jhkejf23847324fj349823rrjf23ru23ujffbef8932kfj32r23432jhkejf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf23847324fj349823rrjf23ru23ujf', value: '42.37023000', age: '-2', recipents: '3', created: '2019-12-12 12:12:12 UTC' },
  { id: 3, height: '036217', hash: '3243523ddxd432jhkejf23847324fj349823rrjf23ru23ujffbef8932kfj32r23432jhkejf23847324fj349823rrjf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf23ru23ujf', value: '112.70003', age: '-31', recipents: '43', created: '2019-12-12 12:12:12 UTC' },
]