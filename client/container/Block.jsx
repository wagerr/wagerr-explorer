import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardBlock from '../component/Card/CardBlock';
import CardBlockTXs from '../component/Card/CardBlockTXs';
import HorizontalRule from '../component/HorizontalRule';
import ExplorerMenu from "../component/Menu/ExplorerMenu";
import CoinSummary from '../container/CoinSummary';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
import SearchBar from '../component/SearchBar';
class Block extends Component {
    static propTypes = {
        getBlock: PropTypes.func.isRequired,
        match: PropTypes.object.isRequired,
        tx: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            block: {},
            loading: true,
            error: null,
            txs: []
        };
    };

    componentDidMount() {
        this.getBlock();
    };

    componentDidUpdate(prevProps) {
        const { params: { hash } } = this.props.match;
        if (prevProps.match.params.hash !== hash) {
            this.getBlock();
        }
    };

    getBlock = () => {
        this.setState({ loading: true }, () => {
            this.props
                .getBlock(this.props.match.params.hash)
                .then(({ block, txs }) => {
                    this.setState({ block, txs, loading: false });
                })
                .catch(error => this.setState({ error, loading: false }));
        });
    };

    render() {
        if (!!this.state.error) {
            return this.renderError(this.state.error);
        } else if (this.state.loading) {
            return this.renderLoading();
        }

        return (
            <div className="content content-top" id="body-content">
                <ExplorerMenu onSearch={this.props.handleSearch} />
                <div className="content__wrapper_total">
                    <ExplorerOverviewMenu />
                    <SearchBar
                        className="search--mobile mr-3"
                        onSearch={this.props.handleSearch}
                        placeholder="Search Blockchain" />
                    <div className="content_search_wrapper">
                        <div className="content_page_title">
                            <span>Block Info</span>
                        </div>
                    </div>
                    <div className="content__wrapper">
                        <CoinSummary
                            onRemove={this.props.handleRemove}
                            onSearch={this.props.handleSearch}
                            searches={this.props.searches} />
                        <HorizontalRule title="Block Info" />
                        <CardBlock block={this.state.block} height={this.props.tx.blockHeight} />
                        <HorizontalRule title="Block Transactions" />
                        <CardBlockTXs txs={this.state.txs} />
                    </div>
                </div>
            </div>
        );
    };
}

const mapDispatch = dispatch => ({
    getBlock: query => Actions.getBlock(query)
});

const mapState = state => ({
    tx: state.txs.length
        ? state.txs[0]
        : { blockHeight: state.coin.blocks }
});

export default connect(mapState, mapDispatch)(Block);
