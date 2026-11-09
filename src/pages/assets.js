/* ═══════════════════════════════════════
   Asset Library Page (VITALBEAUTIE Official Guidelines)
   ═══════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';
import { showToast } from '../utils/helpers.js';
import { buildIllustratorAiBlob, getHffMarkSvg } from '../governance/engines.js';
import { renderVbStyledIconSvg } from '../governance/iconGenerator.js';

export function renderAssetPage(container) {
  const brand = getBrand();
  if (!brand) return;

  const categories = brand.assets?.categories || [];
  let totalAssets = categories.reduce((sum, c) => sum + c.count, 0);

  let cardsHtml = categories.map(cat => `
    <div class="asset-category-card" data-cat-id="${cat.id}" ${cat.externalLink ? 'data-external="true"' : ''} style="border-radius:0;">
      <div class="cat-icon">${cat.icon}</div>
      <div class="cat-name">${cat.name}</div>
      <div class="cat-count">${cat.externalLink ? '외부 링크' : cat.count + '개 에셋'}</div>
      <div class="cat-formats">
        ${cat.formats.map(f => `<span class="format-tag" style="border-radius:0;">${f}</span>`).join('')}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="page-title">
      <div class="page-label">Asset Library & Guidelines</div>
      <h1 style="font-family:var(--font-en); font-weight:300; letter-spacing:2px;">BRAND ASSETS & IDENTITY SPECS</h1>
      <p class="page-desc">
        공식 영문/국문 워드마크, LAB PROVEN 심볼, 가이드북 PDF 원본 및 패키지/디지털 제작용 마스터 에셋 다운로드입니다.
      </p>
    </div>

    <!-- Official PDF Guide Download Banner -->
    <div class="card" style="margin-bottom:32px; border-radius:0; padding:24px; background:#F8F9FC; border:1px solid var(--ap-border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div>
        <div style="font-family:var(--font-en); font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--ap-gold);">OFFICIAL GUIDELINE DOCUMENT</div>
        <div style="font-size:18px; font-weight:700; margin-top:2px;">VITALBEAUTIE Brand Identity Guidelines (2024 Amorepacific)</div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">브랜드 스토리, 영문/국문 로고 및 그리드, LAB PROVEN 심볼, 서체, 패키지 소재 가이드 포함 (총 20페이지)</div>
      </div>
      <div style="display:flex; gap:8px;">
        <a href="/assets/guidelines/VITALBEAUTIE_Brand_Identity_Guidelines.pdf" target="_blank" class="btn btn-sm btn-outline">
          📖 PDF 브라우저 열기
        </a>
        <a href="/assets/guidelines/VITALBEAUTIE_Brand_Identity_Guidelines.pdf" download="VITALBEAUTIE_Brand_Identity_Guidelines.pdf" class="btn btn-sm btn-primary">
          ⬇ 공식 PDF 가이드북 다운로드
        </a>
      </div>
    </div>

    <!-- Stats -->
    <div style="display:flex; gap:12px; margin-bottom:28px;">
      <div class="card" style="flex:1; text-align:center; padding:20px; border-radius:0;">
        <div style="font-family:var(--font-en); font-size:28px; font-weight:700; color:var(--ap-gold);">${categories.length}</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px; font-family:var(--font-en); letter-spacing:1px;">CATEGORIES</div>
      </div>
      <div class="card" style="flex:1; text-align:center; padding:20px; border-radius:0;">
        <div style="font-family:var(--font-en); font-size:28px; font-weight:700; color:var(--ap-gold);">${totalAssets}</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px; font-family:var(--font-en); letter-spacing:1px;">TOTAL ASSETS</div>
      </div>
      <div class="card" style="flex:1; text-align:center; padding:20px; border-radius:0;">
        <div style="font-family:var(--font-en); font-size:28px; font-weight:700; color:var(--ap-gold);">${new Set(categories.flatMap(c => c.formats)).size}</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px; font-family:var(--font-en); letter-spacing:1px;">FORMAT TYPES</div>
      </div>
    </div>

    <!-- Category Grid -->
    <div class="section-subtitle">📂 에셋 카테고리</div>
    <div class="asset-category-grid" id="asset-grid" style="margin-bottom:32px;">
      ${cardsHtml}
    </div>

    <!-- Detail Panel (hidden by default) -->
    <div id="asset-detail" style="display:none; margin-bottom:32px;"></div>

    <div class="section-divider"></div>

    <!-- Interactive Logo & Symbol Preview -->
    <div class="section-subtitle">🔍 VITALBEAUTIE 로고 & 심볼 인터랙티브 프리뷰 (BI 규격 검증)</div>
    <div class="card" style="margin-bottom:32px; border-radius:0; padding:28px;">
      <!-- Type Switcher Tabs -->
      <div style="display:flex; gap:8px; margin-bottom:20px; border-bottom:1px solid var(--ap-border); padding-bottom:12px; flex-wrap:wrap;">
        <button class="btn btn-sm btn-primary logo-type-btn" data-type="wordmark">영문 워드마크 (RALEWAY)</button>
        <button class="btn btn-sm btn-outline logo-type-btn" data-type="wordmark_ko">국문 워드마크 (신고딕)</button>
        <button class="btn btn-sm btn-outline logo-type-btn" data-type="symbol">LAB PROVEN 심볼</button>
        <button class="btn btn-sm btn-outline logo-type-btn" data-type="lockup">COMBINED LOCKUP</button>
        <button class="btn btn-sm btn-outline logo-type-btn" data-type="uploaded">원본 소스</button>
      </div>

      <div style="display:flex; gap:32px; align-items:flex-start; flex-wrap:wrap;">
        <div style="flex:1; min-width:280px;">
          <div style="font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--ap-gold); margin-bottom:8px;">사이즈 스케일링</div>
          <input type="range" class="range-slider" id="logo-size-slider" min="60" max="320" value="160" style="width:100%;" />
          <div style="display:flex; justify-content:space-between; font-family:var(--font-en); font-size:11px; color:var(--text-muted); margin-top:4px;">
            <span>60px</span>
            <span id="logo-size-value">160px</span>
            <span>320px</span>
          </div>

          <div style="margin-top:20px;">
            <div style="font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--ap-gold); margin-bottom:8px;">배경 컨텍스트 (가이드라인 규정)</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-outline bg-preview-btn active" data-bg="#FFFFFF">PURE WHITE</button>
              <button class="btn btn-sm btn-outline bg-preview-btn" data-bg="#101820">VB BLACK (#101820)</button>
              <button class="btn btn-sm btn-outline bg-preview-btn" data-bg="#F8F9FC">LIGHT BG</button>
              <button class="btn btn-sm btn-outline bg-preview-btn" data-bg="#00843D">VITAL GREEN (348C)</button>
              <button class="btn btn-sm btn-outline bg-preview-btn" data-bg="#E31C79">INNER BEAUTY (213C)</button>
            </div>
          </div>

          <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--ap-border);">
            <div style="font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--ap-gold); margin-bottom:8px;">에셋 원본 다운로드</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <a href="/assets/logos/vitalbeautie_wordmark.svg" download class="btn btn-sm btn-primary">영문 SVG ⬇</a>
              <a href="/assets/logos/vitalbeautie_wordmark_ko.svg" download class="btn btn-sm btn-primary">국문 SVG ⬇</a>
              <a href="/assets/logos/vitalbeautie_lab_proven.svg" download class="btn btn-sm btn-outline">심볼 SVG ⬇</a>
              <a href="/assets/products/vitalbeautie_product_map.png" download class="btn btn-sm btn-outline">제품맵 PNG ⬇</a>
            </div>
          </div>
        </div>

        <!-- Preview Area -->
        <div id="logo-preview-area" style="flex:1.5; min-width:320px; display:flex; align-items:center; justify-content:center; min-height:240px; background:#ffffff; border:1px solid var(--ap-border); position:relative; overflow:hidden; padding:28px;">
          <div id="logo-preview-container" style="display:flex; align-items:center; justify-content:center; transition: transform 0.15s ease;">
            <!-- Injected by JS -->
          </div>
          <!-- 1X Clear space overlay indicator -->
          <div style="position:absolute; bottom:8px; right:12px; font-family:var(--font-en); font-size:10px; color:rgba(156,135,74,0.8); pointer-events:none;">
            [1X CLEAR SPACE COMPLIANT]
          </div>
        </div>
      </div>
    </div>

    <!-- Official Guidelines Specs: Minimum Sizes & Clear Space (PDF Page 5, 6, 13) -->
    <div class="section-subtitle">📐 로고 & 심볼 규격 및 여백 규정 (Guidelines Specs)</div>
    <div class="card-grid cols-3" style="margin-bottom:32px;">
      <div class="card" style="border-radius:0; padding:20px;">
        <div style="font-family:var(--font-en); font-size:11px; font-weight:700; color:var(--ap-gold); letter-spacing:1px; margin-bottom:6px;">ENGLISH WORDMARK (PAGE 5)</div>
        <div style="font-size:16px; font-weight:700; margin-bottom:6px;">가로폭 최소 20mm 이상</div>
        <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
          영문 로고타입은 가로폭 <b>20mm 이하</b>의 크기로는 사용하지 않습니다. 그 이하 크기 사용 시 왜곡과 가독성 저하가 발생합니다.
        </p>
        <div style="margin-top:10px; font-family:var(--font-en); font-size:11px; color:var(--ap-gold); font-weight:600;">
          최소 여백: 1X (문자 높이 기준 사방 격자 확보)
        </div>
      </div>

      <div class="card" style="border-radius:0; padding:20px;">
        <div style="font-family:var(--font-en); font-size:11px; font-weight:700; color:var(--ap-gold); letter-spacing:1px; margin-bottom:6px;">KOREAN WORDMARK (PAGE 6)</div>
        <div style="font-size:16px; font-weight:700; margin-bottom:6px;">가로폭 최소 30mm 이상</div>
        <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
          국문 ‘바이탈뷰티’ 워드마크는 가로폭 <b>30mm 이하</b>의 크기로 사용하지 않습니다. 그리드 데이터를 활용하여 정비례 축소/확대해야 합니다.
        </p>
        <div style="margin-top:10px; font-family:var(--font-en); font-size:11px; color:var(--ap-gold); font-weight:600;">
          최소 여백: 1X (‘바’ 글자 폭 기준 사방 격자 확보)
        </div>
      </div>

      <div class="card" style="border-radius:0; padding:20px;">
        <div style="font-family:var(--font-en); font-size:11px; font-weight:700; color:var(--ap-gold); letter-spacing:1px; margin-bottom:6px;">LAB PROVEN SYMBOL (PAGE 13)</div>
        <div style="font-size:16px; font-weight:700; margin-bottom:6px;">지름 최소 15mm 이상</div>
        <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
          원형 엠블럼 심볼은 가독성 확보를 위해 <b>최소 15mm</b>보다 줄여서 사용하지 않습니다. 다른 요소 침해 없이 원형 클리어스페이스를 유지해야 합니다.
        </p>
        <div style="margin-top:10px; font-family:var(--font-en); font-size:11px; color:var(--ap-gold); font-weight:600;">
          최소 여백: 사방 원형 여백 (1X) 확보 필수
        </div>
      </div>
    </div>

    <!-- Misuse Cases Grid (PDF Page 7, 14) -->
    <div class="section-subtitle">🚫 로고 & 심볼 오용 사례 (Incorrect Usage - 9 Rules)</div>
    <div class="card" style="border-radius:0; padding:24px; margin-bottom:32px;">
      <div style="font-size:13px; color:var(--text-secondary); margin-bottom:16px; line-height:1.6;">
        로고타입과 심볼마크의 형태를 임의로 바꿀 경우 본래의 정체성이 손상되므로 <b>반드시 표준 형태를 사용</b>해야 합니다. 아래의 9가지 오용 사례를 엄격히 금지합니다.
      </div>
      <div class="card-grid cols-3" style="gap:12px;">
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 1. 비례 왜곡 금지</b>
          <div style="color:#666; margin-top:2px;">종횡비를 무시하고 가로/세로로 납작하게 늘이지 마시오.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 2. 다른 서체 적용 금지</b>
          <div style="color:#666; margin-top:2px;">임의의 명조, 폰트나 지정되지 않은 활자를 적용하지 마시오.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 3. 색상 임의 변경 금지</b>
          <div style="color:#666; margin-top:2px;">규정된 VITALBEAUTIE BLACK 또는 White 외 임의 색상 금지.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 4. 테두리(스트로크) 금지</b>
          <div style="color:#666; margin-top:2px;">글자나 심볼 외곽선에 라인 테두리를 둘러 사용하지 마시오.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 5. 임의 문자 결합 금지</b>
          <div style="color:#666; margin-top:2px;">하단에 'OFFICIAL STORE', 인증문구 등을 임의 결합 금지.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 6. 자간/간격 임의 조정 금지</b>
          <div style="color:#666; margin-top:2px;">글자 간격을 임의로 좁히거나 넓혀 비례를 깨뜨리지 마시오.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 7. 라인으로 처리 금지</b>
          <div style="color:#666; margin-top:2px;">솔리드 면 처리가 아닌 와이어프레임 라인 처리 금지.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 8. 기울여 사용 금지</b>
          <div style="color:#666; margin-top:2px;">기울기(이탤릭) 효과나 대각선 회전을 적용하지 마시오.</div>
        </div>
        <div style="padding:14px; background:#FFF5F5; border:1px solid #FFD1D1; font-size:12px;">
          <b style="color:#C44536;">✕ 9. 그림자/효과 적용 금지</b>
          <div style="color:#666; margin-top:2px;">드롭 섀도, 엠보스, 그라디언트 등 입체 효과 적용 금지.</div>
        </div>
      </div>
    </div>
  `;

  setupLogoResize(brand);
  setupAssetCards(brand);
}

function setupLogoResize(brand) {
  const slider = document.getElementById('logo-size-slider');
  const sizeLabel = document.getElementById('logo-size-value');
  const previewArea = document.getElementById('logo-preview-area');
  const previewContainer = document.getElementById('logo-preview-container');

  if (!slider || !previewContainer) return;

  let currentType = 'wordmark';
  let currentBg = '#FFFFFF';

  function renderPreview() {
    const isDark = (currentBg === '#101820' || currentBg === '#00843D' || currentBg === '#E31C79');
    const textColor = isDark ? '#FFFFFF' : '#101820';
    const size = slider.value;
    sizeLabel.textContent = size + 'px';

    if (currentType === 'wordmark') {
      const src = isDark ? '/assets/logos/vitalbeautie_wordmark_en_white.png' : '/assets/logos/vitalbeautie_wordmark_en_black.png';
      previewContainer.innerHTML = `
        <img src="${src}" alt="VITALBEAUTIE 영문 로고" style="width:${size * 1.6}px; max-width:90%; height:auto; display:block;" />
      `;
    } else if (currentType === 'wordmark_ko') {
      const src = isDark ? '/assets/logos/vitalbeautie_wordmark_ko_white.png' : '/assets/logos/vitalbeautie_wordmark_ko_black.png';
      previewContainer.innerHTML = `
        <img src="${src}" alt="바이탈뷰티 국문 로고" style="width:${size * 1.2}px; max-width:85%; height:auto; display:block;" />
      `;
    } else if (currentType === 'symbol') {
      const symbolSrc = isDark ? '/assets/logos/vitalbeautie_monogram_lab_proven_white.png' : '/assets/logos/vitalbeautie_monogram_lab_proven_black.png';
      previewContainer.innerHTML = `
        <img src="${symbolSrc}" alt="LAB PROVEN 심볼" style="width:${size * 0.75}px; height:${size * 0.75}px; display:block;" />
      `;
    } else if (currentType === 'lockup') {
      const symbolSrc = isDark ? '/assets/logos/vitalbeautie_monogram_lab_proven_white.png' : '/assets/logos/vitalbeautie_monogram_lab_proven_black.png';
      const logoSrc = isDark ? '/assets/logos/vitalbeautie_wordmark_en_white.png' : '/assets/logos/vitalbeautie_wordmark_en_black.png';
      previewContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:${size * 0.08}px;">
          <img src="${symbolSrc}" alt="LAB PROVEN" style="width:${size * 0.35}px; height:${size * 0.35}px; display:block;" />
          <div style="width:1px; height:${size * 0.3}px; background:${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(16,24,32,0.2)'};"></div>
          <img src="${logoSrc}" alt="VITALBEAUTIE" style="width:${size * 0.9}px; height:auto; display:block;" />
        </div>
      `;
    } else if (currentType === 'uploaded') {
      const src = isDark ? '/assets/logos/user_wordmark_en_dark.png' : '/assets/logos/user_wordmark_en_light.png';
      previewContainer.innerHTML = `
        <img src="${src}" alt="VITALBEAUTIE Uploaded" style="max-width:90%; height:auto; display:block;" />
      `;
    }
  }

  // Type buttons
  document.querySelectorAll('.logo-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.logo-type-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');
      currentType = btn.dataset.type;
      renderPreview();
    });
  });

  // Background buttons
  document.querySelectorAll('.bg-preview-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bg-preview-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBg = btn.dataset.bg;
      previewArea.style.background = currentBg;
      renderPreview();
    });
  });

  // Range slider
  slider.addEventListener('input', renderPreview);

  // Initial render
  renderPreview();
}

function setupAssetCards(brand) {
  document.querySelectorAll('.asset-category-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.dataset.catId;
      const cat = brand.assets?.categories?.find(c => c.id === catId);
      if (!cat) return;

      if (cat.externalLink) {
        showToast(`${cat.name}: 공식 폰트 가이드로 이동합니다.`);
        return;
      }

      const detail = document.getElementById('asset-detail');
      detail.style.display = 'block';
      detail.innerHTML = `
        <div class="card" style="border-radius:0; padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <span style="font-size:24px; margin-right:8px;">${cat.icon}</span>
              <span style="font-size:18px; font-weight:700;">${cat.name}</span>
              <span class="tag tag-gold" style="margin-left:8px; border-radius:0;">${cat.count}개 에셋</span>
            </div>
            <button class="btn btn-sm btn-outline" onclick="document.getElementById('asset-detail').style.display='none'">✕ 닫기</button>
          </div>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">
            바이탈뷰티 공식 에셋 폴더: <code>/public/assets/</code> 에서 고해상도 SVG 및 PNG 에셋을 제공합니다.
          </p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a href="/assets/guidelines/VITALBEAUTIE_Brand_Identity_Guidelines.pdf" download class="btn btn-sm btn-primary">
              ⬇ 전체 가이드북 PDF 다운로드
            </a>
            <a href="/assets/logos/vitalbeautie_wordmark.svg" download class="btn btn-sm btn-outline">
              ⬇ 영문 워드마크 SVG
            </a>
            <a href="/assets/logos/vitalbeautie_wordmark_ko.svg" download class="btn btn-sm btn-outline">
              ⬇ 국문 워드마크 SVG
            </a>
            <a href="/assets/logos/vitalbeautie_lab_proven.svg" download class="btn btn-sm btn-outline">
              ⬇ LAB PROVEN 심볼 SVG
            </a>
          </div>
        </div>
      `;
      detail.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   04 ASSET LIBRARY — 통합 브랜드 공식 에셋 다운로드 센터
   - 공식 영문/국문 워드마크 (Black & White)
   - LAB PROVEN 심볼 모노그램 (Black & White)
   - 식약처 공식 건강기능식품 15mm 마크 & GMP 마크
   - 웰니스 핵심 기능 아이콘 6종
   - 모든 에셋 .ai, .png(300DPI), .jpg(300DPI), .svg 원클릭 다운로드
   ═══════════════════════════════════════════════════════════════════════════ */

const EN_WORDMARK_INNER_BLACK = `
  <polygon points="253.47 288.83 251.29 294.18 249.03 288.83 247.01 288.83 251.32 298.37 255.43 288.83 253.47 288.83" fill="#1D1D1B"/>
  <rect x="257.31" y="288.83" width="1.89" height="9.16" fill="#1D1D1B"/>
  <polygon points="260.95 288.83 260.95 290.58 263.5 290.58 263.5 297.99 265.39 297.99 265.39 290.58 267.93 290.58 267.93 288.83 260.95 288.83" fill="#1D1D1B"/>
  <polygon points="272.26 288.45 268.04 297.99 270 297.99 272.23 292.62 274.44 297.99 276.46 297.99 272.26 288.45" fill="#1D1D1B"/>
  <polygon points="279.63 296.24 279.63 288.83 277.74 288.83 277.74 297.99 282.33 297.99 284.1 296.24 279.63 296.24" fill="#1D1D1B"/>
  <path d="m290.67,293.07c-.08-.02-.14-.09-.15-.18,0-.09.04-.17.11-.21.47-.24.98-.71.98-1.62,0-1.4-.96-2.23-2.57-2.23h-3.15v9.12h3.4c1.87,0,2.98-.99,2.98-2.66,0-1.1-.55-1.91-1.61-2.21m-1.71-.5h-1.8c-.12,0-.21-.09-.21-.21v-2.45c0-.12.09-.21.21-.21h1.8c1.05,0,1.59.47,1.59,1.4s-.53,1.47-1.59,1.47m-2.01,1c0-.12.09-.21.21-.21h1.98c1.29,0,2.04.68,2.04,1.87s-.68,1.85-1.97,1.85h-2.05c-.12,0-.21-.09-.21-.21v-3.29Z" fill="#1D1D1B"/>
  <path d="m295.43,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z" fill="#1D1D1B"/>
  <path d="m305.17,288.82l-.13-.3-.12.3-3.86,9.04-.04.09h1.13l1.07-2.51c.04-.08.12-.14.21-.14h3.21c.09,0,.18.06.21.14l1.02,2.51h1.2l-3.91-9.13Zm-.1,2.32c1.2,2.88,1.23,2.96,1.16,3.08-.04.06-.11.1-.19.1h-2.04c-.07,0-.15-.04-.18-.1-.04-.06-.05-.14-.02-.22l1.19-2.86.04-.09.04.09Z" fill="#1D1D1B"/>
  <path d="m316.06,288.83v5.88c0,1.59-.8,2.43-2.33,2.43s-2.34-.84-2.34-2.43v-5.88h-1.07v5.96c0,2.06,1.28,3.28,3.42,3.28s3.4-1.23,3.4-3.28v-5.96h-1.08Z" fill="#1D1D1B"/>
  <path d="m318.66,288.83v.91h2.61c.11,0,.21.09.21.21v8h1.07v-8c0-.12.09-.21.21-.21h2.61v-.91h-6.71Z" fill="#1D1D1B"/>
  <rect x="326.96" y="288.83" width="1.07" height="9.12" fill="#1D1D1B"/>
  <path d="m332.19,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z" fill="#1D1D1B"/>
`;

const EN_WORDMARK_INNER_WHITE = EN_WORDMARK_INNER_BLACK.replace(/fill="#1D1D1B"/g, 'fill="#FFFFFF"');

const KO_WORDMARK_INNER_BLACK = `
  <g fill="#1D1D1B">
    <path d="M48.2 24.5h7.2v46.8h-7.2V50.2H25.4v21.1h-7.2V24.5h7.2v19.4h22.8V24.5z"/>
    <path d="M72.4 24.5h7.2v46.8h-7.2V48.5H62.6v-6.3h9.8V24.5zM98.6 30.2v6.2H87.4v34.9h-7.2V24.5h25.4v5.7H98.6z"/>
    <path d="M125.4 24.5h7.2v46.8h-7.2V49.2h-18.4v-6.3h18.4V24.5zM148.6 24.5h7.2v46.8h-7.2V24.5z"/>
    <path d="M178.4 24.5h26.4v6.2h-19.2v14.1h17.6v6.2h-17.6v20.3h-7.2V24.5zM218.4 24.5h7.2v46.8h-7.2V24.5z"/>
    <path d="M256.4 24.5h7.2v46.8h-7.2V49.2h-18.4v-6.3h18.4V24.5zM279.4 24.5h7.2v46.8h-7.2V24.5z"/>
  </g>
`;

const KO_WORDMARK_INNER_WHITE = KO_WORDMARK_INNER_BLACK.replace(/fill="#1D1D1B"/g, 'fill="#FFFFFF"');

const LAB_PROVEN_INNER_BLACK = `
  <g fill="#101820">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#101820" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="41" fill="none" stroke="#101820" stroke-width="0.8"/>
    <path d="M50 18 L53 38 L47 38 Z"/>
    <path d="M50 82 L53 62 L47 62 Z"/>
    <path d="M18 50 L38 53 L38 47 Z"/>
    <path d="M82 50 L62 53 L62 47 Z"/>
    <circle cx="50" cy="50" r="14" fill="none" stroke="#101820" stroke-width="2"/>
    <circle cx="50" cy="50" r="5" fill="#101820"/>
  </g>
`;

const LAB_PROVEN_INNER_WHITE = LAB_PROVEN_INNER_BLACK.replace(/#101820/g, '#FFFFFF');

const GMP_MARK_INNER = `
  <g fill="#101820">
    <rect x="6" y="6" width="88" height="88" rx="8" fill="none" stroke="#101820" stroke-width="3"/>
    <text x="50" y="44" text-anchor="middle" font-family="'Raleway', sans-serif" font-size="28" font-weight="900" letter-spacing="1">GMP</text>
    <text x="50" y="62" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-size="9" font-weight="700">우수건강기능식품</text>
    <text x="50" y="74" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-size="9" font-weight="700">제조기준 적합인증</text>
    <text x="50" y="84" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-size="6.5" font-weight="500" fill="#666">식품의약품안전처</text>
  </g>
`;

const MASTER_ASSETS_LIST = [
  // 01 브랜드 워드마크
  {
    id: 'wordmark_en_black',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: 'VITALBEAUTIE 영문 워드마크 (Black)',
    enName: 'Primary Wordmark (VB Black)',
    desc: '브랜드 공식 대표 영문 워드마크. 화이트 및 밝은 배경에 사용합니다. 최소 가로폭 20mm 이상 준수.',
    isDark: false,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="245 285 92 16" width="100%" height="100%">${EN_WORDMARK_INNER_BLACK}</svg>`,
  },
  {
    id: 'wordmark_en_white',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: 'VITALBEAUTIE 영문 워드마크 (Reverse White)',
    enName: 'Reverse Wordmark (Pure White)',
    desc: '다크 및 팬톤 배경 전용 반전 화이트 워드마크. 패키지 전면 및 389C 태그 상단 적용.',
    isDark: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="245 285 92 16" width="100%" height="100%">${EN_WORDMARK_INNER_WHITE}</svg>`,
  },
  {
    id: 'wordmark_ko_black',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: '바이탈뷰티 국문 워드마크 (Black)',
    enName: 'Korean Wordmark (VB Black)',
    desc: '국내 커뮤니케이션 및 인증용 공식 국문 워드마크. 최소 가로폭 30mm 이상 정비례 사용.',
    isDark: false,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="15 20 280 54" width="100%" height="100%">${KO_WORDMARK_INNER_BLACK}</svg>`,
  },
  {
    id: 'wordmark_ko_white',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: '바이탈뷰티 국문 워드마크 (Reverse White)',
    enName: 'Korean Wordmark (Reverse White)',
    desc: '어두운 바탕 및 풀컬러 단상자용 국문 반전 워드마크. 정품 패키지 보증에 활용.',
    isDark: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="15 20 280 54" width="100%" height="100%">${KO_WORDMARK_INNER_WHITE}</svg>`,
  },

  // 02 심볼 & 모노그램
  {
    id: 'symbol_lab_proven_black',
    category: 'symbol',
    categoryLabel: '02 심볼 & 모노그램',
    name: 'LAB PROVEN 심볼 모노그램 (Black)',
    enName: 'LAB PROVEN Seal (VB Black)',
    desc: '아모레퍼시픽 80년 바이오 헬스 연구와 효능 검증을 상징하는 공식 마스터 씰 심볼.',
    isDark: false,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">${LAB_PROVEN_INNER_BLACK}</svg>`,
  },
  {
    id: 'symbol_lab_proven_white',
    category: 'symbol',
    categoryLabel: '02 심볼 & 모노그램',
    name: 'LAB PROVEN 심볼 모노그램 (Reverse White)',
    enName: 'LAB PROVEN Seal (Reverse White)',
    desc: '프리미엄 라인 단상자 및 버진씰 전용 화이트 반전 심볼.',
    isDark: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">${LAB_PROVEN_INNER_WHITE}</svg>`,
  },

  // 03 법정 인증 마크
  {
    id: 'cert_health_functional_food_15mm',
    category: 'certification',
    categoryLabel: '03 법정 인증 마크',
    name: '건강기능식품 공식 인증 마크 (15mm 규격)',
    enName: 'Official Health Functional Food Mark (15mm)',
    desc: '식품의약품안전처 공식 고시 벡터 규격 (가로×세로 15mm 정비례). 패키지 필수 표시.',
    isDark: false,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="100%" height="100%">${getHffMarkSvg(0, 0, 15)}</svg>`,
  },
  {
    id: 'cert_gmp_15mm',
    category: 'certification',
    categoryLabel: '03 법정 인증 마크',
    name: '우수건강기능식품제조기준 GMP 마크 (15mm 규격)',
    enName: 'Good Manufacturing Practice (GMP) Mark',
    desc: '우수 건강기능식품 제조 및 품질관리 기준 적합 공식 인증 규격 벡터.',
    isDark: false,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">${GMP_MARK_INNER}</svg>`,
  },

  // 04 웰니스 기능 아이콘
  {
    id: 'icon_sleep_moon_stars',
    category: 'icon',
    categoryLabel: '04 웰니스 기능 아이콘',
    name: '수면 케어 (Good Sleep · Moon & Stars)',
    enName: 'Sleep Care Badge (Circle Arc)',
    desc: '달과 별무리 모티프의 서카디안 리듬 숙면 케어 픽토그램 배지.',
    isDark: false,
    svg: renderVbStyledIconSvg(
      { setCode: 'T', innerSvg: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 2v3M20.5 3.5h-3"/>' },
      'circle-arc',
      { koText: '수면', enText: 'good sleep', uid: 'al-sleep' }
    ),
  },
  {
    id: 'icon_slim_double_cut',
    category: 'icon',
    categoryLabel: '04 웰니스 기능 아이콘',
    name: '체지방 더블컷 (Slim Fit & Double Cut)',
    enName: 'Slim Double Cut Badge (Circle Keyword)',
    desc: '탄수화물과 당류 흡수를 차단하고 대사를 촉진하는 더블컷 공식 배지.',
    isDark: false,
    svg: renderVbStyledIconSvg(
      { setCode: 'T', innerSvg: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>' },
      'circle-keyword',
      { koText: '더블컷', enText: 'double cut', uid: 'al-cut' }
    ),
  },
  {
    id: 'icon_inner_beauty_collagen',
    category: 'icon',
    categoryLabel: '04 웰니스 기능 아이콘',
    name: '이너뷰티 콜라겐 (Inner Beauty & Glow)',
    enName: 'Collagen Radiance Badge',
    desc: '피부 속부터 차오르는 탄력과 광채를 상징하는 프리미엄 스파클 배지.',
    isDark: false,
    svg: renderVbStyledIconSvg(
      { setCode: 'T', innerSvg: '<path d="M12 3l1.912 4.888L18.8 9.8l-4.888 1.912L12 16.6l-1.912-4.888L5.2 9.8l4.888-1.912z"/>' },
      'circle-line',
      { koText: '콜라겐', enText: 'inner beauty', uid: 'al-col' }
    ),
  },
  {
    id: 'icon_probiotics_gut',
    category: 'icon',
    categoryLabel: '04 웰니스 기능 아이콘',
    name: '장 건강 프로바이오틱스 (Probiotics Shield)',
    enName: 'Probiotics Gut Health Badge',
    desc: '장내 미생물 생태계와 면역 베리어를 지키는 쉴드 체크 배지.',
    isDark: false,
    svg: renderVbStyledIconSvg(
      { setCode: 'T', innerSvg: '<path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3"/><path d="m9 12 2 2 4-4"/>' },
      'circle-arc',
      { koText: '유산균', enText: 'probiotics', uid: 'al-pro' }
    ),
  },
  {
    id: 'icon_antioxidant_vitamin',
    category: 'icon',
    categoryLabel: '04 웰니스 기능 아이콘',
    name: '항산화 활력 비타민 (Antioxidant Vitamin)',
    enName: 'Vital Vitamin Care Badge',
    desc: '유해산소로부터 세포를 보호하는 항산화 에너지 배지.',
    isDark: false,
    svg: renderVbStyledIconSvg(
      { setCode: 'T', innerSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
      'circle-line',
      { koText: '비타민', enText: 'vital energy', uid: 'al-vit' }
    ),
  },
  {
    id: 'icon_cleanse_detox',
    category: 'icon',
    categoryLabel: '04 웰니스 기능 아이콘',
    name: '디톡스 클렌즈 (Hydration & Detox)',
    enName: 'Detox Cleanse Water Badge',
    desc: '순환과 배출, 신선한 수분 공급을 상징하는 클린 워터 배지.',
    isDark: false,
    svg: renderVbStyledIconSvg(
      { setCode: 'T', innerSvg: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>' },
      'circle-keyword',
      { koText: '디톡스', enText: 'detox care', uid: 'al-detox' }
    ),
  },
];

function downloadAssetFile(asset, format) {
  if (format === 'ai') {
    const blob = buildIllustratorAiBlob(asset.svg, `VITALBEAUTIE_${asset.id}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VITALBEAUTIE_${asset.id}.ai`;
    a.click();
    showToast(`${asset.name} Adobe Illustrator (.ai) 파일이 다운로드되었습니다.`);
    return;
  }

  if (format === 'svg') {
    const blob = new Blob([asset.svg], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VITALBEAUTIE_${asset.id}.svg`;
    a.click();
    showToast(`${asset.name} (.svg) 벡터 파일이 다운로드되었습니다.`);
    return;
  }

  // PNG & JPG via 1800×1800 300DPI Offscreen Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1800;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');

  if (format === 'jpg') {
    ctx.fillStyle = asset.isDark ? '#101820' : '#FFFFFF';
    ctx.fillRect(0, 0, 1800, 1800);
  } else {
    ctx.clearRect(0, 0, 1800, 1800);
  }

  const svgBlob = new Blob([asset.svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const pad = 160;
    ctx.drawImage(img, pad, pad, 1800 - pad * 2, 1800 - pad * 2);
    URL.revokeObjectURL(url);
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `VITALBEAUTIE_${asset.id}.${format}`;
      a.click();
      showToast(`${asset.name} (.${format.toUpperCase()}) 300DPI 파일이 다운로드되었습니다.`);
    }, mime, 0.96);
  };
  img.src = url;
}

export function renderAssetLibraryPage(container) {
  let activeCat = 'all';

  const renderContent = () => {
    const filtered = activeCat === 'all'
      ? MASTER_ASSETS_LIST
      : MASTER_ASSETS_LIST.filter(a => a.category === activeCat);

    const cardsHtml = filtered.map(asset => `
      <div class="al-card" data-asset-id="${asset.id}">
        <div class="al-preview-wrap ${asset.isDark ? 'bg-dark' : ''}">
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
            ${asset.svg}
          </div>
        </div>
        <div class="al-body">
          <strong class="al-title">${asset.name}</strong>
          <span class="al-sub">${asset.enName}</span>
          <p class="al-desc">${asset.desc}</p>
          <div class="al-dl-row">
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="ai">⬇ .AI</button>
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="png">⬇ .PNG</button>
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="jpg">⬇ .JPG</button>
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="svg">⬇ .SVG</button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="margin-bottom:28px;">
        <div style="font-size:13px; color:#5A606E; margin-bottom:8px; font-weight:400;">04 ASSET LIBRARY</div>
        <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:860px;">
          바이탈뷰티 공식 영문·국문 워드마크, LAB PROVEN 심볼, 15mm 건강기능식품 법정 인증마크, 웰니스 기능 아이콘을 Adobe Illustrator(.ai), 고해상도 PNG(300 DPI 투명 배경), JPG(300 DPI 화이트 배경), SVG 벡터 파일로 즉시 다운로드할 수 있는 통합 에셋 보관소입니다.
        </div>
      </div>

      <!-- 카테고리 탭 바 -->
      <div class="al-cat-tabs" role="tablist">
        <button type="button" class="al-cat-tab ${activeCat === 'all' ? 'active' : ''}" data-cat="all">전체 에셋 (${MASTER_ASSETS_LIST.length})</button>
        <button type="button" class="al-cat-tab ${activeCat === 'wordmark' ? 'active' : ''}" data-cat="wordmark">01 브랜드 워드마크 (4)</button>
        <button type="button" class="al-cat-tab ${activeCat === 'symbol' ? 'active' : ''}" data-cat="symbol">02 심볼 &amp; 모노그램 (2)</button>
        <button type="button" class="al-cat-tab ${activeCat === 'certification' ? 'active' : ''}" data-cat="certification">03 법정 인증 마크 (2)</button>
        <button type="button" class="al-cat-tab ${activeCat === 'icon' ? 'active' : ''}" data-cat="icon">04 웰니스 기능 아이콘 (6)</button>
      </div>

      <!-- 에셋 카드 그리드 -->
      <div class="al-grid">
        ${cardsHtml}
      </div>
    `;

    // 카테고리 탭 이벤트 바인딩
    container.querySelectorAll('.al-cat-tab').forEach(tab => {
      tab.onclick = () => {
        activeCat = tab.getAttribute('data-cat');
        renderContent();
      };
    });

    // 개별 다운로드 버튼 이벤트 바인딩
    container.querySelectorAll('.al-dl-btn').forEach(btn => {
      btn.onclick = () => {
        const assetId = btn.getAttribute('data-id');
        const format = btn.getAttribute('data-format');
        const asset = MASTER_ASSETS_LIST.find(a => a.id === assetId);
        if (asset) {
          downloadAssetFile(asset, format);
        }
      };
    });
  };

  renderContent();
}
