class OgPictureRain {
  constructor(args) {
    this.baseDiv    = args.baseDiv;
    this.imageUrls  = args.imageUrls;

    // These are optionnals
    this.timeBetweenDrops = args.timeBetweenDrops || 500;
    this.dropSpeed        = args.dropSpeed        || 1000;
    this.randomizeDrop    = args.randomizeDrop    || false;
    this.randomizeImgOrder= args.randomizeImgOrder|| false;
    this.loaderColor      = args.loaderColor      || 'rgba(0, 0, 0, 0.5)'

    this.imgContainer = document.createElement('div');
    this.imgContainer.classList.add('ogpictrain-container');
    this.baseDiv.appendChild(this.imgContainer);

    // loader
    this.loaderContainer    = document.createElement('div');
    this.loaderContainer.id = `${this.baseDiv.id}-loader-container`
    this.loaderElt          = document.createElement('div');

    this.loaderElt.classList.add(`${this.baseDiv.id}-loader`)
    this.loaderContainer.appendChild(this.loaderElt);
    this.baseDiv.appendChild(this.loaderContainer);

    this.initialized = false;
    
    this.#setCssRules();
    // this.#initialize();
    this.rainDown();
  }

  /****** HELPERS ******/

  static shuffle(array) {
    // Fisher-Yates Shuffle
    let counter = array.length;
    while (counter > 0) {
        const randIndex = Math.floor(Math.random() * counter);
        counter--;
        const temp        = array[counter];
        array[counter]    = array[randIndex];
        array[randIndex]  = temp;
    }
    return array;
  }

  #loadAllImages = async () => {
    const promises  = [];
    const images    = [];

    if (this.randomizeImgOrder === true) OgPictureRain.shuffle(this.imageUrls);

    for (let imageUrl of this.imageUrls) {
      promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.src = imageUrl;
        this.imgContainer.appendChild(img);
        images.push(img);
      }));
    }
    await Promise.all(promises);
    return images;
  }
  
  /****** MAIN CODE ******/

  rainDown = async (amount = '0') => {
    if (!this.initialized) await this.#initialize();

    if (this.randomizeDrop === true) OgPictureRain.shuffle(this.images);

    for (const img of this.images) {
      let timeBetweenDrops = (this.images[0] === img) ?
        0 : this.timeBetweenDrops;

      await new Promise(res => {
        setTimeout(() => {
          img.style.transform = `translateY(${amount})`;
          res();
        }, timeBetweenDrops);
      })
    }
  }

  // This is for "inversed rain", if needed
  rainUp = () => {
    this.rainDown('-100%')
  }

  /****** INITIALIZERS ******/

  #setCssRules = () => {
    const style = document.createElement('style');
    const baseDivId = this.baseDiv.id;

    style.innerHTML = `
      #${baseDivId} .ogpictrain-container {
        display: flex;
        width: 100%;
        height: 100%;
      }
      #${baseDivId} .ogpictrain-container img {
        flex: 1 1 0;
        min-width: 0;
        object-fit: cover;
        transform: translateY(-100%);
        transition: transform ${this.dropSpeed}ms ease-out;
      }
      #${baseDivId}-loader-container {
        position: absolute;
        top: 0;
        z-index: 1000;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .${baseDivId}-loader {
        width: 5vh;
        height: 5vh;
        border-radius: 50%;
        animation: ${baseDivId}-loader-spin 1s linear infinite;
      }
      @keyframes ${baseDivId}-loader-spin {
        0% {
          transform: rotate(0deg);
          box-shadow: 0 -2px 0 ${this.loaderColor};
        }
        50% {
          transform: rotate(180deg);
          box-shadow: 0 -2px 0 ${this.loaderColor};
        }
        100% {
          transform: rotate(360deg);
          box-shadow: 0 -2px 0 ${this.loaderColor};
        }
      }
    `;
    document.head.appendChild(style);
  }

  #initialize = async () => {
    this.images       = await this.#loadAllImages();
    this.loaderContainer.remove();
    this.initialized  = true;
  }
}

export { OgPictureRain };