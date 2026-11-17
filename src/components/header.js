/* ═══════════════════════════════════════
   Header Component (Mobile Bar & Title Sync)
   ═══════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';
import { getCurrentPath } from '../utils/router.js';
import { isEn, toggleLang } from '../utils/i18n.js';

const PAGE_INFO = {
  '/': { title: 'BRAND GUIDELINE', section: 'DESIGN GUIDE' },
  '/guideline': { title: 'BRAND GUIDELINE', section: 'DESIGN GUIDE' },
  '/guideline/wordmark': { title: 'BRAND GUIDELINE', section: 'DESIGN GUIDE' },
  '/guideline/monogram': { title: 'BRAND GUIDELINE', section: 'DESIGN GUIDE' },
  '/strategy': { title: 'BRAND GUIDELINE', section: 'DESIGN GUIDE' },
  '/colors': { title: 'BRAND GUIDELINE', section: 'DESIGN GUIDE' },
  '/typography': { title: 'BRAND GUIDELINE', section: 'DESIGN GUIDE' },
  '/gov/logo-fit': { title: 'BRAND VISIBILITY', section: 'BI / PI GOVERNANCE' },
  '/gov/icon-generator': { title: 'BRAND VISIBILITY', section: 'BI / PI GOVERNANCE' },
  '/gov/visual-dna': { title: 'BRAND VISIBILITY', section: 'BI / PI GOVERNANCE' },
  '/gov/family-look': { title: '02 FAMILY LOOK', section: 'BI / PI GOVERNANCE' },
  '/gov/localization': { title: '03 LOCALIZATION', section: 'BI / PI GOVERNANCE' },
  '/gov/asset-library': { title: '04 ASSET LIBRARY', section: 'BI / PI GOVERNANCE' },
  '/gov/package-front': { title: '04 ASSET LIBRARY', section: 'BI / PI GOVERNANCE' },
  '/assets': { title: 'ASSET LIBRARY', section: 'ARCHIVE' },
  '/versions': { title: 'VERSION HISTORY', section: 'ARCHIVE' }
};

export function renderHeader(container) {
  const brand = getBrand();
  const currentPath = getCurrentPath();
  const info = PAGE_INFO[currentPath] || { title: 'BRAND GUIDELINE', section: 'VITALBEAUTIE' };

  // Update desktop fixed title bar if present
  const titleDisplay = document.getElementById('page-title-display');
  const breadcrumbDisplay = document.getElementById('page-breadcrumb');
  if (titleDisplay) {
    titleDisplay.textContent = info.title;
  }
  if (breadcrumbDisplay) {
    breadcrumbDisplay.style.display = 'none';
  }

  // Render Mobile Header Bar with Official 2nd Image Wordmark
  container.innerHTML = `
    <div class="mobile-header-inner">
      <div class="mobile-logo" id="mobile-logo-btn" onclick="location.hash='#/'" style="cursor: pointer; display: flex; align-items: baseline; gap: 8px;">
        <img src="/assets/logos/vitalbeautie_logo_hr.png" alt="VITALBEAUTIE" style="height: 15px; width: auto; display: block;" />
        <span class="mobile-header-subtitle">BRAND GUIDELINE</span>
      </div>
      <div class="mobile-actions">
        <button id="header-lang-toggle-btn" class="header-action-btn btn-lang-square" title="Language">${isEn() ? 'KR' : 'EN'}</button>
        <button id="menu-toggle-btn" class="header-action-btn hamburger-btn" title="메뉴">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  `;

  setupMobileMenu(container);
}

function setupMobileMenu(container) {
  const toggleBtn = container.querySelector('#menu-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('sidebar-open');
      if (overlay) overlay.classList.remove('active');
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('sidebar-open');
      overlay.classList.remove('active');
    });
  }

  const langBtn = container.querySelector('#header-lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      toggleLang();
    });
  }
}
