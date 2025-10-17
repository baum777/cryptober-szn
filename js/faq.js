// /js/faq.js — FAQ accordion with single open behaviour
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const buttons = Array.from(document.querySelectorAll('.faq-q'));
    if (buttons.length === 0) return;

    const closeAll = () => {
      buttons.forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
        const panelId = btn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (panel) {
          panel.hidden = true;
        }
      });
    };

    buttons.forEach((btn) => {
      const toggle = () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        closeAll();
        if (!expanded) {
          btn.setAttribute('aria-expanded', 'true');
          const panelId = btn.getAttribute('aria-controls');
          const panel = panelId ? document.getElementById(panelId) : null;
          if (panel) {
            panel.hidden = false;
          }
        }
      };

      btn.addEventListener('click', toggle);
      btn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });
  });
}
