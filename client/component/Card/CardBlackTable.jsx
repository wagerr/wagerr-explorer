import Component from '../../core/Component';
import React from 'react';
import { Link } from 'react-router-dom'

export default class CardBlackTable extends Component {

    state = {
        width: 0,
        tab: 1
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth });
    };

    getHeaderDesktop() {
        return (
            <thead>
                <tr className="black-table-tr">
                    <th className='w-18'>DATE</th>
                    <th className='w-17' colSpan="3">MONEY LINE</th>
                    <th className='w-16' colSpan="2">SPREAD</th>
                    <th className='w-16' colSpan="2">TOTAL</th>
                    <th>RESULT</th>
                    <th>BET AMOUNT</th>
                    <th>SUPPLY CHANGE</th>
                </tr>
                <tr className="black-table-tr2">
                    <td></td>
                    <td>1</td>
                    <td>X</td>
                    <td>2</td>
                    <td className='blk'>HOME</td>
                    <td className='brk'>AWAY</td>
                    <td className='blk'>OVER</td>
                    <td className='brk'>UNDER</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </thead>
        )
    }

    getHeaderMobile() {
        const { tab } = this.state;
        return (
            <div>
                <div className='text-white d-flex bg-21 pt-2'>
                    <div className='flex-1'></div>
                    <div className='flex-1 d-flex justify-content-around flex-row'>
                        {tab === 1 && <div>1</div>}
                        {tab === 1 && <div>X</div>}
                        {tab === 1 && <div>2</div>}
                        {tab === 2 && <div className=''>HOME</div>}
                        {tab === 2 && <div className=''>AWAY</div>}
                        {tab === 3 && <div className=''>OVER</div>}
                        {tab === 3 && <div className=''>UNDER</div>}
                    </div>
                </div>
            </div>
        )
    }

    getBodyDesktop() {
        return this.props.data.map((row, idx) => {
            return (
                <tbody>
                    <tr className="table-item bg-3b" key={idx}>
                        <td className='black-table-td text-align-left bg-34'><Link to={row.links} className='text-white'>{row.start}</Link></td>
                        <td className='black-table-td border-right-0'><Link to={row.links} className='text-white'>{row.homeOdds}</Link></td>
                        <td className='black-table-td border-left-0 border-right-0'><Link to={row.links} className='text-white'>{row.drawOdds}</Link></td>
                        <td className='black-table-td border-left-0'><Link to={row.links} className='text-white'>{row.awayOdds}</Link></td>
                        <td className='black-table-td border-right-0 blk'><Link to={row.links} className='text-white'>{row.homeTeam}</Link></td>
                        <td className='black-table-td border-left-0 brk'><Link to={row.links} className='text-white'>{row.awayTeam}</Link></td>
                        <td className='black-table-td border-right-0 blk'><Link to={row.links} className='text-white'>{row.homeTeam}</Link></td>
                        <td className='black-table-td border-left-0 brk'><Link to={row.links} className='text-white'>{row.awayTeam}</Link></td>
                        <td className='black-table-td'><Link to={row.links} className='text-white'>{row.betStatus}</Link></td>
                        <td className='black-table-td'><Link to={row.links} className='text-white'>{row.betAmount}</Link></td>
                        <td className='black-table-td border-right-0'><Link to={row.links} className='text-white'>{row.supplyChange}</Link></td>
                    </tr>
                </tbody>
            )
        });
    }

    getBodyMobile() {
        const { tab } = this.state;
        return this.props.data.map((row, idx) => {
            return (
                <div key={idx} className='black-mobile-table' style={{ marginBottom: this.props.data !== idx + 1 && 0}}>
                    <Link to={row.links} className='d-flex flex-row'>
                        <div className='black-table-td text-align-left bg-34 w-50 p-2 text-white'  style={{ borderTopLeftRadius: 8 }}>
                            {row.start}
                        </div>
                        <div className='w-50 d-flex flex-row' style={{ border: '1px solid #484848', borderTopRightRadius: 8 }}>
                            {tab === 1 && <div className='d-flex flex-1 align-items-center'>{row.homeOdds}</div>}
                            {tab === 1 && <div className='d-flex flex-1 align-items-center'>{row.drawOdds}</div>}
                            {tab === 1 && <div className='d-flex flex-1 align-items-center'>{row.awayOdds}</div>}
                            {tab === 2 && <div className='d-flex flex-1 align-items-center'>{row.homeTeam}</div>}
                            {tab === 2 && <div className='d-flex flex-1 align-items-center'>{row.awayTeam}</div>}
                            {tab === 3 && <div className='d-flex flex-1 align-items-center'>{row.homeTeam}</div>}
                            {tab === 3 && <div className='d-flex flex-1 align-items-center'>{row.awayTeam}</div>}
                        </div>
                    </Link>
                    <Link to={row.links} className='d-flex flex-row'>
                        <div className='black-table-td text-align-left bg-34 w-50 p-2 text-white' style={{ borderBottomLeftRadius: 8 }}>
                            <p>RESULT</p>
                            <p className='pt-1'>BET AMOUNT</p>
                            <p className='pt-2'>SUPPLY CHANGE</p>
                        </div>
                        <div className='w-50 d-flex flex-column align-items-center' style={{ border: '1px solid #484848', borderBottomRightRadius: 8 }}>
                            <div className='text-white'>{row.betStatus}</div>
                            <div>{row.betAmount}</div>
                            <div className='pb-2'>{row.supplyChange}</div>
                        </div>
                    </Link>
                </div>
            )
        });
    }

    render() {
        const { width, tab } = this.state;
        return (
            <div className="animated fadeInUp w3-tables w3-responsive mt-0" style={{ borderRadius: 0 }}>
                {
                    width > 600 &&
                    <table className="w3-table-all black-table">
                        {this.getHeaderDesktop()}
                        {this.getBodyDesktop()}
                    </table>
                }
                {
                    width <= 600 &&
                    <div style={{ background: '#212121' }}>
                        <div className="black-header">
                            <div className={tab === 1 && 'black-header__active'} onClick={() => this.setState({ tab: 1 })}>MONEY LINE</div>
                            <div className={tab === 2 && 'black-header__active'} onClick={() => this.setState({ tab: 2 })}>SPREAD</div>
                            <div className={tab === 3 && 'black-header__active'} onClick={() => this.setState({ tab: 3 })}>TOTAL</div>
                        </div>
                        {this.getHeaderMobile()}
                        {this.getBodyMobile()}
                        <div style={{ height: 12}}></div>
                    </div>
                }
            </div >
        );
    };
}
