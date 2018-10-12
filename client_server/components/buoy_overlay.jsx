import React from 'react';

import CanvasOverlay from 'react-map-gl/src/overlays/canvas-overlay.js';

// name: BuoyOverlay
// description: A component that renders a CanvasOverlay that draws buoys and buoy info on screen.
//
// props:
//   'buoys' -- Object; a table of buoys to render
//   'radius' -- Integer; the radius of the rendered buoys in pixels
//   'isMouseOver' -- Function; a function that determines whether or not a buoy is being moused
//                    over, receives three arguments: 'center', 'radius', 'project'
//                     \__ 'center' -- Array; center of the buoy in the format [x, y] in pixels
//                     |__ 'radius' -- Integer; the radius of the rendered buoys in pixels
//                     |__ 'project' -- Function; converts [lon, lat] coords to [x, y] pixel coords
class BuoyOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.drawBuoys = this.drawBuoys.bind(this);
  }

  // name: drawBuoys
  // description: The draw function to be passed in the CanvasOverlay. Draws circles representing
  //              each buoy passed in through props in a color corresponding to its condition. If
  //              a function is passed into the 'isMouseOver' prop, buoy info will only be drawn
  //              when that function evaluates to true. Otherwise, buoy info will always be drawn.
  //
  // params:
  //   'params' -- Object; arguments passed in by CanvasOverlay._redraw(), see link for more info:
  //               https://github.com/uber/react-map-gl/blob/master/docs/overlays/canvas-overlay.md
  //               Relavent args for this function are: 'ctx', 'project'
  //               \__ 'ctx' -- CanvasRenderingContext2D; canvas instance for drawing
  //               |__ 'project' -- Function; converts [lon, lat] coords to [x, y] pixel coords
  //
  // returns: nothing
  drawBuoys(params) {
    // helper function for parsing height and period
    const getCondition = (height, period) => {
      if (height < 4 || period < 4) {
        return ['Poor', 'red'];
      } else if (height < 12 || height < 12) {
        return ['Fair', 'yellow'];
      } else {
        return ['Good', 'green'];
      }
    };

    // helper function for drawing a multi-line block of text containing buoy info
    const writeInfo = (buoy, condition, ctx, center, radius) => {
      // position of the bottom-left corner of the text area
      const cornerX = center[0] + 4 + radius / Math.sqrt(2);
      const cornerY = center[1] - 2 + radius / Math.sqrt(2);
      // measure buoy name to determine background width
      const conText = `Condition: ${condition}`;
      const boxWidth = buoy.name.length + 6 > 15 ?
                        ctx.measureText(`Name: ${buoy.name}`).width :
                        ctx.measureText(conText).width;

      // vertical offset for info text starting point
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
      // gets pixel position from lon-lat coordinates
      const center = params.project([buoy.lon, buoy.lat]);
      const condition = getCondition(buoy.height, buoy.period);
      const radius = this.props.radius;

      params.ctx.globalCompositeOperation = 'source-over';
      // set fillStyle to red, yellow, or green depending on condition
      params.ctx.fillStyle = condition[1];
      // draw circle
      params.ctx.beginPath();
      params.ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI, false);
      params.ctx.fill();
      // if buoy is being moused over or there is no 'isMouseOver' prop, draw text
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
