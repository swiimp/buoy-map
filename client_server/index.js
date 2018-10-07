const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.APP_PORT || 3000;
const wsHost = process.env.WS_HOST || `ws://localhost:8080`;

app.use(express.static(path.join(__dirname, './public')));

io.on('connection', (socket) => {
  console.log(`io: Connection on ${socket.handshake.headers.referer}
                from ${socket.handshake.address}`);
  const ws = new WebSocket(wsHost);
  socket.on('message', (data) => {
    const request = JSON.parse(data);
    request.clientId = socket.id;
    request.id = uuidv1();
    ws.send(JSON.stringify(request));
  });
  ws.on('message', (data) => {
    const response = JSON.parse(data);
    if (response.id /* && there's an error */) {
      console.log(data);
    } else {
      // Handle notification
    }
  });
});


http.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});
