/* ═══════════════════════════════════════
   ARCHIVE · ASSET LIBRARY Page
   VITALBEAUTIE Official Master Brand Assets (Wordmark & Symbol)
   ═══════════════════════════════════════ */
import { showToast } from '../utils/helpers.js';

/* ─── MASTER ASSETS LIST (바이탈뷰티 공식 워드마크 & 심볼 마스터 에셋) ─── */
const MASTER_ASSETS_LIST = [
  // 01 브랜드 워드마크 (4종)
  {
    id: 'logo_EN_black',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: 'VITALBEAUTIE 영문 워드마크 (Black)',
    enName: 'Primary Wordmark (VB Black)',
    desc: '브랜드 공식 대표 영문 워드마크. 화이트 및 밝은 배경에 사용합니다. 최소 가로폭 20mm 이상 준수.',
    isDark: false,
    previewHtml: '<img src="./assets/logos/vitalbeautie_wordmark_en_black.png" alt="VITALBEAUTIE 영문 워드마크 (Black)" style="max-height:38px; max-width:85%; width:auto; height:auto; object-fit:contain;" />',
    downloadName: 'logo_EN_black',
    fileAi: './assets/logos/logo_EN_black.ai',
    fileSvg: './assets/logos/logo_EN_black.svg',
    filePng: './assets/logos/vitalbeautie_wordmark_en_black.png',
  },
  {
    id: 'logo_EN_white',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: 'VITALBEAUTIE 영문 워드마크 (White)',
    enName: 'Reverse Wordmark (Pure White)',
    desc: '다크 및 팬톤 배경 전용 반전 화이트 영문 워드마크. 패키지 전면 및 389C 태그 상단 적용.',
    isDark: true,
    previewHtml: '<img src="./assets/logos/vitalbeautie_wordmark_en_white.png" alt="VITALBEAUTIE 영문 워드마크 (White)" style="max-height:38px; max-width:85%; width:auto; height:auto; object-fit:contain;" />',
    downloadName: 'logo_EN_white',
    fileAi: './assets/logos/logo_EN_white.ai',
    fileSvg: './assets/logos/logo_EN_white.svg',
    filePng: './assets/logos/vitalbeautie_wordmark_en_white.png',
  },
  {
    id: 'logo_KR_black',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: '바이탈뷰티 국문 워드마크 (Black)',
    enName: 'Korean Wordmark (VB Black)',
    desc: '국내 커뮤니케이션 및 인증용 공식 국문 워드마크. 최소 가로폭 30mm 이상 정비례 사용.',
    isDark: false,
    previewHtml: '<img src="./assets/logos/vitalbeautie_wordmark_ko_black.png" alt="바이탈뷰티 국문 워드마크 (Black)" style="max-height:46px; max-width:78%; width:auto; height:auto; object-fit:contain;" />',
    downloadName: 'logo_KR_black',
    fileAi: './assets/logos/logo_KR_black.ai',
    fileSvg: './assets/logos/logo_KR_black.svg',
    filePng: './assets/logos/vitalbeautie_wordmark_ko_black.png',
  },
  {
    id: 'logo_KR_white',
    category: 'wordmark',
    categoryLabel: '01 브랜드 워드마크',
    name: '바이탈뷰티 국문 워드마크 (White)',
    enName: 'Korean Wordmark (Pure White)',
    desc: '어두운 바탕 및 풀컬러 단상자용 국문 반전 워드마크. 정품 패키지 보증에 활용.',
    isDark: true,
    previewHtml: '<img src="./assets/logos/vitalbeautie_wordmark_ko_white.png" alt="바이탈뷰티 국문 워드마크 (White)" style="max-height:46px; max-width:78%; width:auto; height:auto; object-fit:contain;" />',
    downloadName: 'logo_KR_white',
    fileAi: './assets/logos/logo_KR_white.ai',
    fileSvg: './assets/logos/logo_KR_white.svg',
    filePng: './assets/logos/vitalbeautie_wordmark_ko_white.png',
  },

  // 02 심볼 & 모노그램 (2종)
  {
    id: 'symbol_black',
    category: 'symbol',
    categoryLabel: '02 심볼 & 모노그램',
    name: 'LAB PROVEN 심볼 모노그램 (Black)',
    enName: 'LAB PROVEN Seal (VB Black)',
    desc: '아모레퍼시픽 80년 바이오 헬스 연구와 효능 검증을 상징하는 공식 마스터 씰 심볼.',
    isDark: false,
    previewHtml: '<img src="./assets/logos/vitalbeautie_monogram_lab_proven_black.png" alt="LAB PROVEN 심볼 모노그램 (Black)" style="max-height:108px; max-width:108px; width:auto; height:auto; object-fit:contain;" />',
    downloadName: 'symbol_black',
    fileAi: './assets/logos/symbol_black.ai',
    fileSvg: './assets/logos/symbol_black.svg',
    filePng: './assets/logos/vitalbeautie_monogram_lab_proven_black.png',
  },
  {
    id: 'symbol_white',
    category: 'symbol',
    categoryLabel: '02 심볼 & 모노그램',
    name: 'LAB PROVEN 심볼 모노그램 (White)',
    enName: 'LAB PROVEN Seal (Pure White)',
    desc: '프리미엄 라인 단상자 및 버진씰 전용 화이트 반전 심볼.',
    isDark: true,
    previewHtml: '<img src="./assets/logos/vitalbeautie_monogram_lab_proven_white.png" alt="LAB PROVEN 심볼 모노그램 (White)" style="max-height:108px; max-width:108px; width:auto; height:auto; object-fit:contain;" />',
    downloadName: 'symbol_white',
    fileAi: './assets/logos/symbol_white.ai',
    fileSvg: './assets/logos/symbol_white.svg',
    filePng: './assets/logos/vitalbeautie_monogram_lab_proven_white.png',
  },
];

/* ─── 브라우저 실제 파일 다운로드 헬퍼 ─── */
function triggerBrowserDownload(blobOrUrl, fileName) {
  const a = document.createElement('a');
  const isBlob = blobOrUrl instanceof Blob;
  const href = isBlob ? URL.createObjectURL(blobOrUrl) : blobOrUrl;
  a.href = href;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    if (isBlob) URL.revokeObjectURL(href);
  }, 300);
}

/* ─── 파일 다운로드 핸들러 (실제 원본 .ai / .svg / .png / .jpg 다운로드) ─── */
async function downloadAssetFile(asset, format) {
  const baseName = asset.downloadName || asset.id;

  // 1. 공식 원본 .AI 파일 다운로드
  if (format === 'ai' && asset.fileAi) {
    try {
      const resp = await fetch(asset.fileAi, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuffer = await resp.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/postscript' });
      triggerBrowserDownload(blob, `${baseName}.ai`);
      showToast(`${baseName}.ai 원본 일러스트레이터 파일이 다운로드되었습니다.`);
      return;
    } catch (err) {
      triggerBrowserDownload(asset.fileAi, `${baseName}.ai`);
      showToast(`${baseName}.ai 파일 다운로드를 시작합니다.`);
      return;
    }
  }

  // 2. 공식 원본 .SVG 파일 다운로드
  if (format === 'svg' && asset.fileSvg) {
    try {
      const resp = await fetch(asset.fileSvg, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const svgText = await resp.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      triggerBrowserDownload(blob, `${baseName}.svg`);
      showToast(`${baseName}.svg 원본 벡터 파일이 다운로드되었습니다.`);
      return;
    } catch (err) {
      triggerBrowserDownload(asset.fileSvg, `${baseName}.svg`);
      showToast(`${baseName}.svg 파일 다운로드를 시작합니다.`);
      return;
    }
  }

  // 3. 고해상도 .PNG 원본 다운로드
  if (format === 'png' && asset.filePng) {
    try {
      const resp = await fetch(asset.filePng, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuffer = await resp.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      triggerBrowserDownload(blob, `${baseName}.png`);
      showToast(`${baseName}.png 고해상도 파일이 다운로드되었습니다.`);
      return;
    } catch (err) {
      triggerBrowserDownload(asset.filePng, `${baseName}.png`);
      showToast(`${baseName}.png 파일 다운로드를 시작합니다.`);
      return;
    }
  }

  // 4. .JPG 300DPI 변환 다운로드
  if (format === 'jpg' && asset.filePng) {
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = asset.isDark ? '#101820' : '#FFFFFF';
    ctx.fillRect(0, 0, 1800, 1800);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const pad = 180;
      const maxW = 1800 - pad * 2;
      const maxH = 1800 - pad * 2;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (1800 - dw) / 2;
      const dy = (1800 - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      canvas.toBlob(blob => {
        if (blob) {
          triggerBrowserDownload(blob, `${baseName}.jpg`);
          showToast(`${baseName}.jpg 고해상도 파일이 다운로드되었습니다.`);
        }
      }, 'image/jpeg', 0.96);
    };
    img.src = asset.filePng;
  }
}

/* ─── ARCHIVE · ASSET LIBRARY 렌더링 ─── */
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
            ${asset.previewHtml}
          </div>
        </div>
        <div class="al-body">
          <strong class="al-title">${asset.name}</strong>
          <div class="al-dl-row" style="margin-top:10px;">
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="ai">⬇ .AI</button>
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="svg">⬇ .SVG</button>
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="png">⬇ .PNG</button>
            <button type="button" class="al-dl-btn" data-id="${asset.id}" data-format="jpg">⬇ .JPG</button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="margin-bottom:28px;">
        <div style="border-left:2px solid #D5D8DE; padding-left:14px; font-size:13.5px; color:#5A6270; line-height:1.6;">
          영문 워드마크, 국문 워드마크, 심볼을 AI, PNG, SVG로 내려받습니다.
        </div>
      </div>

      <!-- 카테고리 탭 바 -->
      <div class="al-cat-tabs" role="tablist">
        <button type="button" class="al-cat-tab ${activeCat === 'all' ? 'active' : ''}" data-cat="all">전체 에셋 (${MASTER_ASSETS_LIST.length})</button>
        <button type="button" class="al-cat-tab ${activeCat === 'wordmark' ? 'active' : ''}" data-cat="wordmark">01 브랜드 워드마크 (4)</button>
        <button type="button" class="al-cat-tab ${activeCat === 'symbol' ? 'active' : ''}" data-cat="symbol">02 심볼 &amp; 모노그램 (2)</button>
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

/* ─── 하위 호환용 renderAssetPage ─── */
export function renderAssetPage(container) {
  renderAssetLibraryPage(container);
}
