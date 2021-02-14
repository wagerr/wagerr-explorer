import React from 'react';
import Card from './Card';

const ExchangesData = [
    {href: 'https://crex24.com/exchange/WGR-BTC', title: 'Crex24 - WGRBTC'},
    {href: 'https://crex24.com/exchange/WGR-USDC', title: 'Crex24 - WGRUSDC'},
    {href: 'https://exchange.beaxy.com/?pair=WGRBTC', title: 'Beaxy - WGRBTC'},
    {href: 'https://exchange.beaxy.com/?pair=WGRUSD', title: 'Beaxy - WGRUSD'},
    {href: 'https://www.coinsuper.com/trade?symbol=WGR%2FBTC', title: 'CoinSuper'},
    {href: 'https://chainex.io/markets/WGR/BTC', title: 'ChainEx'},
    {href: 'https://exchange.ionomy.com/en/markets/btc-wgr', title: 'Ionomy (No Kyc)'}
    
];

const CardExchanges = () => (
    <Card title="Exchanges">
        {
            ExchangesData.map((item, index) =>
                <div key={index} className={index % 2 === 0 ? 'bg-eee p-5-10' : 'p-5-10'}>
                    <a href={item.href} target="_blank">{item.title}</a><br/>
                </div>)
        }
    </Card>
);

export default CardExchanges;
