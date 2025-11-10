import { describe, it, expect } from 'vitest';

import { createStatusGlyph, isValidStatus, normalizeStatus } from '../js/components/StatusGlyph.js';

describe('StatusGlyph', () => {
  describe('createStatusGlyph', () => {
    it('should create a status glyph element', () => {
      const glyph = createStatusGlyph('now');

      expect(glyph.tagName).toBe('SPAN');
      expect(glyph.classList.contains('status-glyph')).toBe(true);
    });

    it('should apply correct class for "now" status', () => {
      const glyph = createStatusGlyph('now');

      expect(glyph.classList.contains('status-glyph--now')).toBe(true);
    });

    it('should apply correct class for "next" status', () => {
      const glyph = createStatusGlyph('next');

      expect(glyph.classList.contains('status-glyph--next')).toBe(true);
    });

    it('should apply correct class for "done" status', () => {
      const glyph = createStatusGlyph('done');

      expect(glyph.classList.contains('status-glyph--done')).toBe(true);
    });

    it('should apply correct class for "later" status', () => {
      const glyph = createStatusGlyph('later');

      expect(glyph.classList.contains('status-glyph--later')).toBe(true);
    });

    it('should default to "later" for invalid status', () => {
      // @ts-expect-error - Testing invalid input handling
      const glyph = createStatusGlyph('invalid');

      expect(glyph.classList.contains('status-glyph--later')).toBe(true);
    });

    it('should have proper ARIA attributes', () => {
      const glyph = createStatusGlyph('now');

      expect(glyph.getAttribute('role')).toBe('img');
      expect(glyph.getAttribute('aria-label')).toContain('now');
    });

    it('should disable pulse animation when reduced motion is preferred', () => {
      // Enable reduced motion
      mockReducedMotion(true);

      const glyph = createStatusGlyph('now');

      expect(glyph.style.animation).toBe('none');
    });

    it('should not disable pulse animation when reduced motion is NOT preferred', () => {
      // Disable reduced motion (default)
      mockReducedMotion(false);

      const glyph = createStatusGlyph('now');

      expect(glyph.style.animation).not.toBe('none');
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid statuses', () => {
      expect(isValidStatus('now')).toBe(true);
      expect(isValidStatus('next')).toBe(true);
      expect(isValidStatus('done')).toBe(true);
      expect(isValidStatus('later')).toBe(true);
    });

    it('should return false for invalid statuses', () => {
      expect(isValidStatus('invalid')).toBe(false);
      expect(isValidStatus('')).toBe(false);
      expect(isValidStatus(null)).toBe(false);
    });
  });

  describe('normalizeStatus', () => {
    it('should normalize "inprogress" to "now"', () => {
      expect(normalizeStatus('inprogress')).toBe('now');
    });

    it('should normalize "planned" to "next"', () => {
      expect(normalizeStatus('planned')).toBe('next');
    });

    it('should keep "done" as "done"', () => {
      expect(normalizeStatus('done')).toBe('done');
    });

    it('should default unknown statuses to "later"', () => {
      expect(normalizeStatus('unknown')).toBe('later');
      expect(normalizeStatus('')).toBe('later');
    });
  });
});
