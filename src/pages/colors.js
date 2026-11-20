/* ═══════════════════════════════════════════════════════════════
   Brand Color Page (MAIN COLORS & PRODUCT COLORS)
   래퍼런스 디자인 100% 반영:
   - MAIN COLORS: VITALBEAUTIE BLACK & White 2단 레이아웃
   - PRODUCT COLORS: 채널 필터 + 검색 + 4열 대형 팬톤 컬러칩 그리드
   ═══════════════════════════════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';
import { copyToClipboard, showToast } from '../utils/helpers.js';
import { t } from '../utils/i18n.js';

export function renderColorPage(container) {
  const brand = getBrand();
  if (!brand) return;

  const { colors } = brand;
  const channels = colors.channels || {};
  const ecomCats = channels.ecommerce?.categories || [];
  const newcomCats = channels.newcommerce?.categories || [];

  const totalCount =
    ecomCats.reduce((acc, c) => acc + (c.products?.length || 0), 0) +
    newcomCats.reduce((acc, c) => acc + (c.products?.length || 0), 0);

  function cleanCategoryLabel(channelPrefix, rawName) {
    // e.g. "01. 이너뷰티 (Inner Beauty)" -> "이커머스 · 이너뷰티"
    const stripped = String(rawName || '')
      .replace(/^\d+\.\s*/, '')
      .replace(/\s*\([^)]*\)\s*$/, '')
      .trim();
    return `${channelPrefix} · ${stripped}`;
  }

  function renderSingleCard(p) {
    const isSpecial = p.chipLabel || p.isSpecial;
    const bgStyle = isSpecial
      ? 'background: #F4F5F8;'
      : `background: ${p.hex};`;
    const innerText = p.chipLabel
      ? `<span style="font-family:var(--font-ko); font-size:11px; font-weight:600; color:#555e70; text-align:center; padding:8px;">${p.chipLabel}</span>`
      : '';

    return `
      <div class="color-item-card" data-hex="${p.hex}" data-pantone="${p.pantone || ''}" style="display:flex; flex-direction:column; background:#ffffff; cursor:pointer;" title="${t('클릭하여 HEX 복사', 'Click to copy HEX')}">
        <div style="width:100%; aspect-ratio: 1.32 / 1; min-height:140px; ${bgStyle} display:flex; align-items:center; justify-content:center; position:relative;">
          ${innerText}
        </div>

        <div style="padding-top:12px; font-family:var(--font-en);">
          <div style="font-family:var(--font-ko); font-size:13px; font-weight:700; color:#101820; margin-bottom:5px; line-height:1.3;">
            ${p.name}
          </div>
          <div style="font-size:11px; color:#555e70; line-height:1.65; letter-spacing:0.2px;">
            <div>${p.pantone ? p.pantone.toUpperCase() : 'PANTONE -'}</div>
            <div style="display:inline-flex; align-items:center; gap:6px; margin:2px 0; padding:2px 6px; border:1px solid #E1E4ED; background:#F8F9FC; color:#101820; font-weight:600;" class="hex-copy-pill">
              <span>HEX ${p.hex}</span>
              <span class="hex-copy-badge" style="font-size:9px; color:#7A808C; letter-spacing:0.5px;">COPY</span>
            </div>
            <div>RGB ${p.rgb}</div>
            <div>CMYK ${p.cmyk}</div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="guide-section" id="section-colors" style="margin-bottom:80px; scroll-margin-top:80px;">
      <!-- Top Intro Header -->
      <div style="margin-bottom:48px;">
        <h2 style="font-family:var(--font-en); font-size:26px; font-weight:300; letter-spacing:2.5px; margin:0 0 18px 0; text-transform:uppercase; color:#101820;">
          BRAND COLOR
        </h2>
        <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:680px; margin-bottom:14px;">
          ${t('바이탈뷰티 주요 아이덴티티 색상 및 제품 라인업별 팬톤 매핑입니다. 카드를 클릭하면 HEX 값이 복사됩니다.', 'Official VITALBEAUTIE identity colors and product Pantone mapping. Click any card to copy its HEX code.')}
        </div>
      </div>
      <!-- Block 1: MAIN COLORS -->
      <div class="guide-block" id="block-color-main">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">MAIN COLORS</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75; word-break:keep-all;">
            ${t('바이탈뷰티 주요 아이덴티티 색상입니다. 적용 매체에 따라 화면용 RGB, 인쇄용 CMYK 또는 지정된 별색을 선택합니다.', 'Primary identity colors of VITALBEAUTIE. Select RGB for screen, CMYK for print, or designated spot Pantone colors according to the medium.')}
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:flex; gap:32px; flex-wrap:wrap; align-items:flex-start;">
            <!-- VITALBEAUTIE BLACK -->
            <div class="color-item-card" data-hex="#101820" data-pantone="PANTONE Black 6 C" style="width:210px; cursor:pointer;" title="${t('클릭하여 HEX 복사', 'Click to copy HEX')}">
              <div style="width:100%; height:136px; background:#101820; margin-bottom:14px;"></div>
              <div style="font-family:var(--font-en); font-size:12.5px; font-weight:700; color:#101820; margin-bottom:6px; letter-spacing:0.3px;">
                VITALBEAUTIE BLACK
              </div>
              <div style="font-family:var(--font-en); font-size:11px; color:#7A808C; line-height:1.65;">
                <div style="display:inline-flex; align-items:center; gap:6px; margin:2px 0; padding:2px 6px; border:1px solid #E1E4ED; background:#F8F9FC; color:#101820; font-weight:600;">
                  <span>HEX #101820</span>
                  <span class="hex-copy-badge" style="font-size:9px; color:#7A808C;">COPY</span>
                </div>
                <div>RGB 16, 24, 32</div>
                <div>CMYK 82.19, 68.18, 66.46, 88.93</div>
                <div>PANTONE Black 6 C</div>
              </div>
            </div>

            <!-- White -->
            <div class="color-item-card" data-hex="#FFFFFF" data-pantone="White" style="width:210px; cursor:pointer;" title="${t('클릭하여 HEX 복사', 'Click to copy HEX')}">
              <div style="width:100%; height:136px; background:#FFFFFF; border:1px solid #ECEEF2; margin-bottom:14px;"></div>
              <div style="font-family:var(--font-en); font-size:12.5px; font-weight:700; color:#101820; margin-bottom:6px;">
                White
              </div>
              <div style="font-family:var(--font-en); font-size:11px; color:#7A808C; line-height:1.65;">
                <div style="display:inline-flex; align-items:center; gap:6px; margin:2px 0; padding:2px 6px; border:1px solid #E1E4ED; background:#F8F9FC; color:#101820; font-weight:600;">
                  <span>HEX #FFFFFF</span>
                  <span class="hex-copy-badge" style="font-size:9px; color:#7A808C;">COPY</span>
                </div>
                <div style="font-family:var(--font-ko);">${t('색상 배경 · 반전 로고', 'Colored Background · Inverted Logo')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Block 2: PRODUCT COLORS -->
      <div id="block-color-product" style="margin-top:44px; scroll-margin-top:88px;">
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:22px;">
          <h3 style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px; color:#101820; margin:0; text-transform:uppercase;">
            PRODUCT COLORS
          </h3>
          <a href="#/gov/family-look" style="font-family:var(--font-en); font-size:10.5px; font-weight:500; letter-spacing:1.2px; color:#101820; text-decoration:none;">
            PANTONE PROPOSAL →
          </a>
        </div>

        <div style="font-size:12.5px; color:#222; margin-bottom:14px;">
          Channel &amp; Category Pantone Matrix (제품별 공식 팬톤 컬러 매핑)
        </div>

        <!-- Filter & Search Bar -->
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:32px; flex-wrap:wrap;">
          <button type="button" class="pc-filter-btn active" data-channel="all" style="height:36px; padding:0 16px; border:1px solid #101820; background:#101820; color:#ffffff; font-size:12px; cursor:pointer;">
            전체 라인업 (${totalCount})
          </button>
          <button type="button" class="pc-filter-btn" data-channel="ecommerce" style="height:36px; padding:0 16px; border:1px solid #101820; background:#ffffff; color:#101820; font-size:12px; cursor:pointer;">
            이커머스 채널 (${ecomCats.length}개 카테고리)
          </button>
          <button type="button" class="pc-filter-btn" data-channel="newcommerce" style="height:36px; padding:0 16px; border:1px solid #101820; background:#ffffff; color:#101820; font-size:12px; cursor:pointer;">
            뉴커머스 채널 (${newcomCats.length}개 카테고리)
          </button>
          <input type="text" id="pc-search-input" placeholder="제품명 또는 팬톤 번호 검색 (예: 213C, 메타그린)" style="flex:1; min-width:220px; height:36px; padding:0 12px; border:1px solid #D5D8DE; font-size:12px; color:#101820; outline:none;" />
          <button type="button" id="pc-reset-btn" style="height:36px; padding:0 16px; border:1px solid #101820; background:#ffffff; color:#101820; font-size:12px; cursor:pointer;">
            초기화
          </button>
        </div>

        <!-- Product Colors Matrix Container -->
        <div id="pc-matrix-container"></div>
      </div>
    </section>
  `;

  let activeChannel = 'all';
  let searchQuery = '';

  const matrixContainer = container.querySelector('#pc-matrix-container');
  const filterBtns = container.querySelectorAll('.pc-filter-btn');
  const searchInput = container.querySelector('#pc-search-input');
  const resetBtn = container.querySelector('#pc-reset-btn');

  function renderMatrix() {
    const groups = [];
    if (activeChannel === 'all' || activeChannel === 'ecommerce') {
      ecomCats.forEach(cat => {
        groups.push({
          label: cleanCategoryLabel('이커머스', cat.categoryName),
          products: cat.products || [],
        });
      });
    }
    if (activeChannel === 'all' || activeChannel === 'newcommerce') {
      newcomCats.forEach(cat => {
        groups.push({
          label: cleanCategoryLabel('뉴커머스', cat.categoryName),
          products: cat.products || [],
        });
      });
    }

    const q = searchQuery.trim().toLowerCase();
    const html = groups
      .map(g => {
        const filtered = g.products.filter(p => {
          if (!q) return true;
          const hay = `${p.name || ''} ${p.pantone || ''} ${p.hex || ''}`.toLowerCase();
          return hay.includes(q);
        });
        if (!filtered.length) return '';
        return `
          <div class="category-color-section" style="margin-bottom:44px;">
            <div style="font-family:var(--font-ko); font-size:11.5px; color:#666B75; margin-bottom:14px;">
              ${g.label}
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:28px 20px;">
              ${filtered.map(p => renderSingleCard(p)).join('')}
            </div>
          </div>
        `;
      })
      .join('');

    matrixContainer.innerHTML = html || `<div style="padding:40px 0; color:#7A808C; font-size:13px;">검색 결과가 없습니다.</div>`;
    bindCardClicks();
  }

  function bindCardClicks() {
    container.querySelectorAll('.color-item-card').forEach(card => {
      card.onclick = () => {
        const hex = card.dataset.hex;
        const pantone = card.dataset.pantone;
        copyToClipboard(hex);
        const badge = card.querySelector('.hex-copy-badge');
        if (badge) {
          badge.textContent = 'COPIED';
          badge.style.color = '#101820';
          setTimeout(() => {
            badge.textContent = 'COPY';
            badge.style.color = '#7A808C';
          }, 1400);
        }
        showToast(t(`HEX 코드 복사 완료: ${hex}${pantone ? ' (' + pantone + ')' : ''}`, `Copied HEX: ${hex}${pantone ? ' (' + pantone + ')' : ''}`));
      };
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeChannel = btn.dataset.channel;
      filterBtns.forEach(b => {
        const isAct = b === btn;
        b.classList.toggle('active', isAct);
        b.style.background = isAct ? '#101820' : '#ffffff';
        b.style.color = isAct ? '#ffffff' : '#101820';
      });
      renderMatrix();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value || '';
      renderMatrix();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeChannel = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      filterBtns.forEach(b => {
        const isAct = b.dataset.channel === 'all';
        b.classList.toggle('active', isAct);
        b.style.background = isAct ? '#101820' : '#ffffff';
        b.style.color = isAct ? '#ffffff' : '#101820';
      });
      renderMatrix();
    });
  }

  renderMatrix();
}
