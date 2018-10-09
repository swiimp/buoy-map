import React from 'react';
import ReactMapGL from 'react-map-gl';
import {defaultStyle} from '../utils/default_style.js'
import 'mapbox-gl/dist/mapbox-gl.css';

import CanvasOverlay from 'react-map-gl/src/overlays/canvas-overlay.js'

let animation = null;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapStyle: defaultStyle,
      width: 600,
      height: 400,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8,
      isDrawing: false,
      startCorner: null,
      endCorner: null,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.drawBox = this.drawBox.bind(this);
    this.addOverlay = this.addOverlay.bind(this);
  }

  handleClick(e) {
    if (this.state.isDrawing) {
      window.cancelAnimationFrame(animation);
      this.setState({ isDrawing: false });
    } else {
      this.setState({
        startCorner: e.lngLat,
        isDrawing: true,
      });
    }
  }

  handleHover(e) {
    if (this.state.isDrawing) {
      animation = window.requestAnimationFrame(() => this.setState({ endCorner: e.lngLat }));
    }
  }

  drawBox(params) {
    const context = params.ctx;
    const rectStart = params.project(this.state.startCorner);
    const rectEnd = params.project(this.state.endCorner);
    const rectWidth = rectEnd[0] - rectStart[0];
    const rectHeight = rectEnd[1] - rectStart[1];

    context.clearRect(0, 0, params.width, params.height);
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = 'rgba(0, 255, 0, 0.1)';
    context.fillRect(rectStart[0], rectStart[1], rectWidth, rectHeight);
  }

  addOverlay() {
    const childNodes = [];

    if (this.state.endCorner && this.state.startCorner) {
      childNodes.push(
        <CanvasOverlay redraw={this.drawBox}/>
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
        onClick={this.handleClick}
        onHover={this.handleHover}
        mapboxApiAccessToken={MapboxAccessToken}>
        {this.addOverlay()}
      </ReactMapGL>
    );
  }
}

//   const getCondition = (height, period) => {
//     if (height < 4 || period < 4) {
//       return 'Poor';
//     } else if (height < 12 || height < 12) {
//       return 'Fair';
//     } else {
//       return 'Good';
//     }
//   }

export default Map;
