const historyPane = document.querySelector('[data-history]');
const initialMessages = [...historyPane.children].map(element => element.cloneNode(true));
const optionsPane = document.querySelector('[data-options]');
const step = document.querySelector('[data-step]');
const resetButton = document.querySelector('[data-reset]');

const services = [
  { name: 'Стрижка', minutes: 60, price: 55 },
  { name: 'Борода', minutes: 30, price: 35 },
  { name: 'Стрижка и борода', minutes: 90, price: 80 },
  { name: 'Машинкой', minutes: 30, price: 30 }
];

const dateLabel = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' });
const weekday = new Intl.DateTimeFormat('ru', { weekday: 'long' });
const sampleDays = [
  ['11:00', '13:30', '16:00', '18:30'],
  ['10:30', '14:00', '15:30', '19:00'],
  ['11:30', '13:00', '17:00', '18:00']
].map((times, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  return { label: dateLabel.format(date), day: weekday.format(date), times };
});

let booking = null;

function say(text, sender = 'bot', title = '') {
  const message = document.createElement('div');
  message.className = 'message ' + sender;
  if (title) {
    const heading = document.createElement('strong');
    heading.textContent = title;
    message.append(heading);
  }
  const body = document.createElement('p');
  body.textContent = text;
  message.append(body);
  historyPane.append(message);
}

function answer(text) {
  say(text, 'user');
  resetButton.hidden = false;
}

function offer(label, options, focus = true) {
  step.textContent = label;
  optionsPane.replaceChildren(...options.map(option => {
    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'option' + (option.tone ? ' ' + option.tone : '');
    control.textContent = option.label;
    if (option.note) {
      const note = document.createElement('small');
      note.textContent = option.note;
      control.append(note);
    }
    control.addEventListener('click', option.action);
    return control;
  }));
  historyPane.scrollTop = historyPane.scrollHeight;
  if (focus) optionsPane.firstElementChild?.focus({ preventScroll: true });
}

function chooseService(focus = true) {
  offer('Услуга', services.map(service => ({
    label: service.name,
    note: service.minutes + ' мин · ' + service.price + ' BYN',
    action() {
      answer(service.name);
      chooseDate(service);
    }
  })), focus);
}

function chooseDate(service) {
  say('На какой день посмотрим свободное время?');
  offer('Дата', [
    ...sampleDays.map(date => ({
      label: date.label,
      note: date.day,
      action() {
        answer(date.label);
        chooseTime(service, date);
      }
    })),
    {
      label: booking ? 'Оставить текущую запись' : 'Сменить услугу',
      tone: 'secondary',
      action() {
        if (booking) showBooking('Текущее время сохранено.');
        else {
          say('Хорошо. Выбери другую услугу.');
          chooseService();
        }
      }
    }
  ]);
}

function chooseTime(service, date) {
  const times = date.times.filter(time => booking?.date !== date || booking.time !== time);
  say('Вот свободное время на ' + date.label + '.');
  offer('Время', [
    ...times.map(time => ({
      label: time,
      action() {
        answer(time);
        preview({ service, date, time });
      }
    })),
    { label: 'Другая дата', tone: 'secondary', action: () => chooseDate(service) }
  ]);
}

function summary({ service, date, time }) {
  return service.name + '\n' + date.label + ' в ' + time + '\n' +
    service.minutes + ' мин · ' + service.price + ' BYN';
}

function preview(selection) {
  say(summary(selection), 'bot', 'Проверь детали');
  offer('Подтверждение', [
    {
      label: booking ? 'Подтвердить перенос' : 'Подтвердить запись',
      tone: 'primary',
      action() {
        const moved = Boolean(booking);
        answer(moved ? 'Подтверждаю перенос' : 'Подтверждаю запись');
        booking = selection;
        showBooking(moved ? 'Запись перенесена' : 'Запись подтверждена');
      }
    },
    { label: 'Другое время', tone: 'secondary', action: () => chooseTime(selection.service, selection.date) }
  ]);
}

function showBooking(title) {
  say(summary(booking), 'bot', title);
  offer('Управление записью', [
    {
      label: 'Перенести',
      action() {
        answer('Перенести запись');
        chooseDate(booking.service);
      }
    },
    { label: 'Отменить', tone: 'secondary', action: confirmCancellation }
  ]);
}

function confirmCancellation() {
  answer('Отменить запись');
  say('Отменить запись на ' + booking.date.label + ' в ' + booking.time + '?');
  offer('Подтверждение отмены', [
    {
      label: 'Да, отменить',
      tone: 'primary',
      action() {
        answer('Да, отменить');
        booking = null;
        say('Можно выбрать другое время, когда будет удобно.', 'bot', 'Запись отменена');
        offer('Что дальше?', [
          { label: 'Записаться снова', action: () => chooseService() }
        ]);
      }
    },
    { label: 'Оставить запись', tone: 'secondary', action: () => showBooking('Запись сохранена') }
  ]);
}

resetButton.addEventListener('click', () => {
  booking = null;
  historyPane.replaceChildren(...initialMessages.map(element => element.cloneNode(true)));
  resetButton.hidden = true;
  chooseService();
});

chooseService(false);
