const path = require('path');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.APP_PORT || 3000;

app.use(express.static(path.join(__dirname, './public')));

io.on('connection', (socket) => {
  console.log(`io: Connection on ${socket.handshake.headers.referer}
                from ${socket.handshake.address}`);
});

http.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});
