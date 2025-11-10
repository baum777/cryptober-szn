import { describe, it, expect, beforeEach } from 'vitest';

import { initTimelineSection } from '../js/components/TimelineSection.js';

describe('TimelineSection', () => {
  let container;
  let mockData;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'timeline-test';
    document.body.appendChild(container);

    mockData = [
      { id: 'step-1', title: 'First Step', status: 'done' },
      { id: 'step-2', title: 'Second Step', status: 'inprogress' },
      { id: 'step-3', title: 'Third Step', status: 'planned' }
    ];
  });

  it('should initialize timeline section', () => {
    const result = initTimelineSection(container, mockData);

    expect(result).toHaveProperty('destroy');
    expect(typeof result.destroy).toBe('function');
  });

  it('should add section class to container', () => {
    initTimelineSection(container, mockData);

    expect(container.classList.contains('timeline-section')).toBe(true);
  });

  it('should create grid container with proper ARIA attributes', () => {
    initTimelineSection(container, mockData);

    const grid = container.querySelector('.timeline-grid');
    expect(grid).not.toBeNull();
    expect(grid.getAttribute('role')).toBe('list');
    expect(grid.getAttribute('aria-label')).toContain('timeline');
  });

  it('should render all milestone cards', () => {
    initTimelineSection(container, mockData);

    const cards = container.querySelectorAll('.roadmap-step-card');
    expect(cards.length).toBe(mockData.length);
  });

  it('should normalize status values', () => {
    initTimelineSection(container, mockData);

    const cards = container.querySelectorAll('.roadmap-step-card');

    // First card: done -> done
    expect(cards[0].querySelector('.status-glyph--done')).not.toBeNull();

    // Second card: inprogress -> now
    expect(cards[1].querySelector('.status-glyph--now')).not.toBeNull();

    // Third card: planned -> next
    expect(cards[2].querySelector('.status-glyph--next')).not.toBeNull();
  });

  it('should create vertical spine', () => {
    initTimelineSection(container, mockData);

    const spine = container.querySelector('.timeline-spine');
    expect(spine).not.toBeNull();
    expect(spine.getAttribute('aria-hidden')).toBe('true');
  });

  it('should alternate cards left/right on desktop', () => {
    initTimelineSection(container, mockData);

    const cards = container.querySelectorAll('.roadmap-step-card');

    // First card (index 0) should be left
    expect(cards[0].classList.contains('timeline-card--left')).toBe(true);

    // Second card (index 1) should be right
    expect(cards[1].classList.contains('timeline-card--right')).toBe(true);

    // Third card (index 2) should be left
    expect(cards[2].classList.contains('timeline-card--left')).toBe(true);
  });

  it('should handle empty data gracefully', () => {
    const result = initTimelineSection(container, []);

    expect(result).toHaveProperty('destroy');
    expect(container.querySelector('.timeline-grid')).toBeNull();
  });

  it('should handle missing container gracefully', () => {
    const result = initTimelineSection(null, mockData);

    expect(result).toHaveProperty('destroy');
    expect(typeof result.destroy).toBe('function');
  });

  it('should clean up on destroy', () => {
    const result = initTimelineSection(container, mockData);

    result.destroy();

    expect(container.innerHTML).toBe('');
    expect(container.classList.contains('timeline-section')).toBe(false);
  });
});
