import React from 'react';
import ReactMapGL, {Popup} from 'react-map-gl';
import debounce from 'lodash/debounce';

import BuoyOverlay from './buoy_overlay.jsx'
import 'mapbox-gl/dist/mapbox-gl.css';

// name: Map
// description: A component that renders a ReactMapGL and any applicable overlays or popups.
//
// props:
//   'buoys' -- Object; a table of buoys to which the client is subscribed
//   'setBounds' -- Function; called when the viewport changes, args: MapboxGL LngLatBounds for the
//                  current viewport
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
      isHowToOpen: true, // is the little instruction window open
    };

    // name: updateSubscription
    // description: Attempts to update subscription once the viewport has been still for a moment.
    //
    // params:
    //   none
    //
    // returns: nothing
    this.updateSubscription = debounce(() =>
      this.props.setBounds(this.mapRef.getMap().getBounds()), 500).bind(this);

    this.handleHover = this.handleHover.bind(this);
    this.resize = this.resize.bind(this);
    this.addOverlay = this.addOverlay.bind(this);
    this.addPopup = this.addPopup.bind(this);
  }

  componentDidMount() {
    // initializes subscription and resizes map to fit window
    if (this.mapRef) {
      this.props.setBounds(this.mapRef.getMap().getBounds());
    }
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  // name: handleHover
  // description: Tracks mouse cursor position while it's hovering over the map.
  //
  // params:
  //   'e' -- Object; event object containing the cursor's current coordinates
  //
  // returns: nothing
  handleHover(e) {
    this.setState({ mousePos: e.lngLat });
  }

  // name: resize
  // description: Resizes the map to fill the window, defaults to 600px by 400px.
  //
  // params:
  //   none
  //
  // returns: nothing
  resize() {
    this.setState({
      width: window.innerWidth || 600,
      height: window.innerHeight || 400,
    });
  }

  // name: addOverlay
  // description: Adds a BuoyOverlay if there are buoys in the current subscription.
  //
  // params:
  //   'buoys' -- Object; the buoys to be rendered
  //
  // returns: BuoyOverlay; a BuoyOverlay containing the subscribed buoys
  addOverlay(buoys) {
    if (Object.keys(buoys).length > 0) {
      return (
        <BuoyOverlay
          id='buoys'
          buoys={buoys}
          radius={10}
          isMouseOver={(center, radius, project) => {
            // uses distance formula to check if a specific buoy is being moused over
            if (this.state.mousePos) {
              const mousePosPx = project(this.state.mousePos);
              return Math.hypot(center[0] - mousePosPx[0], center[1] - mousePosPx[1]) <= radius;
            }
            return false;
          }}
        />
      );
    }
  }

  // name: addPopup
  // description: Adds a Popup containing instructions if it has not been closed.
  //
  // params:
  //   'isHowToOpen' -- Bool; true if the instruction Popup has not been closed, otherwise false
  //
  // returns: Popup; a Popup containing instructions for the map
  addPopup(isHowToOpen) {
    if (isHowToOpen) {
      return (
        <Popup
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          tipSize={0} // set to 0 for a plain rectangle
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
        ref={(map) => this.mapRef = map} // reference to the MapboxGL Map object
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
        mapboxApiAccessToken={MapboxAccessToken}> // environment var baked in with Webpack
        {this.addOverlay(this.props.buoys)}
        {this.addPopup(this.state.isHowToOpen)}
      </ReactMapGL>
    );
  }
}

export default Map;
