import Component from "../../core/Component";
import React from "react";
import _ from "lodash";
import Wallet from "../../core/Web3/Wallet";
import { parlayToOpcode } from "../utils/betUtils";
import { MIN_BETTING_AMOUNT, MAX_BETTING_AMOUNT } from "../../constants";

export default class CardParlayBetBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      legs: [],
      totalOdds: 0,
      betAmount: "",
      minAmountIn: 0,
      chainFee: 0,
      potentialReturn: 0,
      needApproval: false,
    };

    this.walletClient = null;
  }
  componentWillReceiveProps(props) {
    const parlayslips = props.parlaySlips;
    parlayslips.forEach((event) => {
      switch (event.outcome) {
        case 1:
          event.effectiveOddValue = event.odds[0].mlHomeEO;
          break;
        case 2:
          event.effectiveOddValue = event.odds[0].mlAwayEO;
          break;
        case 3:
          event.effectiveOddValue = event.odds[0].mlDrawEO;
          break;
        case 4:
          event.effectiveOddValue = event.odds[1].spreadHomeEO;
          break;
        case 5:
          event.effectiveOddValue = event.odds[1].spreadAwayEO;
          break;
        case 6:
          event.effectiveOddValue = event.odds[2].totalsOverEO;
          break;
        case 7:
          event.effectiveOddValue = event.odds[2].totalsUnderEO;
          break;
      }
    });

    const totalodds = _.round(
      _.reduce(
        parlayslips,
        (mul, s) => mul * parseFloat(s.effectiveOddValue),
        1
      ),
      2
    );
    const legs = parlayslips.map((s) => {
      return {
        eventid: s.event_id,
        outcome: s.outcome,
      };
    });

    this.setState({
      legs: legs,
      totalOdds: totalodds,
      potentialReturn: _.round(this.state.betAmount * totalodds, 2),
    });
  }

  handleChange = async (e) => {
    if (!Wallet.instance.currentProvider) return;
    const target = { ...e.target };
    this.setState({
      betAmount: target.value,
      potentialReturn: _.round(target.value * this.state.totalOdds, 2),
    });

    if (!target.value || target.value <= 0) {
      this.setState({ betAmount: "" });
      return;
    }

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
  };;

  doBet = async () => {
    let opcode = "";
    try {
      opcode = parlayToOpcode(this.state.legs);
    } catch (e) {
      console.log("invalid opcode: ", e);
      alert("Invalid opcode: " + e.toString().replace(/Error:/g, ""));
      return;
    }

    PubSub.publish("processing", true);
    const res = await Wallet.instance.sendBet(opcode, this.state.minAmountIn);
    PubSub.publish("processing", false);

    this.props.clearBetSlip();
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
    this.setState({ needApproval: !approved });
    PubSub.publish("processing", false);
  };
  render() {
    const isValidBetAmount = (betAmount) =>
      betAmount >= MIN_BETTING_AMOUNT && betAmount <= MAX_BETTING_AMOUNT;
    return (
      <div className="place-bet-box">
        <div className="total-parlay">
          <span>Total Legs : {this.state.legs.length}</span>
          <span>Total Odds : {this.state.totalOdds}</span>
        </div>
        <div className="parlay-form">
          <label className="total-parlay">
            <span className="span_bet">BET</span>
            <input
              type="text"
              className="bet-value"
              placeholder="Enter bet amount"
              onChange={this.handleChange}
              onFocus={this.handleChange}
              value={this.state.betAmount}
            />
            <span className="afterInput"></span>
          </label>
          {this.state.betAmount > 0 && !isValidBetAmount(this.state.betAmount) && (
            <p className="text-center">
              {" "}
              Amount error: (Min {MIN_BETTING_AMOUNT} - Max {MAX_BETTING_AMOUNT})
            </p>
          )}
          {isValidBetAmount(this.state.betAmount) && (
            <div>
              <p className="text-center">
                Total: {_.round(this.state.minAmountIn, 5)}{" "}
                {Wallet.instance.currentProvider == "MM"
                  ? " , fees included : " + (+this.state.chainFee).toFixed(4)
                  : ""}{" "}
                {Wallet.instance.currentCoin.label}
              </p>
              <label className="place-bet-box__label text-center">
                Potential Return :<span>{this.state.potentialReturn} tWGR</span>
              </label>
            </div>
          )}
          <button
            className="btn-place-bet"
            disabled={
              !isValidBetAmount(this.state.betAmount) ||
              this.state.legs.length < 2
            }
            onClick={async () => {
              this.state.needApproval
                ? await this.approve()
                : await this.doBet();
            }}
          >
            {this.state.needApproval ? "APPROVE" : "PLACE BET"}
          </button>
          {isValidBetAmount(this.state.betAmount) &&
            this.state.needApproval && (
              <p className="mb-2 text-danger text-center">
                You need to approve one time to allow token access to
                smartcontract.
              </p>
            )}
        </div>
      </div>
    );
  }
}
