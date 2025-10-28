import { describe, it, expect } from 'vitest';

import { createQuestCard } from '../js/components/QuestCard.js';

describe('QuestCard', () => {
  it('should create a quest card element', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: 'This is the quest description.'
    });

    expect(card.tagName).toBe('ARTICLE');
    expect(card.classList.contains('quest-card')).toBe(true);
    expect(card.classList.contains('card-frosted')).toBe(true);
  });

  it('should render header with H3 title', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: 'Description'
    });

    const header = card.querySelector('.quest-card__header');
    expect(header).not.toBeNull();

    const heading = header.querySelector('h3');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('Test Quest');
  });

  it('should contain a StatusGlyph in header', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'done',
      body: 'Description'
    });

    const glyph = card.querySelector('.status-glyph');
    expect(glyph).not.toBeNull();
    expect(glyph.classList.contains('status-glyph--done')).toBe(true);
  });

  it('should render body text', () => {
    const bodyText = 'This is a detailed description of the quest.';
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: bodyText
    });

    const body = card.querySelector('.quest-card__body');
    expect(body).not.toBeNull();
    expect(body.textContent).toBe(bodyText);
  });

  it('should render footer when meta is provided', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: 'Description',
      meta: 'Q4 · tag1, tag2'
    });

    const footer = card.querySelector('.quest-card__footer');
    expect(footer).not.toBeNull();
    expect(footer.textContent).toBe('Q4 · tag1, tag2');
  });

  it('should NOT render footer when meta is not provided', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: 'Description'
    });

    const footer = card.querySelector('.quest-card__footer');
    expect(footer).toBeNull();
  });

  it('should render progress ribbon when progressRibbonState is provided', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: 'Description',
      progressRibbonState: 'next'
    });

    const ribbon = card.querySelector('.quest-card__ribbon');
    expect(ribbon).not.toBeNull();

    const chip = ribbon.querySelector('.quest-card__ribbon-chip');
    expect(chip).not.toBeNull();
    expect(chip.textContent).toBe('NEXT');
  });

  it('should have proper ARIA attributes', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: 'Description'
    });

    expect(card.getAttribute('role')).toBe('article');
    expect(card.getAttribute('aria-label')).toContain('Test Quest');
    expect(card.getAttribute('aria-label')).toContain('now');
  });

  it('should set ID when provided', () => {
    const card = createQuestCard({
      title: 'Test Quest',
      status: 'now',
      body: 'Description',
      id: 'quest-123'
    });

    expect(card.id).toBe('quest-card-quest-123');
  });
});
