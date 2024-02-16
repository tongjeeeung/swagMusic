import { timeEr } from './content/slider.js';
import { albums } from './tracks.js';
import { changeThreme } from './content/cheangeThreme.js'
import { pushLocalStorage, findTracks, pushLikeToLS, pushState, pushListenTimes, pushAddedAlbum } from './content/localstorage.js';
import { controlerHide } from './content/controler.js';

const changeThremeButton = document.querySelector('.menu-logo');

const infoUl = document.querySelector('.infoList');

setInterval(timeEr, 10000);

const infoSection = document.getElementById('info');
const yourPlaylistsSection = document.getElementById('your-playlists');
const favoritsSection = document.getElementById('favorits');
const allPlaylistSection = document.querySelector('.all-playlists');

const albomsList = document.querySelector('.playlist__list');
const popupAlbum = document.querySelector('.popup-playlist');
const popupAddRemoveButton = popupAlbum.querySelector('.popup__button-add');
const popupList = popupAlbum.querySelector('.popup__list');
const popupImg = popupAlbum.querySelector('.popup__img');
const popupTitle = popupAlbum.querySelector('.playlist-title');
const popupAutor = popupAlbum.querySelector('.playlist-autor');
const popupShuffleButton = popupAlbum.querySelector('.popup__shuffle');
const controlerDiv = document.querySelector('.controler');
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

const headerPlaylistsButton = document.getElementById('header-playlists');
const headerHomeButton = document.getElementById('header-home');

let svgPlay = `<use href="../svg/play.svg#play"></use>`;
let svgPause = `<use href="../svg/pause.svg#pause"></use>`;
let lastTrack = false;
let favoritLastTrack = false;
let lastAlbum = false;
let width = 0;
let trackList = [];
let showWithd = 0;
let timer;

const state = {
  audios: [],
  current: {},
  repeating: false,
  shuffle: false,
  playing: true,
  volume: 0.2,
  lastVolume: 0,
  threme: '',
}

function createAlboms(item) {
  const albumTemplate = document.querySelector('#album-template').content;
  const albumElement = albumTemplate.querySelector('.playlist-item').cloneNode(true);
  const albumImg = albumElement.querySelector('.playlist-img');
  const albumTitle = albumElement.querySelector('.playlist-title');
  const albumAutor = albumElement.querySelector('.playlist-autor');
  
  albumImg.src = `../images/${item.link}`;
  albumTitle.textContent = item.albumName;
  albumAutor.textContent = item.executor;

  albumImg.addEventListener('click', () => openPopup(item, popupList, state))

  return (albumElement);
}

function localStorageStateGet(state) {
  if(localStorage.getItem('state') === null) {
    pushState(state);
    localStorage.setItem('addedAlbums', JSON.stringify([]));
  }

  let localState = JSON.parse(localStorage.getItem('state'));
  state.repeating = localState[0].repeating;
  state.shuffle = localState[0].shuffle;
  state.volume = localState[0].volume;
  state.lastVolume = localState[0].lastVolume;
  state.threme = localState[0].threme;

  if(localState[0].threme != '') {
    document.querySelector('body').classList.add(state.threme);
  }
}

localStorageStateGet(state);
const renderFavoritsTracks = setTimeout(createTracksList, 4000, (albums));
renderFavoritsTracks;

if(localStorage.getItem(albums[albums.length-1][0].albumName) !== null) {
  clearTimeout(renderFavoritsTracks);
  createTracksList(albums);
}

albums.forEach(data => {
  if(localStorage.getItem(data[0].albumName) === null) {
    renderAudios(data, popupList, state);
  }
});

findAddedAlbums(albomsList);

changeThremeButton.addEventListener('click', () => changeThreme(state, pushState))

headerPlaylistsButton.addEventListener('click', () => {
  infoSection.style.display = 'none';
  yourPlaylistsSection.style.display = 'none';
  favoritsSection.style.display = 'none';
  allPlaylistSection.style.display = 'block';
  if(Array.from(allPlaylistSection.querySelector('.playlist__list').children).length === 0) {
    albums.forEach(data => {
      let album = createAlboms(data[0]);
      allPlaylistSection.querySelector('.playlist__list').append(album);
    })
  }
})

headerHomeButton.addEventListener('click', () => {
  infoSection.style.display = 'block';
  yourPlaylistsSection.style.display = 'block';
  favoritsSection.style.display = 'flex';
  allPlaylistSection.style.display = 'none';
  findAddedAlbums(albomsList);
})

function findAddedAlbums(list) {
  if(JSON.parse(localStorage.getItem('addedAlbums')).length != 0) {
    if(Array.from(list.children).length != 0) {
      Array.from(list.children).forEach(item => {
        item.remove();
      })
    }
    JSON.parse(localStorage.getItem('addedAlbums')).forEach(data => {
      let album = createAlboms(data);
      list.append(album);
    })
  }
  else {
    if(list.querySelector('.playlist-item') != null) {
      list.querySelector('.playlist-item').remove();
    }
  }
}

popupAlbum.addEventListener('click', evt => {
  if(evt.target === popupAlbum) {
    closePopup();
  }
})

function renderAudios(data, list, state) {
  data.forEach(item => {
    if(item.url != undefined) {
      const audio = new Audio(`../tracks/${item.url}`);
      
      audio.addEventListener('loadeddata', () => {
        const newItem = { ...item, duration: audio.duration, album: data[0].albumName, autor: data[0].executor, imgSrc: data[0].link, like: false, listenTimes: 0};
        
        pushLocalStorage(newItem);
        pushAndLoadTracks(newItem, list, state)
      });
    }
  })
};

function pushAndLoadTracks(track, list, state) {
  const audio = new Audio(`../tracks/${track.url}`);

  track = {...track, audio};

  state.audios.push(track);
  loadAudioData(track, list, state);
}

function loadAudioData(audio, list, state) {
  const {name, duration, autor} = audio;
  const trackTemplate = document.querySelector('#track-template').content;
  const trackFavoritsTemplate = document.querySelector('#favorit__track-template').content;

  const popupShuffleButton = document.querySelector('.popup__shuffle');
  const controlerShuffleButton = document.querySelector('.controler__shuffle');

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
  
  trackPlayButton.addEventListener('click', () => setCurrentItem(name, state));
  trackLikeButton.addEventListener('click', () => setLikeTrack(audio));
  
  list.append(trackElement);
}

function setLikeTrack(audio) {
  let track = pushLikeToLS(audio);

  visualLikedTracks(track);
}

function visualLikedTracks(track) {
  const { like, name } = track;
  const controlerLikeButton = document.querySelector('.controler__like-button');
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

function setCurrentItem(itemId, state) {
  const current = state.audios.find(({ name }) => itemId === name);

  if(!current) return;

  if(current === state.current) {
    handleAudioPlay(state);
    return;
  }

  pauseCurrentAudio(state);

  state.current = current;
  pushListenTimes(state.current);
  renderCurrentItem(current, state);

  current.audio.volume = state.volume;

  renderFavoritsImg(current, trackList);
  audioUpdateHandler(current, state);
}

function audioUpdateHandler({audio, duration}, state) {
  const progress = document.querySelector('.time-range');

  audio.play();
  state.playing = true;

  visualPlayPause(state)

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
      handleShuffle(state);
    }
    else {
      handleNext(state);
    }
  })
}

function visualAudioTime(target, currentTime, width) {
  const progress = document.querySelector('.time-range');
  const controlerStartTime = document.querySelector('.time-this');
  
  if(target.currentTime !== currentTime) {
    target.currentTime = currentTime;
  }

  controlerStartTime.innerHTML = audioTime(currentTime);
  progress.style.width = `${width}%`;
};

function timerTrackShow(widthName) {
  timer = setInterval(showFullName, 50, (widthName));
};

controlerPlayButton.addEventListener('click', () => handleAudioPlay(state));
controlerNextButton.addEventListener('click', () => checkShuffleActive(state));
controlerPrevButton.addEventListener('click', () => handlePrev(state));
controlerRepeatButton.addEventListener('click', () => handleRepeat(controlerRepeatButton, state));
controlerShuffleButton.addEventListener('click', () => nandleShuffleActive(state));
popupShuffleButton.addEventListener('click', () => nandleShuffleActive(state));
controlerLikeButton.addEventListener('click', () => setLikeTrack(state.current));
controlerVolumeButton.addEventListener('click', () => {
  if(state.volume != 0) {
    state.lastVolume = state.volume;
    handleVolume({value: 0}, state)
  }
  else {
    handleVolume({value: state.lastVolume}, state)
  }
});
popupAddRemoveButton.addEventListener('click', (evt) => {
  visualButtonAddRemove(evt.target);
  pushAddedAlbum({link: popupImg.src.substring(popupImg.src.lastIndexOf('/')+1),albumName: popupTitle.textContent,executor: popupAutor.textContent})
})

function visualButtonAddRemove(popupAddRemoveButton) {
  if(popupAddRemoveButton.textContent === 'add') {
    popupAddRemoveButton.textContent = 'remove';
    popupAddRemoveButton.classList.add('.popup__button-remove');
  }
  else {
    popupAddRemoveButton.textContent = 'add';
    popupAddRemoveButton.classList.remove('.popup__button-remove');
  }
}

controlerTimeInput.addEventListener('mouseup', evt => {
  let progressWight = window.getComputedStyle(controlerDiv.querySelector('.progress')).width.replace(/[a-z%]/gi, '');

  width = evt.layerX / progressWight * 100;
  let time = width * state.current.duration / 100;
  visualAudioTime(state.current.audio, time, width);
})

controlerVolumeNewImput.addEventListener('mouseup', evt => {
  let value = evt.layerX / 100

  handleVolume({value}, state);

  controlerVolumeValue.style.width = evt.layerX + 'px';
})

function showFullName(widthName) {
  const controlerName = controlerDiv.querySelector('.controler__info-title');

  showWithd += 2;
  controlerName.style.left = -showWithd + 'px';
  if(controlerName.style.left.replace(/[a-z%]/gi, '') * -1 >= widthName + 12) {
    showWithd = -widthName;
  }
}

function visualVolume(state) {
  const controlerVolumeButton = document.querySelector('.volume__button');
  const controlerVolumeValue = document.querySelector('.volume__track-value');

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

function checkShuffleActive(state) {
  if(state.shuffle) {
    handleShuffle(state);
  }
  else {
    handleNext(state);
  }
}

function nandleShuffleActive(state) {
  const { shuffle } = state;

  visualShuffle()

  state.shuffle = !shuffle;
  pushState(state);
}

function visualShuffle() {
  const popupShuffleButton = document.querySelector('.popup__shuffle');
  const controlerShuffleButton = document.querySelector('.controler__shuffle');

  popupShuffleButton.querySelector('.shuffle-svg').classList.toggle('state-active');
  controlerShuffleButton.querySelector('.controler-svg').classList.toggle('state-active');
}

function handleShuffle(state) {
  const children = JSON.parse(localStorage.getItem(state.current.album));
  const rand = Math.random().toFixed(1)*10;
  const i = Math.abs(children.length - 1 - rand);
  
  if(state.current.name === children[i].name) {
    setCurrentItem(children[i+1].name, state);
  }
  else {
    setCurrentItem(children[i].name, state);
  }
}

function handleVolume({ value }, state) {
  const { current } = state;

  state.volume = value;
  pushState(state);

  if(!current?.audio) return;

  current.audio.volume = value;

  visualVolume(state);
}

function handleRepeat(currentTarget, state) {
  const { repeating } = state;
  
  currentTarget.querySelector('.controler-svg').classList.toggle('state-active', !repeating);
  state.repeating = !repeating;
  pushState(state);
}

function handlePrev(state) {
  const currentItem = JSON.parse(localStorage.getItem(state.current.album));
  const back = currentItem[currentItem.findIndex(({ name }) => state.current.name === name) - 1];
  const last = currentItem[currentItem.length - 1];

  const itemId = back?.name || last?.name;

  if(!itemId) return;

  setCurrentItem(itemId, state);
}

function handleNext(state) {
  const currentItem = JSON.parse(localStorage.getItem(state.current.album));
  const next = currentItem[currentItem.findIndex(({ name }) => state.current.name === name) + 1];
  const first = currentItem[0];
  
  const itemId = next?.name || first?.name;

  if(!itemId) return;

  setCurrentItem(itemId, state);
}

function handleAudioPlay(state) {
  const { playing, current } = state;
  const { audio } = current;

  state.playing = !playing;
  !playing ? audio.play() : audio.pause();
  visualPlayPause(state);
  pushState(state);
}

function visualPlayPause(state) {
  const currentTrack = document.querySelector('.popup').querySelector(`[data-id="${state.current.name}"]`);
  const favoritCurrentTrack = document.querySelector(`[data-id="${state.current.name}"]`);
  const controlerPlayButton = controlerDiv.querySelector('.controler__play-button');
  
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

function pauseCurrentAudio(state) {
  const { current: {audio} } = state;

  if(!audio) return;

  audio.pause();
  audio.currentTime = 0;
}

function renderCurrentItem(audio, state) {
  const {name, duration, autor, imgSrc, like} = audio;
  const controlerDiv = document.querySelector('.controler');
  const controlerImg = controlerDiv.querySelector('.controler-img');
  const controlerName = controlerDiv.querySelector('.controler__info-title');
  const controlerAutor = controlerDiv.querySelector('.controler__info-autor');
  const controlerEndTime = controlerDiv.querySelector('.time-all');
  const controlerLikeButton = controlerDiv.querySelector('.controler__like-button');
  const controlerRepeatButton = controlerDiv.querySelector('.controler__repeat');

  if(like) {
    controlerLikeButton.querySelector('.like-svg').classList.add('state-active');
  }
  else {
    controlerLikeButton.querySelector('.like-svg').classList.remove('state-active');
  }

  if(state.repeating) {
    controlerRepeatButton.querySelector('.repeat-svg').classList.add('state-active');
  }

  visualVolume(state);

  controlerImg.src = `../images/${imgSrc}`;
  controlerAutor.textContent = autor;
  controlerName.textContent = name;
  controlerEndTime.textContent = audioTime(duration);

  showWithd = 0;
  controlerName.style.left = -showWithd + 'px';
  clearTimeout(timer)

  let widthName = window.getComputedStyle(controlerName).width.replace(/[a-z%]/gi, '');
  let widthInfoBox = window.getComputedStyle(controlerDiv.querySelector('.controler__info')).width.replace(/[a-z%]/gi, '');

  if(Number(widthName) > Number(widthInfoBox)) {
    timerTrackShow(widthName, widthInfoBox);
  }

  controlerDiv.classList.add('controler_is_opened');
  controlerHide();
}

function audioTime(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = (Math.floor(duration - minutes * 60)) < 10 ? `0${Math.floor(duration - minutes * 60)}` : Math.floor(duration - minutes * 60);

  return `${minutes}:${seconds}`;
};

function openPopup({link, albumName, executor}, list, state) {
  if(lastAlbum !== albumName) {
    popupImg.src = `../images/${link}`;
    popupTitle.textContent = albumName;
    popupAutor.textContent = executor;

    const { children } = popupList;
    let albumLength = children.length;
    for(let i = 0; i < albumLength; i++) {
      popupList.querySelector('.popup-item').remove();
    }

    lastAlbum = albumName;
    if(JSON.parse(localStorage.getItem('addedAlbums')).find(({ albumName }) => albumName == lastAlbum) != undefined) {
      popupAddRemoveButton.textContent = 'remove';
      popupAddRemoveButton.classList.add('.popup__button-remove');
    }
    else {
      popupAddRemoveButton.textContent = 'add';
      popupAddRemoveButton.classList.remove('.popup__button-remove');
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

    findTracks(albumName, list, state);
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

function createTracksList(albums) {
  albums.forEach(data => {
    JSON.parse(localStorage.getItem(data[0].albumName)).forEach(track => {
      trackList.push(track);
    })
  })

  findFavoritsTrack(trackList);
}

function findFavoritsTrack(trackList) {
  const favoritsTrackList = document.querySelector('.favorits__track-list');
  trackList.sort((a, b) => (b.listenTimes) - (a.listenTimes));
  trackList.splice(7);

  trackList.forEach(item => {
    pushAndLoadTracks(item, favoritsTrackList, state);
  })

  renderFavoritsImg(trackList[0], trackList)
}

function renderFavoritsImg(audio, trackList) {
  const { autor, imgSrc} = audio;
  const favoritsImgBlock = document.querySelector('.favorit__track');
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