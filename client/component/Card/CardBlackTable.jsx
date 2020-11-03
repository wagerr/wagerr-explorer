import Component from '../../core/Component';
import React from 'react';

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
                        <td className='black-table-td text-align-left bg-34'>{row.start}</td>
                        <td className='black-table-td border-right-0'>{row.homeOdds}</td>
                        <td className='black-table-td border-left-0 border-right-0'>{row.drawOdds}</td>
                        <td className='black-table-td border-left-0'>{row.awayOdds}</td>
                        <td className='black-table-td border-right-0 blk'>{row.homeTeam}</td>
                        <td className='black-table-td border-left-0 brk'>{row.awayTeam}</td>
                        <td className='black-table-td border-right-0 blk'>{row.homeTeam}</td>
                        <td className='black-table-td border-left-0 brk'>{row.awayTeam}</td>
                        <td className='black-table-td'>{row.betStatus}</td>
                        <td className='black-table-td'>{row.betAmount}</td>
                        <td className='black-table-td border-right-0'>{row.supplyChange}</td>
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
                    <div className='d-flex flex-row'>
                        <div className='black-table-td text-align-left bg-34 w-50 p-2'  style={{ borderTopLeftRadius: 12 }}>
                            {row.start}
                        </div>
                        <div className='w-50 d-flex flex-row' style={{ border: '1px solid #484848', borderTopRightRadius: 12 }}>
                            {tab === 1 && <div className='d-flex flex-1'>{row.homeOdds}</div>}
                            {tab === 1 && <div className='d-flex flex-1'>{row.drawOdds}</div>}
                            {tab === 1 && <div className='d-flex flex-1'>{row.awayOdds}</div>}
                            {tab === 2 && <div className='d-flex flex-1'>{row.homeTeam}</div>}
                            {tab === 2 && <div className='d-flex flex-1'>{row.awayTeam}</div>}
                            {tab === 3 && <div className='d-flex flex-1'>{row.homeTeam}</div>}
                            {tab === 3 && <div className='d-flex flex-1'>{row.awayTeam}</div>}
                        </div>
                    </div>
                    <div className='d-flex flex-row'>
                        <div className='black-table-td text-align-left bg-34 w-50 p-2 text-white' style={{ borderBottomLeftRadius: 12 }}>
                            <p>RESULT</p>
                            <p className='pt-1'>BET AMOUNT</p>
                            <p className='pt-2'>SUPPLY CHANGE</p>
                        </div>
                        <div className='w-50 d-flex flex-column align-items-center' style={{ border: '1px solid #484848', borderBottomRightRadius: 12 }}>
                            <div className='text-white'>{row.betStatus}</div>
                            <div>{row.betAmount}</div>
                            <div className='pb-2'>{row.supplyChange}</div>
                        </div>
                    </div>
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
                    </div>
                }
            </div >
        );
    };
}
