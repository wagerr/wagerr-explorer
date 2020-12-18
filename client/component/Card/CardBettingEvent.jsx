
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import PubSub from 'pubsub-js';

export default class CardBettingEvent extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    title: PropTypes.string
  };

  render() {
    const { props } = this;
    return (
      <div className="card" >
        <div className="card__title direction-row space-between" >
    <div className='font-17'>{props.data.tournament} (Event ID: {props.data.event_id})</div>
          <div className='font-17 card__title__last'>
            {`${moment.utc(parseInt(props.data.starting)).local().format('ddd, MMM Do h:mm A Z z')}`}
          </div>
        </div>
        <div className="card__title card__title__hidden direction-row bg-87">
          <div className='w-40'></div>
          <div className='w-20 align-center card__title__th'>Money Line</div>
          <div className='w-20 align-center card__title__th'>Spread</div>
          <div className='w-20 align-center card__title__th'>Total</div>
        </div>
        <div className={props.data.disabled ? "card-disabled" : "" }>
        <div className="card__content direction-row">
          <div className='card__content__title w-40 m-20 font-weight-500'>{props.data.teams[0].home}</div>
          <button className='w-20 card__content__button align-center' onClick={() => PubSub.publish('event-clicked',[props.data,1])}>{props.data.odds[0].mlHome}</button>
          <button className='w-20 card__content__button' disabled={props.data.odds[1].spreadHome == 0} onClick={() => PubSub.publish('event-clicked',[props.data, 4])} >
            {props.data.odds[1].spreadHome == 0 ? <div className='align-center'> - </div>
              : <div className='direction-row space-between p-12'>
                <div>{(props.data.odds[1].spreadPoints < 0) ? props.data.odds[1].spreadPoints : '+' + props.data.odds[1].spreadPoints}</div>
                <div>{props.data.odds[1].spreadHome}</div>
              </div>

            }
          </button>
          <button className='w-20 card__content__button' disabled={props.data.odds[2].totalsOver == 0} onClick={() => PubSub.publish('event-clicked',[props.data,6])}>

          {props.data.odds[2].totalsOver == 0 ? <div className='align-center'> - </div>
              : <div className='direction-row space-between p-12'>
                <div>(O {props.data.odds[2].totalsPoints})</div>
                <div>{props.data.odds[2].totalsOver}</div>
              </div>


            }
            
          </button>
        </div>
        <div className="card__content direction-row m-t--16">
          <div className='card__content__title w-40 m-20 font-weight-500'>{props.data.teams[0].away}</div>
          <button className='w-20 card__content__button align-center' onClick={() => PubSub.publish('event-clicked',[props.data,2])}>{props.data.odds[0].mlAway}</button>
          <button className='w-20 card__content__button' disabled={props.data.odds[1].spreadAway == 0} onClick={() => PubSub.publish('event-clicked',[props.data,5])}>
            {props.data.odds[1].spreadAway == 0 ? <div className='align-center'> - </div>
              : <div className='direction-row space-between p-12'>
                <div>{(props.data.odds[1].spreadPoints < 0) ? '+' + Math.abs(props.data.odds[1].spreadPoints) : '-' + props.data.odds[1].spreadPoints}</div>
                <div>{props.data.odds[1].spreadAway}</div>
              </div>


            }
          </button>
          <button className='w-20 card__content__button' disabled={props.data.odds[2].totalsUnder == 0} onClick={() => PubSub.publish('event-clicked',[props.data,7])}>

          {props.data.odds[2].totalsUnder == 0 ? <div className='align-center'> - </div>
              : <div className='direction-row space-between p-12'>
                
                <div>(U {props.data.odds[2].totalsPoints})</div>
                <div>{props.data.odds[2].totalsUnder}</div>
              </div>


            }
            
          </button>
        </div>
        <div className="card__content direction-row m-t--16">
          <div className='card__content__title w-40 m-20 font-weight-500'>Draw</div>
          <button className='w-20 card__content__button align-center' disabled={props.data.odds[0].mlDraw == 0} onClick={() => PubSub.publish('event-clicked',[props.data,3])}>{props.data.odds[0].mlDraw == 0? "-" :props.data.odds[0].mlDraw}</button>
          <button className='w-20 card__content__button card__empty'></button>
          <button className='w-20 card__content__button card__empty'></button>
        </div>
        </div>
      </div>
    );
  };
}
