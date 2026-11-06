/* ═══════════════════════════════════════
   Asset Library Page (VITALBEAUTIE Official Guidelines)
   ═══════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';
import { showToast } from '../utils/helpers.js';

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
