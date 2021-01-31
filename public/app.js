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

socket.on('VIDEO:PLAY', (data) => {
  player.playVideo();
  isPlaying = true;
  $play.innerText = 'Pause';
});

socket.on('VIDEO:PAUSE', (data) => {
  player.pauseVideo();
  isPlaying = false;
  $play.innerText = 'Play';
});

socket.on('VIDEO:INIT', (data) => {
  if (data.videoId) {
    init(data);
  }
});
