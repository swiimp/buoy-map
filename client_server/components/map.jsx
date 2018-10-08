import React from 'react';
import ReactMapGL from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 400,
      height: 400,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8,
    };
  }

  render() {
    return (
      <ReactMapGL
        width={this.state.width}
        height={this.state.height}
        latitude={this.state.latitude}
        longitude={this.state.longitude}
        zoom={this.state.zoom}
        onViewportChange={(viewport) => this.setState({viewport})}
        mapboxApiAccessToken={MapboxAccessToken}
      />
    );
  }
}

// const Map = (props) => {
//   const getCondition = (height, period) => {
//     if (height < 4 || period < 4) {
//       return 'Poor';
//     } else if (height < 12 || height < 12) {
//       return 'Fair';
//     } else {
//       return 'Good';
//     }
//   }
//   const results = [];
//
//   for (let buoyName in props.buoys) {
//     results.push(
//       <div className="buoy" key={buoyName}>
//         <p>Name: {buoyName}</p>
//         <p>Lat: {props.buoys[buoyName].lat}</p>
//         <p>Lon: {props.buoys[buoyName].lon}</p>
//         <p>Height: {props.buoys[buoyName].height ? props.buoys[buoyName].height : 'Unavailable'}</p>
//         <p>Period: {props.buoys[buoyName].period ? props.buoys[buoyName].period : 'Unavailable'}</p>
//         <p>Condition: {getCondition(props.buoys[buoyName].height, props.buoys[buoyName].period)}</p>
//       </div>
//     );
//   }
//
//   return results;
// };

export default Map;
