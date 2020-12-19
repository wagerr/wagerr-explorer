import Component from '../core/Component';
import Actions from '../core/Actions'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import PropTypes from 'prop-types'
import React from 'react';
import ClientUtils from '../component/utils/utils';
import CardBettingEvent from '../component/Card/CardBettingEvent';
import PubSub from 'pubsub-js';

class EventList extends Component {

    eventRefreshInterval = null;
    
    static propTypes = {
        getEvents: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)
        this.state = {
            events: [],
            filteredEvents: [],
            loading: true,
            sport: 'allevent',
            search: ''
        }

        this.disabledEvents = []
        this.betType = "parlay"

        PubSub.subscribe('sport-changed', this.onSportChange)
        PubSub.subscribe('parlay-changed', this.onParlayChanged)
        PubSub.subscribe('betType-changed',this.onBetTypeChanged)
       
    }

    onBetTypeChanged = (msg,bettype) => {
    this.betType = bettype
    this.filterEvents()
    }

    onParlayChanged = (msg, data) => {
        const type = data[0];
        const eventid = data[1];
        if (type === 'added') {
            if (this.disabledEvents.includes(eventid)) return;
            this.disabledEvents.push(eventid)
        }
        if (type === 'removed') {
            const index = this.disabledEvents.indexOf(eventid)
            if (index !== -1) {
                this.disabledEvents.splice(index, 1)
            }
        }

        if (type === 'clear') {
            this.disabledEvents = [];
        }

        this.filterEvents()

    }

    onSportChange = (msg, sport) => {
        this.setState({ sport: sport }, this.filterEvents);
    }

    componentDidMount() {
        this.refreshEvents()
    }

    componentWillUnmount() {
        clearTimeout(this.eventRefreshInterval);
      }
    
    refreshEvents = () => {
        this.getEvents()
        this.eventRefreshInterval = setTimeout(this.refreshEvents,20000)
    }

    filterEvents = () => {

        let tempevents = [];
        let sport = this.state.sport;
        if (sport == "allevent") {

            tempevents = JSON.parse(JSON.stringify(this.state.events))
        }
        else {
            const filtered = this.state.events.filter(e => e.sport.toLowerCase() == sport);
            tempevents = JSON.parse(JSON.stringify(filtered))
        }

        if (this.state.search !== "") {
            const searchedEvents = tempevents.filter((e) => {
                const searchValue = this.state.search.toLowerCase()
                return e.tournament.toLowerCase().includes(searchValue) ||
                    e.teams.home.toLowerCase().includes(searchValue) ||
                    e.teams.away.toLowerCase().includes(searchValue) ||
                    e.event_id.toString().includes(searchValue)
            })

            tempevents = searchedEvents;
        }

        this.setState({ filteredEvents: tempevents });

    }

    searchEvents = (value) => {
        setTimeout(() => {
            this.setState({ search: value });
            this.filterEvents()
        }, 700)

    }

    getEvents = () => {
        this.setState({ loading: true }, () => {

            let getMethod = this.props.getEvents;

            getMethod()
                .then((data) => {
                    this.setState({ events: data.events, loading: false }, this.filterEvents)
                })
                .catch(error => {
                    console.log('error', error);
                    this.setState({ error, loading: false })
                })

        })
    }

    render() {
        const { toggleSwitchOddsStyle, toggleSwitchOdds } = this.props;
        return (<div>
            <div className="bet-search">
                <input placeholder={'Search...'} onChange={(e) => this.searchEvents(e.target.value)} />
            </div>
            <div className="scrollable"> {
                this.state.filteredEvents.map((event) => {

                    let moneylineHomeOdds = (event.odds[0].mlHome / 10000)
                    let moneylineAwayOdds = (event.odds[0].mlAway / 10000)
                    let moneylineDrawOdds = (event.odds[0].mlDraw / 10000)

                    let mlHomeEO = ClientUtils.convertToOdds(moneylineHomeOdds, false, true)
                    let mlAwayEO = ClientUtils.convertToOdds(moneylineAwayOdds, false, true)
                    let mlDrawEO = ClientUtils.convertToOdds(moneylineDrawOdds, false, true)


                    moneylineHomeOdds = ClientUtils.convertToOdds(moneylineHomeOdds, toggleSwitchOddsStyle, toggleSwitchOdds)
                    moneylineAwayOdds = ClientUtils.convertToOdds(moneylineAwayOdds, toggleSwitchOddsStyle, toggleSwitchOdds)
                    moneylineDrawOdds = ClientUtils.convertToOdds(moneylineDrawOdds, toggleSwitchOddsStyle, toggleSwitchOdds)

                    let spreadPoints = (event.odds[1].spreadPoints / 100)

                    let spreadHomeOdds = (event.odds[1].spreadHome / 10000)
                    let spreadAwayOdds = (event.odds[1].spreadAway / 10000)

                    let spreadHomeEO = ClientUtils.convertToOdds(spreadHomeOdds, false, true)
                    let spreadAwayEO = ClientUtils.convertToOdds(spreadAwayOdds, false, true)

                    spreadHomeOdds = ClientUtils.convertToOdds(spreadHomeOdds, toggleSwitchOddsStyle, toggleSwitchOdds)
                    spreadAwayOdds = ClientUtils.convertToOdds(spreadAwayOdds, toggleSwitchOddsStyle, toggleSwitchOdds)

                    spreadHomeOdds = spreadHomeOdds
                    spreadAwayOdds = spreadAwayOdds


                    let totalsOverOdds = (event.odds[2].totalsOver / 10000)
                    let totalsUnderOdds = (event.odds[2].totalsUnder / 10000)
                    let totalPoints = (event.odds[2].totalsPoints / 100)

                    let totalsOverEO = ClientUtils.convertToOdds(totalsOverOdds, false, true)
                    let totalsUnderEO = ClientUtils.convertToOdds(totalsUnderOdds, false, true)


                    totalsOverOdds = ClientUtils.convertToOdds(totalsOverOdds, toggleSwitchOddsStyle, toggleSwitchOdds)
                    totalsUnderOdds = ClientUtils.convertToOdds(totalsUnderOdds, toggleSwitchOddsStyle, toggleSwitchOdds)

                    totalsOverOdds = totalsOverOdds
                    totalsUnderOdds = totalsUnderOdds

                    const tempevent = JSON.parse(JSON.stringify(event))

                    tempevent.odds[0].mlHome = moneylineHomeOdds
                    tempevent.odds[0].mlAway = moneylineAwayOdds
                    tempevent.odds[0].mlDraw = moneylineDrawOdds

                    tempevent.odds[0].mlHomeEO = mlHomeEO
                    tempevent.odds[0].mlAwayEO = mlAwayEO
                    tempevent.odds[0].mlDrawEO = mlDrawEO


                    tempevent.odds[1].spreadHome = spreadHomeOdds
                    tempevent.odds[1].spreadAway = spreadAwayOdds
                    tempevent.odds[1].spreadPoints = spreadPoints

                    tempevent.odds[1].spreadHomeEO = spreadHomeEO
                    tempevent.odds[1].spreadAwayEO = spreadAwayEO


                    tempevent.odds[2].totalsOver = totalsOverOdds
                    tempevent.odds[2].totalsUnder = totalsUnderOdds
                    tempevent.odds[2].totalsPoints = totalPoints

                    tempevent.odds[2].totalsOverEO = totalsOverEO
                    tempevent.odds[2].totalsUnderEO = totalsUnderEO

                    tempevent.disabled = this.disabledEvents.includes(tempevent.event_id) && this.betType === 'parlay'

                    return <CardBettingEvent data={tempevent} />
                })
            }
            </div>
        </div>)

    }

}


const mapDispatch = dispatch => ({
    getEvents: query => Actions.getListEvents(dispatch,query)
})

export default compose(
    translate('eventlist'),
    connect(null, mapDispatch)    
)(EventList);
