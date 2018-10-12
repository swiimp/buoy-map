class BuoyHelpers {
  constructor() {
    this._buoys = {};
    this._clients = {};
    this._latIndex = [];
    this._lonIndex = [];
    this._paramTypes = {
      addBuoy: {
        name: 'string',
        lat: 'number',
        lon: 'number',
      },
      updateBuoyData: {
        name: 'string',
        height: 'number',
        period: 'number',
      },
      subscribeToBuoys: {
        south: 'number',
        west: 'number',
        north: 'number',
        east: 'number',
      }
    }
  }

  addBuoy(params, cb) {
    const payload = {
      error: null,
      notifications: [],
    };

    if (!this._validateParams('addBuoy', params)) {
      payload.error = {
        code: -32602,
        message: 'Invalid params',
      };
    } else if (this._buoys[params.name] === undefined) {
      this._buoys[params.name] = {
        lat: params.lat,
        lon: params.lon,
        height: null,
        period: null,
        clients: {},
      };
      this._latIndex.splice(this._findIndex(params.lat, 'lat'), 0, {
        name: params.name,
        lat: params.lat,
        lon: params.lon,
      });
      this._lonIndex.splice(this._findIndex(params.lon, 'lon'), 0, {
        name: params.name,
        lat: params.lat,
        lon: params.lon,
      });
      payload.notifications.push({
        body: this._generateNotification(params.name),
        clients: [],
      });
      for (let client in this._clients) {
        if (params.lat > this._clients[client].bounds.south &&
          params.lat < this._clients[client].bounds.north &&
          params.lon > this._clients[client].bounds.west &&
          params.lon < this._clients[client].bounds.east) {
            this._buoys[params.name].clients[client] = client;
            this._clients[client].buoys[params.name] = params.name;
            payload.notifications[0].clients.push(this._clients[client].ws);
        }
      }
    }
    cb(payload);
  }

  updateBuoyData(params, cb) {
    const payload = {
      error: null,
      notifications: [],
    };

    if (!this._validateParams('updateBuoyData', params)) {
      payload.error = {
        code: -32602,
        message: 'Invalid params',
      };
    } else if (this._buoys[params.name] &&
              (this._buoys[params.name].height !== params.height ||
                this._buoys[params.name].period !== params.period)) {
      this._buoys[params.name].height = params.height;
      this._buoys[params.name].period = params.period;
      payload.notifications.push({
        body: this._generateNotification(params.name),
        clients: [],
      });
      for (let client in this._buoys[params.name].clients) {
        console.log('Update queued for', client);
        payload.notifications[0].clients.push(this._clients[client].ws);
      }
    }

    cb(payload);
  }

  subscribeToBuoys(params, cb, client, ws) {
    const results = {};
    const payload = {
      error: null,
      notifications: [],
    };
    const isWithinBounds = (buoy) => buoy.lat > params.south && buoy.lat < params.north &&
                                      buoy.lon > params.west && buoy.lon < params.east;

    if (!this._validateParams('subscribeToBuoys', params)) {
      payload.error = {
        code: -32602,
        message: 'Invalid params',
      };
    } else {
      if (this._latIndex.length > 0) {
        if (this._clients[client]) {
          for (let buoy in this._clients[client].buoys) {
            if (isWithinBounds(this._buoys[buoy])) {
              results[buoy] = buoy;
            } else {
              delete this._buoys[buoy].clients[client];
            }
          }
        }
        let iLat = this._findIndex(params.south, 'lat');
        let iLon = this._findIndex(params.west, 'lon');
        while (iLat < this._latIndex.length && iLon < this._lonIndex.length &&
          this._latIndex[iLat].lat < params.north && this._lonIndex[iLon].lon < params.east) {
          if (results[this._latIndex[iLat].name] === undefined && isWithinBounds(this._latIndex[iLat])) {
            results[this._latIndex[iLat].name] = this._latIndex[iLat].name;
            this._buoys[this._latIndex[iLat].name].clients[client] = client;
            payload.notifications.push({
              body: this._generateNotification(this._latIndex[iLat].name),
              clients: [ws],
            });
          }
          if (results[this._lonIndex[iLon].name] === undefined && isWithinBounds(this._lonIndex[iLon])) {
            results[this._lonIndex[iLon].name] = this._lonIndex[iLon].name;
            this._buoys[this._lonIndex[iLon].name].clients[client] = client;
            payload.notifications.push({
              body: this._generateNotification(this._lonIndex[iLon].name),
              clients: [ws],
            });
          }
          iLat += 1;
          iLon += 1;
        }
      }

      this._clients[client] = {
        buoys: results,
        bounds: params,
        ws: ws,
      };
    }

    cb(payload);
  }

  terminateClient(client) {
    if (this._clients[client]) {
      for (let buoy in this._clients[client].buoys) {
        delete this._buoys[buoy].clients[client];
      }
      delete this._clients[client];
    }
  }

  _findIndex(target, metric) {
    const index = metric === 'lat' ? this._latIndex : this._lonIndex;

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
  }

  _generateNotification(buoy) {
    const notification = {
      jsonrpc: '2.0',
      method: 'buoyNotification',
      params: {
        name: buoy,
        lat: this._buoys[buoy].lat,
        lon: this._buoys[buoy].lon,
        height: this._buoys[buoy].height,
        period: this._buoys[buoy].period,
      },
    };

    return JSON.stringify(notification);
  }

  _validateParams(method, params) {
    for (let param in this._paramTypes[method]) {
      if (typeof params[param] !== this._paramTypes[method][param]) {
        return false;
      }
    }
    return true;
  }
}

module.exports = BuoyHelpers;
