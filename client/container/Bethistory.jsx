import Component from "../core/Component";
import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { translate } from "react-i18next";
import { Link } from "react-router-dom";
import Card from "../component/Card";
import CardBigTable from "../component/Card/CardBigTable";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import Actions from "../core/Actions";
import Wallet from "../core/Wallet";
import moment from "moment";
import { date24Format } from "../../lib/date";
import classnames from "classnames";

class Bethistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      betHistory: [],
      loading: true,
    };
    this.bscExplorer = "https://testnet.bscscan.com/";
    setInterval(() => {
      this.getBetHistory();
    }, 25000);
  }
  componentDidMount() {
    this.getBetHistory();
    Wallet.instance.walletChanged.subscribe(() => this.refreshHistory());
  }
  refreshHistory = () => {
    this.setState({ betHistory: [] }, () => this.getBetHistory());
  };
  getBetHistory = () => {
    this.setState({ loading: true }, () => {
      Wallet.instance.getSpentAddresses().then((spentaddresses) => {
        if (Wallet.instance.currentProvider == "WGR") {
          let getMethod = this.props.getBetsForAccount;
          getMethod(spentaddresses)
            .then((data) => {
              this.setState({ betHistory: data, loading: false });
            })
            .catch((error) => {
              console.log("error", error);
              this.setState({ error, loading: false });
            });
        } else if (Wallet.instance.currentProvider == "MM") {
          let getCrosschainBets = this.props.getCrosschainBets;
          getCrosschainBets(spentaddresses[0])
            .then((data) => {
              this.setState({ betHistory: data, loading: false });
            })
            .catch((error) => {
              console.log("error", error);
              this.setState({ error, loading: false });
            });
        }
      });
    });
  };

  render() {
    let betHistory = [];
    if (Wallet.instance.currentProvider == "WGR") {
      betHistory = this.state.betHistory.map((bet) => {
        return {
          ...bet,
          txId: <Link to={`/tx/${bet.txId}`}>{bet.txId}</Link>,
          betValue: bet.betValue,
          betResultType: bet.betResultType,
          betType: bet.legs && bet.legs.length > 1 ? "Parlay" : "Single",
          payout:
            bet.payout == 0 || bet.betResultType == "pending"
              ? "-"
              : bet.payout,
          payoutTxId:
            bet.payoutTxId == "no" || bet.betResultType == "pending" ? (
              "-"
            ) : (
              <Link to={`/tx/${bet.payoutTxId}`}>{bet.payoutTxId}</Link>
            ),
          createdAt: date24Format(moment(bet.createdAt).utc()),
        };
      });
    } else if (Wallet.instance.currentProvider == "MM") {
      betHistory = this.state.betHistory.map((bet) => {
        return {
          ...bet,
          txId:
            bet.chainBetTxHash == null ? (
              "-"
            ) : (
              <a
                href={`${this.bscExplorer}/tx/${bet.chainBetTxHash}`}
                target="_blank"
              >
                {bet.chainBetTxHash.substring(0, 10)}
              </a>
            ),

          wgrBetTx:
            bet.wgrBetTx == null ? (
              "-"
            ) : (
              <Link to={`/tx/${bet.wgrBetTx}`}>
                {bet.wgrBetTx.substring(0, 10)}
              </Link>
            ),
          betAmount: bet.betAmount / 10 ** 18,
          betType: bet.betType,
          wgrBetStatus: bet.wgrBetStatus,
          betResultType: bet.wgrBetResultType,
          payout: bet.payout,
          wgrPayoutTxId:
            bet.wgrPayoutTx == null ? (
              "-"
            ) : (
              <Link to={`/tx/${bet.wgrPayoutTx}`}>
                {bet.wgrPayoutTx.substring(0, 10)}
              </Link>
            ),
          bscPayoutTxId:
            bet.bscPayoutTx == null ? (
              "-"
            ) : (
              <a
                href={`${this.bscExplorer}/tx/${bet.bscPayoutTx}`}
                target="_blank"
              >
                {bet.bscPayoutTx.substring(0, 10)}
              </a>
            ),
          createdAt: date24Format(moment(bet.createdAt).utc()),
        };
      });
    }
    return (
      <div className="m-20 bet-history">
        <h2>Bet Transaction History</h2>

        <div className="card__bethistory">
          {Wallet.instance.currentProvider == "WGR" && (
            <CardBigTable
              className="scrollable-table"
              data={betHistory}
              cols={[
                { title: "TxId", key: "txId" },
                {
                  title: "Bet Value",
                  key: "betValue",
                  className: "cell-ellipsis",
                },
                { title: "Bet Result", key: "betResultType" },
                { title: "Type", key: "betType" },
                { title: "Payout", key: "payout", className: "w-m-80" },
                { title: "PayoutTx", key: "payoutTxId" },
                { title: "Created", key: "createdAt" },
              ]}
            />
          )}

          {Wallet.instance.currentProvider == "MM" && (
            <CardBigTable
              className="scrollable-table"
              data={betHistory}
              cols={[
                { title: "TxId", key: "txId" },
                { title: "WgrTxId", key: "wgrBetTx" },
                {
                  title: "Bet Value",
                  key: "betAmount",
                  className: "cell-ellipsis",
                },
                { title: "Type", key: "betType" },
                { title: "CrossChain Status", key: "wgrBetStatus" },
                { title: "Bet Result", key: "betResultType" },
                { title: "Payout", key: "wgrPayout", className: "w-m-80" },
                { title: "PayoutTxWGR", key: "wgrPayoutTxId" },
                { title: "PayoutTxBSC", key: "bscPayoutTxId" },
                { title: "Created", key: "createdAt" },
              ]}
            />
          )}

          {Wallet.instance.currentProvider == null && (
            <Card>
              <div className="m-20 flex-center card__bethistory__pad">
                <div>Looks like Wallet Not Connected</div>
                <div>
                  Go to <span className="link">Help</span> to install wallet
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }
}

const mapDispatch = (dispatch) => ({
  getBetsForAccount: (query) => Actions.getBetsForAccount(query),
  getCrosschainBets: (query) => Actions.getCrosschainBets(query),
});

export default compose(
  connect(null, mapDispatch),
  translate("Bethistory")
)(Bethistory);
