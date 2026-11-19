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
  // 01. DESIGN CREATION
  '/creation/layout-proposal': { title: 'LAYOUT PROPOSAL', section: '01 DESIGN CREATION' },
  '/creation/icon-generator': { title: 'ICON GENERATOR', section: '01 DESIGN CREATION' },
  '/creation/color-recommender': { title: 'COLOR RECOMMENDER', section: '01 DESIGN CREATION' },
  // 02. DESIGN VALIDATION
  '/validation/design-checker': { title: 'DESIGN CHECKER & AUTO FIX', section: '02 DESIGN VALIDATION' },
  // 03. GLOBAL LOCALIZATION
  '/localization/layout-simulator': { title: 'LAYOUT SIMULATOR', section: '03 GLOBAL LOCALIZATION' },
  '/localization/packaging-production': { title: 'PACKAGING PRODUCTION', section: '03 GLOBAL LOCALIZATION' },
  // Legacy aliases (backward compatibility)
  '/gov/logo-fit': { title: 'LAYOUT PROPOSAL', section: '01 DESIGN CREATION' },
  '/gov/icon-generator': { title: 'ICON GENERATOR', section: '01 DESIGN CREATION' },
  '/gov/visual-dna': { title: 'ICON GENERATOR', section: '01 DESIGN CREATION' },
  '/gov/family-look': { title: 'COLOR RECOMMENDER', section: '01 DESIGN CREATION' },
  '/gov/design-checker': { title: 'DESIGN CHECKER & AUTO FIX', section: '02 DESIGN VALIDATION' },
  '/gov/localization': { title: 'LAYOUT SIMULATOR', section: '03 GLOBAL LOCALIZATION' },
  '/gov/packaging-production': { title: 'PACKAGING PRODUCTION', section: '03 GLOBAL LOCALIZATION' },
  '/gov/asset-library': { title: 'ASSET LIBRARY', section: 'ARCHIVE' },
  '/gov/package-front': { title: 'ASSET LIBRARY', section: 'ARCHIVE' },
  // ARCHIVE
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
        <img src="./assets/logos/vitalbeautie_logo_hr.png" alt="VITALBEAUTIE" style="height: 15px; width: auto; display: block;" />
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
