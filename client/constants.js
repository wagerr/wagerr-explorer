
export const COIN = 'COIN';
export const COINS = 'COINS';
export const ERROR = 'ERROR';
export const TXS = 'TXS';
export const WATCH_ADD = 'WATCH_ADD';
export const WATCH_REMOVE = 'WATCH_REMOVE';

export const API_BASE = location.origin;
export const PAGINATION_PAGE_SIZE = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
];

export const FILTER_EVENTS_OPTIONS = [
  { label: 'All', value: 'All', icon: 'explorer_sportbetting_allevent.png'},
  { label: 'Baseball', value: 'Baseball',  icon: 'explorer_sportbetting_baseball.png'},
  { label: 'Football', value: 'Football', icon: 'explorer_sportbetting_soccor.png'},
  { label: 'Basketball', value: 'Basketball', icon: 'explorer_sportbetting_basketball.png'},
  { label: 'Hockey', value: 'Hockey', icon: 'explorer_sportbetting_hockey.png' },
  { label: 'Soccer', value: 'Soccer', icon: 'explorer_sportbetting_soccor.png' },
  { label: 'Cricket', value: 'Cricket', icon: 'explorer_sportbetting_cricket.png' },
  { label: 'Rugby Union', value: 'Rugby Union',icon: 'explorer_sportbetting_rugby_league.png'},
  { label: 'Aussie Rules', value: 'Aussie Rules', icon: 'explorer_sportbetting_aussie_rules.png'},
];

const demo_sports = [
  { id: 1, label: 'All Events', icon: 'explorer_sportbetting_allevent.png' },
  { id: 2, label: 'Soccer', icon: 'explorer_sportbetting_soccor.png' },
  { id: 3, label: 'Esports', icon: 'explorer_sportbetting_esport.png' },
  { id: 4, label: 'Baseball', icon: 'explorer_sportbetting_baseball.png' },
  { id: 5, label: 'Basketball', icon: 'explorer_sportbetting_basketball.png' },
  { id: 6, label: 'Football', icon: 'explorer_sportbetting_soccor.png' },
  { id: 7, label: 'Hockey', icon: 'explorer_sportbetting_hockey.png' },
  { id: 8, label: 'Aussie Rules', icon: 'explorer_sportbetting_aussie_rules.png' },
  { id: 9, label: 'Cricket', icon: 'explorer_sportbetting_cricket.png' },
  { id: 10, label: 'MMA', icon: 'explorer_sportbetting_mma.png' },
  { id: 11, label: 'Rugby League', icon: 'explorer_sportbetting_rugby_league.png' },
  { id: 12, label: 'Rugby Union', icon: 'explorer_sportbetting_rugby_league.png' },
]


export default {
  COIN,
  COINS,
  ERROR,
  PAGINATION_PAGE_SIZE,
  TXS,
  WATCH_ADD,
  WATCH_REMOVE,
  FILTER_EVENTS_OPTIONS,
  API_BASE,
};
