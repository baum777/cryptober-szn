const DEFAULT_ROADMAP = [
  {
    id: 'a11y-rotator',
    title: 'A11y: Reduced motion across autoplay',
    desc: 'Disable autoplay across components; add helper.',
    status: 'done',
    quarter: 'Q4',
    col: 'now',
    deps: ['gallery-4x2']
  },
  {
    id: 'gallery-4x2',
    title: 'Gallery 4×2 pagination',
    desc: 'Pager with 8 items per view, adaptive preload.',
    status: 'inprogress',
    quarter: 'Q4',
    col: 'now',
    deps: []
  },
  {
    id: 'left-rail-accordion',
    title: 'Left-rail accordion',
    desc: 'Grouped navigation with keyboard toggle.',
    status: 'inprogress',
    quarter: 'Q4',
    col: 'next',
    deps: []
  },
  {
    id: 'lightbox',
    title: 'Gallery lightbox preview',
    desc: 'Accessible modal preview for gallery items.',
    status: 'planned',
    quarter: 'Q1',
    col: 'later',
    deps: ['gallery-4x2']
  }
];

const q = (sel, el = document) => el.querySelector(sel);
const qa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const liveRegion = () => q('#rm-live');

async function loadRoadmapData() {
  try {
    const response = await fetch('/assets/roadmap.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load roadmap.json: ${response.status}`);
    const payload = await response.json();
    if (Array.isArray(payload) && payload.length) {
      return payload;
    }
  } catch (error) {
    console.warn('[roadmap] Falling back to default data', error);
  }

  return DEFAULT_ROADMAP;
}

const chip = (status) => `<span class="rm-chip ${status}">${status}</span>`;

const chips = (item) => [
  chip(item.status),
  `<span class="rm-chip">${item.quarter}</span>`
].join('');

const depsTemplate = (item, showDeps) => {
  if (!showDeps || !item.deps || item.deps.length === 0) return '';
  const depChips = item.deps.map((dep) => `<span class="rm-chip">${dep}</span>`).join(' ');
  return `<div class="rm-meta">Deps: ${depChips}</div>`;
};

const cardTemplate = (item, showDeps = false) => `
  <article class="rm-card" role="listitem" tabindex="0" data-id="${item.id}">
    <h4 class="rm-title">${item.title}</h4>
    <p class="rm-desc">${item.desc || ''}</p>
    <div class="rm-meta">${chips(item)}</div>
    ${depsTemplate(item, showDeps)}
    <div class="rm-actions">
      <button class="rm-btn" data-move="prev" aria-label="Move to previous column">←</button>
      <button class="rm-btn" data-move="next" aria-label="Move to next column">→</button>
    </div>
  </article>
`;

function renderBoard(data, { status = 'all', quarter = 'all', showDeps = false } = {}) {
  const nowCol = q('#rm-col-now');
  const nextCol = q('#rm-col-next');
  const laterCol = q('#rm-col-later');
  if (!nowCol || !nextCol || !laterCol) return;

  [nowCol, nextCol, laterCol].forEach((col) => {
    col.innerHTML = '';
  });

  const filterMatch = (item) => {
    const statusMatch = status === 'all' || item.status === status;
    const quarterMatch = quarter === 'all' || item.quarter === quarter;
    return statusMatch && quarterMatch;
  };

  data.filter(filterMatch).forEach((item) => {
    const column = item.col === 'next' ? nextCol : item.col === 'later' ? laterCol : nowCol;
    if (column) {
      column.insertAdjacentHTML('beforeend', cardTemplate(item, showDeps));
    }
  });

  const live = liveRegion();
  if (live) {
    const count = qa('.rm-card').length;
    live.textContent = `Showing ${count} items filtered by ${status}/${quarter}.`;
  }
}

function moveItem(data, id, direction) {
  const order = ['now', 'next', 'later'];
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) return;

  const currentIdx = order.indexOf(data[index].col);
  if (currentIdx === -1) return;

  const nextIdx = direction === 'next'
    ? Math.min(currentIdx + 1, order.length - 1)
    : Math.max(currentIdx - 1, 0);

  if (nextIdx !== currentIdx) {
    data[index].col = order[nextIdx];
    const live = liveRegion();
    if (live) {
      live.textContent = `Moved "${data[index].title}" to ${order[nextIdx]}.`;
    }
  }
}

function getFilters() {
  const statusSelect = q('#rm-filter-status');
  const quarterSelect = q('#rm-filter-quarter');
  const depsToggle = q('#rm-toggle-deps');
  return {
    status: statusSelect ? statusSelect.value : 'all',
    quarter: quarterSelect ? quarterSelect.value : 'all',
    showDeps: depsToggle ? depsToggle.getAttribute('aria-pressed') === 'true' : false
  };
}

function bindFilters(data) {
  const statusSelect = q('#rm-filter-status');
  const quarterSelect = q('#rm-filter-quarter');
  const depsToggle = q('#rm-toggle-deps');

  statusSelect?.addEventListener('change', () => renderBoard(data, getFilters()));
  quarterSelect?.addEventListener('change', () => renderBoard(data, getFilters()));
  depsToggle?.addEventListener('click', (event) => {
    const pressed = event.currentTarget.getAttribute('aria-pressed') === 'true';
    event.currentTarget.setAttribute('aria-pressed', String(!pressed));
    renderBoard(data, getFilters());
  });
}

function bindBoard(data) {
  const board = q('#roadmap');
  if (!board) return;

  board.addEventListener('click', (event) => {
    const button = event.target.closest('.rm-btn');
    if (!button) return;
    const card = event.target.closest('.rm-card');
    if (!card) return;

    moveItem(data, card.dataset.id, button.dataset.move);
    renderBoard(data, getFilters());
  });
}

function updateProgress() {
  const dots = qa('.rm-dot');
  const bar = q('.rm-progress');
  if (!dots.length || !bar) return;

  const activeIndex = dots.findIndex((dot) => dot.getAttribute('aria-current') === 'true');
  if (activeIndex === -1 || dots.length === 1) {
    bar.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.12), transparent)';
    return;
  }

  const percentage = (activeIndex / (dots.length - 1)) * 100;
  bar.style.background = `linear-gradient(90deg, var(--rm-accent) ${percentage}%, rgba(255,255,255,0.12) ${percentage}%)`;
}

function bindTimeline(data) {
  const dots = qa('.rm-dot');
  if (!dots.length) return;

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      dots.forEach((d) => d.removeAttribute('aria-current'));
      dot.setAttribute('aria-current', 'true');
      const quarterSelect = q('#rm-filter-quarter');
      if (quarterSelect) {
        quarterSelect.value = dot.dataset.quarter || 'all';
      }
      renderBoard(data, getFilters());
      updateProgress();
    });
  });

  updateProgress();
}

function keyboardMove(data) {
  const board = q('#roadmap');
  if (!board) return;

  board.addEventListener('keydown', (event) => {
    const card = event.target.closest('.rm-card');
    if (!card) return;

    if (event.key === 'ArrowRight') {
      moveItem(data, card.dataset.id, 'next');
      renderBoard(data, getFilters());
      event.preventDefault();
    }
    if (event.key === 'ArrowLeft') {
      moveItem(data, card.dataset.id, 'prev');
      renderBoard(data, getFilters());
      event.preventDefault();
    }
  });
}

async function initRoadmap() {
  const roadmapSection = q('#roadmap');
  if (!roadmapSection) return;

  const source = await loadRoadmapData();
  const data = source.map((item) => ({ ...item }));

  bindFilters(data);
  bindTimeline(data);
  bindBoard(data);
  keyboardMove(data);
  renderBoard(data, getFilters());
  updateProgress();
}

document.addEventListener('DOMContentLoaded', () => {
  initRoadmap();
});
