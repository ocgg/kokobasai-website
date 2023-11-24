class OgCarousel {
  // private fields (set in constructor)
  #mainContainer        = null; // DOM element
  #thumbnailsContainer  = null; // DOM element
  #imageUrls            = null; // array of strings
  #images               = [];   // array of <img> elements
  #thumbnails           = [];   // array of <img> elements
  #currentImgId         = null; // integer
  #loader               = null; // DOM element

  constructor(args) {
    // required
    this.#mainContainer       = document.getElementById(args.mainContainerId);
    this.#thumbnailsContainer = document.getElementById(args.thumbnailsContainerId);
    this.#imageUrls           = args.imageUrls;

    // optionnal
    this.transitionTimeInMs = args.transitionTimeInMs || 300;
    this.thumbnailColor     = args.thumbnailColor     || 'rgba(0,0,0,0.5)';
    this.arrowButtonColor   = args.arrowButtonColor   || 'rgba(0,0,0,0.5)';
    this.loaderColor        = args.loaderColor        || 'rgba(0,0,0,0.5)';
    // this.thumbnailWidth     = args.thumbnailWidth     || '100px';
    // this.thumbnailHeight    = args.thumbnailHeight    || '100px';
    this.stayTimeInMs       = args.stayTimeInMs       || 1000;

    // internal
    this.isRunning = true;
    this.runningIntervalId = null; // set in #run()
    // CSS
    // if (!document.head.querySelector("style#ogcar-style")) this.#initCSS();
    this.#initCSS();
    this.#loader = this.#generateLoaderElement();
    this.#carouselInit();
    this.#run();
  }

  /****** HELPERS ******/

  #waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  #getNextImgId = () => {
    return (this.#currentImgId === this.#images.length - 1) ?
      0 : this.#currentImgId + 1;
  }
  #getPreviousImgId = () => {
    return this.#currentImgId === 0 ?
      this.#images.length - 1 : this.#currentImgId - 1;
  }

  /****** MAIN ******/

  #pointerEventsTo = (value) => {
    this.#mainContainer.style.pointerEvents = value;
    this.#thumbnailsContainer.style.pointerEvents = value;
  }

  #triggerTransition = async (previous, next) => {
    this.#pointerEventsTo('none');
    next.classList.add('ogcar-opacity-0');
    setTimeout(() => {
      previous.classList.add('ogcar-opacity-0');
      next.classList.remove('ogcar-opacity-0');
    }, 0);
    
    // transition end & cancel events being buggy on Firefox (118), use this
    await this.#waitFor(this.transitionTimeInMs);

    this.#mainContainer.removeChild(previous);
    previous.classList.remove('ogcar-opacity-0');
    this.#pointerEventsTo('auto');
  };

  #highlightThumbnail = (imageId) => {
    const previous  = this.#thumbnailsContainer.querySelector(".ogcar-thumbnail-active");
    const next      = this.#thumbnails[imageId];

    if (previous) previous.classList.remove("ogcar-thumbnail-active");
    next.classList.add("ogcar-thumbnail-active");
  };

  #setCurrentImage = (imageId, firstTimeInit = false) => {
    const previous  = this.#mainContainer.lastChild;
    const next      = this.#images[imageId];
    if (previous === next) return;

    this.#highlightThumbnail(imageId);
    this.#currentImgId = imageId;
    this.#mainContainer.appendChild(next);

    if (!firstTimeInit) this.#triggerTransition(previous, next);
  };

  #manageClick = (imageId) => {
    if (this.isRunning) {
      clearInterval(this.runningIntervalId);
      this.isRunning = false;
    }

    this.#setCurrentImage(imageId);
  }

  #run = () => {
    this.runningIntervalId = setInterval(() => {
      this.#setCurrentImage(this.#getNextImgId());
    }, this.stayTimeInMs + this.transitionTimeInMs);
  }

  /****** INITIALIZERS ******/

  #generateCarouselButtons = () => {
    ['left', 'right'].forEach(side => {
      const btnContainer = document.createElement('div');
      btnContainer.classList
        .add('ogcar-btn-container', `ogcar-${side}-btn-container`);

      const btn = document.createElement('div');
      btn.classList.add('ogcar-btn', `ogcar-${side}-btn`);
      btn.innerHTML = (side === 'left') ? '<' : '>';
      btnContainer.appendChild(btn);

      const clickTargetId = (side === 'left') ?
        this.#getPreviousImgId : this.#getNextImgId;
      btnContainer.onmouseup = () => this.#manageClick(clickTargetId());

      this.#mainContainer.appendChild(btnContainer);
    });
  }

  #generateImage = (url, index) => {
    const image = new Image();
    image.src = url;
    image.dataset.ogcarId = index;
    return image;
  }

  #generateThumbnailFor = (image, index) => {
    const thumbnail = image.cloneNode();
    thumbnail.classList.add("ogcar-thumbnail");
    thumbnail.onmouseup = () => this.#manageClick(index);
    return thumbnail;
  }

  #loadImages = async () => {
    const promises  = [];
    let   index     = 0;

    for (let url of this.#imageUrls) {
      promises.push(new Promise(resolve => {
        const image = this.#generateImage(url, index);
        image.onload = resolve;
        this.#images.push(image);

        const thumbnail = this.#generateThumbnailFor(image, index);
        this.#thumbnailsContainer.appendChild(thumbnail);
        this.#thumbnails.push(thumbnail);

        index++;
      }));
    }
    await Promise.all(promises);
  }

  #carouselInit = async () => {
    await this.#loadImages();

    this.#loader.remove();

    this.#generateCarouselButtons();
    this.#setCurrentImage(0, true);
  }

  #generateLoaderElement = () => {
    const loaderContainer = document.createElement('div');
          loaderContainer.id = `${this.#mainContainer.id}-loader-container`;
    const loaderElt = document.createElement('div');
          loaderElt.classList.add(`${this.#mainContainer.id}-loader`);
    loaderContainer.appendChild(loaderElt);
    this.#mainContainer.appendChild(loaderContainer);
    return loaderContainer;
  }

  #generateMainContainerCss = () => {
    const mainContainerId = this.#mainContainer.id;
    return `
      #${mainContainerId} {
        height: 100%;
        width: 100%;
        position: relative;
        overflow: hidden;
      }
      #${mainContainerId} img {
        position: absolute;
        height: 100%;
        width: 100%;
        object-fit: contain;
        transition: filter ${this.transitionTimeInMs}ms linear;
      }
      #${mainContainerId} img.ogcar-opacity-0 { filter: opacity(0%) }
      #${mainContainerId} .ogcar-btn-container {
        position: absolute;
        width: 20%;
        height: 100%;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      #${mainContainerId} .ogcar-btn-container:hover {
        background-color: rgba(0, 0, 0, .2);
        cursor: pointer;
      }
      #${mainContainerId} .ogcar-btn-container:hover div { opacity: 1; }
      #${mainContainerId} .ogcar-left-btn-container { left: 0; }
      #${mainContainerId} .ogcar-right-btn-container { right: 0; }
      #${mainContainerId} .ogcar-btn {
        height: fit-content;
        color: ${this.arrowButtonColor};
        opacity: 50%;
        font-size: 2em;
        user-select: none;
      }
    `;
  };

  #generateThumbnailsCSS = () => {
    const thumbsContainerId = this.#thumbnailsContainer.id;
    return `
      #${thumbsContainerId} img.ogcar-thumbnail:hover { cursor: pointer }
    `;
  };

  #generateLoaderCSS = () => {
    const mainContainerId = this.#mainContainer.id;
    return `
      #${mainContainerId}-loader-container {
        position: absolute;
        height: inherit;
        width: inherit;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .${mainContainerId}-loader {
        width: 5vh;
        height: 5vh;
        border-radius: 50%;
        animation: ${mainContainerId}-loader-spin 1s linear infinite;
      }
      @keyframes ${mainContainerId}-loader-spin {
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
  }

  #initCSS = () => {
    const styleSheet = document.createElement("style");
    styleSheet.id = `ogcar-style-${this.#mainContainer}`;
    styleSheet.innerHTML =
      this.#generateMainContainerCss()
      + this.#generateThumbnailsCSS()
      + this.#generateLoaderCSS();

    document.head.appendChild(styleSheet);
  }
}

export { OgCarousel };