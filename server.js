const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const Video = require('./video');
const { status } = require('./constants');

const io = require('socket.io')(http);
const videoInstances = {};

io.on('connection', (socket) => {
  const roomId = socket.handshake.query.roomId;
  const videoInstance = videoInstances[roomId];
  socket.join(roomId);

  socket.emit('VIDEO:INIT', (() => {
    if (videoInstance) {
      return videoInstance.getData()
    }
  })());

  socket.on('VIDEO:SET', (data) => {
    if (videoInstance) {
      videoInstance.cueNewVideo(data);

      io.to(roomId).emit('VIDEO:SET', data);
    }
  });

  socket.on('VIDEO:PLAY', (data) => {
    if (videoInstance) {
      videoInstance.playVideo(data);

      io.to(roomId).emit('VIDEO:PLAY', data);
    }
  });

  socket.on('VIDEO:PAUSE', (data) => {
    if (videoInstance) {
      videoInstance.pauseVideo(data);

      io.to(roomId).emit('VIDEO:PAUSE', data);
    }
  });

  socket.on('VIDEO:SCRUB', (data) => {
    if (videoInstance) {
      videoInstance.scrubVideo(data);

      io.to(roomId).emit('VIDEO:SCRUB', data);
    }
  });
});

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/room/:id', (req, res) => {
  const roomId = req.params.id;
  if (!videoInstances[roomId]) {
    const newVideoInstance = new Video();
    videoInstances[roomId] = newVideoInstance;
  }

  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
