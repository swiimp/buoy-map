const _buoys = {};
const _clients = {};
const _latIndex = [];
const _lonIndex = [];

const addBuoy = (params, cb) => {
  const payload = {
    error: null,
    notifications: [],
  };

  if (_buoys[params.name] === undefined) {
    _buoys[params.name] = {
      lat: params.lat,
      lon: params.lon,
      height: null,
      period: null,
      clients: {},
    };
    _latIndex.splice(_findIndex(params.lat, 'lat'), 0, {
      name: params.name,
      lat: params.lat,
      lon: params.lon,
    });
    _lonIndex.splice(_findIndex(params.lon, 'lon'), 0, {
      name: params.name,
      lat: params.lat,
      lon: params.lon,
    });
    payload.notifications.push({
      body: _generateNotification(params.name),
      clients: [],
    });
    for (let client in _clients) {
      if (params.lat > _clients[client].bounds.south &&
        params.lat < _clients[client].bounds.north &&
        params.lon > _clients[client].bounds.west &&
        params.lon < _clients[client].bounds.east) {
          _buoys[params.name].clients[client] = client;
          _clients[client].buoys[params.name] = params.name;
          payload.notifications[0].clients.push(_clients[client].ws);
      }
    }
  }
  cb();
};

const updateBuoyData = (params, cb) => {
  const payload = {
    error: null,
    notifications: [],
  };

  if (_buoys[params.name] &&
      (_buoys[params.name].height !== params.height ||
       _buoys[params.name].period !== params.period)) {
    _buoys[params.name].height = params.height;
    _buoys[params.name].period = params.period;
    payload.notifications.push({
      body: _generateNotification(params.name),
      clients: [],
    });
    for (let client in _buoys[params.name].clients) {
      console.log('Update queued for', client);
      payload.notifications[0].clients.push(_clients[client].ws);
    }
  }

  cb(payload);
};

const subscribeToBuoys = (params, cb, client, ws) => {
  const results = {};
  const payload = {
    error: null,
    notifications: [],
  };
  const isWithinBounds = (buoy) => buoy.lat > params.south && buoy.lat < params.north &&
                                    buoy.lon > params.west && buoy.lon < params.east;
  if (_latIndex.length > 0) {
    if (_clients[client]) {
      for (let buoy in _clients[client].buoys) {
        if (isWithinBounds(_buoys[buoy])) {
          results[buoy] = buoy;
        } else {
          delete _buoys[buoy].clients[client];
        }
      }
    }
    let iLat = _findIndex(params.south, 'lat');
    let iLon = _findIndex(params.west, 'lon');
    while (iLat < _latIndex.length && iLon < _lonIndex.length &&
            _latIndex[iLat].lat < params.north && _lonIndex[iLon].lon < params.east) {
      if (results[_latIndex[iLat].name] === undefined && isWithinBounds(_latIndex[iLat])) {
        results[_latIndex[iLat].name] = _latIndex[iLat].name;
        _buoys[_latIndex[iLat].name].clients[client] = client;
        payload.notifications.push({
          body: _generateNotification(_latIndex[iLat].name),
          clients: [ws],
        });
      }
      if (results[_lonIndex[iLon].name] === undefined && isWithinBounds(_lonIndex[iLon])) {
        results[_lonIndex[iLon].name] = _lonIndex[iLon].name;
        _buoys[_lonIndex[iLon].name].clients[client] = client;
        payload.notifications.push({
          body: _generateNotification(_lonIndex[iLon].name),
          clients: [ws],
        });
      }
      iLat += 1;
      iLon += 1;
    }
  }

  _clients[client] = {
    buoys: results,
    bounds: params,
    ws: ws,
  };

  cb(payload);
};

const terminateClient = (client) => {
  if (_clients[client]) {
    for (let buoy in _clients[client].buoys) {
      delete _buoys[buoy].clients[client];
    }
    delete _clients[client];
  }
};

const _findIndex = (target, metric) => {
  const index = metric === 'lat' ? _latIndex : _lonIndex;

  if (index.length === 0 || index[0][metric] > target) {
    return 0;
  } else if (index[index.length - 1][metric] < target) {
    return index.length;
  }

  let first = 0;
  let last = index.length - 1;
  let mid = Math.floor((first + last) / 2);
  while (first < last) {
    if (index[mid][metric] === target) {
      return mid;
    } else if (index[mid][metric] > target) {
      if (index[mid - 1][metric] < target) {
        return mid;
      } else {
        last = mid;
        mid = Math.floor((first + last) / 2);
      }
    } else if (mid < index.length - 1 && index[mid + 1][metric] > target) {
      return mid + 1;
    } else {
      first = mid;
      mid = Math.floor((first + last) / 2);
    }
  }
};

const _generateNotification = (buoy) => {
  const notification = {
    jsonrpc: '2.0',
    method: 'buoyNotification',
    params: {
      name: buoy,
      lat: _buoys[buoy].lat,
      lon: _buoys[buoy].lon,
      height: _buoys[buoy].height,
      period: _buoys[buoy].period,
    },
  };

  return JSON.stringify(notification);
}

const _DEV_createDump = (params, cb) => {
  console.log(_buoys);
  console.log(_clients);
  console.log(_latIndex);
  console.log(_lonIndex);
  cb();
}

module.exports = {
  _buoys: _buoys,
  _clients: _clients,
  _latIndex: _latIndex,
  _lonIndex: _lonIndex,
  addBuoy: addBuoy,
  updateBuoyData: updateBuoyData,
  subscribeToBuoys: subscribeToBuoys,
  terminateClient: terminateClient,
  createDump: _DEV_createDump,
};
