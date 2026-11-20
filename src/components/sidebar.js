/* ═══════════════════════════════════════
   Sidebar Component (AP Beauty Editorial Design)
   - 마우스오버 시 하위탭 슬라이드 확장 & 글씨 스케일 업
   - 국·영문 통합 키워드 검색 (로고, 심볼, 모노그램, 아이콘 등 입력 시 즉시 해당 페이지 이동)
   - 하단 EN / KR 언어 전환 버튼
   ═══════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';
import { getCurrentPath, navigate } from '../utils/router.js';
import { isEn, toggleLang, t } from '../utils/i18n.js';

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
          { target: 'block-mono-1', label: 'CORE MONOGRAM' },
          { target: 'block-mono-2', label: 'SYSTEM' },
          { target: 'block-mono-3', label: 'PLACEMENT GUIDE' },
          { target: 'block-mono-4', label: 'EXCLUSION ZONE' },
          { target: 'block-mono-5', label: 'MINIMUM SIZE' },
          { target: 'block-mono-6', label: 'INCORRECT USAGE' },
          { target: 'block-mono-7', label: 'BACKGROUND USAGE' },
        ],
      },
      {
        path: '/strategy',
        sectionId: 'section-slogan',
        label: 'SLOGAN',
        num: '03',
        subItems: [
          { target: 'block-slogan-1', label: 'CORE SLOGAN' },
          { target: 'block-slogan-2', label: 'BRAND STORY' },
        ],
      },
      {
        path: '/colors',
        sectionId: 'section-colors',
        label: 'BRAND COLOR',
        num: '04',
        subItems: [
          { target: 'block-color-main', label: 'MAIN COLORS' },
          { target: 'block-color-product', label: 'PRODUCT COLORS' },
        ],
      },
      {
        path: '/typography',
        sectionId: 'section-typography',
        label: 'TYPOGRAPHY',
        num: '05',
        subItems: [
          { target: 'block-typo-en', label: 'ENGLISH TYPOGRAPHY' },
          { target: 'block-typo-kr', label: 'KOREAN TYPOGRAPHY' },
          { target: 'block-typo-jp', label: 'JAPANESE TYPOGRAPHY' },
        ],
      },
    ],
  },
  {
    section: 'BI / PI GOVERNANCE',
    items: [
      {
        path: '/creation/layout-proposal',
        label: '01 DESIGN CREATION',
        num: 'G1',
        subItems: [
          { path: '/creation/layout-proposal', aliases: ['/gov/logo-fit'], label: 'LAYOUT PROPOSAL' },
          { path: '/creation/icon-generator', aliases: ['/gov/icon-generator', '/gov/visual-dna'], label: 'ICON GENERATOR' },
          { path: '/creation/color-recommender', aliases: ['/gov/family-look'], label: 'COLOR RECOMMENDER' },
        ],
      },
      {
        path: '/validation/design-checker',
        label: '02 DESIGN VALIDATION',
        num: 'G2',
        subItems: [
          { path: '/validation/design-checker', aliases: ['/gov/design-checker'], label: 'DESIGN CHECKER & AUTO FIX' },
        ],
      },
      {
        path: '/localization/layout-simulator',
        label: '03 GLOBAL LOCALIZATION',
        num: 'G3',
        subItems: [
          { path: '/localization/layout-simulator', aliases: ['/gov/localization'], label: 'LAYOUT SIMULATOR' },
          { path: '/localization/packaging-production', aliases: ['/gov/packaging-production'], label: 'PACKAGING PRODUCTION' },
        ],
      },
    ],
  },
  {
    section: 'ARCHIVE',
    items: [
      { path: '/assets', label: 'ASSET LIBRARY', num: '06' },
      { path: '/versions', label: 'VERSION HISTORY', num: '07' },
    ],
  },
];

// 국문·영문 통합 검색 인덱스
const SEARCH_INDEX = [
  {
    title: 'WORDMARK (로고 · 워드마크)',
    sub: 'DESIGN GUIDE · 영문/국문 로고, 최소여백, 최소크기',
    path: '/guideline/wordmark',
    scrollId: 'section-wordmark',
    keywords: ['로고', '워드마크', '로고타입', '바이탈뷰티로고', '여백', '최소크기', '배경규정', '오용사례', 'wordmark', 'logo', 'logotype', 'exclusion', 'clearspace', 'minimum size'],
  },
  {
    title: 'MONOGRAM / SYMBOL (심볼 · 모노그램)',
    sub: 'DESIGN GUIDE · LAB PROVEN 심볼마크 규정',
    path: '/guideline/monogram',
    scrollId: 'section-monogram',
    keywords: ['심볼', '모노그램', '랩프루븐', '엠블럼', '원형로고', '심볼마크', 'symbol', 'monogram', 'lab proven', 'emblem', 'mark'],
  },
  {
    title: 'SLOGAN & STORY (슬로건 · 브랜드 스토리)',
    sub: 'DESIGN GUIDE · HIGH-PERFORMANCE WELLNESS',
    path: '/strategy',
    scrollId: 'section-slogan',
    keywords: ['슬로건', '브랜드스토리', '스토리', '전략', '철학', '웰니스', 'slogan', 'brand story', 'story', 'strategy', 'philosophy'],
  },
  {
    title: 'BRAND COLOR (브랜드 컬러 · 팬톤)',
    sub: 'DESIGN GUIDE · 메인 컬러 & 전 제품 팬톤 매트릭스 (HEX 복사)',
    path: '/colors',
    scrollId: 'section-colors',
    keywords: ['컬러', '색상', '브랜드컬러', '팬톤', '블랙', '화이트', '색상코드', '헥스', 'color', 'brand color', 'pantone', 'hex', 'palette', 'swatch'],
  },
  {
    title: 'TYPOGRAPHY (타이포그래피 · 국/영/일 서체)',
    sub: 'DESIGN GUIDE · Raleway(영문) · RIX신고딕(국문) · Noto Sans JP(일문)',
    path: '/typography',
    scrollId: 'section-typography',
    keywords: ['타이포그래피', '타이포', '서체', '폰트', '글꼴', '영문서체', '국문서체', '일문서체', '일본어', '랄웨이', '신고딕', '본고딕', 'typography', 'font', 'typeface', 'raleway', 'korean', 'english', 'japanese'],
  },
  {
    title: 'LAYOUT PROPOSAL (패키지 레이아웃 생성)',
    sub: '01 DESIGN CREATION · 단상자 전면 규격 · 로고 가시성 시뮬레이터',
    path: '/creation/layout-proposal',
    scrollId: null,
    keywords: ['레이아웃', '시뮬레이션', '시뮬레이터', '가시성', '단상자', '패키지', '제품명', '건강기능식품', 'layout', 'proposal', 'simulation', 'visibility', 'logo fit', 'package'],
  },
  {
    title: 'ICON GENERATOR (기능 아이콘 생성기)',
    sub: '01 DESIGN CREATION · 바이탈뷰티 픽토그램 생성 및 벡터 다운로드',
    path: '/creation/icon-generator',
    scrollId: null,
    keywords: ['아이콘', '픽토그램', '배지', '모티프', '아이콘생성', '아이콘제너레이터', '과일', '채소', '다이어트', '콜라겐', '신체기관', '수면', 'icon', 'icon generator', 'badge', 'pictogram', 'motif'],
  },
  {
    title: 'COLOR RECOMMENDER (컬러 추천 · 구 Family Look)',
    sub: '01 DESIGN CREATION · 성분·기능 기반 차별화 PANTONE 컬러 후보 추천',
    path: '/creation/color-recommender',
    scrollId: null,
    keywords: ['컬러추천', '색상추천', '패밀리룩', '색차', '팬톤추천', 'color recommender', 'family look', 'color recommendation', 'delta e'],
  },
  {
    title: 'DESIGN CHECKER & AUTO FIX (AI 원고 검수 및 자동 수정)',
    sub: '02 DESIGN VALIDATION · Illustrator AI 원고 규칙 검수 및 자동 수정',
    path: '/validation/design-checker',
    scrollId: null,
    keywords: ['검수', '체커', '자동수정', '오토픽스', '프리플라이트', '칼선', '원고검수', 'design validation', 'design checker', 'auto fix', 'preflight', 'ai'],
  },
  {
    title: 'LAYOUT SIMULATOR (국가별 패키지 레이아웃 시뮬레이터)',
    sub: '03 GLOBAL LOCALIZATION · 한국·미국·일본 표시 형식 전면 시뮬레이션',
    path: '/localization/layout-simulator',
    scrollId: null,
    keywords: ['로컬라이제이션', '시뮬레이터', '다국어', '번역', '수출', '미국', '일본', '영문패키지', '일문패키지', 'fda', 'caa', 'mfds', 'localization', 'layout simulator'],
  },
  {
    title: 'PACKAGING PRODUCTION (Excel → AI 자동 조판)',
    sub: '03 GLOBAL LOCALIZATION · 승인 엑셀 문안 Illustrator 6면 도면 자동 배치',
    path: '/localization/packaging-production',
    scrollId: null,
    keywords: ['패키징프로덕션', '엑셀', '도면', '자동배치', '전개도', '인허가', 'packaging production', 'excel', 'xlsx', 'dieline', 'auto layout'],
  },
  {
    title: 'ASSET LIBRARY (공식 에셋 라이브러리)',
    sub: 'ARCHIVE · 워드마크 · 심볼 PDF / AI / PNG / SVG 다운로드',
    path: '/assets',
    scrollId: null,
    keywords: ['에셋', '다운로드', '원본', '자료실', '라이브러리', '일러스트', 'ai', 'svg', 'gmp', '건강기능식품마크', 'asset', 'library', 'download'],
  },
  {
    title: 'VERSION HISTORY (버전 히스토리)',
    sub: 'ARCHIVE · 브랜드 가이드 및 디자인 파일 버전 관리',
    path: '/versions',
    scrollId: null,
    keywords: ['버전', '히스토리', '연혁', '업데이트', 'version', 'history', 'changelog'],
  },
];

function isSubItemMatched(sub, currentPath) {
  if (!sub || !sub.path) return false;
  if (sub.path === currentPath) return true;
  if (Array.isArray(sub.aliases) && sub.aliases.includes(currentPath)) return true;
  return false;
}

function isGroupMatched(item, currentPath) {
  if (item.path === '/guideline/wordmark' && (currentPath === '/' || currentPath === '/guideline' || currentPath === '/guideline/wordmark')) {
    return true;
  }
  if (item.path === currentPath) return true;
  if (Array.isArray(item.subItems) && item.subItems.some(sub => isSubItemMatched(sub, currentPath))) {
    return true;
  }
  return false;
}

export function renderSidebar(container) {
  if (!container) return;
  const brand = getBrand();
  const currentPath = getCurrentPath();

  let navHtml = '';
  NAV_SECTIONS.forEach(section => {
    navHtml += `<div class="sidebar-section-label">${section.section}</div>`;
    section.items.forEach(item => {
      const active = isGroupMatched(item, currentPath) ? ' active' : '';

      navHtml += `<div class="nav-group${active}" data-group-path="${item.path}">`;
      navHtml += `
        <a href="#${item.path}" class="nav-link${active}" data-path="${item.path}" ${item.sectionId ? `data-section="${item.sectionId}"` : ''}>
          <span>${item.label}</span>
        </a>`;
      if (item.subItems) {
        navHtml += `<div class="nav-sub-list" data-parent="${item.path}">
          ${item.subItems.map((sub, sIdx) => {
            const subHref = sub.path ? `#${sub.path}` : `#${item.path}`;
            const isSubActive = sub.path
              ? isSubItemMatched(sub, currentPath)
              : (active && sIdx === 0);
            const aliasAttr = Array.isArray(sub.aliases) ? `data-aliases="${sub.aliases.join(',')}"` : '';
            return `
            <a href="${subHref}" class="nav-sub-link${isSubActive ? ' active' : ''}" ${sub.target ? `data-scroll="${sub.target}"` : ''} ${sub.path ? `data-subpath="${sub.path}"` : ''} ${aliasAttr}>
              ${sub.label}
            </a>`;
          }).join('')}
        </div>`;
      }
      navHtml += `</div>`;
    });
  });

  const latestVersion = brand?.versions?.[0];
  // 국문(KR) 상태일 때는 영문 전환을 뜻하는 'EN' 표시, 영문(EN) 상태일 때는 국문 전환을 뜻하는 'KR' 표시
  const langBtnLabel = isEn() ? 'KR' : 'EN';

  container.innerHTML = `
    <!-- Sidebar Header (Ultra-Crisp Vector Wordmark) -->
    <div class="sidebar-header" style="text-align: left; display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 28px;">
      <div class="brand-logo" id="sidebar-logo-btn" style="cursor: pointer; width: 100%; display: flex; justify-content: flex-start;" onclick="location.hash='#/'">
        <img id="brand-logo-img" src="./assets/logos/vitalbeautie_wordmark.svg" alt="VITALBEAUTIE" style="max-width: 172px; width: 100%; height: auto; display: block;" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="nav-menu" id="nav-links">
      ${navHtml}
    </nav>

    <!-- Sidebar Footer Controls (Search & Language Toggle) -->
    <div class="sidebar-controls" style="position:relative;">
      <!-- Search Results Popover -->
      <div id="sidebar-search-results" class="sidebar-search-results" style="display:none;"></div>

      <div class="search-and-lang-row">
        <!-- Search Bar -->
        <div class="search-bar-container">
          <input type="text" id="sidebar-search-input" class="search-bar-input" placeholder="${t('SEARCH (예: 로고, 아이콘)', 'SEARCH')}" autocomplete="off" />
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="6.5"></circle>
            <line x1="21" y1="21" x2="14.6" y2="14.6"></line>
          </svg>
          <button id="search-clear-btn" class="search-clear-btn" title="${t('검색 지우기', 'Clear search')}">&times;</button>
        </div>
        <!-- Language Toggle Button (EN / KR) -->
        <button id="lang-toggle-btn" class="btn-lang btn-lang-square" title="${t('영문으로 전환 (Switch to English)', '국문으로 전환 (Switch to Korean)')}">${langBtnLabel}</button>
      </div>
    </div>
  `;

  setupSidebarEvents(container);
}

function goToSearchResult(item, container) {
  if (!item) return;
  const overlay = document.getElementById('sidebar-overlay');
  container.classList.remove('sidebar-open');
  if (overlay) overlay.classList.remove('active');

  const currentPath = getCurrentPath();
  if (item.scrollId && isDesignGuidePath(currentPath) && isDesignGuidePath(item.path)) {
    history.replaceState(null, '', '#' + item.path);
    const targetEl = document.getElementById(item.scrollId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    updateSidebarActive();
    return;
  }

  navigate(item.path);
  if (item.scrollId) {
    setTimeout(() => {
      const targetEl = document.getElementById(item.scrollId);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

function setupSidebarEvents(container) {
  const overlay = document.getElementById('sidebar-overlay');
  const logoBtn = container.querySelector('#sidebar-logo-btn');

  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }

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
      if (!targetId) return;
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
      }, 90);
    });
  });

  // 국문·영문 통합 검색창
  const searchInput = container.querySelector('#sidebar-search-input');
  const clearBtn = container.querySelector('#search-clear-btn');
  const resultsBox = container.querySelector('#sidebar-search-results');
  let currentMatches = [];

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      if (!q) {
        currentMatches = [];
        if (resultsBox) {
          resultsBox.style.display = 'none';
          resultsBox.innerHTML = '';
        }
        return;
      }

      currentMatches = SEARCH_INDEX.filter(entry => {
        if (entry.title.toLowerCase().includes(q) || entry.sub.toLowerCase().includes(q)) return true;
        return entry.keywords.some(k => k.includes(q) || q.includes(k));
      });

      if (resultsBox) {
        if (currentMatches.length > 0) {
          resultsBox.style.display = 'flex';
          resultsBox.innerHTML = currentMatches.map((m, idx) => `
            <button type="button" class="sidebar-search-item" data-idx="${idx}">
              <span class="sidebar-search-item-title">${m.title}</span>
              <span class="sidebar-search-item-sub">${m.sub}</span>
            </button>
          `).join('');
          resultsBox.querySelectorAll('.sidebar-search-item').forEach(btn => {
            btn.addEventListener('click', () => {
              const targetItem = currentMatches[Number(btn.dataset.idx)];
              if (targetItem) {
                resultsBox.style.display = 'none';
                goToSearchResult(targetItem, container);
              }
            });
          });
        } else {
          resultsBox.style.display = 'flex';
          resultsBox.innerHTML = `
            <div style="padding:10px 12px; font-size:11px; color:#7A808C;">
              ${t('일치하는 메뉴가 없습니다.', 'No matching section found.')}
            </div>
          `;
        }
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentMatches.length > 0) {
        e.preventDefault();
        if (resultsBox) resultsBox.style.display = 'none';
        goToSearchResult(currentMatches[0], container);
      } else if (e.key === 'Escape') {
        if (resultsBox) resultsBox.style.display = 'none';
      }
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

  // Language toggle (EN <-> KR)
  const langBtn = container.querySelector('#lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      toggleLang();
    });
  }
}

export function updateSidebarActive() {
  const currentPath = getCurrentPath();
  const allItems = NAV_SECTIONS.flatMap(sec => sec.items);

  document.querySelectorAll('.nav-group').forEach(group => {
    const p = group.getAttribute('data-group-path');
    const itemObj = allItems.find(it => it.path === p);
    const isMatch = itemObj ? isGroupMatched(itemObj, currentPath) : (p === currentPath);
    group.classList.toggle('active', isMatch);
    const link = group.querySelector('.nav-link');
    if (link) link.classList.toggle('active', isMatch);
  });

  document.querySelectorAll('.nav-sub-link[data-subpath]').forEach(sub => {
    const sp = sub.getAttribute('data-subpath');
    const aliases = (sub.getAttribute('data-aliases') || '').split(',').filter(Boolean);
    const active = currentPath === sp || aliases.includes(currentPath);
    sub.classList.toggle('active', active);
  });
}

/**
 * Design Guide 통합 페이지에서 스크롤 위치에 따라
 * 현재 보고 있는 섹션(WORDMARK ~ TYPOGRAPHY) 및 하위 블록을 블랙+볼드로 실시간 활성화
 */
export function setDesignGuideScrollActive(activePath, activeBlockId = null) {
  document.querySelectorAll('.nav-group').forEach(group => {
    const p = group.getAttribute('data-group-path');
    if (p && (p.startsWith('/creation/') || p.startsWith('/validation/') || p.startsWith('/localization/') || p.startsWith('/gov/'))) return;
    const isMatch = p === activePath;
    group.classList.toggle('active', isMatch);
    const link = group.querySelector('.nav-link');
    if (link) link.classList.toggle('active', isMatch);
  });

  document.querySelectorAll('.nav-sub-link[data-scroll]').forEach(sub => {
    const scrollTarget = sub.getAttribute('data-scroll');
    const active = scrollTarget === activeBlockId;
    sub.classList.toggle('active', active);
  });
}
