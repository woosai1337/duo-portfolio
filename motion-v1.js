const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const scene = document.querySelector('.orbit-scene');

if (scene && !motionReduced.matches && window.matchMedia('(pointer: fine)').matches) {
  scene.addEventListener('pointermove', event => {
    const bounds = scene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    scene.style.setProperty('--move-x', (x * 14).toFixed(1) + 'px');
    scene.style.setProperty('--move-y', (y * 14).toFixed(1) + 'px');
  });
  scene.addEventListener('pointerleave', () => {
    scene.style.setProperty('--move-x', '0px');
    scene.style.setProperty('--move-y', '0px');
  });
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    if (motionReduced.matches) return;
    document.querySelectorAll('.project:not([hidden])').forEach((project, index) => {
      project.classList.remove('filter-enter');
      void project.offsetWidth;
      project.style.animationDelay = Math.min(index * 45, 180) + 'ms';
      project.classList.add('filter-enter');
    });
  });
});
