// --- Eyeball Tracking Logic ---
document.addEventListener('DOMContentLoaded', function () {
  const leftEyeball = document.querySelector('.eyeball.left');
  const rightEyeball = document.querySelector('.eyeball.right');
  const leftEyeSocket = document.querySelector('.eye-socket.left');
  const rightEyeSocket = document.querySelector('.eye-socket.right');
  const maxOffset = 6; // px
  let isIdleAnimating = false;
  // --- Animation Speeds ---
  const zombieAnimationSpeed = 100; // ms per frame
  const handAnimationSpeed = 50;   // ms per frame
  function getOriginalPosition(side) {
    const root = getComputedStyle(document.documentElement);
    return {
      top: parseInt(root.getPropertyValue(`--eye-${side}-top`)),
      left: parseInt(root.getPropertyValue(`--eye-${side}-left`)),
    };
  }
  const leftOrigin = getOriginalPosition('left');
  const rightOrigin = getOriginalPosition('right');
  // Mousemove handler for eyeball tracking
  function eyeballMouseMove(e) {
    if (isIdleAnimating) return;
    const bg = document.getElementById('background-img');
    if (!bg) return;
    const rect = bg.getBoundingClientRect();
    // Mouse position relative to the background image
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    function calcOffset(origin) {
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const sensitivity = 3;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy) * sensitivity, maxOffset);
      return {
        top: origin.top + Math.sin(angle) * dist,
        left: origin.left + Math.cos(angle) * dist,
      };
    }
    if (leftEyeball) {
      const leftOffset = calcOffset(leftOrigin);
      leftEyeball.style.top = `${leftOffset.top}px`;
      leftEyeball.style.left = `${leftOffset.left}px`;
    }
    if (rightEyeball) {
      const rightOffset = calcOffset(rightOrigin);
      rightEyeball.style.top = `${rightOffset.top}px`;
      rightEyeball.style.left = `${rightOffset.left}px`;
    }
  }
  document.addEventListener('mousemove', eyeballMouseMove);

  // Prevent right-click, context menu, and drag on images
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  document.addEventListener('mousedown', function(e) {
    if (e.button !== 0) e.preventDefault();
  });
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', function(e) {
      e.preventDefault();
    });
  });

  // --- Zombie Idle Animation ---
  const zombieImg = document.getElementById('zombie-img');
  const idleFrames = [
    'assets/zombie_idle01.png',
    'assets/zombie_idle02.png',
    'assets/zombie_idle03.png',
    'assets/zombie_idle04.png',
    'assets/zombie_idle05.png',
    'assets/zombie_idle06.png',
    'assets/zombie_idle07.png',
    'assets/zombie_idle08.png',
    'assets/zombie_idle09.png',
    'assets/zombie_idle10.png',
    'assets/zombie_idle11.png',
    'assets/zombie_idle12.png',
    'assets/zombie_idle13.png',
    'assets/zombie_idle14.png',
  ];
  const idleFrames2x = idleFrames.map(f => f.replace('.png', '@2x.png'));
  const allFramesToLoad = [...idleFrames, ...idleFrames2x];
  let idleFrameIdx = 0;
  let idleInterval = null;
  let idleFramesLoaded = false;
  function preloadIdleFrames(callback) {
    let loaded = 0;
    allFramesToLoad.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === allFramesToLoad.length) {
          idleFramesLoaded = true;
          if (callback) callback();
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === allFramesToLoad.length) {
          idleFramesLoaded = true;
          if (callback) callback();
        }
      };
      img.src = src;
    });
  }
  function updateIdleEyePositions(frameIndex) {
    if (!leftEyeball || !rightEyeball || !leftEyeSocket || !rightEyeSocket) return;
    const totalFrames = idleFrames.length;
    const progress = (frameIndex / (totalFrames - 1)) * Math.PI;
    const sinProgress = Math.sin(progress);
    const leftOffsetX = sinProgress * -14;
    const leftOffsetY = sinProgress * 12;
    const rightOffsetX = sinProgress * -15;
    const rightOffsetY = sinProgress * 3;
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
  function startZombieIdle() {
    isIdleAnimating = true;
    if (!zombieImg) return;
    if (!idleFramesLoaded) {
      preloadIdleFrames(startZombieIdle);
      return;
    }
    if (idleInterval) clearInterval(idleInterval);
    idleInterval = null;
    function setFrame(index) {
      const frame1x = idleFrames[index];
      const frame2x = idleFrames2x[index];
      zombieImg.src = frame1x;
      zombieImg.srcset = `${frame1x} 1x, ${frame2x} 2x`;
    }
    idleFrameIdx = 0;
    setFrame(idleFrameIdx);
    idleInterval = setInterval(() => {
      idleFrameIdx = (idleFrameIdx + 1) % idleFrames.length;
      setFrame(idleFrameIdx);
      updateIdleEyePositions(idleFrameIdx);
    }, zombieAnimationSpeed);
  }
  function stopZombieIdle() {
    isIdleAnimating = false;
    if (idleInterval) clearInterval(idleInterval);
    idleInterval = null;
    resetEyePositions();
  }

  // --- Hand Animation ---
  const handImg = document.getElementById('hand-img');
  const handFrames = [
    'assets/zombie_hand01.png',
    'assets/zombie_hand02.png',
    'assets/zombie_hand03.png',
    'assets/zombie_hand04.png',
    'assets/zombie_hand05.png',
  ];
  const handFrames2x = handFrames.map(f => f.replace('.png', '@2x.png'));
  const allHandFramesToLoad = [...handFrames, ...handFrames2x];
  let handFrameIdx = 0;
  let handInterval = null;
  let handFramesLoaded = false;
  function preloadHandFrames(callback) {
    if (handFramesLoaded) {
      if (callback) callback();
      return;
    }
    let loaded = 0;
    allHandFramesToLoad.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === allHandFramesToLoad.length) {
          handFramesLoaded = true;
          if (callback) callback();
        }
      };
      img.src = src;
    });
  }
  function startHandAnimation() {
    if (!handImg) return;
    if (handInterval) clearInterval(handInterval);
    
    function setFrame(index) {
      const frame1x = handFrames[index];
      const frame2x = handFrames2x[index];
      handImg.src = frame1x;
      handImg.srcset = `${frame1x} 1x, ${frame2x} 2x`;
    }

    handFrameIdx = 0;
    setFrame(handFrameIdx);

    handInterval = setInterval(() => {
      handFrameIdx++;
      if (handFrameIdx < handFrames.length) {
        setFrame(handFrameIdx);
      } else {
        clearInterval(handInterval);
        handInterval = null;
      }
    }, handAnimationSpeed);
  }
  function stopHandAnimation() {
    if (handInterval) clearInterval(handInterval);
    handInterval = null;
  }

  // --- Random Eyeball Logic ---
  const brainsEyeball = document.getElementById('brains-eyeball');
  const eyeballOptions = [
    { src: 'assets/eyeball_response_yes.png', probability: 0.495 },
    { src: 'assets/eyeball_response_no.png', probability: 0.495 },
    { src: 'assets/eyeball_response_maybe.png', probability: 0.01 },
  ];
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
    let loaded = 0;
    allEyeballOptionsToLoad.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === allEyeballOptionsToLoad.length) {
          eyeballOptionsLoaded = true;
          if (callback) callback();
        }
      };
      img.src = src;
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
  let sceneResultActive = false;
  function updateSceneVisibility() {
    if (sceneResultActive) {
      document.body.classList.add('scene-result-active');
      stopZombieIdle();
      
      const rootStyles = getComputedStyle(document.documentElement);
      const dropDurationStr = rootStyles.getPropertyValue('--eyeball-drop-duration').trim();
      const dropDurationMs = parseFloat(dropDurationStr) * 505;

      setTimeout(() => {
        startHandAnimation();
      }, dropDurationMs);

      setRandomEyeballImage();
    } else {
      document.body.classList.remove('scene-result-active');
      startZombieIdle();
      stopHandAnimation();
    }
  }
  updateSceneVisibility();
  document.addEventListener('click', function(e) {
    if (e.button !== 0) return;
    sceneResultActive = !sceneResultActive;
    updateSceneVisibility();
  });

  // --- Fullscreen and Scaling Logic ---
  function resize() {
    const container = document.querySelector('.container');
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const scaleX = window.innerWidth / 320; // 320 is base width
    const scaleY = window.innerHeight / 480; // 480 is base height
    const scale = Math.min(scaleX, scaleY);
    container.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  window.addEventListener('resize', resize);
  resize(); // Initial resize on load

  // Preload both idle and hand frames immediately when page loads
  Promise.all([
    new Promise(resolve => preloadIdleFrames(resolve)),
    new Promise(resolve => preloadHandFrames(resolve)),
    new Promise(resolve => preloadEyeballOptions(resolve))
  ]).then(() => {
    // Start initial idle animation once everything is loaded
    startZombieIdle();
  });
}); 