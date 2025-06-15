// --- Eyeball Tracking Logic ---
document.addEventListener('DOMContentLoaded', function () {
  const leftEyeball = document.querySelector('.eyeball.left');
  const rightEyeball = document.querySelector('.eyeball.right');
  const maxOffset = 6; // px
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

  // --- Click Handler for Scene Transition ---
  function handleSceneTransition(e) {
    // Only allow left click
    if (e.button !== 0) return;
    // Change background and zombie image
    const bg = document.getElementById('background-img');
    if (bg) bg.src = 'assets/hand_bg.png';
    const zombie = document.getElementById('zombie-img');
    if (zombie) zombie.src = 'assets/hand.png';
    // Remove all eye_socket and eyeball images
    document.querySelectorAll('.eye-socket, .eyeball').forEach(el => el.remove());
    // Remove mousemove listener
    document.removeEventListener('mousemove', eyeballMouseMove);
    // Show the brains eyeball overlay with animation
    const brainsEyeball = document.getElementById('brains-eyeball');
    if (brainsEyeball) {
      // Reset animation
      brainsEyeball.classList.remove('animated');
      void brainsEyeball.offsetWidth;
      brainsEyeball.classList.add('animated');
    }
    document.removeEventListener('click', handleSceneTransition);
  }
  document.addEventListener('click', handleSceneTransition);

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
}); 