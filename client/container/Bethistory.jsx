
import Component from '../core/Component';
import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { translate } from 'react-i18next'
import { Link } from 'react-router-dom';
import Card from '../component/Card';
import CardBigTable from "../component/Card/CardBigTable";
import Actions from '../core/Actions'
import Wallet from '../core/Wallet';
import moment from 'moment';
import { date24Format } from '../../lib/date';

class Bethistory extends Component {

   constructor(props) {
    super(props);
    this.state = {
      betHistory: [],
      loading: true
    }
setInterval(() => {
  this.getBetHistory();
}, 25000);
  } 
componentDidMount() {
        this.getBetHistory();
    }
  getBetHistory = () => {
     this.setState({ loading: true }, () => {
      Wallet.instance.getSpentAddresses().then(spentaddresses => {

      console.log(spentaddresses)
      let getMethod = this.props.getBetsForAccount;

      getMethod(spentaddresses)
          .then((data) => {
            console.log(data);
              this.setState({ betHistory: data, loading: false })
          })
          .catch(error => {
              console.log('error', error);
              this.setState({ error, loading: false })
          })

        })

  }) 
  }

  render() {

    const betHistory = this.state.betHistory.map(bet => {
      
      return ({
        ...bet,
        txId: (<Link to={`/tx/${bet.txId}`}>{bet.txId}</Link>),
        betValue: bet.betValue,
        betResultType: bet.betResultType,
        betType: bet.legs && bet.legs.length > 1 ? 'Parlay' : 'Single',
        payout: bet.payout == 0 || bet.betResultType == 'pending' ? "-" : bet.payout,
        payoutTxId: bet.payoutTxId == 'no' || bet.betResultType == 'pending' ? "-" : (<Link to={`/tx/${bet.payoutTxId}`}>{bet.payoutTxId}</Link>),
        createdAt: date24Format(moment(bet.createdAt).utc())
        
      });
    });
    return (
      
      <div className='m-20 bet-history'>
        <h2>Bet Transaction History</h2>
        
        <div className='card__bethistory'>
         { Wallet.instance.walletInstalled && <CardBigTable className='scrollable-table'
                data={betHistory}
                cols={[
                  { title: 'TxId', key: 'txId' },
                  { title: 'Bet Value', key: 'betValue', className: 'cell-ellipsis' },
                  { title: 'Bet Result', key: 'betResultType' },
                  { title: 'Type', key: 'betType' },
                  { title: 'Payout', key: 'payout', className: 'w-m-80' },
                  { title: 'PayoutTx', key: 'payoutTxId' },
                  { title: 'Created', key: 'createdAt' }
                ]}
              /> } 
          
           { !Wallet.instance.walletInstalled &&  <Card>
            <div className='m-20 flex-center card__bethistory__pad'>
              <div>Looks like Wallet Not Connected</div>
              <div>Go to <span className='link'>Help</span>  to install wallet</div>
            </div>
          </Card>  } 
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getBetsForAccount: query => Actions.getBetsForAccount(query)
})

export default compose(
  connect(null, mapDispatch),
  translate('Bethistory'),
)(Bethistory);