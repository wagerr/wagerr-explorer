
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class Card extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    return (
      <div
        className={ `card ${ props.className ? props.className : '' }` }
        style={ !!props.style ? props.style : {} }>
           
        <p className="card__title" style={props.pstyle}>
          <span>{ props.title }</span>
          <span>{ props.title2 }</span>
          <span className="float-right" >
             {props.actionItem}   
          </span>
             </p>                        
       
        
        
        <div className="card__body">
          { props.children }
        </div>
      </div>
    );
  };
}
