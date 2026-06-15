// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.section, .clients, .hero-stats, .about-visual, .solutions-grid, .adv-grid, .cases-grid, .process-track').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEls = entry.target.querySelectorAll('.hero-stat-num');
      numEls.forEach(el => {
        const target = parseInt(el.dataset.target);
        if (!target) return;
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current;
        }, 30);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// ===== PARTICLE SYSTEM =====
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['7c3aed', '06d6a0', 'a78bfa', '34d399'];
  const COUNT = 60;

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      r: Math.random() * 2 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${parseInt(p.color.slice(0,2),16)}, ${parseInt(p.color.slice(2,4),16)}, ${parseInt(p.color.slice(4,6),16)}, ${p.alpha})`;
      ctx.fill();
    }

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

// ===== INTELLINE AI AGENT =====
(function initChat() {
  const saved = localStorage.getItem('intelline_chat');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.name) {
        const el = document.querySelector('#chatMessages .chat-msg .chat-msg-text');
        if (el) {
          el.innerHTML = `С возвращением, ${data.name}! 👋 Как у вас дела? Что нового хотите обсудить?`;
        }
      }
    } catch(e) {}
  }
})();
const chatBubble = document.getElementById('chatBubble');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatOptions = document.getElementById('chatOptions');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatInputArea = document.getElementById('chatInputArea');
const chatTyping = document.getElementById('chatTyping');

let agent = {
  context: [],
  user: { niche: '', pain: '', contact: '', name: '' },
  step: 'intro',
  history: []
};

const kb = {
  company: 'Intelline — компания по автоматизации бизнеса с помощью ИИ. Основана в 2019 году. 300+ внедрений. Резидент Сколково.',
  solutions: {
    support: 'ИИ-агенты для поддержки клиентов 24/7. Отвечают на 80% вопросов, эскалируют сложные запросы.',
    routine: 'Автоматизация рутины: ввод данных, сверка отчётов, заполнение документов.',
    crm: 'Интеграция LLM в CRM: умные подсказки, генерация КП, анализ тональности.',
    analytics: 'Аналитика данных с ИИ: отчёты на естественном языке, прогнозы, аномалии.'
  },
  cases: [
    'Кейс: ТехноПром — сократили время обработки заявок в 3 раза (12 мин → 4 мин).',
    'Кейс: МедСофт — ИИ-агент закрывает 30% рутинных задач, конверсия +22%.',
    'Кейс: ЛогисТрейд — автоматизировали 60% отчётности, ошибок -94%.'
  ],
  process: '1. Аудит (3-5 дн) → 2. Проектирование (5-7 дн) → 3. Внедрение (2-4 нед) → 4. Поддержка',
  pricing: 'Стоимость рассчитывается индивидуально под проект. Средний ROI — 3-5 месяцев окупаемости.'
};

function showTyping() { chatTyping.classList.add('show'); scrollChat(); }
function hideTyping() { chatTyping.classList.remove('show'); }

function scrollChat() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function aiReply(text, delay = 800) {
  return new Promise(resolve => {
    showTyping();
    setTimeout(() => {
      hideTyping();
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg-ai';
      msg.innerHTML = `<div class="chat-msg-text">${text}</div>`;
      chatMessages.appendChild(msg);
      agent.history.push({ role: 'assistant', content: text });
      scrollChat();
      resolve();
    }, delay);
  });
}

function userMsg(text) {
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg-user';
  msg.innerHTML = `<div class="chat-msg-text">${text}</div>`;
  chatMessages.appendChild(msg);
  agent.history.push({ role: 'user', content: text });
  scrollChat();
}

function showOptions(list) {
  chatOptions.innerHTML = '';
  list.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'chat-opt';
    btn.textContent = item.label;
    btn.addEventListener('click', () => { hideOptions(); item.action(); });
    chatOptions.appendChild(btn);
  });
  chatOptions.style.display = 'flex';
  chatInputArea.style.display = 'none';
}

function hideOptions() {
  chatOptions.style.display = 'none';
}

function showInput(placeholder, handler) {
  chatInputArea.style.display = 'flex';
  chatInput.placeholder = placeholder;
  chatInput.disabled = false;
  chatSend.disabled = false;
  chatInput.value = '';
  chatInput.focus();
  agent._inputHandler = handler;
}

// ===== KNOWLEDGE MATCHER =====
function matchKnowledge(text) {
  text = text.toLowerCase();
  const pairs = [
    { words: ['цена', 'стоимость', 'сколько', 'бюджет', 'дорого', 'деньги'], resp: kb.pricing },
    { words: ['кес', 'case', 'пример', 'результат', 'цифр'], resp: kb.cases.join('<br>') },
    { words: ['процесс', 'как работ', 'этап', 'шаг', 'срок'], resp: kb.process },
    { words: ['поддержк', 'саппорт', 'чат', 'бот', 'ответ'], resp: kb.solutions.support },
    { words: ['рутин', 'документ', 'отчёт', 'данн'], resp: kb.solutions.routine },
    { words: ['crm', 'amo', 'bitrix', 'срм'], resp: kb.solutions.crm },
    { words: ['аналитик', 'анализ', 'дашборд', 'отчёт', 'график'], resp: kb.solutions.analytics },
    { words: ['компани', 'intelline', 'о вас', 'кто вы'], resp: kb.company },
    { words: ['связь', 'контакт', 'менеджер', 'перезвони'], resp: 'Оставьте контакт — наш менеджер свяжется с вами в течение 24 часов.' }
  ];
  for (const p of pairs) {
    if (p.words.some(w => text.includes(w))) return p.resp;
  }
  return null;
}

// ===== AGENT CORE =====
chatBubble.addEventListener('click', () => {
  chatBubble.classList.add('hidden');
  chatPanel.classList.add('open');
  scrollChat();
  // After opening, show niche selection options
  if (agent.step === 'intro') {
    setTimeout(() => {
      showOptions([
        { label: 'Производство', action: () => setNiche('Производство') },
        { label: 'Ритейл / E-com', action: () => setNiche('Ритейл / E-commerce') },
        { label: 'Логистика', action: () => setNiche('Логистика') },
        { label: 'Услуги', action: () => setNiche('Услуги') },
        { label: 'IT / Финтех', action: () => setNiche('IT / Финтех') },
        { label: 'Другое', action: () => setNiche('Другое') }
      ]);
    }, 600);
  }
});

chatClose.addEventListener('click', () => {
  chatPanel.classList.remove('open');
  chatBubble.classList.remove('hidden');
});

chatSend.addEventListener('click', handleUserInput);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUserInput();
});

function handleUserInput() {
  const text = chatInput.value.trim();
  if (!text) return;
  userMsg(text);
  chatInput.value = '';
  chatInput.disabled = true;
  chatSend.disabled = true;
  processInput(text);
}

async function processInput(text) {
  const knowledge = matchKnowledge(text);

  if (agent.step === 'intro') {
    return;
  }

  if (agent.step === 'niche') {
    const n = text.charAt(0).toUpperCase() + text.slice(1);
    agent.user.niche = n;
    await aiReply(`<b>${n}</b> — отличная ниша! Расскажите, какая задача в бизнесе сейчас болит больше всего? Что хотите автоматизировать?`);
    agent.step = 'pain';
    showInput('Опишите вашу задачу...', null);
    enableInput();
    return;
  }

  if (agent.step === 'pain') {
    agent.user.pain = text;
    const suggestions = getSolution(text);
    await aiReply(suggestions);
    agent.step = 'solution';
    await delay(500);
    showOptions([
      { label: 'Да, интересно!', action: () => askContact() },
      { label: 'Расскажи подробнее', action: () => tellMore() },
      { label: 'Сколько стоит?', action: () => askPrice() }
    ]);
    return;
  }

  if (agent.step === 'solution') {
    if (text.includes('да') || text.includes('интерес') || text.includes('хочу')) {
      askContact();
    } else if (text.includes('цен') || text.includes('сто') || text.includes('бюдж')) {
      askPrice();
    } else if (text.includes('подроб') || text.includes('еще') || text.includes('расскаж')) {
      tellMore();
    } else if (knowledge) {
      await aiReply(knowledge);
      await delay(400);
      showOptions([
        { label: 'Хочу внедрить', action: () => askContact() },
        { label: 'Другой вопрос', action: () => otherQuestion() },
        { label: 'Сколько стоит?', action: () => askPrice() }
      ]);
    } else {
      await aiReply('Я не совсем понял. Могу рассказать о наших решениях, стоимости или сразу передать ваш контакт менеджеру.');
      showOptions([
        { label: 'Рассказать о решениях', action: () => tellMore() },
        { label: 'Сколько стоит?', action: () => askPrice() },
        { label: 'Хочу внедрить', action: () => askContact() }
      ]);
    }
    return;
  }

  if (agent.step === 'contact') {
    agent.user.contact = text;
    const full = agent.user.name ? `, ${agent.user.name}` : '';
    await aiReply(`Спасибо${full}! Мы получили ваш контакт. Наш эксперт свяжется с вами в течение 24 часов и предложит оптимальное решение. Хорошего дня! 🚀`);
    agent.step = 'done';
    hideOptions();
    chatInputArea.style.display = 'none';
    sendLead();
    return;
  }

  if (agent.step === 'name') {
    agent.user.name = text;
    await aiReply(`${text}, приятно познакомиться! Оставьте ваш телефон или email — и мы запустим процесс.`);
    agent.step = 'contact';
    showInput('Ваш телефон или e-mail...', null);
    enableInput();
    return;
  }

  if (agent.step === 'price') {
    if (text.includes('контакт') || text.includes('связ') || text.includes('да') || text.includes('хоч')) {
      askContact();
    } else if (text.includes('друг') || text.includes('нет')) {
      otherQuestion();
    } else if (knowledge) {
      await aiReply(knowledge);
      await delay(400);
      showOptions([
        { label: 'Оставить контакт', action: () => askContact() },
        { label: 'Другой вопрос', action: () => otherQuestion() }
      ]);
    } else {
      await aiReply('Не стесняйтесь спрашивать! Я могу ответить на вопросы о решениях, процессе или стоимости.');
      showOptions([
        { label: 'Оставить контакт', action: () => askContact() },
        { label: 'О решениях', action: () => tellMore() },
        { label: 'О процессе', action: () => { aiReply(kb.process); } }
      ]);
    }
    return;
  }

  if (agent.step === 'tellmore') {
    if (text.includes('поддер') || text.includes('саппорт') || text.includes('чат')) {
      await aiReply(kb.solutions.support + '<br><br>Хотите узнать стоимость или оставить заявку?');
      showOptions([{ label: 'Сколько стоит?', action: () => askPrice() }, { label: 'Оставить контакт', action: () => askContact() }]);
    } else if (text.includes('рутин') || text.includes('докум') || text.includes('отчёт')) {
      await aiReply(kb.solutions.routine + '<br><br>Подходит под вашу задачу?');
      showOptions([{ label: 'Да, оставлю заявку', action: () => askContact() }, { label: 'Что ещё есть?', action: () => tellMore() }]);
    } else if (text.includes('crm') || text.includes('срм') || text.includes('амо')) {
      await aiReply(kb.solutions.crm + '<br><br>Заинтересовало?');
      showOptions([{ label: 'Да', action: () => askContact() }, { label: 'Расскажи о другом', action: () => tellMore() }]);
    } else if (text.includes('аналитик') || text.includes('анализ') || text.includes('дашборд')) {
      await aiReply(kb.solutions.analytics + '<br><br>Хотите попробовать?');
      showOptions([{ label: 'Оставить заявку', action: () => askContact() }, { label: 'Другое решение', action: () => tellMore() }]);
    } else {
      await aiReply('У нас 4 направления:<br><br>1. 🤖 ИИ-поддержка клиентов<br>2. ⚡ Автоматизация рутины<br>3. 🧠 LLM в CRM<br>4. 📊 Аналитика с ИИ<br><br>Какое интересует?');
      showOptions([
        { label: 'ИИ-поддержка', action: () => { aiReply(kb.solutions.support); showExploreOpts(); } },
        { label: 'Автоматизация', action: () => { aiReply(kb.solutions.routine); showExploreOpts(); } },
        { label: 'LLM в CRM', action: () => { aiReply(kb.solutions.crm); showExploreOpts(); } },
        { label: 'Аналитика', action: () => { aiReply(kb.solutions.analytics); showExploreOpts(); } }
      ]);
    }
    return;
  }

  if (knowledge) {
    await aiReply(knowledge);
    enableInput();
    return;
  }

  await aiReply('Интересный вопрос! Если хотите, я могу:<br>• Рассказать о наших решениях<br>• Объяснить процесс внедрения<br>• Назвать стоимость<br>• Передать ваш контакт менеджеру');
  showOptions([
    { label: 'О решениях', action: () => tellMore() },
    { label: 'Стоимость', action: () => askPrice() },
    { label: 'Оставить контакт', action: () => askContact() }
  ]);
}

function enableInput() {
  chatInput.disabled = false;
  chatSend.disabled = false;
  chatInput.focus();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function setNiche(val) {
  agent.user.niche = val;
  userMsg(val);
  chatInput.disabled = true;
  chatSend.disabled = true;
  (async () => {
    await aiReply(`<b>${val}</b> — отличная ниша! Расскажите, какая задача в бизнесе сейчас болит больше всего? Что хотите автоматизировать?`);
    agent.step = 'pain';
    showInput('Опишите вашу задачу...', null);
    enableInput();
  })();
}

function getSolution(pain) {
  const p = pain.toLowerCase();
  if (p.includes('поддерж') || p.includes('клиент') || p.includes('ответ') || p.includes('вопрос') || p.includes('чат') || p.includes('телефон'))
    return 'Отличный запрос! Похоже, вам нужна <b>ИИ-поддержка клиентов</b>. Мы внедряем агентов, которые отвечают на 80% вопросов автоматически 24/7. Среднее время ответа — 3 секунды.';
  if (p.includes('документ') || p.includes('отчёт') || p.includes('сверк') || p.includes('ввод') || p.includes('данн') || p.includes('заполн') || p.includes('бухгалтер'))
    return 'Понимаю! Это классическая задача для <b>автоматизации рутины</b>. Наши ИИ-агенты берут на себя ввод данных, сверку отчётов и заполнение документов — без ошибок и в 10 раз быстрее.';
  if (p.includes('crm') || p.includes('срм') || p.includes('продаж') || p.includes('сделк') || p.includes('менеджер') || p.includes('лид') || p.includes('воронк'))
    return 'Отлично, вам подойдёт <b>интеграция LLM в CRM</b>. Мы встраиваем ИИ прямо в вашу CRM: умные подсказки, автозаполнение, генерация КП и прогноз закрытия сделок.';
  if (p.includes('анализ') || p.includes('аналитик') || p.includes('дашборд') || p.includes('отчёт') || p.includes('прогноз') || p.includes('показател'))
    return 'Прекрасно! Вам нужна <b>аналитика данных с ИИ</b>. Ваши менеджеры задают вопросы на русском языке — ИИ находит ответы в данных и строит прогнозы.';
  return 'Спасибо за описание! Похоже, у нас есть подходящее решение. Могу рассказать подробнее о том, как мы автоматизируем такие задачи с помощью ИИ-агентов.';
}

async function askContact() {
  await aiReply('Отлично! Давайте оформим заявку. Как вас зовут?');
  agent.step = 'name';
  showInput('Ваше имя...', null);
  enableInput();
}

async function tellMore() {
  agent.step = 'tellmore';
  await aiReply('Какое из направлений вас интересует?');
  showOptions([
    { label: 'ИИ-поддержка', action: () => { aiReply(kb.solutions.support).then(() => { showExploreOpts(); }); } },
    { label: 'Автоматизация', action: () => { aiReply(kb.solutions.routine).then(() => { showExploreOpts(); }); } },
    { label: 'LLM в CRM', action: () => { aiReply(kb.solutions.crm).then(() => { showExploreOpts(); }); } },
    { label: 'Аналитика', action: () => { aiReply(kb.solutions.analytics).then(() => { showExploreOpts(); }); } }
  ]);
}

function showExploreOpts() {
  setTimeout(() => {
    showOptions([
      { label: 'Хочу это!', action: () => askContact() },
      { label: 'Что ещё есть?', action: () => tellMore() },
      { label: 'Сколько стоит?', action: () => askPrice() }
    ]);
  }, 500);
}

async function askPrice() {
  agent.step = 'price';
  await aiReply('Стоимость зависит от сложности проекта:<br><br>🔹 <b>Базовый агент</b> — от 150 000 ₽<br>🔹 <b>Средний проект</b> — 300 000 - 600 000 ₽<br>🔹 <b>Комплексное внедрение</b> — от 800 000 ₽<br><br>Точную смету рассчитаем после аудита. Средний ROI — 3-5 месяцев.<br><br>Оставить контакт для расчёта?');
  showOptions([
    { label: 'Да, рассчитайте мне', action: () => askContact() },
    { label: 'Другой вопрос', action: () => otherQuestion() }
  ]);
}

async function otherQuestion() {
  agent.step = 'general';
  await aiReply('Задавайте любой вопрос! Я отвечу как ИИ-агент Intelline. Могу рассказать о решениях, кейсах, процессе или связать с менеджером.');
  showInput('Ваш вопрос...', null);
  enableInput();
}

// ===== LEAD API =====
function sendLead() {
  const payload = {
    name: agent.user.name || '',
    niche: agent.user.niche || '',
    pain: agent.user.pain || '',
    contact: agent.user.contact || ''
  };
  fetch('/api/chat-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
  localStorage.setItem('intelline_chat', JSON.stringify(agent.user));
}

// ===== BRIEF FORM =====
const briefForm = document.getElementById('briefForm');
if (briefForm) {
  briefForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(briefForm);
    const data = Object.fromEntries(formData.entries());
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (res.ok) {
        briefForm.innerHTML = `
          <div style="text-align:center;padding:20px 0;">
            <div style="font-size:3rem;margin-bottom:16px;color:var(--accent);">✓</div>
            <h3 style="margin-bottom:8px;">Спасибо!</h3>
            <p style="color:var(--text2);">Мы получили вашу заявку и свяжемся в течение 24 часов.</p>
          </div>
        `;
      }
    }).catch(() => {});
  });
}

// ===== SMOOTH SCROLL (anchor offset) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
