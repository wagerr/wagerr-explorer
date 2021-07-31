
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import React from 'react';
import BarChart from '../component/Graph/BarChart';
import { Row, Col } from 'reactstrap';
import numeral from 'numeral'
import CardBigTable from "../component/Card/CardBigTable";
import HorizontalRule from '../component/HorizontalRule';


class MasternodeStat extends Component {

  constructor(props) {
    super(props)
    this.state = {
      masternodeInfo: null,
      oracleRewardInfo: null,
      blockRewardInfo: null,
      oracleMasternodeRewardInfo: null,
      oracleMasternodeChartData: null,
      loading: true
    }
  }

  componentDidMount() {
    this.getMasternodeData()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timeFrame !== prevProps.timeFrame) {
      this.getMasternodeData();
    }
  };

  getMasternodeData = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce)
      }

      let getMethod = this.props.getMasternodeStatData;
      const params = { filter: this.props.timeFrame }
      this.debounce = setTimeout(() => {
        getMethod(params)
          .then((data) => {
            var oracleMNrewards = [];
            var oracleMNLabels = [];

            data.oracleMNChartData.forEach((r, index) => {
              oracleMNrewards.push(r.oraclePayouts)
              if (["7d", "30d", "90d"].includes(this.props.timeFrame)) {
                oracleMNLabels.push(r._id.day + "/" + r._id.month + "/" + r._id.year)
              } else {
                oracleMNLabels.push("week " + (r._id.week + 1) + "/" + r._id.year)
              }
            })

            let oracleMNChartData = {
              labels: oracleMNLabels,
              datasets: [
                {
                  type: 'bar',
                  label: 'Rewards',
                  backgroundColor: "black",
                  data: oracleMNrewards

                }
              ]
            }

            this.setState({
              masternodeInfo: data.masternodeInfo,
              oracleRewardInfo: data.oracleRewardInfo,
              blockRewardInfo: data.blockRewardInfo,
              oracleMasternodeRewardInfo: data.oracleMasternodeRewardInfo,
              oracleMasternodeChartData: oracleMNChartData,
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
    return (
      <div className="mt-4">

        <Row className="mt-5">
          <Col sm="12">
            <HorizontalRule title="Masternode Reward Information" />
            <div className="w3-tables__title">
              <div>Masternode Reward Chart</div>
            </div>
            <BarChart data={this.state.oracleMasternodeChartData} height="30em" width="100%" type="bar" title="Masternode Reward Info" />
          </Col>
        </Row>

        <Row className="mt-3">
          <Col sm="12">
            <HorizontalRule title="General Information" />
            {this.state.masternodeInfo && <CardBigTable
              cols={[
                { key: 'masternodeCount', title: 'Masternodes', className: 'w-m-160' },
                { key: 'collateral', title: 'Required Collateral', className: 'w-m-120' },
                { key: 'supplyLockedPercent', title: 'Locked Supply' },
                { key: 'cost', title: 'Cost (USD)' }
              ]}
              data={[this.state.masternodeInfo].map((data) => {

                return {
                  data,
                  masternodeCount: data.masternodeCount,
                  collateral: numeral(data.collateral).format('0,0.00'),
                  supplyLockedPercent: numeral(data.supplyLockedPercent).format('0,0.00') + '%',
                  cost: '$' + numeral(data.cost).format('0,0.00'),

                };
              })}
            />
            }
          </Col>
        </Row>

        <Row>
          <Col sm="12">
            <HorizontalRule title="Oracle Reward Information" />
            {this.state.oracleRewardInfo && <CardBigTable
              cols={[
                { key: 'lastOraclePayout', title: 'LastPayout', className: 'w-m-160' },
                { key: 'unpaidAccuredreward', title: 'Unpaid Accured Reward', className: 'w-m-120' },
                { key: 'oracleYearlyEstReward', title: 'Yearly estimate WGR / USD' },
                { key: 'oracleAnnualized', title: 'Annualized %' }
              ]}
              data={[this.state.oracleRewardInfo].map((data) => {

                return {
                  data,
                  lastOraclePayout: numeral(data.lastOraclePayout).format('0,0.00'),
                  unpaidAccuredreward: numeral(data.unpaidAccuredreward).format('0,0.00'),
                  oracleYearlyEstReward: numeral(data.oracleYearlyEstReward).format('0,0.00') + ' WGR / ' + '$' + numeral(data.oracleYearlyEstReward * this.props.coin.usd).format('0,0.00'),
                  oracleAnnualized: numeral(data.oracleAnnualized).format('0,0.00') + '%'

                };
              })}
            />
            }
          </Col>
        </Row>

        <Row>
          <Col sm="12">
            <HorizontalRule title="Block Reward Information" />
            {this.state.blockRewardInfo && <CardBigTable
              cols={[
                { key: 'blockReward', title: 'Block Reward', className: 'w-m-160' },
                { key: 'blockPerDay', title: 'Blocks Per Day', className: 'w-m-120' },
                { key: 'yearlyEst', title: 'Yearly estimate WGR / USD' },
                { key: 'blockRewardPercent', title: 'Annualized %' }
              ]}
              data={[this.state.blockRewardInfo].map((data) => {

                return {
                  data,
                  blockReward: numeral(data.blockReward).format('0,0.00'),
                  blockPerDay: numeral(data.blockPerDay).format('0,0.00'),
                  yearlyEst: numeral(data.yearlyEst).format('0,0.00') + ' WGR / ' + '$' + numeral(data.yearlyEst * this.props.coin.usd).format('0,0.00'),
                  blockRewardPercent: numeral(data.blockRewardPercent).format('0,0.00') + '%'

                };
              })}
            />
            }
          </Col>
        </Row>

        <Row>
          <Col sm="12">
            <HorizontalRule title="Combined Oracle Masternode Rewards Information" />
            {this.state.oracleMasternodeRewardInfo && <CardBigTable
              cols={[
                { key: 'yearlyEstimate', title: 'Yearly Estimate WGR / USD', className: 'w-m-160' },
                { key: 'oracleMNAnnual', title: 'Annualized %' }
              ]}
              data={[this.state.oracleMasternodeRewardInfo].map((data) => {

                return {
                  data,
                  yearlyEstimate: numeral(data.yearlyEstimate).format('0,0.00') + ' WGR / ' + '$' + numeral(data.yearlyEstimate * this.props.coin.usd).format('0,0.00'),
                  oracleMNAnnual: numeral(data.oracleMNAnnual).format('0,0.00') + '%'

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
  getMasternodeStatData: query => Actions.getMasternodeStatData(query)
});

const mapState = state => ({
  coin: state.coin
});

export default connect(mapState, mapDispatch)(MasternodeStat);
