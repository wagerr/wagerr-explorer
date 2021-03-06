export const globalMenuData = (t) => {
  return [
    { label: t('Explorer'), icon: '/img/uiupdate/header_explorer.png', gicon: '/img/greyicon/header_explorer.png', href: '/' },
    { label: t('Bet History'), icon: '/img/uiupdate/header_bet_history.png', gicon: '/img/greyicon/header_bet_history.png', href: '/bethistory' },
    { label: t('Betting'), icon: '/img/uiupdate/header_betting.png', gicon: '/img/greyicon/header_betting.png', href: '/betting' },
    { label: t('Chain Games'), icon: '/img/uiupdate/header_chain_games.png', gicon: '/img/greyicon/header_chain_games.png', href: '/lottos' },
    {
      label: t('Help'), icon: '/img/uiupdate/header_help.png', gicon: '/img/greyicon/header_help.png', href: '/help',
      submenu: [
        { label: 'Chart with us', href: '/helpus' },
        { label: 'How to bet here', href: '/help' }
      ]
    }
  ]
}

export default {
  globalMenuData
}
