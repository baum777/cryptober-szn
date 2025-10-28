import { describe, it, expect } from 'vitest';

import { createRoadmapStepCard } from '../js/components/RoadmapStepCard.js';

describe('RoadmapStepCard', () => {
  it('should create a roadmap step card element', () => {
    const card = createRoadmapStepCard({
      title: 'Test Milestone',
      status: 'now'
    });

    expect(card.tagName).toBe('ARTICLE');
    expect(card.classList.contains('roadmap-step-card')).toBe(true);
    expect(card.classList.contains('card-frosted')).toBe(true);
  });

  it('should render H3 title correctly', () => {
    const card = createRoadmapStepCard({
      title: 'Test Milestone',
      status: 'now'
    });

    const heading = card.querySelector('h3');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('Test Milestone');
  });

  it('should contain a StatusGlyph', () => {
    const card = createRoadmapStepCard({
      title: 'Test Milestone',
      status: 'done'
    });

    const glyph = card.querySelector('.status-glyph');
    expect(glyph).not.toBeNull();
    expect(glyph.classList.contains('status-glyph--done')).toBe(true);
  });

  it('should have proper ARIA attributes', () => {
    const card = createRoadmapStepCard({
      title: 'Test Milestone',
      status: 'now'
    });

    expect(card.getAttribute('role')).toBe('article');
    expect(card.getAttribute('aria-label')).toContain('Test Milestone');
    expect(card.getAttribute('aria-label')).toContain('now');
  });

  it('should set ID when provided', () => {
    const card = createRoadmapStepCard({
      title: 'Test Milestone',
      status: 'now',
      id: 'test-123'
    });

    expect(card.id).toBe('roadmap-step-test-123');
  });

  it('should NOT render body text', () => {
    const card = createRoadmapStepCard({
      title: 'Test Milestone',
      status: 'now'
    });

    // Card should only have H3 and status glyph
    const children = Array.from(card.children);
    expect(children.length).toBe(2);
    expect(children[0].tagName).toBe('H3');
    expect(children[1].classList.contains('status-glyph')).toBe(true);
  });
});
