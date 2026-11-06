/* ═══════════════════════════════════════
   Brand Operating Site — Main Entry
   ═══════════════════════════════════════ */
import { loadBrand } from './utils/brand.js';
import { registerRoute, startRouter } from './utils/router.js';
import { renderSidebar, updateSidebarActive, isDesignGuidePath } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { renderGuidelinePage } from './pages/guideline.js';
import { renderStrategyPage } from './pages/strategy.js';
import { renderAssetPage } from './pages/assets.js';
import { renderColorPage } from './pages/colors.js';
import { renderTypographyPage } from './pages/typography.js';
import { renderVersionPage } from './pages/versions.js';
import { renderLogoFitPage, renderVisualDnaPage, renderFamilyLookPage, renderLocalizationPage, renderPackageFrontPage } from './pages/governance.js';

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
  registerRoute('/assets', (el) => renderAssetPage(el));
  registerRoute('/colors', (el) => renderGuidelinePage(el, 'colors'));
  registerRoute('/typography', (el) => renderGuidelinePage(el, 'typography'));
  registerRoute('/versions', (el) => renderVersionPage(el));
  registerRoute('/gov/logo-fit', (el) => renderLogoFitPage(el, 'layout'));
  registerRoute('/gov/icon-generator', (el) => renderLogoFitPage(el, 'icon'));
  registerRoute('/gov/visual-dna', (el) => renderLogoFitPage(el, 'icon'));
  registerRoute('/gov/family-look', (el) => renderFamilyLookPage(el));
  registerRoute('/gov/localization', (el) => renderLocalizationPage(el));
  registerRoute('/gov/package-front', (el) => renderPackageFrontPage(el));

  // Start router immediately
  startRouter((path) => {
    if (!isDesignGuidePath(path) && window.__dgScrollSpy) {
      window.removeEventListener('scroll', window.__dgScrollSpy);
      window.__dgScrollSpy = null;
    }
    updateSidebarActive();
    renderHeader(document.getElementById('header'));
  });

  const content = document.getElementById('content');
  if (content) {
    content.style.opacity = '1';
  }
}

// Execute immediately
init();
