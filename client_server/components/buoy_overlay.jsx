import React from 'react';

import CanvasOverlay from 'react-map-gl/src/overlays/canvas-overlay.js';

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

    const writeInfo = (buoy, condition, ctx, center, radius) => {
      const cornerX = center[0] + 4 + radius / Math.sqrt(2);
      const cornerY = center[1] - 2 + radius / Math.sqrt(2);
      const conText = `Condition: ${condition}`;
      const boxWidth = buoy.name.length + 6 > 15 ?
                        ctx.measureText(`Name: ${buoy.name}`).width :
                        ctx.measureText(conText).width;

      let yOffset = -84;
      ctx.fillStyle = 'white';
      ctx.fillRect(cornerX - 1, cornerY + yOffset, boxWidth + 2, -yOffset + 1);
      ctx.fillStyle = 'black';
      for (let prop in buoy) {
        const field = prop.charAt(0).toUpperCase() + prop.slice(1);
        yOffset += 12;
        ctx.fillText(`${field}: ${buoy[prop]}`, cornerX, cornerY + yOffset);
      }
      yOffset += 12;
      ctx.fillText(conText, cornerX, cornerY + yOffset);
    };

    params.ctx.clearRect(0, 0, params.width, params.height);
    for (let buoyName in this.props.buoys) {
      const buoy = this.props.buoys[buoyName];
      const center = params.project([buoy.lon, buoy.lat]);
      const condition = getCondition(buoy.height, buoy.period);
      const radius = this.props.radius;

      params.ctx.globalCompositeOperation = 'source-over';
      params.ctx.fillStyle = condition[1];
      params.ctx.beginPath();
      params.ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI, false);
      params.ctx.fill();
      if (!this.props.isMouseOver || this.props.isMouseOver(center, radius, params.project)) {
        writeInfo(buoy, condition[0], params.ctx, center, radius);
      }
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
