const SOURCE_LIST_ID = 'existing-roadmap-steps';
const QUESTMAP_ID = 'questmap';
const SPINE_ID = 'quest-spine';
const LIVE_REGION_ID = 'questmap-live';

const STATUS_BY_INDEX = ['done', 'done', 'now'];
const STATUS_LABELS = {
  now: 'Status: now – current step',
  done: 'Status: done – completed',
  later: 'Status: later – planned'
};

function toArray(nodeList) {
  return Array.from(nodeList || []);
}

function getReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setupReducedMotionListener(state) {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = (event) => {
    state.prefersReducedMotion = event.matches;
  };
  state.prefersReducedMotion = query.matches;
  if (query.addEventListener) {
    query.addEventListener('change', update);
  } else if (query.addListener) {
    query.addListener(update);
  }
}

function parseRoadmapSteps(section) {
  const list = section.querySelector(`#${SOURCE_LIST_ID}`);
  if (!list) return [];
  const items = toArray(list.children);
  return items
    .map((li, index) => {
      const heading = li.querySelector('h4, h3, h2');
      const desc = li.querySelector('p');
      if (!heading || !desc) return null;
      const id = li.dataset.id || `checkpoint-${index + 1}`;
      const status = STATUS_BY_INDEX[index] || 'later';
      return {
        id,
        title: heading.textContent.trim(),
        description: desc.textContent.trim(),
        theme: li.dataset.theme || 'candle',
        quarter: li.dataset.quarter || 'Q4',
        questStatus: status,
        roadmapStatus: li.dataset.status || 'planned'
      };
    })
    .filter(Boolean);
}

function createLiveRegion(section, requestedId) {
  const existing = requestedId ? document.getElementById(requestedId) : null;
  if (existing) return existing;
  let fallback = section.querySelector(`#${LIVE_REGION_ID}`);
  if (!fallback) {
    fallback = document.createElement('div');
    fallback.id = LIVE_REGION_ID;
    fallback.className = 'sr-only';
    fallback.setAttribute('aria-live', 'polite');
    section.appendChild(fallback);
  }
  return fallback;
}

function statusLabel(status) {
  return STATUS_LABELS[status] || `Status: ${status}`;
}

function buildCheckpointElement(step, index) {
  const orientation = index % 2 === 0 ? 'left' : 'right';
  const item = document.createElement('li');
  item.className = `checkpoint checkpoint--${step.questStatus} checkpoint--${orientation}`;
  item.dataset.status = step.questStatus;
  item.dataset.stepId = step.id;
  item.dataset.orientation = orientation;
  item.setAttribute('role', 'listitem');
  item.tabIndex = 0;

  const titleId = `${step.id}-title`;
  const descId = `${step.id}-desc`;
  item.setAttribute('aria-labelledby', titleId);
  item.setAttribute('aria-describedby', descId);

  const dot = document.createElement('span');
  dot.className = 'checkpoint__dot';
  dot.setAttribute('aria-hidden', 'true');

  const card = document.createElement('article');
  card.className = 'checkpoint__card card-glass';
  card.dataset.theme = step.theme || 'default';
  card.setAttribute('aria-labelledby', titleId);
  card.setAttribute('aria-describedby', descId);

  const statusNode = document.createElement('span');
  statusNode.className = 'checkpoint__status sr-only';
  statusNode.textContent = statusLabel(step.questStatus);
  card.appendChild(statusNode);

  const heading = document.createElement('h3');
  heading.className = 'checkpoint__title';
  heading.id = titleId;
  heading.textContent = step.title;
  card.appendChild(heading);

  const body = document.createElement('p');
  body.className = 'checkpoint__desc';
  body.id = descId;
  body.textContent = step.description;
  card.appendChild(body);

  const controls = document.createElement('div');
  controls.className = 'checkpoint__controls';

  const completeBtn = document.createElement('button');
  completeBtn.type = 'button';
  completeBtn.className = 'btn checkpoint__btn checkpoint__btn--done';
  completeBtn.textContent = 'Complete';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn checkpoint__btn checkpoint__btn--next';
  nextBtn.textContent = 'Next';

  controls.appendChild(completeBtn);
  controls.appendChild(nextBtn);
  card.appendChild(controls);

  item.appendChild(dot);
  item.appendChild(card);

  return {
    root: item,
    dot,
    card,
    statusNode,
    completeBtn,
    nextBtn,
    orientation
  };
}

function updateButtonState(button, disabled) {
  button.disabled = disabled;
  button.setAttribute('aria-disabled', String(disabled));
}

function announce(liveRegion, message) {
  if (!liveRegion) return;
  liveRegion.textContent = '';
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

function scrollEntryIntoView(entry, prefersReducedMotion) {
  if (!entry?.root) return;
  const behavior = prefersReducedMotion ? 'auto' : 'smooth';
  entry.root.scrollIntoView({ behavior, block: 'center', inline: 'nearest' });
}

export function initQuestmap({ hostId, liveRegionId } = {}) {
  const roadmapSection = document.getElementById('roadmap');
  if (!roadmapSection) return null;

  const steps = parseRoadmapSteps(roadmapSection);
  if (!steps.length) return null;

  const container = hostId ? document.getElementById(hostId) : null;
  const questmap = container || document.createElement('div');
  questmap.id = QUESTMAP_ID;
  questmap.className = 'questmap';
  questmap.setAttribute('role', 'region');
  const roadmapHeading = roadmapSection.querySelector('#roadmap-title');
  if (roadmapHeading) {
    questmap.setAttribute('aria-labelledby', roadmapHeading.id);
  } else {
    questmap.setAttribute('aria-label', 'Questmap Checkpoints');
  }
  if (!container) {
    const header = roadmapSection.querySelector('.roadmap__hdr');
    const insertAfter = header?.nextSibling;
    if (insertAfter) {
      header.parentNode.insertBefore(questmap, insertAfter);
    } else {
      roadmapSection.insertBefore(questmap, roadmapSection.firstChild);
    }
  } else {
    questmap.innerHTML = '';
  }

  const spine = document.createElement('div');
  spine.id = SPINE_ID;
  spine.setAttribute('aria-hidden', 'true');
  questmap.appendChild(spine);

  const list = document.createElement('ol');
  list.className = 'questmap__list';
  list.setAttribute('role', 'list');

  questmap.appendChild(list);

  const liveRegion = createLiveRegion(roadmapSection, liveRegionId);

  let initialIndex = steps.findIndex((step) => step.questStatus === 'now');
  if (initialIndex < 0) {
    initialIndex = 0;
    steps[0].questStatus = 'now';
  }

  const state = {
    steps,
    nodes: [],
    currentIndex: initialIndex,
    liveRegion,
    prefersReducedMotion: getReducedMotion()
  };

  setupReducedMotionListener(state);

  steps.forEach((step, index) => {
    const entry = buildCheckpointElement(step, index);
    list.appendChild(entry.root);
    state.nodes.push({
      step,
      ...entry
    });
  });

  function updateStatusIndicators() {
    state.nodes.forEach((entry, index) => {
      const { step, root, statusNode, completeBtn, nextBtn } = entry;
      root.classList.remove('checkpoint--done', 'checkpoint--now', 'checkpoint--later');
      root.classList.add(`checkpoint--${step.questStatus}`);
      root.dataset.status = step.questStatus;
      statusNode.textContent = statusLabel(step.questStatus);

      const isCurrent = index === state.currentIndex;
      const isNow = step.questStatus === 'now';
      if (isCurrent) {
        root.classList.add('is-current');
      } else {
        root.classList.remove('is-current');
      }

      if (isNow) {
        root.setAttribute('aria-current', 'step');
      } else {
        root.removeAttribute('aria-current');
      }

      const isLast = index === state.nodes.length - 1;
      updateButtonState(nextBtn, !isCurrent || !isNow || isLast);
      updateButtonState(completeBtn, !isCurrent || !isNow || step.questStatus === 'done');
    });
  }

  function setCurrent(index, { scroll = false, announceChange = true } = {}) {
    if (index < 0 || index >= state.nodes.length) return;
    const previous = state.nodes[state.currentIndex];
    const target = state.nodes[index];
    const targetWillBeNow = target.step.questStatus !== 'done';

    if (targetWillBeNow && previous && previous !== target && previous.step.questStatus === 'now') {
      previous.step.questStatus = 'later';
    }

    if (targetWillBeNow) {
      target.step.questStatus = 'now';
      state.currentIndex = index;
    }

    if (!targetWillBeNow && target.step.questStatus === 'now') {
      state.currentIndex = index;
    }

    updateStatusIndicators();

    if (announceChange) {
      announce(state.liveRegion, `Opened: ${target.step.title}`);
    }

    try {
      target.root.focus({ preventScroll: scroll });
    } catch (error) {
      target.root.focus();
    }

    if (scroll) {
      scrollEntryIntoView(target, state.prefersReducedMotion);
    }
  }

  function completeCurrent() {
    const entry = state.nodes[state.currentIndex];
    if (!entry || entry.step.questStatus === 'done') return;
    entry.step.questStatus = 'done';
    announce(state.liveRegion, `Completed: ${entry.step.title}`);

    const nextIndex = Math.min(state.currentIndex + 1, state.nodes.length - 1);
    if (nextIndex !== state.currentIndex) {
      const nextEntry = state.nodes[nextIndex];
      if (nextEntry.step.questStatus !== 'done') {
        nextEntry.step.questStatus = 'now';
      }
      setCurrent(nextIndex, { scroll: true, announceChange: true });
    } else {
      updateStatusIndicators();
    }
  }

  state.nodes.forEach((entry, index) => {
    entry.root.addEventListener('click', (event) => {
      if (event.target.closest('.checkpoint__btn')) return;
      setCurrent(index, { scroll: true });
    });

    entry.root.addEventListener('keydown', (event) => {
      if (event.target.closest('.checkpoint__btn')) return;
      switch (event.key) {
        case 'Enter':
        case ' ': {
          event.preventDefault();
          setCurrent(index, { scroll: true });
          break;
        }
        case 'ArrowRight':
        case 'ArrowDown': {
          event.preventDefault();
          setCurrent(Math.min(state.nodes.length - 1, index + 1), { scroll: true });
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          event.preventDefault();
          setCurrent(Math.max(0, index - 1), { scroll: true });
          break;
        }
        case 'Home': {
          event.preventDefault();
          setCurrent(0, { scroll: true });
          break;
        }
        case 'End': {
          event.preventDefault();
          setCurrent(state.nodes.length - 1, { scroll: true });
          break;
        }
        default:
          break;
      }
    });

    entry.completeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      completeCurrent();
    });

    entry.nextBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      setCurrent(Math.min(state.nodes.length - 1, index + 1), { scroll: true });
    });
  });

  updateStatusIndicators();
  const activeEntry = state.nodes[state.currentIndex];
  if (activeEntry) {
    announce(state.liveRegion, `Opened: ${activeEntry.step.title}`);
    activeEntry.root.classList.add('is-current');
  }

  return {
    destroy() {
      questmap.innerHTML = '';
    },
    setCurrent
  };
}
