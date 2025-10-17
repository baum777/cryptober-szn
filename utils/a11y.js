// ========================================
// utils/a11y.js
// Author: Codex Frontend Engineer
// Date: 2024-05-12
// Purpose: Accessibility utilities shared across the Cryptober UI.
// ========================================

export const prefersReducedMotion = () => {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch (e) {
    return false;
  }
};
