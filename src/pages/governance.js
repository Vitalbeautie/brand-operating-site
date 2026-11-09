/* ═══════════════════════════════════════
   Governance Studio Pages (BI / PI)
   ═══════════════════════════════════════ */
import { IDENTITY, DNA_KEYWORDS, PACKAGE_LINES, REGULATIONS, LOCALE_TYPO, SAMPLE_COPY } from '../data/governance.js';
import { MG_LINE, SIZE_CLASS, TYPO, HFF_MARK, RULE_CATALOG, PRESETS } from '../data/packageFront.js';
import { REPRESENTATIVE_COLOR_CHIPS } from '../data/pantoneCoated.js';
import {
  suggestLogo, generateDnaIcon, generateCustomDnaIcon, buildIllustratorAiBlob, getPictogramLibrary,
  checkDna, suggestChips, checkChip, checkSpecScale, checkRegulation, autoLayout,
  parseKoreanPackageFile, translateKoPackageText, renderLocalizedPackageSvg,
  resolvePantoneInput, autoSpecPackageFront, checkPackageFront, renderPackageFrontSvg,
} from '../governance/engines.js';
import {
  loadIconIndex,
  searchCandidateIcons,
  searchMotifClusters,
  saveLearnedPreference,
  VB_ICON_VARIANTS,
  renderVbStyledIconSvg,
  renderCandidateThumbSvg,
  buildSingleIconExportSvg,
  buildAllKeywordsSheetSvg,
} from '../governance/iconGenerator.js';
import { updateSidebarActive } from '../components/sidebar.js';
import { copyToClipboard, showToast } from '../utils/helpers.js';

const STATUS = { pass: ['tag-green', 'PASS'], warn: ['tag-gold', 'WARN'], fail: ['tag-error', 'FAIL'] };
const badge = s => `<span class="tag ${STATUS[s][0]}">${STATUS[s][1]}</span>`;
const head = (_eyebrow, _title, desc) => `
  <div style="margin-bottom:32px;">
    <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:860px;">
      ${desc}
    </div>
  </div>`;
const checkList = items => `<ul class="gov-checks">${items.map(i => `
  <li>${badge(i.status)}<span class="gov-check-rule">${i.rule}</span><span class="gov-check-detail">${i.detail || ''}</span></li>`).join('')}</ul>`;

/* ─── 1. BRAND VISIBILITY (하위 탭: LAYOUT PROPOSAL | ICON GENERATOR) ─── */
export function renderLogoFitPage(el, initialTab = 'layout') {
  let activeSubTab = initialTab === 'icon' ? 'icon' : 'layout';
  let type = 'hff';
  let showGuides = true;
  let lastSizeClass = 'standard';
  let currentSpec = null;

  const DEFAULTS = {
    hff: {
      w: 80,
      h: 161,
      pantone: '348C',
      namePt: 26,
      lineName: '메타그린',
      productName: '젤리 더블컷',
      ingredient: '가르시니아캄보지아추출물, 난소화성말토덱스트린, 크롬',
      capacity: '200 g [20 g X 10포]',
      smallException: false,
    },
    food: {
      w: 80,
      h: 161,
      pantone: '348C',
      namePt: 26,
      lineName: '메타그린',
      productName: '젤리 애사비',
      ingredient: '사과초모식초(애플사이다비니거) 35% 함유',
      capacity: '200 g [20 g × 10포 / 140 kcal]',
      smallException: false,
    },
  };

  el.innerHTML = `
    <div style="margin-bottom:22px;">
      <div style="font-size:13px; color:#5A606E; margin-bottom:10px; font-weight:400;">브랜드 식별자 가시성</div>
      <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:860px;">
        폭과 높이를 mm로 입력하면 로고, 라인명·제품명, 원재료명, 내용량을 가운데 정렬로 배치합니다. 배경은 Pantone 번호로, 문안은 RIX신고딕으로 시뮬레이션합니다. Icon Generator는 키워드에 맞는 글로벌 공용 픽토그램을 바이탈뷰티 스타일로 다시 그립니다.
      </div>
    </div>

    <!-- 상단 하위 탭 (LAYOUT PROPOSAL | ICON GENERATOR) -->
    <div class="bv-subtabs" role="tablist">
      <button type="button" class="bv-subtab ${activeSubTab === 'layout' ? 'active' : ''}" data-bv-tab="layout">LAYOUT PROPOSAL</button>
      <button type="button" class="bv-subtab ${activeSubTab === 'icon' ? 'active' : ''}" data-bv-tab="icon">ICON GENERATOR</button>
    </div>

    <!-- [TAB 1] LAYOUT PROPOSAL -->
    <div id="bv-pane-layout" style="display:${activeSubTab === 'layout' ? 'block' : 'none'};">
      <div class="lf-sim-grid">
        <!-- 좌측 입력 패널 -->
        <div class="card gov-panel">
          <div class="pf-sec-title" style="margin-top:0;padding-top:0;border-top:none">1. 제품 구분 &amp; 단상자 전면 규격 (mm)</div>
          <label class="gov-label">제품 구분</label>
          <div class="lf-inline-tabs" id="lf-tabs" role="tablist">
            <button type="button" class="lf-inline-tab active" data-type="hff">건강기능식품</button>
            <button type="button" class="lf-inline-tab" data-type="food">일반식품</button>
          </div>

          <div class="gov-row" style="margin-top:10px">
            <div>
              <label class="gov-label">폭 Width (mm)</label>
              <input id="lf-w" type="number" step="0.5" min="35" max="200" class="gov-input" value="80">
            </div>
            <div>
              <label class="gov-label">높이 Height (mm)</label>
              <input id="lf-h" type="number" step="0.5" min="55" max="260" class="gov-input" value="161">
            </div>
          </div>

          <label class="gov-label" style="margin-top:10px">배경 팬톤 넘버 직접 입력 (PANTONE Solid Coated)</label>
          <div style="display:flex; align-items:stretch; gap:8px;">
            <div id="lf-pantone-chip" style="width:38px; height:38px; flex-shrink:0; background:#00843D; border:1px solid rgba(0,0,0,0.14);" title="배경 팬톤 컬러칩 프리뷰"></div>
            <input id="lf-pantone" class="gov-input" value="348C" placeholder="예: 348C, 144C, 3546C, 230C, 294C..." style="font-weight:700; flex:1; height:38px;">
          </div>

          <div class="pf-sec-title">2. 전면 표기 문안 &amp; 타이포 크기 (pt)</div>
          <div class="gov-row">
            <div>
              <label class="gov-label">라인명 (Bold체 적용)</label>
              <input id="lf-lname" class="gov-input" value="메타그린" placeholder="예: 메타그린" style="font-weight:700">
            </div>
            <div>
              <label class="gov-label">제품명 (Light체 적용)</label>
              <input id="lf-pname" class="gov-input" value="젤리 더블컷" placeholder="예: 젤리 더블컷 / 슬림업" style="font-weight:300">
            </div>
          </div>

          <label class="gov-label" style="margin-top:10px">제품명 크기 직접 조절 (pt)</label>
          <div style="display:flex;gap:10px;align-items:center">
            <input id="lf-name-pt-range" class="vb-range" type="range" min="12" max="44" step="1" value="26" style="flex:1">
            <input id="lf-name-pt" type="number" min="10" max="60" step="0.5" class="gov-input" value="26" style="width:84px;text-align:center;font-weight:700">
          </div>

          <label class="gov-label" id="lf-ing-label" style="margin-top:10px">원재료명 (제품명의 1/2 크기: 13pt 자동 적용 · 가로 폭 초과 시 자동 줄바꿈)</label>
          <textarea id="lf-ing" rows="3" class="gov-input" placeholder="예: 녹차추출물, 바나바잎추출물, 판토텐산"></textarea>

          <div id="lf-food-opts" style="display:none">
            <label class="gov-check" style="margin:6px 0 2px">
              <input type="checkbox" id="lf-small-exc">
              패키지 면적 협소 예외 적용 (표준 10pt / 소형 12pt 허용)
            </label>
          </div>

          <label class="gov-label" id="lf-cap-label">용량 / 내용량 (가운데 정렬 · 10pt · 장평 90% · 자간 -5 · 하단 3mm)</label>
          <input id="lf-cap" class="gov-input" placeholder="예: 200 g [20 g X 10포]">

          <div class="lf-action-bar">
            <button type="button" id="lf-guide-btn" class="btn btn-outline btn-sm">빨간 가이드 치수선 ON</button>
            <button type="button" id="lf-dl-ai" class="btn btn-primary btn-sm">.AI 파일 다운로드</button>
          </div>
        </div>

        <!-- 우측 실시간 시뮬레이션 캔버스 (상하 회색 문구 제거) -->
        <div class="card pf-preview-card" style="padding:0; border:none;">
          <div id="lf-canvas" class="pf-canvas-wrap" style="min-height:540px;"></div>
        </div>
      </div>
    </div>

    <!-- [TAB 2] ICON GENERATOR -->
    <div id="bv-pane-icon" style="display:${activeSubTab === 'icon' ? 'block' : 'none'};">
      <div class="ig-layout">
        <!-- 좌측: 키워드 입력 -->
        <div class="ig-left-col">
          <label class="ig-col-title" for="ig-kw-input">키워드</label>
          <input id="ig-kw-input" class="ig-kw-input" value="수면, 디톡스" placeholder="예: 수면, 디톡스, 혈당, 콜라겐...">
          <p class="ig-help-text">
            쉼표로 여러 개를 넣습니다. 키워드마다 공용 픽토그램 12개를 심플한 형태부터 복잡한 형태까지 제안합니다.
          </p>
          <div class="ig-notice-box">
            <span class="ig-notice-icon">⚗</span>
            전 세계에서 쓰는 공용 아이콘 세트 Lucide(ISC)와 Tabler(MIT) 8천여 개에서 찾아 바이탈뷰티 아이콘 규칙으로 다시 그립니다. 사전에 없는 한국어는 영어 뜻을 찾아 검색하고, 고른 형태는 다음 검색에 먼저 나옵니다. 실제 제품에 쓰기 전에 마스터 검토를 거치세요.
          </div>
        </div>

        <!-- 중앙: 생성 배지 리스트 -->
        <div class="ig-center-col">
          <div class="ig-center-head">
            <span class="ig-col-title" style="margin:0;">생성 배지</span>
            <button type="button" id="ig-dl-all-ai" class="ig-btn-outline">↓ 전체 .ai</button>
          </div>
          <div id="ig-kw-list" class="ig-kw-list">
            <div style="padding:40px 20px; text-align:center; color:#7A808C; font-size:13px;">글로벌 아이콘 인덱스를 불러오는 중입니다...</div>
          </div>
        </div>

        <!-- 우측: 선택한 배지 상세 인스펙터 & 개별 .ai / .svg 다운로드 -->
        <div class="ig-right-col" id="ig-inspector"></div>
      </div>
    </div>`;

  const $ = id => el.querySelector('#' + id);

  // 하위 탭 전환 이벤트
  el.querySelectorAll('.bv-subtab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      activeSubTab = tabBtn.getAttribute('data-bv-tab');
      el.querySelectorAll('.bv-subtab').forEach(b => b.classList.toggle('active', b.getAttribute('data-bv-tab') === activeSubTab));
      $('bv-pane-layout').style.display = activeSubTab === 'layout' ? 'block' : 'none';
      $('bv-pane-icon').style.display = activeSubTab === 'icon' ? 'block' : 'none';
      const targetHash = activeSubTab === 'icon' ? '#/gov/icon-generator' : '#/gov/logo-fit';
      if (window.location.hash !== targetHash) {
        history.replaceState(null, '', targetHash);
        updateSidebarActive();
      }
    });
  });

  // ── [1] LAYOUT PROPOSAL 로직 ──
  const applyTypeDefaults = newType => {
    type = newType;
    el.querySelectorAll('#lf-tabs .lf-inline-tab').forEach(b => b.classList.toggle('active', b.dataset.type === type));
    const d = DEFAULTS[type];
    $('lf-w').value = d.w;
    $('lf-h').value = d.h;
    $('lf-pantone').value = d.pantone;
    $('lf-name-pt').value = d.namePt;
    $('lf-name-pt-range').value = d.namePt;
    $('lf-lname').value = d.lineName;
    $('lf-pname').value = d.productName;
    $('lf-ing').value = d.ingredient;
    $('lf-cap').value = d.capacity;
    $('lf-small-exc').checked = d.smallException;
    lastSizeClass = d.w < 60 ? 'small' : 'standard';

    $('lf-food-opts').style.display = type === 'food' ? 'block' : 'none';
    $('lf-cap-label').textContent = type === 'hff'
      ? '용량 / 내용량 (정중앙 정렬 · 앞에 「건강기능식품」 자동 병기 · 10pt / 90% / -5 · 하단 3mm)'
      : '용량 / 내용량 + 열량 kcal (정중앙 정렬 · 10pt / 90% / -5 · 하단 3mm)';

    run();
  };

  const run = () => {
    const w = Math.max(30, +$('lf-w').value || 80);
    const h = Math.max(50, +$('lf-h').value || 140);
    const newSizeClass = w < 60 ? 'small' : 'standard';
    if (newSizeClass !== lastSizeClass) {
      const prevDefault = lastSizeClass === 'small' ? 18 : 26;
      if (+$('lf-name-pt').value === prevDefault) {
        const nextDefault = newSizeClass === 'small' ? 18 : 26;
        $('lf-name-pt').value = nextDefault;
        $('lf-name-pt-range').value = nextDefault;
      }
      lastSizeClass = newSizeClass;
    }

    const pantoneRes = resolvePantoneInput($('lf-pantone').value);
    const chipEl = $('lf-pantone-chip');
    if (chipEl) {
      chipEl.style.background = pantoneRes.hex;
    }
    const customNamePt = Math.max(8, +$('lf-name-pt').value || (w < 60 ? 18 : 26));
    const lineName = $('lf-lname').value.trim();
    const productName = $('lf-pname').value.trim();

    const spec = autoSpecPackageFront({
      type,
      w,
      h,
      bg: pantoneRes.hex,
      ingBg: pantoneRes.hex,
      customNamePt,
      lineName,
      productName,
      ingredient: $('lf-ing').value,
      capacity: $('lf-cap').value,
      smallException: type === 'food' && $('lf-small-exc').checked,
      claims: '',
    });
    currentSpec = spec;

    $('lf-ing-label').textContent = type === 'hff'
      ? `원재료명 (제품명의 1/2 크기: ${spec.ingPt}pt 자동 적용 · 제품명 아래 3mm · 가로 초과 시 줄바꿈)`
      : `원료명 및 함량 % (하단 용량 위 · ${spec.ingPt}pt · 투명도 70% · 가로 초과 시 줄바꿈)`;

    $('lf-canvas').innerHTML = renderPackageFrontSvg(spec, showGuides);
  };

  const downloadAiFile = () => {
    if (!currentSpec) return;
    const svgForAi = renderPackageFrontSvg(currentSpec, showGuides);
    const safeName = `${currentSpec.lineName}_${currentSpec.productName || 'Package'}`.replace(/\s+/g, '_');
    const blob = buildIllustratorAiBlob(svgForAi, `VITALBEAUTIE_BrandVisibility_${safeName}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VITALBEAUTIE_BrandVisibility_${safeName}_${currentSpec.w}x${currentSpec.h}mm.ai`;
    a.click();
    showToast('Adobe Illustrator (.ai) 파일이 다운로드되었습니다');
  };

  el.querySelectorAll('#lf-tabs .lf-inline-tab').forEach(btn => {
    btn.onclick = () => applyTypeDefaults(btn.dataset.type);
  });

  $('lf-name-pt-range').oninput = e => {
    $('lf-name-pt').value = e.target.value;
    run();
  };
  $('lf-name-pt').oninput = e => {
    $('lf-name-pt-range').value = e.target.value;
    run();
  };

  ['lf-w', 'lf-h', 'lf-pantone', 'lf-lname', 'lf-pname', 'lf-ing', 'lf-cap'].forEach(id => {
    $(id).oninput = run;
  });
  $('lf-small-exc').onchange = run;

  $('lf-guide-btn').onclick = e => {
    showGuides = !showGuides;
    e.currentTarget.textContent = `빨간 가이드 치수선 ${showGuides ? 'ON' : 'OFF'}`;
    run();
  };

  $('lf-dl-ai').onclick = downloadAiFile;

  applyTypeDefaults('hff');

  // ── [2] ICON GENERATOR 로직 ──
  setupIconGenerator(el);
}

function setupIconGenerator(el) {
  const kwInput = el.querySelector('#ig-kw-input');
  const kwListEl = el.querySelector('#ig-kw-list');
  const inspectorEl = el.querySelector('#ig-inspector');
  const dlAllBtn = el.querySelector('#ig-dl-all-ai');

  let indexData = null;
  // 키워드별 페이지 오프셋 (↻ 다른 형태 클릭 시 증가)
  const pageOffsets = {};
  // 키워드별 선택된 후보 아이콘 ID
  const selectedCandByKw = {};
  // 현재 우측 인스펙터에 포커스된 키워드 index 및 바이탈뷰티 버전 ID
  let activeKwIdx = 0;
  let activeVariantId = 'circle-line';
  let currentBlocks = [];

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const renderInspector = () => {
    const block = currentBlocks[activeKwIdx] || currentBlocks[0];
    if (!block || !block.selectedCandidate) {
      inspectorEl.innerHTML = '';
      return;
    }
    const cand = block.selectedCandidate;
    const variant = VB_ICON_VARIANTS.find(v => v.id === activeVariantId) || VB_ICON_VARIANTS[0];
    const heroSvg = renderVbStyledIconSvg(cand, variant.id, {
      koText: block.keyword,
      enText: block.enCopy,
      uid: 'insp-hero',
    });
    const svg16 = renderVbStyledIconSvg(cand, variant.id, {
      koText: block.keyword,
      enText: block.enCopy,
      uid: 'insp-16',
    });
    const svg24 = renderVbStyledIconSvg(cand, variant.id, {
      koText: block.keyword,
      enText: block.enCopy,
      uid: 'insp-24',
    });
    const svg48 = renderVbStyledIconSvg(cand, variant.id, {
      koText: block.keyword,
      enText: block.enCopy,
      uid: 'insp-48',
    });

    const sourceSetShort = cand.setCode === 'L' ? 'Lucide' : 'Tabler';
    const tagsDisplay = cand.tags && cand.tags.length ? cand.tags.slice(0, 3).join(', ') : block.enCopy;

    inspectorEl.innerHTML = `
      <div class="ig-insp-card">
        <div class="ig-insp-hero">
          <div class="ig-insp-hero-svg">${heroSvg}</div>
        </div>

        <div class="ig-insp-title">${block.keyword} · ${variant.label}</div>
        <div class="ig-insp-sub">${cand.tierLabel} 형태 · 카피 ${block.enCopy}</div>

        <div class="ig-insp-sec-title">작은 크기 (16 · 24 · 48px)</div>
        <div class="ig-insp-sizes">
          <div class="ig-size-box" style="width:16px;height:16px">${svg16}</div>
          <div class="ig-size-box" style="width:24px;height:24px">${svg24}</div>
          <div class="ig-size-box" style="width:48px;height:48px">${svg48}</div>
        </div>

        <div class="ig-insp-sec-title">기반 픽토그램</div>
        <div class="ig-insp-meta-main">${sourceSetShort} ${cand.name}</div>
        <div class="ig-insp-meta-tags">${tagsDisplay}</div>

        <div class="ig-insp-sec-title">바이탈뷰티 재가공</div>
        <ul class="ig-insp-list">
          <li>· 글로벌 공용 픽토그램(${sourceSetShort})을 24 그리드에서 다시 그림</li>
          <li>· 단색 VB 블랙, 선 끝·모서리 round</li>
          <li>· ${variant.frameDesc}</li>
          <li>· 픽토그램 선 두께를 테두리와 같게 통일</li>
        </ul>

        <div class="ig-insp-actions">
          <button type="button" id="ig-dl-single-ai" class="ig-btn-black">↓ .ai</button>
          <button type="button" id="ig-dl-single-svg" class="ig-btn-outline">↓ .svg</button>
        </div>

        <p class="ig-insp-foot">
          AI 파일은 30×30mm 아트보드입니다. 선은 편집 가능한 선으로, 글자는 윤곽선으로 들어갑니다. 전체 .ai에는 키워드마다 형태 후보 전체와 선택한 형태의 6가지 버전이 들어갑니다.
        </p>
      </div>
    `;

    const singleAiBtn = inspectorEl.querySelector('#ig-dl-single-ai');
    const singleSvgBtn = inspectorEl.querySelector('#ig-dl-single-svg');

    if (singleAiBtn) {
      singleAiBtn.onclick = () => {
        const exportSvg = buildSingleIconExportSvg(cand, variant.id, {
          koText: block.keyword,
          enText: block.enCopy,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = buildIllustratorAiBlob(exportSvg, `VITALBEAUTIE_${safeKw}_${variant.id}`);
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${variant.id}_30x30mm.ai`);
        showToast(`${block.keyword} (${variant.label}) .ai 파일이 다운로드되었습니다`);
      };
    }

    if (singleSvgBtn) {
      singleSvgBtn.onclick = () => {
        const exportSvg = buildSingleIconExportSvg(cand, variant.id, {
          koText: block.keyword,
          enText: block.enCopy,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${variant.id}.svg`);
        showToast(`${block.keyword} (${variant.label}) .svg 파일이 다운로드되었습니다`);
      };
    }
  };

  const motifLevels = {};

  const renderAllKeywordBlocks = () => {
    if (!indexData) return;
    const rawKeywords = (kwInput.value || '수면, 디톡스')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const keywords = rawKeywords.length ? rawKeywords : ['수면', '디톡스'];

    if (activeKwIdx >= keywords.length) activeKwIdx = 0;

    currentBlocks = keywords.map(kw => {
      const cluster = searchMotifClusters(indexData, kw);
      return {
        keyword: cluster.keyword,
        enCopy: cluster.enCopy,
        motifs: cluster.motifs,
      };
    });

    kwListEl.innerHTML = currentBlocks.map((block, bIdx) => {
      const motifsHtml = block.motifs.map((motif, mIdx) => {
        const key = `${block.keyword}:${motif.id}`;
        const curLevel = motifLevels[key] || 1;
        const levelObj = motif.levels[curLevel - 1] || motif.levels[0];
        const activeIcon = levelObj.icon;

        const variantsHtml = VB_ICON_VARIANTS.map((v, vIdx) => {
          const svg = renderVbStyledIconSvg(activeIcon, v.id, {
            koText: block.keyword,
            enText: block.enCopy,
            uid: `b${bIdx}-m${mIdx}-v${vIdx}`,
          });
          return `
            <div class="ig-motif-var-item">
              <div class="ig-motif-var-svg">${svg}</div>
              <span class="ig-motif-var-label">${v.label}</span>
            </div>`;
        }).join('');

        return `
          <div class="ig-motif-card" data-kw="${block.keyword}" data-motif-id="${motif.id}">
            <div class="ig-motif-card-head">
              <div class="ig-motif-title-group">
                <span class="ig-motif-badge-num">모티프 ${mIdx + 1}</span>
                <strong class="ig-motif-title">${motif.title}</strong>
              </div>
              <span class="ig-motif-lvl-badge">Lv.${curLevel} ${levelObj.label}</span>
            </div>

            <div class="ig-slider-box">
              <div class="ig-slider-desc-row">
                <span class="ig-slider-desc">특징: ${levelObj.desc}</span>
                <span class="ig-slider-hint">바툴로 복잡도 실시간 조절</span>
              </div>
              <input type="range" min="1" max="4" step="1" value="${curLevel}" class="ig-complexity-range" data-kw="${block.keyword}" data-motif-id="${motif.id}">
              <div class="ig-slider-ticks">
                <span class="${curLevel === 1 ? 'active' : ''}">① 심플</span>
                <span class="${curLevel === 2 ? 'active' : ''}">② 베이직</span>
                <span class="${curLevel === 3 ? 'active' : ''}">③ 스탠다드</span>
                <span class="${curLevel === 4 ? 'active' : ''}">④ 컴플렉스</span>
              </div>
            </div>

            <div class="ig-sub-label">바이탈뷰티 6가지 배지 스타일 실시간 시뮬레이션</div>
            <div class="ig-motif-variants-grid">
              ${variantsHtml}
            </div>

            <div class="ig-motif-action-row">
              <button type="button" class="btn btn-sm btn-outline ig-dl-ai-single" data-kw="${block.keyword}" data-motif-id="${motif.id}">.AI 벡터 다운로드</button>
              <button type="button" class="btn btn-sm btn-outline ig-dl-svg-single" data-kw="${block.keyword}" data-motif-id="${motif.id}">.SVG 다운로드</button>
            </div>
          </div>`;
      }).join('');

      return `
        <div class="ig-kw-card">
          <div class="ig-kw-head">
            <div>
              <strong class="ig-kw-ko">${block.keyword}</strong>
              <span class="ig-kw-en">${block.enCopy} · 모티프 ${block.motifs.length}종 제안</span>
            </div>
          </div>
          <div style="margin-top:14px;">
            ${motifsHtml}
          </div>
        </div>`;
    }).join('');

    // 이벤트 바인딩: 각 모티프별 복잡도 조절 슬라이더
    kwListEl.querySelectorAll('.ig-complexity-range').forEach(slider => {
      slider.oninput = e => {
        const kw = e.target.getAttribute('data-kw');
        const motifId = e.target.getAttribute('data-motif-id');
        motifLevels[`${kw}:${motifId}`] = +e.target.value;
        renderAllKeywordBlocks();
      };
    });

    // 이벤트 바인딩: 개별 모티프 .AI 다운로드
    kwListEl.querySelectorAll('.ig-dl-ai-single').forEach(btn => {
      btn.onclick = () => {
        const kw = btn.getAttribute('data-kw');
        const motifId = btn.getAttribute('data-motif-id');
        const block = currentBlocks.find(b => b.keyword === kw);
        const motif = block?.motifs.find(m => m.id === motifId);
        if (!motif) return;
        const curLevel = motifLevels[`${kw}:${motif.id}`] || 1;
        const levelObj = motif.levels[curLevel - 1] || motif.levels[0];
        const exportSvg = buildSingleIconExportSvg(levelObj.icon, 'circle-line', {
          koText: block.keyword,
          enText: block.enCopy,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = buildIllustratorAiBlob(exportSvg, `VITALBEAUTIE_${safeKw}_${motif.id}_Lv${curLevel}`);
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${motif.id}_Lv${curLevel}.ai`);
        showToast(`${block.keyword} - ${motif.title} (Lv.${curLevel}) .ai 파일이 다운로드되었습니다`);
      };
    });

    // 이벤트 바인딩: 개별 모티프 .SVG 다운로드
    kwListEl.querySelectorAll('.ig-dl-svg-single').forEach(btn => {
      btn.onclick = () => {
        const kw = btn.getAttribute('data-kw');
        const motifId = btn.getAttribute('data-motif-id');
        const block = currentBlocks.find(b => b.keyword === kw);
        const motif = block?.motifs.find(m => m.id === motifId);
        if (!motif) return;
        const curLevel = motifLevels[`${kw}:${motif.id}`] || 1;
        const levelObj = motif.levels[curLevel - 1] || motif.levels[0];
        const exportSvg = buildSingleIconExportSvg(levelObj.icon, 'circle-line', {
          koText: block.keyword,
          enText: block.enCopy,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${motif.id}_Lv${curLevel}.svg`);
        showToast(`${block.keyword} - ${motif.title} (Lv.${curLevel}) .svg 파일이 다운로드되었습니다`);
      };
    });

    renderInspector();
  };

  kwInput.addEventListener('input', () => {
    renderAllKeywordBlocks();
  });

  if (dlAllBtn) {
    dlAllBtn.onclick = () => {
      if (!currentBlocks.length) return;
      const sheetSvg = buildAllKeywordsSheetSvg(currentBlocks);
      const safeNames = currentBlocks.map(b => b.keyword.replace(/\s+/g, '_')).join('_');
      const blob = buildIllustratorAiBlob(sheetSvg, `VITALBEAUTIE_All_Icons_${safeNames}`);
      triggerDownload(blob, `VITALBEAUTIE_IconSheet_${safeNames}.ai`);
      showToast('전체 키워드 아이콘 시트 (.ai) 파일이 다운로드되었습니다');
    };
  }

  loadIconIndex().then(data => {
    indexData = data;
    renderAllKeywordBlocks();
  });
}

/* 레거시 라우트 호환: /gov/visual-dna 접근 시 BRAND VISIBILITY > ICON GENERATOR 탭으로 연결 */
export function renderVisualDnaPage(el) {
  renderLogoFitPage(el, 'icon');
}

/* ─── 3. Family Look (성분·기능 키워드 & 17개 대표 컬러칩 선택 기반 글로벌 통용 팬톤칩 제안 및 기존 제품과 1:1 비교) ─── */
export function renderFamilyLookPage(el) {
  let selectedToneId = 'pink';
  let selectedMinDe = 10;
  let pageOffset = 0;

  const chipsHtml = REPRESENTATIVE_COLOR_CHIPS.map(chip => `
    <button type="button" class="fl-round-chip ${chip.id === selectedToneId ? 'active' : ''}" data-tone-id="${chip.id}" title="${chip.label}">
      <span class="fl-round-swatch" style="background:${chip.swatch}; ${chip.id === 'beige' ? 'border-color:#C5BFB0;' : ''}"></span>
      <span class="fl-round-label">${chip.label}</span>
    </button>
  `).join('');

  el.innerHTML = `${head(
    'Module 02 · Global Functional Color & Pantone Recommender',
    'Family Look · 성분·기능 기반 글로벌 팬톤 컬러 제안',
    `건강기능식품·일반식품의 성분이나 기능 키워드를 입력하면 글로벌 시장에서 통용되는 대표 컬러 계열과 그 선정 근거를 제시하고, 바이탈뷰티 기존 제품군(${PACKAGE_LINES.allProducts.length}종)과 겹치지 않는 공식 PANTONE Solid Coated 컬러칩을 제안합니다.`
  )}
    <div class="gov-layout">
      <!-- 좌측: 성분 또는 기능 & 대표 컬러(17개) & 최소 색차 (ΔE2000) -->
      <div class="card gov-panel">
        <label class="gov-label" for="fl-func" style="font-size:14px;font-weight:700;color:#101820;margin-bottom:8px;">성분 또는 기능</label>
        <input id="fl-func" class="gov-input" value="콜라겐" placeholder="예: 수면, 콜라겐, 유산균, 홍삼">

        <label class="gov-label" style="font-size:14px;font-weight:700;color:#101820;margin-top:24px;margin-bottom:4px;">대표 컬러 (선택)</label>
        <div class="fl-chip-grid-17" id="fl-chips-17">
          ${chipsHtml}
        </div>

        <label class="gov-label" style="font-size:14px;font-weight:700;color:#101820;margin-top:24px;margin-bottom:4px;">기존 컬러와 최소 색차 (ΔE2000)</label>
        <div class="fl-de-bar" id="fl-de-bar">
          <button type="button" class="fl-de-btn ${selectedMinDe === 6 ? 'active' : ''}" data-de="6">6</button>
          <button type="button" class="fl-de-btn ${selectedMinDe === 10 ? 'active' : ''}" data-de="10">10</button>
          <button type="button" class="fl-de-btn ${selectedMinDe === 15 ? 'active' : ''}" data-de="15">15</button>
          <button type="button" class="fl-de-btn ${selectedMinDe === 20 ? 'active' : ''}" data-de="20">20</button>
        </div>
        <p class="fl-de-desc">
          숫자가 클수록 기존 제품과 더 확실히 다른 색만 남깁니다. 10이면 매대에서 나란히 놓아도 구분되는 수준입니다. 각 제안 아래에는 그 색과 가장 가까운 기존 제품의 컬러와 Pantone 번호를 나란히 비교합니다.
        </p>
      </div>

      <!-- 우측: 제안 팬톤칩과 기존 제품 실시간 1:1 비교 -->
      <div class="gov-result">
        <div class="card" style="padding:24px">
          <div class="gov-cand-top" style="align-items:flex-start; margin-bottom:18px;">
            <div style="flex:1; padding-right:16px;">
              <div id="fl-cat-title" style="font-size:15px; font-weight:700; color:#101820; margin-bottom:4px;"></div>
              <div id="fl-global-color-badge" style="font-size:12.5px; font-weight:600; color:#101820; margin-bottom:8px;"></div>
              <div id="fl-global-reason" style="font-size:13px; color:#4A505C; line-height:1.65; background:#F8F9FB; border-left:3px solid #101820; padding:12px 14px;"></div>
            </div>
            <button type="button" class="btn btn-sm btn-outline" id="fl-re" style="flex-shrink:0;">다른 조합 제안</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px;" id="fl-sug"></div>
        </div>
      </div>
    </div>`;

  const $ = id => el.querySelector('#' + id);

  const renderSuggestions = () => {
    const res = suggestChips({
      funcText: $('fl-func').value,
      selectedToneId,
      minDeltaE: selectedMinDe,
      offset: pageOffset,
    }, 6);

    const ga = res.globalAnalysis;
    $('fl-cat-title').textContent = ga.categoryTitle;
    $('fl-global-color-badge').textContent = selectedToneId === 'auto'
      ? `글로벌 통용 컬러: ${ga.globalColorName}`
      : `글로벌 통용 컬러: ${ga.globalColorName} · 선택 필터: ${res.selectedChipObj.label}`;
    $('fl-global-reason').textContent = ga.globalReason;

    if (!res.picked.length) {
      $('fl-sug').innerHTML = `
        <div style="padding:40px 20px;text-align:center;color:#7A808C;background:#F8F9FB;border:1px dashed #D5D8DE;">
          최소 색차 ΔE ${selectedMinDe} 기준을 만족하는 신규 팬톤 후보가 없습니다. 최소 색차 기준을 낮추거나 다른 대표 컬러를 선택하세요.
        </div>`;
      return;
    }

    $('fl-sug').innerHTML = res.picked.map(p => {
      const deLabel = p.minD >= 12 ? '매대 구분 매우 확실' : p.minD >= 10 ? '매대 구분 명확' : '식별 가능 수준';
      return `
        <div class="fl-comp-card">
          <div class="fl-comp-row">
            <!-- 제안 컬러 -->
            <div class="fl-comp-chip-box">
              <div class="fl-comp-swatch-lg" style="background:${p.hex}"></div>
              <div class="fl-comp-meta">
                <span class="fl-comp-role" style="color:#00843D;">신규 추천 PANTONE</span>
                <strong class="fl-comp-title">${p.pantoneCode}</strong>
                <span class="fl-comp-sub">${p.hex}</span>
              </div>
            </div>

            <!-- 색차 델타E 배지 -->
            <div class="fl-comp-divider">
              <span class="fl-de-pill">ΔE ${p.minD.toFixed(1)}</span>
              <small style="font-size:10.5px;color:#7A808C;margin-top:4px;white-space:nowrap;">${deLabel}</small>
            </div>

            <!-- 가장 가까운 기존 제품 -->
            <div class="fl-comp-chip-box">
              <div class="fl-comp-swatch-lg" style="background:${p.nearestHex}"></div>
              <div class="fl-comp-meta">
                <span class="fl-comp-role" style="color:#101820;">가장 가까운 기존 제품</span>
                <strong class="fl-comp-title">${p.nearestName}</strong>
                <span class="fl-comp-sub">${p.nearestPantone} (${p.nearestHex})</span>
              </div>
            </div>
          </div>

          <!-- 설명 코멘트 -->
          <div class="fl-comp-footer">
            기존 제품 <b>「${p.nearestName}」</b> (${p.nearestPantone}) 대비 색차 <b>ΔE2000 = ${p.minD.toFixed(1)}</b>을 확보하여, 올리브영 등 매대에 나란히 진열되어도 소비자에게 혼동을 주지 않고 신제품만의 고유한 식별력을 가집니다.
          </div>
        </div>`;
    }).join('');
  };

  $('fl-func').oninput = () => {
    pageOffset = 0;
    renderSuggestions();
  };

  el.querySelectorAll('#fl-chips-17 .fl-round-chip').forEach(btn => {
    btn.onclick = () => {
      selectedToneId = btn.getAttribute('data-tone-id');
      pageOffset = 0;
      el.querySelectorAll('#fl-chips-17 .fl-round-chip').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tone-id') === selectedToneId);
      });
      renderSuggestions();
    };
  });

  el.querySelectorAll('#fl-de-bar .fl-de-btn').forEach(btn => {
    btn.onclick = () => {
      selectedMinDe = +btn.getAttribute('data-de');
      pageOffset = 0;
      el.querySelectorAll('#fl-de-bar .fl-de-btn').forEach(b => {
        b.classList.toggle('active', +b.getAttribute('data-de') === selectedMinDe);
      });
      renderSuggestions();
    };
  });

  $('fl-re').onclick = () => {
    pageOffset += 1;
    renderSuggestions();
  };

  renderSuggestions();
}

/* ─── 4. Localization (국문 기준 파일 업로드 → 폭·높이 및 문안 위치 자동 인식 → 미국(US)·일본(JP) 자동 번역 시뮬레이션) ─── */
export function renderLocalizationPage(el) {
  // 기본 내장 샘플: 메타그린 젤리 더블컷 / 애사비 / 부스터샷 등에서도 즉시 체험 가능하며, 실제 SVG 파일 업로드 시 즉시 파싱
  const buildFromPreset = p => ({
    fileName: `${p.label}_국문원고.svg`,
    wMm: p.w,
    hMm: p.h,
    areaCm2: +((p.w * p.h) / 100).toFixed(1),
    type: p.type,
    nodes: p.type === 'hff'
      ? [
          { role: 'title', text: `${p.lineName} ${p.productName}`, xMm: +(p.w / 2).toFixed(1), yMm: +(p.topLine + p.tagH + p.gapTagName + 8).toFixed(1), yRatio: 0.2, pt: p.namePt },
          { role: 'ingredient', text: p.ingredient.replace(/\n/g, ', '), xMm: +(p.w / 2).toFixed(1), yMm: +(p.topLine + p.tagH + p.gapTagName + 21).toFixed(1), yRatio: 0.32, pt: p.ingPt },
          { role: 'capacity', text: `건강기능식품 ${p.capacity}`, xMm: +(p.w / 2).toFixed(1), yMm: +(p.h - 18 - 2.5).toFixed(1), yRatio: +((p.h - 20.5) / p.h).toFixed(2), pt: p.capPt },
        ]
      : [
          { role: 'title', text: `${p.lineName} ${p.productName}`, xMm: +(p.w / 2).toFixed(1), yMm: +(p.topLine + p.tagH + p.gapTagName + 8).toFixed(1), yRatio: 0.2, pt: p.namePt },
          { role: 'ingredient', text: p.ingredient.replace(/\n/g, ' · '), xMm: +(p.w / 2).toFixed(1), yMm: +(p.h - 14).toFixed(1), yRatio: 0.86, pt: p.ingPt },
          { role: 'capacity', text: p.capacity, xMm: +(p.w / 2).toFixed(1), yMm: +(p.h - p.bottomMargin - 1).toFixed(1), yRatio: 0.95, pt: p.capPt },
        ],
  });

  let parsed = buildFromPreset(PRESETS[2]); // 메타그린 젤리 더블컷 기본

  el.innerHTML = `${head(
    'Module 04 · Auto-Parsed Global Package Localization (KR → US / JP)',
    'Localization · 국문 원고 자동 인식 & 미국·일본 시뮬레이션',
    '국문 기준 디자인 파일(.svg)을 업로드하면 단상자 폭·높이(mm)와 각 문안(제품명·원재료명·용량)의 좌표를 자동으로 인식하고, 미국(FDA 영문)·일본(소비자청 일문) 표기 기준으로 자동 번역하여 동일 레이아웃 시뮬레이션 화면에 표시합니다.'
  )}
    <div class="card pf-preset-bar" style="justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <label class="btn btn-primary btn-sm" style="cursor:pointer;margin:0">
          국문 기준 파일(.svg) 업로드
          <input type="file" id="lc-upload" accept=".svg,.txt,.json" style="display:none">
        </label>
        <span class="gov-sub" id="lc-file-status">파일을 업로드하거나 우측의 메타그린 가이드 원고 샘플을 선택하세요.</span>
      </div>
      <div class="gov-pills" id="lc-samples">
        ${PRESETS.slice(0, 5).map((p, i) => `<button type="button" class="pf-pill ${i === 2 ? 'active' : ''}" data-id="${p.id}">${p.label} 원고</button>`).join('')}
      </div>
    </div>

    <div class="gov-layout" style="margin-bottom:24px">
      <!-- 좌측: 자동 인식된 규격 및 문안 좌표 테이블 -->
      <div class="card gov-panel">
        <div class="pf-sec-title" style="margin-top:0;padding-top:0;border-top:none">1. 자동 인식된 단상자 규격</div>
        <div class="gov-row">
          <div><label class="gov-label">인식된 폭(mm)</label><input id="lc-w" type="number" step="0.1" class="gov-input"></div>
          <div><label class="gov-label">인식된 높이(mm)</label><input id="lc-h" type="number" step="0.1" class="gov-input"></div>
          <div><label class="gov-label">주표시면 면적</label><input id="lc-area" class="gov-input" disabled></div>
        </div>

        <div class="pf-sec-title">2. 제품명 크기 직접 조절 (pt)</div>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">
          <input id="lc-title-pt-range" class="vb-range" type="range" min="14" max="44" step="1" value="26" style="flex:1">
          <input id="lc-title-pt" type="number" min="10" max="60" step="0.5" class="gov-input" value="26" style="width:84px;text-align:center;font-weight:700">
        </div>

        <div class="pf-sec-title">3. 자동 인식된 문안 위치 &amp; 역할 (편집 가능)</div>
        <div id="lc-nodes-editor" class="lc-nodes-list"></div>
      </div>

      <!-- 우측: KR 원본 → US(미국 영문) → JP(일본 일문) 3단 비교 시뮬레이션 -->
      <div class="gov-result">
        <div class="lc-sim-cols" id="lc-sim-out"></div>
      </div>
    </div>`;

  const $ = id => el.querySelector('#' + id);

  const renderEditors = () => {
    $('lc-w').value = parsed.wMm;
    $('lc-h').value = parsed.hMm;
    $('lc-area').value = `${parsed.areaCm2} ㎠ (${parsed.type === 'hff' ? '건강기능식품' : '일반식품'})`;
    $('lc-file-status').innerHTML = `인식 완료: <b>${parsed.fileName}</b> · 폭 <b>${parsed.wMm}mm</b> × 높이 <b>${parsed.hMm}mm</b> · 문안 블록 <b>${parsed.nodes.length}개</b> 추출`;

    const titleNode = parsed.nodes.find(n => n.role === 'title');
    if (titleNode) {
      $('lc-title-pt-range').value = titleNode.pt || 26;
      $('lc-title-pt').value = titleNode.pt || 26;
    }

    $('lc-nodes-editor').innerHTML = parsed.nodes.map((n, idx) => `
      <div class="lc-node-item">
        <div class="gov-cand-top" style="margin-bottom:4px">
          <span class="tag ${n.role === 'title' ? 'tag-gold' : n.role === 'ingredient' ? 'tag-green' : 'tag-gold'}">${n.role.toUpperCase()}</span>
          <small class="gov-sub">Y좌표 ${n.yMm}mm (상단 ${(n.yRatio * 100).toFixed(0)}%) · ${n.pt}pt</small>
        </div>
        <input class="gov-input lc-node-inp" data-idx="${idx}" value="${n.text}">
      </div>`).join('');

    el.querySelectorAll('.lc-node-inp').forEach(inp => {
      inp.oninput = () => {
        parsed.nodes[+inp.dataset.idx].text = inp.value;
        renderSimulations();
      };
    });
  };

  const renderSimulations = () => {
    const targets = [
      { code: 'KR', lang: 'ko', title: 'KR · 국문 원본 (식약처 기준)', badge: '원본 좌표 인식', source: '식품의약품안전처 표시기준' },
      { code: 'US', lang: 'en', title: 'US · 미국 영문 (FDA 21 CFR)', badge: 'EN 자동번역 · oz 병기', source: 'FDA Dietary Supplement / Food Label' },
      { code: 'JP', lang: 'ja', title: 'JP · 일본 일문 (소비자청 기준)', badge: 'JA 자동번역 · 機能性/食品表示', source: '消費者庁 食品表示基準' },
    ];

    $('lc-sim-out').innerHTML = targets.map(t => {
      const svg = renderLocalizedPackageSvg(parsed, t.code);
      const translatedRows = parsed.nodes.map(n => {
        const tr = t.lang === 'ko' ? n.text : translateKoPackageText(n.text, t.lang);
        return `<div class="lc-tr-row"><b>[${n.role.toUpperCase()} · Y ${n.yMm}mm]</b> <span>${tr}</span></div>`;
      }).join('');

      return `
        <div class="card pf-preview-card">
          <div class="gov-cand-top">
            <div>
              <b>${t.title}</b>
              <div class="gov-sub">${t.source}</div>
            </div>
            <span class="tag tag-green">${t.badge}</span>
          </div>
          <div class="pf-canvas-wrap" style="min-height:390px">${svg}</div>
          <div class="lc-tr-box">${translatedRows}</div>
        </div>`;
    }).join('');
  };

  $('lc-title-pt-range').oninput = e => {
    const val = +e.target.value;
    $('lc-title-pt').value = val;
    const tn = parsed.nodes.find(n => n.role === 'title');
    if (tn) tn.pt = val;
    renderSimulations();
  };
  $('lc-title-pt').oninput = e => {
    const val = +e.target.value;
    $('lc-title-pt-range').value = val;
    const tn = parsed.nodes.find(n => n.role === 'title');
    if (tn) tn.pt = val;
    renderSimulations();
  };

  $('lc-upload').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const raw = await f.text();
    const res = parseKoreanPackageFile(raw, f.name);
    if (res && res.nodes.length) {
      parsed = res;
      el.querySelectorAll('#lc-samples button').forEach(b => b.classList.remove('active'));
      renderEditors();
      renderSimulations();
      showToast(`「${f.name}」 폭 ${res.wMm}mm × 높이 ${res.hMm}mm 및 문안 ${res.nodes.length}개 인식 완료`);
    } else {
      showToast('SVG에서 단상자 규격 또는 텍스트 노드를 찾지 못했습니다.');
    }
  };

  el.querySelectorAll('#lc-samples button').forEach(btn => {
    btn.onclick = () => {
      el.querySelectorAll('#lc-samples button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = PRESETS.find(x => x.id === btn.dataset.id);
      parsed = buildFromPreset(p);
      renderEditors();
      renderSimulations();
    };
  });

  ['lc-w', 'lc-h'].forEach(id => {
    $(id).oninput = () => {
      parsed.wMm = +$('lc-w').value || parsed.wMm;
      parsed.hMm = +$('lc-h').value || parsed.hMm;
      parsed.areaCm2 = +((parsed.wMm * parsed.hMm) / 100).toFixed(1);
      $('lc-area').value = `${parsed.areaCm2} ㎠ (${parsed.type === 'hff' ? '건강기능식품' : '일반식품'})`;
      renderSimulations();
    };
  });

  renderEditors();
  renderSimulations();
}

/* ─── 5. Package Front (메타그린 단상자 전면 거버넌스) ─── */
const ALLERGENS_22 = [
  '난류(가금류)', '우유', '메밀', '땅콩', '대두', '밀', '고등어', '게', '새우', '돼지고기', '복숭아',
  '토마토', '아황산류', '호두', '닭고기', '쇠고기', '오징어', '조개류(굴·전복·홍합)', '잣', '아몬드', '마카다미아', '피스타치오',
];

const CHECKLIST_HFF = [
  ['건강기능식품 표시 또는 도안 (주표시면 15×15mm)', '주표시면 필수'],
  ['제품명 (라인명 Bold + 제품명 Light)', '주표시면 필수'],
  ['내용량 (10pt / 90% / -5 · 하단 3mm)', '주표시면 필수'],
  ['기능성 원료명 (주표시면 제품명의 1/2 크기) 및 함량', '주표시면·정보표시면'],
  ['영업소 명칭 및 소재지', '주표시면 또는 정보표시면'],
  ['질병의 예방 및 치료를 위한 의약품이 아니라는 표현 (바닥면과 평행)', '주표시면 또는 정보표시면'],
  ['소비기한 및 보관방법', '정보표시면'],
  ['영양정보 (별표 1 전용 서식 · 일반식품 서식 재사용 금지)', '정보표시면'],
  ['기능정보 (인정된 기능성 범위 및 지표성분 함량)', '정보표시면'],
  ['1일 섭취량 · 섭취방법', '정보표시면'],
  ['섭취 시 주의사항', '정보표시면'],
  ['기타 원료명 및 함량 (기능성 원료 오인 강조 금지)', '정보표시면'],
  ['알레르기 유발물질 22종 및 혼입 우려 표시', '정보표시면'],
  ['1개 영양성분/기능성원료 사용 시 주표시면 일부 표시 확인', '해당 시 주표시면'],
  ['부정·불량식품 신고번호 1399', '정보표시면'],
  ['포장재질 및 분리배출 도안', '정보표시면'],
  ['GMP 도안 적용 적합성 (건강기능식품 도안과 혼용 금지 · 2028.1.1 개정 도안 확인)', '해당 시'],
  ['표시·광고 자율심의 필 여부', '실무 필수'],
];

const CHECKLIST_FOOD = [
  ['제품명 (품목제조보고 정식 명칭 · 브랜드/라인명 구분)', '주표시면 필수'],
  ['내용량 및 해당 시 열량(kcal) 병기 (10pt / 90% / -5)', '주표시면 필수'],
  ['주표시면 강조 원료명 + 함량(%) (하단 70% 투명도 · 14pt, 소형만 10~12pt 예외)', '주표시면 필수'],
  ['식품유형 (음료베이스·효소식품·과채가공품 등)', '주표시면 또는 정보표시면'],
  ['원재료명 및 함량 (복합원재료·식품첨가물 순서)', '정보표시면'],
  ['알레르기 유발물질 22종 함유 및 제조설비 혼입 우려 표시', '원재료명 인접 고대비'],
  ['제조원·유통전문판매원 등 영업소 명칭 및 소재지', '정보표시면'],
  ['소비기한 및 날인 위치 안내 문구', '정보표시면'],
  ['보관방법 (실온·냉장·직사광선 주의 등)', '정보표시면'],
  ['영양정보 9대 성분 서식 (열량·나트륨·탄수화물·당류·지방·트랜스지방·포화지방·콜레스테롤·단백질, 10pt 이상)', '정보표시면'],
  ['영양강조표시(고식이섬유·저당·무설탕 등) 법정 기준 충족 여부', '전면 강조 시'],
  ['소비자 안전 주의사항', '정보표시면'],
  ['부정·불량식품 신고번호 1399', '정보표시면'],
  ['식품 직접 접촉 포장재질 및 분리배출 표시', '정보표시면'],
  ['원산지 · 유전자변형식품(GMO) 등 품목별 특별 표시', '해당 시'],
];

export function renderPackageFrontPage(el) {
  let state = { ...PRESETS[0] };
  let showGuides = true;
  let filterCat = 'all';

  el.innerHTML = `${head(
    'Module 05 · Meta Green Package Front Governance',
    '메타그린 단상자 전면(주표시면) 거버넌스',
    '메타그린 전면 디자인 가이드(빨간 주석 8종 실측)와 식약처 「건강기능식품의 표시기준」·「식품등의 표시기준」(제2026-37호)을 결합해 전면 레이아웃·타이포·컬러·인증마크를 자동 설계하고 법적/브랜드 준수 여부를 판정합니다.'
  )}
    <div class="pf-preset-bar">
      <span class="gov-label" style="margin:0">가이드 8종 프리셋</span>
      <div class="gov-pills" id="pf-presets">
        ${PRESETS.map((p, i) => `<button class="pf-pill ${i === 0 ? 'active' : ''}" data-id="${p.id}">
          <span class="pf-type-dot ${p.type}"></span>${p.label} <small>${p.w}×${p.h}</small>
        </button>`).join('')}
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button id="pf-autofix" class="btn btn-primary btn-sm">가이드 규격 자동 보정</button>
        <button id="pf-toggle-guide" class="btn btn-outline btn-sm">빨간 가이드선 ON</button>
      </div>
    </div>

    <div class="pf-grid">
      <!-- 입력 패널 -->
      <div class="card gov-panel pf-form">
        <div class="gov-row">
          <div>
            <label class="gov-label">제품 구분 (법령 분기)</label>
            <select id="pf-type" class="gov-input">
              <option value="hff">건강기능식품 (건강기능식품의 표시기준)</option>
              <option value="food">일반식품 (식품등의 표시기준)</option>
            </select>
          </div>
        </div>
        <div class="gov-row">
          <div><label class="gov-label">단상자 폭(mm)</label><input id="pf-w" type="number" step="0.1" class="gov-input"></div>
          <div><label class="gov-label">높이(mm)</label><input id="pf-h" type="number" step="0.1" class="gov-input"></div>
          <div><label class="gov-label">규격 분류</label><input id="pf-sc" class="gov-input" disabled></div>
        </div>

        <div class="pf-sec-title">1. 상단 389C 태그 & 배경 (348C)</div>
        <div class="gov-row">
          <div><label class="gov-label">배경 (348C)</label><input id="pf-bg" class="gov-input"></div>
          <div><label class="gov-label">태그 (389C)</label><input id="pf-tagc" class="gov-input"></div>
          <div><label class="gov-label">상단 라인(mm)</label><input id="pf-topline" type="number" step="0.1" class="gov-input"></div>
        </div>
        <div class="gov-row">
          <div><label class="gov-label">태그 상단폭(mm)</label><input id="pf-tagw" type="number" step="0.1" class="gov-input"></div>
          <div><label class="gov-label">태그 높이(mm)</label><input id="pf-tagh" type="number" step="0.1" class="gov-input"></div>
          <div><label class="gov-label">태그→제품명(mm)</label><input id="pf-gap-tn" type="number" step="0.5" class="gov-input"></div>
        </div>

        <div class="pf-sec-title">2. 제품명 (라인명 Bold + 제품명 Light)</div>
        <div class="gov-row">
          <div><label class="gov-label">라인명 (Bold)</label><input id="pf-lname" class="gov-input"></div>
          <div><label class="gov-label">제품명 (Light)</label><input id="pf-pname" class="gov-input"></div>
        </div>
        <div class="gov-row">
          <div><label class="gov-label">제품명 크기(pt)</label><input id="pf-npt" type="number" step="1" class="gov-input"></div>
          <div><label class="gov-label">줄 수</label>
            <select id="pf-nlines" class="gov-input"><option value="1">1줄 기입</option><option value="2">2줄 기입 (긴 제품명)</option></select>
          </div>
          <div><label class="gov-label">웨이트 조합</label>
            <select id="pf-nweight" class="gov-input"><option value="Bold-Light">Bold + Light (정규)</option><option value="Bold-Bold">Bold + Bold</option></select>
          </div>
        </div>

        <div class="pf-sec-title">3. 원재료명 / 원료명 및 함량(%)</div>
        <textarea id="pf-ing" rows="2" class="gov-input"></textarea>
        <div class="gov-row">
          <div><label class="gov-label">글자 크기(pt)</label><input id="pf-ipt" type="number" step="0.5" class="gov-input"></div>
          <div><label class="gov-label">웨이트</label>
            <select id="pf-iweight" class="gov-input"><option value="Light">Light</option><option value="Medium">Medium</option><option value="Bold">Bold</option></select>
          </div>
          <div><label class="gov-label">배치 위치</label>
            <select id="pf-ipos" class="gov-input"><option value="under">제품명 아래 (3mm)</option><option value="bottom">패키지 하단 (용량 위)</option></select>
          </div>
        </div>
        <div class="gov-row">
          <div><label class="gov-label">투명도(%)</label><input id="pf-iop" type="number" step="5" min="30" max="100" class="gov-input"></div>
          <div><label class="gov-label">하단 원료배경색</label><input id="pf-ibg" class="gov-input" placeholder="#00843D"></div>
          <label class="gov-check" style="margin:0;padding-top:18px"><input type="checkbox" id="pf-small-exc"> 소형면적 예외</label>
        </div>

        <div class="pf-sec-title">4. 내용량(용량) & 건강기능식품 마크</div>
        <input id="pf-cap" class="gov-input">
        <div class="gov-row">
          <div><label class="gov-label">용량(pt)</label><input id="pf-cpt" type="number" step="0.5" class="gov-input"></div>
          <div><label class="gov-label">장평(%)</label><input id="pf-cscale" type="number" step="1" class="gov-input"></div>
          <div><label class="gov-label">자간</label><input id="pf-ctrack" type="number" step="1" class="gov-input"></div>
          <div><label class="gov-label">하단여백(mm)</label><input id="pf-bmargin" type="number" step="0.5" class="gov-input"></div>
        </div>
        <div class="gov-row">
          <div><label class="gov-label">건기식 마크(mm)</label><input id="pf-mark" type="number" step="1" class="gov-input"></div>
          <label class="gov-check" style="margin:0;padding-top:18px"><input type="checkbox" id="pf-cprefix"> 「건강기능식품」 선행</label>
        </div>
        <label class="gov-label">전면 부가 카피 / 엠블럼 (오인·영양강조 스캔)</label>
        <input id="pf-claims" class="gov-input" placeholder="예: Blood Sugar Cut, High Fiber 고식이섬유">
      </div>

      <!-- 중앙 캔버스 프리뷰 -->
      <div class="card pf-preview-card">
        <div class="gov-cand-top">
          <div>
            <span class="gov-label" style="margin:0">실측 스케일 전면 시뮬레이터</span>
            <div class="gov-sub" id="pf-spec-sub"></div>
          </div>
          <div style="text-align:right">
            <div class="gov-score" id="pf-score">100</div>
            <span class="gov-sub">거버넌스 점수</span>
          </div>
        </div>
        <div id="pf-canvas" class="pf-canvas-wrap"></div>
        <div class="pf-legend">
          <span><i style="background:#00843D"></i>배경 PANTONE 348C</span>
          <span><i style="background:#CEDC00"></i>태그 PANTONE 389C</span>
          <span><i style="background:#E52421"></i>빨간색 = 가이드 치수·타이포 지시선</span>
        </div>
      </div>

      <!-- 우측 검수 결과 -->
      <div class="card pf-audit-card">
        <div class="gov-cand-top">
          <h2 class="gov-h2" style="margin:0">실시간 규정 검수</h2>
          <div class="gov-pills" id="pf-filter">
            <button class="pf-pill active" data-f="all">전체</button>
            <button class="pf-pill" data-f="legal">법정필수</button>
            <button class="pf-pill" data-f="brand">브랜드가이드</button>
          </div>
        </div>
        <div id="pf-summary" class="pf-summary-bar"></div>
        <ul class="gov-checks pf-checks" id="pf-checks"></ul>
      </div>
    </div>

    <div class="section-divider"></div>

    <!-- 학습된 가이드 룰 매트릭스 & 법정 체크리스트 -->
    <div class="pf-bottom-grid">
      <div class="card" style="padding:24px">
        <div class="gov-eyebrow">Learned Design & Legal Rules</div>
        <h2 class="gov-h2">메타그린 전면 디자인 가이드 × 식약처 표시기준 총괄표</h2>
        <div class="gov-table-wrap">
          <table class="glossary-table gov-table">
            <thead>
              <tr><th>구분</th><th>건강기능식품 (슬림업·부스터샷·더블컷·크레아틴)</th><th>일반식품 (애사비·클린티·효소·브이레디)</th><th>근거</th></tr>
            </thead>
            <tbody>
              <tr><td><b>배경 / 상단 태그</b></td><td colspan="2">배경 <b>PANTONE 348C</b> (#00843D) · 상단 <b>PANTONE 389C</b> (#CEDC00) 사다리꼴 태그 내 VITALBEAUTIE 블랙 로고</td><td>브랜드 필수</td></tr>
              <tr><td><b>상단 라인 두께</b></td><td colspan="2">표준 패키지 <b>1.5mm</b> / 소형 패키지(메타그린 슬림업·브이케어·브이레디, 폭 &lt; 60mm) <b>1.2mm</b></td><td>브랜드 필수</td></tr>
              <tr><td><b>태그 → 제품명 간격</b></td><td colspan="2">표준 패키지 <b>5mm</b> / 소형 패키지 <b>3~4mm</b></td><td>브랜드 필수</td></tr>
              <tr><td><b>전면 제품명</b></td><td colspan="2">라인명 <b>Rix신고딕SE_Pro Bold</b> + 제품명 <b>Light</b> 동일 크기(표준 26~28pt / 소형 18pt) · 장평 100% · 길 경우 <b>2줄 기입</b></td><td>법정+브랜드</td></tr>
              <tr><td><b>원재료명 / 원료명</b></td><td>제품명 <b>바로 아래 3mm</b> · Light · <b>제품명의 1/2 크기</b> (18→9pt, 26→13pt, 28→14pt) · 불투명 100%</td><td>제품명 밑이 아닌 <b>패키지 하단(용량 위)</b> · Medium · <b>함량(%)과 함께 반드시 14pt · 투명도 70%</b><br><small>※ 예외: 면적이 작을 경우 10pt(효소)~12pt(브이레디), 문안 미식별 시 투명도 없이(100%)</small></td><td>법정+브랜드</td></tr>
              <tr><td><b>전면 내용량(용량)</b></td><td>「건강기능식품」 문구 + 중량/정·포수 · <b>10pt / 장평 90% / 자간 -5</b> · 하단 3mm</td><td>식품유형(선택)+내용량+<b>열량(kcal)</b> · <b>10pt / 장평 90% / 자간 -5</b> · 하단 3mm</td><td>법정+브랜드</td></tr>
              <tr><td><b>건강기능식품 마크</b></td><td>주표시면 우측 하단 <b>15×15mm</b> 필수 (공식 원본 도안 · 2028.1.1 개정 도안 시행 예정)</td><td><b>표시 금지</b> (GMP 도안 및 기능성 문구 오인 표기 금지)</td><td>법정 필수</td></tr>
              <tr><td><b>타이포 법정 하한</b></td><td colspan="2">원칙 <b>10pt 이상 · 장평 90% 이상 · 자간 -5% 이상</b> (Illustrator 설정 예시: 10pt / Scale 100% / Tracking 0 / Leading 13pt). 정보표시면 100㎠ 미만 시 장평 50% 예외, 고시 요건 미충족 시 임의 6~7pt 축소 불가</td><td>식약처 고시</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="padding:24px">
        <div class="gov-cand-top">
          <div>
            <div class="gov-eyebrow">Full Package Verification</div>
            <h2 class="gov-h2" style="margin:0" id="pf-cl-title">패키지 전체 필수 표시사항 검수 체크리스트</h2>
          </div>
          <span class="tag tag-gold" id="pf-cl-prog">0 / 18 확인</span>
        </div>
        <div id="pf-cl-list" class="pf-cl-grid"></div>
        <details style="margin-top:14px">
          <summary style="cursor:pointer;font-size:12px;font-weight:600">알레르기 표시 대상 22종 원료 및 실무 그래픽 기준 보기</summary>
          <p class="gov-sub" style="margin:8px 0;line-height:1.6">
            <b>22종 대상 원료:</b> ${ALLERGENS_22.join(', ')} (아황산류는 최종제품 SO₂ 10mg/kg 이상 시 표시).<br>
            <b>실무 그래픽 원칙:</b> ① 함유 물질은 원재료명 근처 고대비 표시(작은 회색 글씨 지양) ② 제조설비 혼입 우려 문구 별도 구분 ③ 「질병의 예방 및 치료를 위한 의약품이 아닙니다」 문구는 바닥면과 평행 배치(세로·원형 회전 지양) ④ 법정 정보 영역에는 그라데이션·금/은박·홀로그램 지양, 투명 라벨은 불투명 백판 확보.
          </p>
        </details>
      </div>
    </div>`;

  const $ = id => el.querySelector('#' + id);

  const syncInputs = () => {
    $('pf-type').value = state.type;
    $('pf-w').value = state.w;
    $('pf-h').value = state.h;
    $('pf-bg').value = state.bg;
    $('pf-tagc').value = state.tagColor;
    $('pf-topline').value = state.topLine;
    $('pf-tagw').value = state.tagW;
    $('pf-tagh').value = state.tagH;
    $('pf-gap-tn').value = state.gapTagName;
    $('pf-lname').value = state.lineName;
    $('pf-pname').value = state.productName;
    $('pf-npt').value = state.namePt;
    $('pf-nlines').value = String(state.nameLines);
    $('pf-nweight').value = `${state.lineWeight}-${state.productWeight}`;
    $('pf-ing').value = state.ingredient;
    $('pf-ipt').value = state.ingPt;
    $('pf-iweight').value = state.ingWeight;
    $('pf-ipos').value = state.ingPos;
    $('pf-iop').value = state.ingOpacity;
    $('pf-ibg').value = state.ingBg || state.bg;
    $('pf-small-exc').checked = Boolean(state.smallException);
    $('pf-cap').value = state.capacity;
    $('pf-cpt').value = state.capPt;
    $('pf-cscale').value = state.capScale;
    $('pf-ctrack').value = state.capTracking;
    $('pf-bmargin').value = state.bottomMargin;
    $('pf-mark').value = state.markMm;
    $('pf-cprefix').checked = Boolean(state.capPrefix);
    $('pf-claims').value = state.claims || '';
  };

  const readInputs = () => {
    const [lw, pw] = $('pf-nweight').value.split('-');
    state = {
      ...state,
      type: $('pf-type').value,
      w: +$('pf-w').value || 50,
      h: +$('pf-h').value || 80,
      bg: $('pf-bg').value.trim().toUpperCase(),
      tagColor: $('pf-tagc').value.trim().toUpperCase(),
      topLine: +$('pf-topline').value,
      tagW: +$('pf-tagw').value,
      tagH: +$('pf-tagh').value,
      gapTagName: +$('pf-gap-tn').value,
      lineName: $('pf-lname').value,
      productName: $('pf-pname').value,
      namePt: +$('pf-npt').value,
      nameLines: +$('pf-nlines').value,
      lineWeight: lw,
      productWeight: pw,
      ingredient: $('pf-ing').value,
      ingPt: +$('pf-ipt').value,
      ingWeight: $('pf-iweight').value,
      ingPos: $('pf-ipos').value,
      ingOpacity: +$('pf-iop').value,
      ingBg: $('pf-ibg').value.trim().toUpperCase() || state.bg,
      smallException: $('pf-small-exc').checked,
      capacity: $('pf-cap').value,
      capPt: +$('pf-cpt').value,
      capScale: +$('pf-cscale').value,
      capTracking: +$('pf-ctrack').value,
      bottomMargin: +$('pf-bmargin').value,
      markMm: +$('pf-mark').value,
      capPrefix: $('pf-cprefix').checked,
      claims: $('pf-claims').value,
    };
  };

  const renderChecklist = () => {
    const list = state.type === 'hff' ? CHECKLIST_HFF : CHECKLIST_FOOD;
    $('pf-cl-title').textContent = state.type === 'hff'
      ? `건강기능식품 패키지 필수 표시사항 검수 (${list.length}항목)`
      : `일반식품 패키지 필수 표시사항 검수 (${list.length}항목)`;
    $('pf-cl-list').innerHTML = list.map(([title, pos], idx) => `
      <label class="pf-cl-item"><input type="checkbox" data-cl="${idx}" ${idx < 4 ? 'checked' : ''}>
        <span><b>${title}</b><small>${pos}</small></span>
      </label>`).join('');
    const updateProg = () => {
      const done = el.querySelectorAll('#pf-cl-list input:checked').length;
      $('pf-cl-prog').textContent = `${done} / ${list.length} 확인`;
    };
    el.querySelectorAll('#pf-cl-list input').forEach(c => (c.onchange = updateProg));
    updateProg();
  };

  const run = () => {
    const res = checkPackageFront(state);
    $('pf-sc').value = `${res.sc.label} (${res.areaCm2}㎠)`;
    $('pf-spec-sub').textContent = `${state.w}×${state.h}mm · 주표시면 ${res.areaCm2}㎠ · ${res.sc.label} · ${state.type === 'hff' ? '건강기능식품' : '일반식품'}`;
    $('pf-score').textContent = res.score;
    $('pf-canvas').innerHTML = renderPackageFrontSvg(state, showGuides);

    const passCnt = res.checks.filter(c => c.status === 'pass').length;
    const warnCnt = res.checks.filter(c => c.status === 'warn').length;
    const failCnt = res.checks.filter(c => c.status === 'fail').length;
    $('pf-summary').innerHTML = `
      <span class="tag tag-green">PASS ${passCnt}</span>
      <span class="tag tag-gold">WARN ${warnCnt}</span>
      <span class="tag tag-error">FAIL ${failCnt}</span>`;

    const shown = res.checks.filter(c => filterCat === 'all' || c.cat === filterCat);
    $('pf-checks').innerHTML = shown.map(i => `
      <li>
        ${badge(i.status)}
        <div>
          <div class="gov-check-rule"><small class="pf-lvl">[${i.level}]</small> ${i.rule}</div>
          <div class="gov-check-detail">${i.detail || ''}</div>
        </div>
      </li>`).join('');
  };

  el.querySelectorAll('#pf-presets button').forEach(btn => {
    btn.onclick = () => {
      el.querySelectorAll('#pf-presets button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const prevType = state.type;
      state = { ...PRESETS.find(p => p.id === btn.dataset.id) };
      syncInputs();
      if (prevType !== state.type) renderChecklist();
      run();
    };
  });

  $('pf-autofix').onclick = () => {
    readInputs();
    state = autoSpecPackageFront(state);
    syncInputs();
    renderChecklist();
    run();
  };

  $('pf-toggle-guide').onclick = e => {
    showGuides = !showGuides;
    e.currentTarget.textContent = `빨간 가이드선 ${showGuides ? 'ON' : 'OFF'}`;
    run();
  };

  el.querySelectorAll('#pf-filter button').forEach(btn => {
    btn.onclick = () => {
      el.querySelectorAll('#pf-filter button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCat = btn.dataset.f;
      run();
    };
  });

  el.querySelectorAll('.pf-form input, .pf-form select, .pf-form textarea').forEach(inp => {
    inp.oninput = () => {
      const prevType = state.type;
      readInputs();
      if (prevType !== state.type) renderChecklist();
      run();
    };
  });

  syncInputs();
  renderChecklist();
  run();
}

