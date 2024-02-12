import {infoUl} from '../index.js';

let widthInfoImg = 100;

let leftPosition = widthInfoImg;
let Flag = true;

function timeEr() {
  if(leftPosition < widthInfoImg * 2 & Flag) {
    leftPosition += widthInfoImg;
    Flag = false;
  }
  else if(leftPosition > 0) {
    leftPosition -= widthInfoImg;
  }
  else {
    leftPosition += widthInfoImg;
    Flag = true;
  }
  infoUl.style.left = -leftPosition + 'vw';
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