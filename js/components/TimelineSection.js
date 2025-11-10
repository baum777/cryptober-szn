import { createRoadmapStepCard } from './RoadmapStepCard.js';
import { normalizeStatus } from './StatusGlyph.js';

/**
 * @typedef {Object} MilestoneData
 * @property {string} id - Milestone ID
 * @property {string} title - Milestone title
 * @property {string} status - Milestone status (will be normalized)
 */

/**
 * Initializes the Timeline section with roadmap step cards
 * Desktop: 3-column grid (1fr | auto | 1fr) with central neon spine
 * Tablet: Compressed centered layout
 * Mobile: Single column stack
 *
 * @param {HTMLElement} container - The container element for the timeline
 * @param {Array<MilestoneData>} data - Array of milestone data
 * @returns {{destroy: () => void}} Object with destroy method for cleanup
 */
export function initTimelineSection(container, data) {
  if (!container) {
    console.warn('[TimelineSection] Container element not found');
    return { destroy: () => {} };
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.warn('[TimelineSection] No data provided');
    return { destroy: () => {} };
  }

  // Clear existing content
  container.innerHTML = '';

  // Add section class
  container.classList.add('timeline-section');

  // Create grid container
  const grid = document.createElement('div');
  grid.className = 'timeline-grid';
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'Project milestones timeline');

  // Create vertical spine for desktop view
  const spine = document.createElement('div');
  spine.className = 'timeline-spine';
  spine.setAttribute('aria-hidden', 'true');

  // Create cards and alternate left/right on desktop
  data.forEach((item, index) => {
    const normalizedStatus = normalizeStatus(item.status);
    const card = createRoadmapStepCard({
      title: item.title,
      status: normalizedStatus,
      id: item.id
    });

    // Add positioning class for desktop grid
    // Odd index = left column, even index = right column
    const position = index % 2 === 0 ? 'left' : 'right';
    card.classList.add(`timeline-card--${position}`);

    // Set grid row for proper vertical alignment on desktop
    card.style.gridRow = String(Math.floor(index / 2) + 1);

    // Add to grid
    grid.appendChild(card);
  });

  // Add spine to grid (will be positioned via CSS grid)
  grid.appendChild(spine);

  // Add grid to container
  container.appendChild(grid);

  // Announce to screen readers
  const announcement = `Timeline loaded with ${data.length} milestones`;
  announceToScreenReader(announcement);

  // Cleanup function
  return {
    destroy() {
      container.innerHTML = '';
      container.classList.remove('timeline-section');
    }
  };
}

/**
 * Announces a message to screen readers via live region
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
  // Check if live region exists, create if not
  let liveRegion = document.getElementById('timeline-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'timeline-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;
}
