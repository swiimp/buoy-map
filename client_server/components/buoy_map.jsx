import React from 'react';
import io from 'socket.io-client';

import Map from './map.jsx';
import '../utils/main.css';

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
    this.createDump = this.createDump.bind(this);
    this.setBounds = this.setBounds.bind(this);

    this.socket = io();
    this.socket.on('notification', (data) => {
      const req = JSON.parse(data);
      this.buoyNotification(req.params);
    });
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

  createDump() {
    const rpc = {
      jsonrpc: '2.0',
      method: 'createDump',
      params: {},
    };
    this.socket.send(JSON.stringify(rpc));
  }

  setBounds(startCorner, endCorner) {
    this.setState({
      west: Math.min(startCorner[0], endCorner[0]),
      south: Math.min(startCorner[1], endCorner[1]),
      east: Math.max(startCorner[0], endCorner[0]),
      north: Math.max(startCorner[1], endCorner[1]),
    });
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
          <button className="dev-dump" onClick={this.createDump}>Dump Vars</button>
        </div>
        <Map
          buoys={this.state.buoys}
          setBounds={this.setBounds}
        />
      </div>
    );
  }
}

export default BuoyMap;
