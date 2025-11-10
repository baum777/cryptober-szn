/**
 * Safe Storage Wrapper (localStorage/sessionStorage)
 * Prevents crashes from quota exceeded, disabled storage, or parse errors.
 */

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Safe localStorage.getItem with JSON parsing
 * @param {string} key
 * @param {*} fallback - Default value if key missing or parse fails
 * @returns {*}
 */
export function getItem(key, fallback = null) {
  if (!isBrowser || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[safeStorage] getItem("${key}") failed:`, err);
    return fallback;
  }
}

/**
 * Safe localStorage.setItem with JSON stringification
 * @param {string} key
 * @param {*} value
 * @returns {boolean} success
 */
export function setItem(key, value) {
  if (!isBrowser || !window.localStorage) {
    return false;
  }
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[safeStorage] setItem("${key}") failed:`, err);
    return false;
  }
}

/**
 * Safe localStorage.removeItem
 * @param {string} key
 */
export function removeItem(key) {
  if (!isBrowser || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[safeStorage] removeItem("${key}") failed:`, err);
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export function isAvailable() {
  if (!isBrowser || !window.localStorage) {
    return false;
  }
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
