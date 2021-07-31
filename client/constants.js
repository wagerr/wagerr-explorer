export const COIN = "COIN";
export const COINS = "COINS";
export const ERROR = "ERROR";
export const TXS = "TXS";
export const EVENTS = "EVENTS";
export const WATCH_ADD = "WATCH_ADD";
export const WATCH_REMOVE = "WATCH_REMOVE";
export const OPCODE_CHANED_BLOCK = 1501000;

export const API_BASE = location.origin;
export const PAGINATION_PAGE_SIZE = [
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
];

export const FILTER_EVENTS_OPTIONS = [
  { label: "All", value: "All", icon: "explorer_sportbetting_allevent.png" },
  {
    label: "Baseball",
    value: "Baseball",
    icon: "explorer_sportbetting_baseball.png",
  },
  {
    label: "Football",
    value: "Football",
    icon: "explorer_sportbetting_football.png",
  },
  {
    label: "Basketball",
    value: "Basketball",
    icon: "explorer_sportbetting_basketball.png",
  },
  {
    label: "Hockey",
    value: "Hockey",
    icon: "explorer_sportbetting_hockey.png",
  },
  {
    label: "Soccer",
    value: "Soccer",
    icon: "explorer_sportbetting_soccer.png",
  },
  {
    label: "Cricket",
    value: "Cricket",
    icon: "explorer_sportbetting_cricket.png",
  },
  {
    label: "Rugby Union",
    value: "Rugby Union",
    icon: "explorer_sportbetting_rugby_league.png",
  },
  {
    label: "Aussie Rules",
    value: "Aussie Rules",
    icon: "explorer_sportbetting_aussie_rules.png",
  },
  { label: "MMA", icon: "explorer_sportbetting_mma.png" },
  {
    label: "Tennis",
    value: "Tennis",
    icon: "explorer_sportbetting_tennis.png",
  },
];

export const CHART_TIME_FRAME = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "ytd", value: "ytd" },
];

export default {
  OPCODE_CHANED_BLOCK,
  COIN,
  COINS,
  ERROR,
  PAGINATION_PAGE_SIZE,
  TXS,
  EVENTS,
  WATCH_ADD,
  WATCH_REMOVE,
  FILTER_EVENTS_OPTIONS,
  API_BASE,
  CHART_TIME_FRAME,
};
