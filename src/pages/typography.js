/* ═══════════════════════════════════════════════════════════════
   Typography Page (AP Beauty Brand Guideline Style)
   - 영문 (ENGLISH TYPOGRAPHY | RALEWAY)
   - 국문 (KOREAN TYPOGRAPHY | RIX-신고딕)
   - 일문 (JAPANESE TYPOGRAPHY | NOTO SANS JP)
   3개 언어별 서체 시스템을 독립된 에디토리얼 2단 블록으로 분리하고,
   각 블록마다 실시간 SIZE 슬라이더 · WEIGHT 버튼 · 다크/라이트 반전 · 정렬 토글 및
   웨이트별 스페시멘 그리드를 제공
   ═══════════════════════════════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';
import { t } from '../utils/i18n.js';

const TYPEFACE_SECTIONS = [
  {
    id: 'block-typo-en',
    key: 'en',
    title: 'ENGLISH TYPOGRAPHY | RALEWAY',
    fontFamily: "'Raleway', -apple-system, BlinkMacSystemFont, sans-serif",
    descKr:
      '지정 서체는 브랜드 이미지를 일관되게 유지하고 다른 브랜드 요소와 조화롭게 구성하기 위해 선정된 영문 전용 서체입니다. 브랜드 이미지를 전달하는 헤드라인, 타이틀, 핵심 문구 및 글로벌(US) 패키지 표기 등 주요 텍스트에 사용하며, 적용 항목의 성격에 따라 적절한 두께를 선택하여 사용할 수 있습니다.',
    descEn:
      'Raleway is the official English typeface selected to maintain a consistent brand image and harmonize with all VITALBEAUTIE visual elements. It is used across headlines, titles, key slogans, and global US packaging. Select the appropriate weight according to the hierarchy of the application.',
    sampleText: 'HIGH-PERFORMANCE WELLNESS, VITALBEAUTIE',
    weights: [
      { label: 'Light', weight: 300, specTitle: 'Raleway Light' },
      { label: 'Regular', weight: 400, specTitle: 'Raleway Regular', defaultActive: true },
      { label: 'Medium', weight: 500, specTitle: 'Raleway Medium' },
      { label: 'Bold', weight: 700, specTitle: 'Raleway Bold' },
    ],
    specimenLines: [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz',
      '1234567890!@#$%^&*()_+',
    ],
  },
  {
    id: 'block-typo-kr',
    key: 'kr',
    title: 'KOREAN TYPOGRAPHY | RIX-신고딕',
    fontFamily: "'RIX-신고딕se-pro', 'Noto Sans KR', 'Pretendard', sans-serif",
    descKr:
      '지정 서체는 브랜드 이미지를 일관되게 유지하고 다른 브랜드 요소와 조화롭게 구성하기 위해 선정된 국문 전용 서체입니다. 단상자 전면 라인명(Bold), 제품명(Light), 원재료명 등 패키지 및 주요 국문 텍스트에 사용하며, 웹 환경에서는 Noto Sans KR(본고딕)과 호환하여 적절한 두께를 선택해 사용할 수 있습니다.',
    descEn:
      'RIX-SinGothic (web standard: Noto Sans KR) is the official Korean typeface designed to convey scientific trust and high legibility across Korean packaging (Line Name Bold, Product Name Light, Ingredients) and digital communications.',
    sampleText: '진정한 아름다움은 내면에서 가꾸어 외면으로 나타납니다',
    weights: [
      { label: 'Light', weight: 300, specTitle: 'RIX-신고딕 Light' },
      { label: 'Regular', weight: 400, specTitle: 'RIX-신고딕 Regular', defaultActive: true },
      { label: 'Medium', weight: 500, specTitle: 'RIX-신고딕 Medium' },
      { label: 'Bold', weight: 700, specTitle: 'RIX-신고딕 Bold' },
    ],
    specimenLines: [
      '가나다라마바사아자차카타파하',
      '아야어여오요우유으이 바이탈뷰티 웰니스 루틴',
      '1234567890!@#$%^&*()_+',
    ],
  },
  {
    id: 'block-typo-jp',
    key: 'jp',
    title: 'JAPANESE TYPOGRAPHY | NOTO SANS JP',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Noto Sans KR', sans-serif",
    descKr:
      '지정 서체는 일본(CAA) 글로벌 패키지 및 일본 현지 커뮤니케이션 매체에서 바이탈뷰티의 브랜드 아이덴티티를 일관되게 유지하기 위해 선정된 일문 전용 서체입니다. 가타카나·히라가나·한자 혼용 시에도 모던하고 균형 잡힌 비례감을 유지하며, 적용 항목의 위계에 따라 두께를 선택하여 사용할 수 있습니다.',
    descEn:
      'Noto Sans JP is the official Japanese typeface selected for Japanese (CAA) packaging localization and regional brand communications. It maintains balanced proportions across Katakana, Hiragana, and Kanji.',
    sampleText: '内面から輝く真の美しさと健やかなウェルネスライフ',
    weights: [
      { label: 'Light', weight: 300, specTitle: 'Noto Sans JP Light' },
      { label: 'Regular', weight: 400, specTitle: 'Noto Sans JP Regular', defaultActive: true },
      { label: 'Medium', weight: 500, specTitle: 'Noto Sans JP Medium' },
      { label: 'Bold', weight: 700, specTitle: 'Noto Sans JP Bold' },
    ],
    specimenLines: [
      'あいうえおかきくけこさしすせそたちつてと',
      'アイウエオカキクケコサシスセソ 美と健康の科学',
      '1234567890!@#$%^&*()_+',
    ],
  },
];

export function renderTypographyPage(container) {
  const brand = getBrand();
  if (!brand || !container) return;

  const blocksHtml = TYPEFACE_SECTIONS.map(sec => {
    const defaultW = sec.weights.find(w => w.defaultActive) || sec.weights[1];
    return `
      <div class="guide-block" id="${sec.id}" style="padding-bottom:68px; border-bottom:1px solid #ECEEF2;">
        <!-- Left Column: Title & Description -->
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.4px; color:#101820; margin-bottom:10px;">
            ${sec.title}
          </h3>
          <div class="text-block-content" style="font-size:13px; color:#222222; line-height:1.8; word-break:keep-all;">
            ${t(sec.descKr, sec.descEn)}
          </div>
        </div>

        <!-- Right Column: AP Beauty Interactive Type Tester & Weight Specimens -->
        <div class="block-visual-column" data-typo-tester="${sec.key}">
          <!-- Interactive Tester Box -->
          <div class="ap-typo-box" style="border:1px solid #ECEEF2; background:#F9FAFC; transition:background 0.2s ease, color 0.2s ease;">
            <!-- Top Control Toolbar -->
            <div class="ap-typo-toolbar" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; padding:12px 20px; border-bottom:1px solid #ECEEF2; background:#F4F5F8;">
              <!-- SIZE Slider -->
              <div style="display:flex; align-items:center; gap:14px; min-width:230px;">
                <span style="font-family:var(--font-en); font-size:9.5px; font-weight:600; letter-spacing:1.2px; color:#555E70;">SIZE</span>
                <input type="range" class="ap-typo-size-slider" min="14" max="54" value="26" style="width:130px; accent-color:#101820; cursor:pointer;" />
                <span class="ap-typo-size-label" style="font-family:var(--font-en); font-size:11px; font-weight:500; color:#101820; min-width:34px;">26px</span>
              </div>

              <!-- WEIGHT Buttons -->
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-family:var(--font-en); font-size:9.5px; font-weight:600; letter-spacing:1.2px; color:#555E70; margin-right:4px;">WEIGHT</span>
                <div style="display:flex; border:1px solid #E1E4ED; background:#FFFFFF;">
                  ${sec.weights.map(w => `
                    <button type="button" class="ap-typo-weight-btn${w.defaultActive ? ' active' : ''}" data-weight="${w.weight}" style="padding:5px 12px; font-family:var(--font-en); font-size:10.5px; font-weight:${w.defaultActive ? '600' : '400'}; background:${w.defaultActive ? '#101820' : '#FFFFFF'}; color:${w.defaultActive ? '#FFFFFF' : '#555E70'}; border-right:1px solid #ECEEF2; cursor:pointer; transition:all 0.15s ease;">
                      ${w.label}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Contrast & Alignment Toggle Icons -->
              <div style="display:flex; align-items:center; gap:6px;">
                <button type="button" class="ap-typo-contrast-btn" title="${t('배경 반전 (다크/라이트)', 'Invert Background (Dark/Light)')}" style="width:28px; height:28px; border:1px solid #E1E4ED; background:#FFFFFF; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#101820;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor"></path>
                  </svg>
                </button>
                <button type="button" class="ap-typo-align-btn" title="${t('정렬 전환 (중앙/좌측)', 'Toggle Alignment (Center/Left)')}" style="width:28px; height:28px; border:1px solid #E1E4ED; background:#FFFFFF; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#101820;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="4" y1="7" x2="20" y2="7"></line>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                    <line x1="5" y1="17" x2="19" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Live Editable Preview Area -->
            <div class="ap-typo-preview" contenteditable="true" spellcheck="false" style="min-height:185px; padding:42px 32px; display:flex; align-items:center; justify-content:center; text-align:center; font-family:${sec.fontFamily}; font-size:26px; font-weight:${defaultW.weight}; color:#101820; line-height:1.45; letter-spacing:0.5px; outline:none; cursor:text;">
              ${sec.sampleText}
            </div>
          </div>

          <!-- 2-Column Weight Specimen Grid -->
          <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:34px 48px; margin-top:32px;">
            ${sec.weights.map(w => `
              <div style="font-family:${sec.fontFamily}; font-weight:${w.weight}; color:#101820;">
                <div style="font-size:15px; font-weight:${w.weight}; margin-bottom:12px; color:#101820;">
                  ${w.specTitle}
                </div>
                <div style="font-size:11.5px; line-height:1.85; letter-spacing:0.6px; color:#222222; word-break:break-all;">
                  ${sec.specimenLines.map(line => `<div>${line}</div>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <section class="guide-section" id="section-typography" style="margin-bottom:80px; scroll-margin-top:80px;">
      <!-- Top Intro Header -->
      <div style="margin-bottom:36px;">
        <h2 style="font-family:var(--font-en); font-size:26px; font-weight:300; letter-spacing:2.5px; margin:0 0 18px 0; text-transform:uppercase; color:#101820;">
          TYPOGRAPHY
        </h2>
        <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:720px; margin-bottom:14px;">
          ${t(
            '바이탈뷰티 영문(Raleway) · 국문(RIX-신고딕) · 일문(Noto Sans JP) 공식 서체 시스템 및 실시간 타이포그래피 테스터입니다.',
            'Official VITALBEAUTIE English (Raleway), Korean (RIX-SinGothic), and Japanese (Noto Sans JP) typeface system and interactive tester.'
          )}
        </div>
      </div>

      ${blocksHtml}
    </section>
  `;

  setupTypographyTesters(container);
}

function setupTypographyTesters(container) {
  container.querySelectorAll('[data-typo-tester]').forEach(tester => {
    const box = tester.querySelector('.ap-typo-box');
    const preview = tester.querySelector('.ap-typo-preview');
    const sizeSlider = tester.querySelector('.ap-typo-size-slider');
    const sizeLabel = tester.querySelector('.ap-typo-size-label');
    const weightBtns = tester.querySelectorAll('.ap-typo-weight-btn');
    const contrastBtn = tester.querySelector('.ap-typo-contrast-btn');
    const alignBtn = tester.querySelector('.ap-typo-align-btn');

    let isDark = false;
    let isLeftAlign = false;

    if (sizeSlider && preview) {
      sizeSlider.addEventListener('input', () => {
        const px = sizeSlider.value + 'px';
        preview.style.fontSize = px;
        if (sizeLabel) sizeLabel.textContent = px;
      });
    }

    weightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.getAttribute('data-weight');
        if (preview) preview.style.fontWeight = w;
        weightBtns.forEach(b => {
          const act = b === btn;
          b.classList.toggle('active', act);
          b.style.background = act ? '#101820' : '#FFFFFF';
          b.style.color = act ? '#FFFFFF' : '#555E70';
          b.style.fontWeight = act ? '600' : '400';
        });
      });
    });

    if (contrastBtn && box && preview) {
      contrastBtn.addEventListener('click', () => {
        isDark = !isDark;
        box.style.background = isDark ? '#101820' : '#F9FAFC';
        preview.style.color = isDark ? '#FFFFFF' : '#101820';
      });
    }

    if (alignBtn && preview) {
      alignBtn.addEventListener('click', () => {
        isLeftAlign = !isLeftAlign;
        preview.style.justifyContent = isLeftAlign ? 'flex-start' : 'center';
        preview.style.textAlign = isLeftAlign ? 'left' : 'center';
      });
    }
  });
}
