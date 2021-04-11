
import Chart from 'chart.js';
import Component from '../../core/Component';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';

export default class MultilineChart extends Component {

  constructor(props) {
    super(props);

    this.chart = null;
    this.id = this.randomString();
  };

  componentDidMount() {
    const el = document.getElementById(this.id);

    this.chart = new Chart(el, this.getConfig());
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.data, prevProps.data)) {
      const config = this.getConfig();
      this.chart.config.data = config.data;
      this.chart.update();
    }
  };

  componentWillUnmount() {
    this.chart.destroy();
  };

  getConfig = () => {
    return {
      type: 'line',
      data: this.props.data,
      options: {
        responsive: true,
        title: {
          display: true,
          text: this.props.title
        },
        tooltips: {
          mode: 'index',
          intersect: true
        }
      }
    }
  }


  render() {
    return (
      <div
        className={`${this.props.className ? this.props.className : ''}`}
        style={{ height: this.props.height, width: this.props.width }}>
        <canvas id={this.id} />
      </div>
    );
  };
}
