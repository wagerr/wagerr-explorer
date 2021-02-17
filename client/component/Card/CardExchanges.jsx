import React from 'react';
import Card from './Card';

const ExchangesData = [
    {mainTitle: 'Beaxy', links:[
        {href:'https://exchange.beaxy.com/?pair=WGRBTC',title:'WGR/BTC'},
        {href:'https://exchange.beaxy.com/?pair=WGRUSD',title:'WGR/USD'}
    ]},
    {mainTitle: 'Crex24', links:[
        {href:'https://crex24.com/exchange/WGR-BTC',title:'WGR/BTC'},
        {href:'https://crex24.com/exchange/WGR-USDC',title:'WGR/USDC'}
    ]},
    {mainTitle: 'CoinSuper', links:[
        {href:'https://www.coinsuper.com/trade?symbol=WGR%2FBTC',title:'WGR/BTC'}
    ]},
    {mainTitle: 'ChainEx', links:[
        {href:'https://chainex.io/markets/WGR/BTC',title:'WGR/BTC'}
    ]},
    {mainTitle: 'Ionomy (No Kyc)', links:[
        {href:'https://exchange.ionomy.com/en/markets/btc-wgr',title:'WGR/BTC'}
    ]}
];

const CardExchanges = () => (
    <Card title="Exchanges">
        {
            
            ExchangesData.map((item, index) =>
            <div key={index} className={index % 2 === 0 ? 'bg-eee p-5-10' : 'p-5-10'}>
                {item.mainTitle} - (
                
                { item.links.map((link,index) => <a href={link.href} target="_blank">{link.title}   </a> ) }
                )
            </div>
            )
        }
    </Card>
);

export default CardExchanges;
