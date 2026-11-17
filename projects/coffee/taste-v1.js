const tasteButtons = [...document.querySelectorAll('[data-taste]')];
const tasteCards = [...document.querySelectorAll('[data-product]')];
const tasteStatus = document.querySelector('[data-taste-status]');
tasteButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.taste;
  tasteButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  tasteCards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.product !== selected; });
  tasteStatus.textContent = selected === 'all' ? 'Показываем все сорта' : 'Подобрали для тебя: ' + document.querySelector(`[data-product="${selected}"] h3`).textContent;
}));
