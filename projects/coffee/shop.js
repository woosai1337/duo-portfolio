const products = {
  morning: { name: 'Мягкое утро', price: 32 },
  sun: { name: 'Яркий день', price: 39 },
  night: { name: 'Долгий вечер', price: 36 }
};
const cart = [];
const dialog = document.querySelector('.cart');
const items = document.querySelector('[data-cart-items]');
const count = document.querySelector('[data-cart-count]');
const total = document.querySelector('[data-total]');
const toast = document.querySelector('[data-toast]');
const checkout = document.querySelector('[data-checkout]');
let toastTimer;

function announce(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

function button(label, accessibleName, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.setAttribute('aria-label', accessibleName);
  element.addEventListener('click', action);
  return element;
}

function render() {
  count.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  total.textContent = cart.reduce((sum, item) => sum + item.quantity * products[item.id].price, 0) + ' BYN';
  checkout.disabled = cart.length === 0;
  items.replaceChildren();
  if (!cart.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Здесь пока пусто. Выбери кофе в каталоге.';
    items.append(empty);
    return;
  }
  cart.forEach(item => {
    const product = products[item.id];
    const line = document.createElement('div');
    line.className = 'cart-item';
    const info = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = product.name;
    const details = document.createElement('p');
    details.textContent = item.grind + ' · 250 г';
    const price = document.createElement('span');
    price.textContent = product.price * item.quantity + ' BYN';
    info.append(name, details, price);
    const controls = document.createElement('div');
    controls.className = 'quantity';
    const number = document.createElement('span');
    number.textContent = item.quantity;
    controls.append(
      button('−', 'Уменьшить количество: ' + product.name, () => {
        item.quantity -= 1;
        if (item.quantity === 0) cart.splice(cart.indexOf(item), 1);
        render();
      }),
      number,
      button('+', 'Увеличить количество: ' + product.name, () => {
        item.quantity += 1;
        render();
      })
    );
    line.append(info, controls);
    items.append(line);
  });
}

document.querySelectorAll('[data-add]').forEach(control => {
  control.addEventListener('click', () => {
    const card = control.closest('[data-product]');
    const id = card.dataset.product;
    const grind = card.querySelector('[data-grind]').value;
    const existing = cart.find(item => item.id === id && item.grind === grind);
    if (existing) existing.quantity += 1;
    else cart.push({ id, grind, quantity: 1 });
    render();
    announce(products[id].name + ' добавлен в корзину');
  });
});

document.querySelector('[data-open-cart]').addEventListener('click', () => {
  render();
  dialog.showModal();
});
document.querySelector('[data-close-cart]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
checkout.addEventListener('click', () => {
  announce('Демо: заказ не отправлен. Корзина остаётся доступной.');
  dialog.close();
});
render();
