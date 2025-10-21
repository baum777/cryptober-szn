const STATUS_TEXT = {
  now: 'current step',
  done: 'completed step',
  later: 'upcoming step',
};

function getStatus(node) {
  if (!node || !node.classList) return '';
  if (node.classList.contains('checkpoint--now')) return 'now';
  if (node.classList.contains('checkpoint--done')) return 'done';
  if (node.classList.contains('checkpoint--later')) return 'later';
  return '';
}

function syncDot(dot, status, title, index) {
  if (!dot) return;
  dot.classList.remove('rm-dots__item--now', 'rm-dots__item--done', 'rm-dots__item--later');
  if (status) {
    dot.classList.add(`rm-dots__item--${status}`);
  }

  const sr = dot.querySelector('.sr-only');
  if (sr) {
    const descriptor = STATUS_TEXT[status] || 'step';
    const safeTitle = title || `Step ${index + 1}`;
    sr.textContent = `${safeTitle} — ${descriptor}`;
  }
}

export function initQuestmap() {
  const section = document.getElementById('questmap');
  if (!section) return null;

  const checkpoints = Array.from(section.querySelectorAll('#rm-details .checkpoint'));
  const dots = Array.from(section.querySelectorAll('#rm-dots .rm-dots__item'));
  if (!checkpoints.length) return null;

  checkpoints.forEach((checkpoint, index) => {
    const status = getStatus(checkpoint);
    const heading = checkpoint.querySelector('.checkpoint__title');
    const title = heading ? heading.textContent.trim() : '';

    if (status === 'now') {
      checkpoint.setAttribute('aria-current', 'step');
    } else {
      checkpoint.removeAttribute('aria-current');
    }

    syncDot(dots[index], status, title, index);
  });

  return {
    destroy() {
      checkpoints.forEach((checkpoint) => checkpoint.removeAttribute('aria-current'));
    },
  };
}
