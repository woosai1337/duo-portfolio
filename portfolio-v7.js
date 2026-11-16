const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cases = [...document.querySelectorAll('.case')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    filterButtons.forEach(option => {
      const active = option === button;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });
    cases.forEach(project => {
      project.hidden = selected !== 'all' && project.dataset.category !== selected;
      if (!project.hidden) project.classList.add('seen');
    });
  });
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('js-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('seen');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

const scene = document.querySelector('.hero-visual');
if (scene && !reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  scene.addEventListener('pointermove', event => {
    const bounds = scene.getBoundingClientRect();
    scene.style.setProperty('--x', ((event.clientX - bounds.left) / bounds.width - .5) * 15 + 'px');
    scene.style.setProperty('--y', ((event.clientY - bounds.top) / bounds.height - .5) * 15 + 'px');
  });
  scene.addEventListener('pointerleave', () => {
    scene.style.setProperty('--x', '0px');
    scene.style.setProperty('--y', '0px');
  });
}

const projectKinds = document.querySelectorAll('input[name="project-kind"]');
const contacts = document.querySelectorAll('[data-contact]');

projectKinds.forEach(input => {
  input.addEventListener('change', () => {
    const message = 'Привет! Хочу обсудить проект. Направление: ' + input.value + '.';
    contacts.forEach(link => {
      link.href = 'https://t.me/' + link.dataset.contact + '?text=' + encodeURIComponent(message);
    });
  });
});
