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
import Switch from "react-switch";
import _ from 'lodash'

import { PAGINATION_PAGE_SIZE, FILTER_EVENTS_OPTIONS } from '../constants'
import { timeStamp24Format } from '../../lib/date'
import numeral from 'numeral'
import { compose } from 'redux'
import { translate } from 'react-i18next'
import queryString from 'query-string'
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from './CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import CardBigTable from "../component/Card/CardBigTable";
import ExplorerOverviewMenu from "../component/Menu/ExplorerOverviewMenu";
import GlobalSwitch from "../component/Menu/GlobalSwitch";

const convertToAmericanOdds = (odds) => {

    odds = parseFloat(odds);
    let ret = parseInt((odds - 1) * 100);

    if (odds < 2)
        ret = Math.round((-100) / (odds - 1));

    if (odds == 0) ret = 0;

    if (ret > 0) ret = `+${ret}`

    return ret;
}

class BetParlays extends Component {
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
            toggleSwitch: props.toggleSwitch
        }

        this.props.history.listen((location, action) => {
            let page = location.pathname.split('/betevents/')[1];
            if (typeof page == 'undefined') page = 1;
            setTimeout(this.updatePage(page));
        });
    };

    componentDidMount() {
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
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.toggleSwitch !== this.props.toggleSwitch) {
            this.getBetEventsInfo();
        }
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
                opened_or_completed: this.props.toggleSwitch
            };

            if (this.state.filterBy !== 'All') {
                getMethod = this.props.getBetEventsInfo;
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
                            data.map(item => {
                                let totalBet = 0;
                                let totalMint = 0;
                                item.actions.forEach(action => totalBet += action.betValue)
                                if (item.results) {
                                    item.results.forEach(result => {
                                        let startIndex = 2
                                        if (
                                            result.payoutTx.vout[1] &&
                                            result.payoutTx.vout[2] &&
                                            result.payoutTx.vout[1].address === result.payoutTx.vout[2].address
                                        ) {
                                            startIndex = 3
                                        }
                                        for (let i = startIndex; i < result.payoutTx.vout.length - 1; i++) {
                                            totalMint += result.payoutTx.vout[i].value
                                        }
                                    })
                                }
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

    handleKeyPress = (ev) => {
        if (ev.key === 'Enter') {
            ev.preventDefault();

            this.getBetEventsInfo();
        }
    };

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

    handleSize = size => this.setState({ size, page: 1 })


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

    render() {
        const { props } = this;
        const { t } = props;
        const { toggleSwitch } = props;

        const cols = toggleSwitch ? [
            { key: 'start', title: 'bettime', className: 'w-m-140' },
            { key: 'event', title: 'txid' },
            { key: 'homeTeam', title: 'leg1' },
            { key: 'awayTeam', title: 'leg2' },
            { key: 'homeOdds', title: 'leg3' },
            { key: 'drawOdds', title: 'leg4' },
            { key: 'awayOdds', title: 'leg5' },
            { key: 'betAmount', title: t('betAmount'), className: 'w-m-100' },
            { key: 'betStatus', title: t('betStatus'), className: 'w-m-100' },
            { key: 'seeDetail', title: t('detail'), className: 'w-m-80' },
        ] : [
            { key: 'start', title: 'bettime', className: 'w-m-140' },
            { key: 'event', title: 'txid' },
            { key: 'homeTeam', title: 'leg1' },
            { key: 'awayTeam', title: 'leg2' },
            { key: 'homeOdds', title: 'leg3' },
            { key: 'drawOdds', title: 'leg4' },
            { key: 'awayOdds', title: 'leg5' },
            { key: 'supplyChange', title: t('supplyChange'), className: 'w-m-120' },
            { key: 'betAmount', title: t('betAmount'), className: 'w-m-100' },
            { key: 'betStatus', title: t('betStatus'), className: 'w-m-100' },
            { key: 'seeDetail', title: t('detail'), className: 'w-m-80' },
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
                        />
                        <div>
                            <HorizontalRule
                                select={select}
                                filterSport={filterSport}
                                title={'PARLAY BETS'}
                            />
                            {this.state.events.length == 0 && this.renderError('No search results found within provided filters')}
                            {this.state.events.length > 0 &&
                                <CardBigTable
                                    className={'table-responsive table--for-betevents'}
                                    cols={cols}
                                    data={this.state.events.map((event) => {
                                        const betAmount = event.actions.reduce((acc, action) => {
                                            return acc + action.betValue
                                        }, 0.0
                                        )

                                        return {
                                            ...event,
                                            start: <Link to={`/explorer/tx/${encodeURIComponent(event.events[0].eventId)}`}>{timeStamp24Format(event.events[0].timeStamp)} </Link>,
                                            event: <span>{Math.random().toString(36).substr(2, 9)}</span>,
                                            homeTeam: toggleSwitch ? <span className={`badge badge-info`}>{'pending'}</span>: <span className={`badge badge-success`}>Lose</span>,
                                            awayTeam: toggleSwitch ? <span className={`badge badge-info`}>{'pending'}</span>: <span className={`badge badge-success`}>win</span>,
                                            homeOdds: toggleSwitch ? <span className={`badge badge-info`}>{'pending'}</span>: <span className={`badge badge-danger`}>Lose</span>,
                                            drawOdds: toggleSwitch ? <span className={`badge badge-info`}>{'pending'}</span>: <span className={`badge badge-success`}>win</span>,
                                            awayOdds: toggleSwitch ? <span className={`badge badge-info`}>{'pending'}</span>: <span className={`badge badge-danger`}>Lose</span>,
                                            supplyChange: <span className={`badge badge-${event.totalMint - event.totalBet < 0 ? 'danger' : 'success'}`}>{numeral(event.totalMint - event.totalBet).format('0,0.00')}</span>,
                                            betAmount: <span className={`badge badge-danger`}>{numeral(betAmount).format('0,0.00')}</span>,
                                            betStatus: <span style={{ fontWeight: 'bold'}}>{toggleSwitch ? 'Pending': 'Completed'}</span>,
                                            seeDetail: <Link to={`/explorer/tx/${encodeURIComponent(event.events[0].eventId)}`}>{t('seeDetail')}</Link>
                                        }
                                    })} />}

                            {this.state.pages > 0 && <Pagination
                                current={this.state.page}
                                className="float-right"
                                onPage={this.handlePage}
                                total={this.state.pages} />}
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
)(BetParlays);
