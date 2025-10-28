import { createQuestCard } from './QuestCard.js';
import { normalizeStatus } from './StatusGlyph.js';

/**
 * @typedef {Object} QuestData
 * @property {string} id - Quest ID
 * @property {string} title - Quest title
 * @property {string} status - Quest status (will be normalized)
 * @property {string} desc - Quest description/body text
 * @property {string} [quarter] - Optional quarter info for meta
 * @property {Array<string>} [tags] - Optional tags for meta
 */

/**
 * Initializes the QuestMap section with detailed quest cards
 * Single centered column, max-width 960-1120px
 * Each card stacked vertically with consistent spacing
 *
 * @param {HTMLElement} container - The container element for the questmap
 * @param {Array<QuestData>} data - Array of quest data
 * @returns {{destroy: () => void}} Object with destroy method for cleanup
 */
export function initQuestMapSection(container, data) {
  if (!container) {
    console.warn('[QuestMapSection] Container element not found');
    return { destroy: () => {} };
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.warn('[QuestMapSection] No data provided');
    return { destroy: () => {} };
  }

  // Clear existing content
  container.innerHTML = '';

  // Add section classes and ARIA attributes
  container.classList.add('questmap-section');
  container.setAttribute('role', 'region');
  container.setAttribute('aria-labelledby', 'questmap-heading');

  // Create heading for the section (for aria-labelledby)
  const heading = document.createElement('h2');
  heading.id = 'questmap-heading';
  heading.className = 'sr-only';
  heading.textContent = 'Detailed Quest Map';
  container.appendChild(heading);

  // Create cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'questmap-cards';
  cardsContainer.setAttribute('role', 'list');

  // Create quest cards
  data.forEach((item) => {
    const normalizedStatus = normalizeStatus(item.status);

    // Build meta string from available data
    let meta = '';
    if (item.quarter) {
      meta += item.quarter;
    }
    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
      if (meta) meta += ' · ';
      meta += item.tags.join(', ');
    }

    const card = createQuestCard({
      title: item.title,
      status: normalizedStatus,
      body: item.desc || '',
      meta: meta || undefined,
      progressRibbonState: normalizedStatus,
      id: item.id
    });

    // Wrap card in list item for semantics
    const listItem = document.createElement('div');
    listItem.setAttribute('role', 'listitem');
    listItem.appendChild(card);

    cardsContainer.appendChild(listItem);
  });

  // Add cards container to main container
  container.appendChild(cardsContainer);

  // Announce to screen readers
  const announcement = `Quest map loaded with ${data.length} detailed quests`;
  announceToScreenReader(announcement);

  // Cleanup function
  return {
    destroy() {
      container.innerHTML = '';
      container.classList.remove('questmap-section');
      container.removeAttribute('role');
      container.removeAttribute('aria-labelledby');
    }
  };
}

/**
 * Announces a message to screen readers via live region
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
  // Check if live region exists, create if not
  let liveRegion = document.getElementById('questmap-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'questmap-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;
}
