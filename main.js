// --- Eyeball Tracking Logic ---
document.addEventListener('DOMContentLoaded', function () {
  // --- Configuration ---
  const config = {
    animations: {
      zombieSpeed: 100, // ms per frame
      handSpeed: 50, // ms per frame
      idleFrames: [
        'assets/zombie_idle01.png', 'assets/zombie_idle02.png', 'assets/zombie_idle03.png',
        'assets/zombie_idle04.png', 'assets/zombie_idle05.png', 'assets/zombie_idle06.png',
        'assets/zombie_idle07.png', 'assets/zombie_idle08.png', 'assets/zombie_idle09.png',
        'assets/zombie_idle10.png', 'assets/zombie_idle11.png', 'assets/zombie_idle12.png',
        'assets/zombie_idle13.png', 'assets/zombie_idle14.png',
      ],
      stabbingFrames: [
        'assets/zombie_stab01.png', 'assets/zombie_stab02.png',
        'assets/zombie_stab03.png', 'assets/zombie_stab04.png'
      ],
      handFrames: [
        'assets/zombie_hand01.png', 'assets/zombie_hand02.png', 'assets/zombie_hand03.png',
        'assets/zombie_hand04.png', 'assets/zombie_hand05.png',
      ],
    },
    scene: {
      transitionDelay: 600, // ms
    },
    eyeball: {
      maxOffset: 6, // px for mouse tracking
      idleLeftOffsetX: -14,
      idleLeftOffsetY: 12,
      idleRightOffsetX: -15,
      idleRightOffsetY: 3,
      options: [
        { src: 'assets/eyeball_response_yes.png', probability: 0.495 },
        { src: 'assets/eyeball_response_no.png', probability: 0.495 },
        { src: 'assets/eyeball_response_maybe.png', probability: 0.01 },
      ],
    },
    layout: {
      baseWidth: 320,
      baseHeight: 480,
      mobileResizeSettleDelay: 100, // ms
    },
  };

  // --- DOM Elements ---
  const zombieImg = document.getElementById('zombie-img');
  const handImg = document.getElementById('hand-img');
  const brainsEyeball = document.getElementById('brains-eyeball');
  const leftEyeball = document.querySelector('.eyeball.left');
  const rightEyeball = document.querySelector('.eyeball.right');
  const leftEyeSocket = document.querySelector('.eye-socket.left');
  const rightEyeSocket = document.querySelector('.eye-socket.right');

  // --- State ---
  let isIdleAnimating = false;
  let isTransitioning = false;
  let sceneResultActive = false;
  const leftOrigin = getOriginalPosition('left');
  const rightOrigin = getOriginalPosition('right');

  // --- Utility Functions ---
  function getOriginalPosition(side) {
    const root = getComputedStyle(document.documentElement);
    return {
      top: parseInt(root.getPropertyValue(`--eye-${side}-top`)),
      left: parseInt(root.getPropertyValue(`--eye-${side}-left`)),
    };
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  // --- Event Listeners Setup ---
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('mousedown', e => { if (e.button !== 0) e.preventDefault(); });
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // --- Image Preloader ---
  function preloadImages(sources, callback) {
    if (!sources || sources.length === 0) {
      if (callback) callback();
      return;
    }
    let loaded = 0;
    sources.forEach(src => {
      const image = new Image();
      image.onload = image.onerror = () => {
        loaded++;
        if (loaded === sources.length) {
          if (callback) callback();
        }
      };
      image.src = src;
    });
  }

  // --- Animation Player Factory ---
  function createAnimationPlayer({ img, frames, speed, loop = false, onFrame, onEnd }) {
    const frames2x = frames.map(f => f.replace('.png', '@2x.png'));
    const allFramesToLoad = [...frames, ...frames2x];
    let frameIdx = 0;
    let interval = null;
    let framesLoaded = false;
  
    function preload(callback) {
      if (framesLoaded) {
        if (callback) callback();
        return;
      }
      preloadImages(allFramesToLoad, () => {
        framesLoaded = true;
        if (callback) callback();
      });
    }
  
    function setFrame(index) {
      if (!img) return;
      const frame1x = frames[index];
      const frame2x = frames2x[index];
      img.src = frame1x;
      img.srcset = `${frame1x} 1x, ${frame2x} 2x`;
      if (onFrame) onFrame(index);
    }
  
    function start() {
      if (!img) return;
      if (!framesLoaded) {
        preload(start);
        return;
      }
      stop(); 
      frameIdx = 0;
      setFrame(frameIdx);
  
      interval = setInterval(() => {
        frameIdx++;
        if (frameIdx < frames.length) {
          setFrame(frameIdx);
        } else {
          if (loop) {
            frameIdx = 0;
            setFrame(frameIdx);
          } else {
            stop();
            if (onEnd) onEnd();
          }
        }
      }, speed);
    }
  
    function stop() {
      if (interval) clearInterval(interval);
      interval = null;
    }
  
    return { preload, start, stop };
  }

  // --- Zombie Idle Animation ---
  const idleFrames = config.animations.idleFrames;

  function updateIdleEyePositions(frameIndex) {
    if (!leftEyeball || !rightEyeball || !leftEyeSocket || !rightEyeSocket) return;
    const totalFrames = idleFrames.length;
    const progress = (frameIndex / (totalFrames - 1)) * Math.PI;
    const sinProgress = Math.sin(progress);
    const leftOffsetX = sinProgress * config.eyeball.idleLeftOffsetX;
    const leftOffsetY = sinProgress * config.eyeball.idleLeftOffsetY;
    const rightOffsetX = sinProgress * config.eyeball.idleRightOffsetX;
    const rightOffsetY = sinProgress * config.eyeball.idleRightOffsetY;
    leftEyeball.style.top = `${leftOrigin.top + leftOffsetY}px`;
    leftEyeball.style.left = `${leftOrigin.left + leftOffsetX}px`;
    leftEyeSocket.style.top = `${leftOrigin.top + leftOffsetY}px`;
    leftEyeSocket.style.left = `${leftOrigin.left + leftOffsetX}px`;
    rightEyeball.style.top = `${rightOrigin.top + rightOffsetY}px`;
    rightEyeball.style.left = `${rightOrigin.left + rightOffsetX}px`;
    rightEyeSocket.style.top = `${rightOrigin.top + rightOffsetY}px`;
    rightEyeSocket.style.left = `${rightOrigin.left + rightOffsetX}px`;
  }
  function resetEyePositions() {
    if (!leftEyeball || !rightEyeball || !leftEyeSocket || !rightEyeSocket) return;
    leftEyeball.style.top = `${leftOrigin.top}px`;
    leftEyeball.style.left = `${leftOrigin.left}px`;
    leftEyeSocket.style.top = `${leftOrigin.top}px`;
    leftEyeSocket.style.left = `${leftOrigin.left}px`;
    rightEyeball.style.top = `${rightOrigin.top}px`;
    rightEyeball.style.left = `${rightOrigin.left}px`;
    rightEyeSocket.style.top = `${rightOrigin.top}px`;
    rightEyeSocket.style.left = `${rightOrigin.left}px`;
  }
  const zombieIdlePlayer = createAnimationPlayer({
    img: zombieImg,
    frames: idleFrames,
    speed: config.animations.zombieSpeed,
    loop: true,
    onFrame: updateIdleEyePositions
  });
  function startZombieIdle() {
    isIdleAnimating = true;
    zombieIdlePlayer.start();
  }
  function stopZombieIdle() {
    isIdleAnimating = false;
    zombieIdlePlayer.stop();
    resetEyePositions();
  }

  // --- Stabbing Animation ---
  const stabbingFrames = config.animations.stabbingFrames;

  const zombieStabPlayer = createAnimationPlayer({
    img: zombieImg,
    frames: stabbingFrames,
    speed: config.animations.zombieSpeed,
    loop: false
  });

  function startStabbingAnimation() {
    zombieStabPlayer.start();
  }
  function stopStabbingAnimation() {
    zombieStabPlayer.stop();
  }

  // --- Hand Animation ---
  const handFrames = config.animations.handFrames;

  const handPlayer = createAnimationPlayer({
    img: handImg,
    frames: handFrames,
    speed: config.animations.handSpeed,
    loop: false
  });
  function startHandAnimation() {
    handPlayer.start();
  }
  function stopHandAnimation() {
    handPlayer.stop();
  }

  // --- Random Eyeball Logic ---
  const eyeballOptions = config.eyeball.options;
  const allEyeballOptionsToLoad = eyeballOptions.flatMap(opt => [
    opt.src,
    opt.src.replace('.png', '@2x.png'),
  ]);
  let eyeballOptionsLoaded = false;

  function preloadEyeballOptions(callback) {
    if (eyeballOptionsLoaded) {
      if (callback) callback();
      return;
    }
    preloadImages(allEyeballOptionsToLoad, () => {
      eyeballOptionsLoaded = true;
      if (callback) callback();
    });
  }

  function setRandomEyeballImage() {
    if (!brainsEyeball) return;

    if (!eyeballOptionsLoaded) {
      preloadEyeballOptions(setRandomEyeballImage);
      return;
    }

    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedOption;

    for (const option of eyeballOptions) {
      cumulativeProbability += option.probability;
      if (rand < cumulativeProbability) {
        selectedOption = option;
        break;
      }
    }

    const src1x = selectedOption.src;
    const src2x = src1x.replace('.png', '@2x.png');

    brainsEyeball.src = src1x;
    brainsEyeball.srcset = `${src1x} 1x, ${src2x} 2x`;
  }

  // --- Scene Toggle Handler ---
  async function updateSceneVisibility() {
    isTransitioning = true;

    if (sceneResultActive) {
      stopZombieIdle();
      startStabbingAnimation();

      const animationDuration = stabbingFrames.length * config.animations.zombieSpeed;

      await wait(animationDuration + config.scene.transitionDelay);

      document.body.classList.add('scene-result-active');
      setRandomEyeballImage();

      const rootStyles = getComputedStyle(document.documentElement);
      const dropDurationStr = rootStyles.getPropertyValue('--eyeball-drop-duration').trim();
      const handDropDurationMs = parseFloat(dropDurationStr) * 450;
      await wait(handDropDurationMs);
      startHandAnimation();

    } else {
      document.body.classList.remove('scene-result-active');
      startZombieIdle();
      stopStabbingAnimation();
      stopHandAnimation();
    }

    isTransitioning = false;
  }
  updateSceneVisibility();
  document.addEventListener('click', function(e) {
    if (e.button !== 0) return;
    if (isTransitioning) return;
    sceneResultActive = !sceneResultActive;
    updateSceneVisibility();
  });

  // --- Fullscreen and Scaling Logic ---
  function resize() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    // Use visual viewport for more accurate mobile sizing
    const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    const scaleX = viewportWidth / config.layout.baseWidth;
    const scaleY = viewportHeight / config.layout.baseHeight;
    // Use max scale to fill screen completely
    const scale = Math.max(scaleX, scaleY);
    container.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  // Handle all possible viewport changes
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
    window.visualViewport.addEventListener('scroll', resize);
  }
  
  // Initial resize
  resize();

  // Force resize after orientation changes and initial load
  window.addEventListener('load', () => {
    resize();
    // Some mobile browsers need a moment to settle
    setTimeout(resize, config.layout.mobileResizeSettleDelay);
  });

  // Preload all assets
  Promise.all([
    new Promise(resolve => zombieIdlePlayer.preload(resolve)),
    new Promise(resolve => zombieStabPlayer.preload(resolve)),
    new Promise(resolve => handPlayer.preload(resolve)),
    new Promise(resolve => preloadEyeballOptions(resolve))
  ]).then(() => {
    // Start initial idle animation once everything is loaded
    startZombieIdle();
  });
}); 