import Component from '../../core/Component';
import React from 'react';

export default class CardBlackTable extends Component {
    state = {
        width: 0
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
    getBodyDesktop() {
        return this.props.data.map((row, idx) => {
            return (
                <tr className="table-item" key={idx} style={{ background: '#3B3B3B'}}>

                    <td className='black-table-td text-align-left' style={{ background: '#343434'}}>{row.start}</td>
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
            )
        });
    }

    getClasses() {
        return this.props.cols.map(col => {
            return (typeof col === 'object') ? col.className : '';
        });
    }

    getKeys() {
        return this.props.cols.map(col => {
            return (typeof col === 'object') ? col.key : col;
        });
    }

    getHeaderDesktop() {
        return (
            <tr className="table-header" style={{ background: '#2B2B2B' }}>
                {
                    this.props.cols.map((item, idx) => {
                        return <th key={idx} style={{textTransform: 'uppercase'}}>{item.title}</th>
                    })
                }
            </tr>
        )
    }

    getBodyMobile() {
        return this.props.data.map((row, idx) => {
            const cells = this.getKeys().map((col, i) => {
                return (
                    <div className='d-flex flex-row'>
                        <div className='font--bold flex-1'>{this.props.cols[i].title}</div>
                        <div className={this.getClasses()[i]} key={i} style={{ flex: 1.3}}>{row[col]}</div>
                    </div>
                )
            });
            return (
                <div className="card-mobile-table p-2" key={idx}>
                    {cells}
                </div>
            )
        });
    }

    render() {
        const { width } = this.state;
        return (
            <div className="animated fadeInUp w3-tables w3-responsive mt-0" style={{ borderRadius: 0}}>
                {
                    width > 600 &&
                    <table className="w3-table-all black-table">
                        <thead>
                            <tr className="black-table-tr">
                                <th className='w-18'>DATE</th>
                                <th className='w-17' colSpan="3">MONEY LINE</th>
                                <th className='w-17' colSpan="2">SPREAD</th>
                                <th className='w-17' colSpan="2">TOTAL</th>
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
                        <tbody>
                            {/*{this.getHeaderDesktop()}*/}

                            {this.getBodyDesktop()}
                        </tbody>
                    </table>
                }
                {
                    width <= 600 &&
                        <div>
                            {this.getBodyMobile()}
                        </div>
                }
            </div>
        );
    };
}
