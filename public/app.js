function loadYoutubeApi() {
  const tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

loadYoutubeApi();

let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    // videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
    },
    playerVars: {
      mute: 1
    }
  });
}

const queue = [];
window.init = (data) => {
  queue.push({ type: 'VIDEO:INIT', data });
};

function onPlayerReady(event) {
  while (queue.length > 0) {
    const action = queue.shift(queue);
    __init(action.data);
  }

  window.init = (data) => {
    __init(data);
  };
}

function __init(data) {
  player.cueVideoById(data.videoId, data.currentTime);

  if (data.status === 'playing') {
    playVideo();
  }
}

const socket = io();

const $input = document.querySelector('.js-input');
const $submit = document.querySelector('.js-button');
const $play = document.querySelector('.js-play-button');
const $scrubber = document.querySelector('.js-scrubber');
const $scrubberInfo = document.querySelector('.js-scrubber-time');

$submit.addEventListener('click', function() {
  const url = $input.value;
  const videoId = getVideoIdFromUrl(url);

  socket.emit('VIDEO:SET', {
    videoId
  });
});

$scrubber.addEventListener('change', function(e) {
  socket.emit('VIDEO:SCRUB', {
    currentTime: parseInt($scrubber.value, 10),
    totalDuration: parseInt($scrubber.max, 10) // TODO: don't need to send this everytime
  });
});

let isScrubbing = false;
$scrubber.addEventListener('mousedown', function() {
  isScrubbing = true;
});

$scrubber.addEventListener('mouseup', function() {
  isScrubbing = false;
});

function getVideoIdFromUrl(url) {
  const queryString = url.split('?')[1];
  const searchParams = new URLSearchParams(queryString);

  const VERSION_FIELD = 'v';
  return searchParams.get(VERSION_FIELD);
}

socket.on('VIDEO:SET', (data) => {
  player.cueVideoById(data.videoId);
});

let isPlaying = false;
$play.addEventListener('click', function() {
  if (isPlaying) {
    socket.emit('VIDEO:PAUSE', { currentTime: player.getCurrentTime() });
  } else {
    socket.emit('VIDEO:PLAY',  { currentTime: player.getCurrentTime() });
  }
});

let scrubberTimer;
function formatTime(duration)
{
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    let ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
}

socket.on('VIDEO:PLAY', (data) => {
  playVideo();
});

function playVideo() {
  player.playVideo();
  isPlaying = true;
  $play.innerText = 'Pause';

  scrubberTimer = setInterval(() => {
    const currentTime = player.getCurrentTime();
    const totalDuration = player.getDuration();

    if (!isScrubbing) {
      $scrubber.value =  currentTime;
      $scrubber.max = totalDuration; // TODO: do this once in INIT
    }
  }, 1000);
}

socket.on('VIDEO:PAUSE', (data) => {
  player.pauseVideo();
  isPlaying = false;
  $play.innerText = 'Play';

  clearInterval(scrubberTimer);
});

socket.on('VIDEO:INIT', (data) => {
  if (data.videoId) {
    init(data);
  }
});

socket.on('VIDEO:SCRUB', (data) => {
  player.seekTo(data.currentTime);
  player.pauseVideo();
  isPlaying = false;
  $play.innerText = 'Play';

  clearInterval(scrubberTimer);
});
