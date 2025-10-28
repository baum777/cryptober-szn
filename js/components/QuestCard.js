import { createStatusGlyph } from './StatusGlyph.js';

/**
 * Creates a detailed quest card for QuestMap view
 * Contains: Header (H3 + StatusGlyph + optional ribbon) + Body + Footer
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The quest title
 * @param {('now'|'next'|'done'|'later')} props.status - The quest status
 * @param {string} props.body - Full descriptive text
 * @param {string} [props.meta] - Optional footer/meta text
 * @param {('now'|'next'|'done'|'later')} [props.progressRibbonState] - Optional progress ribbon state
 * @param {string} [props.id] - Optional ID for the card
 * @returns {HTMLElement} The quest card element
 */
export function createQuestCard({ title, status, body, meta, progressRibbonState, id }) {
  const card = document.createElement('article');
  card.className = 'quest-card card-frosted';

  if (id) {
    card.id = `quest-card-${id}`;
  }

  // Create header section
  const header = document.createElement('header');
  header.className = 'quest-card__header';

  // Create title (H3)
  const heading = document.createElement('h3');
  heading.textContent = title;

  // Create status glyph
  const glyph = createStatusGlyph(status);

  // Add title and glyph to header
  header.appendChild(heading);
  header.appendChild(glyph);

  // Optional progress ribbon
  if (progressRibbonState) {
    const ribbon = document.createElement('div');
    ribbon.className = 'quest-card__ribbon';
    ribbon.setAttribute('aria-label', 'Progress indicator');

    const chip = document.createElement('span');
    chip.className = 'quest-card__ribbon-chip';
    chip.textContent = progressRibbonState.toUpperCase();

    ribbon.appendChild(chip);
    header.appendChild(ribbon);
  }

  // Create body section
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'quest-card__body';
  bodyDiv.textContent = body;

  // Assemble card
  card.appendChild(header);
  card.appendChild(bodyDiv);

  // Optional footer
  if (meta) {
    const footer = document.createElement('footer');
    footer.className = 'quest-card__footer';
    footer.textContent = meta;
    card.appendChild(footer);
  }

  // Add ARIA attributes
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `${title} - Status: ${status}`);

  return card;
}
