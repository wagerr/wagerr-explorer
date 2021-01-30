import Actions from '../core/Actions'
import Component from '../core/Component'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import sortBy from 'lodash/sortBy'

import HorizontalRule from '../component/HorizontalRule'
import Pagination from '../component/Pagination'
import Table from '../component/SuperTable'
import Select from '../component/Select'

import Icon from '../component/Icon';
import _ from 'lodash'

import { PAGINATION_PAGE_SIZE, FILTER_EVENTS_OPTIONS } from '../constants'
import { timeStampFormat } from '../../lib/date'
import numeral from 'numeral'
import { compose } from 'redux'
import { translate } from 'react-i18next'
import queryString from 'query-string'
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import CardBlackTable from "../component/Card/CardBlackTable";
import ExplorerOverviewMenu from "../component/Menu/ExplorerOverviewMenu";
import GlobalSwitch from "../component/Menu/GlobalSwitch";
import Utils from "../core/utils";
import ClientUtils from '../component/utils/utils';
import Sliding from '../component/Sliding'
import Switch from "react-switch";
import {
    OPCODE_CHANED_BLOCK
} from '../constants';

Number.prototype.toFixedNoRounding = function (n) {
    const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
    const a = this.toString().match(reg)[0];
    const dot = a.indexOf(".");
    if (dot === -1) { // integer, insert decimal dot and pad up zeros
        return a + "." + "0".repeat(n);
    }
    const b = n - (a.length - dot) + 1;
    return b > 0 ? (a + "0".repeat(b)) : a;
}

class BetEventList extends Component {
    static defaultProps = {
        placeholder: 'Find team names, event ids, sports or tournaments.',
    }

    static propTypes = {
        getBetEventsInfo: PropTypes.func.isRequired,
        getBetQuery: PropTypes.func.isRequired,
        placeholder: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)
        const { t } = props;

        this.debounce = null
        this.state = {
            error: null,
            loading: true,
            events: [],
            pages: 0,
            page: 1,
            size: 50,
            filterBy: 'All',
            search: '',
            width: 0,
            toggleSwitch: props.toggleSwitch,
            odds: false,
        }

        this.props.history.listen((location, action) => {
            let page = location.pathname.split('/betevents/')[1];
            if (typeof page == 'undefined') page = 1;
            setTimeout(this.updatePage(page));
        });
    };

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);

        const values = queryString.parse(this.props.location.search); //this.props.match ? this.props.match.params : '';
        const search = values.search ? values.search : '';

        let page = this.props.match.params.page;
        if (typeof page == 'undefined') page = 1;

        this.setState({ search, page }, this.getBetEventsInfo)
    };

    updatePage = (page) => {
        this.setState({ page: parseInt(page) }, this.getBetEventsInfo);
    }

    componentWillReceiveProps(nextProps) {
        const nextvalues = queryString.parse(nextProps.location.search);
        const nextsearch = nextvalues.search ? nextvalues.search : '';
        if (nextsearch !== this.state.search) {
            this.setState({ search: nextsearch }, this.getBetEventsInfo);
        }
    }

    componentWillUnmount() {
        if (this.debounce) {
            clearTimeout(this.debounce)
            this.debounce = null
        }
        window.removeEventListener("resize", this.updateWindowDimensions);
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.toggleSwitch !== this.props.toggleSwitch) {
            this.getBetEventsInfo();
        }
    };

    updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth });
    };

    getBetEventsInfo = () => {
        this.setState({ loading: true }, () => {
            if (this.debounce) {
                clearTimeout(this.debounce)
            }

            let getMethod = this.props.getBetEventsInfo;

            const params = {
                limit: this.state.size,
                skip: (this.state.page - 1) * this.state.size,
                opened_or_completed: !this.props.toggleSwitch
            };

            if (this.state.filterBy !== 'All') {
                getMethod = this.props.getBetEventsInfo;
                console.log('sport', this.state.filterBy);
                params.sport = this.state.filterBy;
            }


            if (this.state.search) {
                getMethod = this.props.getBetEventsInfo;
                params.search = this.state.search;
            }

            this.debounce = setTimeout(() => {
                getMethod(params)
                    .then(({ data, pages }) => {
                        if (this.debounce) {
                            console.log('data', data);
                            data.map(item => {
                                let totalBet = 0;
                                let totalMint = 0;
                                item.actions.forEach(action => totalBet += action.betValue)
                                item.actions.forEach(action => totalMint += action.payout)
                                
                                item.totalBet = totalBet
                                item.totalMint = totalMint
                                item.events.sort(function (a, b) {
                                    return b.blockHeight - a.blockHeight;
                                })
                            })
                            this.setState({ events: data, pages, loading: false })
                        }
                    })
                    .catch(error => {
                        console.log('error', error);
                        this.setState({ error, loading: false })
                    })
            }, 800)
        })
    }

    handleChange = (e) => {
        this.setState({
            search: e.target.value,
        });
    }

    handleFilterBy = value => this.setState({ filterBy: value }, () => {
        this.setState({
            search: '',
        }, () => {
            this.getBetEventsInfo()
        });
    });

    handlePage = page => {
        this.props.history.push('/betevents/' + page)
    }

    handleSize = size => this.setState({ size, page: 1 }, () => {
        this.getBetEventsInfo()
    });


    TestMyFilter = (data, type) => {
        let results = [];
        if (type === 'All') {
            results = data;
        } else {
            results = data.filter((event) => {
                return event.events[0].transaction.sport === type
            });
        }
        return results;
    }

    handleKeyPress = (ev) => {
        if (ev.key === 'Enter') {
            ev.preventDefault();

            const term = ev.target.value.trim();
            ev.target.value = '';

            if (!!term) {
                this.props.handleEventSearch(term);
            }
        }
    };

    render() {
        const { props } = this;
        const { width, odds } = this.state;
        const { toggleSwitchOddsStyle, toggleSwitch, toggleSwitchOdds, handleToggleChange } = this.props;
        const { t } = props;
        const cols = [
            { key: 'start', title: 'DATE', className: 'w-m-160' },
            { key: 'homeOdds', title: '1' },
            { key: 'drawOdds', title: 'x' },
            { key: 'awayOdds', title: '2' },
            { key: 'homeTeam', title: t('homeTeam'), className: 'w-m-110' },
            { key: 'awayTeam', title: t('awayTeam'), className: 'w-m-110' },
            { key: 'homeTeam', title: '1' },
            { key: 'awayTeam', title: '2' },
            { key: 'betStatus', title: t('result'), className: 'w-m-100' },
            { key: 'betAmount', title: t('betAmount'), className: 'w-m-100' },
            { key: 'supplyChange', title: t('supplyChange'), className: 'w-m-100' },
        ]
        if (!!this.state.error) {
            return this.renderError(this.state.error)
        } else if (this.state.loading) {
            return this.renderLoading()
        }
        const selectOptions = PAGINATION_PAGE_SIZE
        const selectFilterOptions = FILTER_EVENTS_OPTIONS

        const select = (
            <Select
                onChange={value => this.handleSize(value)}
                selectedValue={this.state.size}
                options={selectOptions} />
        )

        const filterSport = (
            <Select
                onChange={value => this.handleFilterBy(value)}
                selectedValue={this.state.filterBy}
                options={selectFilterOptions} />
        );

        return (
            <div className="content content-top" id="body-content">
                <ExplorerMenu onSearch={this.props.handleSearch} />
                <div className="content__wrapper_total">
                    <ExplorerOverviewMenu />
                    <SearchBar
                        className="search--mobile mr-3"
                        onSearch={this.props.handleSearch}
                        placeholder="Search Blockchain" />

                    <div className="content_search_wrapper">

                        <div className="content_page_title">
                            <span>Betting Events</span>
                        </div>
                    </div>
                    <div className="content__wrapper">
                        <CoinSummary
                            onRemove={this.props.handleRemove}
                            onSearch={this.props.handleSearch}
                            searches={this.props.searches}
                            onlyBet={true}
                        />

                        <div className="animated fadeInUp m-t-20 m-h-20 m--b-25">
                            <div className="search__card flex-center">
                                <img src={'/img/uiupdate/search.png'} alt={'search'} />
                            </div>
                            <input
                                className="search__input search__input__icon"
                                placeholder={'Find by event ids, sports or tournaments.'}
                                onKeyPress={this.handleKeyPress}
                            />
                        </div>

                        <div>
                            <HorizontalRule
                                // select={select}
                                // filterSport={filterSport}
                                title={t('title')}
                            />
                            {this.state.events.length == 0 && this.renderError('No search results found within provided filters')}
                            <div style={{ width: Utils.tableWidth(width) }}>

                                <div className="w3-tables__title">
                                    <div>BET EVENTS </div>
                                    <div className="d-flex flex-row align-items-center">
                                        <span className='ft-12 mr-2'>Completed:</span>
                                        <Switch
                                            checked={toggleSwitch}
                                            onChange={handleToggleChange}
                                            onColor="#86d3ff"
                                            onHandleColor="#2693e6"
                                            handleDiameter={18}
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                            height={15}
                                            width={30}
                                            className="react-switch mr-3"
                                            id="material-switch"
                                        />
                                        {select}
                                    </div>
                                </div>

                                <Sliding selectedValue={this.state.filterBy} onChange={value => this.handleFilterBy(value)} options={FILTER_EVENTS_OPTIONS} />

                                {
                                    this.state.events.length > 0 &&
                                    <CardBlackTable
                                        className={'table-responsive table--for-betevents'}
                                        cols={cols}
                                        data={this.state.events.map((event) => {
                                            const betAmount = event.actions.reduce((acc, action) => {
                                                return acc + action.betValue
                                            }, 0.0
                                            )
                                            let betStatus = t('open')
                                            const eventTime = parseInt(event.events[0].timeStamp);
                                            const eventData = event.events[0];

                                            if (event.results.length > 1) {
                                                for (const result of event.results) {
                                                    if (result.result.indexOf('REFUND') !== -1) {
                                                        betStatus = <span className={`badge badge-info`}>{result.result}</span>
                                                    }
                                                }
                                            } else if (event.results.length > 0) {
                                                for (const result of event.results) {
                                                    const awayVsHome = result.transaction ? (result.transaction.awayScore - result.transaction.homeScore) : 0;
                                                    let outcome;
                                                    if (awayVsHome > 0) {
                                                        // outcome = 'Away Win';
                                                        outcome = eventData.awayTeam;
                                                    }

                                                    if (awayVsHome < 0) {
                                                        // outcome = 'Home Win';
                                                        outcome = eventData.homeTeam;
                                                    }

                                                    if (awayVsHome === 0) {
                                                        outcome = 'Draw';
                                                    }

                                                    if (result.result && result.result.includes('Refund')) {
                                                        //console.log('result', result);
                                                        outcome = result.result;
                                                    }

                                                    if (outcome) {
                                                        betStatus = <span className={`badge badge-info`}>{outcome}</span>
                                                    }
                                                }
                                            } else {
                                                if ((eventTime - (20 * 60 * 1000)) < Date.now()) {
                                                    betStatus = t('waitForStart')
                                                    if (eventTime < Date.now()) {
                                                        betStatus = t('started')
                                                        if (event.results.length === 0) {
                                                            betStatus = <span>{t('waitingForOracle')}</span>
                                                        }
                                                    }
                                                }
                                            }

                                            let homeOdds = (event.events[0].homeOdds / 10000)
                                            let drawOdds = (event.events[0].drawOdds / 10000)
                                            let awayOdds = (event.events[0].awayOdds / 10000)

                                            let orighomeOdds = (event.events[0].homeOdds / 10000)
                                            let origdrawOdds = (event.events[0].drawOdds / 10000)
                                            let origawayOdds = (event.events[0].awayOdds / 10000)

                                            homeOdds = ClientUtils.convertToOdds(homeOdds, toggleSwitchOddsStyle, toggleSwitchOdds);
                                            drawOdds = ClientUtils.convertToOdds(drawOdds, toggleSwitchOddsStyle, toggleSwitchOdds);
                                            awayOdds = ClientUtils.convertToOdds(awayOdds, toggleSwitchOddsStyle, toggleSwitchOdds);

                                            homeOdds = homeOdds == 0 ? '-' : homeOdds
                                            drawOdds = drawOdds == 0 ? '-' : drawOdds
                                            awayOdds = awayOdds == 0 ? '-' : awayOdds
                                            if (event.events.length > 1) {
                                                let lastHomeOdds = (event.events[1].homeOdds / 10000)
                                                let lastDrawOdds = (event.events[1].drawOdds / 10000)
                                                let lastAwayOdds = (event.events[1].awayOdds / 10000)
                                                if (orighomeOdds > lastHomeOdds) {
                                                    homeOdds = homeOdds + ' ↑'
                                                } else if (homeOdds < lastHomeOdds) {
                                                    homeOdds = homeOdds + ' ↓'
                                                }
                                                if (origdrawOdds > lastDrawOdds) {
                                                    drawOdds = drawOdds + ' ↑'
                                                } else if (drawOdds < lastDrawOdds) {
                                                    drawOdds = drawOdds + ' ↓'
                                                }
                                                if (origawayOdds > lastAwayOdds) {
                                                    awayOdds = awayOdds + ' ↑'
                                                } else if (awayOdds < lastAwayOdds) {
                                                    awayOdds = awayOdds + ' ↓'
                                                }
                                            }

                                            let spreadHomePoint = '-';
                                            let spreadAwayPoint = '-';
                                            let spreadHomeOdd = '-';
                                            let spreadAwayOdd = '-';
                                            const eventItem = event.events[0];
                                            if (eventItem.latest_spread) {
                                                const divider = eventItem.latest_spread.blockHeight > OPCODE_CHANED_BLOCK ? 100 : 10;
                                                spreadHomePoint = `${ClientUtils.displayNum(eventItem.latest_spread.homePoints, divider)}`;
                                                spreadAwayPoint = `${ClientUtils.displayNum(eventItem.latest_spread.awayPoints, divider)}`;
                                                let homeOddstmp = eventItem.latest_spread.homeOdds / 10000
                                                let awayOddstmp = eventItem.latest_spread.awayOdds / 10000

                                                spreadHomeOdd = ClientUtils.convertToOdds(homeOddstmp, toggleSwitchOddsStyle, toggleSwitchOdds);
                                                spreadAwayOdd = ClientUtils.convertToOdds(awayOddstmp, toggleSwitchOddsStyle, toggleSwitchOdds);
                                            }
                                            spreadHomePoint = spreadHomePoint == 0 ? '-' : spreadHomePoint;
                                            spreadAwayPoint = spreadAwayPoint == 0 ? '-' : spreadAwayPoint;
                                            spreadHomeOdd = spreadHomeOdd == 0 ? '-' : spreadHomeOdd;
                                            spreadAwayOdd = spreadAwayOdd == 0 ? '-' : spreadAwayOdd;

                                            let totalPoint = '-'
                                            let overOdd = '-'
                                            let underOdd = '-'

                                            if (eventItem.latest_total) {
                                                let overOddstmp = eventItem.latest_total.overOdds / 10000
                                                let underOddstmp = eventItem.latest_total.underOdds / 10000
                                                const divider = eventItem.latest_total.blockHeight > OPCODE_CHANED_BLOCK ? 100 : 10;
                                                totalPoint = eventItem.latest_total.points / divider
                                                underOdd = ClientUtils.convertToOdds(underOddstmp, toggleSwitchOddsStyle, toggleSwitchOdds);
                                                overOdd = ClientUtils.convertToOdds(overOddstmp, toggleSwitchOddsStyle, toggleSwitchOdds);
                                            }
                                            totalPoint = totalPoint == 0 ? '-' : totalPoint;
                                            overOdd = overOdd == 0 ? '-' : overOdd;
                                            underOdd = underOdd == 0 ? '-' : underOdd;

                                            let homeTeam = eventItem.homeTeam ? eventItem.homeTeam : "";
                                            let homeAway = eventItem.awayTeam ? eventItem.awayTeam : "";

                                            //console.log('event', event.events[0]);
                                            return {
                                                ...event,
                                                start: <div>
                                                    <p style={{ fontSize: 20, color: '#E7E3EB' }}>{homeTeam}</p>
                                                    <p style={{ fontSize: 20, color: '#F70407', fontWeight: '600' }}>{homeAway}</p>
                                                    <p>{event.events[0].league}</p>
                                                    <p>{timeStampFormat(event.events[0].timeStamp)} </p>
                                                    <p>Event ID: {event.events[0].eventId}</p>
                                                </div>,
                                                homeOdds: <div className='black-table-box'><h3>{homeOdds}</h3></div>,
                                                drawOdds: <div className='black-table-box'><h3 style={{ color: '#9D9D9D' }}>{drawOdds}</h3></div>,
                                                awayOdds: <div className='black-table-box'><h3 style={{ color: '#F90000' }}>{awayOdds}</h3></div>,

                                                spreadHome: <div className='black-table-box'>
                                                    {spreadHomePoint != '-' && <p>{spreadHomePoint}</p>}
                                                    {spreadHomePoint == '-' && spreadHomeOdd != '-' && <p>0</p>}
                                                    {spreadHomeOdd != '-' && <h3>{spreadHomeOdd}</h3>}
                                                    {spreadHomeOdd == '-' && spreadHomePoint != '-' && <h3 style={{ color: '#9D9D9D' }}>{spreadHomeOdd}</h3>}
                                                    {spreadHomeOdd == '-' && spreadHomePoint == '-' && <h3 style={{ color: '#9D9D9D' }}>-</h3>}
                                                </div>,
                                                spreadAway: <div className='black-table-box'>
                                                    {spreadAwayPoint != '-' && <p>{spreadAwayPoint}</p>}
                                                    {spreadAwayPoint == '-' && spreadAwayOdd != '-' && <p>0</p>}
                                                    {spreadAwayOdd != '-' && <h3 style={{ color: '#F90000' }}>{spreadAwayOdd}</h3>}
                                                    {spreadAwayOdd == '-' && spreadAwayPoint != '-' && <h3 style={{ color: '#9D9D9D' }}>{spreadAwayOdd}</h3>}
                                                    {spreadAwayOdd == '-' && spreadAwayPoint == '-' && <h3 style={{ color: '#9D9D9D' }}>-</h3>}
                                                </div>,

                                                totalOverOdd: <div className='black-table-box'>
                                                    {overOdd != '-' && totalPoint == '-' && <h3 style={{ color: '#9D9D9D' }}>{totalPoint}</h3>}
                                                    {totalPoint != '-' && <p>{totalPoint}</p>}
                                                    {overOdd != '-' && <h3>{overOdd}</h3>}
                                                    {totalPoint != '-' && overOdd == '-' && <h3 style={{ color: '#9D9D9D' }}>{overOdd}</h3>}
                                                    {totalPoint == '-' && overOdd == '-' && <h3 style={{ color: '#9D9D9D' }}>{overOdd}</h3>}
                                                </div>,
                                                totalUnderOdd: <div className='black-table-box'>
                                                    {underOdd != '-' && totalPoint == '-' && <h3 style={{ color: '#9D9D9D' }}>{totalPoint}</h3>}
                                                    {totalPoint != '-' && <p>{totalPoint}</p>}
                                                    {underOdd != '-' && <h3 style={{ color: '#F90000' }}>{underOdd}</h3>}
                                                    {totalPoint != '-' && underOdd == '-' && <h3 style={{ color: '#9D9D9D' }}>{underOdd}</h3>}
                                                    {totalPoint == '-' && underOdd == '-' && <h3 style={{ color: '#9D9D9D' }}>{underOdd}</h3>}
                                                </div>,

                                                betStatus: <div className='mt-2'>{betStatus}</div>,
                                                betAmount: <span className={`mt-2 badge badge-danger `}>{numeral(betAmount).format('0,0.00')}</span>,
                                                supplyChange: <span className={`mt-2 badge badge-${event.totalMint - event.totalBet < 0 ? 'danger' : 'success'}`}>
                                                    {numeral(event.totalMint - event.totalBet).format('0,0.00')}
                                                </span>,
                                                links: `/bet/event/${encodeURIComponent(event.events[0].eventId)}`
                                                // seeDetail: <Link
                                                //     to={`/bet/event/${encodeURIComponent(event.events[0].eventId)}`}>{t('seeDetail')}</Link>
                                            }
                                        })} />}

                            </div>

                            {
                                this.state.pages > 0 &&
                                <Pagination
                                    current={this.state.page}
                                    className="float-right"
                                    onPage={this.handlePage}
                                    total={this.state.pages}
                                />
                            }
                            <div className="clearfix" />
                        </div>
                        <Footer />
                    </div>
                </div>
            </div>
        );

    };
}

const mapDispatch = dispatch => ({
    getBetEventsInfo: query => Actions.getBetEventsInfo(query),
    getBetQuery: query => Actions.getBetQuery(query),
})

export default compose(
    connect(null, mapDispatch),
    translate('betEventList'),
)(BetEventList);

