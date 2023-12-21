const albumJar = document.getElementById('jar');
const trackTemplate = document.querySelector('#track-template').content;

const menuPlace = document.querySelector('.music');
const playIcon = `<svg class="play-svg" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>`;
const pauseIcon = `<svg class="play-svg" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m7 5v14m10-14v14" stroke="#fff" stroke-linecap="round" stroke-width="2"/></svg>`;

const menuShuffle = document.querySelector('#menu-shuffle');
const menuBack = document.querySelector('#menu-back');
const menuNext = document.querySelector('#menu-next');
const menuPlay = document.querySelector('#menu-play');
const menuRepeat = document.querySelector('#menu-repeat');

function createTrack(trackData, albumJar) {
  const trackElement = trackTemplate.querySelector('.dialog__list-item').cloneNode(true);
  
  const playBtn = trackElement.querySelector('.track-play');

  trackElement.querySelector('.track__name').textContent = trackData.name;
  trackElement.querySelector('.track__executor').textContent = trackData.executor;

  playBtn.addEventListener('click', () => play(playBtn, albumJar, trackData))

  return trackElement;
}

function play(playBtn, albumJar, trackData) {
  if(albumJar.querySelector('.track-active') && playBtn.classList.contains('track-active')) {
    playBtn.classList.remove('track-active');
    playBtn.innerHTML = playIcon;

    menuPlay.innerHTML = `<svg class="play-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>`;
  }
  else if(albumJar.querySelector('.track-active')){
    albumJar.querySelector('.track-active').innerHTML = playIcon;
    albumJar.querySelector('.track-active').classList.remove('track-active');

    playBtn.classList.add('track-active');
    playBtn.innerHTML = pauseIcon;
  }
  else {
    playBtn.classList.add('track-active');
    playBtn.innerHTML = pauseIcon;

    menuPlay.innerHTML = pauseIcon;
  }

  const trackNow = new Audio(`./tracks/${trackData.url}`);

  trackNow.addEventListener('loadeddata', () => {
    const minutes = Math.floor(trackNow.duration / 60);
    const seconds = Math.floor(trackNow.duration - minutes * 60);

    timeTrack = `${minutes}:${seconds}`;
    playNow(trackData, timeTrack);
  });

  return playBtn;
}

function playNow(trackData, timeTrack) {
  menuPlace.querySelector('.time-all').textContent = timeTrack;
  menuPlace.querySelector('.music__menu__info-logo').src = trackData.link;
  menuPlace.querySelector('.music__menu__info-name').textContent = trackData.name;
  menuPlace.querySelector('.music__menu__info-executor').textContent = trackData.executor;
};

initialTracks.forEach(function(trackData) {
  const track = createTrack(trackData, albumJar);
  albumJar.append(track);
});
