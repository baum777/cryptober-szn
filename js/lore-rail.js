// /js/lore-rail.js — collapsible groups for lore left rail
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.group-toggle');
    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        const list = btn.nextElementSibling;
        if (list) {
          if (expanded) {
            list.setAttribute('hidden', '');
          } else {
            list.removeAttribute('hidden');
          }
        }
      });

      btn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          btn.click();
        }
      });
    });
  });
}
