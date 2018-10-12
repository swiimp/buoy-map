class BuoyHelpers {
  constructor() {
    // table containing buoys with buoy names as keys
    // buoy: {
    //   lon: float, (longitude, range: -180.0 to 180.0)
    //   lat: float, (latitude, range: -90.0 to 90.0)
    //   height: float, (wave height in feet, default: null)
    //   period: integer, (wave period in seconds, default: null)
    //   clients: object (table of subscribed client ids)
    // }
    this._buoys = {};

    // table containing clients with client ids as keys
    // client: {
    //   buoys: object (table of buoy names to which the client is subscribed)
    //   bounds: object (table of bounding lon and lat floats, keys: west, south, east, north)
    //   ws: reference var (reference to the client's websocket object)
    // }
    this._clients = {};

    // indices for searching for buoys within bounds
    this._latIndex = [];
    this._lonIndex = [];

    // used for verifying parameters in json-rpc 2.0 functions
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

  // me: addBuoy
  // description: Adds the given buoy to _buoys and any applicable clients, indexes them, then
  //              updates the payload to queue up any applicable notifications.
  //
  // parameters:
  //   'params' -- Object; contains parameters used for the function call
  //      \__ 'name' -- String; name of the new buoy
  //      |__ 'lat' -- Float; latitude of the new buoy
  //      |__ 'lon' -- Float; longitude of the new buoy
  //   'cb' -- Function; callback function that is passed a payload object containing: 'error', a
  //           json-rpc 2.0 error object (default: null), and 'notifications', an array of objects
  //           with two properties, 'body' and 'clients', which are a stringified json-rcp 2.0
  //           notification and an array of references to websocket recipients, respectively
  //
  // returns: nothing
  addBuoy(params, cb) {
    const payload = {
      error: null,
      notifications: [],
    };

    // send error if params are invalid
    if (!this._validateParams('addBuoy', params)) {
      payload.error = {
        code: -32602,
        message: 'Invalid params',
      };
    } else if (this._buoys[params.name] === undefined) { // only registers new buoys
      this._buoys[params.name] = {
        lat: params.lat,
        lon: params.lon,
        height: null,
        period: null,
        clients: {},
      };
      // add new buoy to lat/lon indices
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
      // checks if new buoy belongs in any subscriptions
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

  // me: updateBuoyData
  // description: Updates height and period data for the given buoy, then updates the payload to
  //              queue up any applicable notifications.
  //
  // parameters:
  //   'params' -- Object; contains parameters used for the function call
  //      \__ 'name' -- String; name of the target buoy
  //      |__ 'height' -- Float; height of the wave in feet
  //      |__ 'period' -- Integer; period of the wave in seconds
  //   'cb' -- Function; callback function that is passed a payload object containing: 'error', a
  //           json-rpc 2.0 error object (default: null), and 'notifications', an array of objects
  //           with two properties, 'body' and 'clients', which are a stringified json-rcp 2.0
  //           notification and an array of references to websocket recipients, respectively
  //
  // returns: nothing
  updateBuoyData(params, cb) {
    const payload = {
      error: null,
      notifications: [],
    };

    // send error if params are invalid
    if (!this._validateParams('updateBuoyData', params)) {
      payload.error = {
        code: -32602,
        message: 'Invalid params',
      };
    // checks if the buoy exists and if the update will change anything
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

  // me: subscribeToBuoys
  // description: Subscribes a client to buoy notifications for buoys within the bounds box and
  //              updates the payload to queue up any applicable notifications.
  //
  // parameters:
  //   'params' -- Object; contains parameters used for the function call
  //      \__ 'west', 'south', 'east', 'north' -- Float; lat-lon coordinates representing the
  //                                             southwest and northeast corners of the bounding box
  //   'cb' -- Function; callback function that is passed a payload object containing: 'error', a
  //           json-rpc 2.0 error object (default: null), and 'notifications', an array of objects
  //           with two properties, 'body' and 'clients', which are a stringified json-rcp 2.0
  //           notification and an array of references to websocket recipients, respectively
  //  'client' -- String|Number; id of the subscribing client
  //  'ws' -- Reference Var; reference to the subscribing websocket client
  //
  // returns: nothing
  subscribeToBuoys(params, cb, client, ws) {
    // accumulator for valid buoys
    const results = {};
    const payload = {
      error: null,
      notifications: [],
    };
    const isWithinBounds = (buoy) => buoy.lat > params.south && buoy.lat < params.north &&
                                      buoy.lon > params.west && buoy.lon < params.east;

    // send error if params are invalid
    if (!this._validateParams('subscribeToBuoys', params)) {
      payload.error = {
        code: -32602,
        message: 'Invalid params',
      };
    } else {
      // checks if there are any buoys
      if (this._latIndex.length > 0) {
        // if client is updating existing subscription, remove it from unsubscribed buoys
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
        // search indices until at least one reaches an upper bound or the end of the index
        while (iLat < this._latIndex.length && iLon < this._lonIndex.length &&
          this._latIndex[iLat].lat < params.north && this._lonIndex[iLon].lon < params.east) {
          // if buoy is within bounds and hasn't been added, make an entry and queue a notification
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

      // create client entry
      this._clients[client] = {
        buoys: results,
        bounds: params,
        ws: ws,
      };
    }

    cb(payload);
  }

  // name: terminateClient
  // description: Removes all entries for the given client from _clients and _buoys.
  //
  // parameters:
  //  'client' -- String|Number; id of the target client
  //
  // returns: nothing
  terminateClient(client) {
    // if client exists, for each of its buoys, remove its entry, finally remove client
    if (this._clients[client]) {
      for (let buoy in this._clients[client].buoys) {
        delete this._buoys[buoy].clients[client];
      }
      delete this._clients[client];
    }
  }

  // name: _findIndex
  // description: Finds the index for the given target where arr[index - 1] < target <= arr[index]
  //              within the specified array.
  //
  // parameters:
  //   'target' -- Float; the target lon or lat value
  //   'metric' -- String; a string representing which array to search, expects 'lat' or 'lon'
  //
  // returns: Integer; the index of the specified array where arr[index - 1] < target <= arr[index]
  _findIndex(target, metric) {
    const index = metric === 'lat' ? this._latIndex : this._lonIndex;

    // check edge cases
    if (index.length === 0 || index[0][metric] > target) {
      return 0;
    } else if (index[index.length - 1][metric] < target) {
      return index.length;
    }

    // modified binary search with the base case being arr[index - 1] < target <= arr[index]
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

  // name: _generateNotification
  // description: Generates a stringified json-rcp 2.0 notification from the given buoy.
  //
  // params:
  //   'buoy': String; the name of the target buoy
  //
  // returns: String; a json-rcp 2.0 notification for the given buoy
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

  // name: _validateParams
  // description: Validates the 'params' argument for the specified json-rcp 2.0 function.
  //
  // params:
  //   'method' -- String; name of the function called with 'params'
  //   'params' -- Object; parameter object from the json-rcp 2.0 function call
  //
  // returns: Bool; true if 'params' contains all properties of the correct type for the specified
  //          function as they are defined in _paramTypes, otherwise returns false
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
