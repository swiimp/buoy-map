const BuoyHelpers = require('../buoy_helpers.js');

afterEach(() => {
  for (let buoy in BuoyHelpers._buoys) {
    delete BuoyHelpers._buoys[buoy];
  }
  for (let client in BuoyHelpers._clients) {
    delete BuoyHelpers._clients[client];
  }
  while (BuoyHelpers._latIndex.length > 0) {
    BuoyHelpers._latIndex.pop();
    BuoyHelpers._lonIndex.pop();
  }
});

describe('addBuoy', () => {
  test('should add a new entry for new buoys', () => {
    const params = {
      name: 'jest_buoy_0',
      lat: 42,
      lon: -42,
    };
    const expectedBuoys = {
      jest_buoy_0: {
        lat: 42,
        lon: -42,
        height: null,
        period: null,
        clients: {},
      },
    };

    BuoyHelpers.addBuoy(params, () => {
      expect(BuoyHelpers._buoys).toEqual(expectedBuoys);
    });
  });

  test('should not overwrite old buoys', () => {
    const params_1 = {
      name: 'jest_buoy_0',
      lat: 42,
      lon: -42,
    };
    const params_2 = {
      name: 'jest_buoy_0',
      lat: 30,
      lon: -30,
    };
    const expectedBuoys = {
      jest_buoy_0: {
        lat: 42,
        lon: -42,
        height: null,
        period: null,
        clients: {},
      },
    };

    BuoyHelpers.addBuoy(params_1, () => {
      BuoyHelpers.addBuoy(params_2, () => {
        expect(BuoyHelpers._buoys).toEqual(expectedBuoys);
      });
    });
  });

  test('should add the buoy to any appropriate subscriptions', () => {
    const params_1 = {
      name: 'jest_buoy_0',
      lat: 0,
      lon: 0,
    }
    const params_2 = {
      name: 'jest_buoy_1',
      lat: 42,
      lon: -42,
    };
    const expectedBuoys = {
      jest_buoy_0: {
        lat: 0,
        lon: 0,
        height: null,
        period: null,
        clients: {},
      },
      jest_buoy_1: {
        lat: 42,
        lon: -42,
        height: null,
        period: null,
        clients: { client_0: 'client_0' },
      },
    };
    const expectedClients = {
      client_0: {
        buoys: { jest_buoy_1: 'jest_buoy_1' },
        bounds: {
          west: -43,
          east: -41,
          south: 41,
          north: 43,
        },
      },
    };

    BuoyHelpers.subscribeToBuoys({ west: -43, east: -41, south: 41, north: 43 }, () => {
      BuoyHelpers.addBuoy(params_1, () => {
        BuoyHelpers.addBuoy(params_2, () => {
          expect(BuoyHelpers._clients).toEqual(expectedClients);
          expect(BuoyHelpers._buoys).toEqual(expectedBuoys);
        });
      });
    }, 'client_0');
  });

  test('should properly index buoys', () => {
    const params_1 = {
      name: 'jest_buoy_0',
      lat: 0,
      lon: 0,
    };
    const params_2 = {
      name: 'jest_buoy_1',
      lat: 42,
      lon: -42,
    };
    const params_3 = {
      name: 'jest_buoy_2',
      lat : 30,
      lon : -30,
    };
    const params_4 = {
      name: 'jest_buoy_3',
      lat: -10,
      lon: 100,
    };
    const expectedLatIndex = [
      { name: 'jest_buoy_3', lat: -10, lon: 100 },
      { name: 'jest_buoy_0', lat: 0, lon: 0 },
      { name: 'jest_buoy_2', lat: 30, lon: -30 },
      { name: 'jest_buoy_1', lat: 42, lon: -42 },
    ];
    const expectedLonIndex = [
      { name: 'jest_buoy_1', lat: 42, lon: -42 },
      { name: 'jest_buoy_2', lat: 30, lon: -30 },
      { name: 'jest_buoy_0', lat: 0, lon: 0 },
      { name: 'jest_buoy_3', lat: -10, lon: 100 },
    ];

    BuoyHelpers.addBuoy(params_1, () => {
      BuoyHelpers.addBuoy(params_2, () => {
        BuoyHelpers.addBuoy(params_3, () => {
          BuoyHelpers.addBuoy(params_4, () => {
            expect(BuoyHelpers._latIndex).toEqual(expectedLatIndex);
            expect(BuoyHelpers._lonIndex).toEqual(expectedLonIndex);
          });
        });
      });
    });
  });
});

describe('updateBuoyData', () => {
  test('should update the target buoy with the given data', () => {
    const params_1 = {
      name: 'jest_buoy_0',
      lat: 0,
      lon: 0,
    };
    const params_2 = {
      name: 'jest_buoy_0',
      height: 42,
      period: 4.2,
    };
    const expectedBuoys = {
      jest_buoy_0: {
        lat: 0,
        lon: 0,
        height: 42,
        period: 4.2,
        clients: {},
      },
    };

    BuoyHelpers.addBuoy(params_1, () => {
      BuoyHelpers.updateBuoyData(params_2, () => {
        expect(BuoyHelpers._buoys).toEqual(expectedBuoys);
      });
    });
  });
});

describe('subscribeToBuoys', () => {
  beforeEach(() => {
    const test_param_1 = {
      name: 'jest_buoy_0',
      lat: 0,
      lon: 0,
    };
    const test_param_2 = {
      name: 'jest_buoy_1',
      lat: 42,
      lon: -42,
    };
    const test_param_3 = {
      name: 'jest_buoy_2',
      lat : 30,
      lon : -30,
    };
    const test_param_4 = {
      name: 'jest_buoy_3',
      lat: -10,
      lon: 100,
    };

    BuoyHelpers.addBuoy(test_param_1, () => {
      BuoyHelpers.addBuoy(test_param_2, () => {
        BuoyHelpers.addBuoy(test_param_3, () => {
          BuoyHelpers.addBuoy(test_param_4, () => 0);
        });
      });
    });
  });

  test('should add a new entry for new subscriptions', () => {
    const params = {
      south: 29,
      west: -43,
      north: 43,
      east: -29,
    };
    const expectedClients = {
      client_0: {
        buoys: {
          jest_buoy_2: 'jest_buoy_2',
          jest_buoy_1: 'jest_buoy_1',
        },
        bounds: {
          south: 29,
          west: -43,
          north: 43,
          east: -29,
        },
      },
    };

    BuoyHelpers.subscribeToBuoys(params, () => {
      expect(BuoyHelpers._clients).toEqual(expectedClients);
    }, 'client_0');
  });

  test('should add the subscriptions to any appropriate buoys', () => {
    const params = {
      south: 29,
      west: -43,
      north: 43,
      east: -29,
    };
    const expectedBuoys = {
      jest_buoy_0: {
        lat: 0,
        lon: 0,
        height: null,
        period: null,
        clients: {},
      },
      jest_buoy_1: {
        lat: 42,
        lon: -42,
        height: null,
        period: null,
        clients: { client_0: 'client_0' },
      },
      jest_buoy_2: {
        lat: 30,
        lon: -30,
        height: null,
        period: null,
        clients: { client_0: 'client_0' },
      },
      jest_buoy_3: {
        lat: -10,
        lon: 100,
        height: null,
        period: null,
        clients: {},
      },
    };

    BuoyHelpers.subscribeToBuoys(params, () => {
      expect(BuoyHelpers._buoys).toEqual(expectedBuoys);
    }, 'client_0');
  });

  test('should overwrite old subscriptions', () => {
    const params_1 = {
      south: -11,
      west: -43,
      north: 43,
      east: 101,
    };
    const params_2 = {
      south: 29,
      west: -43,
      north: 43,
      east: -29,
    };
    const expectedBuoys = {
      jest_buoy_0: {
        lat: 0,
        lon: 0,
        height: null,
        period: null,
        clients: {},
      },
      jest_buoy_1: {
        lat: 42,
        lon: -42,
        height: null,
        period: null,
        clients: { client_0: 'client_0' },
      },
      jest_buoy_2: {
        lat: 30,
        lon: -30,
        height: null,
        period: null,
        clients: { client_0: 'client_0' },
      },
      jest_buoy_3: {
        lat: -10,
        lon: 100,
        height: null,
        period: null,
        clients: {},
      },
    };
    const expectedClients = {
      client_0: {
        buoys: {
          jest_buoy_2: 'jest_buoy_2',
          jest_buoy_1: 'jest_buoy_1',
        },
        bounds: {
          south: 29,
          west: -43,
          north: 43,
          east: -29,
        },
      },
    };

    BuoyHelpers.subscribeToBuoys(params_1, () => {
      BuoyHelpers.subscribeToBuoys(params_2, () => {
        expect(BuoyHelpers._clients).toEqual(expectedClients);
        expect(BuoyHelpers._buoys).toEqual(expectedBuoys);
      }, 'client_0');
    }, 'client_0');
  });
});
