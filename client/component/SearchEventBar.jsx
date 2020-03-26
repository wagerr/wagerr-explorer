
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';

export default class SearchEventBar extends Component {
  static defaultProps = {
    placeholder: 'Find team names, event ids, sports or tournaments.',
  }

  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    defaultValue: PropTypes.string
  };

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();

      const term = ev.target.value.trim();
      ev.target.value = '';
      this.props.onSearch(term);
    }
  };

  render() {
    const { props } = this;

    return (
      <div className="animated fadeIn" style={{ width: '100%' }}>
        <div className={ `search ${ props.className ? props.className : '' }` }>
          <input
            className="search__input"
            onKeyPress={ this.handleKeyPress }
            defaultValue={props.defaultValue}
            placeholder={ props.placeholder } />
          <Icon name="search" className="search__icon" />
        </div>
      </div>
    );
  };
}
