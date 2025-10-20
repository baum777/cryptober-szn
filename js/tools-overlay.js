const overlay = document.getElementById('tools-overlay');
const triggers = document.querySelectorAll('.btn-cta[data-overlay]');
const titleEl = overlay?.querySelector('#tools-overlay-title');
const bodyEl = overlay?.querySelector('#tools-overlay-body');
const closeBtn = overlay?.querySelector('.overlay__close');
const overlayWindow = overlay?.querySelector('.overlay__window');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

if (
  overlay &&
  triggers.length &&
  titleEl &&
  bodyEl &&
  closeBtn &&
  overlayWindow
) {
  const overlayCopy = {
    'signal-forge': {
      title: 'Signal Forge',
      body: `
        <p>[Placeholder] Extended description for Signal Forge: capabilities, inputs, outputs, and example workflows.</p>
        <ul>
          <li>[Placeholder] Data sources and update cadence.</li>
          <li>[Placeholder] Example: turning raw intel into shareable visuals.</li>
          <li>[Placeholder] Usage notes, limitations, and roadmap hooks.</li>
        </ul>
      `,
    },
    specterscan: {
      title: 'SpecterScan',
      body: `
        <p>[Placeholder] Extended description for SpecterScan: pattern detection, breakout zones, and alerting logic.</p>
        <ul>
          <li>[Placeholder] Scan presets and customization.</li>
          <li>[Placeholder] Ghostly tooltips and neon UI behavior.</li>
          <li>[Placeholder] Example sessions and export options.</li>
        </ul>
      `,
    },
  };

  const focusSelectors =
    'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let activeTrigger = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  overlay.setAttribute('aria-hidden', 'true');
  overlayWindow.setAttribute('tabindex', '-1');

  const setContent = (key) => {
    const entry = overlayCopy[key];
    if (!entry) {
      return false;
    }

    titleEl.textContent = entry.title;
    bodyEl.innerHTML = entry.body.trim();
    overlayWindow.scrollTop = 0;
    return true;
  };

  const updateFocusables = () => {
    focusableElements = Array.from(overlay.querySelectorAll(focusSelectors)).filter(
      (element) =>
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-hidden') !== 'true' &&
        element.tabIndex !== -1
    );

    firstFocusable = focusableElements[0] ?? null;
    lastFocusable = focusableElements[focusableElements.length - 1] ?? null;
  };

  const handleTransitionEnd = (event) => {
    if (event.target === overlay && event.propertyName === 'opacity') {
      overlay.classList.add('hidden');
    }
  };

  const closeOverlay = () => {
    if (!overlay.classList.contains('is-open')) {
      return;
    }

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-overlay-open');

    if (reduceMotionQuery.matches) {
      overlay.classList.add('hidden');
    } else {
      overlay.addEventListener('transitionend', handleTransitionEnd, { once: true });
    }

    if (activeTrigger) {
      activeTrigger.focus();
    }
    activeTrigger = null;
  };

  const trapFocus = (event) => {
    if (!firstFocusable || !lastFocusable) {
      event.preventDefault();
      overlayWindow.focus();
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable || !overlay.contains(document.activeElement)) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  const handleKeydown = (event) => {
    if (!overlay.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeOverlay();
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === overlay) {
      closeOverlay();
    }
  };

  const openOverlay = (key, trigger) => {
    if (!setContent(key)) {
      return;
    }

    activeTrigger = trigger;
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
    });
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-overlay-open');

    updateFocusables();
    (firstFocusable ?? overlayWindow).focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const key = trigger.dataset.overlay?.trim();
      if (!key) {
        return;
      }
      openOverlay(key, trigger);
    });
  });

  closeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    closeOverlay();
  });

  overlay.addEventListener('click', handleBackdropClick);
  document.addEventListener('keydown', handleKeydown);
}

export {};
