import { prefersReducedMotion } from '../../utils/motion.js';

/**
 * Creates a status glyph element
 * @param {('now'|'next'|'done'|'later')} status - The status of the milestone
 * @returns {HTMLSpanElement} The status glyph element
 */
export function createStatusGlyph(status) {
  const glyph = document.createElement('span');
  glyph.className = 'status-glyph';
  glyph.setAttribute('role', 'img');
  glyph.setAttribute('aria-label', `Status: ${status}`);

  // Apply status-specific class
  if (['now', 'next', 'done', 'later'].includes(status)) {
    glyph.classList.add(`status-glyph--${status}`);
  } else {
    // Default to 'later' if invalid status
    glyph.classList.add('status-glyph--later');
  }

  // Disable pulse animation if user prefers reduced motion
  if (status === 'now' && prefersReducedMotion()) {
    glyph.style.animation = 'none';
  }

  return glyph;
}

/**
 * Validates if a status value is valid
 * @param {string} status - The status to validate
 * @returns {boolean} True if valid
 */
export function isValidStatus(status) {
  return ['now', 'next', 'done', 'later'].includes(status);
}

/**
 * Normalizes status from data source to component contract
 * Maps existing roadmap.json status values to component contract
 * @param {string} rawStatus - Raw status from data source
 * @returns {('now'|'next'|'done'|'later')} Normalized status
 */
export function normalizeStatus(rawStatus) {
  const statusMap = {
    'inprogress': 'now',
    'planned': 'next',
    'done': 'done'
  };

  return statusMap[rawStatus] || 'later';
}
