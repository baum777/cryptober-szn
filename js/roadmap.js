const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

let DATA = [];
let currentIndex = 0;

const ICONS = {
  candle: '🕯️',
  bull: '📈',
  bear: '📉',
  default: '✦'
};

async function loadData() {
  try {
    const response = await fetch('/assets/roadmap.json', { cache: 'no-store' });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload) && payload.length) {
        return payload;
      }
    }
  } catch (error) {
    console.warn('[roadmap] Failed to load roadmap.json, falling back to DOM', error);
  }

  const list = document.getElementById('existing-roadmap-steps');
  const items = list ? Array.from(list.querySelectorAll('li')) : [];
  if (!items.length) return [];

  return items.map((li, idx) => ({
    id: li.dataset.id || `step-${idx + 1}`,
    title: li.querySelector('h4, h3')?.textContent?.trim() || `Step ${idx + 1}`,
    desc: li.querySelector('p')?.textContent?.trim() || '',
    quarter: li.dataset.quarter || 'Q4',
    status: li.dataset.status || 'planned',
    theme: li.dataset.theme || 'candle',
    tags: Array.from(li.querySelectorAll('.tags li, [data-tag]')).map((node) => node.textContent.trim())
  }));
}

function iconFor(theme) {
  if (!theme) return ICONS.default;
  return ICONS[theme] || ICONS.default;
}

function focusTimelineDot(index) {
  const dots = $$('#rm-dots .rm-dot');
  if (dots[index]) {
    dots[index].focus();
  }
}

function renderDots() {
  const list = $('#rm-dots');
  if (!list) return;

  list.innerHTML = '';
  DATA.forEach((item, index) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rm-dot';
    const detailId = `rm-card-${item.id}`;
    button.dataset.theme = item.theme;
    button.dataset.quarter = item.quarter;
    button.setAttribute('aria-label', `${item.title} (${item.quarter})`);
    button.setAttribute('aria-controls', detailId);
    if (index === currentIndex) {
      button.setAttribute('aria-current', 'true');
    }
    button.innerHTML = iconFor(item.theme);
    button.addEventListener('click', () => {
      const quarterSelect = $('#rm-filter-quarter');
      if (quarterSelect && quarterSelect.value !== 'all') {
        quarterSelect.value = item.quarter;
      }
      setCurrent(index);
    });
    button.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          setCurrent(Math.min(DATA.length - 1, index + 1), { focus: true });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setCurrent(Math.max(0, index - 1), { focus: true });
          break;
        case 'Home':
          event.preventDefault();
          setCurrent(0, { focus: true });
          break;
        case 'End':
          event.preventDefault();
          setCurrent(DATA.length - 1, { focus: true });
          break;
        default:
          break;
      }
    });

    li.appendChild(button);
    list.appendChild(li);
  });
}

function renderDetail() {
  const host = $('#rm-details');
  if (!host) return;

  host.innerHTML = '';
  const item = DATA[currentIndex];
  if (!item) return;

  const article = document.createElement('article');
  article.className = 'rm-card';
  article.id = `rm-card-${item.id}`;
  article.setAttribute('aria-expanded', 'true');

  const header = document.createElement('header');
  header.className = 'rm-card__hdr';

  const title = document.createElement('h3');
  title.className = 'rm-title';
  const icon = document.createElement('span');
  icon.className = 'ico';
  icon.textContent = iconFor(item.theme);
  title.appendChild(icon);
  title.append(` ${item.title}`);

  const meta = document.createElement('div');
  meta.className = 'rm-meta';
  meta.innerHTML = `
    <span class="rm-chip ${item.status}">${item.status}</span>
    <span class="rm-chip">${item.quarter}</span>
    ${item.tags && item.tags.length ? item.tags.map((tag) => `<span class="rm-chip tag-pill">${tag}</span>`).join('') : ''}
  `;

  header.appendChild(title);
  header.appendChild(meta);

  const body = document.createElement('div');
  body.className = 'rm-text';
  body.textContent = item.desc;

  const actions = document.createElement('div');
  actions.className = 'rm-actions';

  const prev = document.createElement('button');
  prev.className = 'rm-btn';
  prev.id = 'rm-prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous milestone');
  prev.textContent = '← Prev';
  prev.addEventListener('click', () => step(-1));

  const next = document.createElement('button');
  next.className = 'rm-btn';
  next.id = 'rm-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next milestone');
  next.textContent = 'Next →';
  next.addEventListener('click', () => step(1));

  actions.appendChild(prev);
  actions.appendChild(next);

  article.appendChild(header);
  article.appendChild(body);
  article.appendChild(actions);

  host.appendChild(article);

  announce(`Opened: ${item.title} (${item.quarter})`);
}

function setCurrent(index, options = {}) {
  const { focus = false } = options;
  currentIndex = Math.max(0, Math.min(DATA.length - 1, index));
  const dots = $$('#rm-dots .rm-dot');
  dots.forEach((dot, idx) => {
    if (idx === currentIndex) {
      dot.setAttribute('aria-current', 'true');
    } else {
      dot.removeAttribute('aria-current');
    }
  });
  renderDetail();
  updateProgress();

  const quarterSelect = $('#rm-filter-quarter');
  if (quarterSelect && quarterSelect.value !== 'all') {
    quarterSelect.value = DATA[currentIndex]?.quarter || quarterSelect.value;
  }

  if (focus) {
    focusTimelineDot(currentIndex);
  }
}

function updateProgress() {
  const bar = $('.rm-progress');
  if (!bar) return;
  if (DATA.length <= 1) {
    bar.style.background = 'linear-gradient(90deg, var(--rm-accent) 0%, rgba(255,255,255,0.12) 0%)';
    return;
  }
  const percentage = (currentIndex / (DATA.length - 1)) * 100;
  bar.style.background = `linear-gradient(90deg, var(--rm-accent) ${percentage}%, rgba(255,255,255,0.12) ${percentage}%)`;
}

function step(delta, { focus = false } = {}) {
  setCurrent(currentIndex + delta, { focus });
}

function announce(message) {
  const live = $('#rm-live');
  if (live) {
    live.textContent = message;
  }
}

function bindControls() {
  const quarterSelect = $('#rm-filter-quarter');
  quarterSelect?.addEventListener('change', (event) => {
    const value = event.currentTarget.value;
    if (value === 'all') {
      setCurrent(0);
      return;
    }
    const targetIndex = DATA.findIndex((item) => item.quarter === value);
    if (targetIndex >= 0) {
      setCurrent(targetIndex);
    }
  });

  const showDoneToggle = $('#rm-toggle-showdone');
  showDoneToggle?.addEventListener('click', (event) => {
    const pressed = event.currentTarget.getAttribute('aria-pressed') === 'true';
    event.currentTarget.setAttribute('aria-pressed', String(!pressed));
    const dots = $$('#rm-dots .rm-dot');
    dots.forEach((dot, idx) => {
      const done = DATA[idx]?.status === 'done';
      dot.classList.toggle('is-dimmed', !pressed && done);
    });
    announce(!pressed ? 'Hiding completed milestones.' : 'Showing completed milestones.');
  });

  document.addEventListener('keydown', (event) => {
    if (!DATA.length) return;
    const tag = event.target.tagName;
    if (['INPUT', 'TEXTAREA'].includes(tag)) return;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        step(1, { focus: true });
        break;
      case 'ArrowLeft':
        event.preventDefault();
        step(-1, { focus: true });
        break;
      case 'Home':
        event.preventDefault();
        setCurrent(0, { focus: true });
        break;
      case 'End':
        event.preventDefault();
        setCurrent(DATA.length - 1, { focus: true });
        break;
      default:
        break;
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const roadmapSection = document.getElementById('roadmap');
  if (!roadmapSection) return;

  DATA = await loadData();
  if (!DATA.length) return;

  setCurrent(0);
  renderDots();
  renderDetail();
  updateProgress();
  bindControls();
  announce(`Loaded ${DATA.length} roadmap steps.`);
});
