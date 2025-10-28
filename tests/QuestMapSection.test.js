import { describe, it, expect, beforeEach } from 'vitest';

import { initQuestMapSection } from '../js/components/QuestMapSection.js';

describe('QuestMapSection', () => {
  let container;
  let mockData;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'questmap-test';
    document.body.appendChild(container);

    mockData = [
      {
        id: 'quest-1',
        title: 'First Quest',
        status: 'done',
        desc: 'Description of first quest',
        quarter: 'Q4',
        tags: ['community', 'lore']
      },
      {
        id: 'quest-2',
        title: 'Second Quest',
        status: 'inprogress',
        desc: 'Description of second quest',
        quarter: 'Q1',
        tags: ['tools']
      },
      {
        id: 'quest-3',
        title: 'Third Quest',
        status: 'planned',
        desc: 'Description of third quest'
      }
    ];
  });

  it('should initialize questmap section', () => {
    const result = initQuestMapSection(container, mockData);

    expect(result).toHaveProperty('destroy');
    expect(typeof result.destroy).toBe('function');
  });

  it('should add section class and ARIA attributes to container', () => {
    initQuestMapSection(container, mockData);

    expect(container.classList.contains('questmap-section')).toBe(true);
    expect(container.getAttribute('role')).toBe('region');
    expect(container.getAttribute('aria-labelledby')).toBe('questmap-heading');
  });

  it('should create heading for aria-labelledby', () => {
    initQuestMapSection(container, mockData);

    const heading = container.querySelector('#questmap-heading');
    expect(heading).not.toBeNull();
    expect(heading.tagName).toBe('H2');
    expect(heading.classList.contains('sr-only')).toBe(true);
  });

  it('should render all quest cards', () => {
    initQuestMapSection(container, mockData);

    const cards = container.querySelectorAll('.quest-card');
    expect(cards.length).toBe(mockData.length);
  });

  it('should normalize status values', () => {
    initQuestMapSection(container, mockData);

    const cards = container.querySelectorAll('.quest-card');

    // First card: done -> done
    expect(cards[0].querySelector('.status-glyph--done')).not.toBeNull();

    // Second card: inprogress -> now
    expect(cards[1].querySelector('.status-glyph--now')).not.toBeNull();

    // Third card: planned -> next
    expect(cards[2].querySelector('.status-glyph--next')).not.toBeNull();
  });

  it('should render card body text', () => {
    initQuestMapSection(container, mockData);

    const firstCard = container.querySelectorAll('.quest-card')[0];
    const body = firstCard.querySelector('.quest-card__body');

    expect(body).not.toBeNull();
    expect(body.textContent).toBe('Description of first quest');
  });

  it('should build meta string from quarter and tags', () => {
    initQuestMapSection(container, mockData);

    const firstCard = container.querySelectorAll('.quest-card')[0];
    const footer = firstCard.querySelector('.quest-card__footer');

    expect(footer).not.toBeNull();
    expect(footer.textContent).toContain('Q4');
    expect(footer.textContent).toContain('community');
    expect(footer.textContent).toContain('lore');
  });

  it('should handle missing meta gracefully', () => {
    initQuestMapSection(container, mockData);

    const thirdCard = container.querySelectorAll('.quest-card')[2];
    const footer = thirdCard.querySelector('.quest-card__footer');

    // Third card has no quarter or tags, so no footer
    expect(footer).toBeNull();
  });

  it('should wrap cards in list items', () => {
    initQuestMapSection(container, mockData);

    const listItems = container.querySelectorAll('[role="listitem"]');
    expect(listItems.length).toBe(mockData.length);
  });

  it('should handle empty data gracefully', () => {
    const result = initQuestMapSection(container, []);

    expect(result).toHaveProperty('destroy');
  });

  it('should handle missing container gracefully', () => {
    const result = initQuestMapSection(null, mockData);

    expect(result).toHaveProperty('destroy');
    expect(typeof result.destroy).toBe('function');
  });

  it('should clean up on destroy', () => {
    const result = initQuestMapSection(container, mockData);

    result.destroy();

    expect(container.innerHTML).toBe('');
    expect(container.classList.contains('questmap-section')).toBe(false);
    expect(container.getAttribute('role')).toBeNull();
    expect(container.getAttribute('aria-labelledby')).toBeNull();
  });
});
