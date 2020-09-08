import Component from '../../core/Component';
import React from 'react';

export default class CardBigTable extends Component {
    getBody() {
        return this.props.data.map((row, idx) => {
            const cells = this.getKeys().map((col, i) => {
                return (
                    <td className={this.getClasses()[i]} key={i}>{row[col]}</td>
                )
            });
            return (
                <tr className="table-item">
                    {cells}
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

    getHeader() {
        return (
            <tr className="table-header">
                {
                    this.props.cols.map(item => {
                        return <th style={{textTransform: 'uppercase'}}>{item.title}</th>
                    })
                }
            </tr>
        )
    }

    sportsBody() {

    }

    render() {
        return (
            <div className="animated fadeInUp w3-tables w3-responsive">
                <table className="w3-table-all">
                    <tbody>
                        {this.sportsBody()}
                        {this.getHeader()}
                        {this.getBody()}
                    </tbody>
                </table>
            </div>
        );
    };
}
