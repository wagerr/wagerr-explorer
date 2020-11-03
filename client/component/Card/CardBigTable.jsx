import Component from '../../core/Component';
import React from 'react';

export default class CardBigTable extends Component {
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
            const cells = this.getKeys().map((col, i) => {
                return (
                    <td className={this.getClasses()[i]} key={i}>{row[col]}</td>
                )
            });
            return (
                <tr className="table-item" key={idx}>
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

    getHeaderDesktop() {
        return (
            <tr 
                className="table-header" 
                style={{ background: this.props.sports ? '#545454' : this.props.black ? '#212121' : '#b40202' }}
            >
                {
                    this.props.cols.map((item, idx) => {
                        return <th key={idx} style={{ textTransform: 'uppercase' }}>{item.title}</th>
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
                        <div className={this.getClasses()[i]} key={i} style={{ flex: 1.3 }}>{row[col]}</div>
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
            <div
                className="animated fadeInUp w3-tables w3-responsive"
                style={
                    this.props.sports && { marginTop: -1, borderRadius: 0 },
                    this.props.black && { marginTop: -1, borderRadius: 0 }
                }
                >
                {
                    width > 600 &&
                    <table className="w3-table-all">
                        <tbody>
                            {this.getHeaderDesktop()}
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
