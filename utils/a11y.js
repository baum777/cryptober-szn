// ========================================
// utils/a11y.js
// Author: Codex Frontend Engineer
// Date: 2024-05-12
// Purpose: Accessibility utilities shared across the Cryptober UI.
// ========================================

const FOCUSABLE_SELECTOR =
  "a[href], area[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

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

function isElementVisible(node) {
  if (!(node instanceof HTMLElement)) return false;
  if (node.hidden) return false;
  if (node.hasAttribute("hidden")) return false;
  const style =
    typeof window !== "undefined" && typeof window.getComputedStyle === "function"
      ? window.getComputedStyle(node)
      : null;
  if (style) {
    if (style.visibility === "hidden" || style.display === "none") {
      return false;
    }
  }
  if (node.hasAttribute("aria-hidden") && node.getAttribute("aria-hidden") === "true") {
    return false;
  }
  if (style?.position === "fixed") {
    return true;
  }
  return node.offsetParent !== null;
}

export function getFocusableElements(root) {
  if (!root) return [];
  const elements = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("tabindex") === "-1") return false;
    return isElementVisible(el);
  });
}

export function trapFocus(event, focusables) {
  if (event.key !== "Tab") return;
  const items = Array.isArray(focusables) ? focusables : [];
  if (items.length === 0) {
    event.preventDefault();
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  if (event.shiftKey) {
    if (active === first || !items.includes(active)) {
      event.preventDefault();
      last?.focus?.();
    }
  } else if (active === last) {
    event.preventDefault();
    first?.focus?.();
  }
}
