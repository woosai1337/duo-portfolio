const projects = [
  {title:'Тихий свет',description:'Мягкие натуральные оттенки, дерево и пространство для неспешных утренних ритуалов.',image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',alt:'Светлая гостиная с панорамным окном',concept:'Тишина в деталях.',story:'Открытая планировка и натуральные материалы создают спокойный ритм для повседневной жизни.',format:'Квартира',area:'86 м²',mood:'Свет и дерево'},
  {title:'Дом среди деревьев',description:'Зелень за окном, тёплые фактуры и комнаты, открытые друг другу.',image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85',alt:'Интерьер дома в натуральных оттенках',concept:'Ближе к природе.',story:'Мягкие линии и природные оттенки соединяют комнаты с окружающим ландшафтом.',format:'Частный дом',area:'165 м²',mood:'Тепло и природа'},
  {title:'Город в окне',description:'Спокойное пространство для жизни в городе, с вниманием к свету и хранению.',image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',alt:'Современный интерьер городской квартиры',concept:'Город снаружи. Покой внутри.',story:'Чистые формы и продуманное хранение освобождают место для жизни посреди большого города.',format:'Квартира',area:'72 м²',mood:'Город и покой'}
];
const buttons=[...document.querySelectorAll('[data-project]')],picture=document.querySelector('#project-image');
buttons.forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.project),project=projects[index];
  buttons.forEach((other,i)=>{other.classList.toggle('active',i===index);other.setAttribute('aria-pressed',String(i===index));});
  [['project-name','title'],['project-description','description'],['project-concept','concept'],['project-story','story'],['project-format','format'],['project-area','area'],['project-mood','mood']].forEach(([id,key])=>{document.getElementById(id).textContent=project[key];});
  document.querySelector('#project-number').textContent=String(index+1).padStart(2,'0');picture.alt=project.alt;picture.src=project.image;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)picture.animate([{opacity:.45,transform:'scale(1.02)'},{opacity:1,transform:'scale(1)'}],{duration:420,easing:'ease-out'});
}));
