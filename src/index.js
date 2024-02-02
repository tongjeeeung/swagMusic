import { timeEr } from './content/slider.js';
import { albums } from './tracks.js';
import { pushLocalStorage, findTracks, pushLikeToLS, pushState, pushListenTimes } from './content/localstorage.js';

const changeThreme = document.querySelector('.menu-logo');

changeThreme.addEventListener('click', evt => {
  document.querySelector('body').classList.toggle('dark_threme');
})

const infoUl = document.querySelector('.infoList');

setInterval(timeEr, 10000);

const albomsList = document.querySelector('.playlist__list');
const albumTemplate = document.querySelector('#album-template').content;
const trackTemplate = document.querySelector('#track-template').content;
const trackFavoritsTemplate = document.querySelector('#favorit__track-template').content;
const popupAlbum = document.querySelector('.popup-playlist');
const popupList = popupAlbum.querySelector('.popup__list');
const popupImg = popupAlbum.querySelector('.popup__img');
const popupTitle = popupAlbum.querySelector('.playlist-title');
const popupAutor = popupAlbum.querySelector('.playlist-autor');
const popupShuffleButton = popupAlbum.querySelector('.popup__shuffle');
const controlerDiv = document.querySelector('.controler');
const controlerImg = controlerDiv.querySelector('.controler-img');
const controlerName = controlerDiv.querySelector('.controler__info-title');
const controlerAutor = controlerDiv.querySelector('.controler__info-autor');
const controlerStartTime = controlerDiv.querySelector('.time-this');
const controlerEndTime = controlerDiv.querySelector('.time-all');
const controlerTimeInput = controlerDiv.querySelector('.time-range-input');

const controlerPlayButton = controlerDiv.querySelector('.controler__play-button');
const controlerNextButton = controlerDiv.querySelector('.controler__next');
const controlerPrevButton = controlerDiv.querySelector('.controler__prev');
const controlerRepeatButton = controlerDiv.querySelector('.controler__repeat');
const controlerVolumeButton = controlerDiv.querySelector('.volume__button');
const controlerShuffleButton = controlerDiv.querySelector('.controler__shuffle');
const controlerLikeButton = controlerDiv.querySelector('.controler__like-button');

const controlerVolumeNewImput = controlerDiv.querySelector('.volume-imput');
const controlerVolumeValue = controlerDiv.querySelector('.volume__track-value');

const favoritsTrackList = document.querySelector('.favorits__track-list');
const favoritsImgBlock = document.querySelector('.favorit__track');

let svgPlay = `<use href="../svg/play.svg#play"></use>`;
let svgPause = `<use href="../svg/pause.svg#pause"></use>`;
let lastTrack = false;
let favoritLastTrack = false;
let lastAlbum = false;
let width = 0;
let trackList = [];
let showWithd = 0;

const state = {
  audios: [],
  current: {},
  repeating: false,
  shuffle: false,
  playing: true,
  volume: 0.2,
  lastVolume: 0,
}

function createAlboms(item) {
  const albumElement = albumTemplate.querySelector('.playlist-item').cloneNode(true);
  const albumImg = albumElement.querySelector('.playlist-img');
  const albumTitle = albumElement.querySelector('.playlist-title');
  const albumAutor = albumElement.querySelector('.playlist-autor');

  albumImg.src = `../images/${item[0].link}`;
  albumTitle.textContent = item[0].albumName;
  albumAutor.textContent = item[0].executor;

  albumImg.addEventListener('click', () => openPopup(item[0].link, item[0].albumName, item[0].executor))

  return (albumElement);
}

albums.forEach(data => {
  let album = createAlboms(data);

  if(localStorage.getItem(data[0].albumName) === null) {
    renderAudios(data);
  }

  let localState = JSON.parse(localStorage.getItem('state'));
  state.repeating = localState[0].repeating;
  state.shuffle = localState[0].shuffle;
  state.volume = localState[0].volume;
  state.lastVolume = localState[0].lastVolume;

  createTracksList(data[0].albumName);
  albomsList.append(album);
});

popupAlbum.addEventListener('click', evt => {
  if(evt.target === popupAlbum) {
    closePopup();
  }
})

function renderAudios(data) {
  data.forEach(item => {
    if(item.url != undefined) {
      const audio = new Audio(`../tracks/${item.url}`);
      
      audio.addEventListener('loadeddata', () => {
        const newItem = { ...item, duration: audio.duration, album: data[0].albumName, autor: data[0].executor, imgSrc: data[0].link, like: false, listenTimes: 0};
        
        pushLocalStorage(newItem);
        pushAndLoadTracks(newItem, popupList)
      });
    }
  })
};

function pushAndLoadTracks(track, list) {
  const audio = new Audio(`../tracks/${track.url}`);

  track = {...track, audio};
  
  state.audios.push(track);
  loadAudioData(track, list);
}

function loadAudioData(audio, list) {
  const {name, duration, autor} = audio;
  let trackElement = trackTemplate.querySelector('.popup-item').cloneNode(true);

  if(list === favoritsTrackList) {
    trackElement = trackFavoritsTemplate.querySelector('.popup-item').cloneNode(true);
  }

  const trackName = trackElement.querySelector('.list-name');
  const trackAutor = trackElement.querySelector('.list-autor');
  const trackTime = trackElement.querySelector('.time-track');
  const trackPlayButton = trackElement.querySelector('.popup__play-button');
  const trackLikeButton = trackElement.querySelector('.popup__like-button');

  if(state.shuffle) {
    popupShuffleButton.querySelector('.shuffle-svg').classList.add('state-active');
    controlerShuffleButton.querySelector('.controler-svg').classList.add('state-active');
  }

  if(state.current?.name === name && state.playing) {
    trackPlayButton.querySelector('.play-svg').classList.add('is-active');
    trackElement.classList.add('track-active');
    trackPlayButton.querySelector('.play-svg').innerHTML = svgPause;
    lastTrack = trackPlayButton.querySelector('.play-svg');
  }

  if(audio.like) {
    trackLikeButton.querySelector('.like-svg').classList.add('state-active');
  }

  trackElement.setAttribute('data-id', name);
  trackName.textContent = name;
  trackAutor.textContent = autor;
  trackTime.textContent = audioTime(duration);
  
  trackPlayButton.addEventListener('click', () => setCurrentItem(name));
  trackLikeButton.addEventListener('click', () => setLikeTrack(audio));
  
  list.append(trackElement);
}

function setLikeTrack(audio) {
  let track = pushLikeToLS(audio);

  visualLikedTracks(track);
}

function visualLikedTracks(track) {
  const { like, name } = track;
  const item = document.querySelector(`[data-id="${name}"]`);

  if(like) {
    item.querySelector('.like-svg').classList.add('state-active');
    controlerLikeButton.querySelector('.like-svg').classList.add('state-active');
  }
  else {
    item.querySelector('.like-svg').classList.remove('state-active');
    controlerLikeButton.querySelector('.like-svg').classList.remove('state-active');
  }
}

function setCurrentItem(itemId) {
  const current = state.audios.find(({ name }) => itemId === name);

  if(!current) return;

  if(current === state.current) {
    handleAudioPlay();
    return;
  }

  pauseCurrentAudio();

  state.current = current;
  pushListenTimes(state.current);
  renderCurrentItem(current);

  current.audio.volume = state.volume;

  renderFavoritsImg(current);
  audioUpdateHandler(current);
}

function audioUpdateHandler({audio, duration}) {
  const progress = document.querySelector('.time-range');

  audio.play();
  state.playing = true;

  visualPlayPause()

  audio.addEventListener('timeupdate', ({target}) => {
    const { currentTime } = target;
    width = currentTime * 100 / duration;

    visualAudioTime(target, currentTime, width);
  });

  audio.addEventListener('ended', ({ target }) => {
    target.currentTime = 0;
    progress.style.width = `0%`;

    if(state.repeating) {
      target.play();
    }
    else if(state.shuffle) {
      handleShuffle();
    }
    else {
      handleNext();
    }
  })
}

function visualAudioTime(target, currentTime, width) {
  const progress = document.querySelector('.time-range');

  if(target.currentTime !== currentTime) {
    target.currentTime = currentTime;
  }

  controlerStartTime.innerHTML = audioTime(currentTime);
  progress.style.width = `${width}%`;
}

let timer;

function timerTrackShow() {
  timer = setInterval(showFullName, 500);
}

controlerPlayButton.addEventListener('click', () => handleAudioPlay());
controlerNextButton.addEventListener('click', () => checkShuffleActive());
controlerPrevButton.addEventListener('click', () => handlePrev());
controlerRepeatButton.addEventListener('click', () => handleRepeat(controlerRepeatButton));
controlerShuffleButton.addEventListener('click', () => nandleShuffleActive());
controlerName.addEventListener('mouseover', () => timerTrackShow());
controlerName.addEventListener('mouseout', () => {
  showWithd = 0;
  controlerName.style.left = -showWithd + 'px';
  clearTimeout(timer)
});
popupShuffleButton.addEventListener('click', () => nandleShuffleActive());
controlerLikeButton.addEventListener('click', () => setLikeTrack(state.current));
controlerVolumeButton.addEventListener('click', () => {
  if(state.volume != 0) {
    state.lastVolume = state.volume;
    handleVolume({value: 0})
  }
  else {
    handleVolume({value: state.lastVolume})
  }
});
findFavoritsTrack();

controlerTimeInput.addEventListener('mouseup', evt => {
  width = evt.layerX / 499 * 100;
  let time = width * state.current.duration / 100;
  visualAudioTime(state.current.audio, time, width);
})

controlerVolumeNewImput.addEventListener('mouseup', evt => {
  let value = evt.layerX / 100

  handleVolume({value});

  controlerVolumeValue.style.width = evt.layerX + 'px';
})

function showFullName() {
  showWithd += 6;
  controlerName.style.left = -showWithd + 'px';

  if(showWithd > 120) {
    showWithd = -100;
  }
}

function visualVolume() {
  if(state.volume == 0) {
    controlerVolumeButton.querySelector('.volume-svg').classList.add('state-active');
    controlerVolumeButton.querySelector('.volume-svg').innerHTML = `<use href="../svg/volume_mute.svg#volume_mute"></use>`;
    controlerVolumeValue.style.width = 0 + 'px';
  }
  else if(state.volume < 0.5) {
    controlerVolumeButton.querySelector('.volume-svg').classList.remove('state-active');
    controlerVolumeButton.querySelector('.volume-svg').innerHTML = `<use href="../svg/volume_min.svg#volume_min"></use>`;
    controlerVolumeValue.style.width = state.volume * 100 + 'px';
  }
  else {
    controlerVolumeButton.querySelector('.volume-svg').classList.remove('state-active');
    controlerVolumeButton.querySelector('.volume-svg').innerHTML = `<use href="../svg/volume.svg#volume"></use>`;
    controlerVolumeValue.style.width = state.volume * 100 + 'px';
  }
}

function checkShuffleActive() {
  if(state.shuffle) {
    handleShuffle();
  }
  else {
    handleNext();
  }
}

function nandleShuffleActive() {
  const { shuffle } = state;

  visualShuffle()

  state.shuffle = !shuffle;
  pushState(state);
}

function visualShuffle() {
  popupShuffleButton.querySelector('.shuffle-svg').classList.toggle('state-active');
  controlerShuffleButton.querySelector('.controler-svg').classList.toggle('state-active');
}

function handleShuffle() {
  const children = JSON.parse(localStorage.getItem(state.current.album));
  const rand = Math.random().toFixed(1)*10;
  const i = Math.abs(children.length - 1 - rand);

  if(state.current.name === children[i].name) {
    setCurrentItem(children[i+1].name);
  }
  else {
    setCurrentItem(children[i].name);
  }
}

function handleVolume({ value }) {
  const { current } = state;

  state.volume = value;
  pushState(state);

  if(!current?.audio) return;

  current.audio.volume = value;

  visualVolume();
}

function handleRepeat(currentTarget) {
  const { repeating } = state;
  
  currentTarget.querySelector('.controler-svg').classList.toggle('state-active', !repeating);
  state.repeating = !repeating;
  pushState(state);
}

function handlePrev() {
  const currentItem = JSON.parse(localStorage.getItem(state.current.album));
  const back = currentItem[currentItem.findIndex(({ name }) => state.current.name === name) - 1];
  const last = currentItem[currentItem.length - 1];

  const itemId = back?.name || last?.name;

  if(!itemId) return;

  setCurrentItem(itemId);
}

function handleNext() {
  const currentItem = JSON.parse(localStorage.getItem(state.current.album));
  const next = currentItem[currentItem.findIndex(({ name }) => state.current.name === name) + 1];
  const first = currentItem[0];
  
  const itemId = next?.name || first?.name;

  if(!itemId) return;

  setCurrentItem(itemId);
}

function handleAudioPlay() {
  const { playing, current } = state;
  const { audio } = current;

  state.playing = !playing;
  !playing ? audio.play() : audio.pause();
  visualPlayPause();
  pushState(state);
}

function visualPlayPause() {
  const currentTrack = popupAlbum.querySelector(`[data-id="${state.current.name}"]`);
  const favoritCurrentTrack = document.querySelector(`[data-id="${state.current.name}"]`);
  
  if(favoritLastTrack) {
    favoritLastTrack.classList.remove('is-active')
    favoritLastTrack.innerHTML = svgPlay;
    favoritLastTrack.closest('.popup-item').classList.remove('track-active');
  }

  if(lastTrack) {
    lastTrack.classList.remove('is-active')
    lastTrack.innerHTML = svgPlay;
    lastTrack.closest('.popup-item').classList.remove('track-active');
  }

  state.playing ? controlerPlayButton.querySelector('.play-svg').innerHTML = svgPause : controlerPlayButton.querySelector('.play-svg').innerHTML = svgPlay;
  state.playing ? currentTrack?.querySelector('.popup-svg').classList.add('is-active') : currentTrack?.querySelector('.popup-svg').classList.remove('is-active');
  state.playing ? currentTrack?.classList.add('track-active') : currentTrack?.classList.remove('track-active');
  state.playing ? favoritCurrentTrack?.querySelector('.popup-svg').classList.add('is-active') : favoritCurrentTrack?.querySelector('.popup-svg').classList.remove('is-active');
  state.playing ? favoritCurrentTrack?.classList.add('track-active') : favoritCurrentTrack?.classList.remove('track-active');

  if(favoritCurrentTrack !== null) {
    state.playing ? favoritCurrentTrack.querySelector('.popup-svg').innerHTML = svgPause : favoritCurrentTrack.querySelector('.popup-svg').innerHTML = svgPlay;
  }

  if(currentTrack !== null) {
    state.playing ? currentTrack.querySelector('.popup-svg').innerHTML = svgPause : currentTrack.querySelector('.popup-svg').innerHTML = svgPlay;
  }

  favoritLastTrack = document.querySelector('.is-active');
  lastTrack = popupAlbum.querySelector('.is-active');
}

function pauseCurrentAudio() {
  const { current: {audio} } = state;

  if(!audio) return;

  audio.pause();
  audio.currentTime = 0;
}

function renderCurrentItem(audio) {
  const {name, duration, autor, imgSrc, like} = audio;

  if(like) {
    controlerLikeButton.querySelector('.like-svg').classList.add('state-active');
  }
  else {
    controlerLikeButton.querySelector('.like-svg').classList.remove('state-active');
  }

  if(state.repeating) {
    controlerRepeatButton.querySelector('.repeat-svg').classList.add('state-active');
  }

  visualVolume();

  controlerImg.src = `../images/${imgSrc}`;
  controlerAutor.textContent = autor;
  controlerName.textContent = name;
  controlerEndTime.textContent = audioTime(duration);

  controlerDiv.classList.add('controler_is_opened');
}

function audioTime(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = (Math.floor(duration - minutes * 60)) < 10 ? `0${Math.floor(duration - minutes * 60)}` : Math.floor(duration - minutes * 60);

  return `${minutes}:${seconds}`;
};

function openPopup(src, name, autor) {
  if(lastAlbum !== name) {
    popupImg.src = `../images/${src}`;
    popupTitle.textContent = name;
    popupAutor.textContent = autor;

    const { children } = popupList;
    let albumLength = children.length;
    for(let i = 0; i < albumLength; i++) {
      popupList.querySelector('.popup-item').remove();
    }

    /*if(localStorage.getItem(name) === null) {
      albums.forEach(item => {
        if(item[0].albumName === name) {
          renderAudios(item);
        }
      })
    }
    else {
      findTracks(name);
    }*/

    findTracks(name);
    lastAlbum = name;
  }

  popupAlbum.classList.add('popup_is-opened');

  document.addEventListener('keydown', closeEsc);
}

function closePopup() {
  popupAlbum.classList.remove('popup_is-opened');

  document.removeEventListener('keydown', closeEsc);
}

function closeEsc(evt) {
  if(evt.key === 'Escape') {
    closePopup(document.querySelector('.popup_is-opened'));
  }
};

function createTracksList(albumName) {
  JSON.parse(localStorage.getItem(albumName)).forEach(track => {
    trackList.push(track);
  })
}

function findFavoritsTrack() {
  trackList.sort((a, b) => (b.listenTimes) - (a.listenTimes));
  trackList.splice(7);

  trackList.forEach(item => {
    pushAndLoadTracks(item, favoritsTrackList);
  })

  renderFavoritsImg(trackList[0])
}

function renderFavoritsImg(audio) {
  const { autor, imgSrc} = audio;
  const favoritsImg = favoritsImgBlock.querySelector('.track-img');
  const favoritsName = favoritsImgBlock.querySelector('.track-title');
  const favoritsAutor = favoritsImgBlock.querySelector('.track-autor');

  if(trackList.find(({name}) => name === audio.name)) {
    favoritsImg.src = `../images/${imgSrc}`;
    favoritsName.textContent = audio.name;
    favoritsAutor.textContent = autor;
  }
}

export { infoUl, pushAndLoadTracks, popupList};