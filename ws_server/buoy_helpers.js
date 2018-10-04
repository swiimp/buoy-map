const _buoys = {};
const _clients = {};
const _latIndex = [];
const _lonIndex = [];

const addBuoy = (params, cb) => {
  buoys[params.name] = {
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
      bouys[params.name].clients.push(client);
      _clients[client].buoys.push(params.name);
      // Send a notification
    }
  }
  cb('');
};

const updateBuoyData = (params, cb) => {

};

const subscribeToBuoys = (params, cb) => {

};

// const sendNotification = (buoy) => {
//
// };

const _findIndex = (target, idx) => {
  const index = idx === 'lat' ? _latIndex : _lonIndex;

  if (index[0] > target) {
    return 0;
  } else if (index[index.length - 1] < target) {
    return index.length;
  }

  let first = 0;
  let last = index.length - 1;
  let mid = Math.floor((first + last) / 2);
  while (first > last) {
    if (index[mid] === target) {
      return mid;
    } else if (index[mid] > target) {
      if (index[mid - 1] < target) {
        return mid;
      } else {
        last = mid;
        mid = Math.floor((first + last) / 2);
      }
    } else if (index[mid + 1] > target) {
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
  // sendNotification: sendNotification,
};
