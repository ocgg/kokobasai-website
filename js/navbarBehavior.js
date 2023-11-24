const navbarUl    = document.querySelector('#kstmp-navbar ul');
const burgerInput = document.getElementById('kstmp-burger-input');
const burgerBtn   = document.getElementById('kstmp-burger');

// .slice removes the unit ('px') from CSS value
const navbarHeight  = parseInt(getComputedStyle(document.body).getPropertyValue('--bar-height').slice(0, -2));
const pxToMove      = navbarHeight + (navbarHeight / 3);

let lastScrollPosition = 0;

const navbarScrollBehavior = () => {
  if (window.scrollY > lastScrollPosition) {
    navbarUl.style.cssText = `transform: translateY(-${pxToMove}px);`;
    burgerInput.checked = false;
  } else {
    navbarUl.style.cssText = 'transform: translateY(0);';
    burgerInput.checked = true;
  }
}

const burgerClickBehavior = () => {
  navbarUl.style.transform  = burgerInput.checked ? `translateY(-${pxToMove}px)` : 'translateY(0)';
  burgerInput.checked = !burgerInput.checked;
}

burgerBtn.onclick = burgerClickBehavior;