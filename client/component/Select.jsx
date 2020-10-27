import React, { Component } from 'react';
import Select from 'react-opium-select';
import 'react-opium-select/style.css';

class App extends Component {
  render() {
    const settings = {
      style: {
        background: '#300000',
        borderColor: '#e8e8e8',
        borderRadius: 5,
        textColor: '#FFF',
        padding: '1px 10px',
      },
    };

    return (
      <div className="select" style={{ marginTop: -5}}>
        <Select
          { ...this.props }
          settings={ settings } />
      </div>
    );
  }
}

export default App;
