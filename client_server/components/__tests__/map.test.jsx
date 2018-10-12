import React from 'react';
import ReactMapGL from 'react-map-gl';

import Map from '../map.jsx';

describe('Map', () => {
  test('should render correctly', () => {
    const map = shallow(
      <Map
        buoys={{}}
        setBounds={() => {}}
      />
    );

    expect(map).toMatchSnapshot();
  });

  test('should render overlay when subbed to buoys', () => {
    const map = shallow(
      <Map
        buoys={{
          jest_buoy_0: {
            name: 'jest_buoy_0',
            lat: 42,
            lon: -42,
            height: 3,
            period: 3,
          },
        }}
        setBounds={() => {}}
      />
    );

    expect(map).toMatchSnapshot();
  });

  test('should track cursor position on hover', () => {
    const map = shallow(
      <Map
        buoys={{}}
        setBounds={() => {}}
      />
    );
    const reactMap = map.find(ReactMapGL);

    reactMap.simulate('hover', { lngLat: [42, -42] });
    expect(map.state('mousePos')).toEqual([42, -42]);
  });

  test('should resize when window is resized', () => {
    const map = shallow(
      <Map
        buoys={{}}
        setBounds={() => {}}
      />
    );

    window.innerWidth = 30;
    window.innerHeight = 32;
    window.dispatchEvent(new Event('resize'));
    expect(map.state('width')).toBe(30);
    expect(map.state('height')).toBe(32);
  });

  test('should update state/subscription when viewport changes', () => {
    const map = shallow(
      <Map
        buoys={{}}
        setBounds={() => {}}
      />
    );
    const reactMap = map.find(ReactMapGL);

    reactMap.simulate('viewportChange', {
      width: 30,
      height: 31,
      latitude: 32,
      longitude: 33,
      zoom: 34,
    });
    expect(map.state()).toEqual({
      width: 30,
      height: 31,
      latitude: 32,
      longitude: 33,
      zoom: 34,
      mousePos: null,
      isHowToOpen: true,
    });
  });
});
