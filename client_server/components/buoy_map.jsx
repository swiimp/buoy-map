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
    this.setBounds = this.setBounds.bind(this);

    this.socket = io();
    this.socket.on('notification', (data) => {
      const req = JSON.parse(data);
      this.buoyNotification(req.params);
    });
  }

  handleChange(e) {
    const newState = {};
    newState[e.target.id] = e.target.value;
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
        <Map
          buoys={this.state.buoys}
          setBounds={this.setBounds}
        />
        <form className="map-controls">
          <div className="map-controls-col">
            <label for="west">West</label>
            <input
            id="west"
            className="latlon-input"
            type="text"
            value={this.state.west}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
            />
            <label for="east">East</label>
            <input
            id="east"
            className="latlon-input"
            type="text"
            value={this.state.east}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
            />
          </div>
          <div className="map-controls-col">
            <label for="south">South</label>
            <input
            id="south"
            className="latlon-input"
            type="text"
            value={this.state.south}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
            />
            <label for="north">North</label>
            <input
            id="north"
            className="latlon-input"
            type="text"
            value={this.state.north}
            onChange={this.handleChange}
            onKeyUp={this.handleEnter}
            />
          </div>
        </form>
        <button className="bound-subscribe" onClick={this.subscribeToBuoys}>Submit</button>
      </div>
    );
  }
}

export default BuoyMap;
