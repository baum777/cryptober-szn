import { describe, it, expect, vi } from 'vitest';

import { prefersReducedMotion, watchReducedMotion } from '../utils/motion.js';

describe('motion utilities', () => {
  describe('prefersReducedMotion', () => {
    it('should return false when user does NOT prefer reduced motion', () => {
      mockReducedMotion(false);

      const result = prefersReducedMotion();
      expect(result).toBe(false);
    });

    it('should return true when user prefers reduced motion', () => {
      mockReducedMotion(true);

      const result = prefersReducedMotion();
      expect(result).toBe(true);
    });
  });

  describe('watchReducedMotion', () => {
    it('should call callback when media query changes', () => {
      const mockCallback = vi.fn();
      const mockAddEventListener = vi.fn();

      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn()
      }));

      watchReducedMotion(mockCallback);

      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should return cleanup function', () => {
      const mockCallback = vi.fn();
      const mockRemoveEventListener = vi.fn();

      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener
      }));

      const cleanup = watchReducedMotion(mockCallback);

      expect(typeof cleanup).toBe('function');

      cleanup();

      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });
});
