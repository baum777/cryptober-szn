/**
 * CYBERPUNK NEON ROADMAP/QUESTMAP MODULE
 * 
 * Handles rendering of:
 * 1. Timeline Section (top): Quick scan with H3 + StatusGlyph, alternating cards
 * 2. QuestMap Section (below): Deep read with H3 + full descriptions
 * 
 * Both sections use the same milestone data from roadmap.json
 */

// Status enum: "now" | "next" | "later" | "done"
const STATUS_MAP = {
  inprogress: 'now',
  planned: 'later',
  done: 'done',
  // fallback
  now: 'now',
  next: 'next',
  later: 'later'
};

/**
 * Map roadmap.json status to component status
 */
function normalizeStatus(rawStatus) {
  return STATUS_MAP[rawStatus] || 'later';
}

/**
 * Load milestone data from roadmap.json
 */
async function loadMilestones() {
  try {
    const response = await fetch('/assets/roadmap.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.warn('[neon-roadmap] Failed to load roadmap.json', error);
  }
  return [];
}

/**
 * Create StatusGlyph element
 */
function createStatusGlyph(status) {
  const glyph = document.createElement('span');
  glyph.className = 'status-glyph';
  glyph.setAttribute('data-status', status);
  glyph.setAttribute('aria-hidden', 'true');
  return glyph;
}

/**
 * Create RoadmapStepCard (for Timeline section)
 * Contains ONLY H3 + StatusGlyph
 */
function createRoadmapStepCard(milestone, index) {
  const status = normalizeStatus(milestone.status);
  const isLeft = index % 2 === 0;
  
  const card = document.createElement('article');
  card.className = `roadmap-step-card roadmap-step-card--${isLeft ? 'left' : 'right'}`;
  card.setAttribute('role', 'listitem');
  if (status === 'now') {
    card.setAttribute('aria-current', 'step');
  }
  
  const header = document.createElement('div');
  header.className = 'roadmap-step-card__header';
  
  const glyph = createStatusGlyph(status);
  
  const title = document.createElement('h3');
  title.className = 'roadmap-step-card__title';
  title.textContent = milestone.title;
  
  // Screen reader status announcement
  const srStatus = document.createElement('span');
  srStatus.className = 'sr-only';
  const statusText = {
    now: 'current step',
    next: 'next step',
    done: 'completed step',
    later: 'upcoming step'
  };
  srStatus.textContent = ` — ${statusText[status]}`;
  title.appendChild(srStatus);
  
  header.appendChild(glyph);
  header.appendChild(title);
  card.appendChild(header);
  
  return card;
}

/**
 * Create QuestCard (for QuestMap section)
 * Contains H3 + StatusGlyph + body description + optional meta
 */
function createQuestCard(milestone) {
  const status = normalizeStatus(milestone.status);
  
  const card = document.createElement('article');
  card.className = 'quest-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('data-status', status);
  if (status === 'now') {
    card.setAttribute('aria-current', 'step');
  }
  
  // Header with glyph and title
  const header = document.createElement('div');
  header.className = 'quest-card__header';
  
  const glyph = createStatusGlyph(status);
  
  const title = document.createElement('h3');
  title.className = 'quest-card__title';
  title.textContent = milestone.title;
  
  // Screen reader status
  const srStatus = document.createElement('span');
  srStatus.className = 'sr-only';
  const statusText = {
    now: 'current step',
    next: 'next step',
    done: 'completed step',
    later: 'upcoming step'
  };
  srStatus.textContent = ` — ${statusText[status]}`;
  title.appendChild(srStatus);
  
  header.appendChild(glyph);
  header.appendChild(title);
  card.appendChild(header);
  
  // Body text
  if (milestone.desc) {
    const body = document.createElement('p');
    body.className = 'quest-card__body';
    body.textContent = milestone.desc;
    card.appendChild(body);
  }
  
  // Optional meta (quarter, tags)
  if (milestone.quarter || (milestone.tags && milestone.tags.length)) {
    const meta = document.createElement('div');
    meta.className = 'quest-card__meta';
    const metaParts = [];
    if (milestone.quarter) metaParts.push(milestone.quarter);
    if (milestone.tags && milestone.tags.length) {
      metaParts.push(milestone.tags.join(' · '));
    }
    meta.textContent = metaParts.join(' · ');
    card.appendChild(meta);
  }
  
  return card;
}

/**
 * Render Timeline Section (top)
 */
function renderTimeline(milestones, container) {
  if (!container) return;
  
  const timelineContainer = document.createElement('div');
  timelineContainer.className = 'timeline-container';
  timelineContainer.setAttribute('role', 'list');
  timelineContainer.setAttribute('aria-label', 'Roadmap timeline');
  
  // Add spine
  const spine = document.createElement('div');
  spine.className = 'timeline-spine';
  spine.setAttribute('aria-hidden', 'true');
  timelineContainer.appendChild(spine);
  
  // Add cards (alternating left/right)
  milestones.forEach((milestone, index) => {
    const card = createRoadmapStepCard(milestone, index);
    timelineContainer.appendChild(card);
  });
  
  container.innerHTML = '';
  container.appendChild(timelineContainer);
}

/**
 * Render QuestMap Section (below)
 */
function renderQuestMap(milestones, container) {
  if (!container) return;
  
  const questmapContainer = document.createElement('div');
  questmapContainer.className = 'questmap-container';
  questmapContainer.setAttribute('role', 'list');
  questmapContainer.setAttribute('aria-label', 'Detailed quest map');
  
  milestones.forEach((milestone) => {
    const card = createQuestCard(milestone);
    questmapContainer.appendChild(card);
  });
  
  container.innerHTML = '';
  container.appendChild(questmapContainer);
}

/**
 * Initialize both Timeline and QuestMap sections
 */
export async function initNeonRoadmap() {
  const timelineSection = document.getElementById('neon-timeline');
  const questmapSection = document.getElementById('neon-questmap');
  
  if (!timelineSection && !questmapSection) {
    console.log('[neon-roadmap] No timeline or questmap containers found');
    return null;
  }
  
  const milestones = await loadMilestones();
  
  if (!milestones.length) {
    console.warn('[neon-roadmap] No milestones loaded');
    return null;
  }
  
  console.log(`[neon-roadmap] Loaded ${milestones.length} milestones`);
  
  // Render Timeline (top) - quick scan
  if (timelineSection) {
    renderTimeline(milestones, timelineSection);
  }
  
  // Render QuestMap (below) - deep read
  if (questmapSection) {
    renderQuestMap(milestones, questmapSection);
  }
  
  return {
    destroy() {
      if (timelineSection) timelineSection.innerHTML = '';
      if (questmapSection) questmapSection.innerHTML = '';
    }
  };
}

/**
 * Auto-initialize on DOMContentLoaded
 */
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initNeonRoadmap();
  });
}
