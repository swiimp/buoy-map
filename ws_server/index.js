const WebSocket = require('ws');
const BuoyHelpers = require('./buoy_helpers.js');

const server = new WebSocket.Server({
  port: 8080,
});

server.on('connection', (ws) => {
  ws.on('message', (data) => {
    const request = JSON.parse(data);
    if(BuoyHelpers[request.method]) {
      BuoyHelpers[request.method](request.params, (res) => {
        // Check for error response
          // Handle error
        // Check for notifications
          // Send all notifications
        ws.send(`{"jsonrpc":"2.0","result":"ok","id":"${request.id}"}`);
      }, request.clientId);
    }});
});
