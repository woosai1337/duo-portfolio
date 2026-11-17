const projects = [
  {
    title: 'Тихий свет',
    description: 'Мягкие натуральные оттенки, дерево и пространство для неспешных утренних ритуалов.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
    alt: 'Светлая гостиная с панорамным окном'
  },
  {
    title: 'Дом среди деревьев',
    description: 'Зелень за окном, тёплые фактуры и комнаты, открытые друг другу.',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85',
    alt: 'Интерьер дома в натуральных оттенках'
  },
  {
    title: 'Город в окне',
    description: 'Спокойное пространство для жизни в городе, с вниманием к свету и хранению.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
    alt: 'Современный интерьер городской квартиры'
  }
];

const buttons = [...document.querySelectorAll('[data-project]')];
const picture = document.querySelector('#project-image');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.project);
    const project = projects[index];
    buttons.forEach((other, i) => {
      other.classList.toggle('active', i === index);
      other.setAttribute('aria-pressed', String(i === index));
    });
    document.querySelector('#project-name').textContent = project.title;
    document.querySelector('#project-description').textContent = project.description;
    picture.alt = project.alt;
    picture.src = project.image;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      picture.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: 380 });
    }
  });
});
