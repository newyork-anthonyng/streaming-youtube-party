const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);

const io = require('socket.io')(http);

const applesauce = {
  videoId: undefined,
  setVideo: function(data) {
    this.videoId = data.videoId;
  }
}

io.on('connection', (socket) => {
  socket.emit('VIDEO:INIT', {
    videoId: applesauce.videoId
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('VIDEO:SET', (data) => {
    io.emit('VIDEO:SET', data);

    applesauce.setVideo(data);
    console.log(applesauce.videoId);
  });

  socket.on('VIDEO:PLAY', (data) => {
    io.emit('VIDEO:PLAY', data);
  });

  socket.on('VIDEO:PAUSE', (data) => {
    io.emit('VIDEO:PAUSE', data);
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
