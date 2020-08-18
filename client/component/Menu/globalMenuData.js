export const genMenuData = (t) => {
  return [
    {label: t('Explorer'), icon: '/img/uiupdate/header_explorer.png', href: '/explorer'},
    {label: t('Bet History'), icon: '/img/uiupdate/header_bet_history.png', href: '/bethistory'},
    {label: t('Betting'), icon: '/img/uiupdate/header_betting.png', href: '/betting'},
    {label: t('Chain Games'), icon: '/img/uiupdate/header_chain_games.png', href: '/lottos'},
    {label: t('Help'), icon: '/img/uiupdate/header_help.png', href: '/help'}
  ]
}

  export default {
    genMenuData
  }
