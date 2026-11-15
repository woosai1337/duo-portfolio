const picker = document.querySelector('[data-picker]');
if (picker) {
  const buttons = [...picker.querySelectorAll('button')];

  function select(button) {
    if (button.getAttribute('aria-pressed') === 'true') return;
    for (const option of buttons) {
      const active = option === button;
      option.setAttribute('aria-pressed', String(active));
      const panel = document.getElementById(option.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !active;
      }
    }

    if (button.dataset.scene) {
      const photo = document.querySelector('.hero-media img');
      photo.srcset = button.dataset.sceneSet;
      photo.src = button.dataset.scene;
      photo.alt = button.dataset.description;
      photo.decode().then(() => {
        if (button.getAttribute('aria-pressed') !== 'true') return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        photo.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 360 });
      }).catch(() => {});
    }
  }

  picker.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button) select(button);
  });

  const requested = buttons.find(button => button.getAttribute('aria-controls') === location.hash.slice(1));
  if (requested) select(requested);
}

const range = document.querySelector('[data-compare]');
if (range) {
  const photo = document.querySelector('.compare');
  range.addEventListener('input', () => photo.style.setProperty('--split', range.value + '%'));
}

const booking = document.querySelector('[data-booking]');
if (booking) {
  const output = document.querySelector('[data-confirmation]');
  const today = new Date();
  const localDate = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(today);
  const year = localDate.find(part => part.type === 'year').value;
  const month = localDate.find(part => part.type === 'month').value;
  const day = localDate.find(part => part.type === 'day').value;
  const dateField = booking.elements.date;
  if (dateField) dateField.min = [year, month, day].join('-');

  const chosen = new URLSearchParams(location.search).get('choice');
  const choiceField = booking.elements.choice;
  if ([...choiceField.options].some(option => option.value === chosen)) choiceField.value = chosen;

  booking.addEventListener('submit', event => {
    event.preventDefault();
    const parts = [];
    for (const field of booking.querySelectorAll('select, input')) {
      if (!field.value) continue;
      const label = field.labels[0].querySelector('span').textContent;
      let value = field.value;
      if (field.type === 'date') {
        value = new Intl.DateTimeFormat('ru', { dateStyle: 'long' }).format(new Date(value + 'T12:00:00'));
      }
      parts.push(label + ' — ' + value);
    }
    output.querySelector('[data-summary]').textContent = parts.join(' · ');
    output.hidden = false;
    booking.hidden = true;
    output.querySelector('h2').focus();
  });
  output.querySelector('button').addEventListener('click', () => {
    output.hidden = true;
    booking.hidden = false;
    choiceField.focus();
  });
}

const alias = document.querySelector('[data-legacy-links]');
if (alias) {
  const redirect = JSON.parse(alias.dataset.legacyLinks)[location.hash.slice(1)];
  if (redirect) location.replace(redirect);
}
