const headingSelectors = "h1, h2, h3, h4, h5, h6";
const CTA_SELECTORS = [
  'a.btn-primary',
  'button.btn-primary',
  'a.btn',
  'button.btn',
  '[data-primary="true"]',
  'a[href][role="button"]',
  'button[type="button"]',
  'a[href]'
];

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'step';
}

function removeIds(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
  node.removeAttribute('id');
  $all('[id]', node).forEach((child) => child.removeAttribute('id'));
}

function getHeading(section) {
  const heading = section.querySelector(headingSelectors);
  if (heading) return heading;

  const ariaLabelledBy = section.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const label = document.getElementById(ariaLabelledBy);
    if (label) {
      return label;
    }
  }

  const ariaLabel = section.getAttribute('aria-label');
  if (ariaLabel) {
    const proxy = document.createElement('span');
    proxy.textContent = ariaLabel;
    proxy.dataset.virtual = 'true';
    return proxy;
  }

  console.warn('[questmap] Section is missing a heading', section);
  return null;
}

function getParagraph(section) {
  const paragraphs = $all('p, .lead, [data-lead]', section);
  const candidate = paragraphs.find((p) => p.textContent && p.textContent.trim().length);
  if (candidate) return candidate;
  console.warn('[questmap] Section is missing a description paragraph', section);
  return null;
}

function collectTags(section) {
  const tags = [];
  const nodes = $all('.chip, .tag-pill, .tag, [data-tag], .tags li', section);
  nodes.forEach((node) => {
    const text = node.textContent;
    if (!text) return;
    tags.push(text);
  });

  if (!tags.length && section.id === 'tools') {
    $all('.card h3', section).forEach((node) => {
      const text = node.textContent;
      if (!text) return;
      tags.push(text);
    });
  }

  if (!tags.length && section.id === 'social-pyramid') {
    $all('.pyramid-label > div:first-child', section).forEach((node) => {
      const text = node.textContent;
      if (!text) return;
      tags.push(text);
    });
  }

  return tags;
}

function getFirstImage(section) {
  return section.querySelector('img');
}

function getPrimaryLink(section) {
  for (const selector of CTA_SELECTORS) {
    const candidate = section.querySelector(selector);
    if (candidate) return candidate;
  }
  return null;
}

function determineTheme(section) {
  if (section.dataset.theme) return section.dataset.theme;
  if (section.classList.contains('hero')) return 'candle';
  if (section.id === 'roadmap') return 'bull';
  if (section.id === 'social-pyramid') return 'candle';
  return 'default';
}

function createTitleNode(titleEl) {
  if (!titleEl) return null;
  const levelMatch = titleEl.tagName?.match(/^H(\d)$/i);
  const level = levelMatch ? Number(levelMatch[1]) : 3;
  const wrapper = document.createElement('div');
  wrapper.className = 'quest-step__title';
  wrapper.setAttribute('role', 'heading');
  wrapper.setAttribute('aria-level', String(level));
  Array.from(titleEl.childNodes).forEach((child) => {
    wrapper.appendChild(child.cloneNode(true));
  });
  return wrapper;
}

function createDescNode(descEl) {
  if (!descEl) return null;
  const container = document.createElement('div');
  container.className = 'quest-step__desc';
  container.appendChild(descEl.cloneNode(true));
  return container;
}

function createTagsNode(tagTexts) {
  if (!tagTexts || !tagTexts.length) return null;
  const list = document.createElement('div');
  list.className = 'quest-step__tags';
  tagTexts.forEach((text) => {
    const chip = document.createElement('span');
    chip.className = 'quest-tag';
    chip.textContent = text;
    list.appendChild(chip);
  });
  return list;
}

function createMediaNode(mediaEl) {
  if (!mediaEl) return null;
  const clone = mediaEl.cloneNode(true);
  removeIds(clone);
  clone.classList.add('quest-step__media');
  return clone;
}

function createLinkNode(linkEl) {
  if (!linkEl) return null;
  const isAnchor = linkEl.tagName === 'A';
  const element = document.createElement(isAnchor ? 'a' : 'button');
  element.className = 'quest-step__cta';
  if (isAnchor) {
    element.href = linkEl.getAttribute('href') || '#';
    if (linkEl.target) element.target = linkEl.target;
    if (linkEl.rel) element.rel = linkEl.getAttribute('rel');
  } else {
    element.type = linkEl.getAttribute('type') || 'button';
  }
  Array.from(linkEl.attributes).forEach((attr) => {
    if (attr.name.startsWith('aria-')) {
      element.setAttribute(attr.name, attr.value);
    }
  });
  if (!isAnchor && (linkEl.disabled || linkEl.getAttribute('aria-disabled') === 'true')) {
    element.disabled = true;
    element.setAttribute('aria-disabled', 'true');
  }
  element.textContent = linkEl.textContent;
  return element;
}

function extractStage(section, index) {
  const titleEl = getHeading(section);
  if (!titleEl) return null;
  const descEl = getParagraph(section);
  if (!descEl) return null;
  const tags = collectTags(section);
  const mediaEl = getFirstImage(section);
  const linkEl = getPrimaryLink(section);
  const id = section.id || slugify(titleEl.textContent || `stage-${index + 1}`);

  return {
    id,
    index,
    section,
    titleEl,
    descEl,
    tags,
    mediaEl,
    linkEl,
    theme: determineTheme(section),
    status: index === 0 ? 'now' : 'later',
  };
}

function buildStepElement(stage) {
  const item = document.createElement('li');
  item.className = 'quest-step';
  item.dataset.status = stage.status;
  item.dataset.stepId = stage.id;
  item.setAttribute('role', 'listitem');
  item.tabIndex = 0;

  const marker = document.createElement('div');
  marker.className = 'quest-step__marker';
  marker.setAttribute('aria-hidden', 'true');

  const body = document.createElement('article');
  body.className = 'quest-step__body';
  body.dataset.theme = stage.theme || 'default';

  const header = document.createElement('div');
  header.className = 'quest-step__header';

  const titleNode = createTitleNode(stage.titleEl);
  if (titleNode) header.appendChild(titleNode);

  body.appendChild(header);

  const descNode = createDescNode(stage.descEl);
  const tagsNode = createTagsNode(stage.tags);
  const mediaNode = createMediaNode(stage.mediaEl);
  const linkNode = createLinkNode(stage.linkEl);

  if (descNode) body.appendChild(descNode);
  if (tagsNode) body.appendChild(tagsNode);
  if (mediaNode) body.appendChild(mediaNode);
  if (linkNode) body.appendChild(linkNode);

  const controls = document.createElement('div');
  controls.className = 'quest-step__controls';

  const completeBtn = document.createElement('button');
  completeBtn.type = 'button';
  completeBtn.className = 'quest-step__action quest-step__action--done';
  completeBtn.textContent = 'Abschließen';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'quest-step__action quest-step__action--next';
  nextBtn.textContent = 'Weiter';

  controls.appendChild(completeBtn);
  controls.appendChild(nextBtn);
  body.appendChild(controls);

  item.appendChild(marker);
  item.appendChild(body);

  return {
    root: item,
    marker,
    body,
    completeBtn,
    nextBtn,
    linkNode,
  };
}

function announce(liveRegion, message) {
  if (!liveRegion) return;
  liveRegion.textContent = '';
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

export function initQuestmap({
  hostId,
  liveRegionId,
} = {}) {
  const roadmapSection = document.getElementById('roadmap');
  if (!roadmapSection) return null;
  const main = document.getElementById('site-main');
  if (!main) return null;

  const sections = Array.from(main.children).filter((node) => node.tagName === 'SECTION');
  const stages = sections
    .map((section, index) => extractStage(section, index))
    .filter(Boolean);

  if (!stages.length) return null;

  const host = hostId ? document.getElementById(hostId) : null;
  const headerSibling = roadmapSection.querySelector('.roadmap__hdr');
  const renderHost = host || document.createElement('div');
  renderHost.classList.add('questmap');
  renderHost.setAttribute('role', 'list');
  renderHost.setAttribute('aria-label', 'Questmap Schritte');

  if (!host) {
    if (headerSibling) {
      headerSibling.insertAdjacentElement('afterend', renderHost);
    } else {
      roadmapSection.insertBefore(renderHost, roadmapSection.firstChild);
    }
  } else {
    renderHost.innerHTML = '';
  }

  const liveRegion = liveRegionId
    ? document.getElementById(liveRegionId)
    : roadmapSection.querySelector('#questmap-live');

  let liveNode = liveRegion;
  if (!liveNode) {
    liveNode = document.createElement('div');
    liveNode.id = liveRegionId || 'questmap-live';
    liveNode.className = 'sr-only';
    liveNode.setAttribute('aria-live', 'polite');
    roadmapSection.appendChild(liveNode);
  }

  const list = document.createElement('ol');
  list.className = 'questmap__list';
  list.setAttribute('role', 'list');

  const state = {
    stages,
    currentIndex: 0,
    nodes: [],
    liveRegion: liveNode,
  };

  stages.forEach((stage) => {
    const stepNode = buildStepElement(stage);
    state.nodes.push({ stage, ...stepNode });
    list.appendChild(stepNode.root);
  });

  renderHost.appendChild(list);

  function updateStatusIndicators() {
    state.nodes.forEach((entry, index) => {
      const { stage, root, completeBtn, nextBtn } = entry;
      root.dataset.status = stage.status;
      const isCurrent = index === state.currentIndex;
      if (isCurrent) {
        root.setAttribute('aria-current', 'step');
        root.classList.add('is-current');
      } else {
        root.removeAttribute('aria-current');
        root.classList.remove('is-current');
      }
      const isDone = stage.status === 'done';
      const completeDisabled = isDone || !isCurrent;
      completeBtn.disabled = completeDisabled;
      completeBtn.setAttribute('aria-disabled', String(completeDisabled));
      const isLast = index >= stages.length - 1;
      const nextDisabled = isLast || !isCurrent;
      nextBtn.disabled = nextDisabled;
      nextBtn.setAttribute('aria-disabled', String(nextDisabled));
    });
  }

  function setCurrent(index, { announceChange = true } = {}) {
    if (index < 0 || index >= state.nodes.length) return;
    const previous = state.nodes[state.currentIndex];
    const requested = state.nodes[index];

    if (
      previous &&
      previous !== requested &&
      previous.stage.status === 'now' &&
      requested.stage.status !== 'done'
    ) {
      previous.stage.status = 'later';
    }

    if (requested.stage.status !== 'done') {
      requested.stage.status = 'now';
    }

    let resolvedIndex = index;
    if (!state.nodes.some((entry) => entry.stage.status === 'now')) {
      const fallback = state.nodes.find((entry) => entry.stage.status !== 'done');
      if (fallback) {
        fallback.stage.status = 'now';
        resolvedIndex = state.nodes.indexOf(fallback);
      }
    }

    state.currentIndex = resolvedIndex;
    updateStatusIndicators();

    const active = state.nodes[state.currentIndex];

    if (announceChange) {
      const titleText = active.stage.titleEl?.textContent?.trim() || active.stage.id;
      announce(state.liveRegion, `Opened: ${titleText}`);
    }

    active.root.focus();
  }

  function completeCurrent() {
    const entry = state.nodes[state.currentIndex];
    if (!entry) return;
    if (entry.stage.status === 'done') return;

    entry.stage.status = 'done';
    updateStatusIndicators();
    const titleText = entry.stage.titleEl?.textContent?.trim() || entry.stage.id;
    announce(state.liveRegion, `Completed: ${titleText}`);

    const nextIndex = Math.min(state.currentIndex + 1, state.nodes.length - 1);
    if (nextIndex !== state.currentIndex) {
      setCurrent(nextIndex);
    } else {
      updateStatusIndicators();
    }
  }

  state.nodes.forEach((entry, index) => {
    entry.root.addEventListener('click', (event) => {
      if (event.target.closest('.quest-step__action')) return;
      setCurrent(index);
    });

    entry.root.addEventListener('keydown', (event) => {
      if (event.target.closest('.quest-step__action')) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setCurrent(index);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrent(Math.min(state.nodes.length - 1, index + 1));
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrent(Math.max(0, index - 1));
      }
    });

    entry.completeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      completeCurrent();
    });

    entry.nextBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      setCurrent(Math.min(state.nodes.length - 1, index + 1));
    });
  });

  updateStatusIndicators();
  announce(state.liveRegion, `Opened: ${state.nodes[0].stage.titleEl?.textContent?.trim() || stages[0].id}`);

  return {
    destroy() {
      renderHost.innerHTML = '';
    },
    setCurrent,
  };
}
