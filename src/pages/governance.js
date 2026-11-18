/* ═══════════════════════════════════════
   Governance Studio Pages (BI / PI)
   ═══════════════════════════════════════ */
import { IDENTITY, DNA_KEYWORDS, PACKAGE_LINES, REGULATIONS, LOCALE_TYPO, SAMPLE_COPY } from '../data/governance.js';
import { MG_LINE, SIZE_CLASS, TYPO, HFF_MARK, RULE_CATALOG, PRESETS } from '../data/packageFront.js';
import { REPRESENTATIVE_COLOR_CHIPS } from '../data/pantoneCoated.js';
import {
  suggestLogo, generateDnaIcon, generateCustomDnaIcon, buildIllustratorAiBlob, buildPdfBlob, ensureAiFontsLoaded, getPictogramLibrary,
  checkDna, suggestChips, suggestFamilyLook, checkChip, checkSpecScale, checkRegulation, autoLayout,
  parseKoreanPackageFile, translateKoPackageText, renderLocalizedPackageSvg,
  resolvePantoneInput, autoSpecPackageFront, checkPackageFront, renderPackageFrontSvg,
  autoSpecInnerBeautyFront, renderInnerBeautyFrontSvg,
  FAMILY_KO_MAP,
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
  let logic = 'metagreen';
  let showGuidesMeta = true;
  let showGuidesIb = true;
  let lastSizeClass = 'standard';
  let currentSpec = null;

  const DEFAULTS = {
    metagreen: {
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
    },
    innerbeauty: {
      hff: {
        w: 75,
        h: 132.5,
        pantone: '230C',
        namePt: 27,
        lineName: '슈퍼콜라겐',
        productName: '케라핏',
        benefit: 'SHINE & YOUTHFUL',
        points: '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
        footnote: '*1일 1포 기준',
        ingredient: '피쉬콜라겐펩타이드, 비타민C, 비오틴',
        capacity: '51 g [1.7 g X 30포]',
        smallException: false,
      },
      food: {
        w: 75,
        h: 132.5,
        pantone: '230C',
        namePt: 27,
        lineName: '슈퍼콜라겐',
        productName: '케라핏',
        benefit: 'SHINE & YOUTHFUL',
        points: '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
        footnote: '*1일 1포 기준',
        ingredient: '[저분자 콜라겐 TYPE 1, 3, 5 +\n비타민 B, C 컴플렉스] 67.648%',
        capacity: '일반식품 51 g [1.7 g X 30포] (190 kcal)',
        smallException: false,
      },
    },
    newcommerce: {
      hff: {
        w: 80,
        h: 161,
        pantone: '348C',
        namePt: 26,
        lineName: '바이탈뷰티',
        productName: '뉴커머스',
        ingredient: '복합 기능성 원료',
        capacity: '200 g [20 g X 10포]',
        smallException: false,
      },
      food: {
        w: 80,
        h: 161,
        pantone: '348C',
        namePt: 26,
        lineName: '바이탈뷰티',
        productName: '뉴커머스',
        ingredient: '복합 원료 함량 표기',
        capacity: '200 g [20 g × 10포 / 140 kcal]',
        smallException: false,
      },
    },
  };

  const IB_PRESETS = {
    kerafit: {
      w: 75,
      h: 132.5,
      pantone: '230C',
      namePt: 27,
      lineName: '슈퍼콜라겐',
      productName: '케라핏',
      benefit: 'SHINE & YOUTHFUL',
      points: '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
      footnote: '*1일 1포 기준',
      ingredient: '[저분자 콜라겐 TYPE 1, 3, 5 +\n비타민 B, C 컴플렉스] 67.648%',
      capacity: '일반식품 51 g [1.7 g X 30포] (190 kcal)',
    },
    retinol: {
      w: 75,
      h: 132.5,
      pantone: '3945C',
      namePt: 27,
      lineName: '슈퍼레티놀',
      productName: '',
      benefit: 'BRIGHT & GLOW',
      points: '비타민C 1,000mg*\n고함량** 저자극\n피부과 전문의 공동개발',
      footnote: '*1일 2포 기준  **자사몰 판매 제품 중',
      ingredient: '[레티놀(비타민A)+비타민C] 7.5%',
      capacity: '75 g [2.5 g X 30포] (285 kcal)',
    },
    cica: {
      w: 75,
      h: 132.5,
      pantone: '353C',
      namePt: 27,
      lineName: '슈퍼시카',
      productName: 'B5',
      benefit: 'CALM & CLEAR',
      points: '속민감+속진정, 고함량* 판토텐산\n밀크세라마이드 1,000mg**\n녹차 유래 유산균 함유',
      footnote: '*자사몰 판매 제품 중\n**1일 2포 기준',
      ingredient: '[병풀추출분말+판토텐산(비타민B5)+밀크세라마이드\n+글루콘산아연] 38.88%',
      capacity: '54 g [1.8 g X 30포] (190 kcal)',
    },
    ampoule: {
      w: 200.5,
      h: 121.5,
      pantone: '230C',
      namePt: 35,
      lineName: '슈퍼콜라겐',
      productName: '',
      benefit: 'DEWY & LIFTED',
      points: '저분자 콜라겐 3,500mg, 5가지 유형 콜라겐\n9.4배 흡수율*, 전신 초밀착, 흡수 빠른 액상형',
      footnote: '*자사 기존 제품 대비',
      ingredient: '[저분자 피쉬콜라겐 펩타이드+식물성 콜라겐] 15.1%',
      capacity: '700 mL [25 mL X 28앰플] (700 kcal)',
    },
    pdrn: {
      w: 100,
      h: 126.5,
      pantone: '2345C',
      namePt: 29,
      lineName: '슈퍼콜라겐',
      productName: 'PDRN',
      benefit: 'FIRM & RENEWED',
      points: '저분자 콜라겐, 고순도* 연어 PDRN\n히알루론산 · 엘라스틴 · 세라마이드 · 비타민C\n흡수 빠른 미세입자 액상 제형',
      footnote: '*원료적 특성에 한함',
      ingredient: '[저분자콜라겐+연어이리추출물(PDRN 함유)] 18.88%',
      capacity: '350 mL [25 mL X 14입] (350 kcal)',
    },
  };

  el.innerHTML = `
    <div style="margin-bottom:22px;">
      <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:860px;">
        폭과 높이를 mm로 입력하면 선택한 라인 로직에 맞춰 단상자 전면을 실시간으로 시뮬레이션합니다. Icon Generator는 키워드에 맞는 글로벌 공용 픽토그램을 바이탈뷰티 스타일로 다시 그립니다.
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
        <!-- 좌측 입력 패널 (화살표로 접기/펼치기 가능한 5단계 아코디언) -->
        <div class="card gov-panel">
          <!-- 1. 라인 구분 -->
          <div class="pf-acc-sec">
            <button type="button" class="pf-acc-head">
              <span>1. 라인 구분</span>
              <span class="pf-acc-arrow">▾</span>
            </button>
            <div class="pf-acc-body">
              <div class="lf-inline-tabs" id="lf-logic-tabs" role="tablist">
                <button type="button" class="lf-inline-tab active" data-logic="metagreen">메타그린</button>
                <button type="button" class="lf-inline-tab" data-logic="innerbeauty">이너뷰티</button>
                <button type="button" class="lf-inline-tab" data-logic="newcommerce">뉴커머스</button>
              </div>
              <!-- 이너뷰티 전용 프리셋 선택 바 -->
              <div id="lf-ib-presets" style="display:none; margin-top:10px;">
                <div style="display:flex; flex-wrap:wrap; gap:5px;">
                  <button type="button" class="btn btn-outline btn-sm lf-ib-preset-btn" data-ib-preset="kerafit" style="font-size:11px; padding:4px 8px;">슈퍼콜라겐 케라핏</button>
                  <button type="button" class="btn btn-outline btn-sm lf-ib-preset-btn" data-ib-preset="retinol" style="font-size:11px; padding:4px 8px;">슈퍼레티놀</button>
                  <button type="button" class="btn btn-outline btn-sm lf-ib-preset-btn" data-ib-preset="cica" style="font-size:11px; padding:4px 8px;">슈퍼시카 B5</button>
                  <button type="button" class="btn btn-outline btn-sm lf-ib-preset-btn" data-ib-preset="ampoule" style="font-size:11px; padding:4px 8px;">슈퍼콜라겐 앰플</button>
                  <button type="button" class="btn btn-outline btn-sm lf-ib-preset-btn" data-ib-preset="pdrn" style="font-size:11px; padding:4px 8px;">슈퍼콜라겐 PDRN</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 제품 구분 -->
          <div class="pf-acc-sec">
            <button type="button" class="pf-acc-head">
              <span>2. 제품 구분</span>
              <span class="pf-acc-arrow">▾</span>
            </button>
            <div class="pf-acc-body">
              <div class="lf-inline-tabs" id="lf-tabs" role="tablist">
                <button type="button" class="lf-inline-tab active" data-type="hff">건강기능식품</button>
                <button type="button" class="lf-inline-tab" data-type="food">일반식품</button>
              </div>
            </div>
          </div>

          <!-- 3. 단상자 전면 규격 & 컬러 -->
          <div class="pf-acc-sec">
            <button type="button" class="pf-acc-head">
              <span>3. 단상자 전면 규격 &amp; 컬러</span>
              <span class="pf-acc-arrow">▾</span>
            </button>
            <div class="pf-acc-body">
              <div class="gov-row">
                <div>
                  <label class="gov-label">폭 Width (mm)</label>
                  <input id="lf-w" type="number" step="0.5" min="35" max="240" class="gov-input" value="80">
                </div>
                <div>
                  <label class="gov-label">높이 Height (mm)</label>
                  <input id="lf-h" type="number" step="0.5" min="55" max="260" class="gov-input" value="161">
                </div>
              </div>

              <label class="gov-label" id="lf-pantone-label" style="margin-top:10px">배경 팬톤 넘버 직접 입력 (PANTONE Solid Coated)</label>
              <div style="display:flex; align-items:stretch; gap:8px;">
                <div id="lf-pantone-chip" style="width:38px; height:38px; flex-shrink:0; background:#00843D; border:1px solid rgba(0,0,0,0.14);" title="팬톤 컬러칩 프리뷰"></div>
                <input id="lf-pantone" class="gov-input" value="348C" placeholder="예: 348C, 230C, 3945C, 353C, 2345C..." style="font-weight:700; flex:1; height:38px;">
              </div>
            </div>
          </div>

          <!-- 4. POP 규격 & 컬러 -->
          <div class="pf-acc-sec">
            <button type="button" class="pf-acc-head">
              <span>4. POP 규격 &amp; 컬러</span>
              <span class="pf-acc-arrow">▾</span>
            </button>
            <div class="pf-acc-body">
              <label class="gov-check" style="margin:2px 0 6px; font-weight:600; color:#101820;">
                <input type="checkbox" id="lf-pop-enable">
                단상자 전면 위 POP 있는 경우 표기 (체크 시 상단 POP 생성)
              </label>

              <div id="lf-pop-fields" style="display:none; margin-top:8px; padding-top:8px; border-top:1px dashed var(--border-light);">
                <div class="gov-row">
                  <div>
                    <label class="gov-label">POP 폭 (단상자 전면 고정)</label>
                    <input id="lf-pop-w" type="number" class="gov-input" value="80" disabled style="background:#f4f5f7; color:#6c727f;">
                  </div>
                  <div>
                    <label class="gov-label">POP 높이 Height (mm)</label>
                    <input id="lf-pop-h" type="number" step="0.5" min="10" max="150" class="gov-input" value="35">
                  </div>
                </div>

                <label class="gov-label" style="margin-top:10px">POP 배경 컬러 (Pantone 또는 #HEX)</label>
                <div style="display:flex; align-items:stretch; gap:8px;">
                  <div id="lf-pop-bg-chip" style="width:38px; height:38px; flex-shrink:0; background:#CEDC00; border:1px solid rgba(0,0,0,0.14);"></div>
                  <input id="lf-pop-bg" class="gov-input" value="389C" placeholder="예: 389C, white, black, 화이트, 블랙, #CEDC00" style="font-weight:700; flex:1; height:38px;">
                </div>

                <!-- POP 윗줄 설정 -->
                <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-light);">
                  <label class="gov-label" style="font-weight:700; color:#101820;">POP 윗줄 문안 (줄당 최대 8자 권장)</label>
                  <input id="lf-pop-l1-text" class="gov-input" value="올리브영 1위 기념" placeholder="윗줄 문안 입력">
                  <div id="lf-pop-l1-warn" style="display:none; color:#E52421; font-size:11.5px; font-weight:600; margin-top:4px;"></div>
                  <div class="gov-row" style="margin-top:6px;">
                    <div>
                      <label class="gov-label">윗줄 폰트</label>
                      <select id="lf-pop-l1-font" class="gov-select">
                        <option value="omni" selected>옴니고딕체</option>
                        <option value="shingo">신고딕체</option>
                      </select>
                    </div>
                    <div>
                      <label class="gov-label">윗줄 굵기</label>
                      <select id="lf-pop-l1-weight" class="gov-select">
                        <option value="800" selected>Heavy (050)</option>
                        <option value="700">Bold (040)</option>
                        <option value="500">Medium (030)</option>
                        <option value="300">Light (020)</option>
                        <option value="100">Thin (010)</option>
                      </select>
                    </div>
                  </div>
                  <label class="gov-label" style="margin-top:6px;">윗줄 크기 (pt) &amp; 컬러</label>
                  <div style="display:flex; gap:8px; align-items:center;">
                    <input id="lf-pop-l1-pt-range" class="vb-range" type="range" min="6" max="60" step="0.5" value="14" style="flex:1">
                    <input id="lf-pop-l1-pt" type="number" min="6" max="60" step="0.5" class="gov-input" value="14" style="width:68px; text-align:center; font-weight:700;">
                  </div>
                  <div style="display:flex; align-items:stretch; gap:8px; margin-top:6px;">
                    <div id="lf-pop-l1-color-chip" style="width:34px; height:34px; flex-shrink:0; background:#1D1D1B; border:1px solid rgba(0,0,0,0.22);"></div>
                    <input id="lf-pop-l1-color" class="gov-input" value="블랙" placeholder="예: white, black, 화이트, 블랙, 348C, #1D1D1B" style="font-weight:700; flex:1; height:34px;">
                  </div>
                </div>

                <!-- POP 아랫줄 설정 -->
                <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-light);">
                  <label class="gov-label" style="font-weight:700; color:#101820;">POP 아랫줄 문안 (줄당 최대 8자 권장)</label>
                  <input id="lf-pop-l2-text" class="gov-input" value="+ 5일분 추가 증정" placeholder="아랫줄 문안 입력">
                  <div id="lf-pop-l2-warn" style="display:none; color:#E52421; font-size:11.5px; font-weight:600; margin-top:4px;"></div>
                  <div class="gov-row" style="margin-top:6px;">
                    <div>
                      <label class="gov-label">아랫줄 폰트</label>
                      <select id="lf-pop-l2-font" class="gov-select">
                        <option value="omni" selected>옴니고딕체</option>
                        <option value="shingo">신고딕체</option>
                      </select>
                    </div>
                    <div>
                      <label class="gov-label">아랫줄 굵기</label>
                      <select id="lf-pop-l2-weight" class="gov-select">
                        <option value="800" selected>Heavy (050)</option>
                        <option value="700">Bold (040)</option>
                        <option value="500">Medium (030)</option>
                        <option value="300">Light (020)</option>
                        <option value="100">Thin (010)</option>
                      </select>
                    </div>
                  </div>
                  <label class="gov-label" style="margin-top:6px;">아랫줄 크기 (pt) &amp; 컬러</label>
                  <div style="display:flex; gap:8px; align-items:center;">
                    <input id="lf-pop-l2-pt-range" class="vb-range" type="range" min="6" max="60" step="0.5" value="18" style="flex:1">
                    <input id="lf-pop-l2-pt" type="number" min="6" max="60" step="0.5" class="gov-input" value="18" style="width:68px; text-align:center; font-weight:700;">
                  </div>
                  <div style="display:flex; align-items:stretch; gap:8px; margin-top:6px;">
                    <div id="lf-pop-l2-color-chip" style="width:34px; height:34px; flex-shrink:0; background:#00843D; border:1px solid rgba(0,0,0,0.22);"></div>
                    <input id="lf-pop-l2-color" class="gov-input" value="348C" placeholder="예: white, black, 화이트, 블랙, 348C, #E52421" style="font-weight:700; flex:1; height:34px;">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. 전면 표기 문안 -->
          <div class="pf-acc-sec">
            <button type="button" class="pf-acc-head">
              <span>5. 전면 표기 문안</span>
              <span class="pf-acc-arrow">▾</span>
            </button>
            <div class="pf-acc-body">
              <div class="gov-row">
                <div>
                  <label class="gov-label" id="lf-lname-label">라인명 (Bold체 적용)</label>
                  <input id="lf-lname" class="gov-input" value="메타그린" placeholder="예: 메타그린 / 슈퍼콜라겐" style="font-weight:700">
                </div>
                <div>
                  <label class="gov-label" id="lf-pname-label">제품명 (Light체 적용)</label>
                  <input id="lf-pname" class="gov-input" value="젤리 더블컷" placeholder="예: 젤리 더블컷 / 케라핏" style="font-weight:300">
                </div>
              </div>

              <label class="gov-label" style="margin-top:10px">제품명 크기 직접 조절 (pt)</label>
              <div style="display:flex;gap:10px;align-items:center">
                <input id="lf-name-pt-range" class="vb-range" type="range" min="10" max="80" step="0.5" value="26" style="flex:1">
                <input id="lf-name-pt" type="number" min="8" max="80" step="0.5" class="gov-input" value="26" style="width:84px;text-align:center;font-weight:700">
              </div>

              <!-- 이너뷰티 전용 입력 필드 -->
              <div id="lf-ib-fields" style="display:none;">
                <label class="gov-label" style="margin-top:10px">영문 베네핏 문안</label>
                <input id="lf-ib-benefit" class="gov-input" value="SHINE & YOUTHFUL" placeholder="예: SHINE & YOUTHFUL, BRIGHT & GLOW" style="text-transform:uppercase;">

                <label class="gov-label" style="margin-top:10px">강조 포인트 (줄바꿈으로 행 구분 · 같은 행 분리는 쉼표(,) 입력)</label>
                <textarea id="lf-ib-points" rows="3" class="gov-input" placeholder="예: 3 TYPES 저분자 콜라겐 1,000mg*&#10;헤드투토, 트리플 뷰티 부스트&#10;매일 생기+윤기+광채 완성"></textarea>

                <label class="gov-label" style="margin-top:10px">기준치 문안</label>
                <input id="lf-ib-footnote" class="gov-input" value="*1일 1포 기준" placeholder="예: *1일 1포 기준">
              </div>

              <div id="lf-bottom-fields-container">
                <div id="lf-ing-block">
                  <label class="gov-label" id="lf-ing-label" style="margin-top:10px">원재료명 (제품명의 1/2 크기: 13pt 자동 적용 · 가로 폭 초과 시 자동 줄바꿈)</label>
                  <textarea id="lf-ing" rows="2" class="gov-input" placeholder="예: 녹차추출물, 바나바잎추출물, 판토텐산"></textarea>

                  <div id="lf-food-opts" style="display:none">
                    <label class="gov-check" style="margin:6px 0 2px">
                      <input type="checkbox" id="lf-small-exc">
                      패키지 면적 협소 예외 적용 (표준 10pt / 소형 12pt 허용)
                    </label>
                  </div>
                </div>

                <div id="lf-cap-block">
                  <label class="gov-label" id="lf-cap-label" style="margin-top:10px">용량 / 내용량 (가운데 정렬 · 10pt · 장평 90% · 자간 -5 · 하단 3mm)</label>
                  <input id="lf-cap" class="gov-input" placeholder="예: 200 g [20 g X 10포]">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측 실시간 시뮬레이션 캔버스 (순백색 바탕 위 직관적 뷰어 + 가이드 ON/OFF & .AI 다운로드) -->
        <div class="card pf-preview-card" style="padding:0; border:none; background:#ffffff; box-shadow:none;">
          <div class="pf-sim-header" style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px; background:#ffffff; border-bottom:1px solid var(--border-light);">
            <span style="font-size:12px; font-weight:600; color:#101820; display:inline-flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#007A33;"></span>
              단상자 전면 실시간 시뮬레이션
            </span>
            <div style="display:flex; align-items:center; gap:8px;">
              <button type="button" id="lf-guide-btn-meta" class="btn btn-outline btn-sm">메타그린 빨간 가이드 치수선 ON</button>
              <button type="button" id="lf-guide-btn-ib" class="btn btn-outline btn-sm" style="display:none;">이너뷰티 빨간 가이드 치수선 ON</button>
              <button type="button" id="lf-dl-pdf" class="btn btn-outline btn-sm">.PDF 다운로드</button>
              <button type="button" id="lf-dl-ai" class="btn btn-primary btn-sm">.AI 다운로드</button>
            </div>
          </div>
          <div id="lf-canvas" class="pf-canvas-wrap" style="background:#ffffff; border:none; box-shadow:none;"></div>
        </div>
      </div>
    </div>

    <!-- [TAB 2] ICON GENERATOR -->
    <div id="bv-pane-icon" style="display:${activeSubTab === 'icon' ? 'block' : 'none'};">
      <div class="ig-layout">
        <!-- 좌측: 키워드 입력 & 원형 배지 문안 직접 입력 -->
        <div class="ig-left-col">
          <label class="ig-col-title" for="ig-kw-input">성분·기능 키워드</label>
          <input id="ig-kw-input" class="ig-kw-input" value="수면, 디톡스" placeholder="예: 수면, 디톡스, 혈당, 콜라겐...">
          <p class="ig-help-text">
            쉼표로 여러 개를 넣습니다. 키워드마다 공용 픽토그램을 심플부터 컴플렉스까지 제안합니다.
          </p>

          <label class="ig-col-title" for="ig-arc-input" style="margin-top:18px;">원형배지 상단 영문 문안</label>
          <input id="ig-arc-input" class="ig-kw-input" value="GOOD SLEEP" placeholder="예: GOOD SLEEP, METABOLIC CUT, VITAL GLOW">
          
          <label class="ig-col-title" for="ig-ko-input" style="margin-top:14px;">원형배지 하단 국문 문안</label>
          <input id="ig-ko-input" class="ig-kw-input" value="수면" placeholder="예: 수면, 체지방감소, 탄력보습">
          <p class="ig-help-text" style="margin-top:6px;">
            원형 배지에 들어갈 영문/국문 문안을 직접 입력하여 실시간으로 확인합니다.
          </p>
        </div>

        <!-- 중앙: 생성 배지 리스트 -->
        <div class="ig-center-col">
          <div class="ig-center-head">
            <span class="ig-col-title" style="margin:0;">생성 배지</span>
            <div style="display:flex; gap:6px;">
              <button type="button" id="ig-dl-all-pdf" class="ig-btn-outline">↓ 전체 .pdf</button>
              <button type="button" id="ig-dl-all-ai" class="ig-btn-outline">↓ 전체 .ai</button>
            </div>
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

  // 좌측 아코디언 섹션 화살표 접기/펼치기 이벤트
  el.querySelectorAll('.pf-acc-head').forEach(headBtn => {
    headBtn.addEventListener('click', () => {
      const sec = headBtn.closest('.pf-acc-sec');
      if (sec) sec.classList.toggle('collapsed');
    });
  });

  // ── [1] LAYOUT PROPOSAL 로직 ──
  const applyDefaults = (newType = type, newLogic = logic) => {
    type = newType;
    logic = newLogic;
    el.querySelectorAll('#lf-tabs .lf-inline-tab').forEach(b => b.classList.toggle('active', b.dataset.type === type));
    el.querySelectorAll('#lf-logic-tabs .lf-inline-tab').forEach(b => b.classList.toggle('active', b.dataset.logic === logic));

    const logicGroup = DEFAULTS[logic] || DEFAULTS.metagreen;
    const d = logicGroup[type] || logicGroup.hff;

    $('lf-w').value = d.w;
    $('lf-h').value = d.h;
    $('lf-pop-w').value = d.w;
    $('lf-pantone').value = d.pantone;
    $('lf-name-pt').value = d.namePt;
    $('lf-name-pt-range').value = d.namePt;
    $('lf-lname').value = d.lineName;
    $('lf-pname').value = d.productName;
    $('lf-ing').value = d.ingredient;
    $('lf-cap').value = d.capacity;
    $('lf-small-exc').checked = Boolean(d.smallException);

    const isIb = logic === 'innerbeauty';
    if (isIb) {
      $('lf-ib-benefit').value = d.benefit || 'SHINE & YOUTHFUL';
      $('lf-ib-points').value = d.points || '';
      $('lf-ib-footnote').value = d.footnote || '';
    }

    $('lf-ib-presets').style.display = isIb ? 'block' : 'none';
    $('lf-ib-fields').style.display = isIb ? 'block' : 'none';
    $('lf-guide-btn-meta').style.display = logic === 'metagreen' ? 'inline-flex' : 'none';
    $('lf-guide-btn-ib').style.display = logic === 'innerbeauty' ? 'inline-flex' : 'none';
    $('lf-food-opts').style.display = (!isIb && type === 'food') ? 'block' : 'none';

    // 일반식품일 때는 내용량과 원재료명 기입 위치를 바꿔서 표시
    const bottomContainer = $('lf-bottom-fields-container');
    const ingBlock = $('lf-ing-block');
    const capBlock = $('lf-cap-block');
    if (bottomContainer && ingBlock && capBlock) {
      if (isIb && type === 'food') {
        bottomContainer.appendChild(capBlock);
        bottomContainer.appendChild(ingBlock);
      } else {
        bottomContainer.appendChild(ingBlock);
        bottomContainer.appendChild(capBlock);
      }
    }

    if (isIb) {
      $('lf-pantone-label').textContent = '포인트 팬톤 넘버 입력 (PANTONE Solid Coated)';
      $('lf-lname-label').textContent = '라인명';
      $('lf-pname-label').textContent = '제품명';
      $('lf-ing-label').textContent = '원재료명';
      $('lf-cap-label').textContent = '내용량';
    } else {
      $('lf-pantone-label').textContent = '배경 팬톤 넘버 직접 입력 (PANTONE Solid Coated)';
      $('lf-lname-label').textContent = '라인명 (Bold체 적용)';
      $('lf-pname-label').textContent = '제품명 (Light체 적용)';
      $('lf-cap-label').textContent = type === 'hff'
        ? '용량 / 내용량 (정중앙 정렬 · 앞에 「건강기능식품」 자동 병기 · 10pt / 90% / -5 · 하단 3mm)'
        : '용량 / 내용량 + 열량 kcal (정중앙 정렬 · 10pt / 90% / -5 · 하단 3mm)';
    }

    lastSizeClass = d.w < 60 ? 'small' : 'standard';
    run();
  };

  const buildPopConfig = w => {
    const enabled = Boolean($('lf-pop-enable')?.checked);
    $('lf-pop-w').value = w;
    $('lf-pop-fields').style.display = enabled ? 'block' : 'none';

    const bgRes = resolvePantoneInput($('lf-pop-bg')?.value || '389C');
    const l1ColRes = resolvePantoneInput($('lf-pop-l1-color')?.value || '#1D1D1B');
    const l2ColRes = resolvePantoneInput($('lf-pop-l2-color')?.value || '348C');

    if ($('lf-pop-bg-chip')) $('lf-pop-bg-chip').style.background = bgRes.hex;
    if ($('lf-pop-l1-color-chip')) $('lf-pop-l1-color-chip').style.background = l1ColRes.hex;
    if ($('lf-pop-l2-color-chip')) $('lf-pop-l2-color-chip').style.background = l2ColRes.hex;

    return {
      enabled,
      w,
      h: Math.max(10, +($('lf-pop-h')?.value || 35)),
      bgHex: bgRes.hex,
      line1Text: $('lf-pop-l1-text')?.value || '',
      line1Font: $('lf-pop-l1-font')?.value || 'omni',
      line1Weight: +($('lf-pop-l1-weight')?.value || 800),
      line1Pt: Math.max(6, +($('lf-pop-l1-pt')?.value || 14)),
      line1Color: l1ColRes.hex,
      line2Text: $('lf-pop-l2-text')?.value || '',
      line2Font: $('lf-pop-l2-font')?.value || 'omni',
      line2Weight: +($('lf-pop-l2-weight')?.value || 800),
      line2Pt: Math.max(6, +($('lf-pop-l2-pt')?.value || 18)),
      line2Color: l2ColRes.hex,
    };
  };

  const checkPopTextLimit = (inpId, warnId) => {
    const inp = $(inpId);
    const warn = $(warnId);
    if (!inp || !warn) return;
    const lines = (inp.value || '').split('\n');
    const maxLineLen = lines.reduce((max, l) => Math.max(max, l.length), 0);
    if (maxLineLen > 8) {
      inp.style.borderColor = '#E52421';
      inp.style.background = '#FFF5F5';
      warn.style.display = 'block';
      warn.innerHTML = `⚠ 줄당 글자수가 너무 많습니다 (권장 최대 8자 · 현재 ${maxLineLen}자)`;
    } else {
      inp.style.borderColor = '';
      inp.style.background = '';
      warn.style.display = 'none';
      warn.innerHTML = '';
    }
  };

  const run = () => {
    checkPopTextLimit('lf-pop-l1-text', 'lf-pop-l1-warn');
    checkPopTextLimit('lf-pop-l2-text', 'lf-pop-l2-warn');

    const w = Math.max(30, +$('lf-w').value || 80);
    const h = Math.max(50, +$('lf-h').value || 140);
    const pop = buildPopConfig(w);
    const pantoneRes = resolvePantoneInput($('lf-pantone').value);
    const chipEl = $('lf-pantone-chip');
    if (chipEl) {
      chipEl.style.background = pantoneRes.hex;
    }
    const lineName = $('lf-lname').value.trim();
    const productName = $('lf-pname').value.trim();

    if (logic === 'innerbeauty') {
      const customNamePt = Math.max(8, +$('lf-name-pt').value || 27);
      const spec = autoSpecInnerBeautyFront({
        type,
        w,
        h,
        pop,
        pointColor: pantoneRes.hex,
        customNamePt,
        lineName,
        productName,
        benefit: $('lf-ib-benefit').value,
        points: $('lf-ib-points').value,
        footnote: $('lf-ib-footnote').value,
        ingredient: $('lf-ing').value,
        capacity: $('lf-cap').value,
      });
      currentSpec = spec;
      $('lf-canvas').innerHTML = renderInnerBeautyFrontSvg(spec, showGuidesIb);
      return;
    }

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

    const customNamePt = Math.max(8, +$('lf-name-pt').value || (w < 60 ? 18 : 26));
    const spec = autoSpecPackageFront({
      type,
      w,
      h,
      pop,
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

    $('lf-canvas').innerHTML = renderPackageFrontSvg(spec, logic === 'metagreen' ? showGuidesMeta : false);
  };

  const downloadPdfFile = async () => {
    if (!currentSpec) return;
    await ensureAiFontsLoaded();
    const svgForPdf = logic === 'innerbeauty'
      ? renderInnerBeautyFrontSvg(currentSpec, showGuidesIb)
      : renderPackageFrontSvg(currentSpec, logic === 'metagreen' ? showGuidesMeta : false);
    const safeName = `${currentSpec.lineName}_${currentSpec.productName || 'Package'}`.replace(/\s+/g, '_');
    const blob = buildPdfBlob(svgForPdf, `VITALBEAUTIE_BrandVisibility_${safeName}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VITALBEAUTIE_BrandVisibility_${safeName}_${currentSpec.w}x${currentSpec.h}mm.pdf`;
    a.click();
    showToast('Adobe PDF (.pdf) 인쇄 교정용 파일이 다운로드되었습니다');
  };

  const downloadAiFile = async () => {
    if (!currentSpec) return;
    await ensureAiFontsLoaded();
    const svgForAi = logic === 'innerbeauty'
      ? renderInnerBeautyFrontSvg(currentSpec, showGuidesIb)
      : renderPackageFrontSvg(currentSpec, logic === 'metagreen' ? showGuidesMeta : false);
    const safeName = `${currentSpec.lineName}_${currentSpec.productName || 'Package'}`.replace(/\s+/g, '_');
    const blob = buildIllustratorAiBlob(svgForAi, `VITALBEAUTIE_BrandVisibility_${safeName}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VITALBEAUTIE_BrandVisibility_${safeName}_${currentSpec.w}x${currentSpec.h}mm.ai`;
    a.click();
    showToast('Adobe Illustrator (.ai) 파일이 다운로드되었습니다');
  };

  el.querySelectorAll('#lf-tabs .lf-inline-tab').forEach(btn => {
    btn.onclick = () => applyDefaults(btn.dataset.type, logic);
  });

  el.querySelectorAll('#lf-logic-tabs .lf-inline-tab').forEach(btn => {
    btn.onclick = () => applyDefaults(type, btn.dataset.logic);
  });

  el.querySelectorAll('.lf-ib-preset-btn').forEach(btn => {
    btn.onclick = () => {
      const p = IB_PRESETS[btn.dataset.ibPreset];
      if (!p) return;
      $('lf-w').value = p.w;
      $('lf-h').value = p.h;
      $('lf-pop-w').value = p.w;
      $('lf-pantone').value = p.pantone;
      $('lf-name-pt').value = p.namePt;
      $('lf-name-pt-range').value = p.namePt;
      $('lf-lname').value = p.lineName;
      $('lf-pname').value = p.productName;
      $('lf-ib-benefit').value = String(p.benefit || '').toUpperCase();
      $('lf-ib-points').value = p.points;
      $('lf-ib-footnote').value = p.footnote;
      $('lf-ing').value = p.ingredient;
      $('lf-cap').value = p.capacity;
      run();
    };
  });

  $('lf-name-pt-range').oninput = e => {
    $('lf-name-pt').value = e.target.value;
    run();
  };
  $('lf-name-pt').oninput = e => {
    $('lf-name-pt-range').value = e.target.value;
    run();
  };

  $('lf-pop-l1-pt-range').oninput = e => {
    $('lf-pop-l1-pt').value = e.target.value;
    run();
  };
  $('lf-pop-l1-pt').oninput = e => {
    $('lf-pop-l1-pt-range').value = e.target.value;
    run();
  };

  $('lf-pop-l2-pt-range').oninput = e => {
    $('lf-pop-l2-pt').value = e.target.value;
    run();
  };
  $('lf-pop-l2-pt').oninput = e => {
    $('lf-pop-l2-pt-range').value = e.target.value;
    run();
  };

  $('lf-ib-benefit').oninput = e => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const upper = e.target.value.toUpperCase();
    if (e.target.value !== upper) {
      e.target.value = upper;
      try { e.target.setSelectionRange(start, end); } catch { /* ignore */ }
    }
    run();
  };

  [
    'lf-w', 'lf-h', 'lf-pantone', 'lf-lname', 'lf-pname', 'lf-ing', 'lf-cap',
    'lf-ib-points', 'lf-ib-footnote',
    'lf-pop-h', 'lf-pop-bg',
    'lf-pop-l1-text', 'lf-pop-l1-color',
    'lf-pop-l2-text', 'lf-pop-l2-color',
  ].forEach(id => {
    const inputEl = $(id);
    if (inputEl) inputEl.oninput = run;
  });

  ['lf-small-exc', 'lf-pop-enable', 'lf-pop-l1-font', 'lf-pop-l1-weight', 'lf-pop-l2-font', 'lf-pop-l2-weight'].forEach(id => {
    const selEl = $(id);
    if (selEl) selEl.onchange = run;
  });

  $('lf-guide-btn-meta').onclick = e => {
    showGuidesMeta = !showGuidesMeta;
    e.currentTarget.textContent = `메타그린 빨간 가이드 치수선 ${showGuidesMeta ? 'ON' : 'OFF'}`;
    run();
  };

  $('lf-guide-btn-ib').onclick = e => {
    showGuidesIb = !showGuidesIb;
    e.currentTarget.textContent = `이너뷰티 빨간 가이드 치수선 ${showGuidesIb ? 'ON' : 'OFF'}`;
    run();
  };

  $('lf-dl-pdf').onclick = downloadPdfFile;
  $('lf-dl-ai').onclick = downloadAiFile;

  applyDefaults('hff', 'metagreen');

  // ── [2] ICON GENERATOR 로직 ──
  setupIconGenerator(el);
}

function setupIconGenerator(el) {
  const kwInput = el.querySelector('#ig-kw-input');
  const kwListEl = el.querySelector('#ig-kw-list');
  const inspectorEl = el.querySelector('#ig-inspector');
  const dlAllAiBtn = el.querySelector('#ig-dl-all-ai');
  const dlAllPdfBtn = el.querySelector('#ig-dl-all-pdf');

  let indexData = null;
  let selectedKw = null;
  let selectedMotifId = null;
  let selectedVariantId = 'circle-line';
  let currentBlocks = [];
  const motifLevels = {};

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
    if (!currentBlocks || !currentBlocks.length) {
      inspectorEl.innerHTML = '';
      return;
    }
    const block = currentBlocks.find(b => b.keyword === selectedKw) || currentBlocks[0];
    if (!block || !block.motifs || !block.motifs.length) {
      inspectorEl.innerHTML = '';
      return;
    }
    const motif = block.motifs.find(m => m.id === selectedMotifId) || block.motifs[0];
    const key = `${block.keyword}:${motif.id}`;
    const curLevel = motifLevels[key] || 1;
    const levelObj = motif.levels[curLevel - 1] || motif.levels[0];
    const cand = levelObj.icon;
    const variant = VB_ICON_VARIANTS.find(v => v.id === selectedVariantId) || VB_ICON_VARIANTS[0];

    const customArc = el.querySelector('#ig-arc-input')?.value.trim();
    const customKo = el.querySelector('#ig-ko-input')?.value.trim();
    const activeKo = customKo || block.keyword;
    const activeEn = customArc || block.enCopy;

    const heroSvg = renderVbStyledIconSvg(cand, variant.id, {
      koText: activeKo,
      enText: activeEn,
      uid: 'insp-hero',
    });
    const svg16 = renderVbStyledIconSvg(cand, variant.id, {
      koText: activeKo,
      enText: activeEn,
      uid: 'insp-16',
    });
    const svg24 = renderVbStyledIconSvg(cand, variant.id, {
      koText: activeKo,
      enText: activeEn,
      uid: 'insp-24',
    });
    const svg48 = renderVbStyledIconSvg(cand, variant.id, {
      koText: activeKo,
      enText: activeEn,
      uid: 'insp-48',
    });

    inspectorEl.innerHTML = `
      <div class="ig-insp-card">
        <div class="ig-insp-hero">
          <div class="ig-insp-hero-svg">${heroSvg}</div>
        </div>

        <div class="ig-insp-title">${block.keyword} · ${motif.title}</div>
        <div class="ig-insp-sub">Lv.${curLevel} ${levelObj.label} (${levelObj.desc}) · ${variant.label}</div>

        <div class="ig-insp-sec-title">작은 크기 (16 · 24 · 48px)</div>
        <div class="ig-insp-sizes">
          <div class="ig-size-box" style="width:16px;height:16px">${svg16}</div>
          <div class="ig-size-box" style="width:24px;height:24px">${svg24}</div>
          <div class="ig-size-box" style="width:48px;height:48px">${svg48}</div>
        </div>

        <div class="ig-insp-sec-title">모티프 및 복잡도 단계</div>
        <div class="ig-insp-meta-main">${motif.title} Lv.${curLevel} (${levelObj.label})</div>
        <div class="ig-insp-meta-tags">${levelObj.desc} · 영문: ${activeEn}</div>

        <div class="ig-insp-sec-title">바이탈뷰티 배지 디자인 가이드</div>
        <ul class="ig-insp-list">
          <li>· 모티프 베이스 디자인에 디테일이 단계별로 누적(Progressive Detailing)</li>
          <li>· 단색 VB 블랙 (#101820), 선 끝·모서리 라운드 (round stroke)</li>
          <li>· ${variant.frameDesc}</li>
          <li>· 영문 원호 문안 및 국문 키워드 실시간 커스텀 적용</li>
        </ul>

        <div class="ig-insp-actions">
          <button type="button" id="ig-dl-single-pdf" class="ig-btn-outline">↓ .pdf (30×30mm)</button>
          <button type="button" id="ig-dl-single-ai" class="ig-btn-black">↓ .ai (30×30mm)</button>
          <button type="button" id="ig-dl-single-svg" class="ig-btn-outline">↓ .svg</button>
        </div>

        <p class="ig-insp-foot">
          PDF 및 AI 파일은 30×30mm 아트보드의 인쇄용 벡터 데이터로 저장됩니다.
        </p>
      </div>
    `;

    const singlePdfBtn = inspectorEl.querySelector('#ig-dl-single-pdf');
    const singleAiBtn = inspectorEl.querySelector('#ig-dl-single-ai');
    const singleSvgBtn = inspectorEl.querySelector('#ig-dl-single-svg');

    if (singlePdfBtn) {
      singlePdfBtn.onclick = () => {
        const exportSvg = buildSingleIconExportSvg(cand, variant.id, {
          koText: activeKo,
          enText: activeEn,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = buildPdfBlob(exportSvg, `VITALBEAUTIE_${safeKw}_${motif.id}_Lv${curLevel}_${variant.id}`);
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${motif.id}_Lv${curLevel}_${variant.id}_30x30mm.pdf`);
        showToast(`${block.keyword} - ${motif.title} Lv.${curLevel} (${variant.label}) .pdf 파일이 다운로드되었습니다`);
      };
    }

    if (singleAiBtn) {
      singleAiBtn.onclick = () => {
        const exportSvg = buildSingleIconExportSvg(cand, variant.id, {
          koText: activeKo,
          enText: activeEn,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = buildIllustratorAiBlob(exportSvg, `VITALBEAUTIE_${safeKw}_${motif.id}_Lv${curLevel}_${variant.id}`);
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${motif.id}_Lv${curLevel}_${variant.id}_30x30mm.ai`);
        showToast(`${block.keyword} - ${motif.title} Lv.${curLevel} (${variant.label}) .ai 파일이 다운로드되었습니다`);
      };
    }

    if (singleSvgBtn) {
      singleSvgBtn.onclick = () => {
        const exportSvg = buildSingleIconExportSvg(cand, variant.id, {
          koText: activeKo,
          enText: activeEn,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${motif.id}_Lv${curLevel}_${variant.id}.svg`);
        showToast(`${block.keyword} - ${motif.title} Lv.${curLevel} (${variant.label}) .svg 파일이 다운로드되었습니다`);
      };
    }
  };

  const renderAllKeywordBlocks = () => {
    if (!indexData) return;
    const rawKeywords = (kwInput.value || '수면, 디톡스')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const keywords = rawKeywords.length ? rawKeywords : ['수면', '디톡스'];

    const customArc = el.querySelector('#ig-arc-input')?.value.trim();
    const customKo = el.querySelector('#ig-ko-input')?.value.trim();

    currentBlocks = keywords.map(kw => {
      const cluster = searchMotifClusters(indexData, kw);
      return {
        keyword: cluster.keyword,
        enCopy: customArc || cluster.enCopy,
        motifs: cluster.motifs,
      };
    });

    if (!selectedKw || !currentBlocks.some(b => b.keyword === selectedKw)) {
      selectedKw = currentBlocks[0]?.keyword;
      selectedMotifId = currentBlocks[0]?.motifs?.[0]?.id;
    }

    kwListEl.innerHTML = currentBlocks.map((block, bIdx) => {
      const motifsHtml = block.motifs.map((motif, mIdx) => {
        const key = `${block.keyword}:${motif.id}`;
        const curLevel = motifLevels[key] || 1;
        const levelObj = motif.levels[curLevel - 1] || motif.levels[0];
        const activeIcon = levelObj.icon;

        const variantsHtml = VB_ICON_VARIANTS.map((v, vIdx) => {
          const svg = renderVbStyledIconSvg(activeIcon, v.id, {
            koText: customKo || block.keyword,
            enText: customArc || block.enCopy,
            uid: `b${bIdx}-m${mIdx}-v${vIdx}`,
          });
          const isVarSelected = block.keyword === selectedKw && motif.id === selectedMotifId && v.id === selectedVariantId;
          return `
            <div class="ig-motif-var-item ${isVarSelected ? 'selected' : ''}" data-kw="${block.keyword}" data-motif-id="${motif.id}" data-variant-id="${v.id}">
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
              <button type="button" class="btn btn-sm btn-outline ig-dl-pdf-single" data-kw="${block.keyword}" data-motif-id="${motif.id}">.PDF 벡터 다운로드</button>
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
        selectedKw = kw;
        selectedMotifId = motifId;
        renderAllKeywordBlocks();
      };
    });

    // 이벤트 바인딩: 6가지 배지 변형 클릭 시 선택 및 인스펙터 실시간 동기화
    kwListEl.querySelectorAll('.ig-motif-var-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        selectedKw = item.getAttribute('data-kw');
        selectedMotifId = item.getAttribute('data-motif-id');
        selectedVariantId = item.getAttribute('data-variant-id');
        kwListEl.querySelectorAll('.ig-motif-var-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        renderInspector();
      };
    });

    // 이벤트 바인딩: 모티프 카드 클릭 시 포커스
    kwListEl.querySelectorAll('.ig-motif-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.ig-complexity-range') || e.target.closest('.btn') || e.target.closest('.ig-motif-var-item')) return;
        selectedKw = card.getAttribute('data-kw');
        selectedMotifId = card.getAttribute('data-motif-id');
        renderInspector();
      };
    });

    // 이벤트 바인딩: 개별 모티프 .PDF 다운로드
    kwListEl.querySelectorAll('.ig-dl-pdf-single').forEach(btn => {
      btn.onclick = () => {
        const kw = btn.getAttribute('data-kw');
        const motifId = btn.getAttribute('data-motif-id');
        const block = currentBlocks.find(b => b.keyword === kw);
        const motif = block?.motifs.find(m => m.id === motifId);
        if (!motif) return;
        const curLevel = motifLevels[`${kw}:${motif.id}`] || 1;
        const levelObj = motif.levels[curLevel - 1] || motif.levels[0];
        const customArc = el.querySelector('#ig-arc-input')?.value.trim();
        const customKo = el.querySelector('#ig-ko-input')?.value.trim();
        const activeKo = customKo || block.keyword;
        const activeEn = customArc || block.enCopy;
        const exportSvg = buildSingleIconExportSvg(levelObj.icon, selectedVariantId || 'circle-line', {
          koText: activeKo,
          enText: activeEn,
        });
        const safeKw = block.keyword.replace(/\s+/g, '_');
        const blob = buildPdfBlob(exportSvg, `VITALBEAUTIE_${safeKw}_${motif.id}_Lv${curLevel}`);
        triggerDownload(blob, `VITALBEAUTIE_Icon_${safeKw}_${motif.id}_Lv${curLevel}.pdf`);
        showToast(`${block.keyword} - ${motif.title} (Lv.${curLevel}) .pdf 파일이 다운로드되었습니다`);
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
        const customArc = el.querySelector('#ig-arc-input')?.value.trim();
        const customKo = el.querySelector('#ig-ko-input')?.value.trim();
        const activeKo = customKo || block.keyword;
        const activeEn = customArc || block.enCopy;
        const exportSvg = buildSingleIconExportSvg(levelObj.icon, selectedVariantId || 'circle-line', {
          koText: activeKo,
          enText: activeEn,
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
        const customArc = el.querySelector('#ig-arc-input')?.value.trim();
        const customKo = el.querySelector('#ig-ko-input')?.value.trim();
        const activeKo = customKo || block.keyword;
        const activeEn = customArc || block.enCopy;
        const exportSvg = buildSingleIconExportSvg(levelObj.icon, selectedVariantId || 'circle-line', {
          koText: activeKo,
          enText: activeEn,
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

  const arcInp = el.querySelector('#ig-arc-input');
  if (arcInp) {
    arcInp.addEventListener('input', () => {
      renderAllKeywordBlocks();
    });
  }

  const koInp = el.querySelector('#ig-ko-input');
  if (koInp) {
    koInp.addEventListener('input', () => {
      renderAllKeywordBlocks();
    });
  }

  if (dlAllPdfBtn) {
    dlAllPdfBtn.onclick = () => {
      if (!currentBlocks.length) return;
      const sheetSvg = buildAllKeywordsSheetSvg(currentBlocks);
      const safeNames = currentBlocks.map(b => b.keyword.replace(/\s+/g, '_')).join('_');
      const blob = buildPdfBlob(sheetSvg, `VITALBEAUTIE_All_Icons_${safeNames}`);
      triggerDownload(blob, `VITALBEAUTIE_IconSheet_${safeNames}.pdf`);
      showToast('전체 키워드 아이콘 시트 (.pdf) 파일이 다운로드되었습니다');
    };
  }

  if (dlAllAiBtn) {
    dlAllAiBtn.onclick = () => {
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
  let selectedToneId = 'auto'; // 기본 키워드 기반 전체 패밀리 제안
  let selectedMinDe = 10;
  let strictDeMode = false;
  let pageOffset = 0;

  const renderChips = () => REPRESENTATIVE_COLOR_CHIPS.map(chip => `
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
        <input id="fl-func" class="gov-input" value="수면" placeholder="예: 수면, 콜라겐, 유산균, 홍삼">

        <label class="gov-label" style="font-size:14px;font-weight:700;color:#101820;margin-top:24px;margin-bottom:4px;">대표 컬러 (선택)</label>
        <div class="fl-chip-grid-17" id="fl-chips-17">
          ${renderChips()}
        </div>

        <label class="gov-label" style="font-size:14px;font-weight:700;color:#101820;margin-top:24px;margin-bottom:4px;">기존 컬러와 최소 색차 (ΔE2000)</label>
        <div class="fl-de-bar" id="fl-de-bar">
          <button type="button" class="fl-de-btn ${selectedMinDe === 6 ? 'active' : ''}" data-de="6">6</button>
          <button type="button" class="fl-de-btn ${selectedMinDe === 10 ? 'active' : ''}" data-de="10">10</button>
          <button type="button" class="fl-de-btn ${selectedMinDe === 15 ? 'active' : ''}" data-de="15">15</button>
          <button type="button" class="fl-de-btn ${selectedMinDe === 20 ? 'active' : ''}" data-de="20">20</button>
        </div>
        <div style="margin-top:10px;">
          <label style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#101820; cursor:pointer;">
            <input type="checkbox" id="fl-strict-toggle" ${strictDeMode ? 'checked' : ''} />
            설정 색차(ΔE ${selectedMinDe}) 엄격 필터링 (기준 미달 제안 완전 제외)
          </label>
        </div>
        <p class="fl-de-desc" style="margin-top:8px;">
          숫자가 클수록 기존 제품과 더 확실히 다른 색만 남깁니다. 10이면 매대에서 나란히 놓아도 구분되는 수준입니다. 각 제안 아래에는 그 색과 가장 가까운 기존 제품의 컬러와 Pantone 번호를 나란히 비교합니다.
        </p>
        <div style="margin-top:12px; padding:10px 12px; background:#F8F9FC; border:1px solid #E1E4ED; border-radius:4px; font-size:11.5px; color:#5A6270; line-height:1.55;">
          <strong style="color:#101820; display:block; margin-bottom:2px;">※ 디지털 예상 색차 vs 인쇄 실측 색차 안내</strong>
          화면의 색차는 sRGB 디지털 데이터 기준 CIE ΔE2000 예측치이며, 실제 인쇄 용지(코팅/비코팅지/알루미늄박 등), 인쇄 잉크 조색 및 조명 환경에 따른 분광 측색계(Spectrophotometer) 실측 색차와 차이가 있을 수 있습니다. 양산 전 실제 교정지 측색을 필히 권장합니다.
        </div>
      </div>

      <!-- 우측: 레퍼런스 이미지(media_1794186795723_91b94d0e.jpg) 100% 동일 레이아웃 -->
      <div class="gov-result">
        <div id="fl-results-container"></div>
      </div>
    </div>`;

  const $ = id => el.querySelector('#' + id);

  const renderSuggestions = () => {
    const res = suggestFamilyLook({
      funcText: $('fl-func').value,
      selectedToneId,
      minDeltaE: selectedMinDe,
      strictOnly: strictDeMode,
      offset: pageOffset,
    });

    const ga = res.globalAnalysis;
    const tagList = ga.preferredTones.map(t => FAMILY_KO_MAP[t] || t).join(' · ');

    const familySectionsHtml = res.families.map(fam => {
      const pillsHtml = fam.existingProducts.map(p => `
        <div class="fl-exist-pill" data-copy-hex="${p.hex}" data-copy-label="${p.pantone}" style="cursor:pointer;" title="클릭하여 HEX (${p.hex}) 복사">
          <span class="fl-exist-sq" style="background:${p.hex}"></span>
          <span class="fl-exist-name">${p.name}</span>
          <span class="fl-exist-code">${p.pantone} · ${p.hex}</span>
        </div>
      `).join('');

      const renderCard = c => `
        <div class="fl-rec-card ${c.isRelaxed ? 'fl-rec-card-relaxed' : ''}" data-copy-hex="${c.hex}" data-copy-label="${c.pantoneCode}" style="cursor:pointer; ${c.isRelaxed ? 'border:1px dashed #FFA39E;' : ''}" title="클릭하여 HEX (${c.hex}) 복사">
          <div class="fl-rec-swatch-box" style="background:${c.hex}">
            <span class="fl-rec-shade-tag">${c.shade}</span>
          </div>
          <div class="fl-rec-body">
            ${c.isRelaxed ? `
              <div style="margin-bottom:6px;">
                <span class="fl-relaxed-badge" style="background:#FFF1F0; border:1px solid #FFA39E; color:#CF1322; font-size:9.5px; font-weight:700; padding:1px 5px; border-radius:3px; display:inline-block;">
                  완화 제안 (ΔE ${c.minD.toFixed(1)} &lt; ${selectedMinDe})
                </span>
              </div>
            ` : ''}
            <div class="fl-rec-pms">${c.pantoneCode}</div>
            <div class="fl-rec-hex" style="display:inline-flex;align-items:center;gap:6px;padding:1px 6px;border:1px solid #E1E4ED;background:#F8F9FC;color:#101820;font-weight:600;margin-bottom:6px;">
              <span>${c.hex}</span>
              <span class="fl-copy-badge" style="font-size:9px;color:#7A808C;">COPY</span>
            </div>
            <div class="fl-rec-mini-table">
              <div class="fl-rec-table-head">
                <span>제안</span>
                <span>기존</span>
              </div>
              <div class="fl-rec-table-swatches">
                <span class="fl-rec-sq" style="background:${c.hex}"></span>
                <span class="fl-rec-sq" style="background:${c.nearestHex}"></span>
              </div>
              <div class="fl-rec-table-info">
                <div class="fl-rec-col-left">
                  <div class="fl-rec-code-sm">${c.pantoneCode}</div>
                </div>
                <div class="fl-rec-col-right">
                  <div class="fl-rec-code-sm">${c.nearestPantone}</div>
                  <div class="fl-rec-name-sm">${c.nearestName}</div>
                  <div class="fl-rec-de-sm" title="sRGB 변환 기반 디지털 예상 색차">예상 ΔE ${c.minD.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const deepCards = (fam.byShade?.deep || []).map(renderCard).join('');
      const medCards = (fam.byShade?.medium || []).map(renderCard).join('');
      const lightCards = (fam.byShade?.light || []).map(renderCard).join('');

      const noticeHtml = fam.notice ? `<div class="fl-low-chip-alert">${fam.notice}</div>` : '';

      return `
        <div class="fl-family-section">
          <div class="fl-fam-head">
            <div class="fl-fam-title-group">
              <span class="fl-fam-title">${fam.familyKo} 계열</span>
              <span class="fl-fam-badge">키워드·기능</span>
            </div>
            <span class="fl-fam-stats">이 계열 기존 제품 ${fam.existingProducts.length}개 · 겹쳐서 제외한 칩 ${fam.excludedCount}개</span>
          </div>

          <div class="fl-exist-title">이 계열의 기존 제품 컬러</div>
          <div class="fl-exist-pills">${pillsHtml}</div>

          <div style="margin-top:16px;">
            <div style="font-size:12px;font-weight:700;color:#101820;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#101820;"></span>
              딥 (Deep) · ${fam.byShade?.deep?.length || 0}개 제안
            </div>
            <div class="fl-cards-grid" style="margin-bottom:18px;">${deepCards}</div>

            <div style="font-size:12px;font-weight:700;color:#101820;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#4E5968;"></span>
              미디엄 (Medium) · ${fam.byShade?.medium?.length || 0}개 제안
            </div>
            <div class="fl-cards-grid" style="margin-bottom:18px;">${medCards}</div>

            <div style="font-size:12px;font-weight:700;color:#101820;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#8B95A1;"></span>
              라이트 (Light) · ${fam.byShade?.light?.length || 0}개 제안
            </div>
            <div class="fl-cards-grid">${lightCards}</div>
          </div>
          ${noticeHtml}
        </div>`;
    }).join('');

    // 타사 브랜드 벤치마크는 내부 학습 데이터로만 활용하고, 화면에는 공통 컬러 세미오틱스 설명만 노출
    const cleanGlobalReason = ga.neutralReason || (ga.globalReason || '').replace(/\s*\(PANTONE[^)]*\)/gi, '');
    const cleanCategoryTitle = (ga.categoryTitle || '').replace(/\s*·[^·()]*벤치마크/g, '');

    $('fl-results-container').innerHTML = `
      <div class="fl-kw-header-box">
        <div class="fl-kw-header-title">${res.keyword || '수면'} <span style="font-size:12px;font-weight:500;color:#667085;margin-left:6px;">${cleanCategoryTitle}</span></div>
        <div class="fl-kw-header-desc">${cleanGlobalReason}</div>
        <div class="fl-kw-header-tags">${tagList}</div>
      </div>
      ${familySectionsHtml}
    `;

    $('fl-results-container').querySelectorAll('[data-copy-hex]').forEach(node => {
      node.addEventListener('click', () => {
        const hex = node.getAttribute('data-copy-hex');
        const label = node.getAttribute('data-copy-label') || '';
        copyToClipboard(hex);
        const badge = node.querySelector('.fl-copy-badge');
        if (badge) {
          badge.textContent = '✓ COPIED';
          badge.style.color = '#101820';
          setTimeout(() => {
            badge.textContent = 'COPY';
            badge.style.color = '#7A808C';
          }, 1400);
        }
        showToast(`HEX 코드 복사 완료: ${hex}${label ? ' (' + label + ')' : ''}`);
      });
    });
  };

  const bindChipEvents = () => {
    el.querySelectorAll('#fl-chips-17 .fl-round-chip').forEach(btn => {
      btn.onclick = () => {
        const clickedId = btn.getAttribute('data-tone-id');
        // 사용자가 이미 선택된 대표 컬러를 다시 누르면 취소(auto 해제)
        if (selectedToneId === clickedId) {
          selectedToneId = 'auto';
        } else {
          selectedToneId = clickedId;
        }
        pageOffset = 0;
        el.querySelectorAll('#fl-chips-17 .fl-round-chip').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tone-id') === selectedToneId);
        });
        renderSuggestions();
      };
    });
  };

  $('fl-func').oninput = () => {
    pageOffset = 0;
    renderSuggestions();
  };

  bindChipEvents();

  el.querySelectorAll('#fl-de-bar .fl-de-btn').forEach(btn => {
    btn.onclick = () => {
      selectedMinDe = +btn.getAttribute('data-de');
      pageOffset = 0;
      el.querySelectorAll('#fl-de-bar .fl-de-btn').forEach(b => {
        b.classList.toggle('active', +b.getAttribute('data-de') === selectedMinDe);
      });
      const strictLabel = el.querySelector('#fl-strict-toggle')?.parentElement;
      if (strictLabel) {
        strictLabel.innerHTML = `
          <input type="checkbox" id="fl-strict-toggle" ${strictDeMode ? 'checked' : ''} />
          설정 색차(ΔE ${selectedMinDe}) 엄격 필터링 (기준 미달 제안 완전 제외)
        `;
        $('fl-strict-toggle').onchange = e => {
          strictDeMode = e.target.checked;
          pageOffset = 0;
          renderSuggestions();
        };
      }
      renderSuggestions();
    };
  });

  const strictToggle = $('fl-strict-toggle');
  if (strictToggle) {
    strictToggle.onchange = e => {
      strictDeMode = e.target.checked;
      pageOffset = 0;
      renderSuggestions();
    };
  }

  renderSuggestions();
}

/* ─── 4. Localization (글로벌 패키지 로컬라이저 · 한국·미국·일본 시뮬레이션) ─── */
export function renderLocalizationPage(el) {
  const LOC_DEFAULTS = {
    metagreen: {
      hff: {
        w: 70.6,
        h: 119.9,
        pantone: '348 C',
        lineName: '메타그린',
        productName: '슬림업',
        ingredient: '녹차추출물',
        claim: '',
        krCapText: '200g [20g X 10포]',
        usCapText: '10 - 1.06 oz (30 g) Packet\nNet Wt. 10.58 oz (300 g)',
        jpClass: '保健機能食品',
        jpCapText: '75.6g (420mg × 180錠)',
        krTitlePt: 22,
        enTitlePt: 15.5,
        jaTitlePt: 22,
        dietaryPt: 12,
      },
      food: {
        w: 80.0,
        h: 141.0,
        pantone: '348 C',
        lineName: '메타그린',
        productName: '젤리 애사비',
        ingredient: '사과초모식초 10%, 난소화성말토덱스트린 5%',
        claim: '',
        krCapText: '200g [20g X 10포] (150 kcal)',
        usCapText: '10 - 0.71 oz (20 g) Stick\nNet Wt. 7.05 oz (200 g)',
        jpClass: '一般食品',
        jpCapText: '200g (20g × 10包)',
        krTitlePt: 22,
        enTitlePt: 15.5,
        jaTitlePt: 22,
        dietaryPt: 12,
      },
    },
    innerbeauty: {
      hff: {
        w: 75.0,
        h: 132.5,
        pantone: '230 C',
        lineName: '슈퍼콜라겐',
        productName: '케라핏',
        benefit: 'SHINE & YOUTHFUL',
        points: '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
        footnote: '*1일 1포 기준',
        ingredient: '저분자피쉬콜라겐펩타이드, 비오틴, 판토텐산',
        claim: '',
        krCapText: '48 g [1.6 g X 30포]',
        usCapText: '30 - 0.056 oz (1.6 g) Stick\nNet Wt. 1.69 oz (48 g)',
        jpClass: '機能性表示食品',
        jpCapText: '48g (1.6g × 30包)',
        krTitlePt: 27,
        enTitlePt: 19,
        jaTitlePt: 22,
        dietaryPt: 11,
      },
      food: {
        w: 75.0,
        h: 132.5,
        pantone: '230 C',
        lineName: '슈퍼콜라겐',
        productName: '케라핏',
        benefit: 'SHINE & YOUTHFUL',
        points: '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
        footnote: '*1일 1포 기준',
        ingredient: '[저분자 콜라겐 TYPE 1, 3, 5 + 비타민 B, C 컴플렉스] 67.648%',
        claim: '',
        krCapText: '48 g [1.6 g X 30포] (180 kcal)',
        usCapText: '30 - 0.056 oz (1.6 g) Stick\nNet Wt. 1.69 oz (48 g)',
        jpClass: '一般食品',
        jpCapText: '48g (1.6g × 30包)',
        krTitlePt: 27,
        enTitlePt: 19,
        jaTitlePt: 22,
        dietaryPt: 11,
      },
    },
  };

  const LOC_IB_PRESETS = {
    kerafit: {
      w: 75,
      h: 132.5,
      pantone: '230 C',
      krTitlePt: 27,
      enTitlePt: 19,
      jaTitlePt: 22,
      lineName: '슈퍼콜라겐',
      productName: '케라핏',
      benefit: 'SHINE & YOUTHFUL',
      points: '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
      footnote: '*1일 1포 기준',
      ingredient: '[저분자 콜라겐 TYPE 1, 3, 5 + 비타민 B, C 컴플렉스] 67.648%',
      krCapText: '48 g [1.6 g X 30포] (180 kcal)',
      usCapText: '30 - 0.056 oz (1.6 g) Stick\nNet Wt. 1.69 oz (48 g)',
      jpCapText: '48g (1.6g × 30包)',
    },
    retinol: {
      w: 75,
      h: 132.5,
      pantone: '3945 C',
      krTitlePt: 27,
      enTitlePt: 19,
      jaTitlePt: 22,
      lineName: '슈퍼레티놀',
      productName: '',
      benefit: 'BRIGHT & GLOW',
      points: '먹는 레티놀로 광채 시너지*\n레티놀 X 비타민C·E·아연·판토텐산\n비건 레티놀 1,000μg*\n흡수 빠른 리포좀 레티놀 제형',
      footnote: '*1일 영양성분 기준치 대비 2sticks',
      ingredient: '[모링가잎추출물(비건레티놀)+비타민A·C·E+아연+판토텐산] 16.506%',
      krCapText: '60 g [2 g X 30포] (230 kcal)',
      usCapText: '30 - 0.07 oz (2 g) Stick\nNet Wt. 2.12 oz (60 g)',
      jpCapText: '60g (2g × 30包)',
    },
    cica: {
      w: 75,
      h: 132.5,
      pantone: '353 C',
      krTitlePt: 27,
      enTitlePt: 19,
      jaTitlePt: 22,
      lineName: '슈퍼시카',
      productName: 'B5',
      benefit: 'CALM & CLEAR',
      points: '속민감+속진정, 고함량 판토텐산\n밀크세라마이드 1000, 녹차 유래 유산균 함유',
      footnote: '*1일 영양성분 기준치 대비 2sticks',
      ingredient: '[병풀추출분말+판토텐산칼슘+밀크세라마이드+비타민B·C·E] 8.95%',
      krCapText: '51 g [1.7 g X 30포] (190 kcal)',
      usCapText: '30 - 0.06 oz (1.7 g) Stick\nNet Wt. 1.80 oz (51 g)',
      jpCapText: '51g (1.7g × 30包)',
    },
    ampoule: {
      w: 200.5,
      h: 121.5,
      pantone: '230 C',
      krTitlePt: 35,
      enTitlePt: 26,
      jaTitlePt: 28,
      lineName: '슈퍼콜라겐',
      productName: '',
      benefit: 'DEWY & LIFTED',
      points: '저분자 콜라겐 3,500mg, 5가지 유형 콜라겐\n9.4배 흡수율*, 전신 초밀착, 흡수 빠른 액상형',
      footnote: '*자사 기존 제품 대비',
      ingredient: '[저분자 피쉬콜라겐 펩타이드+식물성 콜라겐] 15.1%',
      krCapText: '700 mL [25 mL X 28앰플] (700 kcal)',
      usCapText: '28 - 0.85 fl oz (25 mL) Ampoule\nNet Contents 23.67 fl oz (700 mL)',
      jpCapText: '700mL (25mL × 28本)',
    },
    pdrn: {
      w: 100,
      h: 126.5,
      pantone: '2345 C',
      krTitlePt: 29,
      enTitlePt: 21,
      jaTitlePt: 24,
      lineName: '슈퍼콜라겐',
      productName: 'PDRN',
      benefit: 'FIRM & RENEWED',
      points: '저분자 콜라겐, 고순도* 연어 PDRN\n히알루론산 · 엘라스틴 · 세라마이드 · 비타민C\n흡수 빠른 미세입자 액상 제형',
      footnote: '*원료적 특성에 한함',
      ingredient: '[저분자콜라겐+연어이리추출물(PDRN 함유)] 18.88%',
      krCapText: '350 mL [25 mL X 14입] (350 kcal)',
      usCapText: '14 - 0.85 fl oz (25 mL) Ampoule\nNet Contents 11.83 fl oz (350 mL)',
      jpCapText: '350mL (25mL × 14本)',
    },
  };

  const locState = {
    logic: 'metagreen', // 'metagreen' | 'innerbeauty'
    type: 'hff', // 'hff' | 'food'
    w: 70.6,
    h: 119.9,
    pantone: '348 C',
    pantoneHex: '#00843D',
    lineName: '메타그린',
    productName: '슬림업',
    benefit: 'SHINE & YOUTHFUL',
    points: '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
    footnote: '*1일 1포 기준',
    ingredient: '녹차추출물',
    claim: '',
    // 국가별 내용량 기본 포맷
    capTab: 'ALL', // 'ALL' | 'KR' | 'US' | 'JP'
    krCapText: '200g [20g X 10포]',
    krCapPt: 10,
    usCapText: '10 - 1.06 oz (30 g) Packet\nNet Wt. 10.58 oz (300 g)',
    usCapPt: 10,
    jpClass: '保健機能食品',
    jpCapText: '75.6g (420mg × 180錠)',
    jpCapPt: 10,
    // 라인명·제품명 크기
    krTitlePt: 22,
    enTitlePt: 15.5,
    jaTitlePt: 22,
    dietaryPt: 12,
  };

  el.innerHTML = `
    <div style="margin-bottom:22px;">
      <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:860px;">
        선택한 라인(메타그린 · 이너뷰티)의 디자인 규칙에 맞춰 한국·미국·일본 표시 기준별 전면 패키지를 실시간 시뮬레이션합니다.
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 0;margin-bottom:18px;border-bottom:1px solid #EAECEF;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <label class="btn btn-outline btn-sm" style="cursor:pointer;margin:0">
          국문 기준 파일(.svg) 업로드
          <input type="file" id="loc-upload" accept=".svg,.txt,.json" style="display:none">
        </label>
        <span class="gov-sub" id="loc-file-status">국문 패키지 디자인 파일(.svg)을 업로드하면 규격과 문안을 자동 인식하여 글로벌 규격으로 시뮬레이션합니다.</span>
      </div>
    </div>

    <div class="gov-layout" style="margin-bottom:28px; align-items:start; grid-template-columns: 360px 1fr; gap: 28px;">
      <!-- 좌측 패널 -->
      <div class="gov-panel" style="padding:0 20px 16px 0; border-right:1px solid #EAECEF;">

        <!-- 라인 구분 탭 (메타그린 / 이너뷰티) -->
        <div class="pf-sec-title" style="margin-top:0;padding-top:0;border-top:none;font-weight:700;color:#101820;font-size:13.5px;margin-bottom:8px;">1. 라인 구분</div>
        <div style="margin-bottom:14px;">
          <div class="lf-inline-tabs" id="loc-logic-tabs" role="tablist" style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
            <button type="button" class="lf-inline-tab ${locState.logic === 'metagreen' ? 'active' : ''}" data-logic="metagreen" style="padding:8px 10px;text-align:center;">메타그린</button>
            <button type="button" class="lf-inline-tab ${locState.logic === 'innerbeauty' ? 'active' : ''}" data-logic="innerbeauty" style="padding:8px 10px;text-align:center;">이너뷰티</button>
          </div>
          <div id="loc-ib-presets" style="display:none; margin-top:8px;">
            <div style="display:flex; flex-wrap:wrap; gap:5px;">
              <button type="button" class="btn btn-outline btn-sm loc-ib-preset-btn" data-ib-preset="kerafit" style="font-size:11px; padding:4px 8px;">슈퍼콜라겐 케라핏</button>
              <button type="button" class="btn btn-outline btn-sm loc-ib-preset-btn" data-ib-preset="retinol" style="font-size:11px; padding:4px 8px;">슈퍼레티놀</button>
              <button type="button" class="btn btn-outline btn-sm loc-ib-preset-btn" data-ib-preset="cica" style="font-size:11px; padding:4px 8px;">슈퍼시카 B5</button>
              <button type="button" class="btn btn-outline btn-sm loc-ib-preset-btn" data-ib-preset="ampoule" style="font-size:11px; padding:4px 8px;">슈퍼콜라겐 앰플</button>
              <button type="button" class="btn btn-outline btn-sm loc-ib-preset-btn" data-ib-preset="pdrn" style="font-size:11px; padding:4px 8px;">슈퍼콜라겐 PDRN</button>
            </div>
          </div>
        </div>

        <!-- 2. 규격 (mm) & 제품 유형 -->
        <div class="pf-sec-title" style="margin-top:4px;padding-top:12px;font-weight:700;color:#101820;font-size:13.5px;margin-bottom:8px;">2. 규격 (mm) &amp; 제품 구분</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
          <div>
            <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">폭</label>
            <input id="loc-w" type="number" step="0.1" class="gov-input" value="${locState.w}" style="padding:7px 10px;">
          </div>
          <div>
            <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">높이</label>
            <input id="loc-h" type="number" step="0.1" class="gov-input" value="${locState.h}" style="padding:7px 10px;">
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:6px;">제품 유형</label>
          <div class="lf-inline-tabs" id="loc-type-tabs" role="tablist" style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
            <button type="button" class="lf-inline-tab ${locState.type === 'hff' ? 'active' : ''}" data-type="hff" style="padding:8px 10px;text-align:center;">건강기능식품</button>
            <button type="button" class="lf-inline-tab ${locState.type === 'food' ? 'active' : ''}" data-type="food" style="padding:8px 10px;text-align:center;">일반식품</button>
          </div>
        </div>

        <!-- 3. 배경 / 포인트 Pantone -->
        <div class="pf-sec-title" id="loc-pantone-title" style="margin-top:4px;padding-top:12px;font-weight:700;color:#101820;font-size:13.5px;margin-bottom:8px;">3. 배경 Pantone</div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;">
          <span id="loc-pantone-swatch" style="width:34px;height:34px;background:${locState.pantoneHex};display:inline-block;border-radius:2px;flex-shrink:0;border:1px solid rgba(0,0,0,0.14);"></span>
          <input id="loc-pantone" class="gov-input" value="${locState.pantone}" placeholder="예: 348 C, 230 C, white, black" style="flex:1;padding:7px 10px;">
        </div>

        <!-- 4. 문안 (한국어로 입력) -->
        <div class="pf-sec-title" style="margin-top:4px;padding-top:12px;font-weight:700;color:#101820;font-size:13.5px;margin-bottom:8px;">4. 문안 (한국어로 입력)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
          <div>
            <label class="gov-label" id="loc-lname-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">라인명 · Bold</label>
            <input id="loc-lname" class="gov-input" value="${locState.lineName}" style="padding:7px 10px;">
          </div>
          <div>
            <label class="gov-label" id="loc-pname-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">제품명 · Light</label>
            <input id="loc-pname" class="gov-input" value="${locState.productName}" style="padding:7px 10px;">
          </div>
        </div>

        <!-- 라인명·제품명 크기 -->
        <div style="margin-bottom:14px;">
          <label class="gov-label" style="font-size:12px;font-weight:700;color:#101820;margin-bottom:8px;">라인명·제품명 크기</label>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div>
              <div style="font-size:11.5px;color:#344054;margin-bottom:3px;">한국어</div>
              <div style="display:grid;grid-template-columns:1fr 60px;gap:8px;align-items:center;">
                <input id="loc-kr-pt-range" class="vb-range" type="range" min="10" max="80" step="0.5" value="${locState.krTitlePt}">
                <input id="loc-kr-pt" type="number" min="8" max="80" step="0.5" class="gov-input" value="${locState.krTitlePt}" style="padding:4px 6px;text-align:center;font-weight:700;">
              </div>
            </div>
            <div>
              <div style="font-size:11.5px;color:#344054;margin-bottom:3px;">영어</div>
              <div style="display:grid;grid-template-columns:1fr 60px;gap:8px;align-items:center;">
                <input id="loc-en-pt-range" class="vb-range" type="range" min="10" max="80" step="0.5" value="${locState.enTitlePt}">
                <input id="loc-en-pt" type="number" min="8" max="80" step="0.5" class="gov-input" value="${locState.enTitlePt}" style="padding:4px 6px;text-align:center;font-weight:700;">
              </div>
            </div>
            <div>
              <div style="font-size:11.5px;color:#344054;margin-bottom:3px;">일본어</div>
              <div style="display:grid;grid-template-columns:1fr 60px;gap:8px;align-items:center;">
                <input id="loc-ja-pt-range" class="vb-range" type="range" min="10" max="80" step="0.5" value="${locState.jaTitlePt}">
                <input id="loc-ja-pt" type="number" min="8" max="80" step="0.5" class="gov-input" value="${locState.jaTitlePt}" style="padding:4px 6px;text-align:center;font-weight:700;">
              </div>
            </div>
            <div>
              <div style="font-size:11.5px;color:#344054;margin-bottom:3px;">Dietary Supplement</div>
              <div style="display:grid;grid-template-columns:1fr 60px;gap:8px;align-items:center;">
                <input id="loc-dietary-pt-range" class="vb-range" type="range" min="8" max="24" step="0.5" value="${locState.dietaryPt}">
                <input id="loc-dietary-pt" type="number" min="6" max="30" step="0.5" class="gov-input" value="${locState.dietaryPt}" style="padding:4px 6px;text-align:center;font-weight:700;">
              </div>
            </div>
          </div>
        </div>

        <!-- 이너뷰티 전용 입력 필드 -->
        <div id="loc-ib-fields" style="display:none; margin-bottom:14px;">
          <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">영문 베네핏 문안 (대문자 고정)</label>
          <input id="loc-ib-benefit" class="gov-input" value="${locState.benefit}" style="padding:7px 10px;margin-bottom:10px;text-transform:uppercase;">

          <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">강조 포인트 (줄바꿈 행 구분 · 같은 행 분리는 쉼표(,) 입력)</label>
          <textarea id="loc-ib-points" rows="3" class="gov-input" style="padding:7px 10px;margin-bottom:10px;font-size:12px;line-height:1.4;">${locState.points}</textarea>

          <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">기준치 문안</label>
          <input id="loc-ib-footnote" class="gov-input" value="${locState.footnote}" style="padding:7px 10px;">
        </div>

        <div id="loc-bottom-fields-container">
          <!-- 원재료명 -->
          <div id="loc-ing-section" style="margin-bottom:16px;">
            <label class="gov-label" id="loc-ing-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">원재료명</label>
            <input id="loc-ing" class="gov-input" value="${locState.ingredient}" style="padding:7px 10px;">
          </div>

          <!-- 내용량 섹션 (국가 탭 전환 & 전체 보기 지원) -->
          <div id="loc-cap-section">
            <div class="pf-sec-title" style="margin-top:4px;padding-top:12px;font-weight:700;color:#101820;font-size:13.5px;margin-bottom:8px;">내용량</div>
            <div id="loc-cap-tabs" role="tablist" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:12px;">
              <button type="button" class="lf-inline-tab active" data-cap-tab="ALL" style="padding:6px 4px;font-size:11px;text-align:center;">전체 보기</button>
              <button type="button" class="lf-inline-tab" data-cap-tab="KR" style="padding:6px 4px;font-size:11px;text-align:center;">한국</button>
              <button type="button" class="lf-inline-tab" data-cap-tab="US" style="padding:6px 4px;font-size:11px;text-align:center;">미국</button>
              <button type="button" class="lf-inline-tab" data-cap-tab="JP" style="padding:6px 4px;font-size:11px;text-align:center;">일본</button>
            </div>

            <!-- 한국 내용량 블록 -->
            <div id="loc-cap-block-KR" class="loc-cap-block" style="margin-bottom:14px;">
              <label class="gov-label" id="loc-kr-cap-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">한국 · 건강기능식품</label>
              <input id="loc-kr-cap-text" class="gov-input" value="${locState.krCapText}" style="padding:7px 10px;margin-bottom:8px;">
              <div style="font-size:11px;color:#344054;margin-bottom:2px;">한국어</div>
              <div style="display:grid;grid-template-columns:1fr 60px;gap:8px;align-items:center;">
                <input id="loc-kr-cap-pt-range" class="vb-range" type="range" min="6" max="20" step="0.5" value="${locState.krCapPt}">
                <input id="loc-kr-cap-pt" type="number" min="6" max="24" step="0.5" class="gov-input" value="${locState.krCapPt}" style="padding:4px 6px;text-align:center;font-weight:700;">
              </div>
            </div>

            <!-- 미국 내용량 블록 -->
            <div id="loc-cap-block-US" class="loc-cap-block" style="margin-bottom:14px;">
              <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">미국 · 내용량</label>
              <textarea id="loc-us-cap-text" class="gov-input" rows="2" style="padding:7px 10px;font-size:12px;line-height:1.4;margin-bottom:8px;resize:vertical;">${locState.usCapText}</textarea>
              <div style="font-size:11px;color:#344054;margin-bottom:2px;">영어</div>
              <div style="display:grid;grid-template-columns:1fr 60px;gap:8px;align-items:center;">
                <input id="loc-us-cap-pt-range" class="vb-range" type="range" min="6" max="20" step="0.5" value="${locState.usCapPt}">
                <input id="loc-us-cap-pt" type="number" min="6" max="24" step="0.5" class="gov-input" value="${locState.usCapPt}" style="padding:4px 6px;text-align:center;font-weight:700;">
              </div>
            </div>

            <!-- 일본 내용량 블록 -->
            <div id="loc-cap-block-JP" class="loc-cap-block" style="margin-bottom:14px;">
              <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">일본 · 식품 분류명</label>
              <input id="loc-jp-class" class="gov-input" value="${locState.jpClass}" style="padding:7px 10px;margin-bottom:8px;">
              <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">일본 · 내용량 (内容量)</label>
              <input id="loc-jp-cap-text" class="gov-input" value="${locState.jpCapText}" style="padding:7px 10px;margin-bottom:8px;">
              <div style="font-size:11px;color:#344054;margin-bottom:2px;">일본어</div>
              <div style="display:grid;grid-template-columns:1fr 60px;gap:8px;align-items:center;">
                <input id="loc-jp-cap-pt-range" class="vb-range" type="range" min="6" max="20" step="0.5" value="${locState.jpCapPt}">
                <input id="loc-jp-cap-pt" type="number" min="6" max="24" step="0.5" class="gov-input" value="${locState.jpCapPt}" style="padding:4px 6px;text-align:center;font-weight:700;">
              </div>
            </div>
          </div>
        </div>

        <!-- 기능성 표현 -->
        <div style="margin-top:8px;">
          <label class="gov-label" style="font-size:11.5px;color:#344054;margin-bottom:4px;">기능성 표현 (없으면 비움)</label>
          <input id="loc-claim" class="gov-input" value="${locState.claim}" placeholder="예: 체지방 감소에 도움을 줄 수 있음" style="padding:7px 10px;">
        </div>

      </div>

      <!-- 우측: 한국 · 미국 · 일본 3단 실시간 시뮬레이션 -->
      <div class="gov-result" style="position:sticky; top:96px;">
        <div id="loc-sim-out" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; align-items:start;"></div>
      </div>
    </div>`;

  const $ = id => el.querySelector('#' + id);

  const renderSimulations = () => {
    const targets = [
      { code: 'KR', lang: 'ko', title: '국문' },
      { code: 'US', lang: 'en', title: '영문' },
      { code: 'JP', lang: 'ja', title: '일문' },
    ];

    $('loc-sim-out').innerHTML = targets.map(t => {
      const svg = renderLocalizedPackageSvg(locState, t.code);
      return `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div>
            <b style="font-size:14px; font-weight:700; color:#101820; display:block;">${t.title}</b>
          </div>
          <div style="display:flex; justify-content:center; align-items:center; width:100%; min-height:480px;">
            ${svg}
          </div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <button type="button" class="btn btn-outline btn-xs loc-download-pdf" data-country="${t.code}" style="flex:1; justify-content:center; font-size:11px; padding:7px 0;">
              ⬇ .PDF 다운로드
            </button>
            <button type="button" class="btn btn-primary btn-xs loc-download-ai" data-country="${t.code}" style="flex:1; justify-content:center; font-size:11px; padding:7px 0;">
              ⬇ .AI 다운로드
            </button>
          </div>
        </div>`;
    }).join('');

    // .PDF 다운로드 이벤트 바인딩
    $('loc-sim-out').querySelectorAll('.loc-download-pdf').forEach(btn => {
      btn.onclick = async () => {
        await ensureAiFontsLoaded();
        const country = btn.dataset.country;
        const svg = renderLocalizedPackageSvg(locState, country);
        const safeName = `${locState.lineName}_${locState.productName || 'Package'}`.replace(/\s+/g, '_');
        const blob = buildPdfBlob(svg, `VITALBEAUTIE_Localizer_${country}_${safeName}`);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `VITALBEAUTIE_Localizer_${country}_${safeName}_${locState.w}x${locState.h}mm.pdf`;
        a.click();
        showToast(`${country} 버전 Adobe PDF (.pdf) 인쇄 교정용 파일이 다운로드되었습니다`);
      };
    });

    // .ai 다운로드 이벤트 바인딩
    $('loc-sim-out').querySelectorAll('.loc-download-ai').forEach(btn => {
      btn.onclick = async () => {
        await ensureAiFontsLoaded();
        const country = btn.dataset.country;
        const svg = renderLocalizedPackageSvg(locState, country);
        const safeName = `${locState.lineName}_${locState.productName || 'Package'}`.replace(/\s+/g, '_');
        const blob = buildIllustratorAiBlob(svg, `VITALBEAUTIE_Localizer_${country}_${safeName}`);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `VITALBEAUTIE_Localizer_${country}_${safeName}_${locState.w}x${locState.h}mm.ai`;
        a.click();
        showToast(`${country} 버전 Adobe Illustrator (.ai) 파일이 다운로드되었습니다`);
      };
    });
  };

  const applyLocDefaults = (newLogic = locState.logic, newType = locState.type) => {
    locState.logic = newLogic;
    locState.type = newType;

    el.querySelectorAll('#loc-logic-tabs .lf-inline-tab').forEach(b => b.classList.toggle('active', b.dataset.logic === locState.logic));
    el.querySelectorAll('#loc-type-tabs .lf-inline-tab').forEach(b => b.classList.toggle('active', b.dataset.type === locState.type));

    const logicGroup = LOC_DEFAULTS[locState.logic] || LOC_DEFAULTS.metagreen;
    const d = logicGroup[locState.type] || logicGroup.hff;
    const isIb = locState.logic === 'innerbeauty';
    const isHff = locState.type === 'hff';

    $('loc-w').value = d.w;
    $('loc-h').value = d.h;
    $('loc-pantone').value = d.pantone;
    $('loc-lname').value = d.lineName;
    $('loc-pname').value = d.productName;
    $('loc-ing').value = d.ingredient;
    $('loc-claim').value = d.claim || '';
    $('loc-kr-cap-text').value = d.krCapText;
    $('loc-us-cap-text').value = d.usCapText;
    $('loc-jp-class').value = d.jpClass;
    $('loc-jp-cap-text').value = d.jpCapText;

    $('loc-kr-pt').value = d.krTitlePt;
    $('loc-kr-pt-range').value = d.krTitlePt;
    $('loc-en-pt').value = d.enTitlePt;
    $('loc-en-pt-range').value = d.enTitlePt;
    $('loc-ja-pt').value = d.jaTitlePt;
    $('loc-ja-pt-range').value = d.jaTitlePt;
    $('loc-dietary-pt').value = d.dietaryPt;
    $('loc-dietary-pt-range').value = d.dietaryPt;

    if (isIb) {
      $('loc-ib-benefit').value = d.benefit || 'SHINE & YOUTHFUL';
      $('loc-ib-points').value = d.points || '';
      $('loc-ib-footnote').value = d.footnote || '';
    }

    $('loc-ib-presets').style.display = isIb ? 'block' : 'none';
    $('loc-ib-fields').style.display = isIb ? 'block' : 'none';
    $('loc-pantone-title').textContent = isIb ? '3. 포인트 Pantone' : '3. 배경 Pantone';
    $('loc-lname-label').textContent = isIb ? '라인명 · Bold' : '라인명 · Bold';
    $('loc-pname-label').textContent = isIb ? '제품명 · Medium' : '제품명 · Light';
    $('loc-ing-label').textContent = isHff
      ? '원재료명 (제품명 바로 아래 · 1/2 크기)'
      : '원료명 및 함량 (14pt · 하단 기입)';
    $('loc-kr-cap-label').textContent = isHff ? '한국 · 건강기능식품' : '한국 · 일반식품';

    // 이너뷰티 일반식품일 때는 내용량과 원재료명 입력 위치를 바꿔서 표시
    const bottomContainer = $('loc-bottom-fields-container');
    const ingSection = $('loc-ing-section');
    const capSection = $('loc-cap-section');
    if (bottomContainer && ingSection && capSection) {
      if (isIb && !isHff) {
        bottomContainer.appendChild(capSection);
        bottomContainer.appendChild(ingSection);
      } else {
        bottomContainer.appendChild(ingSection);
        bottomContainer.appendChild(capSection);
      }
    }

    syncStateFromInputs();
  };

  const syncStateFromInputs = () => {
    locState.w = parseFloat($('loc-w').value) || 70.6;
    locState.h = parseFloat($('loc-h').value) || 119.9;
    locState.lineName = $('loc-lname').value.trim();
    locState.productName = $('loc-pname').value.trim();
    locState.ingredient = $('loc-ing').value.trim();
    locState.claim = $('loc-claim').value.trim();

    if ($('loc-ib-benefit')) {
      const upperBen = $('loc-ib-benefit').value.toUpperCase();
      if ($('loc-ib-benefit').value !== upperBen) $('loc-ib-benefit').value = upperBen;
      locState.benefit = upperBen.trim();
    }
    if ($('loc-ib-points')) locState.points = $('loc-ib-points').value;
    if ($('loc-ib-footnote')) locState.footnote = $('loc-ib-footnote').value.trim();

    locState.krCapText = $('loc-kr-cap-text').value.trim();
    locState.usCapText = $('loc-us-cap-text').value;
    locState.jpClass = $('loc-jp-class').value.trim();
    locState.jpCapText = $('loc-jp-cap-text').value.trim();

    const pmsRes = resolvePantoneInput($('loc-pantone').value);
    locState.pantone = pmsRes.code;
    locState.pantoneHex = pmsRes.hex;
    $('loc-pantone-swatch').style.background = pmsRes.hex;

    locState.krTitlePt = parseFloat($('loc-kr-pt').value) || 22;
    locState.enTitlePt = parseFloat($('loc-en-pt').value) || 15.5;
    locState.jaTitlePt = parseFloat($('loc-ja-pt').value) || 22;
    locState.dietaryPt = parseFloat($('loc-dietary-pt').value) || 12;

    locState.krCapPt = parseFloat($('loc-kr-cap-pt').value) || 10;
    locState.usCapPt = parseFloat($('loc-us-cap-pt').value) || 10;
    locState.jpCapPt = parseFloat($('loc-jp-cap-pt').value) || 10;

    renderSimulations();
  };

  // 슬라이더 <-> 숫자 인풋 양방향 바인딩
  const bindPair = (rangeId, numId, stateKey) => {
    const rEl = $(rangeId);
    const nEl = $(numId);
    if (!rEl || !nEl) return;
    rEl.oninput = e => {
      nEl.value = e.target.value;
      locState[stateKey] = parseFloat(e.target.value) || 10;
      renderSimulations();
    };
    nEl.oninput = e => {
      rEl.value = e.target.value;
      locState[stateKey] = parseFloat(e.target.value) || 10;
      renderSimulations();
    };
  };

  // 라인명·제품명 크기 바인딩
  bindPair('loc-kr-pt-range', 'loc-kr-pt', 'krTitlePt');
  bindPair('loc-en-pt-range', 'loc-en-pt', 'enTitlePt');
  bindPair('loc-ja-pt-range', 'loc-ja-pt', 'jaTitlePt');
  bindPair('loc-dietary-pt-range', 'loc-dietary-pt', 'dietaryPt');

  // 내용량 크기 바인딩
  bindPair('loc-kr-cap-pt-range', 'loc-kr-cap-pt', 'krCapPt');
  bindPair('loc-us-cap-pt-range', 'loc-us-cap-pt', 'usCapPt');
  bindPair('loc-jp-cap-pt-range', 'loc-jp-cap-pt', 'jpCapPt');

  [
    'loc-w', 'loc-h', 'loc-pantone', 'loc-lname', 'loc-pname', 'loc-ing', 'loc-claim',
    'loc-ib-benefit', 'loc-ib-points', 'loc-ib-footnote',
    'loc-kr-cap-text', 'loc-us-cap-text', 'loc-jp-class', 'loc-jp-cap-text',
  ].forEach(id => {
    const inputEl = $(id);
    if (inputEl) inputEl.oninput = syncStateFromInputs;
  });

  // 라인 구분 탭 전환 (메타그린 vs 이너뷰티)
  el.querySelectorAll('#loc-logic-tabs .lf-inline-tab').forEach(btn => {
    btn.onclick = () => {
      applyLocDefaults(btn.dataset.logic, locState.type);
    };
  });

  // 이너뷰티 프리셋 버튼 클릭 이벤트
  el.querySelectorAll('.loc-ib-preset-btn').forEach(btn => {
    btn.onclick = () => {
      const p = LOC_IB_PRESETS[btn.dataset.ibPreset];
      if (!p) return;
      $('loc-w').value = p.w;
      $('loc-h').value = p.h;
      $('loc-pantone').value = p.pantone;
      $('loc-lname').value = p.lineName;
      $('loc-pname').value = p.productName;
      $('loc-ib-benefit').value = p.benefit;
      $('loc-ib-points').value = p.points;
      $('loc-ib-footnote').value = p.footnote;
      $('loc-ing').value = p.ingredient;
      $('loc-kr-cap-text').value = p.krCapText;
      $('loc-us-cap-text').value = p.usCapText;
      $('loc-jp-cap-text').value = p.jpCapText;
      $('loc-kr-pt').value = p.krTitlePt;
      $('loc-kr-pt-range').value = p.krTitlePt;
      $('loc-en-pt').value = p.enTitlePt;
      $('loc-en-pt-range').value = p.enTitlePt;
      $('loc-ja-pt').value = p.jaTitlePt;
      $('loc-ja-pt-range').value = p.jaTitlePt;
      syncStateFromInputs();
    };
  });

  // 제품 유형 탭 전환 (건강기능식품 vs 일반식품)
  el.querySelectorAll('#loc-type-tabs .lf-inline-tab').forEach(btn => {
    btn.onclick = () => {
      applyLocDefaults(locState.logic, btn.dataset.type);
    };
  });

  // 내용량 국가 탭 전환 (ALL / KR / US / JP)
  el.querySelectorAll('#loc-cap-tabs .lf-inline-tab').forEach(btn => {
    btn.onclick = () => {
      el.querySelectorAll('#loc-cap-tabs .lf-inline-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.capTab;
      locState.capTab = tab;
      const krBlock = $('loc-cap-block-KR');
      const usBlock = $('loc-cap-block-US');
      const jpBlock = $('loc-cap-block-JP');
      if (tab === 'ALL') {
        if (krBlock) krBlock.style.display = 'block';
        if (usBlock) usBlock.style.display = 'block';
        if (jpBlock) jpBlock.style.display = 'block';
      } else {
        if (krBlock) krBlock.style.display = tab === 'KR' ? 'block' : 'none';
        if (usBlock) usBlock.style.display = tab === 'US' ? 'block' : 'none';
        if (jpBlock) jpBlock.style.display = tab === 'JP' ? 'block' : 'none';
      }
    };
  });

  $('loc-upload').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const raw = await f.text();
    const res = parseKoreanPackageFile(raw, f.name);
    if (res && res.nodes.length) {
      locState.w = res.wMm;
      locState.h = res.hMm;
      $('loc-w').value = res.wMm;
      $('loc-h').value = res.hMm;
      const titleNode = res.nodes.find(n => n.role === 'title');
      if (titleNode) {
        const parts = titleNode.text.split(' ');
        locState.lineName = parts[0] || '메타그린';
        locState.productName = parts.slice(1).join(' ') || '슬림업';
        $('loc-lname').value = locState.lineName;
        $('loc-pname').value = locState.productName;
      }
      const ingNode = res.nodes.find(n => n.role === 'ingredient');
      if (ingNode) {
        locState.ingredient = ingNode.text;
        $('loc-ing').value = ingNode.text;
      }
      $('loc-file-status').innerHTML = `인식 완료: <b>${f.name}</b> (폭 ${res.wMm}mm × 높이 ${res.hMm}mm)`;
      renderSimulations();
      showToast(`「${f.name}」 규격 및 문안 인식 완료`);
    }
  };

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

