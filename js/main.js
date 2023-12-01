import { OgPictureRain } from "./og_pictrain.js";
import { OgCarousel } from "./og_carousel.js";
import { eventsManager } from "./eventsManager.js";

// ***** PICTURE RAIN *****

const pictrain = new OgPictureRain({
  baseDiv:    document.getElementById('kstmp-front-page-pictrain'),
  imageUrls:  [
    './assets/images/indiv/johann3.jpg',
    './assets/images/indiv/clem1.jpg',
    './assets/images/indiv/sekou3.jpg',
    './assets/images/indiv/maqui-oliv.jpg',
    './assets/images/indiv/maqui-zygui.jpg',
  ],
  timeBetweenDrops:   250,
  dropSpeed:          600,
  randomizeDrop:      true,
  randomizeImgOrder:  true,
  loaderColor:        'white',
});

// Scroll effects for Picture Rain
window.onscroll = () => {
  // front-page images (pictrain)
  if (window.scrollY < pictrain.baseDiv.scrollHeight) {
    pictrain.images.forEach((img, id) => {
      img.style.cssText = `transform: translateY(${-window.scrollY * (id + 1) / 3}px)`;
    });
  }

  lastScrollPosition = window.scrollY;
}


// ***** CAROUSEL *****

new OgCarousel({
  mainContainerId:        'carousel-main',
  thumbnailsContainerId:  'carousel-thumbnails',

  imageUrls:  [
    './assets/images/banner.jpg',
    './assets/images/LargeBleuGnawa.jpg',
    './assets/images/PhotoBanniereFondNoir.jpg',
    './assets/images/ZyguiDanseGnawi.jpg',
  ],
  // optional
  transitionTimeInMs: 2000,
  stayTimeInMs:       4000,
  thumbnailColor:     'white',
  arrowButtonColor:   'white',
  loaderColor:        'white',
});


// ***** NAVBAR BEHAVIOR *****

const navbarUl    = document.querySelector('#kstmp-navbar ul');
const burgerInput = document.getElementById('kstmp-burger-input');
const burgerBtn   = document.getElementById('kstmp-burger');

// .slice removes the unit ('px') from CSS value
const navbarHeight  = parseInt(getComputedStyle(document.body).getPropertyValue('--bar-height').slice(0, -2));
const pxToMove      = navbarHeight + (navbarHeight / 3);

// let lastScrollPosition = 0;

// const navbarScrollBehavior = () => {
//   if (window.scrollY > lastScrollPosition) {
//     navbarUl.style.cssText = `transform: translateY(-${pxToMove}px);`;
//     burgerInput.checked = false;
//   } else {
//     navbarUl.style.cssText = 'transform: translateY(0);';
//     burgerInput.checked = true;
//   }
// }

const burgerClickBehavior = () => {
  navbarUl.style.transform  = burgerInput.checked ? `translateY(-${pxToMove}px)` : 'translateY(0)';
  burgerInput.checked = !burgerInput.checked;
}

burgerBtn.onclick = burgerClickBehavior;


// ***** EVENTS (MAP & EVENTS) ****

new eventsManager({listContainerId: 'events-list'});

// ***** HEADERS *****

const headers = document.querySelectorAll('section header h2');
const headersLength = headers.length;

// TODO: better managment of header's h2 position
headers.forEach((header, index) => {
  header.style.marginLeft = `${100 / headersLength * index}%`;

  // FIXME: this is to avoid last header overflowing,
  // but fails to prevent other headers overflowing on narrow screens
  if (index === headersLength - 1) {
    header.style.margin = '0';
    header.style.width = '100%';
    header.style.textAlign = 'right'
  }
})

// ***** VIDEOS *****

document.querySelectorAll('.video-iframe-overlay').forEach(overlay => {
  overlay.onclick = () => {
    overlay.parentElement.style.filter = 'none';
    const iframe = overlay.previousElementSibling;
    overlay.remove();
  };
});
