const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);

const io = require('socket.io')(http);

const applesauce = {
  videoId: undefined,
  totalDuration: 0,
  currentTime: 0,
  setVideo: function(data) {
    this.videoId = data.videoId;
  },
  scrubVideo: function(data) {
    this.currentTime = data.currentTime;
    this.totalDuration = data.totalDuration;
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
    applesauce.setVideo(data);

    io.emit('VIDEO:SET', data);
  });

  socket.on('VIDEO:PLAY', (data) => {
    io.emit('VIDEO:PLAY', data);
  });

  socket.on('VIDEO:PAUSE', (data) => {
    io.emit('VIDEO:PAUSE', data);
  });

  socket.on('VIDEO:SCRUB', (data) => {
    applesauce.scrubVideo(data);

    io.emit('VIDEO:SCRUB', data);
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
