import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux'
import { translate } from 'react-i18next';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import Footer from '../component/Footer';
import Card from '../component/Card';

class NewBetEvent extends Component {
  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0,
      mokeData: MONEYDATA
    };
  };

  render() {
    const { location } = this.props;
    const { tabIndex, mokeData } = this.state;
    const explore_class = location.pathname.includes('explorer') && 'content-top';
    return (
      <div className={`content ${explore_class}`} id="body-content">
        <ExplorerMenu onSearch={this.props.handleSearch} />
        <div className="content__wrapper_total">
          <div className="animated fadeInUp content_search_wrapper">
            <div className="content_page_title">
              <span>BET EVENTS INFO</span>
            </div>
          </div>

          <div className="content__wrapper">

            <div className="animated fadeInUp m-t-20 m-h-20">
              <div className="search__card flex-center">
                <img src={'/img/uiupdate/search.png'} alt={'search'} />
              </div>
              <input
                className="search__input search__input__icon"
                placeholder={'Find team names, event ids, sports or tournaments.'}
              />
            </div>

            <div className="row">
              <div className="col-md-12 col-lg-6">
                <div className='card'>
                  <div className='card__pane'>
                    <div className={`card__pane__tab ${tabIndex === 1 && 'card__pane__tabActive'}`} onClick={()=>this.setState({tabIndex: 1, mokeData: MONEYDATA})}>Money Line</div>
                    <div className={`card__pane__tab ${tabIndex === 2 && 'card__pane__tabActive'}`} onClick={()=>this.setState({tabIndex: 2, mokeData: SPREADDATA})}>Spread</div>
                    <div className={`card__pane__tab ${tabIndex === 3 && 'card__pane__tabActive'}`} onClick={()=>this.setState({tabIndex: 3, mokeData: OVERDATA})}>Over/Under</div>
                  </div>
                  <table className="w3-table-all font-14">
                    <tbody>
                      {
                        mokeData.map((item, index) =>
                          <tr key={index} >
                            <td className="text-left">{item.label}</td>
                            <td className="text-right">
                              <div className={`${item.label === 'Home Bet Amount:' && 'card__snap'}`}>
                                {item.value}
                              </div>
                            </td>
                          </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-12 col-lg-6">
                <Card title={'Bet Result'}>
                  <div className='space-between direction-row p-13'>
                    <div>Result:</div>
                    <div>Waiting For Oracle</div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="animated fadeInUp w3-tables w3-responsive m-t-20">

              <table className="w3-table-all">
                <tbody>
                  <tr className="table-header">
                    <th className=''>TIME</th>
                    <th style={{ minWidth: 100 }} className='text-center'>HOME ODDS</th>
                    <th style={{ minWidth: 100 }} className='text-center'>DRAW ODDS</th>
                    <th style={{ minWidth: 100 }} className='text-center'>AWAY ODDS</th>
                    <th className=''>TX ID</th>
                  </tr>
                  {
                    MOKEDATA.map((item, index) =>
                      <tr key={index} >
                        <td style={{ minWidth: 210 }}>{item.time}</td>
                        <td className="text-center">{item.home}</td>
                        <td className="text-center">{item.draw}</td>
                        <td className="text-center">{item.away}</td>
                        <td className="cell-ellipsis">{item.hash}</td>
                      </tr>)}
                </tbody>
              </table>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({

});

const mapState = state => ({
  txs: state.txs
});

export default compose(
  translate('overview'),
  connect(mapState, mapDispatch),
)(NewBetEvent);

const MOKEDATA = [
  { id: 1, hash: 'fbef8932kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujffbef8932kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf', home: 1.69, draw: 4.41, away: 5.58, time: '2019-12-12 12:12:12 UTC' },
  { id: 2, hash: 'ceewf23fdec 32jhkejf23847324fj349823rrjf23ru23ujffbef8932kfj32r23432jhkejf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf23847324fj349823rrjf23ru23ujf', home: 6.22, draw: 7.43, away: 8.38, time: '2019-12-12 12:12:12 UTC' },
  { id: 3, hash: '3243523ddxd432jhkejf23847324fj349823rrjf23ru23ujffbef8932kfj32r23432jhkejf23847324fj349823rrjf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf2kfj32r23432jhkejf23847324fj349823rrjf23ru23ujf23ru23ujf', home: 4.49, draw: 3.41, away: 2.58, time: '2019-12-12 12:12:12 UTC' },
]

const MONEYDATA = [
  { label: 'Time:', value: '2019-12-10 20:00:00 UTC'},
  { label: 'League:', value: 'The Championship'},
  { label: 'Home Team:', value: 'Stoke City'},
  { label: 'Away Team:', value: 'Luton Town'},
  { label: 'Home Bet Num:', value: '0'},
  { label: 'Home Bet Amount:', value: '0.00000000'},
  { label: 'Draw Bet Num:', value: '0'},
  { label: 'Draw Bet Amount:', value: '0.00000000'},
  { label: 'Away Bet Num:', value: '0'},
  { label: 'Away Bet Amount:', value: '0.00000000'},
]

const SPREADDATA = [
  { label: 'Time:', value: '2019-12-10 20:00:00 UTC'},
  { label: 'Home Bet Amount:', value: '0.00000000'},
  { label: 'Draw Bet Num:', value: '0'},
  { label: 'Draw Bet Amount:', value: '0.00000000'},
  { label: 'Away Bet Num:', value: '0'},
  { label: 'Away Bet Amount:', value: '0.00000000'},
]

const OVERDATA = [
  { label: 'Time:', value: '2019-12-10 20:00:00 UTC'},
  { label: 'League:', value: 'The Championship'},
  { label: 'Home Team:', value: 'Stoke City'},
  { label: 'Away Team:', value: 'Luton Town'},
  { label: 'Home Bet Num:', value: '0'},
  { label: 'Home Bet Amount:', value: '0.00000000'},
  { label: 'Draw Bet Num:', value: '0'},
]