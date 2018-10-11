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

  setBounds(startCorner, endCorner) {
    this.setState({
      west: Math.min(startCorner[0], endCorner[0]),
      south: Math.min(startCorner[1], endCorner[1]),
      east: Math.max(startCorner[0], endCorner[0]),
      north: Math.max(startCorner[1], endCorner[1]),
    }, () => this.subscribeToBuoys());
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
