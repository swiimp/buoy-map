import React from 'react';
import ReactMapGL from 'react-map-gl';
import debounce from 'lodash/debounce';

import {defaultStyle} from '../utils/default_style.js'
import BuoyOverlay from './buoy_overlay.jsx'
import 'mapbox-gl/dist/mapbox-gl.css';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // mapStyle: defaultStyle,
      width: 600,
      height: 400,
      latitude: 34.454,
      longitude: -120.783,
      zoom: 8,
      mousePos: null,
    };

    this.updateSubscription = debounce(() =>
      this.props.setBounds(this.mapRef.getMap().getBounds()), 500);

    this.handleHover = this.handleHover.bind(this);
    this.resize = this.resize.bind(this);
    this.addOverlay = this.addOverlay.bind(this);
    this.updateSubscription = this.updateSubscription.bind(this);
  }

  componentDidMount() {
    this.props.setBounds(this.mapRef.getMap().getBounds());
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  handleHover(e) {
    this.setState({ mousePos: e.lngLat });
  }

  resize() {
    this.setState({
      width: window.innerWidth || 600,
      height: window.innerHeight || 400,
    });
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
            if (this.state.mousePos) {
              const mousePosPx = project(this.state.mousePos);
              return Math.hypot(center[0] - mousePosPx[0], center[1] - mousePosPx[1]) <= radius;
            }
            return false;
          }}
        />
      );
    }

    return childNodes;
  }

  render() {
    return (
      <ReactMapGL
        ref={(map) => this.mapRef = map}
        // mapStyle={this.state.mapStyle}
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
          }, this.updateSubscription)
        }
        onHover={this.handleHover}
        mapboxApiAccessToken={MapboxAccessToken}>
        {this.addOverlay(this.props.buoys)}
      </ReactMapGL>
    );
  }
}

export default Map;
