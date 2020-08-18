export const genMenuData = (t) => {
  return [
    {label: t('overview'), icon: '/img/home.svg', href: '/explorer'},
    {label: t('movement'), icon: '/img/movement.svg', href: '/explorer/movement'},
    // {label: t('top'), icon: '/img/top100.svg', href: '/top'},
    {label: t('masternode'), icon: '/img/masternodes.svg', href: '/explorer/masternode'},
    // {label: t('governance'), icon: '/img/governance.svg', href: '/governance'},
    {label: t('Sports Betting'), icon: '/img/betevent.svg', href: '/explorer/betevents'},      
    {label: t('connections'), icon: '/img/connections.svg', href: '/explorer/peer'},
    {label: t('statistics'), icon: ' /img/statistics.svg', href: '/explorer/statistics'},
    {label: t('coinInfo'), icon: '/img/coininfo.svg', href: '/explorer/coin'},
    {label: t('api'), icon: '/img/api.svg', href: '/explorer/api'}
  ]
}

  export default {
    genMenuData
  }
