import React from 'react';

import CanvasOverlay from 'react-map-gl/src/overlays/canvas-overlay.js'

class BuoyOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.drawBuoys = this.drawBuoys.bind(this);
  }

  drawBuoys(params) {
    const getCondition = (height, period) => {
      if (height < 4 || period < 4) {
        return 'red';
      } else if (height < 12 || height < 12) {
        return 'yellow';
      } else {
        return 'green';
      }
    };

    params.ctx.clearRect(0, 0, params.width, params.height);
    for (let buoyName in this.props.buoys) {
      const buoy = this.props.buoys[buoyName];
      const center = params.project([buoy.lon, buoy.lat]);

      params.ctx.globalCompositeOperation = 'source-over';
      params.ctx.fillStyle = getCondition(buoy.height, buoy.period);
      params.ctx.beginPath();
      params.ctx.arc(center[0], center[1], 10, 0, 2 * Math.PI, false);
      params.ctx.fill();
    }
  }

  render() {
    return (
      <CanvasOverlay
        redraw={this.drawBuoys}
      />
    );
  }
}

export default BuoyOverlay;
