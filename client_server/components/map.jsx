import React from 'react';
import ReactMapGL, {Popup} from 'react-map-gl';
import debounce from 'lodash/debounce';

import BuoyOverlay from './buoy_overlay.jsx'
import 'mapbox-gl/dist/mapbox-gl.css';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 600,
      height: 400,
      latitude: 34.454,
      longitude: -120.783,
      zoom: 8,
      mousePos: null,
      isHowToOpen: true,
    };

    this.updateSubscription = debounce(() =>
      this.props.setBounds(this.mapRef.getMap().getBounds()), 500).bind(this);

    this.handleHover = this.handleHover.bind(this);
    this.resize = this.resize.bind(this);
    this.addOverlay = this.addOverlay.bind(this);
    this.addPopup = this.addPopup.bind(this);
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

  addPopup(isHowToOpen) {
    if (isHowToOpen) {
      return (
        <Popup
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          tipSize={0}
          onClose={() => this.setState({ isHowToOpen: false })}
          >
          <p>
            Basic Controls:<br/>
            Left-click + drag: Pan viewport<br/>
            Scroll up/down: Zoom in/out<br/><br/>
            Hover over points to get more info.<br/>
            (Click dialog to close)
          </p>
        </Popup>
      );
    }
  }

  render() {
    return (
      <ReactMapGL
        ref={(map) => this.mapRef = map}
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
        {this.addPopup(this.state.isHowToOpen)}
      </ReactMapGL>
    );
  }
}

export default Map;
