console.log('app.js loaded!');

const socket = io();

const $input = document.querySelector('.js-input');
const $submit = document.querySelector('.js-button');
const $msgContainer = document.querySelector('.js-msg');

$submit.addEventListener('click', function() {
  const text = $input.value;

  socket.emit('TEST_CHANNEL', {
    id: Date.now(),
    text: text
  });
});

socket.on('TEST_CHANNEL_2', (data) => {
  const $newMsg = document.createElement('div');
  $newMsg.innerHTML = JSON.stringify(data, null, 2);

  $msgContainer.appendChild($newMsg);
});
