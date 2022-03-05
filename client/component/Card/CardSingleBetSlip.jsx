import Component from "../../core/Component";
import React from "react";
import _ from "lodash";
import { singleToOpcode } from "../utils/betUtils";
import Wallet from "../../core/Web3/Wallet";
import PubSub from "pubsub-js";
import { MIN_BETTING_AMOUNT, MAX_BETTING_AMOUNT } from "../../constants";

export default class CardSingleBetSlip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      betAmount: "",
      minAmountIn: 0,
      chainFee: 0,
      betProcessing: false,
      needApproval: false,
    };
  }

  componentDidMount() {
    this.prepareSlip();
  }

  handleChange = async (e) => {
    if (!Wallet.instance.currentProvider) return;
    const target = { ...e.target };

    if (!target.value || target.value <= 0) {
      this.setState({ betAmount: "" });
      return;
    }
    this.setState({ betAmount: target.value });

    if (Wallet.instance.currentProvider == "WGR") {
      this.setState({ minAmountIn: target.value });
      return;
    }
    const minAmountIn = await Wallet.instance.getInputAmount(target.value);
    this.setState({ minAmountIn: minAmountIn });
    const fee = await Wallet.instance.getFee();
    this.setState({ chainFee: fee.toString() });
    const needApproval = await Wallet.instance.needApproval(minAmountIn);
    this.setState({
      needApproval: needApproval,
    });
  };
  prepareSlip = () => {
    const { event } = this.props;
    switch (event.outcome) {
      case 1:
        event.betType = "ML";
        event.outComeTeam = event.teams.home;
        event.selectedOddValue = event.odds[0].mlHome;
        event.effectiveOddValue = event.odds[0].mlHomeEO;
        break;
      case 2:
        event.betType = "ML";
        event.outComeTeam = event.teams.away;
        event.selectedOddValue = event.odds[0].mlAway;
        event.effectiveOddValue = event.odds[0].mlAwayEO;
        break;
      case 3:
        event.betType = "ML";
        event.outComeTeam = "DRAW";
        event.selectedOddValue = event.odds[0].mlDraw;
        event.effectiveOddValue = event.odds[0].mlDrawEO;
        break;
      case 4:
        event.betType = "SP";
        event.outComeTeam = event.teams.home;
        event.selectedOddValue = event.odds[1].spreadHome;
        event.effectiveOddValue = event.odds[1].spreadHomeEO;
        event.handicap = "Handicape " + event.spreadPoints;
        break;
      case 5:
        event.betType = "SP";
        event.outComeTeam = event.teams.away;
        event.selectedOddValue = event.odds[1].spreadAway;
        event.effectiveOddValue = event.odds[1].spreadAwayEO;
        event.handicap = "Handicape " + event.spreadPoints;
        break;
      case 6:
        event.betType = "OVER";
        event.outComeTeam = event.odds[2].totalsPoints;
        event.selectedOddValue = event.odds[2].totalsOver;
        event.effectiveOddValue = event.odds[2].totalsOverEO;
        break;
      case 7:
        event.betType = "UNDER";
        event.outComeTeam = event.odds[2].totalsPoints;
        event.selectedOddValue = event.odds[2].totalsUnder;
        event.effectiveOddValue = event.odds[2].totalsUnderEO;
        break;
    }

    this.setState({ event: event });
  };

  doBet = async () => {
    let opcode = "";
    try {
      opcode = singleToOpcode(this.state.event);
    } catch (e) {
      console.log("invalid opcode: ", e);
      alert("Invalid opcode: " + e.toString().replace(/Error:/g, ""));
      return;
    }
    PubSub.publish("processing", true);
    const res = await Wallet.instance.sendBet(opcode, this.state.minAmountIn);
    PubSub.publish("processing", false);
    if (res == null) return;

    this.props.removeBetSlip();

    const txHash = res.hash;

    if (Wallet.instance.currentProvider == "MM") {
      const id = setInterval(async () => {
        const crosschainTxId = await Wallet.instance.getCrosschainTx(txHash);
        if (crosschainTxId) {
          clearInterval(id);
          alert("Bet Placed, Check bet history.");
        }
      }, 2000);
    } else if (Wallet.instance.currentProvider == "WGR") {
      alert("Bet Placed, Check bet history.");
    }
  };
  approve = async () => {
    PubSub.publish("processing", true);
    const approved = await Wallet.instance.approve(this.state.minAmountIn);

    this.setState({
      needApproval: !approved,
    });
    PubSub.publish("processing", false);
  };

  render() {
    const { props } = this;
    const isValidBetAmount = (betAmount) =>
      betAmount >= MIN_BETTING_AMOUNT && betAmount <= MAX_BETTING_AMOUNT;
    return (
      this.state.event && (
        <div className="bet-slip-box">
          <div className="slip-body">
            <div className="slip-title">
              <span>
                {this.state.event.teams.home} vs {this.state.event.teams.away}
              </span>
              <button className="slip-close" onClick={props.removeBetSlip}>
                x
              </button>
            </div>
            <label>YOUR PICK :</label>
            <label className="team-name">
              {this.state.event.betType}
              {" | "}
              {this.state.event.outComeTeam}
            </label>
            <span className="slip-body__points">
              {this.state.event.selectedOddValue}
            </span>
            <form className="bet-form">
              <input
                type="text"
                id="bet-value"
                className="bet-value"
                value={this.state.betAmount}
                onChange={this.handleChange}
                onFocus={this.handleChange}
              />
              <span className="afterElement"></span>
            </form>
            <button
              className="bet-form__btn-bet"
              disabled={!isValidBetAmount(this.state.betAmount)}
              onClick={async () => {
                this.state.needApproval
                  ? await this.approve()
                  : await this.doBet();
              }}
            >
              {this.state.needApproval ? "APPROVE" : "BET"}
            </button>
            {isValidBetAmount(this.state.betAmount) &&
              this.state.needApproval && (
                <p className="mb-2 text-danger">
                  You need to approve one time to allow token access to
                  smartcontract.
                </p>
              )}
            {this.state.betAmount > 0 &&
              !isValidBetAmount(this.state.betAmount) && (
                <p className="text-center text-danger mb-3">
                  Amount error: (Min {MIN_BETTING_AMOUNT} - Max{" "}
                  {MAX_BETTING_AMOUNT})
                </p>
              )}
            {isValidBetAmount(this.state.betAmount) && (
              <div className="bet-figures">
                <p className="title"> Transaction Details</p>
                <p>
                  <span>Total: </span>
                  {_.round(this.state.minAmountIn, 6)}
                </p>
                
                  {Wallet.instance.currentProvider == "MM"
                    ? <p>
                        <span>Fees included: </span>
                    {(+this.state.chainFee).toFixed(4)}</p>
                    : ""}
                  {Wallet.instance.currentCoin.label}
               
                <p>
                  <span>Potential Returns: </span>
                  {_.round(
                    this.state.betAmount * this.state.event.effectiveOddValue,
                    2
                  )} {" "}
                  WGR (less fees)
                </p>
              </div>
            )}
          </div>
        </div>
      )
    );
  }
}
