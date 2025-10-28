/**
 * Checks if the user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a media query listener for reduced motion preference
 * @param {Function} callback - Called when preference changes
 * @returns {Function} Cleanup function to remove listener
 */
export function watchReducedMotion(callback) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (event) => callback(event.matches);

  mediaQuery.addEventListener('change', handler);

  return () => mediaQuery.removeEventListener('change', handler);
}
