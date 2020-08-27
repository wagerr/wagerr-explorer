
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class CardBettingTable extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    return (
      <div className='card animated fadeInUp'>
          <div className="card__title direction-row space-between">
            <div className='font-17'>Seven's World Series - Dubai (Event ID: 3822)</div>
            <div className='font-17 card__title__last'>Thu, Dec 5th 10:02 PM (+07:00 + 07)</div>
          </div>
          <div className="card__title direction-row bg-87">
            <div className='w-40'></div>
            <div className='w-20 align-center'>Money Line</div>
            <div className='w-20 align-center'>Spread</div>
            <div className='w-20 align-center'>Total</div>
          </div>
          <div className="card__content direction-row">
            <div className='card__content__title w-40 m-20 font-weight-500'>Fiji 7s</div>
            <div className='w-20 card__tag align-center'>1.02</div>
            <div className='w-20 card__tag direction-row space-between p-12'>
              <div>-28.5</div>
              <div>1.7</div>
            </div>
            <div className='w-20 card__tag align-center'>(O38.5) 1.84</div>
          </div>
          <div className="card__content direction-row m-t--16">
            <div className='card__content__title w-40 m-20 font-weight-500'>Japan 7s</div>
            <div className='w-20 card__tag align-center'>1.02</div>
            <div className='w-20 card__tag direction-row space-between p-12'>
              <div>+28.5</div>
              <div>2.26</div>
            </div>
            <div className='w-20 card__tag align-center'>(U38.5) 2.04</div>
          </div>
          <div className="card__content direction-row m-t--16">
            <div className='card__content__title w-40 m-20 font-weight-500'>Draw</div>
            <div className='w-20 card__tag align-center'>-</div>
            <div className='w-20 card__tag card__empty'></div>
            <div className='w-20 card__tag card__empty'></div>
          </div>
      </div>
    );
  };
}
