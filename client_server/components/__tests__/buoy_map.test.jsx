import React from 'react';

import BuoyMap from '../buoy_map.jsx';

describe('BuoyMap', () => {
  test('should update state when a notification is received', () => {
    const buoyMap = shallow(
      <BuoyMap
        lonPrecache={5}
        latPrecache={10}
      />
    );
    const notifArg = {
      params: {
        name: 'jest_buoy_0',
        lat: 42,
        lon: -42,
        height: 7,
        period: 7,
      },
    };

    buoyMap.instance().socket.triggerNotification(JSON.stringify(notifArg));
    expect(buoyMap.state('buoys')).toEqual({ 'jest_buoy_0': notifArg.params });
  });

  test('should update subscription when bounds are received', () => {
    const buoyMap = shallow(
      <BuoyMap
        lonPrecache={5}
        latPrecache={10}
      />
    );
    const mockBounds = {
      getWest: () => 30,
      getEast: () => 42,
      getSouth: () => -42,
      getNorth: () => -30,
    };
    const expectedState = {
      buoys: {},
      west: 25,
      east: 47,
      south: -52,
      north: -20,
    };
    const expectedRPC = JSON.stringify({
      jsonrpc: '2.0',
      method: 'subscribeToBuoys',
      params: {
        west: 25,
        south: -52,
        east: 47,
        north: -20,
      },
    });

    buoyMap.instance().setBounds(mockBounds);
    expect(buoyMap.state()).toEqual(expectedState);
    expect(buoyMap.instance().socket.send).toHaveBeenCalledWith(expectedRPC);
  });
});
