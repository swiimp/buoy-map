require('dotenv').config();
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.APP_PORT || 3000;
const wsHost = process.env.WS_HOST || `ws://localhost:8080`;
const wsocks = {};

app.use(express.static(path.join(__dirname, './public')));

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  wsocks[socket.id] = new WebSocket(wsHost);
  wsocks[socket.id].on('error', (data) => {
    console.log(data);
  });
  wsocks[socket.id].on('message', (data) => {
    const response = JSON.parse(data);
    if (response.id && response.error) {
      console.log(data);
    } else if (response.method === 'buoyNotification') {
      socket.emit('notification', data);
    }
  });
  socket.on('message', (data) => {
    const request = JSON.parse(data);
    request.clientId = socket.id;
    request.id = uuidv1();
    wsocks[socket.id].send(JSON.stringify(request));
    if (request.method === 'createDump') {
      console.log(wsocks);
    }
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    wsocks[socket.id].close(1000);
    delete wsocks[socket.id];
  });
});

http.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});
