// import Component from '../core/Component';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import React from 'react';
// import { compose } from 'redux'
// import { translate } from 'react-i18next';
// import ExplorerMenu from '../component/Menu/ExplorerMenu';
// import Footer from '../component/Footer';
// import Card from '../component/Card';
// import HorizontalRule from "../component/HorizontalRule";
// import { Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
// import classnames from "classnames";
// import CardMoneyLineEvent from "../component/Card/CardMoneyLineEvent";
// import CardBetResult from "../component/Card/CardBetResult";
// import BetEventTable from "./BetEventTable";
// import CardSpreadEvent from "../component/Card/CardSpreadEvent";
// import CardOverUnderEvent from "../component/Card/CardOverUnderEvent";
// import sortBy from "lodash/sortBy";
// import Actions from "../core/Actions";
// import CardSmall from '../component/Card/CardSmall';
// import CoinSummary from './CoinSummary';

// class NewBetParlay extends Component {
//     static propTypes = {
//         txs: PropTypes.array.isRequired,
//         match: PropTypes.object.isRequired,
//         getBetEventInfo: PropTypes.func.isRequired,
//         getBetActions: PropTypes.func.isRequired,
//         getBetspreads: PropTypes.func.isRequired,
//         getBetTotals: PropTypes.func.isRequired,
//     };

//     constructor(props) {
//         super(props);
//         this.state = {
//             eventId: '',
//             eventInfo: [],
//             betActions: [],
//             betSpreads: [],
//             betTotals: [],
//             loading: true,
//             error: null,
//             activeTab: '1',

//             tabIndex: 0,
//             mokeData: MONEYDATA
//         };
//         this.toggle = this.toggle.bind(this);
//     };

//     componentDidMount() {
//         console.log('componentDidMount-BetEvent', this.props.match.params.eventId);
//         this.setState({
//             eventId: this.props.match.params.eventId,
//         });
//         this.getBetData();
//     };

//     componentDidUpdate(prevProps) {
//         const { params: { eventId } } = this.props.match;
//         if (prevProps.match.params.eventId !== eventId) {
//             console.log('componentDidUpdate-BetEvent', eventId);
//             this.setState({
//                 eventId: this.props.match.params.eventId,
//             });
//             this.getBetData();
//         }
//         ;
//     };

//     getBetData = () => {
//         this.setState({ loading: true }, () => {
//             Promise.all([
//                 this.props.getBetEventInfo(this.state.eventId),
//                 this.props.getBetActions(this.state.eventId),
//                 this.props.getBetspreads(this.state.eventId),
//                 this.props.getBetTotals(this.state.eventId),
//             ]).then((res) => {
//                 sortBy(res[0].events, ['blockHeight']).forEach(event => {
//                     res[1]
//                         .actions
//                         .filter(action => {
//                             return event.blockHeight < action.blockHeight
//                         }).forEach(
//                             action => {
//                                 if (action.betChoose.includes('Home')) {
//                                     action.odds = action.homeOdds / 10000
//                                 } else if (action.betChoose.includes('Away')) {
//                                     action.odds = action.awayOdds / 10000
//                                 } else {
//                                     action.odds = action.drawOdds / 10000
//                                 }
//                             });
//                     this.setState({
//                         eventInfo: res[0], // 7 days at 5 min = 2016 coins
//                         betActions: res[1].actions,
//                         betSpreads: res[2].results,
//                         betTotals: res[3].results,
//                         loading: false,
//                     })
//                 })
//             })
//                 .catch((err) => console.log(err))
//         })
//     };

//     toggle(tab) {
//         if (this.state.activeTab !== tab) {
//             this.setState({
//                 activeTab: tab
//             });
//         }
//     }

//     render() {
//         const { location } = this.props;
//         const { tabIndex, mokeData } = this.state;
//         const explore_class = location.pathname.includes('explorer') && 'content-top';
//         if (!!this.state.error) {
//             return this.renderError(this.state.error)
//         } else if (this.state.loading) {
//             return this.renderLoading()
//         }
//         const { t } = this.props;
//         const tableData = {
//             t: t,
//             eventInfo: this.state.eventInfo,
//             activeTab: this.state.activeTab,
//             betActions: this.state.betActions,
//             betSpreads: this.state.betSpreads,
//             betTotals: this.state.betTotals,
//         };

//         return (
//             <div className={`content ${explore_class}`} id="body-content">
//                 <ExplorerMenu onSearch={this.props.handleSearch} />
//                 <div className="content__wrapper_total">
//                     <div className="animated fadeInUp content_search_wrapper">
//                         <div className="content_page_title">
//                             <span>BET EVENTS INFO</span>
//                         </div>
//                     </div>

//                     <div className="content__wrapper">

//                         <CoinSummary />

//                         <div className="animated fadeInUp m-t-20 m-h-20">
//                             <div className="search__card flex-center">
//                                 <img src={'/img/uiupdate/search.png'} alt={'search'} />
//                             </div>
//                             <input
//                                 className="search__input search__input__icon"
//                                 placeholder={'Find team names, event ids, sports or tournaments.'}
//                             />
//                         </div>

//                         <div className="row">

//                             <div className='col-md-12 col-lg-6'>
//                                 <CardSmall
//                                     title={'Transaction Info'}
//                                     data={[
//                                         { title: 'TXID', value: '3acf9d851813831ca3f2ec26283181a23aa553d4f1c98a853230b730358b6c2b' },
//                                         { title: 'Confirmations', value: '6557' },
//                                         { title: 'Block Value', value: '56.26443300 WGR' },
//                                         { title: 'Block Hash', value: '5f2bf8cfac8a54e864aba4c5e5b76cbda5a4a50cfca33d05baf5cc5a8f456ca2' },
//                                         { title: 'Block Height', value: '38986' },
//                                         { title: 'Timestamp', value: '2020-09-20 07:39:06' },
//                                     ]}
//                                 />
//                             </div>

//                             <div className='col-md-12 col-lg-6'>
//                                 <HorizontalRule title={'SENDING ADDRESSES'} />
//                                 <CardSmall
//                                     title={'Address'}
//                                     title2={'value'}
//                                     style={{ display: 'flex', justifyContent: 'space-between' }}
//                                     data={[
//                                         { title: 'THRrBaevDiNs4QvGihGR1LG5YzZCHdAt3j', value: '-56.26643300 WGR' }
//                                     ]}
//                                 />
//                             </div>
//                             <div className='col-md-12 col-lg-6'>
//                                 <HorizontalRule title={'RECIPIENTS'} />
//                                 <CardSmall
//                                     title={'Address'}
//                                     title2={'value'}
//                                     style={{ display: 'flex', justifyContent: 'space-between' }}
//                                     data={[
//                                         { title: 'TRe2eEBvt4GaWpa11NL7CzQbgf4GAz1Ybo', value: '31.26443300 WGR' },
//                                         { title: '42010c037d010000067b010000017a01000004', value: '25.00000000 WGR' }
//                                     ]}
//                                 />
//                             </div>

//                             <div className='col-md-12 col-lg-6'>
//                                 <HorizontalRule title={'Leg 1'} />
//                                 <CardSmall
//                                     title={'Bet Type'}
//                                     title2={'Parlay'}
//                                     style={{ display: 'flex', justifyContent: 'space-between' }}
//                                     data={[
//                                         { title: 'Event ID', value: '31.26443300 WGR' },
//                                         { title: '42010c037d010000067b010000017a01000004', value: '25.00000000 WGR' }
//                                     ]}
//                                 />
//                             </div>
//                         </div>
//                         <Footer />
//                     </div>
//                 </div>
//             </div>
//         );
//     };
// }

// const mapDispatch = dispatch => ({
//     getBetEventInfo: query => Actions.getBetEventInfo(query),
//     getBetActions: query => Actions.getBetActions(query),
//     getBetspreads: query => Actions.getBetspreads(query),
//     getBetTotals: query => Actions.getBetTotals(query),
// });

// const mapState = state => ({
//     txs: state.txs
// });

// export default compose(
//     translate('betEvent'),
//     connect(mapState, mapDispatch),
// )(NewBetParlay);



// const MONEYDATA = [
//     { label: 'Time:', value: '2019-12-10 20:00:00 UTC' },
//     { label: 'League:', value: 'The Championship' },
//     { label: 'Home Team:', value: 'Stoke City' },
//     { label: 'Away Team:', value: 'Luton Town' },
//     { label: 'Home Bet Num:', value: '0' },
//     { label: 'Home Bet Amount:', value: '0.00000000' },
//     { label: 'Draw Bet Num:', value: '0' },
//     { label: 'Draw Bet Amount:', value: '0.00000000' },
//     { label: 'Away Bet Num:', value: '0' },
//     { label: 'Away Bet Amount:', value: '0.00000000' },
// ]

// const SPREADDATA = [
//     { label: 'Time:', value: '2019-12-10 20:00:00 UTC' },
//     { label: 'Home Bet Amount:', value: '0.00000000' },
//     { label: 'Draw Bet Num:', value: '0' },
//     { label: 'Draw Bet Amount:', value: '0.00000000' },
//     { label: 'Away Bet Num:', value: '0' },
//     { label: 'Away Bet Amount:', value: '0.00000000' },
// ]

// const OVERDATA = [
//     { label: 'Time:', value: '2019-12-10 20:00:00 UTC' },
//     { label: 'League:', value: 'The Championship' },
//     { label: 'Home Team:', value: 'Stoke City' },
//     { label: 'Away Team:', value: 'Luton Town' },
//     { label: 'Home Bet Num:', value: '0' },
//     { label: 'Home Bet Amount:', value: '0.00000000' },
//     { label: 'Draw Bet Num:', value: '0' },
// ]
