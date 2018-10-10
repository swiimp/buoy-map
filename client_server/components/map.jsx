import React from 'react';
import ReactMapGL from 'react-map-gl';
import {defaultStyle} from '../utils/default_style.js'
import 'mapbox-gl/dist/mapbox-gl.css';

import BuoyOverlay from './buoy_overlay.jsx'
import CanvasOverlay from 'react-map-gl/src/overlays/canvas-overlay.js'

let animation = null;

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
      isDrawing: false,
      mousePos: null,
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
      this.setState({ isDrawing: false });
      window.cancelAnimationFrame(animation);
      this.props.setBounds(this.state.startCorner, this.state.endCorner);
    } else {
      this.setState({
        isDrawing: true,
        startCorner: e.lngLat,
      });
    }
  }

  handleHover(e) {
    if (this.state.isDrawing) {
      animation = window.requestAnimationFrame(() =>
        this.setState({
          mousePos: e.lngLat,
          endCorner: e.lngLat,
        }));
    } else {
      this.setState({ mousePos: e.lngLat });
    }
  }

  drawBox(params) {
    const rectStart = params.project(this.state.startCorner);
    const rectEnd = params.project(this.state.endCorner);
    const rectWidth = rectEnd[0] - rectStart[0];
    const rectHeight = rectEnd[1] - rectStart[1];

    params.ctx.clearRect(0, 0, params.width, params.height);
    params.ctx.globalCompositeOperation = 'source-over';
    params.ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
    params.ctx.strokeStyle = 'rgb(0, 255, 0)';
    params.ctx.fillRect(rectStart[0], rectStart[1], rectWidth, rectHeight);
  }

  addOverlay(buoys, startCorner, endCorner) {
    const childNodes = [];

    if (endCorner && startCorner) {
      childNodes.push(
        <CanvasOverlay
          id='box'
          redraw={this.drawBox}
        />
      );
    }
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
        onClick={this.handleClick}
        onHover={this.handleHover}
        mapboxApiAccessToken={MapboxAccessToken}>
        {this.addOverlay(this.props.buoys, this.state.startCorner, this.state.endCorner)}
      </ReactMapGL>
    );
  }
}

export default Map;
