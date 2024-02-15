const defaultoffset = Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight,
  document.documentElement.scrollTop
) - 500;

let lastScroll = 0;
const controler = document.querySelector(".controler");

const scrollPosition = () => window.pageXOffset || document.documentElement.scrollTop;
const containHide = () => controler.classList.contains('controler_is_opened');

function controlerHide() {
  window.addEventListener('scroll', () => {
    if(scrollPosition() > lastScroll && containHide() && scrollPosition() > defaultoffset){
      controler.classList.remove('controler_is_opened');
      console.log('down');
    }
    else if(scrollPosition() < lastScroll && !containHide() && scrollPosition() > defaultoffset){
      controler.classList.add('controler_is_opened');
      console.log('up');
    }

    lastScroll = scrollPosition();
  })
}

export { controlerHide };