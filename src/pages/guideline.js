/* ═══════════════════════════════════════════════════════════════
   Brand Guideline Page: DESIGN GUIDE UNIFIED SCROLL
   WORDMARK → MONOGRAM → SLOGAN → BRAND COLOR → TYPOGRAPHY
   전체 디자인 가이드를 스크롤로 한 번에 탐색하며
   스크롤 위치에 따라 사이드바 해당 항목이 블랙+볼드로 실시간 하이라이트
   ═══════════════════════════════════════════════════════════════ */
import { copyToClipboard } from '../utils/helpers.js';
import { renderStrategyPage } from './strategy.js';
import { renderColorPage } from './colors.js';
import { renderTypographyPage } from './typography.js';
import { setDesignGuideScrollActive } from '../components/sidebar.js';
import { t } from '../utils/i18n.js';

export function renderGuidelinePage(container, targetSection = 'wordmark') {

  const incItems = [
    { label: t('다른 서체를 적용하지 마시오.', 'Do not apply unauthorized typefaces.'), img: '/assets/guidelines/wm_inc_1.png' },
    { label: t('테두리를 넣지 마시오.', 'Do not add outlines or strokes.'), img: '/assets/guidelines/wm_inc_2.png' },
    { label: t('색상을 변경하지 마시오.', 'Do not alter the designated colors.'), img: '/assets/guidelines/wm_inc_3.png' },
    { label: t('비례를 왜곡하지 마시오.', 'Do not distort the proportions.'), img: '/assets/guidelines/wm_inc_4.png' },
    { label: t('임의의 문자와 함께 사용하지 마시오.', 'Do not pair with arbitrary text.'), img: '/assets/guidelines/wm_inc_5.png' },
    { label: t('간격을 임의로 조정하지 마시오.', 'Do not modify letter spacing.'), img: '/assets/guidelines/wm_inc_6.png' },
    { label: t('라인으로 처리하지 마시오.', 'Do not render as an outline.'), img: '/assets/guidelines/wm_inc_7.png' },
    { label: t('기울여 사용하지 마시오.', 'Do not skew, tilt, or italicize.'), img: '/assets/guidelines/wm_inc_8.png' },
    { label: t('효과를 적용하지 마시오.', 'Do not apply drop shadows or effects.'), img: '/assets/guidelines/wm_inc_9.png' },
  ];

  const grayscaleTop = ['#E2E3E5', '#C8C9CC', '#AFB1B4', '#949699', '#7B7D80'];
  const grayscaleBot = ['#626467', '#4A4C4F', '#333538', '#1C1E21', '#050709'];

  container.innerHTML = `
    <!-- ════════════════════════════════════════════════════════
         SECTION 1: WORDMARK
         ════════════════════════════════════════════════════════ -->
    <section class="guide-section" id="section-wordmark" style="margin-bottom:80px; scroll-margin-top:80px;">
      <!-- Top Intro Header -->
      <div style="margin-bottom:48px;">
        <h2 style="font-family:var(--font-en); font-size:26px; font-weight:300; letter-spacing:2.5px; margin:0 0 18px 0; text-transform:uppercase; color:#101820;">
          WORDMARK
        </h2>
        <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:680px;">
          ${t(
            '바이탈뷰티 영문·국문 워드마크입니다. 형태는 그리드 데이터로만 축소·확대하고, 주변 1X 여백과 최소 크기를 지킵니다.<br>출처: VITALBEAUTIE BI Guidelines.',
            'Official English and Korean wordmarks of VITALBEAUTIE. Scale strictly using master vector grid data while preserving the 1X exclusion zone and minimum size.<br>Source: VITALBEAUTIE BI Guidelines.'
          )}
        </div>
      </div>

      <!-- Block 1: CORE WORDMARK -->
      <div class="guide-block" id="block-wm-1">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">CORE WORDMARK</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '바이탈뷰티의 기본 영문·국문 로고입니다. 로고타입의 형태를 임의로 바꾸면 본래 이미지가 손상되므로 반드시 표준 형태를 사용합니다.',
              'The primary English and Korean logotypes of VITALBEAUTIE. Always use the standard master artwork without any unauthorized modification.'
            )}
            <br><br>
            <span style="color:#7A808C; font-size:12.5px;">
              ${t(
                '원본은 BI 가이드 PDF 3쪽에서 추출했습니다. 벡터 AI 원본이 있으면 원천 데이터에 등록해 다운로드용으로 바꿀 수 있습니다.',
                'Extracted from page 3 of the official BI Guidelines PDF. Native vector .AI master files are available in the Asset Library.'
              )}
            </span>
          </div>
        </div>

        <div class="block-visual-column">
          <div>
            <!-- Top Row: English & Korean side by side (Only vertical center divider) -->
            <div style="display:grid; grid-template-columns:1fr 1fr;">
              <div style="padding:56px 32px 44px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-right:1px solid #ECEEF2;">
                <img src="/assets/logos/vitalbeautie_wordmark_en_black.png" alt="VITALBEAUTIE English" style="max-width:290px; width:82%; height:auto; display:block;" />
                <span style="font-family:var(--font-en); font-size:9.5px; letter-spacing:2px; color:#8C929E; margin-top:22px;">ENGLISH</span>
              </div>
              <div style="padding:56px 32px 44px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <img src="/assets/logos/vitalbeautie_wordmark_ko_black.png" alt="바이탈뷰티 Korean" style="max-width:190px; width:62%; height:auto; display:block;" />
                <span style="font-family:var(--font-en); font-size:9.5px; letter-spacing:2px; color:#8C929E; margin-top:22px;">KOREAN</span>
              </div>
            </div>
            <!-- Bottom Row: White on VITALBEAUTIE BLACK -->
            <div style="background:#101820; padding:54px 32px 42px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <img src="/assets/logos/vitalbeautie_wordmark_en_white.png" alt="White on VITALBEAUTIE BLACK" style="max-width:260px; width:65%; height:auto; display:block;" />
              <span style="font-family:var(--font-en); font-size:9.5px; letter-spacing:2px; color:rgba(255,255,255,0.48); margin-top:20px;">WHITE ON VITALBEAUTIE BLACK</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Block 2: EXCLUSION ZONE -->
      <div class="guide-block" id="block-wm-2">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">EXCLUSION ZONE</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '로고 타입은 명확히 인식시키기 위해 <b>1X 이상</b>을 깨끗한 공간으로 확보해야 합니다. 회색 표시 영역이 최소 여백입니다.',
              'To ensure clear visual recognition, maintain a minimum clear space of <b>at least 1X</b> around the wordmark. The shaded gray area indicates the minimum exclusion zone.'
            )}
            <br><br>
            <span style="color:#7A808C; font-size:12.5px;">
              ${t(
                '가시성·패밀리룩 도구는 이 기준인 워드마크 높이의 <b style="color:#101820;">100% (1X)</b>로 여백을 계산합니다.',
                'The Brand Visibility tool automatically calculates clear space as <b style="color:#101820;">100% (1X)</b> of the wordmark height.'
              )}
            </span>
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:flex; flex-direction:column; gap:32px; align-items:center;">
            <img src="/assets/guidelines/pdf_p5_grid.png" alt="Wordmark Grid System" style="max-width:680px; width:100%; height:auto; display:block;" />
            <img src="/assets/guidelines/pdf_p5_clearspace.png" alt="Wordmark Clear Space 1X & 20mm" style="max-width:680px; width:100%; height:auto; display:block;" />
          </div>
        </div>
      </div>

      <!-- Block 3: MINIMUM SIZE -->
      <div class="guide-block" id="block-wm-3">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">MINIMUM SIZE</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '영문 워드마크는 가로폭 기준 <b>20mm 이하</b>로 사용하지 않습니다. 국문 워드마크는 <b>30mm 이하</b>로 사용하지 않습니다. 그 이하에서는 가독성이 떨어지고 왜곡이 생길 수 있습니다.',
              'Do not reproduce the English wordmark smaller than <b>20mm in width</b>, or the Korean wordmark smaller than <b>30mm in width</b>, to prevent loss of legibility.'
            )}
            <br><br>
            <span style="color:#7A808C; font-size:12.5px;">
              ${t(
                '도구의 기본 판정은 영문 로고 20mm입니다. 국문 원고는 별도로 30mm를 적용해야 합니다.',
                'The default validation threshold is 20mm for the English wordmark and 30mm for the Korean wordmark.'
              )}
            </span>
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:grid; grid-template-columns:1fr 1fr;">
            <div style="padding:36px 24px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-right:1px solid #ECEEF2;">
              <img src="/assets/logos/vitalbeautie_wordmark_en_black.png" alt="English 20mm" style="height:16px; width:auto; display:block;" />
              <span style="font-family:var(--font-en); font-size:11px; color:#555; margin-top:12px;">English · 20mm</span>
            </div>
            <div style="padding:36px 24px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <img src="/assets/logos/vitalbeautie_wordmark_ko_black.png" alt="Korean 30mm" style="height:18px; width:auto; display:block;" />
              <span style="font-family:var(--font-en); font-size:11px; color:#555; margin-top:12px;">Korean · 30mm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Block 4: BACKGROUND USAGE -->
      <div class="guide-block" id="block-wm-4">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">BACKGROUND USAGE</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '한글·영문 로고는 <b>블랙과 화이트로만</b> 사용합니다. 색상 배경에서는 White Color를 사용합니다.<br><br>배경이 사진이거나 단색일 때는 Black 로고를, 짙은 명도나 복잡한 배경에서는 White Color 로고를 사용합니다. 자사몰 브랜드관 등 커뮤니케이션 툴은 Black 배경과 White Color 로고를 적용합니다.',
              'Both English and Korean wordmarks must be used strictly in <b>VITALBEAUTIE BLACK or White</b>. Always use the White wordmark on colored backgrounds.<br><br>Use the Black wordmark on light solid or photographic backgrounds, and the White wordmark on dark or complex backgrounds.'
            )}
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:flex; flex-direction:column; gap:28px;">
            <img src="/assets/guidelines/pdf_p8_wm_bg_usage.png" alt="Background Usage Rules" style="width:100%; height:auto; display:block;" />

            <!-- Flush 5x2 Grayscale Matrix -->
            <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:0;">
              ${grayscaleTop.map(bg => `
                <div style="background:${bg}; height:118px; display:flex; align-items:center; justify-content:center;">
                  <img src="/assets/logos/vitalbeautie_wordmark_en_black.png" alt="Black Wordmark" style="height:10px; width:auto; display:block;" />
                </div>
              `).join('')}
              ${grayscaleBot.map(bg => `
                <div style="background:${bg}; height:118px; display:flex; align-items:center; justify-content:center;">
                  <img src="/assets/logos/vitalbeautie_wordmark_en_white.png" alt="White Wordmark" style="height:10px; width:auto; display:block;" />
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Block 5: INCORRECT USAGE -->
      <div class="guide-block" id="block-wm-5">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">INCORRECT USAGE</h3>
          <div class="text-block-content" style="font-size:12.5px; color:#222; line-height:1.95;">
            ${incItems.map(i => `• ${i.label}`).join('<br>')}
            <br><br>
            <span style="color:#7A808C; font-size:12px; line-height:1.65; display:block;">
              ${t(
                '로고타입을 사용하는 경우에는 그리드 데이터를 이용해 정확하게 축소·확대해야 합니다.',
                'Always scale the logotype proportionally using the official master vector artwork.'
              )}
            </span>
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px 16px;">
            ${incItems.map(item => `
              <div>
                <img src="${item.img}" alt="${item.label}" style="width:100%; height:auto; display:block;" />
                <div style="font-size:11px; color:#666B75; margin-top:6px;">${item.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         SECTION 2: SYMBOL (MONOGRAM · LAB PROVEN)
         ════════════════════════════════════════════════════════ -->
    <section class="guide-section" id="section-monogram" style="margin-bottom:80px; scroll-margin-top:80px;">
      <!-- Top Intro Header -->
      <div style="margin-bottom:48px;">
        <h2 style="font-family:var(--font-en); font-size:26px; font-weight:300; letter-spacing:2.5px; margin:0 0 18px 0; text-transform:uppercase; color:#101820;">
          SYMBOL
        </h2>
        <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:680px; margin-bottom:14px;">
          ${t(
            '바이탈뷰티의 기본 심볼 LAB PROVEN입니다. 최신의 웰니스가 바이탈뷰티랩에서 과학적으로 검증되어 완성된다는 메시지를 담습니다.',
            'The official LAB PROVEN symbol of VITALBEAUTIE, signifying that modern wellness is scientifically verified and perfected at the VITALBEAUTIE Lab.'
          )}
        </div>
      </div>

      <!-- Block 1: CORE SYMBOL -->
      <div class="guide-block" id="block-mono-1">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">CORE SYMBOL</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '바이탈뷰티가 추구하는 최신의 웰니스(Lab-proven High Performance Wellness)는 바이탈뷰티랩에서 과학적으로 검증되어 완성된다는 메시지를 담습니다.',
              'Represents VITALBEAUTIE’s commitment to Lab-proven High Performance Wellness—scientifically formulated and verified at the V=B Laboratory.'
            )}
            <br><br>
            <span style="color:#7A808C; font-size:12.5px;">
              ${t('링 카피: Lab Solution by V=B Laboratory · cooperation development', 'Ring Copy: Lab Solution by V=B Laboratory · cooperation development')}
            </span>
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:grid; grid-template-columns:1fr 1fr; align-items:center;">
            <div style="padding:44px 24px; display:flex; align-items:center; justify-content:center; background:#ffffff;">
              <img src="/assets/logos/vitalbeautie_monogram_lab_proven_black.png" alt="LAB PROVEN Black" style="width:176px; height:176px; display:block;" />
            </div>
            <div style="padding:44px 24px; display:flex; align-items:center; justify-content:center; background:#101820; min-height:264px;">
              <img src="/assets/logos/vitalbeautie_monogram_lab_proven_white.png" alt="LAB PROVEN White" style="width:176px; height:176px; display:block;" />
            </div>
          </div>
        </div>
      </div>

      <!-- Block 2: SYSTEM -->
      <div class="guide-block" id="block-mono-2">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">SYSTEM</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '심볼마크의 시각상징 색상은 로고와 같은 VITALBEAUTIE BLACK입니다. 워드마크와 함께 쓰거나, 패키지·사진 위에서는 White color 배경 심볼을 사용합니다.',
              'The primary color of the symbol mark is VITALBEAUTIE BLACK, matching the wordmark. On packaging or photographic backgrounds, use the White background symbol.'
            )}
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:flex; align-items:center; justify-content:center; gap:36px; padding:36px 0;">
            <img src="/assets/logos/vitalbeautie_wordmark_en_black.png" alt="VITALBEAUTIE" style="height:17px; width:auto; display:block;" />
            <img src="/assets/logos/vitalbeautie_monogram_lab_proven_black.png" alt="LAB PROVEN" style="width:82px; height:82px; display:block;" />
          </div>
        </div>
      </div>

      <!-- Block 3: PLACEMENT GUIDE -->
      <div class="guide-block" id="block-mono-3">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">PLACEMENT GUIDE</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '제품 패키지에 적용할 경우 White color 배경 심볼을 사용합니다.<br><br>배경이 사진일 때 짙은 명도나 단색이면 White Color 배경 심볼을, 복잡한 사진이면 면적을 확보한 뒤 로고를 적용합니다.',
              'When applied to product packaging, use the White background symbol.<br><br>On dark or solid photographic backgrounds, apply the White symbol; on complex imagery, secure an uncluttered area before placing the symbol.'
            )}
          </div>
        </div>

        <div class="block-visual-column">
          <img src="/assets/guidelines/pdf_p17_sym_exception.png" alt="Symbol Placement Guide" style="width:100%; height:auto; display:block;" />
        </div>
      </div>

      <!-- Block 4: EXCLUSION ZONE -->
      <div class="guide-block" id="block-mono-4">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">EXCLUSION ZONE</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '정해진 형태의 변형을 지양하며, 시각상징이 다른 요소의 침해 없이 전달되도록 최소 여백을 지킵니다. 인쇄 최소 크기는 15mm입니다.',
              'Preserve the designated exclusion zone around the symbol so no other graphic elements intrude. The minimum print diameter is 15mm.'
            )}
          </div>
        </div>

        <div class="block-visual-column">
          <img src="/assets/guidelines/pdf_p13_sym_exclusion.png" alt="Symbol Exclusion Zone" style="width:100%; height:auto; display:block;" />
        </div>
      </div>

      <!-- Block 5: MINIMUM SIZE -->
      <div class="guide-block" id="block-mono-5">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">MINIMUM SIZE</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '로고의 가독성 확보를 위해 최소 크기 15mm보다 줄여서 사용하지 않습니다.',
              'To maintain legibility of the ring typography, never reproduce the symbol smaller than 15mm in diameter.'
            )}
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:flex; align-items:center; gap:22px; padding:18px 0 18px 40px;">
            <img src="/assets/logos/vitalbeautie_monogram_lab_proven_black.png" alt="Printed 15mm" style="width:58px; height:58px; display:block;" />
            <div style="width:1px; height:22px; background:#ECEEF2;"></div>
            <span style="font-family:var(--font-en); font-size:12px; color:#101820;">Printed: 15mm</span>
          </div>
        </div>
      </div>

      <!-- Block 6: INCORRECT USAGE -->
      <div class="guide-block" id="block-mono-6">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">INCORRECT USAGE</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.95;">
            ${t(
              '• 색상을 변경하지 마시오.<br>• 비례를 왜곡하지 마시오.<br>• 기울여 사용하지 마시오.<br>• 문자를 변경하지 마시오.',
              '• Do not alter the symbol colors.<br>• Do not distort proportions.<br>• Do not tilt or rotate.<br>• Do not modify the internal typography.'
            )}
          </div>
        </div>

        <div class="block-visual-column">
          <img src="/assets/guidelines/pdf_p14_sym_incorrect.png" alt="Symbol Incorrect Usage" style="width:100%; height:auto; display:block;" />
        </div>
      </div>

      <!-- Block 7: BACKGROUND -->
      <div class="guide-block" id="block-mono-7">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">BACKGROUND</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75;">
            ${t(
              '심볼 색상은 VITALBEAUTIE BLACK과 White입니다. 배경 명도에 따라 블랙 심볼 또는 화이트 배경 심볼을 고릅니다.',
              'The symbol is used strictly in VITALBEAUTIE BLACK or White. Select the Black or White symbol according to background luminance.'
            )}
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:flex; flex-direction:column; gap:36px;">
            <img src="/assets/guidelines/pdf_p15_sym_color.png" alt="Symbol Color" style="width:100%; height:auto; display:block;" />
            <img src="/assets/guidelines/pdf_p16_sym_bg_usage.png" alt="Symbol Background Usage" style="width:100%; height:auto; display:block;" />
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         SECTION 3: SLOGAN
         ════════════════════════════════════════════════════════ -->
    <div id="dg-mount-slogan"></div>

    <!-- ════════════════════════════════════════════════════════
         SECTION 4: BRAND COLOR
         ════════════════════════════════════════════════════════ -->
    <div id="dg-mount-colors"></div>

    <!-- ════════════════════════════════════════════════════════
         SECTION 5: TYPOGRAPHY
         ════════════════════════════════════════════════════════ -->
    <div id="dg-mount-typography"></div>
  `;

  // Mount Slogan, Color, Typography sections seamlessly
  const sloganMount = container.querySelector('#dg-mount-slogan');
  if (sloganMount) renderStrategyPage(sloganMount);

  const colorsMount = container.querySelector('#dg-mount-colors');
  if (colorsMount) renderColorPage(colorsMount);

  const typoMount = container.querySelector('#dg-mount-typography');
  if (typoMount) renderTypographyPage(typoMount);

  // Copy code buttons
  const copyWmBtn = container.querySelector('#btn-copy-wm-code');
  if (copyWmBtn) {
    copyWmBtn.onclick = () => copyToClipboard('VITALBEAUTIE WORDMARK · Clearspace 1X · Min 20mm(EN)/30mm(KO) · #101820 / #FFFFFF');
  }
  const copySymBtn = container.querySelector('#btn-copy-sym-code');
  if (copySymBtn) {
    copySymBtn.onclick = () => copyToClipboard('VITALBEAUTIE SYMBOL (LAB PROVEN) · Min 15mm · #101820 / #FFFFFF');
  }

  // Setup Scroll-Spy for live black+bold active highlighting
  setupDesignGuideScrollSpy();

  // Initial scroll if a specific section was targeted
  const targetIdMap = {
    wordmark: 'section-wordmark',
    monogram: 'section-monogram',
    slogan: 'section-slogan',
    colors: 'section-colors',
    typography: 'section-typography',
  };
  const targetId = targetIdMap[targetSection];
  if (targetId && targetSection !== 'wordmark') {
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  } else if (targetSection === 'wordmark') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Scroll-Spy: 스크롤 위치를 추적하여
 * 현재 화면에 보이는 Design Guide 섹션 및 서브 블록을
 * 사이드바에 실시간으로 블랙 글씨 + 볼드 처리 (#000000, 700)
 */
function setupDesignGuideScrollSpy() {
  if (window.__dgScrollSpy) {
    window.removeEventListener('scroll', window.__dgScrollSpy);
  }

  const SECTIONS = [
    { id: 'section-wordmark', path: '/guideline/wordmark' },
    { id: 'section-monogram', path: '/guideline/monogram' },
    { id: 'section-slogan', path: '/strategy' },
    { id: 'section-colors', path: '/colors' },
    { id: 'section-typography', path: '/typography' },
  ];

  const BLOCKS = [
    { id: 'block-wm-1', path: '/guideline/wordmark' },
    { id: 'block-wm-2', path: '/guideline/wordmark' },
    { id: 'block-wm-3', path: '/guideline/wordmark' },
    { id: 'block-wm-4', path: '/guideline/wordmark' },
    { id: 'block-wm-5', path: '/guideline/wordmark' },
    { id: 'block-mono-1', path: '/guideline/monogram' },
    { id: 'block-mono-2', path: '/guideline/monogram' },
    { id: 'block-mono-3', path: '/guideline/monogram' },
    { id: 'block-mono-4', path: '/guideline/monogram' },
    { id: 'block-mono-5', path: '/guideline/monogram' },
    { id: 'block-mono-6', path: '/guideline/monogram' },
    { id: 'block-mono-7', path: '/guideline/monogram' },
    { id: 'block-slogan-1', path: '/strategy' },
    { id: 'block-slogan-2', path: '/strategy' },
    { id: 'block-color-main', path: '/colors' },
    { id: 'block-color-product', path: '/colors' },
    { id: 'block-typo-en', path: '/typography' },
    { id: 'block-typo-kr', path: '/typography' },
    { id: 'block-typo-jp', path: '/typography' },
  ];

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const triggerPoint = 160;
        let activePath = '/guideline/wordmark';

        // Check if user scrolled near the bottom of the page
        const scrollBottom = window.innerHeight + window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        if (docHeight - scrollBottom < 80) {
          activePath = '/typography';
        } else {
          for (const s of SECTIONS) {
            const el = document.getElementById(s.id);
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (rect.top <= triggerPoint) {
              activePath = s.path;
            }
          }
        }

        let activeBlockId = null;
        for (const b of BLOCKS) {
          const el = document.getElementById(b.id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPoint + 60 && b.path === activePath) {
            activeBlockId = b.id;
          }
        }

        setDesignGuideScrollActive(activePath, activeBlockId);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.__dgScrollSpy = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial trigger after layout settles
  setTimeout(onScroll, 60);
}
