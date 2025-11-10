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

export function initQuestmap() {
  const section = document.getElementById('questmap');
  if (!section) return null;

  const checkpoints = Array.from(section.querySelectorAll('#rm-details .checkpoint'));
  const detailsRoot = document.querySelector('[data-questmap-details]');

  let progressChips = [];
  let detailCards = [];

  if (detailsRoot) {
    const progressContainer = detailsRoot.querySelector('[data-questmap-progress]');
    if (progressContainer) {
      progressChips = Array.from(progressContainer.querySelectorAll('.questmap-progress__chip'));
    }

    const cardsContainer = detailsRoot.querySelector('[data-questmap-cards]');
    if (cardsContainer) {
      detailCards = Array.from(cardsContainer.querySelectorAll('.questmap-card'));
    }
  }
  if (!checkpoints.length) return null;

  checkpoints.forEach((checkpoint, index) => {
    const status = getStatus(checkpoint);
    const heading = checkpoint.querySelector('.checkpoint__title');
    const title = heading ? heading.textContent.trim() : '';

    let statusNode = checkpoint.querySelector('.checkpoint__status');
    if (!statusNode) {
      statusNode = document.createElement('span');
      statusNode.className = 'checkpoint__status sr-only';
      checkpoint.insertBefore(statusNode, heading || checkpoint.firstChild);
    }

    const descriptor = STATUS_TEXT[status] || 'step';
    const safeTitle = title || `Step ${index + 1}`;
    statusNode.textContent = `${safeTitle} — ${descriptor}`;

    if (status === 'now') {
      checkpoint.setAttribute('aria-current', 'step');
    } else {
      checkpoint.removeAttribute('aria-current');
    }

    const applyStatus = (node) => {
      if (!node) return;
      node.classList.remove('checkpoint--now', 'checkpoint--done', 'checkpoint--later');
      if (status) {
        node.classList.add(`checkpoint--${status}`);
      }
      if (status === 'now') {
        node.setAttribute('aria-current', 'step');
      } else {
        node.removeAttribute('aria-current');
      }
    };

    const chip = progressChips[index];
    if (chip) {
      applyStatus(chip);
      const chipSr = chip.querySelector('.questmap-progress__sr');
      if (chipSr) {
        chipSr.textContent = descriptor;
      }
    }

    const detail = detailCards[index];
    if (detail) {
      applyStatus(detail);
    }
  });

  return {
    destroy() {
      checkpoints.forEach((checkpoint) => checkpoint.removeAttribute('aria-current'));
      progressChips.forEach((chip) => chip.removeAttribute('aria-current'));
      detailCards.forEach((card) => card.removeAttribute('aria-current'));
    },
  };
}
