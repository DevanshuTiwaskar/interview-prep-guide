// ===== Interview Prep Guide - Interactive JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initSearch();
  initCards();
  initProgress();
  initBackToTop();
  initKeyboardShortcuts();
  initSmoothScrollSpy();
});

// ===== SIDEBAR =====
function initSidebar() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;display:none;';
  document.body.appendChild(overlay);

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    });
  }

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  });

  // Nav section collapse/expand
  document.querySelectorAll('.nav-section-title').forEach(title => {
    title.addEventListener('click', () => {
      title.closest('.nav-section').classList.toggle('collapsed');
    });
  });

  // Nav link click on mobile - close sidebar
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      }
    });
  });
}

// ===== SEARCH =====
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.qa-card');
    const sections = document.querySelectorAll('.section-wrapper');
    const noResults = document.querySelector('.no-results');
    let visibleCount = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = !query || text.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    // Show/hide section headers based on visible cards
    sections.forEach(section => {
      const visibleCards = section.querySelectorAll('.qa-card:not([style*="display: none"])');
      const sectionHeader = section.querySelector('.section-header');
      if (sectionHeader) {
        sectionHeader.style.display = visibleCards.length > 0 ? '' : 'none';
      }
    });

    // No results message
    if (noResults) {
      noResults.classList.toggle('visible', visibleCount === 0 && query.length > 0);
    }

    // Update sidebar nav
    document.querySelectorAll('.nav-links li').forEach(li => {
      const link = li.querySelector('a');
      if (link) {
        const targetId = link.getAttribute('href')?.replace('#', '');
        const targetCard = document.getElementById(targetId);
        if (targetCard) {
          li.style.display = targetCard.style.display;
        }
      }
    });
  }, 200));
}

// ===== CARDS =====
function initCards() {
  document.querySelectorAll('.qa-card').forEach(card => {
    const header = card.querySelector('.question-header');
    const toggleIcon = card.querySelector('.toggle-icon');
    const checkbox = card.querySelector('.completion-check');

    // Toggle open/close
    if (header) {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.completion-check')) return;
        card.classList.toggle('open');
      });
    }

    // Completion checkbox
    if (checkbox) {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('completed');
        if (card.classList.contains('completed')) {
          checkbox.textContent = '✓';
        } else {
          checkbox.textContent = '';
        }
        saveProgress();
        updateProgressBar();
      });
    }
  });

  // Expand All / Collapse All buttons
  document.getElementById('expand-all')?.addEventListener('click', () => {
    document.querySelectorAll('.qa-card').forEach(card => card.classList.add('open'));
  });

  document.getElementById('collapse-all')?.addEventListener('click', () => {
    document.querySelectorAll('.qa-card').forEach(card => card.classList.remove('open'));
  });
}

// ===== PROGRESS TRACKING =====
function initProgress() {
  loadProgress();
  updateProgressBar();
}

function saveProgress() {
  const completed = [];
  document.querySelectorAll('.qa-card.completed').forEach(card => {
    completed.push(card.id);
  });
  localStorage.setItem('interview-prep-progress', JSON.stringify(completed));
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('interview-prep-progress') || '[]');
    saved.forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        card.classList.add('completed');
        const checkbox = card.querySelector('.completion-check');
        if (checkbox) checkbox.textContent = '✓';
      }
    });
  } catch (e) {
    console.warn('Could not load progress:', e);
  }
}

function updateProgressBar() {
  const total = document.querySelectorAll('.qa-card').length;
  const completed = document.querySelectorAll('.qa-card.completed').length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  const fill = document.querySelector('.progress-bar-fill');
  const countEl = document.querySelector('.progress-count');

  if (fill) fill.style.width = percent + '%';
  if (countEl) countEl.textContent = `${completed}/${total}`;
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K = Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.focus();
    }

    // Escape = Close search / collapse all
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('search-input');
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
      }
    }
  });
}

// ===== SCROLL SPY =====
function initSmoothScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-links a');
  if (navLinks.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  document.querySelectorAll('.qa-card[id]').forEach(card => {
    observer.observe(card);
  });
}

// ===== PRINT =====
function printGuide() {
  // Expand all cards before printing
  document.querySelectorAll('.qa-card').forEach(card => card.classList.add('open'));

  setTimeout(() => {
    window.print();
  }, 300);
}

// ===== UTILITY =====
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
