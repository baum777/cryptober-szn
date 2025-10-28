import { createStatusGlyph } from './StatusGlyph.js';

/**
 * Creates a minimal roadmap step card for timeline view
 * Contains ONLY: H3 title + StatusGlyph
 * NO body text, NO meta/footer, NO CTA buttons
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The milestone title
 * @param {('now'|'next'|'done'|'later')} props.status - The milestone status
 * @param {string} [props.id] - Optional ID for the card
 * @returns {HTMLElement} The roadmap step card element
 */
export function createRoadmapStepCard({ title, status, id }) {
  const card = document.createElement('article');
  card.className = 'roadmap-step-card card-frosted';

  if (id) {
    card.id = `roadmap-step-${id}`;
  }

  // Create title (H3)
  const heading = document.createElement('h3');
  heading.textContent = title;

  // Create status glyph
  const glyph = createStatusGlyph(status);

  // Assemble card: title on left, glyph on right
  card.appendChild(heading);
  card.appendChild(glyph);

  // Add ARIA attributes
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `${title} - Status: ${status}`);

  return card;
}
