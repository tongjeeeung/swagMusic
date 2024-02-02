import { pushAndLoadTracks, popupList } from '../index.js';

function getFromLocalStorage(keyName) {
  const itemLocalStorage = localStorage.getItem(keyName);
  if(itemLocalStorage !== null) {
    return JSON.parse(itemLocalStorage);
  }
  return [];
}

function pushLocalStorage(audioObject) {
  let tracks = getFromLocalStorage(audioObject.album);
  let index = tracks.findIndex(({ name }) => audioObject.name === name);

  if(index === -1) {
    tracks.push(audioObject);
  }
  else {
    tracks.splice(index, 1)
  }

  localStorage.setItem(audioObject.album, JSON.stringify(tracks))
}

function pushLikeToLS(audioObject) {
  let likedTracks = getFromLocalStorage(audioObject.album);

  let track = likedTracks.find(({ name }) => audioObject.name === name)
  track.like === false ? track.like = true : track.like = false;

  localStorage.setItem(audioObject.album, JSON.stringify(likedTracks))
  
  return track;
}

function pushState(state) {
  let stateArr = [state];
  localStorage.setItem('state', JSON.stringify(stateArr))
}

function pushListenTimes(audioObject) {
  let trackList = getFromLocalStorage(audioObject.album);

  let track = trackList.find(({ name }) => audioObject.name === name)
  track.listenTimes += 1;

  localStorage.setItem(audioObject.album, JSON.stringify(trackList));
}

function findTracks(albumName) {
  JSON.parse(localStorage.getItem(albumName)).forEach(newItem => {
    pushAndLoadTracks(newItem, popupList);
  });
};

export { pushLocalStorage, findTracks, pushLikeToLS, pushState, pushListenTimes };