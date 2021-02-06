const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);

const io = require('socket.io')(http);

const status = {
  PAUSED: 'paused',
  PLAYING: 'playing'
};

const applesauce = {
  videoId: undefined,
  totalDuration: 0,
  currentTime: 0,
  intervalId: null,

  status: status.PAUSED,

  setVideo: function(data) {
    this.videoId = data.videoId;
    this.status = status.PAUSED;
  },

  scrubVideo: function(data) {
    this.currentTime = parseInt(data.currentTime, 10);
    this.totalDuration = parseInt(data.totalDuration, 10);
    this.status = status.PAUSED;

    clearInterval(this.intervalId);
  },

  playVideo: function(data) {
    this.status = status.PLAYING;
    this.currentTime = parseInt(data.currentTime, 10);

    this.intervalId = setInterval(() => {
      this.currentTime = this.currentTime + 1;

      console.log(this.getInitData());
    }, 1000);
  },

  pauseVideo: function(data) {
    this.status = status.PAUSED;
    this.currentTime = parseInt(data.currentTime, 10);

    clearInterval(this.intervalId);
  },

  getInitData: function() {
    return {
      videoId: this.videoId,
      status: this.status,
      currentTime: this.currentTime
    };
  }
}

io.on('connection', (socket) => {
  socket.emit('VIDEO:INIT', applesauce.getInitData());

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('VIDEO:SET', (data) => {
    applesauce.setVideo(data);

    io.emit('VIDEO:SET', data);
  });

  socket.on('VIDEO:PLAY', (data) => {
    applesauce.playVideo(data);

    io.emit('VIDEO:PLAY', data);
  });

  socket.on('VIDEO:PAUSE', (data) => {
    applesauce.pauseVideo(data);

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
