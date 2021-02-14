import React from 'react';
import Card from './Card';

const LinksData = [
    {href: 'https://wagerr.com/', title: 'Website'},
    {href: 'https://wagerr.com/sportsbook', title: 'Web Sportsbook'},
    {href: 'https://github.com/wagerr', title: 'Github'},
    {href: 'https://www.reddit.com/r/Wagerr', title: 'Reddit'},
    {href: 'https://discord.gg/7dp9HYd', title: 'Discord'},
    {href: 'https://t.me/wagerrcoin', title: 'Telegram'},
    {href: 'https://twitter.com/wagerrx', title: 'Twitter'},
    {href: 'https://www.facebook.com/wagerr', title: 'Facebook'},
    {href: 'https://bitcointalk.org/index.php?topic=5186141', title: 'Bitcointalk'}
];

const CardLinks = () => (
    <Card title="Links">
        {
            LinksData.map((item, index) =>
                <div key={index} className={index % 2 === 0 ? 'bg-eee p-5-10' : 'p-5-10'}>
                    <a href={item.href} target="_blank">{item.title}</a><br/>
                </div>)
        }
    </Card>
);


export default CardLinks;
