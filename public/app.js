/*
 * 1. when the Youtube player is playing, update the scrubber
 *      player.getCurrentTime() // duration in seconds
 *      player.getDuration() // duration in seconds
 * 2. when user updates the scrubber, we should update the youtube player
 *    player.seekTo
*/
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
      'onStateChange': onPlayerStateChange
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
    player.cueVideoById(action.data.videoId);
  }

  window.init = (data) => {
    player.cueVideoById(data.videoId);
  };
}

function onPlayerStateChange(event) {
  console.log(event);
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
    socket.emit('VIDEO:PAUSE');
  } else {
    socket.emit('VIDEO:PLAY');
  }
});

let scrubberTimer;
function formatTime(duration)
{
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

socket.on('VIDEO:PLAY', (data) => {
  player.playVideo();
  isPlaying = true;
  $play.innerText = 'Pause';

  scrubberTimer = setInterval(() => {
    const currentTime = player.getCurrentTime();
    const totalDuration = player.getDuration();
    $scrubberInfo.innerText = `${formatTime(currentTime)} / ${formatTime(totalDuration)}`;

    const percentage =  currentTime/totalDuration ;
    $scrubber.value =  percentage * 100;
  }, 1000);
});

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
