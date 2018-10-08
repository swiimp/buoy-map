import React from 'react';
import io from 'socket.io-client';

import Map from './map.jsx';

class BuoyMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buoys: {},
      west: '',
      south: '',
      east: '',
      north: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.subscribeToBuoys = this.subscribeToBuoys.bind(this);
    this.buoyNotification = this.buoyNotification.bind(this);

    if (typeof window !== 'undefined') {
      this.socket = io();
      this.socket.on('notification', (data) => {
        console.log(data);
        const req = JSON.parse(data);
        this.buoyNotification(req.params);
      });
    }
  }

  handleChange(e) {
    const boundMap = {
      'bound-west': 'west',
      'bound-south': 'south',
      'bound-east': 'east',
      'bound-north': 'north',
    };
    const newState = {};
    newState[boundMap[e.target.className]] = e.target.value;
    this.setState(newState);
  }

  handleEnter(e) {
    e.preventDefault();
    if (e.key === 'Enter') {
      this.subscribeToBuoys();
    }
  }

  subscribeToBuoys() {
    const rpc = {
      jsonrpc: '2.0',
      method: 'subscribeToBuoys',
      params: {
        west: parseFloat(this.state.west),
        south: parseFloat(this.state.south),
        east: parseFloat(this.state.east),
        north: parseFloat(this.state.north),
      },
    };
    this.socket.send(JSON.stringify(rpc));
  }

  buoyNotification(buoy) {
    const newBuoys = Object.assign({}, this.state.buoys);
    newBuoys[buoy.name] = {
      name: buoy.name,
      lat: buoy.lat,
      lon: buoy.lon,
      height: buoy.height,
      period: buoy.period,
    };
    this.setState({ buoys: newBuoys });
  }

  render() {
    return (
      <div className="buoy-map">
        <div className="dev-controls">
          <input
            className="bound-west"
            type="text"
            value={this.state.west}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
          />
          <input
            className="bound-south"
            type="text"
            value={this.state.south}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
          />
          <input
            className="bound-east"
            type="text"
            value={this.state.east}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
          />
          <input
            className="bound-north"
            type="text"
            value={this.state.north}
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
