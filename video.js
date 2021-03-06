const { status } = require('./constants');

class Video {
  constructor() {
    this.videoId = undefined;
    this.totalDuration = 0;
    this.currentTime = 0;
    this.intervalId = null;

    this.status = status.PAUSED;
  }

  cueNewVideo(data) {
    this.videoId = data.videoId;
    this.status = status.PAUSED;
  }

  scrubVideo(data) {
    this.currentTime = parseInt(data.currentTime, 10);
    this.totalDuration = parseInt(data.totalDuration, 10);
    this.status = status.PAUSED;

    clearInterval(this.intervalId);
  }

  playVideo(data) {
    this.status = status.PLAYING;
    this.currentTime = parseInt(data.currentTime, 10);

    this.intervalId = setInterval(() => {
      this.currentTime = this.currentTime + 1;
      console.log(this.getData());
    }, 1000);
  }

  pauseVideo(data) {
    this.status = status.PAUSED;
    this.currentTime = parseInt(data.currentTime, 10);

    clearInterval(this.intervalId);
  }

  getData() {
    return {
      videoId: this.videoId,
      status: this.status,
      currentTime: this.currentTime
    };
  }
}

module.exports = Video;
