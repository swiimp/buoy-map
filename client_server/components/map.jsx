import React from 'react';

const Map = (props) => {
  const getCondition = (height, period) => {
    if (height < 4 || period < 4) {
      return 'Poor';
    } else if (height < 12 || height < 12) {
      return 'Fair';
    } else {
      return 'Good';
    }
  }
  const results = [];

  for (let buoyName in props.buoys) {
    results.push(
      <div className="buoy" key={buoyName}>
        <p>Name: {buoyName}</p>
        <p>Lat: {props.buoys[buoyName].lat}</p>
        <p>Lon: {props.buoys[buoyName].lon}</p>
        <p>Height: {props.buoys[buoyName].height ? props.buoys[buoyName].height : 'Unavailable'}</p>
        <p>Period: {props.buoys[buoyName].period ? props.buoys[buoyName].period : 'Unavailable'}</p>
        <p>Condition: {getCondition(props.buoys[buoyName].height, props.buoys[buoyName].period)}</p>
      </div>
    );
  }

  return results;
};

export default Map;
