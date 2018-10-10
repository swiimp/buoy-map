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
        return ['Poor', 'red'];
      } else if (height < 12 || height < 12) {
        return ['Fair', 'yellow'];
      } else {
        return ['Good', 'green'];
      }
    };

    const writeInfo = (buoy, condition, ctx, center) => {
      let offset = -36;
      for (let prop in buoy) {
        const field = prop.charAt(0).toUpperCase() + prop.slice(1);
        offset += 12;
        ctx.fillText(`${field}: ${buoy[prop]}`, center[0] + 12, center[1] + offset);
      }
      offset += 12;
      ctx.fillText(`Condition: ${condition}`, center[0] + 12, center[1] + offset);
    };

    params.ctx.clearRect(0, 0, params.width, params.height);
    for (let buoyName in this.props.buoys) {
      const buoy = this.props.buoys[buoyName];
      const center = params.project([buoy.lon, buoy.lat]);
      const condition = getCondition(buoy.height, buoy.period);

      params.ctx.globalCompositeOperation = 'source-over';
      params.ctx.fillStyle = condition[1];
      params.ctx.beginPath();
      params.ctx.arc(center[0], center[1], 10, 0, 2 * Math.PI, false);
      params.ctx.fill();
      params.ctx.fillStyle = 'black';
      writeInfo(buoy, condition[0], params.ctx, center);
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
