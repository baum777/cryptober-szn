// /js/mobile-rail.js — mobile off-canvas rails controller
const focusSelectors = 'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(focusSelectors)).filter((el) => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) return false;
    if (el.hasAttribute('disabled')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    return true;
  });
}

export function initMobileRails({
  leftToggleId = 'open-left-rail',
  rightToggleId = 'open-right-rail',
  leftPanelId = 'left-rail-panel',
  rightPanelId = 'right-rail-panel',
  onRightOpen,
} = {}) {
  const leftToggle = document.getElementById(leftToggleId);
  const rightToggle = document.getElementById(rightToggleId);
  const leftPanel = document.getElementById(leftPanelId);
  const rightPanel = document.getElementById(rightPanelId);

  const entries = [
    { panel: leftPanel, toggle: leftToggle },
    { panel: rightPanel, toggle: rightToggle },
  ].filter((entry) => entry.panel && entry.toggle);

  if (entries.length === 0) {
    return { destroy() {} };
  }

  let active = null;

  function setExpanded(toggle, expanded) {
    if (toggle) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  function closeActive({ restoreFocus = true } = {}) {
    if (!active) return;
    const { panel, toggle, previousFocus } = active;
    panel.classList.remove('is-open');
    setExpanded(toggle, false);
    panel.removeAttribute('tabindex');
    document.removeEventListener('keydown', handleKeyDown, true);
    document.body.classList.remove('offcanvas-open');
    if (restoreFocus) {
      const target = previousFocus && typeof previousFocus.focus === 'function' ? previousFocus : toggle;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    }
    active = null;
  }

  function handleKeyDown(event) {
    if (!active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeActive();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements(active.panel);
    if (focusable.length === 0) {
      event.preventDefault();
      active.panel.focus();
      return;
    }

    const currentIndex = focusable.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.shiftKey) {
      nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
    }
    event.preventDefault();
    focusable[nextIndex].focus();
  }

  function openEntry(entry) {
    if (active && active.panel === entry.panel) {
      closeActive();
      return;
    }

    closeActive({ restoreFocus: false });

    entry.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    entry.panel.classList.add('is-open');
    entry.panel.setAttribute('tabindex', '-1');
    setExpanded(entry.toggle, true);
    document.body.classList.add('offcanvas-open');

    const focusable = getFocusableElements(entry.panel);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      entry.panel.focus();
    }

    active = entry;
    document.addEventListener('keydown', handleKeyDown, true);

    if (entry.panel === rightPanel && typeof onRightOpen === 'function') {
      onRightOpen(entry.panel);
    }
  }

  entries.forEach((entry) => {
    const handler = () => {
      if (active && active.panel === entry.panel) {
        closeActive();
      } else {
        openEntry(entry);
      }
    };
    entry.handler = handler;
    entry.toggle.addEventListener('click', handler);
  });

  function handleResize() {
    if (window.innerWidth > 960) {
      closeActive({ restoreFocus: false });
    }
  }

  window.addEventListener('resize', handleResize);

  return {
    destroy() {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown, true);
      entries.forEach((entry) => {
        if (entry.handler) {
          entry.toggle.removeEventListener('click', entry.handler);
        }
      });
      closeActive({ restoreFocus: false });
    },
  };
}
