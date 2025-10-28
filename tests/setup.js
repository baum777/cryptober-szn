import { beforeEach, vi } from 'vitest';

// Mock window.matchMedia for testing reduced motion preferences
beforeEach(() => {
  // Default: user does NOT prefer reduced motion
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
});

// Global test utilities
globalThis.mockReducedMotion = (enabled = true) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? enabled : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
};

// Clean up DOM after each test
beforeEach(() => {
  document.body.innerHTML = '';
});
