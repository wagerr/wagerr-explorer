import React from 'react';
import Card from './Card';

const ExchangesData = [
    {href: 'https://crex24.com/exchange/WGR-BTC', title: 'Crex24'},
    {href: 'https://coinsuper.com/', title: 'CoinSuper'},
    {href: 'https://chainex.io/', title: 'ChainEx'},
    {href: 'https://folex.io/', title: 'Folex'},
    {href: 'https://www.ionomy.com/', title: 'Ionomy'},
    {href: 'https://livecoin.net/', title: 'LiveCoin'},
    {href: 'https://www.blackturtle.eu/', title: 'TurtleNetwork'},
    {href: 'https://www.gonetcoins.com/', title: 'Netcoins'},
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
