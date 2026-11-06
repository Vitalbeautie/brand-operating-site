/* ═══════════════════════════════════════════════════════════════
   Typography Page (VITALBEAUTIE Font System)
   불필요한 박스·라인 없이 2단 에디토리얼 레이아웃으로
   공식 영문(Raleway) / 국문(RIX-신고딕se-pro) / 웹 표준(Noto Sans KR) 표현
   ═══════════════════════════════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';

export function renderTypographyPage(container) {
  const brand = getBrand();
  if (!brand) return;

  container.innerHTML = `
    <section class="guide-section" id="section-typography" style="margin-bottom:80px;">
      <!-- Block 1: OFFICIAL TYPOGRAPHY SPECIMEN -->
      <div class="guide-block" id="block-typo-1">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">TYPOGRAPHY</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75; word-break:keep-all;">
            바이탈뷰티의 주요 영문 서체는 <b>‘Raleway’</b>를 사용하며, 한글 본문과 제목의 경우 <b>‘RIX-신고딕se-pro’</b>를 사용합니다.
            <br><br>
            웹 환경에서 시스템 폰트를 사용해야 할 경우 <b>‘Noto Sans KR(본고딕)’</b>을 권장합니다.
          </div>
        </div>

        <div class="block-visual-column">
          <img src="/assets/guidelines/pdf_p18_typography.png" alt="VITALBEAUTIE Typography Guidelines" style="width:100%; height:auto; display:block;" />
        </div>
      </div>

      <!-- Block 2: LIVE TYPE SIMULATOR -->
      <div class="guide-block" id="block-typo-2">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">TYPE SIMULATOR</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75; word-break:keep-all;">
            영문 메인(Raleway), 국문 패키지 마스터(RIX-신고딕se-pro), 웹 표준(Noto Sans KR)의 웨이트와 크기를 실시간으로 테스트합니다.
          </div>
        </div>

        <div class="block-visual-column">
          <div style="display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-family:var(--font-en); font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">FONT FAMILY</label>
              <select id="live-font" style="padding:8px 12px; border:1px solid #D5D8DE; font-size:12px; min-width:190px;">
                <option value="'Raleway', sans-serif">Raleway (영문 메인)</option>
                <option value="'RIX-신고딕se-pro', 'Noto Sans KR', sans-serif">RIX-신고딕se-pro (국문 메인)</option>
                <option value="'Noto Sans KR', sans-serif">Noto Sans KR (웹 표준)</option>
              </select>
            </div>

            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-family:var(--font-en); font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">WEIGHT</label>
              <select id="live-weight" style="padding:8px 12px; border:1px solid #D5D8DE; font-size:12px; min-width:140px;">
                <option value="300">Light (300)</option>
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">SemiBold (600)</option>
                <option value="700" selected>Bold (700)</option>
                <option value="800">ExtraBold (800)</option>
              </select>
            </div>

            <div style="display:flex; flex-direction:column; gap:4px; flex:1; min-width:180px;">
              <div style="display:flex; justify-content:space-between;">
                <label style="font-family:var(--font-en); font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">SIZE</label>
                <span id="live-size-value" style="font-family:var(--font-en); font-size:11px; font-weight:700; color:#101820;">28px</span>
              </div>
              <input type="range" class="range-slider" id="live-size" min="12" max="64" value="28" style="width:100%;" />
            </div>
          </div>

          <div style="margin-bottom:20px;">
            <input type="text" id="live-input" value="HIGH-PERFORMANCE WELLNESS, VITALBEAUTIE 바이탈뷰티 웰니스 루틴" style="width:100%; padding:10px 14px; font-size:13px; border:1px solid #D5D8DE; font-family:var(--font-ko);" />
          </div>

          <div id="live-preview-box" style="padding:20px 0; min-height:80px; display:flex; align-items:center; word-break:break-all; font-family:'Raleway', sans-serif; font-size:28px; font-weight:700; color:#101820; line-height:1.4;">
            HIGH-PERFORMANCE WELLNESS, VITALBEAUTIE 바이탈뷰티 웰니스 루틴
          </div>
        </div>
      </div>
    </section>
  `;

  setupLiveSimulator();
}

function setupLiveSimulator() {
  const fontSelect = document.getElementById('live-font');
  const weightSelect = document.getElementById('live-weight');
  const sizeSlider = document.getElementById('live-size');
  const sizeValue = document.getElementById('live-size-value');
  const input = document.getElementById('live-input');
  const preview = document.getElementById('live-preview-box');

  if (!preview) return;

  function update() {
    const font = fontSelect.value;
    const weight = weightSelect.value;
    const size = sizeSlider.value;
    const text = input.value || 'VITALBEAUTIE 바이탈뷰티';

    sizeValue.textContent = size + 'px';
    preview.style.fontFamily = font;
    preview.style.fontWeight = weight;
    preview.style.fontSize = size + 'px';
    preview.textContent = text;
  }

  fontSelect.addEventListener('change', update);
  weightSelect.addEventListener('change', update);
  sizeSlider.addEventListener('input', update);
  input.addEventListener('input', update);

  update();
}
