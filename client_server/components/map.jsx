import React from 'react';
import ReactMapGL from 'react-map-gl';
import {defaultStyle} from '../utils/default_style.js'
import 'mapbox-gl/dist/mapbox-gl.css';

import BuoyOverlay from './buoy_overlay.jsx'

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapStyle: defaultStyle,
      width: 600,
      height: 400,
      latitude: 34.454,
      longitude: -120.783,
      zoom: 8,
      mousePos: null,
    };

    this.handleHover = this.handleHover.bind(this);
    this.addOverlay = this.addOverlay.bind(this);
  }

  handleHover(e) {
    this.setState({ mousePos: e.lngLat });
  }

  addOverlay(buoys, startCorner, endCorner) {
    const childNodes = [];

    if (Object.keys(buoys).length > 0) {
      childNodes.push(
        <BuoyOverlay
          id='buoys'
          buoys={buoys}
          radius={10}
          isMouseOver={(center, radius, project) => {
            const mousePosPx = project(this.state.mousePos);
            return Math.hypot(center[0] - mousePosPx[0], center[1] - mousePosPx[1]) <= radius;
          }}
        />
      );
    }

    return childNodes;
  }

  render() {
    return (
      <ReactMapGL
        mapStyle={this.state.mapStyle}
        width={this.state.width}
        height={this.state.height}
        latitude={this.state.latitude}
        longitude={this.state.longitude}
        zoom={this.state.zoom}
        dragPan={this.state.dragPan}
        onViewportChange={(viewport) =>
          this.setState({
            width: viewport.width,
            height: viewport.height,
            latitude: viewport.latitude,
            longitude: viewport.longitude,
            zoom: viewport.zoom,
          })
        }
        onHover={this.handleHover}
        mapboxApiAccessToken={MapboxAccessToken}>
        {this.addOverlay(this.props.buoys)}
      </ReactMapGL>
    );
  }
}

export default Map;
