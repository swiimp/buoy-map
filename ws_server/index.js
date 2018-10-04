const WebSocket = require('ws');
const BuoyHelpers = require('./buoy_helpers.js');

const server = new WebSocket.Server({
  port: 8080,
});

server.on('connection', (ws) => {
  ws.on('message', (data) => {
    const request = JSON.parse(data);
    BuoyHelpers[request.method](request.params);
  });
});
