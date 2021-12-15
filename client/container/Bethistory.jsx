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
import Wallet from "../core/Web3/Wallet";
import moment from "moment";
import { date24Format } from "../../lib/date";
import classnames from "classnames";
import Icon from "../component/Icon";
import { UncontrolledTooltip } from "reactstrap";

class Bethistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      betHistory: [],
      loading: true,
    };

    this.outcomeToSides = {
      1: "ML-HOME",
      2: "ML-AWAY",
      3: "SPD-HOME",
      4: "SPD-AWAY",
      5: "TLS-UNDER",
      6: "TLS-OVER",
    };

    setInterval(() => {
      this.getBetHistory();
    }, 25000);
  }
  componentDidMount() {
    this.getBetHistory();

    Wallet.instance.providerEvents.subscribe((event) => {
      if (["accountsChanged", "walletConnected"].includes(event)) {
        this.refreshHistory();
      }
    });
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
          getCrosschainBets({
            chain: Wallet.instance.currentNetwork.chain,
            account: spentaddresses[0],
          })
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

  generateLegToolTip = (bet) => {
    if (Wallet.instance.currentProvider == "MM") {
      return (
        bet.legsInfo && (
          <span id={"_" + bet._id}>
            <Icon name="info-circle" />
            <UncontrolledTooltip
              placement="right"
              target={"_" + bet._id}
              autohide={false}
            >
              {bet.legsInfo.map((l) => {
                return (
                  <div>
                    <a
                      href={`#/bet/event/${l["event-id"]}`}
                      style={{ color: "white" }}
                    >
                      {l.lockedEvent.tournament}
                      <br />
                      {l.lockedEvent.home + " vs " + l.lockedEvent.away}
                      <br />
                    </a>

                    <span>
                      {l.legResultType} <br />
                      {l["event-id"].toString()} <br />
                      {this.outcomeToSides[l.outcome.toString()]}
                    </span>
                    <br />
                    <br />
                  </div>
                );
              })}
            </UncontrolledTooltip>
          </span>
        )
      );
    }

    if (Wallet.instance.currentProvider == "WGR") {
      const info = (l) => (
        <div>
          <Link
            Link
            to={`/bet/event/${l["eventId"]}`}
            style={{ color: "white" }}
          >
            {l.league}
            <br />
            {l.homeTeam + " vs " + l.awayTeam}
            <br />
          </Link>

          <span>
            {l.resultType} <br />
            {l["eventId"].toString()} <br />
            {this.outcomeToSides[l.outcome.toString()]}
          </span>
          <br />
          <br />
        </div>
      );

      const view = bet.legs
        ? bet.legs.map((l) => {
            return info(l);
          })
        : info({
            ...bet,
            outcome: bet.transaction.outcome,
            resultType: bet.betResultType,
            homeTeam: bet.event.homeTeam,
            awayTeam: bet.event.awayTeam,
          });

      return (
        <span id={"_" + bet._id}>
          <Icon name="info-circle" />
          <UncontrolledTooltip
            placement="right"
            target={"_" + bet._id}
            autohide={false}
          >
            {view}
          </UncontrolledTooltip>
        </span>
      );
    }
  };
  render() {
    let betHistory = [];
    if (Wallet.instance.currentProvider == "WGR") {
      betHistory = this.state.betHistory.map((bet) => {
        return {
          ...bet,
          txId: <Link to={`/tx/${bet.txId}`}>{bet.txId}</Link>,
          betValue: bet.betValue,
          betType: bet.legs && bet.legs.length > 1 ? "Parlay" : "Single",
          betInfo: this.generateLegToolTip(bet),
          betResultType: bet.betResultType,
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
                href={`${Wallet.instance.currentNetwork.explorer}/tx/${bet.chainBetTxHash}`}
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
          wgrAmount:
            bet.wgrAmount.toString() + " + " + bet.fees.toFixed(2) + " fees",
          coin: bet.coin,
          coinAmount: bet.coinAmount,
          betType: bet.betType,
          betInfo: this.generateLegToolTip(bet),
          crosschainStatus:
            bet.crosschainStatus == "refunded" ? (
              <div>
                {bet.crosschainStatus} (
                <a
                  href={`${Wallet.instance.currentNetwork.explorer}/tx/${bet.chainRefundTx}`}
                  target="_blank"
                >
                  {bet.chainRefundTx.substring(0, 6)}
                </a>
                )
              </div>
            ) : (
              bet.crosschainStatus
            ),
          betResultType: bet.wgrBetResultType,
          payout: bet.payout
            ? bet.payout.toFixed(2) +
              " + " +
              bet.payoutFees.toFixed(2) +
              " fees (" +
              bet.payoutCoinAmount.toFixed(4) +
              " " +
              bet.coin +
              ")"
            : "-",
          wgrPayoutTxId:
            bet.wgrPayoutTx == null ? (
              "-"
            ) : (
              <Link to={`/tx/${bet.wgrPayoutTx.split("-")[0]}`}>
                {bet.wgrPayoutTx.substring(0, 10)}
              </Link>
            ),
          chainPayoutTxId:
            bet.chainPayoutTx == null ? (
              "-"
            ) : (
              <a
                href={`${Wallet.instance.currentNetwork.explorer}/tx/${bet.chainPayoutTx}`}
                target="_blank"
              >
                {bet.chainPayoutTx.substring(0, 10)}
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
                  title: "Bet Amount",
                  key: "betValue",
                  className: "cell-ellipsis",
                },
                { title: "Type", key: "betType" },
                { title: "betInfo", key: "betInfo" },
                { title: "Bet Result", key: "betResultType" },
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
                  title: "Bet Amount",
                  key: "wgrAmount",
                  className: "cell-ellipsis",
                },
                {
                  title: "Coin",
                  key: "coin",
                  className: "cell-ellipsis",
                },
                {
                  title: "Coin Amount",
                  key: "coinAmount",
                  className: "cell-ellipsis",
                },
                { title: "Type", key: "betType" },
                { title: "betInfo", key: "betInfo" },
                { title: "CrossChain Status", key: "crosschainStatus" },
                { title: "Bet Result", key: "betResultType" },
                { title: "Payout", key: "payout", className: "w-m-80" },
                { title: "PayoutTxWGR", key: "wgrPayoutTxId" },
                { title: "PayoutTXChain", key: "chainPayoutTxId" },
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
  getCrosschainBets: (query) => Actions.getCrosschainBetsByAccount(query),
});

export default compose(
  connect(null, mapDispatch),
  translate("Bethistory")
)(Bethistory);
