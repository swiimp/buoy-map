import React from 'react';

import BuoyOverlay from '../buoy_overlay.jsx';

describe('BuoyOverlay', () => {
  test('should render buoys', () => {
    const testBuoys = {
      jest_buoy_0: {
        name: 'jest_buoy_0',
        lat: 42,
        lon: -42,
        height: 3,
        period: 3,
      },
      jest_buoy_1: {
        name: 'jest_buoy_1',
        lat: 30,
        lon: -30,
        height: 8,
        period: 8,
      },
      jest_buoy_2: {
        name: 'jest_buoy_2',
        lat: 0,
        lon: -100,
        height: 12,
        period: 12,
      },
    };
    const mockParams = {
      ctx: {
        clearRect: jest.fn().mockName('clearRect'),
        measureText: jest.fn(() => {
          return { width: 42 };
        }).mockName('measureText'),
        fillRect: jest.fn().mockName('fillRect'),
        fillText: jest.fn().mockName('fillText'),
        beginPath: jest.fn().mockName('beginPath'),
        arc: jest.fn().mockName('arc'),
        fill: jest.fn().mockName('fill'),
      },
      project: jest.fn((lngLat) => lngLat).mockName('project'),
    };
    const testOverlay = new BuoyOverlay({
      buoys: testBuoys,
      radius: 10,
    });

    testOverlay.drawBuoys(mockParams);

    expect(mockParams.ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(mockParams.ctx.arc).toHaveBeenCalledTimes(3);
    expect(mockParams.ctx.fillRect).toHaveBeenCalledTimes(3);
    expect(mockParams.ctx.fillText).toHaveBeenCalledTimes(18);
    for (let buoy in testBuoys) {
      expect(mockParams.ctx.arc)
        .toHaveBeenCalledWith(testBuoys[buoy].lon, testBuoys[buoy].lat, 10, 0, 2 * Math.PI, false);
      for (let prop in testBuoys[buoy]) {
        const field = prop.charAt(0).toUpperCase() + prop.slice(1);
        expect(mockParams.ctx.fillText)
          .toHaveBeenCalledWith(`${field}: ${testBuoys[buoy][prop]}`,
            expect.anything(), expect.anything());
      }
    }
  });
});
