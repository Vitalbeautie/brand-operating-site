/* ═══════════════════════════════════════
   Sidebar Component (AP Beauty Editorial Design)
   ═══════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';
import { getCurrentPath } from '../utils/router.js';

const DESIGN_GUIDE_PATHS = new Set([
  '/',
  '/guideline',
  '/guideline/wordmark',
  '/guideline/monogram',
  '/strategy',
  '/colors',
  '/typography',
]);

export function isDesignGuidePath(path) {
  return DESIGN_GUIDE_PATHS.has(path);
}

const NAV_SECTIONS = [
  {
    section: 'DESIGN GUIDE',
    items: [
      {
        path: '/guideline/wordmark',
        sectionId: 'section-wordmark',
        label: 'WORDMARK',
        num: '01',
        subItems: [
          { target: 'block-wm-1', label: 'CORE WORDMARK' },
          { target: 'block-wm-2', label: 'EXCLUSION ZONE' },
          { target: 'block-wm-3', label: 'MINIMUM SIZE' },
          { target: 'block-wm-4', label: 'BACKGROUND USAGE' },
          { target: 'block-wm-5', label: 'INCORRECT USAGE' },
        ],
      },
      {
        path: '/guideline/monogram',
        sectionId: 'section-monogram',
        label: 'MONOGRAM',
        num: '02',
        subItems: [
          { target: 'block-mono-1', label: 'CORE SYMBOL' },
          { target: 'block-mono-2', label: 'SYSTEM' },
          { target: 'block-mono-3', label: 'PLACEMENT GUIDE' },
          { target: 'block-mono-4', label: 'EXCLUSION ZONE' },
          { target: 'block-mono-5', label: 'MINIMUM SIZE' },
          { target: 'block-mono-6', label: 'INCORRECT USAGE' },
          { target: 'block-mono-7', label: 'BACKGROUND' },
        ],
      },
      { path: '/strategy', sectionId: 'section-slogan', label: 'SLOGAN', num: '03' },
      { path: '/colors', sectionId: 'section-colors', label: 'BRAND COLOR', num: '04' },
      { path: '/typography', sectionId: 'section-typography', label: 'TYPOGRAPHY', num: '05' },
    ]
  },
  {
    section: 'BI / PI GOVERNANCE',
    items: [
      {
        path: '/gov/logo-fit',
        label: '01 BRAND VISIBILITY',
        num: 'G1',
        subItems: [
          { path: '/gov/logo-fit', label: 'LAYOUT PROPOSAL' },
          { path: '/gov/icon-generator', label: 'ICON GENERATOR' },
        ],
      },
      { path: '/gov/family-look', label: '02 FAMILY LOOK', num: 'G2' },
      { path: '/gov/localization', label: '03 LOCALIZATION', num: 'G3' },
      { path: '/gov/package-front', label: '04 PACKAGE FRONT', num: 'G4' },
    ]
  },
  {
    section: 'ARCHIVE',
    items: [
      { path: '/assets', label: 'ASSET LIBRARY', num: '06' },
      { path: '/versions', label: 'VERSION HISTORY', num: '07' },
    ]
  }
];

export function renderSidebar(container) {
  const brand = getBrand();
  const currentPath = getCurrentPath();

  let navHtml = '';
  NAV_SECTIONS.forEach(section => {
    navHtml += `<div class="sidebar-section-label">${section.section}</div>`;
    section.items.forEach(item => {
      const isWmRoot = item.path === '/guideline/wordmark' && (currentPath === '/' || currentPath === '/guideline' || currentPath === '/guideline/wordmark');
      const isGovRoot = item.path === '/gov/logo-fit' && (currentPath === '/gov/logo-fit' || currentPath === '/gov/icon-generator' || currentPath === '/gov/visual-dna');
      const active = (item.path === currentPath || isWmRoot || isGovRoot) ? ' active' : '';
      navHtml += `
        <a href="#${item.path}" class="nav-link${active}" data-path="${item.path}" ${item.sectionId ? `data-section="${item.sectionId}"` : ''}>
          <span>${item.label}</span>
        </a>`;
      if (item.subItems) {
        navHtml += `<div class="nav-sub-list" data-parent="${item.path}" style="display:${active ? 'flex' : 'none'};flex-direction:column;gap:8px;padding:4px 0 12px 12px;">
          ${item.subItems.map((sub, sIdx) => {
            const subHref = sub.path ? `#${sub.path}` : `#${item.path}`;
            const isSubActive = sub.path
              ? (currentPath === sub.path || (sub.path === '/gov/icon-generator' && currentPath === '/gov/visual-dna'))
              : (active && sIdx === 0);
            return `
            <a href="${subHref}" class="nav-sub-link${isSubActive ? ' active' : ''}" ${sub.target ? `data-scroll="${sub.target}"` : ''} ${sub.path ? `data-subpath="${sub.path}"` : ''} style="font-family:var(--font-en);font-size:10px;letter-spacing:1.2px;color:${isSubActive ? '#000000' : '#7A808C'};font-weight:${isSubActive ? '700' : '400'};text-decoration:none;line-height:1.4;">
              ${sub.label}
            </a>`;
          }).join('')}
        </div>`;
      }
    });
  });

  const latestVersion = brand?.versions?.[0];

  container.innerHTML = `
    <!-- Sidebar Header (Ultra-Crisp Vector Wordmark) -->
    <div class="sidebar-header" style="text-align: left; display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 28px;">
      <div class="brand-logo" id="sidebar-logo-btn" style="cursor: pointer; width: 100%; display: flex; justify-content: flex-start;" onclick="location.hash='#/'">
        <img id="brand-logo-img" src="/assets/logos/vitalbeautie_wordmark.svg" alt="VITALBEAUTIE" style="max-width: 172px; width: 100%; height: auto; display: block;" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="nav-menu" id="nav-links">
      ${navHtml}
    </nav>

    <!-- Sidebar Footer Controls (Search & Language Toggle) -->
    <div class="sidebar-controls">
      <div class="search-and-lang-row">
        <!-- Search Bar -->
        <div class="search-bar-container">
          <input type="text" id="sidebar-search-input" class="search-bar-input" placeholder="SEARCH" />
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="6.5"></circle>
            <line x1="21" y1="21" x2="14.6" y2="14.6"></line>
          </svg>
          <button id="search-clear-btn" class="search-clear-btn" title="검색 지우기">✕</button>
        </div>
        <!-- Language Toggle Button -->
        <button id="lang-toggle-btn" class="btn-lang btn-lang-square">EN</button>
      </div>

      <div class="sidebar-meta-row">
        <span class="version-code">${latestVersion ? latestVersion.version : 'v3.0'}</span>
        <span class="version-date">${latestVersion ? latestVersion.date : '2026.10'}</span>
        <span class="brand-badge-pill">OFFICIAL</span>
      </div>
    </div>
  `;

  setupSidebarEvents(container);
}

function setupSidebarEvents(container) {
  const overlay = document.getElementById('sidebar-overlay');
  const logoBtn = container.querySelector('#sidebar-logo-btn');

  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }

  // Close drawer on link click for mobile & handle smooth scrolling inside Design Guide
  container.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      container.classList.remove('sidebar-open');
      if (overlay) overlay.classList.remove('active');

      const sectionId = link.getAttribute('data-section');
      const linkPath = link.getAttribute('data-path');
      const currentPath = getCurrentPath();
      if (sectionId && isDesignGuidePath(currentPath)) {
        const targetEl = document.getElementById(sectionId);
        if (targetEl) {
          e.preventDefault();
          history.replaceState(null, '', '#' + linkPath);
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  container.querySelectorAll('.nav-sub-link').forEach(sub => {
    sub.addEventListener('click', e => {
      const targetId = sub.getAttribute('data-scroll');
      if (!targetId) return; // direct route link (e.g. /gov/icon-generator)
      const targetHref = sub.getAttribute('href') || '';
      const targetPath = targetHref.replace(/^#/, '');
      const currentPath = getCurrentPath();
      if (isDesignGuidePath(currentPath)) {
        const el = document.getElementById(targetId);
        if (el) {
          e.preventDefault();
          history.replaceState(null, '', '#' + targetPath);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });
  });

  // Search input filter
  const searchInput = container.querySelector('#sidebar-search-input');
  const clearBtn = container.querySelector('#search-clear-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      const links = container.querySelectorAll('.nav-link');
      links.forEach(l => {
        const text = l.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          l.style.display = 'block';
        } else {
          l.style.display = 'none';
        }
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      }
    });
  }

  // Language toggle
  const langBtn = container.querySelector('#lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const isEn = langBtn.textContent === 'EN';
      langBtn.textContent = isEn ? 'KO' : 'EN';
      document.body.classList.toggle('lang-en', isEn);
      document.body.classList.toggle('lang-ko', !isEn);
    });
  }
}

export function updateSidebarActive() {
  const currentPath = getCurrentPath();
  document.querySelectorAll('.nav-link').forEach(link => {
    const p = link.getAttribute('data-path');
    const isWmRoot = p === '/guideline/wordmark' && (currentPath === '/' || currentPath === '/guideline' || currentPath === '/guideline/wordmark');
    const isGovRoot = p === '/gov/logo-fit' && (currentPath === '/gov/logo-fit' || currentPath === '/gov/icon-generator' || currentPath === '/gov/visual-dna');
    const isMatch = p === currentPath || isWmRoot || isGovRoot;
    link.classList.toggle('active', isMatch);
  });
  document.querySelectorAll('.nav-sub-list').forEach(subList => {
    const parent = subList.getAttribute('data-parent');
    const isWmRoot = parent === '/guideline/wordmark' && (currentPath === '/' || currentPath === '/guideline' || currentPath === '/guideline/wordmark');
    const isGovRoot = parent === '/gov/logo-fit' && (currentPath === '/gov/logo-fit' || currentPath === '/gov/icon-generator' || currentPath === '/gov/visual-dna');
    subList.style.display = (parent === currentPath || isWmRoot || isGovRoot) ? 'flex' : 'none';
  });
  document.querySelectorAll('.nav-sub-link[data-subpath]').forEach(sub => {
    const sp = sub.getAttribute('data-subpath');
    const active = currentPath === sp || (sp === '/gov/icon-generator' && currentPath === '/gov/visual-dna');
    sub.classList.toggle('active', active);
    sub.style.color = active ? '#000000' : '#7A808C';
    sub.style.fontWeight = active ? '700' : '400';
  });
}

/**
 * Design Guide 통합 페이지에서 스크롤 위치에 따라
 * 현재 보고 있는 섹션(WORDMARK ~ TYPOGRAPHY) 및 하위 블록을 블랙+볼드로 실시간 활성화
 */
export function setDesignGuideScrollActive(activePath, activeBlockId = null) {
  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    const p = link.getAttribute('data-path');
    const isMatch = p === activePath;
    link.classList.toggle('active', isMatch);
  });

  document.querySelectorAll('.nav-sub-list').forEach(subList => {
    const parent = subList.getAttribute('data-parent');
    if (parent === '/gov/logo-fit') return; // governance sub-list 별도 유지
    subList.style.display = parent === activePath ? 'flex' : 'none';
  });

  document.querySelectorAll('.nav-sub-link[data-scroll]').forEach(sub => {
    const scrollTarget = sub.getAttribute('data-scroll');
    const active = scrollTarget === activeBlockId;
    sub.classList.toggle('active', active);
    sub.style.color = active ? '#000000' : '#7A808C';
    sub.style.fontWeight = active ? '700' : '400';
  });
}
