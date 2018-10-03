const WebSocket = require('ws');

const server = new Websocket.Server({
  port: 8080,
});

server.on('connection', (ws) => {
  ws.on('message', (data) => {
    // handle rcp request
  });
});
