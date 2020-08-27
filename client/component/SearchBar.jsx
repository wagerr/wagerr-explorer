
import Component from '../core/Component';
import config from '../../config';
import { isAddress, isBlock } from '../../lib/blockchain';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';

export default class SearchBar extends Component {
  static defaultProps = {
    placeholder: 'You may enter a block height, block hash, tx hash or address and hit enter.',
  }

  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired
  };

  state = { width: 0 };

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();

      const term = ev.target.value.trim();
      ev.target.value = '';

      if (!!term) {
        this.props.onSearch(term);
      }
    }
  };

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

  render() {
    const { props } = this;
    const { width } = this.state;
    return (
      <div className="animated fadeIn">
        <div className={`search ${props.className ? props.className : ''}`} style={{ width: width > 1000 ? width-788 : 320 }}>
          <input
            className="search__input"
            onKeyPress={this.handleKeyPress}
            placeholder={props.placeholder} />
          <Icon name="search" className="search__icon" />
        </div>
      </div>
    );
  };
}
