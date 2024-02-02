import {infoUl} from '../index.js';

let leftPosition = 980;
let Flag = true;

function timeEr() {
  if(leftPosition < 980*2 & Flag) {
    leftPosition += 980;
    Flag = false;
  }
  else if(leftPosition > 0) {
    leftPosition -= 980;
  }
  else {
    leftPosition += 980;
    Flag = true;
  }
  infoUl.style.left = -leftPosition + 'px';
}

const favoritImg = document.querySelector('.track-img');
const favoritTrackInfo = document.querySelector('.track__info');

favoritImg.addEventListener('mouseover', () => {
  favoritTrackInfo.style.left = 5 + '%';
});
favoritImg.addEventListener('mouseout', () => {
  favoritTrackInfo.style.left = -100 + '%';
});

export {timeEr};