import React from 'react';
import io from 'socket.io-client';

import Map from './map.jsx';

class BuoyMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buoys: {},
      bounds: {
        west: null,
        south: null,
        east: null,
        north: null,
      },
    };

    this.handleChange = this.handleChange.bind(this);

    if (typeof window !== 'undefined') {
      this.socket = io();
      this.socket.on('notification', (buoyData) => {
        console.dir('buoyNotification', buoyData);
      });
    }
  }

  handleChange(e) {
    console.dir(e);
    const boundMap = {
      'bound-west': 'west',
      'bound-south': 'south',
      'bound-east': 'east',
      'bound-north': 'north',
    };
    const newBounds = {
      west: this.state.bounds.west,
      south: this.state.bounds.south,
      east: this.state.bounds.east,
      north: this.state.bounds.north,
    };
    newBounds[boundMap[e.target.className]] = e.target.val;
    this.setState({ bounds: newBounds });
  }

  handleEnter(e) {
    e.preventDefault();
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  }

  render() {
    return (
      <div className="buoy-map">
        <div className="dev-controls">
          <input
            className="bound-west"
            type="text"
            value={this.state.bounds.west}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
          />
          <input
            className="bound-south"
            type="text"
            value={this.state.bounds.south}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
          />
          <input
            className="bound-east"
            type="text"
            value={this.state.bounds.east}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
          />
          <input
            className="bound-north"
            type="text"
            value={this.state.bounds.north}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
          />
          <button className="bound-subscribe" onClick={this.subscribeToBuoys}>Submit</button>
        </div>
        <Map buoys={this.state.buoys}/>
      </div>
    );
  }
}

export default BuoyMap;
