const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);

const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('TEST_CHANNEL', (data) => {

    io.emit('TEST_CHANNEL_2', data);
    console.log('***********');
    console.log(data);
    console.log('***********');
  });
});

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});