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

// ===== CHATBOT =====
const chatBubble = document.getElementById('chatBubble');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatOptions = document.getElementById('chatOptions');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatInputArea = document.getElementById('chatInputArea');

let chatStep = 'niche';
let chatData = {};

chatBubble.addEventListener('click', () => {
  chatBubble.classList.add('hidden');
  chatPanel.classList.add('open');
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 100);
});

chatClose.addEventListener('click', () => {
  chatPanel.classList.remove('open');
  chatBubble.classList.remove('hidden');
});

function addMessage(text, type = 'ai') {
  const msg = document.createElement('div');
  msg.className = `chat-msg chat-msg-${type}`;
  msg.innerHTML = `<div class="chat-msg-text">${text}</div>`;
  chatMessages.appendChild(msg);
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 50);
}

function setOptions(options) {
  chatOptions.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-opt';
    btn.textContent = opt;
    btn.dataset.val = opt;
    btn.addEventListener('click', () => handleOption(opt));
    chatOptions.appendChild(btn);
  });
  chatOptions.style.display = 'flex';
  chatInputArea.style.display = 'none';
}

function setInput(placeholder) {
  chatOptions.style.display = 'none';
  chatInputArea.style.display = 'flex';
  chatInput.placeholder = placeholder;
  chatInput.disabled = false;
  chatSend.disabled = false;
  chatInput.value = '';
  chatInput.focus();
}

function handleOption(val) {
  if (chatStep === 'niche') {
    chatData.niche = val;
    addMessage(`<b>${val}</b> — отличная ниша! Расскажите, какая у вас главная боль в бизнесе? Что хотите автоматизировать?`, 'ai');
    chatStep = 'pain';
    setInput('Например: обработка заявок, отчётность, поддержка...');
  }
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  chatInput.value = '';

  if (chatStep === 'pain') {
    chatData.pain = text;
    addMessage('Спасибо! Это решаемо. Оставьте, пожалуйста, ваш контакт — мы свяжемся в ближайшее время и покажем, как ИИ-агент решит вашу задачу.', 'ai');
    chatStep = 'contact';
    setInput('Ваш телефон или e-mail');
  } else if (chatStep === 'contact') {
    chatData.contact = text;
    addMessage(`Отлично, мы получили ваши данные! Наш менеджер свяжется с вами в течение 24 часов. Хорошего дня! 🚀`, 'ai');
    chatStep = 'done';
    chatOptions.style.display = 'flex';
    chatOptions.innerHTML = `<button class="chat-opt" onclick="window.location.href='#contact'">Заполнить полный бриф</button>`;
    chatInputArea.style.display = 'none';

    // send data to server
    const payload = {
      niche: chatData.niche || '',
      pain: chatData.pain || '',
      contact: chatData.contact || ''
    };
    fetch('/api/chat-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }
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
