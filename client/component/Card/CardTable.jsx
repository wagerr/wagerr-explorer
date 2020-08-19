
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class CardTable extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    return (
      <div className='card'>
          <div className="card__title direction-row">
            <div className='w-10'>HEIGHT</div>
            <div className='w-40'>TRANSACTION HASH</div>
            <div className='w-10'>VALUE</div>
            <div className='w-10'>AGE</div>
            <div className='w-10'>RECIPIENTS</div>
            <div className='w-20'>CREATED</div>
          </div>
          
        <div className="card__body">
          {props.children}
        </div>
      </div>
    );
  };
}
