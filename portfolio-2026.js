// On pointing devices, the small character scene responds to the visitor.
const visual = document.querySelector('.hero-visual');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (visual && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  visual.addEventListener('pointermove', event => {
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    visual.style.setProperty('--tilt-x', (-y * 5).toFixed(2) + 'deg');
    visual.style.setProperty('--tilt-y', (x * 6).toFixed(2) + 'deg');
    visual.style.setProperty('--eye-x', (x * 4).toFixed(2) + 'px');
    visual.style.setProperty('--eye-y', (y * 3).toFixed(2) + 'px');
  });
  visual.addEventListener('pointerleave', () => {
    ['--tilt-x','--tilt-y','--eye-x','--eye-y'].forEach(name => visual.style.removeProperty(name));
  });
}
