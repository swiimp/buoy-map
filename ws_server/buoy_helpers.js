const _buoys = {};
const _clients = {};
const _latIndex = [];
const _lonIndex = [];

const addBuoy = (params, cb) => {
  _buoys[params.name] = {
    lat: params.lat,
    lon: params.lon,
    height: null,
    period: null,
    clients: [],
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
  for (let client in _clients) {
    if (params.lat > _clients[client].bounds.south &&
        params.lat < _clients[client].bounds.north &&
        params.lon > _clients[client].bounds.west &&
        params.lon < _clients[client].bounds.east) {
      _buoys[params.name].clients.push(client);
      _clients[client].buoys.push(params.name);
      // Add client to cb payload
    }
  }
  cb();
};

const updateBuoyData = (params, cb) => {
  if (_buoys[params.name]) {
    _buoys[params.name].height = params.height;
    _buoys[params.name].period = params.period;
    // Add clients to cb payload
  }
  console.log(params.name, JSON.stringify(_buoys[params.name]));
  cb();
};

const subscribeToBuoys = (params, cb, clientId) => {
  if (_clients[clientId] === undefined ||
      _clients[clientId].bounds.west !== params.west ||
      _clients[clientId].bounds.east !== params.east ||
      _clients[clientId].bounds.south !== params.south ||
      _clients[clientId].bounds.north !== params.north) {
    const results = [];
    const isWithinBounds = (buoy) => buoy.lat > params.west && buoy.lat < params.east &&
                                      buoy.lon > params.south && buoy.lon < params.north;

    const addedBuoys = {};
    let iLat = _findIndex(params.west, 'lat');
    let iLon = _findIndex(params.south, 'lon');
    while (_latIndex[iLat].lat < params.east && _lonIndex[iLon].lon < params.north) {
      if (addedBuoys[_latIndex[iLat].name] !== true && isWithinBounds(_latIndex[iLat])) {
        results.push(_latIndex[iLat].name);
        _buoys[_latIndex[iLat].name].clients.push(clientId);
        // Add buoy to cb payload
        addedBuoys[_latIndex[iLat].name] = true;
      }
      if (addedBuoys[_lonIndex[iLon].name] !== true && isWithinBounds(_lonIndex[iLon])) {
        results.push(_lonIndex[iLon].name);
        _buoys[_lonIndex[iLon].name].clients.push(clientId);
        // Add buoy to cb payload
        addedBuoys[_lonIndex[iLon].name] = true;
      }
      iLat += 1;
      iLon += 1;
    }

    _clients[clientId] = {
      buoys: results,
      bounds: params,
    };
  }
  cb();
};

const _findIndex = (target, metric) => {
  const index = metric === 'lat' ? _latIndex : _lonIndex;

  if (index.length === 0 || index[0] > target) {
    return 0;
  } else if (index[index.length - 1][metric] < target) {
    return index.length;
  }

  let first = 0;
  let last = index.length - 1;
  let mid = Math.floor((first + last) / 2);
  while (first > last) {
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

module.exports = {
  addBuoy: addBuoy,
  updateBuoyData: updateBuoyData,
  subscribeToBuoys: subscribeToBuoys,
};
