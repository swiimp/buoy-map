import React from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';

import Map from './map.jsx';
import '../utils/main.css';

// name: BuoyMap
// description: Top-level component for the BuoyMap application. Manages socket.io communication
//              with client server.
//
// props:
//   'lonPrecache' -- Float; the longitude offset for fetching buoys outside the viewport
//   'latPrecache' -- Float; the latitude offset for fetching buoys outside the viewport
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

    // get an instance of a socket.io client
    this.socket = io();
    this.socket.on('notification', (data) => {
      const req = JSON.parse(data);
      this.buoyNotification(req.params);
    });
  }

  // name: subscribeToBuoys
  // description: Sends a json-rcp 2.0 request for the 'subscribeToBuoys' function.
  //
  // params:
  //   none
  //
  // returns: nothing
  subscribeToBuoys() {
    const rpc = {
      jsonrpc: '2.0',
      method: 'subscribeToBuoys',
      params: {
        west: this.state.west,
        south: this.state.south,
        east: this.state.east,
        north: this.state.north,
      },
    };
    this.socket.send(JSON.stringify(rpc));
  }

  // name: buoyNotification
  // description: Updates the specified buoy state with the given information.
  //
  // params:
  //   'buoy' -- Object; the updated version of the given buoy
  //
  // returns: nothing
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

  // name: setBounds
  // description: Updates the state of the bounds if the given bounds fall outside the current ones.
  //
  // params:
  //   'bounds' -- LngLatBounds; a MapboxGL LngLatBounds object containing the bounds of the
  //               current viewport
  //
  // returns: nothing
  setBounds(bounds) {
    if (bounds.getWest() < this.state.west ||
        bounds.getSouth() < this.state.south ||
        bounds.getEast() > this.state.east ||
        bounds.getNorth() > this.state.north) {
      this.setState({
        // apply precache offsets to retrieve off-screen buoys
        west: bounds.getWest() - this.props.lonPrecache,
        south: bounds.getSouth() - this.props.latPrecache,
        east: bounds.getEast() + this.props.lonPrecache,
        north: bounds.getNorth() + this.props.latPrecache,
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

BuoyMap.propTypes = {
  lonPrecache: PropTypes.number,
  latPrecache: PropTypes.number,
};

BuoyMap.defaultProps = {
  lonPrecache: 0,
  latPrecache: 0,
}

export default BuoyMap;
