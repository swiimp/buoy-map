const BuoyHelpers = require('../buoy_helpers.js');

describe('addBuoy', () => {
  test('should add a new entry for new buoys', () => {
    const params = {
      name: jest_buoy_0,
      lat: 42,
      lon: -42,
    };
    const expectedBuoys = {
      'jest_buoy_0': {
        lat: 42,
        lon: -42,
        height: null,
        period: null,
        clients: [],
      },
    };

    BuoyHelpers.addBuoy(params, () => {
      expect(BuoyHelpers._buoys).toEqual(expectedBuoys);
    });
  });

  test('should not overwrite old buoys', () => {
    expect(true).toBe(true);
  });

  test('should add the buoy to any appropriate subscriptions', () => {
    expect(true).toBe(true);
  });
});
