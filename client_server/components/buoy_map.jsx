import React from 'react';
import io from 'socket.io-client';

import Map from './map.jsx';
import '../utils/main.css';

class BuoyMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buoys: {},
      west: null,
      south: null,
      east: null,
      north: null,
    };

    this.subscribeToBuoys = this.subscribeToBuoys.bind(this);
    this.buoyNotification = this.buoyNotification.bind(this);
    this.setBounds = this.setBounds.bind(this);

    this.socket = io();
    this.socket.on('notification', (data) => {
      const req = JSON.parse(data);
      this.buoyNotification(req.params);
    });
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

  setBounds(bounds) {
    if (bounds.getWest() < this.state.west ||
        bounds.getSouth() < this.state.south ||
        bounds.getEast() > this.state.east ||
        bounds.getNorth() > this.state.north) {
      this.setState({
        west: bounds.getWest() - this.props.lonPrecache,
        south: bounds.getSouth() - this.props.latPrecache,
        east: bounds.getEast() + this.props.lonPrecache,
        north: bounds.getNorth() + this.props.lonPrecache,
      }, () => this.subscribeToBuoys());
    }
  }

  render() {
    return (
      <div className="buoy-map">
        <Map
          buoys={this.state.buoys}
          setBounds={this.setBounds}
        />
      </div>
    );
  }
}

export default BuoyMap;
