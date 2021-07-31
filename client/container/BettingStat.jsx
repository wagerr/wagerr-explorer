
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import React from 'react';
import BarChart from '../component/Graph/BarChart';
import { Card, Row, Col } from 'reactstrap';
import numeral from 'numeral'
import CardBigTable from "../component/Card/CardBigTable";
import HorizontalRule from '../component/HorizontalRule';

class BettingStat extends Component {

  constructor(props) {
    super(props)
    this.debounce = null
    this.state = {
      error: null,
      loading: true
    }
  }

  componentDidMount() {
    this.getBetChartData()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timeFrame !== prevProps.timeFrame) {
      this.getBetChartData();
    }
  };
  getBetChartData = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce)
      }

      let getMethod = this.props.getBettingStatData;

      const params = {
        filter: this.props.timeFrame
      }

      this.debounce = setTimeout(() => {
        getMethod(params)
          .then((data) => {
            var bettingTotals = [];
            var bettingSupplyChanges = [];
            var bettingLabels = []

            data.chartData.forEach((r, index) => {
              bettingTotals.push(r.totalBetValue)
              bettingSupplyChanges.push(r.supplyChange)
              if (["7d", "30d", "90d"].includes(this.props.timeFrame)) {
                bettingLabels.push(r._id.day + "/" + r._id.month + "/" + r._id.year)
              } else {
                bettingLabels.push("week " + (r._id.week + 1) + "/" + r._id.year)
              }
            })
            let bettingChartData = {
              labels: bettingLabels,
              datasets: [
                { type: 'bar',
                  label: 'Bet Amount',
                  backgroundColor: 'black',
                  data: bettingTotals
                },
                { type: 'bar',
                  label: 'Supply Change',
                  backgroundColor: 'red',
                  data: bettingSupplyChanges
                }
              ]
            }


            var betLeagueTotals = []
            var betLeagueSupplyChanges = []
            var leagues = []
            data.betByLeagueChartData.forEach((r, index) => {
              betLeagueTotals.push(r.betSum)
              betLeagueSupplyChanges.push(r.supplyChange)
              leagues.push(r._id)

            })

            let leagueChartData = {
              labels: leagues,
              datasets: [
                {
                  type: 'bar',
                  label: 'Bet Amount',
                  backgroundColor: "black",
                  data: betLeagueTotals

                },
                {
                  type: 'bar',
                  label: 'Supply Change',
                  backgroundColor: "red",
                  data: betLeagueSupplyChanges
                }
              ]
            }

            delete data.parlayLegData[data.parlayLegData.length-1] //delete data with 1 legs
            this.setState({
              bettingChartData: bettingChartData,
              bettingData: data.bettingData,
              parlayLegData: data.parlayLegData,
              leagueData: leagueChartData,
              loading: false
            })
          }).catch(error => {
            console.log('error', error);
            this.setState({ error, loading: false })
          })
      }, 800)

    })
  }

  
  render() {

    if (!!this.state.error) {
      return this.renderError(this.state.error)
  } else if (this.state.loading) {
      return this.renderLoading()
  }
const mintBurnRate = ((this.props.coin.totalMint - this.props.coin.totalBet) / this.props.coin.totalBet) * 100;
    return (
      <div className="mt-4">
        <Row >
          <Col sm="5">
            <Card className="card--status">
              <div className="card__row bg-eee">
                <span className="card__label">Total Bet</span>
                <span className="card__result">
                  {numeral(this.props.coin.totalBet).format('0,0.00')} WGR
          </span>
              </div>
              <div className="card__row">
                <span className="card__label">Total Payout </span>
                <span className="card__result">
                  {numeral(this.props.coin.totalMint).format('0,0.00')} WGR
          </span>
              </div>
              <div className="card__row bg-eee">
                <span className="card__label">Net Supply </span>
                <span className="card__result">
                  {numeral(this.props.coin.totalMint - this.props.coin.totalBet).format('0,0.00')} WGR
          </span>
              </div>
            </Card>
          </Col>
          <Col sm="2">
          <Card className="card--market pt-3" >
          <h4 className="text-center">Mint/Burn rate</h4>
          <h4 className="text-center mt-2">{(mintBurnRate > 0? "+" : "")}{ numeral(mintBurnRate).format('0,0.00')}%</h4>
              
        </Card>
              </Col>
          <Col sm="5">
            <Card className="card--status">
              <div className="card__row bg-eee">
                <span className="card__label">Total Supply</span>
                <span className="card__result">
                  {numeral(this.props.coin.supply).format('0,0.00')} WGR
          </span>
              </div>
              <div className="card__row">
                <span className="card__label">Masternodes Online </span>
                <span className="card__result">
                  {this.props.coin.mnsOn}
                </span>
              </div>
              <div className="card__row bg-eee">
                <span className="card__label">Price </span>
                <span className="card__result">
                  ${numeral(this.props.coin.usd).format('0,0.00')}
                </span>
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col sm="12">
            <div className="w3-tables__title">
              <div>Betting Chart</div>
             </div>
            { this.state.bettingChartData && <BarChart data={this.state.bettingChartData} height="30em" width="auto" type="bar" title="Weekly Betting Volume (WGR)" />}
          </Col>
        </Row>
        <Row className="mt-5">
          <Col sm="12">
            <div className="w3-tables__title">
              <div>League Chart</div>
            </div>
           { this.state.leagueData &&  <BarChart data={this.state.leagueData} height="30em" width="auto" type="bar" title="Chain Mint & Burn by League" />}
          </Col>
        </Row>

        <Row >
          <Col sm="12">
            <HorizontalRule title="Bet Data" />
            {this.state.bettingData && <CardBigTable
              cols={[
                { key: 'betCount', title: 'Total Bets Count', className: 'w-m-160' },
                { key: 'totalBet', title: 'Total WGR Bet', className: 'w-m-120' },
                { key: 'burnMint', title: 'Burn/Mint' },
                { key: 'burnMintRate', title: 'Burn/Mint rate' },
                { key: 'betUSD', title: 'Bet (USD)' },
                { key: 'betAnnualized', title: 'Annualized (USD)' },
                { key: 'betDaily', title: 'Daily Average (USD)' },
              ]}
              data={[this.state.bettingData.singleBets].map((bet) => {

                return {
                  ...bet,
                  betCount: bet.betCount,
                  totalBet: numeral(bet.totalBet).format('0,0.00'),
                  burnMint: numeral(bet.burnMint).format('0,0.00'),
                  burnMintRate: numeral(bet.burnMintRate).format('0,0.00') + '%',
                  betUSD: '$' + numeral(bet.betUSD).format('0,0.00'),
                  betAnnualized: '$' + numeral(bet.betAnnualized).format('0,0.00'),
                  betDaily: '$' + numeral(bet.betDaily).format('0,0.00')

                };
              })}
            />
            }
          </Col>
        </Row>

        <Row >
          <Col sm="12">
            <HorizontalRule title="Parlay Data" />
            {this.state.bettingData && <CardBigTable
              cols={[
                { key: 'betCount', title: 'Total Bets Count', className: 'w-m-160' },
                { key: 'totalBet', title: 'Total WGR Bet', className: 'w-m-120' },
                { key: 'burnMint', title: 'Burn/Mint' },
                { key: 'burnMintRate', title: 'Burn/Mint rate' },
                { key: 'betUSD', title: 'Bet (USD)' },
                { key: 'betAnnualized', title: 'Annualized (USD)' },
                { key: 'betDaily', title: 'Daily Average (USD)' },
              ]}
              data={[this.state.bettingData.parlayBets].map((bet) => {

                return {
                  ...bet,
                  betCount: bet.betCount,
                  totalBet: numeral(bet.totalBet).format('0,0.00'),
                  burnMint: numeral(bet.burnMint).format('0,0.00'),
                  burnMintRate: numeral(bet.burnMintRate).format('0,0.00') + '%',
                  betUSD: '$' + numeral(bet.betUSD).format('0,0.00'),
                  betAnnualized: '$' + numeral(bet.betAnnualized).format('0,0.00'),
                  betDaily: '$' + numeral(bet.betDaily).format('0,0.00')

                };
              })}
            />
            }
          </Col>
        </Row>
        <Row >
          <Col sm="12">
            <HorizontalRule title="Parlay Leg Data" />
            {this.state.bettingData && <CardBigTable
              cols={[
                { key: 'legNo', title: 'Number of Legs' },
                { key: 'count', title: 'Bet Counts', className: 'w-m-160' },
                { key: 'wins', title: 'Wins', className: 'w-m-120' },
                { key: 'winPercent', title: 'Win %' },
                { key: 'totalBet', title: 'Total Bets (WGR)' },
                { key: 'burn', title: 'Burn (WGR)' },
                { key: 'burnRate', title: 'Burn Rate' }

              ]}
              data={this.state.parlayLegData.map((leg, index) => {

                return {
                  ...leg,
                  legNo: 5 - index,
                  count: leg.count,
                  wins: leg.wins,
                  winPercent: numeral(leg.winPercent).format('0,0.00'),
                  totalBet: numeral(leg.totalBet).format('0,0.00') + ' WGR',
                  burn: numeral(leg.burn).format('0,0.00') + ' WGR',
                  burnRate: numeral(leg.burnRate).format('0,0.00') + '%'
                };
              })}
            />
            }
          </Col>
        </Row>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getBettingStatData: query => Actions.getBettingStatData(query)
});

const mapState = state => ({
  coin: state.coin
});

export default connect(mapState, mapDispatch)(BettingStat);
