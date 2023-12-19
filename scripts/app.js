const albumJar = document.getElementById('jar');
const trackTemplate = document.querySelector('#track-template').content;

function createTrack(trackData, albumJar) {
  const trackElement = trackTemplate.querySelector('.dialog__list-item').cloneNode(true);
  
  const playBtn = trackElement.querySelector('.track-play');

  trackElement.querySelector('.track__executor').textContent = trackData.executor;
  trackElement.querySelector('.track__name').textContent = trackData.name;

  playBtn.addEventListener('click', () => play(playBtn, albumJar))

  return trackElement;
}

function play(playBtn, albumJar) {

  if(albumJar.querySelector('.track-active') && playBtn.classList.contains('track-active')) {
      playBtn.classList.remove('track-active');
      playBtn.innerHTML = `<svg class="play-svg" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>`;
  }
  else if(albumJar.querySelector('.track-active')){
    albumJar.querySelector('.track-active').innerHTML = `<svg class="play-svg" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>`;
    albumJar.querySelector('.track-active').classList.remove('track-active');

    playBtn.classList.add('track-active');
    playBtn.innerHTML = `<svg class="play-svg" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>`;
  }
  else {
    playBtn.classList.add('track-active');
    playBtn.innerHTML = `<svg class="play-svg" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>`;
  }

  return playBtn;
}

initialTracks.forEach(function(trackData){
  const track = createTrack(trackData, albumJar);
  albumJar.append(track);
});
