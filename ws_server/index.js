const WebSocket = require('ws');
const BuoyHelpers = require('./buoy_helpers.js');

const server = new WebSocket.Server({
  port: process.env.WS_PORT || 8080,
});
const clients = {};

server.on('connection', (ws) => {
  clients[ws] = null;
  ws.on('message', (data) => {
    const request = JSON.parse(data);
    if (clients[ws] === null) {
      clients[ws] = request.clientId;
    }
    if(BuoyHelpers[request.method]) {
      BuoyHelpers[request.method](request.params, (res) => {
        if (res) {
          if (res.error) {
            ws.send(res.error);
          } else {
            ws.send(`{"jsonrpc":"2.0","result":"ok","id":"${request.id}"}`);
          }
          for (let i = 0; i < res.notifications.length; i += 1) {
            for (let j = 0; j < res.notifications[i].clients.length; j += 1) {
              res.notifications[i].clients[j].send(res.notifications[i].body);
            }
          }
        } else {
          ws.send(`{"jsonrpc":"2.0","result":"ok","id":"${request.id}"}`);
        }
      }, request.clientId, ws);
    }});
  ws.on('close', () => {
    if (typeof clients[ws] !== 'undefined' && clients[ws] !== null) {
      BuoyHelpers.terminateClient(clients[ws]);
    }
    delete clients[ws];
  });
});
