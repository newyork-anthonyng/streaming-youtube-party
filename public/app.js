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

function onPlayerReady(event) {
  // event.target.playVideo();
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
