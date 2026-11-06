/* ═══════════════════════════════════════════════════════════════
   Slogan & Brand Story Page
   불필요한 박스·구분선 없이 2단 에디토리얼 레이아웃으로
   공식 슬로건 및 브랜드 스토리를 표현
   ═══════════════════════════════════════════════════════════════ */
import { getBrand } from '../utils/brand.js';

export function renderStrategyPage(container) {
  const brand = getBrand();
  if (!brand) return;

  container.innerHTML = `
    <section class="guide-section" id="section-slogan" style="margin-bottom:80px; scroll-margin-top:80px;">
      <!-- Top Intro Header -->
      <div style="margin-bottom:48px;">
        <h2 style="font-family:var(--font-en); font-size:26px; font-weight:300; letter-spacing:2.5px; margin:0 0 18px 0; text-transform:uppercase; color:#101820;">
          SLOGAN
        </h2>
        <div style="border-left:2px solid #D5D8DE; padding-left:16px; font-size:13.5px; color:#4A505C; line-height:1.7; max-width:680px; margin-bottom:14px;">
          바이탈뷰티 공식 슬로건과 브랜드 스토리입니다.
        </div>
      </div>
      <!-- Block 1: SLOGAN -->
      <div class="guide-block" id="block-slogan-1">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">SLOGAN</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75; word-break:keep-all;">
            공식 슬로건은 “HIGH-PERFORMANCE WELLNESS, VITALBEAUTIE”입니다. 브랜드 신념은 “진정한 아름다움은 내면에서 가꾸어 외면으로 나타난다”입니다.
          </div>
        </div>

        <div class="block-visual-column">
          <div style="padding:36px 20px; text-align:center;">
            <div style="font-family:var(--font-en); font-size:32px; font-weight:300; letter-spacing:3.5px; color:#101820; line-height:1.45; text-transform:uppercase;">
              HIGH-PERFORMANCE<br>
              WELLNESS, VITALBEAUTIE
            </div>
            <div style="font-family:var(--font-en); font-size:11.5px; font-weight:400; letter-spacing:3px; color:#333333; margin-top:22px; text-transform:uppercase;">
              LAB-PROVEN HIGH PERFORMANCE WELLNESS
            </div>
          </div>
        </div>
      </div>

      <!-- Block 2: BRAND STORY -->
      <div class="guide-block" id="block-slogan-2">
        <div class="block-text-column">
          <h3 class="block-title" style="font-family:var(--font-en); font-size:15px; font-weight:400; letter-spacing:1.5px;">BRAND STORY</h3>
          <div class="text-block-content" style="font-size:13px; color:#222; line-height:1.75; word-break:keep-all;">
            워드마크 주변에 슬로건을 붙일 때도 로고 1X 여백을 침범하지 않습니다. 임의의 문자와 함께 로고를 쓰지 않습니다.
          </div>
        </div>

        <div class="block-visual-column">
          <div style="font-family:var(--font-ko); font-size:14.5px; color:#101820; line-height:1.85; word-break:keep-all; display:flex; flex-direction:column; gap:24px;">
            <p style="margin:0;">
              바이탈뷰티는 “진정한 아름다움은 내면에서 가꾸어 외면으로 나타난다”는 신념으로 아모레퍼시픽의 70여년 피부과학 연구와 함께 시작했습니다.
            </p>
            <p style="margin:0;">
              브랜드가 추구하는 최신의 웰니스(Lab-proven High Performance Wellness)는 바이탈뷰티랩에서 과학적으로 검증되어 완성됩니다.
            </p>
            <p style="margin:0;">
              바이탈뷰티의 제품과 프로그램은 근본적인 신체 기능 강화를 기반으로 일상의 활력을 더하고, 외면까지 아름다워지는 웰니스 루틴을 완성합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}
