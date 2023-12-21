import { data } from './tracks.js';

const AudioController = {
  state: {
    audios: [],
    current: {},
    repeating: false,
    playing: true,
    volume: 0.2,
  },

  init() {
    this.initVaribles();
    this.renderAudios();
    this.initEvents();
  },

  initVaribles() {
    this.playButton = null;
    this.audioList = document.getElementById('jar');
    this.currentItem = document.querySelector('.music');
  },

  initEvents() {
    this.audioList.addEventListener('click', this.handleItem.bind(this));
  },

  handleRepeat({currentTarget}) {
    const { repeating } = this.state;

    currentTarget.querySelector('.menu-threme-svg').classList.toggle('active', !repeating);
    this.state.repeating = !repeating;
  },

  handleAudioPlay() {
    const { playing, current } = this.state;
    const { audio } = current;
    
    this.state.playing = !playing;
    !playing ? audio.play() : audio.pause();
    !playing ? this.playButton.innerHTML = `<svg class="play-svg" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m7 5v14m10-14v14" stroke="#fff" stroke-linecap="round" stroke-width="2"/></svg>` : this.playButton.innerHTML = `<svg class="play-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>`;
  },

  handleNext() {
    const { current } = this.state;

    const currentItem = document.querySelector(`[data-id="${current.name}"]`);
    const next = currentItem.nextSibling?.dataset;
    const first = this.audioList.firstChild?.nextElementSibling.dataset;

    const itemId = next?.id || first?.id;

    if(!itemId) return;

    this.setCurrentItem(itemId);
  },

  handleBack() {
    const { current } = this.state;

    const currentItem = document.querySelector(`[data-id="${current.name}"]`);
    const back = currentItem.previousSibling?.dataset;
    const last = this.audioList.lastChild?.dataset;

    const itemId = back?.id || last?.id;

    if(!itemId) return;

    this.setCurrentItem(itemId);
  },

  handlePlayer() {
    const play = document.querySelector('#menu-play');
    const next = document.querySelector('#menu-next');
    const back = document.querySelector('#menu-back');
    const repeatButton = document.getElementById('menu-repeat');
    const volumeButton = document.querySelector(".volume-range");
    const shuffleButton = document.querySelector("#menu-shuffle");

    this.playButton = play;

    play.addEventListener('click', this.handleAudioPlay.bind(this));
    next.addEventListener('click', this.handleNext.bind(this));
    back.addEventListener('click', this.handleBack.bind(this));
    repeatButton.addEventListener('click', this.handleRepeat.bind(this));
    volumeButton.addEventListener('change', this.handleVolume.bind(this));
    shuffleButton.addEventListener('click', this.handleShuffle.bind(this));
  },

  handleShuffle() {
    const { children } = this.audioList;
    const shuffled = shuffle([...children]);

    console.log(this.audioList)
    this.audioList.innerHTML = "";
    shuffled.forEach((item) => this.audioList.appendChild(item));
    console.log(shuffled);
    console.log(this.audioList)
  },

  handleVolume({ target: { value }}) {
    const { current } = this.state;

    this.state.volume = value;

    if(!current?.audio) return;

    current.audio.volume = value;
  },

  audioUpdateHandler({audio, duration}) {
    const progress = document.querySelector('.time-range');
    const timeLine = document.querySelector('.time-this');

    audio.play();
    this.state.playing = true;

    audio.addEventListener('timeupdate', ({target}) => {
      const { currentTime } = target;
      const width = currentTime * 100 / duration;

      timeLine.innerHTML = audioTime(currentTime);
      progress.style.width = `${width}%`;
    });

    audio.addEventListener('ended', ({ target }) => {
      target.currentTime = 0;
      progress.style.width = `0%`;

      this.state.repeating ? target.play() : this.handleNext();
    })
  },

  renderCurrentItem(audio) {
    const {name, executor, duration, link} = audio;

    let repeatClass = ``;

    this.state.repeating ? repeatClass = `active` : repeatClass = ``;

    const item = `
                <ul class="music__menu">
                  <li class="music__menu-item">
                    <div class="music__menu__info">
                      <img class="music__menu__info-logo" src="./images/${link}" alt="${executor}">
                      <div class="music__menu__info-box">
                        <h4 class="music__menu__info-name">${name}</h4>
                        <span class="music__menu__info-executor">${executor}</span>
                      </div>
                      <svg class="music__menu__info-plus" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <use href="./svg/heart.svg#heart"></use>
                      </svg>
                    </div>
                  </li>
                  <li class="music__menu-item">
                    <div class="music__menu__play">
                      <button class="music__menu-button" id="menu-shuffle">
                        <svg class="menu-threme-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <use href="./svg/shuffle.svg#shuffle"></use>
                        </svg>
                      </button>
                      <button class="music__menu-button" id="menu-back">
                        <svg class="menu-threme-svg menu-back-btn" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><g><path d="m2 2.96495c0-.81082.91427-1.28456 1.57668-.81697l7.13302 5.03504c.5644.39841.5644 1.23552 0 1.63393l-7.13302 5.03505c-.66241.4676-1.57668-.0062-1.57668-.817z"/><path d="m14 2.75c0-.41421-.3358-.75-.75-.75s-.75.33579-.75.75v10.5c0 .4142.3358.75.75.75s.75-.3358.75-.75z"/></g></svg>               
                      </button>
                      <button class="music__menu-button play-icon-btn" id="menu-play">
                      <svg class="play-svg" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m7 5v14m10-14v14" stroke="#fff" stroke-linecap="round" stroke-width="2"/></svg>
                      </button>
                      <button class="music__menu-button" id="menu-next">
                        <svg class="menu-threme-svg" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><g><path d="m2 2.96495c0-.81082.91427-1.28456 1.57668-.81697l7.13302 5.03504c.5644.39841.5644 1.23552 0 1.63393l-7.13302 5.03505c-.66241.4676-1.57668-.0062-1.57668-.817z"/><path d="m14 2.75c0-.41421-.3358-.75-.75-.75s-.75.33579-.75.75v10.5c0 .4142.3358.75.75.75s.75-.3358.75-.75z"/></g></svg>
                      </button>
                      <button class="music__menu-button" id="menu-repeat">
                        <svg class="menu-threme-svg ${repeatClass}" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.924 5.617a.997.997 0 0 0-.217-.324l-3-3a1 1 0 1 0-1.414 1.414L17.586 5H8a5 5 0 0 0-5 5v2a1 1 0 1 0 2 0v-2a3 3 0 0 1 3-3h9.586l-1.293 1.293a1 1 0 0 0 1.414 1.414l3-3A.997.997 0 0 0 21 6m-.076-.383a.996.996 0 0 1 .076.38l-.076-.38zm-17.848 12a.997.997 0 0 0 .217 1.09l3 3a1 1 0 0 0 1.414-1.414L6.414 19H16a5 5 0 0 0 5-5v-2a1 1 0 1 0-2 0v2a3 3 0 0 1-3 3H6.414l1.293-1.293a1 1 0 1 0-1.414-1.414l-3 3m-.217.324a.997.997 0 0 1 .215-.322l-.215.322z"/></svg>
                      </button>
                    </div>
                  </li>
                  <li class="music__menu-item">
                    <div class="music__menu__volume">
                      <button class="music__menu-button">
                        <svg class="menu-threme-svg" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>
                      </button>
                      <input class="volume-range" type="range" id="volume" name="volume" min="0" max="1" step="0.01" value="0.2"/>
                    </div>
                  </li>
                </ul>
                <div class="track-range">
                  <span class="time-this">0:00</span>
                  <div class="progress">
                    <div class="time-range"></div>
                  </div>
                  <span class="time-all">${audioTime(duration)}</span>
                </div>
              </section>`;

    this.currentItem.innerHTML = item;
  },

  pauseCurrentAudio() {
    const { current: {audio} } = this.state;

    if(!audio) return;

    audio.pause();
    audio.currentTime = 0;
  },

  setCurrentItem(itemId) {
    const current = this.state.audios.find(({ name }) => itemId === name);

    if(!current) return;

    this.pauseCurrentAudio();

    this.state.current = current;
    this.renderCurrentItem(current);

    current.audio.volume = this.state.volume;

    this.handlePlayer();
    this.audioUpdateHandler(current);
  },

  handleItem({target}) {
    const {id} = target.dataset;

    if(!id) return;

    this.setCurrentItem(id);
  },

  loadAudioData(audio) {
    const {name, executor, duration} = audio;

    const item = `<li class="dialog__list-item" data-id="${name}">
                    <button class="track-play">
                      <svg class="play-svg" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>
                    </button>
                    <a class="track__executor" href="#0">${executor}</a>
                    <span>-</span>
                    <a class="track__name" href="#0">${name}</a>
                    <button class="like-btn">
                      <svg class="music__menu__info-plus" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <use href="./svg/heart.svg#heart"></use>
                      </svg>
                    </button>
                    <span class="track-time">${audioTime(duration)}</span>
                  </li>`;
    this.audioList.innerHTML += item;
  },

  renderAudios() {
    data.forEach(item => {
      const audio = new Audio(`./tracks/${item.url}`);

      audio.addEventListener('loadeddata', () => {
        const newItem = { ...item, duration: audio.duration, audio};

        this.state.audios.push(newItem);
        this.loadAudioData(newItem);
      });
    });
  }
};

function audioTime(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = (Math.floor(duration - minutes * 60)) < 10 ? `0${Math.floor(duration - minutes * 60)}` : Math.floor(duration - minutes * 60);

  return `${minutes}:${seconds}`;
};

const shuffle = (array) => array.sort(() => 0.5 - Math.random());

AudioController.init();