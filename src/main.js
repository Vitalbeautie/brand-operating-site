/* ═══════════════════════════════════════
   Brand Operating Site — Main Entry
   ═══════════════════════════════════════ */
import { loadBrand } from './utils/brand.js';
import { registerRoute, startRouter, refreshCurrentRoute } from './utils/router.js';
import { renderSidebar, updateSidebarActive, isDesignGuidePath } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { onLangChange, translateDomIfEn } from './utils/i18n.js';
import { renderGuidelinePage } from './pages/guideline.js';
import { renderStrategyPage } from './pages/strategy.js';
import { renderAssetPage, renderAssetLibraryPage } from './pages/assets.js';
import { renderColorPage } from './pages/colors.js';
import { renderTypographyPage } from './pages/typography.js';
import { renderVersionPage } from './pages/versions.js';
import { renderLogoFitPage, renderVisualDnaPage, renderFamilyLookPage, renderLocalizationPage } from './pages/governance.js';

function init() {
  // Load brand synchronously (0ms)
  loadBrand('sample-brand');

  // Render shell
  renderSidebar(document.getElementById('sidebar'));
  renderHeader(document.getElementById('header'));

  // Register routes (Brand Guideline as unified continuous scroll: Wordmark → Typography)
  registerRoute('/', (el) => renderGuidelinePage(el, 'wordmark'));
  registerRoute('/guideline', (el) => renderGuidelinePage(el, 'wordmark'));
  registerRoute('/guideline/wordmark', (el) => renderGuidelinePage(el, 'wordmark'));
  registerRoute('/guideline/monogram', (el) => renderGuidelinePage(el, 'monogram'));
  registerRoute('/strategy', (el) => renderGuidelinePage(el, 'slogan'));
  registerRoute('/assets', (el) => renderAssetLibraryPage(el));
  registerRoute('/colors', (el) => renderGuidelinePage(el, 'colors'));
  registerRoute('/typography', (el) => renderGuidelinePage(el, 'typography'));
  registerRoute('/versions', (el) => renderVersionPage(el));
  registerRoute('/gov/logo-fit', (el) => renderLogoFitPage(el, 'layout'));
  registerRoute('/gov/icon-generator', (el) => renderLogoFitPage(el, 'icon'));
  registerRoute('/gov/visual-dna', (el) => renderLogoFitPage(el, 'icon'));
  registerRoute('/gov/family-look', (el) => renderFamilyLookPage(el));
  registerRoute('/gov/localization', (el) => renderLocalizationPage(el));
  registerRoute('/gov/asset-library', (el) => renderAssetLibraryPage(el));
  registerRoute('/gov/package-front', (el) => renderAssetLibraryPage(el));

  // Start router immediately
  startRouter((path) => {
    if (!isDesignGuidePath(path) && window.__dgScrollSpy) {
      window.removeEventListener('scroll', window.__dgScrollSpy);
      window.__dgScrollSpy = null;
    }
    updateSidebarActive();
    renderHeader(document.getElementById('header'));
    translateDomIfEn(document.getElementById('content'));
  });

  // Re-render entire UI when language is toggled (EN <-> KR)
  onLangChange(() => {
    renderSidebar(document.getElementById('sidebar'));
    renderHeader(document.getElementById('header'));
    refreshCurrentRoute();
    translateDomIfEn(document.getElementById('content'));
  });

  const content = document.getElementById('content');
  if (content) {
    content.style.opacity = '1';
  }
}

// Execute immediately
init();
