import React from 'react';
import ReactDOM from 'react-dom';
import BuoyMap from './buoy_map.jsx';

ReactDOM.render(
  <BuoyMap
    lonPrecache={5}
    latPrecache={10}
  />, document.getElementById('app'));
