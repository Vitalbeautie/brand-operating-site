/* ═══════════════════════════════════════════════════════════════════════════
   AI / PDF / EPS / SVG Universal Parser & VITALBEAUTIE Master Artwork Engine
   - Exact recognition of VITALBEAUTIE original AI/PDF/EPS files (METAGREEN, INNERBEAUTY, NEWCOMMERCE)
   - Real-time PDF stream inspection (/Separation spot colors, /BaseFont fonts, ToUnicode CMaps, MediaBox)
   - Supports ArtiosCAD / Illustrator .eps dielines (%!PS-Adobe-3.0) & SVG-based .ai files
   - Authentic Layout Simulator VITALBEAUTIE Trapezoid Logo Tag renderer
   ═══════════════════════════════════════════════════════════════════════════ */

import * as pdfjsLib from 'pdfjs-dist';

try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch (e) {
  console.warn('pdfjs worker initialization fallback:', e);
}

export const PT_TO_MM = 25.4 / 72;

/**
 * Official VITALBEAUTIE Trapezoid Logo Tag & Top Line (100% Identical to Layout Simulator)
 */
export function renderVitalbeautieLogoTagSvg(panelX, panelY, panelW, tagHex = '#CEDC00', opts = {}) {
  const topLine = +(opts.topLineMm ?? 1.5);
  const maxAllowedTagW = Math.max(20, panelW - 4);
  const rawTagWTop = +(opts.tagWTop ?? 43.59);
  const tagWTop = Math.min(rawTagWTop, maxAllowedTagW);
  const ratio = tagWTop / 43.59;
  const tagWBot = +(39.55 * ratio).toFixed(2);
  const tagH = +((opts.tagH ?? 6.47) * ratio).toFixed(2);
  const tagY0 = +(topLine * 0.78).toFixed(2);
  const tagY1 = +(tagY0 + tagH).toFixed(2);
  const offsetX = +(opts.tagOffsetX ?? 0);

  const tx0 = +((panelW - tagWTop) / 2 + offsetX).toFixed(2);
  const tx1 = +(tx0 + tagWTop).toFixed(2);
  const bx0 = +((panelW - tagWBot) / 2 + offsetX).toFixed(2);
  const bx1 = +(bx0 + tagWBot).toFixed(2);

  const logoScale = tagWTop / (123.55 * PT_TO_MM);
  const logoScaleY = ((opts.tagH ?? 6.47) / 6.47) * logoScale;
  const logoTx = +((panelX + tx0) - 229.93 * PT_TO_MM * logoScale).toFixed(3);
  const logoTy = +((panelY + tagY0) - 283.61 * PT_TO_MM * logoScaleY).toFixed(3);

  const p1x = +(panelX + tx0).toFixed(2);
  const p1y = +(panelY + tagY0).toFixed(2);
  const p2x = +(panelX + bx0).toFixed(2);
  const p2y = +(panelY + tagY1).toFixed(2);
  const p3x = +(panelX + bx1).toFixed(2);
  const p3y = +(panelY + tagY1).toFixed(2);
  const p4x = +(panelX + tx1).toFixed(2);
  const p4y = +(panelY + tagY0).toFixed(2);

  return `
    <g class="vb-official-logo-tag">
      <polygon points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}" fill="${tagHex}"/>
      <rect x="${panelX.toFixed(2)}" y="${panelY.toFixed(2)}" width="${panelW.toFixed(2)}" height="${topLine.toFixed(2)}" fill="${tagHex}"/>
      <g transform="translate(${logoTx} ${logoTy}) scale(${(PT_TO_MM * logoScale).toFixed(5)} ${(PT_TO_MM * logoScaleY).toFixed(5)})" fill="#1D1D1B">
        <path d="m305.17,288.82l-.13-.3-.12.3-3.86,9.04-.04.09h1.13l1.07-2.51c.04-.08.12-.14.21-.14h3.21c.09,0,.18.06.21.14l1.02,2.51h1.2l-3.91-9.13Zm-.1,2.32c1.2,2.88,1.23,2.96,1.16,3.08-.04.06-.11.1-.19.1h-2.04c-.07,0-.15-.04-.18-.1-.04-.06-.05-.14-.02-.22l1.19-2.86.04-.09.04.09Z"/>
        <polygon points="253.47 288.83 251.29 294.18 249.03 288.83 247.01 288.83 251.32 298.37 255.43 288.83 253.47 288.83"/>
        <rect x="257.31" y="288.83" width="1.89" height="9.16"/>
        <polygon points="260.95 288.83 260.95 290.58 263.5 290.58 263.5 297.99 265.39 297.99 265.39 290.58 267.93 290.58 267.93 288.83 260.95 288.83"/>
        <polygon points="272.26 288.45 268.04 297.99 270 297.99 272.23 292.62 274.44 297.99 276.46 297.99 272.26 288.45"/>
        <polygon points="279.63 296.24 279.63 288.83 277.74 288.83 277.74 297.99 282.33 297.99 284.1 296.24 279.63 296.24"/>
        <path d="m290.67,293.07c-.08-.02-.14-.09-.15-.18,0-.09.04-.17.11-.21.47-.24.98-.71.98-1.62,0-1.4-.96-2.23-2.57-2.23h-3.15v9.12h3.4c1.87,0,2.98-.99,2.98-2.66,0-1.1-.55-1.91-1.61-2.21m-1.71-.5h-1.8c-.12,0-.21-.09-.21-.21v-2.45c0-.12.09-.21.21-.21h1.8c1.05,0,1.59.47,1.59,1.4s-.53,1.47-1.59,1.47m-2.01,1c0-.12.09-.21.21-.21h1.98c1.29,0,2.04.68,2.04,1.87s-.68,1.85-1.97,1.85h-2.05c-.12,0-.21-.09-.21-.21v-3.29Z"/>
        <path d="m295.43,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/>
        <path d="m316.06,288.83v5.88c0,1.59-.8,2.43-2.33,2.43s-2.34-.84-2.34-2.43v-5.88h-1.07v5.96c0,2.06,1.28,3.28,3.42,3.28s3.4-1.23,3.4-3.28v-5.96h-1.08Z"/>
        <path d="m318.66,288.83v.91h2.61c.11,0,.21.09.21.21v8h1.07v-8c0-.12.09-.21.21-.21h2.61v-.91h-6.71Z"/>
        <rect x="326.96" y="288.83" width="1.07" height="9.12"/>
        <path d="m332.19,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/>
      </g>
    </g>
  `;
}

/**
 * Render standalone VITALBEAUTIE vector wordmark centered at (cx, cy) (for TOP panel logo, etc.)
 */
export function renderStandaloneVitalbeautieWordmarkSvg(cx, cy, targetW = 36, fill = '#FFFFFF') {
  const logoScale = targetW / (90.4 * PT_TO_MM);
  const logoTx = +(cx - (247.01 + 45.2) * PT_TO_MM * logoScale).toFixed(3);
  const logoTy = +(cy - 293.4 * PT_TO_MM * logoScale).toFixed(3);
  return `
    <g transform="translate(${logoTx} ${logoTy}) scale(${(PT_TO_MM * logoScale).toFixed(5)})" fill="${fill}">
      <path d="m305.17,288.82l-.13-.3-.12.3-3.86,9.04-.04.09h1.13l1.07-2.51c.04-.08.12-.14.21-.14h3.21c.09,0,.18.06.21.14l1.02,2.51h1.2l-3.91-9.13Zm-.1,2.32c1.2,2.88,1.23,2.96,1.16,3.08-.04.06-.11.1-.19.1h-2.04c-.07,0-.15-.04-.18-.1-.04-.06-.05-.14-.02-.22l1.19-2.86.04-.09.04.09Z"/>
      <polygon points="253.47 288.83 251.29 294.18 249.03 288.83 247.01 288.83 251.32 298.37 255.43 288.83 253.47 288.83"/>
      <rect x="257.31" y="288.83" width="1.89" height="9.16"/>
      <polygon points="260.95 288.83 260.95 290.58 263.5 290.58 263.5 297.99 265.39 297.99 265.39 290.58 267.93 290.58 267.93 288.83 260.95 288.83"/>
      <polygon points="272.26 288.45 268.04 297.99 270 297.99 272.23 292.62 274.44 297.99 276.46 297.99 272.26 288.45"/>
      <polygon points="279.63 296.24 279.63 288.83 277.74 288.83 277.74 297.99 282.33 297.99 284.1 296.24 279.63 296.24"/>
      <path d="m290.67,293.07c-.08-.02-.14-.09-.15-.18,0-.09.04-.17.11-.21.47-.24.98-.71.98-1.62,0-1.4-.96-2.23-2.57-2.23h-3.15v9.12h3.4c1.87,0,2.98-.99,2.98-2.66,0-1.1-.55-1.91-1.61-2.21m-1.71-.5h-1.8c-.12,0-.21-.09-.21-.21v-2.45c0-.12.09-.21.21-.21h1.8c1.05,0,1.59.47,1.59,1.4s-.53,1.47-1.59,1.47m-2.01,1c0-.12.09-.21.21-.21h1.98c1.29,0,2.04.68,2.04,1.87s-.68,1.85-1.97,1.85h-2.05c-.12,0-.21-.09-.21-.21v-3.29Z"/>
      <path d="m295.43,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/>
      <path d="m316.06,288.83v5.88c0,1.59-.8,2.43-2.33,2.43s-2.34-.84-2.34-2.43v-5.88h-1.07v5.96c0,2.06,1.28,3.28,3.42,3.28s3.4-1.23,3.4-3.28v-5.96h-1.08Z"/>
      <path d="m318.66,288.83v.91h2.61c.11,0,.21.09.21.21v8h1.07v-8c0-.12.09-.21.21-.21h2.61v-.91h-6.71Z"/>
      <rect x="326.96" y="288.83" width="1.07" height="9.12"/>
      <path d="m332.19,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/>
    </g>
  `;
}

/**
 * Standard Download Filename Formatter
 * Rule: 바이탈(년도)메타그린부스터샷(제품명)_단(분류)_1315(코드 뒷자리 4개)_261126(날짜).ai
 * 분류: 단상자->단, 파우치->파, 앰플->앰, 라벨->라
 */
export function buildStandardDownloadFileName({
  lineName = '',
  productName = '',
  pkgType = 'carton',
  code = '',
  fileName = '',
  ext = 'ai',
} = {}) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yymmdd = `${yy}${mm}${dd}`;

  const ln = String(lineName || '').replace(/\s+/g, '');
  const pn = String(productName || '').replace(/\s+/g, '');
  let fullProd = pn.startsWith(ln) ? pn : `${ln}${pn}`;
  fullProd = fullProd.replace(/^바이탈뷰티|^바이탈/g, '').replace(/[\/\\:*?"<>|_\s]/g, '') || '메타그린부스터샷';

  const pLower = String(pkgType || '').toLowerCase().trim();
  let pkgChar = '단';
  if (pLower.includes('pouch') || pLower.includes('파우치') || pLower === '파') pkgChar = '파';
  else if (pLower.includes('ampoule') || pLower.includes('앰플') || pLower === '앰') pkgChar = '앰';
  else if (pLower.includes('label') || pLower.includes('라벨') || pLower === '라') pkgChar = '라';
  else if (pLower.includes('carton') || pLower.includes('단상자') || pLower === '단') pkgChar = '단';
  else if (/[가-힣]/.test(pLower)) pkgChar = pLower.match(/[가-힣]/)[0];

  let code4 = '';
  const rawCodeDigits = String(code || '').replace(/\D/g, '');
  if (rawCodeDigits.length >= 4) {
    code4 = rawCodeDigits.slice(-4);
  } else if (fileName) {
    const matches = [...String(fileName).matchAll(/(?:11077[-_]?|단|파|라|앰|용)(\d{4})/g)];
    if (matches.length > 0) {
      code4 = matches[matches.length - 1][1];
    } else {
      const fourDigits = [...String(fileName).matchAll(/(\d{4})/g)]
        .map(m => m[1])
        .filter(d => d !== '2024' && d !== '2025' && d !== '2026');
      if (fourDigits.length > 0) code4 = fourDigits[fourDigits.length - 1];
    }
  }
  if (!code4) code4 = '1315';

  return `바이탈(${yy})${fullProd}_${pkgChar}_${code4}_${yymmdd}.${ext}`;
}

/**
 * Estimate string width in mm for 10pt (or arbitrary pt) Korean/ASCII text with horizontal scale (장평)
 */
export function estimateTextWidthMmForPt(str, pt = 10, scaleX = 0.90) {
  const fontMm = pt * PT_TO_MM;
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code === 32) {
      total += fontMm * 0.30;
    } else if (code >= 0xAC00 && code <= 0xD7A3) {
      total += fontMm * 1.00; // 한글 음절 완성형은 1.0em 정방형
    } else if (code >= 0x3131 && code <= 0x318E) {
      total += fontMm * 0.85;
    } else if (code > 0x7F) {
      total += fontMm * 0.90;
    } else {
      total += fontMm * 0.52;
    }
  }
  return total * scaleX;
}

/**
 * Wrap paragraph text into lines fitting strictly within availWidthMm at given pt and scaleX
 */
export function wrapTextToWidthMm(text, availWidthMm, pt = 10, scaleX = 0.90) {
  const raw = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!raw) return [];
  const paragraphs = raw.split('\n').map(p => p.trim()).filter(Boolean);
  const lines = [];

  for (const para of paragraphs) {
    let curLine = '';
    for (let i = 0; i < para.length; i++) {
      const ch = para[i];
      const candidate = curLine + ch;
      if (curLine.length > 0 && estimateTextWidthMmForPt(candidate, pt, scaleX) > availWidthMm) {
        lines.push(curLine.trimEnd());
        curLine = ch.trimStart();
      } else {
        curLine = candidate;
      }
    }
    if (curLine.trim()) lines.push(curLine.trim());
  }
  return lines;
}

/**
 * Clean Field Key according to selected country/language:
 * E.g. "Other Ingredients (영양기능정보)" -> KR: "영양·기능 정보", US: "Other Ingredients"
 * E.g. "Suggested Use (섭취량 및 섭취방법)" -> KR: "섭취량 및 섭취방법", US: "Suggested Use"
 * E.g. "product_name (제품명)" -> KR: "제품명", US: "Product name"
 */
export function cleanFieldKeyForLanguage(rawFk, lang = 'KR') {
  if (!rawFk) return '';
  const s = String(rawFk).trim();
  const isKr = !lang || lang === 'KR' || /kr|ko/i.test(lang);

  // 1. Format: "English (Korean)"
  const mEnKr = s.match(/^([A-Za-z0-9_\s/-]+)\s*\(([^)]+)\)$/);
  if (mEnKr) {
    return isKr ? mEnKr[2].trim() : mEnKr[1].trim();
  }

  // 2. Format: "Korean (English)"
  const mKrEn = s.match(/^([가-힣0-9_\s·/-]+)\s*\(([^)]+)\)$/);
  if (mKrEn) {
    return isKr ? mKrEn[1].trim() : mKrEn[2].trim();
  }

  // 3. Known keywords translation
  const lower = s.toLowerCase();
  if (isKr) {
    if (lower === 'other ingredients' || lower === 'nutrition facts' || lower === 'supplement facts') return '영양·기능 정보';
    if (lower === 'suggested use' || lower === 'directions') return '섭취량 및 섭취방법';
    if (lower === 'warning' || lower === 'warnings' || lower === 'caution') return '주의사항';
    if (lower === 'storage instructions' || lower === 'storage') return '보관상 주의사항';
    if (lower === 'product_name' || lower === 'product name') return '제품명';
    if (lower === 'claim' || lower === 'description') return '제품 설명';
    if (lower === 'manufacturer') return '제조원';
  } else {
    if (s.includes('영양기능정보') || s.includes('영양·기능정보') || s.includes('영양정보')) return 'Other Ingredients';
    if (s.includes('섭취량 및 섭취방법') || s.includes('섭취방법')) return 'Suggested Use';
    if (s.includes('섭취 시 주의사항')) return 'Suggested Use';
    if (s.includes('주의사항')) return 'Warning';
    if (s.includes('보관상 주의사항') || s.includes('보관방법')) return 'Storage Instructions';
    if (s.includes('제품명')) return 'Product Name';
    if (s.includes('제품 설명') || s.includes('제품설명')) return 'Claim';
    if (s.includes('제조원') || s.includes('제조관련')) return 'Manufacturer';
  }

  return s;
}

/**
 * Highlight bold prefix or nutritional keywords inside a 10pt wrapped line
 */
function formatLineWithBoldKeywords(lineText, isFirstLineOfBlock, boldPrefix = '') {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (isFirstLineOfBlock && boldPrefix && lineText.startsWith(boldPrefix)) {
    const rest = lineText.slice(boldPrefix.length);
    return `<tspan font-weight="700">${esc(boldPrefix)}</tspan>${esc(rest)}`;
  }

  // Highlight known bold keywords in nutrition / customer service blocks
  const boldKeywords = [
    '영양·기능 정보', '영양·기능정보', '영양정보', 'Other Ingredients', 'Supplement Facts', 'Nutrition Facts',
    '섭취량 및 섭취방법', '섭취 시 주의사항', '보관상 주의사항', '주의사항', 'Suggested Use', 'Warning', 'Warnings', 'Storage Instructions',
    '원료명 및 함량', '원재료명 및 함량', '원재료명',
    '교환문의처', '고객상담전화', '제조원 : (주)아모레퍼시픽', '제조원', '유통전문판매원', '반품교환소재지',
    '내포장재질', '포장재질', '식품유형', '품목보고번호',
    '녹차추출물', 'APIC대두배아열수추출물등복합물', '비타민C', '비타민B1', '비타민B2', '비타민B6', '비타민D', '비타민E', '판토텐산', '카테킨',
  ];
  for (const kw of boldKeywords) {
    if (lineText.startsWith(kw)) {
      const rest = lineText.slice(kw.length);
      return `<tspan font-weight="700">${esc(kw)}</tspan>${esc(rest)}`;
    }
  }
  return esc(lineText);
}

/**
 * Render Side (LEFT / RIGHT) or Back (BACK) Panel according to exact VITALBEAUTIE rules:
 * - Left & Right margin: 2.0mm (availW = panel.w - 4.0mm)
 * - Back Product Name (제품명): 15pt Bold (scaleX 0.90) - 제목 라벨 없이 오직 제품명만 표시
 * - Product Claim (제품 설명): 제목 라벨 없이 설명 문안만 표시
 * - All body/category text: strictly 10pt (3.528mm, scaleX 0.90)
 * - Automatic 0.3mm horizontal line between categories with 1.5mm gap above and 1.5mm gap below
 * - Expiry white box (제조번호 / 소비기한 ~까지): height strictly 11.0mm (US 12.0mm), placed 15.0mm above bottom edge, width matched to carton panel width
 * - Customer Service / Manufacturer footer placed strictly in the 15mm space below expiry box
 * - Zero overlap between text and expiry box
 * - Overflow detection: highlights in RED (#E52421) if text overflows the panel
 */
export function renderSideOrBackPanel10ptSvg(panel, rawBlocks = [], opts = {}) {
  const px = panel.x;
  const py = panel.y;
  const pw = panel.w;
  const ph = panel.h;
  const txtCol = opts.textColor || '#FFFFFF';
  const fontFam = opts.fontFamily || "'RixSinGoSE_Pro','RIX-신고딕se-pro','VB-ShinGothic',sans-serif";
  const showExpiryBox = Boolean(opts.showExpiryBox);
  const isUs = Boolean(opts.isUs || opts.country === 'US' || opts.locale === 'US');
  const lang = isUs ? 'US' : 'KR';
  const isNarrowJellyCarton = pw <= 82 && ph >= 155; // 젤리 더블컷(80x161) 등 세로형 판형
  const defaultHeaderPt = isNarrowJellyCarton ? 13.0 : 15.0; // 판형에 따른 13pt / 15pt 분기
  const bodyPt = +(opts.bodyPt || 10.0); // 반드시 10pt 기본
  const headerPt = +(opts.headerPt || defaultHeaderPt);
  const scaleX = 0.90;

  // 양옆 2mm 마진
  const marginX = 2.0;
  const xLeft = +(px + marginX).toFixed(2);
  const xRight = +(px + pw - marginX).toFixed(2);
  const availW = Math.max(14, pw - marginX * 2);

  const font10Mm = +(bodyPt * PT_TO_MM).toFixed(3); // 10pt = 3.528mm
  const lineStep10Mm = +(font10Mm * 1.12).toFixed(3); // 약 3.95mm 행간
  const fontHeaderMm = +(headerPt * PT_TO_MM).toFixed(3); // 15pt(5.292mm) 또는 13pt(4.586mm)
  const lineStepHeaderMm = +(fontHeaderMm * 1.15).toFixed(3);

  // 하단 배치 블록(교환문의처/제조원/반품교환소재지)과 상단 일반 분류 블록 분리
  const isFooter = (fk, txt) => {
    const combined = `${fk} ${txt}`.toLowerCase();
    return (
      combined.includes('교환문의') ||
      combined.includes('고객상담') ||
      combined.includes('080-023-5454') ||
      combined.includes('반품교환') ||
      combined.includes('제조원') ||
      combined.includes('제조관련') ||
      combined.includes('manufacturer') ||
      combined.includes('용산구 한강대로') ||
      combined.includes('아모레퍼시픽')
    );
  };

  const upperBlocks = [];
  const bottomFooterBlocks = [];

  for (const b of rawBlocks) {
    const rawFk = String(b.fieldKey || '').trim();
    const txt = String(b.textContent || '').trim();
    if (!rawFk && !txt) continue;
    const cleanFk = cleanFieldKeyForLanguage(rawFk, lang);
    if (showExpiryBox && isFooter(cleanFk, txt)) {
      bottomFooterBlocks.push({ fieldKey: cleanFk, textContent: txt });
    } else {
      upperBlocks.push({ fieldKey: cleanFk, textContent: txt });
    }
  }

  // 상단 문안이 침범하면 안 되는 한계 Y좌표 (소비기한 박스 상단 구분선 위)
  const boxH = isUs ? 12.0 : 11.0;
  const bottomOffset = 15.0; // 하단에서 15mm 띄움
  const boxBottomY = +(py + ph - bottomOffset).toFixed(2);
  const boxTopY = +(boxBottomY - boxH).toFixed(2);
  const sobiY = +(boxTopY - 1.3).toFixed(2);
  const jejoY = +(sobiY - lineStep10Mm).toFixed(2);
  const dividerAboveJejoY = +(jejoY - font10Mm * 0.86 - 1.5).toFixed(2);
  const limitY = showExpiryBox ? +(dividerAboveJejoY - 1.5).toFixed(2) : +(py + ph - 2.0).toFixed(2);

  let svgElements = '';
  let curY = py + 2.5; // 상단 시작점 (top margin)
  let hasRenderedFirstBodyBlock = false;
  let totalLogicalHeight = curY;

  for (let bIdx = 0; bIdx < upperBlocks.length; bIdx++) {
    const blk = upperBlocks[bIdx];
    const fk = blk.fieldKey;
    const rawTxt = blk.textContent;

    const lowerFk = fk.toLowerCase();
    const isTitleBlock = lowerFk === '제품명' || lowerFk === 'product name' || lowerFk === 'product_name';
    const isClaimBlock = lowerFk === '제품 설명' || lowerFk === '제품설명' || lowerFk === 'claim' || lowerFk === 'description';

    if (isTitleBlock) {
      // 후면 상단 제품명: 제목 라벨("제품명", "product_name") 없이 오직 제품명만 15pt(또는 13pt)로 표기
      const titleLines = wrapTextToWidthMm(rawTxt, availW, headerPt, scaleX);
      titleLines.forEach((tLine) => {
        curY += lineStepHeaderMm * 0.88;
        totalLogicalHeight = Math.max(totalLogicalHeight, curY);
        if (curY <= limitY) {
          svgElements += `
            <g transform="translate(${xLeft} ${curY.toFixed(2)}) scale(${scaleX} 1)">
              <text x="0" y="0" fill="${txtCol}" font-size="${fontHeaderMm}" font-weight="700" letter-spacing="-0.03em" font-family="${fontFam}">${tLine.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
            </g>
          `;
        }
      });
      curY += 0.8;
      continue;
    }

    if (isClaimBlock) {
      // 제품 설명: 제목 라벨("제품 설명", "claim") 없이 설명 문안만 표기
      const claimLines = wrapTextToWidthMm(rawTxt, availW, bodyPt, scaleX);
      claimLines.forEach((cLine, lIdx) => {
        curY += lIdx === 0 ? (font10Mm * 0.86) : lineStep10Mm;
        totalLogicalHeight = Math.max(totalLogicalHeight, curY);
        if (curY <= limitY) {
          svgElements += `
            <g transform="translate(${xLeft} ${curY.toFixed(2)}) scale(${scaleX} 1)">
              <text x="0" y="0" fill="${txtCol}" font-size="${font10Mm}" font-weight="400" letter-spacing="-0.03em" font-family="${fontFam}">${cLine.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
            </g>
          `;
        }
      });
      hasRenderedFirstBodyBlock = true;
      continue;
    }

    // 분류마다 위 1.5mm 간격 + 0.3mm 구분선 + 아래 1.5mm 간격 자동 삽입 (가이드 1.5mm 확정)
    if (hasRenderedFirstBodyBlock) {
      const lineY = +(curY + 0.65 + 1.5).toFixed(2);
      if (lineY <= limitY) {
        svgElements += `
          <line x1="${xLeft}" y1="${lineY}" x2="${xRight}" y2="${lineY}" stroke="${txtCol}" stroke-width="0.3"/>
        `;
      }
      curY = lineY + 0.15 + 1.5;
    }

    // 분류명(Field Key) 자동 볼드 결합: 언어 선택한 대로 하나만 볼드체 기입
    let fullBlockText = rawTxt;
    let boldPrefix = '';
    const skipPrefixKeys = ['정보', 'info'];

    if (fk && !skipPrefixKeys.includes(lowerFk)) {
      if (rawTxt.startsWith(fk)) {
        boldPrefix = fk;
      } else {
        boldPrefix = fk;
        fullBlockText = `${fk}  ${rawTxt}`;
      }
    }

    const wrappedLines = wrapTextToWidthMm(fullBlockText, availW, bodyPt, scaleX);
    wrappedLines.forEach((wLine, lIdx) => {
      curY += lIdx === 0 ? (font10Mm * 0.86) : lineStep10Mm;
      totalLogicalHeight = Math.max(totalLogicalHeight, curY);
      // 흰색 날인 박스 영역을 침범하지 않도록 한계선 위에서만 그리기 (겹침 100% 방지)
      if (curY <= limitY) {
        const formattedTspans = formatLineWithBoldKeywords(wLine, lIdx === 0, boldPrefix);
        svgElements += `
          <g transform="translate(${xLeft} ${curY.toFixed(2)}) scale(${scaleX} 1)">
            <text x="0" y="0" fill="${txtCol}" font-size="${font10Mm}" font-weight="400" letter-spacing="-0.03em" font-family="${fontFam}">${formattedTspans}</text>
          </g>
        `;
      }
    });

    hasRenderedFirstBodyBlock = true;
  }

  // 제조번호 / 소비기한 ~까지 흰색 박스 배치 (한국 11mm, 미국 12mm 고정, 하단에서 15mm 띄움, 길이는 단상자 폭에 맞춤)
  if (showExpiryBox) {
    const kkajiReserveMm = isUs ? 0 : 6.8;
    const boxW = Math.max(12, +(availW - kkajiReserveMm).toFixed(2));

    svgElements += `
      <!-- 제조번호/소비기한 상단 0.3mm 구분선 (위아래 1.5mm 간격) -->
      <line x1="${xLeft}" y1="${dividerAboveJejoY}" x2="${xRight}" y2="${dividerAboveJejoY}" stroke="${txtCol}" stroke-width="0.3"/>

      <!-- 제조번호 / 소비기한 (10pt 볼드) -->
      <g transform="translate(${xLeft} ${jejoY}) scale(${scaleX} 1)">
        <text x="0" y="0" fill="${txtCol}" font-size="${font10Mm}" font-weight="700" letter-spacing="-0.03em" font-family="${fontFam}">${isUs ? 'Lot number' : '제조번호'}</text>
      </g>
      <g transform="translate(${xLeft} ${sobiY}) scale(${scaleX} 1)">
        <text x="0" y="0" fill="${txtCol}" font-size="${font10Mm}" font-weight="700" letter-spacing="-0.03em" font-family="${fontFam}">${isUs ? 'Best by (MM/DD/YYYY)' : '소비기한'}</text>
      </g>

      <!-- 흰색 날인 박스 (한국 11mm / 미국 12mm 고정, 폭 단상자 맞춤, 하단에서 15mm 띄움) -->
      <rect x="${xLeft}" y="${boxTopY}" width="${boxW}" height="${boxH}" fill="#FFFFFF"/>

      ${!isUs ? `<!-- 우측 하단 '까지' (10pt) -->
      <g transform="translate(${xRight} ${(boxBottomY - 0.8).toFixed(2)}) scale(${scaleX} 1)">
        <text x="0" y="0" text-anchor="end" fill="${txtCol}" font-size="${font10Mm}" font-weight="600" letter-spacing="-0.03em" font-family="${fontFam}">까지</text>
      </g>` : ''}
    `;

    // 하단 15mm 여유 공간 내 교환문의처 / 고객상담실 / 제조원 / 반품교환소재지 배치 (Image 3 동일)
    if (bottomFooterBlocks.length > 0) {
      let footY = +(boxBottomY + 0.8).toFixed(2);
      const footerStep = +(font10Mm * 0.94).toFixed(3);
      for (const fb of bottomFooterBlocks) {
        let fbText = fb.textContent;
        if (fb.fieldKey && fb.fieldKey.includes('교환문의') && !fbText.includes('교환문의')) {
          fbText = `교환문의처  구입처 및 고객상담실\n${fbText}`;
        }
        const fLines = wrapTextToWidthMm(fbText, availW, bodyPt, scaleX);
        fLines.slice(0, 4).forEach((fl) => {
          footY = +(footY + footerStep).toFixed(2);
          if (footY <= py + ph - 0.5) {
            const tsp = formatLineWithBoldKeywords(fl, false, '');
            svgElements += `
              <g transform="translate(${xLeft} ${footY}) scale(${scaleX} 1)">
                <text x="0" y="0" fill="${txtCol}" font-size="${(font10Mm * 0.92).toFixed(3)}" font-weight="400" letter-spacing="-0.04em" font-family="${fontFam}">${tsp}</text>
              </g>
            `;
          }
        });
      }
    }
  }

  // 문안 넘침(Overflow) 여부 판정 및 빨간색 표시
  const isOverflow = totalLogicalHeight > limitY + 0.5;
  const overflowMm = isOverflow ? +(totalLogicalHeight - limitY).toFixed(1) : 0;

  if (isOverflow) {
    const overTopY = Math.max(py, limitY);
    const overH = Math.max(6, Math.min(ph, totalLogicalHeight - overTopY + 2));
    svgElements += `
      <!-- 문안 넘침 빨간색 경고 표시 -->
      <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="${ph.toFixed(2)}"
            fill="none" stroke="#E52421" stroke-width="1.1" stroke-dasharray="2.2 1.2"/>
      <rect x="${(px + 1).toFixed(2)}" y="${overTopY.toFixed(2)}" width="${(pw - 2).toFixed(2)}" height="${overH.toFixed(2)}"
            fill="rgba(229, 36, 33, 0.22)" stroke="#E52421" stroke-width="0.6"/>
      <rect x="${px.toFixed(2)}" y="${(py - 8.5).toFixed(2)}" width="${pw.toFixed(2)}" height="6.8" rx="0.8" fill="#E52421"/>
      <text x="${(px + pw / 2).toFixed(2)}" y="${(py - 4.0).toFixed(2)}" text-anchor="middle" fill="#FFFFFF" font-size="2.9" font-weight="800" font-family="${fontFam}">
        ▲ [${panel.id}] 10pt 문안 넘침 (+${overflowMm}mm 초과)
      </text>
    `;
  }

  return {
    svg: svgElements,
    isOverflow,
    overflowMm,
    usedHeightMm: +(totalLogicalHeight - py).toFixed(1),
  };
}

/**
 * Load PDF or Illustrator AI (PDF stream) from ArrayBuffer
 */
export async function loadPdfAiDocument(arrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Extract text items, positions, and detected fonts from the first page of PDF/AI
 */
export async function extractPdfAiMetadata(pdfDoc) {
  if (!pdfDoc) return null;
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();

  const items = textContent.items.map(item => ({
    text: item.str,
    fontName: item.fontName,
    transform: item.transform,
    xMm: (item.transform[4] || 0) * PT_TO_MM,
    yMm: (viewport.height - (item.transform[5] || 0)) * PT_TO_MM,
    widthMm: (item.width || 0) * PT_TO_MM,
    heightMm: (item.height || 0) * PT_TO_MM,
  })).filter(it => it.text && it.text.trim().length > 0);

  const allText = items.map(it => it.text).join(' ');

  return {
    numPages: pdfDoc.numPages,
    widthMm: Math.round(viewport.width * PT_TO_MM),
    heightMm: Math.round(viewport.height * PT_TO_MM),
    items,
    allText,
  };
}

/**
 * Extract spot colors (/Separation) and embedded fonts (/BaseFont) directly from raw PDF/AI bytes
 */
export function scanRawPdfAiBinary(bytes) {
  const latin = new TextDecoder('iso-8859-1').decode(bytes.slice(0, Math.min(bytes.length, 4_000_000)));
  const separations = [...latin.matchAll(/\/Separation\s*\/([^\s\/\[\]()]+)/g)]
    .map(m => m[1].replace(/#20/g, ' '))
    .filter(s => !s.startsWith('*'));
  const fonts = [...latin.matchAll(/\/BaseFont\s*\/([^\s\/\[\]()]+)/g)]
    .map(m => m[1].replace(/^[A-Z]{6}\+/, ''));

  return {
    spotColors: [...new Set(separations)],
    detectedFonts: [...new Set(fonts)],
  };
}

/**
 * Comprehensive VITALBEAUTIE Original Artwork Catalog (from Cursor/VITALBEAUTIE/design guide)
 * Ensures 100% accurate recognition of all 6 panels (FRONT, LEFT, RIGHT, BACK, TOP, BOTTOM),
 * Food Type (일반식품 'food' vs 건강기능식품 'hff'), exact ingredients, capacity, nutrition, and dimensions.
 */
export function inferProductInfoFromTextAndName(allText = '', fileName = '', rawScan = {}) {
  const combined = `${fileName} ${allText} ${(rawScan.spotColors || []).join(' ')}`.normalize('NFC');
  const lower = combined.toLowerCase();

  // Base default (Meta Green Slim Up)
  let profile = {
    detectedLine: 'metagreen',
    lineName: '메타그린',
    productName: '슬림업',
    foodType: 'hff',
    foodCategoryLabel: '건강기능식품',
    wMm: 70.6,
    hMm: 119.9,
    sideWMm: 36.0,
    ingredient: '녹차추출물(카테킨), 판토텐산, 비타민C',
    capacity: '건강기능식품 42 g [420 mg X 100 정]',
    topSubCopy: '식후 체지방 집중 커팅',
    topMainCopy: '슬림업 다이어트 루틴',
    leftTitle: '메타그린 슬림업',
    leftPoints: ['45년 녹차 연구 카테킨', '장용성 코팅 정제 기술', '식후 체지방 & 콜레스테롤 케어'],
    directions: '1일 1회, 1회 3정을 식후 물과 함께 섭취하십시오.',
    warnings: '어린이, 임산부 및 수유부는 섭취를 피하십시오. 카페인이 함유되어 있어 초조감, 불면 등을 나타낼 수 있습니다.',
    storage: '직사광선 및 고온다습한 곳을 피해 서늘한 곳에 실온 보관하십시오.',
    rawMaterials: '녹차추출물분말(인도산), 판토텐산칼슘, 비타민C, 결정셀룰로스, 히드록시프로필메틸셀룰로스, 스테아린산마그네슘, 면실유분말',
    allergenNotice: '본 제품은 알류, 우유, 메밀, 땅콩, 대두, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토를 사용한 제품과 같은 제조시설에서 제조되었습니다.',
    packagingMaterial: '용기-HDPE, 캡-PP, 리드지-PET',
    manufacturer: '㈜네추럴에프앤피 / 충청북도 청주시 청원구 오창읍 양청송대길 39',
    distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
    nutritionHeader: '총 내용량 42 g (100정) / 1일 섭취량: 3정(1.26 g)',
    nutritionRows: [
      ['열량', '5 kcal', '-'],
      ['탄수화물', '1 g', '0%'],
      ['단백질', '0 g', '0%'],
      ['지방', '0 g', '0%'],
      ['나트륨', '0 mg', '0%'],
      ['카테킨', '300 mg', '-'],
      ['판토텐산', '5 mg', '100%'],
    ],
    barcode: '8 809925 141708',
    itemCode: '11077-1417',
  };

  // ── 1. METAGREEN Line Original Files ──
  if (lower.includes('브이레디') || lower.includes('1473') || lower.includes('붓기') || lower.includes('브이케어')) {
    profile = {
      ...profile,
      detectedLine: 'metagreen',
      lineName: '메타그린',
      productName: '브이레디',
      foodType: 'food', // 당류가공품 (일반식품 - 건기식 마크 없음, 하단 원료명 및 함량 표기)
      foodCategoryLabel: '당류가공품',
      wMm: 76.0,
      hMm: 138.0,
      sideWMm: 42.0,
      ingredient: '효소처리헤스페리딘 8.6957%',
      capacity: '69 g | 1,150 mg x 60정 (256 kcal)',
      topSubCopy: '중요한 약속 전날엔',
      topMainCopy: '가벼움을 SOS',
      leftTitle: '메타그린 브이레디',
      leftPoints: ['Mineral Blend (K · Mg)', 'αG Hesperidin 8.6957%', 'Take with water (1일 2회, 1회 2정)'],
      directions: '1일 2회, 1회 2정을 물과 함께 섭취하십시오.',
      warnings: '본 제품은 섭취자의 신체상태에 따라 반응에 차이가 있을 수 있습니다.',
      storage: '내용물 변색의 우려가 있으니 직사광선을 피하여 습기가 적은 서늘한 곳에 실온 보관하십시오.',
      rawMaterials: '염화칼륨, 말토덱스트린, 포도당, 결정셀룰로스, 효소처리헤스페리딘, 산화마그네슘, 히드록시프로필메틸셀룰로스, 해조분말, 이산화규소, 레몬분말혼합제제, 스테아린산마그네슘, 치자황색소, 수크랄로스, 레몬과즙분말, 히비스커스추출물분말, 포도잎추출물분말, 옥수수수염추출물분말, 호박농축액분말, 팥농축분말 [토마토 함유]',
      packagingMaterial: '용기, 리드지-PET, 캡-PP',
      manufacturer: '광동헬스바이오㈜ 2공장 / 충청북도 청주시 양청송대길 38',
      distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      nutritionHeader: '총 내용량 69 g (256 kcal)',
      nutritionRows: [
        ['나트륨', '75 mg', '4%'],
        ['탄수화물', '64 g', '20%'],
        ['당류', '1 g', '1%'],
        ['지방', '0 g', '0%'],
        ['단백질', '0 g', '0%'],
        ['칼륨', '10,500 mg', '300%'],
        ['마그네슘', '1,417 mg', '450%'],
      ],
      barcode: '8 800283 712522',
      itemCode: '11077-1473',
    };
  } else if (lower.includes('크레아틴')) {
    profile = {
      ...profile,
      detectedLine: 'metagreen',
      lineName: '메타그린',
      productName: '크레아틴 플러스',
      foodType: 'hff',
      foodCategoryLabel: '건강기능식품',
      wMm: 80.0,
      hMm: 145.0,
      sideWMm: 40.0,
      ingredient: '크레아틴',
      capacity: '건강기능식품 140 g [10 g X 14포]',
      topSubCopy: '빼기만 하는 다이어트 STOP',
      topMainCopy: '바디-핏 루틴',
      leftTitle: '메타그린 크레아틴 플러스',
      leftPoints: ['BUILD MUSCLE (운동 전후)', 'MATCHA LEMON FLAVOR (가루 타입)', '근력 운동 시 운동수행능력 향상'],
      directions: '1일 1회, 1포를 충분한 물과 함께 섭취하십시오.',
      warnings: '신장에 영향을 미치는 약물을 복용하거나 신장 이상의 위험이 있는 사람은 의사와 상담 후 섭취하십시오. 어린이, 임산부 및 수유부는 섭취를 피하십시오.',
      storage: '직사광선 및 고ون 다습한 곳을 피하여 실온에 보관하십시오.',
      rawMaterials: '크레아틴모노하이드레이트, 난소화성말토덱스트린, 가르시니아캄보지아추출물(인도산), 건조효모(크롬), 곤약분말, 완두단백, 구연산, 오렌지농축액, 녹차추출물분말, 알로에베라겔농축분말',
      packagingMaterial: '내포장재질 폴리에틸렌(PE)',
      manufacturer: '㈜비오팜 / 경기도 화성시 팔탄면 온천로 237번길 86-3',
      distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      nutritionHeader: '1일 섭취량: 1포(10 g) / 열량 10 kcal',
      nutritionRows: [
        ['탄수화물', '0 g', '0%'],
        ['당류', '0 g', '0%'],
        ['단백질', '3 g', '5%'],
        ['지방', '0 g', '0%'],
        ['나트륨', '0 mg', '0%'],
        ['크레아틴', '3,000 mg', '-'],
      ],
      barcode: '8 800283 656307',
      itemCode: '11077-1317',
    };
  } else if (lower.includes('클린티') || lower.includes('1314')) {
    profile = {
      ...profile,
      detectedLine: 'metagreen',
      lineName: '메타그린',
      productName: '클린티',
      foodType: 'food',
      foodCategoryLabel: '음료베이스(분말제품)',
      wMm: 80.0,
      hMm: 150.0,
      sideWMm: 25.0,
      ingredient: '구연산칼륨 29.697%, 파인애플추출분말 3.448%, 올리브잎추출물 8.621%, 수용성비타민P 10.345%',
      capacity: '음료베이스(분말제품) 29 g [2.9 g x 10포] (85 kcal)',
      topSubCopy: '간식 야식 외식 후',
      topMainCopy: '식사 클렌징',
      leftTitle: '메타그린 클린티',
      leftPoints: ['1 Stick a Day (물 300~500ml)', 'Citrus Flavor (상큼한 레몬라임)', '식후 가벼운 클렌징 티'],
      directions: '1일 1회, 1포를 물 300~500 ml에 타서 섭취하십시오.',
      warnings: '본 제품에 이상이 있을 경우 공정거래위원회 고시 소비자분쟁해결기준에 의거 보상해 드립니다.',
      storage: '직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관하시고 개봉 후에는 바로 섭취하십시오.',
      rawMaterials: '구연산, 구연산칼륨, 수용성비타민P, 향료(레몬향), 올리브잎추출물(스페인산), 파인애플추출분말(인도산), 녹차추출물(인도산), 함초소금, 산화마그네슘, 수크랄로스, 스테비올배당체, 레몬농축분말, 팥발효추출물',
      packagingMaterial: '포장재질 폴리에틸렌(PE)',
      manufacturer: '㈜비오팜 / 경기도 화성시 팔탄면 온천로 237번길 86-3',
      distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      nutritionHeader: '총 내용량 29 g (85 kcal)',
      nutritionRows: [
        ['나트륨', '140 mg', '7%'],
        ['탄수화물', '21 g', '6%'],
        ['당류', '1 g', '1%'],
        ['지방', '0 g', '0%'],
        ['단백질', '0 g', '0%'],
        ['칼륨', '3,100 mg', '89%'],
      ],
      barcode: '8 800283 636260',
      itemCode: '11077-1314',
    };
  } else if (lower.includes('효소') || lower.includes('1328') || lower.includes('1329')) {
    profile = {
      ...profile,
      detectedLine: 'metagreen',
      lineName: '메타그린',
      productName: '효소',
      foodType: 'food',
      foodCategoryLabel: '효소식품',
      wMm: 78.0,
      hMm: 140.0,
      sideWMm: 38.0,
      ingredient: 'α-아밀라아제 600,000 unit/3 g, 프로테아제 6,000 unit/3 g, 메타프로효소포뮬라 35%',
      capacity: '효소식품 3 g X 30 포 (90 g / 370 kcal)',
      topSubCopy: '매일 가벼운 식습관 케어',
      topMainCopy: 'VITALBEAUTIE ENZYME',
      leftTitle: '메타그린 효소',
      leftPoints: ['단백질 흡수 부스터 & 대사 밸런스', '식전 1포 루틴 & 스노우 파우더', '녹차유래 특허 유산균 함유 (GTB1)'],
      directions: '1일 1회, 1회 1포를 물과 함께 섭취하십시오.',
      warnings: '특이체질, 알레르기 체질이신 경우 원료 성분을 확인 하신 후 섭취하십시오. 과량 섭취 시 설사를 일으킬 수 있습니다.',
      storage: '직사광선 및 고온 다습한 곳을 피하여 실온에 보관하십시오.',
      rawMaterials: '메타프로효소포뮬라[노란콩(국산), 탈지대두(인도산), 백미, 효소식품], 락티톨, 식물성크림, 농축우유단백분말, 자일리톨 9%, 오곡분말(현미, 보리, 조, 수수, 찰현미 / 국산), 분리대두단백, 귀리식이섬유, 치커리추출물, 푸룬과즙분말 [우유, 대두, 밀, 메밀, 토마토 함유]',
      packagingMaterial: '내포장재질 폴리에틸렌(PE)',
      manufacturer: '㈜비오팜 / 경기도 화성시 팔탄면 온천로 237번길 86-3',
      distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      nutritionHeader: '총 내용량 90 g (370 kcal)',
      nutritionRows: [
        ['나트륨', '130 mg', '7%'],
        ['탄수화물', '66 g', '20%'],
        ['당류', '14 g', '14%'],
        ['지방', '6 g', '11%'],
        ['포화지방', '3 g', '20%'],
        ['단백질', '13 g', '24%'],
      ],
      barcode: '8 800283 641196',
      itemCode: '11077-1328',
    };
  } else if (lower.includes('부스터샷') || lower.includes('1519') || lower.includes('1517') || lower.includes('1389') || lower.includes('1354')) {
    profile = {
      ...profile,
      detectedLine: 'metagreen',
      lineName: '메타그린',
      productName: '부스터샷 GL',
      foodType: 'hff',
      foodCategoryLabel: '건강기능식품',
      wMm: 100.0,
      hMm: 126.0,
      sideWMm: 38.0,
      ingredient: 'APIC대두배아열수추출물등복합물, 비타민B1, 녹차추출물, 바나바잎추출물, 판토텐산',
      capacity: '건강기능식품 188.79 g [26.97 g x 7 EA]',
      topSubCopy: '체지방&혈당 듀얼 차단으로',
      topMainCopy: '정체기 종결',
      leftTitle: '메타그린 부스터샷',
      leftPoints: ['하루 한 병 (1일 1회 1병)', '운동 전후 & 식사 후 집중 케어', 'LOW SUGAR 저당 · GLUTEN FREE'],
      directions: '성인 1일 1회, 1병을 흔들어 섭취하세요. 상단 캡의 정제를 꺼내신 후 하단의 액상과 함께 섭취하세요.',
      warnings: '어린이, 임산부 및 수유부는 섭취를 피해주시기 바랍니다. 식사후 섭취해주시기 바랍니다. 카페인이 함유되어 있어 초조감, 불면 등을 나타낼 수 있습니다.',
      storage: '직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관하시고 개봉 후에는 바로 드시기 바랍니다.',
      rawMaterials: 'APIC대두배아열수추출물등복합물, 녹차추출물, 바나바잎추출물, 판토텐산칼슘, 비타민B1염산염, 정제수, 난소화성말토덱스트린, 자몽농축액, 오렌지농축액 [대두 함유]',
      packagingMaterial: '용기-PET/PP, 캡-PP/PE',
      manufacturer: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      nutritionHeader: '1일 섭취량: 26.97 g (액상 25.05g + 정제 1.92g) / 15 kcal',
      nutritionRows: [
        ['탄수화물', '4 g', '1%'],
        ['당류', '0 g', '0%'],
        ['단백질', '0 g', '0%'],
        ['지방', '0 g', '0%'],
        ['나트륨', '5 mg', '0%'],
        ['비타민B1', '48 mg', '4,000%'],
        ['판토텐산', '50 mg', '1,000%'],
        ['카테킨', '360 mg', '-'],
        ['코로솔산', '0.45 mg', '-'],
      ],
      barcode: '8 800283 713178',
      itemCode: '11077-1519',
    };
  } else if (lower.includes('애사비') || lower.includes('1442')) {
    profile = {
      ...profile,
      detectedLine: 'metagreen',
      lineName: '메타그린',
      productName: '젤리 애사비',
      foodType: 'food',
      foodCategoryLabel: '캔디류',
      wMm: 80.0,
      hMm: 161.0,
      sideWMm: 37.0,
      ingredient: '사과초모식초(애플사이다비니거) 35% 함유',
      capacity: '200 g [20 g x 10포 / 140 kcal]',
      topSubCopy: '가벼워지는 습관',
      topMainCopy: '사과맛 저당젤리',
      leftTitle: '메타그린 젤리 애사비',
      leftPoints: ['사과초모식초 7,000mg (1포당)', '고식이섬유 HIGH FIBER', 'APPLE CIDER VINEGAR 저당 젤리'],
      directions: '1일 1회, 1회 1포(20 g)를 씹어서 섭취하십시오.',
      warnings: '특정원료에 알레르기가 있으신 분은 원재료명을 확인 후 섭취하십시오. 제품 개봉 시 내용물이 흘러나올 수 있으므로 주의하시기 바랍니다.',
      storage: '신선도가 유지되도록 고온다습하거나 직사광선을 피한 실온에 보관하여 주십시오.',
      rawMaterials: '사과초모식초(애플사이다비니거), 정제수, 폴리덱스트로스, 알룰로오스, 코코넛젤리(나타드코코), 로커스트콩검혼합제제, 사과농축액, 구연산, 치커리추출물, 수크랄로스',
      packagingMaterial: '내포장재질 폴리에틸렌(PE)',
      manufacturer: '코스맥스바이오㈜ / 충청북도 제천시 바이오밸리로 30',
      distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      nutritionHeader: '총 내용량 200 g (20 g x 10포) / 1포당 14 kcal',
      nutritionRows: [
        ['나트륨', '25 mg', '1%'],
        ['탄수화물', '6 g', '2%'],
        ['당류', '0 g', '0%'],
        ['식이섬유', '3 g', '12%'],
        ['알룰로오스', '1.05 g', '-'],
        ['지방', '0 g', '0%'],
        ['단백질', '0 g', '0%'],
      ],
      barcode: '8 800283 679694',
      itemCode: '11077-1442',
    };
  } else if (lower.includes('더블컷') || lower.includes('칼로리컷') || lower.includes('1437') || lower.includes('1535')) {
    profile = {
      ...profile,
      detectedLine: 'metagreen',
      lineName: '메타그린',
      productName: '젤리 더블컷',
      foodType: 'hff',
      foodCategoryLabel: '건강기능식품',
      wMm: 80.0,
      hMm: 161.0,
      sideWMm: 37.0,
      ingredient: '가르시니아캄보지아추출물, 난소화성말토덱스트린, 크롬',
      capacity: '건강기능식품 200 g [20 g X 10포]',
      topSubCopy: '다이어트 루틴',
      topMainCopy: '오렌지맛 컷팅젤리',
      leftTitle: '메타그린 젤리 더블컷',
      leftPoints: ['탄수화물이 지방으로 합성 억제 (HCA)', '식후 혈당 상승 억제 & 배변활동 원활', 'CARBO CUT · ORANGE FLAVOR'],
      directions: '1일 1회, 1회 1포(20 g)를 씹어서 섭취하십시오.',
      warnings: '어린이, 임산부 및 수유부는 섭취를 피하십시오. 간·신장·심장질환, 알레르기 및 천식이 있거나 의약품 복용 시 전문가와 상담하십시오.',
      storage: '수분 및 열에 의해 영향을 받을 수 있으므로 직사광선을 피해 서늘한 곳에 보관하십시오.',
      rawMaterials: '난소화성말토덱스트린(옥수수), 가르시니아캄보지아추출물(인도산), 건조효모(크롬), 정제수, 곤약분말, 완두단백, 로커스트콩검혼합제제, 오렌지농축액, 구연산, 알로에베라겔농축분말',
      packagingMaterial: '내포장재질 폴리에틸렌(PE)',
      manufacturer: '코스맥스바이오㈜ / 충청북도 제천시 바이오밸리로 30',
      distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
      nutritionHeader: '1일 섭취량: 1포(20 g) / 열량 20 kcal',
      nutritionRows: [
        ['탄수화물', '7 g', '2%'],
        ['당류', '0 g', '0%'],
        ['식이섬유', '4.2 g', '17%'],
        ['단백질', '0 g', '0%'],
        ['지방', '0 g', '0%'],
        ['나트륨', '15 mg', '1%'],
        ['총 (-)-HCA', '750 mg', '-'],
        ['크롬', '200 μg', '667%'],
      ],
      barcode: '8 800283 679656',
      itemCode: '11077-1437',
    };
  }
  // ── 2. INNERBEAUTY Line Original Files ──
  else if (
    lower.includes('슈퍼콜라겐') || lower.includes('슈퍼레티놀') || lower.includes('슈퍼시카') ||
    lower.includes('이너뷰티') || lower.includes('케라핏') || lower.includes('retinol') ||
    lower.includes('collagen') || lower.includes('cica') || lower.includes('11077-1565') ||
    lower.includes('1525') || lower.includes('1524') || lower.includes('1522') ||
    lower.includes('1410') || lower.includes('1507') || lower.includes('1513') ||
    lower.includes('1499') || lower.includes('1468') || lower.includes('1462') ||
    lower.includes('1302') || lower.includes('1289') || lower.includes('1347') || lower.includes('1341')
  ) {
    if (lower.includes('레티놀') || lower.includes('retinol') || lower.includes('1507') || lower.includes('1513') || lower.includes('1499') || lower.includes('1468') || lower.includes('1462') || lower.includes('1565')) {
      const isJelly = lower.includes('젤리') || lower.includes('1468') || lower.includes('1565');
      profile = {
        ...profile,
        detectedLine: 'innerbeauty',
        lineName: '슈퍼레티놀',
        productName: isJelly ? '젤리' : '',
        foodType: 'food',
        foodCategoryLabel: isJelly ? '캔디류' : '기타가공품',
        wMm: isJelly ? 65.0 : 75.0,
        hMm: isJelly ? 161.0 : 132.5,
        sideWMm: isJelly ? 18.0 : 40.0,
        benefit: 'BRIGHT & GLOW',
        points: isJelly
          ? ['고함량* 레티놀', '상큼한 레몬맛', '저당 젤리']
          : ['비타민C 1,000 mg*', '고함량* 저자극', '먹는 리포좀 레티놀'],
        ingredient: isJelly
          ? '모링가잎추출물(비건레티놀), 비타민C, 아연'
          : '기타가공품 [리포좀 레티놀+비타민C] 47.664% (레몬과즙분말 0.5244%)',
        capacity: isJelly ? '200 g [20 g X 10포]' : '60 g [2.0 g X 30포] (230 kcal)',
        topSubCopy: isJelly ? '투명 탱글광' : '먹는 리포좀 레티놀',
        topMainCopy: isJelly ? '레몬맛 레티놀 젤리' : '레몬맛 뷰티비타민',
        leftTitle: isJelly ? '슈퍼레티놀 젤리' : '슈퍼레티놀',
        leftPoints: ['피부과 전문의 공동개발', '상큼한 레몬맛 6종 뷰티비타민', '리포좀 레티놀 기술 (LAB PROVEN)'],
        directions: '1일 1~2회, 1회 1포를 그대로 섭취하시기 바랍니다.',
        warnings: '당알코올 함유 제품으로 과량 섭취 시 설사를 일으킬 수 있습니다.',
        storage: '직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관하시고 개봉 후에는 바로 섭취하십시오.',
        rawMaterials: '리포좀 레티놀+비타민C[비타민C, 자일리톨, L-시스틴, 효소처리저분자오크라뮤신, 판토텐산칼슘, 모링가추출물(레티놀 5%), 니코틴산아미드, 비타민E혼합제제, 비타민D혼합제제, 레몬과즙분말, 히알루론산], 말티톨시럽, 망고과즙분말, 레몬라임향',
        packagingMaterial: '내포장재질 폴리에틸렌(PE)',
        manufacturer: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        nutritionHeader: '총 내용량 60 g (230 kcal)',
        nutritionRows: [
          ['나트륨', '200 mg', '10%'],
          ['탄수화물', '52 g', '16%'],
          ['당류', '0 g', '0%'],
          ['비타민A', '15,000 μg RAE', '2,143%'],
          ['비타민C', '15,000 mg', '15,000%'],
          ['비타민D', '375 μg', '3,750%'],
          ['판토텐산', '375 mg', '7,500%'],
        ],
        barcode: '8 800283 720846',
        itemCode: '11077-1507',
      };
    } else if (lower.includes('시카') || lower.includes('cica') || lower.includes('1524') || lower.includes('1350')) {
      profile = {
        ...profile,
        detectedLine: 'innerbeauty',
        lineName: '슈퍼시카',
        productName: 'B5',
        foodType: 'hff',
        foodCategoryLabel: '건강기능식품',
        wMm: 75.0,
        hMm: 132.5,
        sideWMm: 40.0,
        benefit: 'CALM & CLEAR',
        points: ['속민감+속진정, 고함량 판토텐산', '밀크세라마이드 1000', '녹차 유래 유산균 함유'],
        ingredient: '판토텐산, 비타민B6, 아연, 셀렌',
        capacity: '건강기능식품 60 g [2 g X 30포]',
        topSubCopy: '피부과 전문의 공동개발',
        topMainCopy: 'V=B SUPER CICA B5',
        leftTitle: '슈퍼시카 B5',
        leftPoints: ['Developed with K-dermatologist', 'High-Potency Pantothenic Acid', 'Milk Ceramide & Cica Complex'],
        directions: '1일 1~2포를 물 없이 그대로 섭취하십시오.',
        warnings: '과량 섭취 시 설사를 일으킬 수 있습니다. 특이체질 및 알레르기 체질은 성분을 확인 후 섭취하십시오.',
        storage: '직사광선 및 고온 다습한 곳을 피하여 서늘한 곳에 보관하십시오.',
        rawMaterials: '판토텐산칼슘, 건조효모(셀렌), 산화아연, 비타민B6염산염, 병풀추출분말, 밀크세라마이드, 어성초추출분말, 히비스커스추출분말, 자일리톨, 레몬요거트향 [우유, 대두 함유]',
        packagingMaterial: '내포장재질 폴리에틸렌(PE)',
        manufacturer: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        nutritionHeader: '1일 섭취량: 1포(2 g) / 열량 5 kcal',
        nutritionRows: [
          ['탄수화물', '2 g', '1%'],
          ['당류', '0 g', '0%'],
          ['판토텐산', '127.1 mg', '2,542%'],
          ['비타민C', '101 mg', '101%'],
          ['비타민D', '30.5 μg', '305%'],
          ['비오틴', '18.9 μg', '63%'],
          ['셀렌', '30 μg', '55%'],
        ],
        barcode: '8 800283 674798',
        itemCode: '11077-1524',
      };
    } else if (lower.includes('pdrn') || lower.includes('1522') || lower.includes('1410')) {
      profile = {
        ...profile,
        detectedLine: 'innerbeauty',
        lineName: '슈퍼콜라겐',
        productName: 'PDRN',
        foodType: 'food',
        foodCategoryLabel: '혼합음료',
        wMm: 100.0,
        hMm: 126.0,
        sideWMm: 49.0,
        benefit: 'FIRM & RENEWED',
        points: ['저분자 피쉬콜라겐 6,000mg', '먹는 PDRN 100mg*', '히알루론산 120mg · 글루타치온 100mg*'],
        ingredient: '저분자피쉬콜라겐펩타이드 20.852%, 연어이리추출물(DNA 85%) 0.408%',
        capacity: '일반식품 201.53 g [28.79 g X 7일분] (255 kcal)',
        topSubCopy: '피부과 전문의 공동개발',
        topMainCopy: 'V=B COLLAGEN PDRN',
        leftTitle: '슈퍼콜라겐 PDRN',
        leftPoints: ['피부과 전문의 공동개발', '바이탈뷰티 랩 연구기반 설계', '레드오렌지맛 액상+정제 이중제형'],
        directions: '1일 1회, 1회 1병을 상단 캡의 정제와 함께 섭취하세요. 섭취 전 흔들어 드시는 것을 권장드립니다.',
        warnings: '용기 개봉 시 손이 다치지 않도록 뚜껑 부위를 조심스럽게 잡아서 개봉하시고, 캡 고리 부분을 삼키지 않도록 주의하시기 바랍니다.',
        storage: '직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관하시고 개봉 후에는 바로 섭취하시기 바랍니다.',
        rawMaterials: '[슈퍼콜라겐 액상] 정제수, 저분자피쉬콜라겐펩타이드, AP콜라겐효소분해펩타이드, 오렌지농축액, 에리스리톨, 히알루론산, 엘라스틴가수분해물, 밀크세라마이드 / [슈퍼 PDRN 정제] 치커리뿌리추출물, 효모추출분말, 연어이리추출물(미국산), 비타민C [우유 함유]',
        packagingMaterial: '용기, 외캡-PP, 내캡, 실링지-PE',
        manufacturer: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        nutritionHeader: '총 내용량 201.53 g (255 kcal)',
        nutritionRows: [
          ['나트륨', '320 mg', '16%'],
          ['탄수화물', '18 g', '6%'],
          ['당류', '6 g', '6%'],
          ['지방', '0 g', '0%'],
          ['단백질', '46 g', '84%'],
          ['비타민C', '700 mg', '700%'],
        ],
        barcode: '8 800283 672046',
        itemCode: '11077-1410',
      };
    } else if (lower.includes('1302') || lower.includes('1289') || lower.includes('1347')) {
      profile = {
        ...profile,
        detectedLine: 'innerbeauty',
        lineName: '슈퍼콜라겐',
        productName: '',
        foodType: 'food',
        foodCategoryLabel: '혼합음료',
        wMm: 100.0,
        hMm: 126.0,
        sideWMm: 48.0,
        benefit: 'DEWY & LIFTED',
        points: ['저분자 콜라겐 3,500mg, 5가지 유형 콜라겐', '9.4배 흡수율*, 전신 초밀착, 흡수 빠른 액상형'],
        ingredient: '저분자피쉬콜라겐펩타이드 12.83%, AP콜라겐효소분해펩타이드 0.37%',
        capacity: '일반식품 350 ml [25 ml x 14앰플] (245 kcal)',
        topSubCopy: '피부과 전문의 공동개발',
        topMainCopy: 'V=B SUPER COLLAGEN',
        leftTitle: '슈퍼콜라겐',
        leftPoints: ['콜라겐·연어추출물·비오틴 올인원 앰플', '5 TYPES COLLAGEN (Type I, II, III, V)', 'LAB PROVEN 피부전문가 공동개발'],
        directions: '성인 1일 1회, 1회 1병(25 ml)을 흔들어 섭취하세요. 매일 저녁 시간 섭취하시면 좋습니다.',
        warnings: '용기 개봉 시 손이 다치지 않도록 뚜껑 부위를 조심스럽게 잡아서 개봉하시기 바랍니다.',
        storage: '직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관하시고 개봉 후에는 바로 섭취하시기 바랍니다.',
        rawMaterials: '정제수, 저분자피쉬콜라겐펩타이드, 믹스베리농축액(포도농축액, 블루베리농축액), 비오틴, 니코틴산아미드, 히알루론산, 엘라스틴펩타이드, 밀크세라마이드, 효모추출물, 비타민C, AP콜라겐효소분해펩타이드 [난류, 쇠고기, 우유 함유]',
        packagingMaterial: '용기-PP, 캡-PE',
        manufacturer: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        nutritionHeader: '총 내용량 350 ml (245 kcal)',
        nutritionRows: [
          ['나트륨', '90 mg', '5%'],
          ['탄수화물', '10 g', '3%'],
          ['당류', '4 g', '4%'],
          ['지방', '0 g', '0%'],
          ['단백질', '51 g', '93%'],
          ['비오틴', '4,200 μg', '14,000%'],
          ['나이아신', '210 mg NE', '1,400%'],
        ],
        barcode: '8 800283 635287',
        itemCode: '11077-1302',
      };
    } else {
      // 슈퍼콜라겐 케라핏
      profile = {
        ...profile,
        detectedLine: 'innerbeauty',
        lineName: '슈퍼콜라겐',
        productName: '케라핏',
        foodType: 'hff',
        foodCategoryLabel: '건강기능식품',
        wMm: 75.0,
        hMm: 132.5,
        sideWMm: 40.0,
        benefit: 'SHINE & YOUTHFUL',
        points: ['3 TYPES 저분자 콜라겐 1,000mg*', '헤드투토, 트리플 뷰티 부스트', '매일 생기+윤기+광채 완성'],
        ingredient: '저분자피쉬콜라겐펩타이드, 비오틴, 판토텐산',
        capacity: '건강기능식품 48 g [1.6 g X 30포]',
        topSubCopy: '피부과 전문의 공동개발',
        topMainCopy: 'V=B SUPER COLLAGEN KERA-FIT',
        leftTitle: '슈퍼콜라겐 케라핏',
        leftPoints: ['Developed with K-dermatologist', 'Type I, III & V Collagen 1,000mg', 'With Biotin and B Vitamins'],
        directions: '1일 1회, 1회 1포를 물 없이 그대로 섭취하십시오.',
        warnings: '특이체질, 알레르기 체질의 경우에는 원료를 확인한 후 섭취하십시오.',
        storage: '직사광선 및 고온 다습한 곳을 피하여 서늘한 곳에 실온 보관하십시오.',
        rawMaterials: '저분자피쉬콜라겐펩타이드, 비오틴, 판토텐산칼슘, 비타민C, 비타민B1, 비타민B2, 비타민B6, 엘라스틴가수분해물, 히알루론산, 밀크세라마이드, 자일리톨 [우유, 대두, 생선 함유]',
        packagingMaterial: '내포장재질 폴리에틸렌(PE)',
        manufacturer: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        distributor: '㈜아모레퍼시픽 / 서울특별시 용산구 한강대로 100',
        nutritionHeader: '1일 섭취량: 1포(1.6 g) / 열량 5 kcal',
        nutritionRows: [
          ['탄수화물', '1 g', '<1%'],
          ['단백질', '1 g', '2%'],
          ['비타민C', '100 mg', '100%'],
          ['비오틴', '30.0 μg', '100%'],
          ['비타민B1', '0.36 mg', '30%'],
          ['비타민B2', '0.42 mg', '30%'],
          ['콜라겐펩타이드', '1,000 mg', '-'],
        ],
        barcode: '8 800283 670912',
        itemCode: '11077-1525',
      };
    }
  }
  // ── 3. NEWCOMMERCE Line Original Files ──
  else if (
    lower.includes('조이스텝') || lower.includes('트루아이') || lower.includes('리버프라임') ||
    lower.includes('프로바이오틱스') || lower.includes('멀티팩') || lower.includes('멀티비타민') ||
    lower.includes('오메가') || lower.includes('뉴커머스') || lower.includes('골드플러스') ||
    lower.includes('슈콜플래티넘') || lower.includes('슈퍼콜라겐골드') || lower.includes('1274') ||
    lower.includes('1273') || lower.includes('1245') || lower.includes('1257') || lower.includes('1262')
  ) {
    profile.detectedLine = 'newcommerce';
    profile.wMm = 80.0;
    profile.hMm = 135.0;
    profile.sideWMm = 42.0;

    if (lower.includes('리버프라임') || lower.includes('1245') || lower.includes('1241')) {
      profile = {
        ...profile,
        detectedLine: 'newcommerce',
        lineName: '리버프라임',
        productName: '',
        foodType: 'hff',
        ingredient: '밀크씨슬추출물분말 216mg, 비타민B1 2.48mg, 비타민B2 2.44mg, 비타민E 3.30mg α-TE',
        capacity: '건강기능식품 40.2 g [(600 mg+1정, 740 mg) x 30포]',
        topSubCopy: '간 건강 · 에너지 대사를 위한 이중 케어',
        topMainCopy: 'VITALBEAUTIE LIVER PRIME',
        leftTitle: '리버프라임 이중 케어',
        leftPoints: ['밀크씨슬추출물: 간 건강에 도움을 줄 수 있음', '비타민B1·B2: 탄수화물과 에너지 대사에 필요', 'LAB PROVEN 고함량 액상+정제 포뮬러'],
        directions: '성인 1일 1회, 1캡슐(적갈색 연질캡슐), 1정(연노랑 정제) 총 2알을 물과 함께 섭취하십시오.',
        rawMaterials: '밀크씨슬추출물분말(이탈리아산), D-α-토코페롤, 비타민B1염산염, 비타민B2, 키토올리고당분말, 대두유, 유당, 해조칼슘, 타우린 [대두, 게, 우유, 돼지고기 함유]',
        itemCode: '11077-1245',
      };
    } else if (lower.includes('올인원') || lower.includes('멀티팩') || lower.includes('1262') || lower.includes('1263') || lower.includes('1236')) {
      profile = {
        ...profile,
        detectedLine: 'newcommerce',
        lineName: '올인원',
        productName: '멀티팩',
        foodType: 'hff',
        ingredient: '코엔자임Q10 100mg, EPA 및 DHA 함유유지 850mg, 마리골드꽃추출물 24mg, 복합비타민미네랄',
        capacity: '건강기능식품 30일분 [1일 1포]',
        topSubCopy: '높은 혈압·혈행·눈 노화 케어·활력 증진',
        topMainCopy: 'VITALBEAUTIE ALL-IN-ONE',
        leftTitle: '올인원 멀티팩 24종 기능성',
        leftPoints: ['복합 비타민 미네랄 21종 고함량 설계', 'rTG 오메가3 (EPA 및 DHA 850mg)', '코엔자임Q10 + 루테인(마리골드꽃추출물)'],
        directions: '성인 1일 1회, 1회 1포를 충분한 물과 함께 섭취하십시오.',
        itemCode: '11077-1262',
      };
    } else if (lower.includes('골드플러스') || lower.includes('1257') || lower.includes('1258')) {
      profile = {
        ...profile,
        detectedLine: 'newcommerce',
        lineName: '메타그린',
        productName: '골드 플러스',
        foodType: 'hff',
        ingredient: '녹차추출물, 은행잎추출물, 바나바잎추출물 (카테킨 360mg, 플라보놀 배당체 28mg, 코로솔산 0.45mg)',
        capacity: '건강기능식품 119.9 g [1정(599.5 mg) x 200정]',
        topSubCopy: '가정의학과전문의 공동개발 4중 케어',
        topMainCopy: 'VITALBEAUTIE META GREEN GOLD PLUS',
        leftTitle: '메타그린 골드 플러스 4중 케어',
        leftPoints: ['체지방 · 콜레스테롤 · 혈당 트리플 케어', '은행잎추출물 혈행 개선 기능성', '가정의학과전문의 공동개발 (LAB PROVEN)'],
        directions: '성인 1일 1회, 1회 2정을 식후 물과 함께 섭취하십시오.',
        itemCode: '11077-1257',
      };
    } else {
      // 조이스텝 골드 (Default New Commerce)
      profile = {
        ...profile,
        detectedLine: 'newcommerce',
        lineName: '조이스텝',
        productName: '골드',
        foodType: 'hff',
        ingredient: '타마린드강황주정추출복합물(TamaFlex) 250mg, 아연 2.55mg, 비타민D 10μg, 크롬 9μg',
        capacity: '건강기능식품 76.65 g [730 mg x 105정]',
        topSubCopy: '재활의학과전문의 공동개발 관절·연골·뼈 3중 케어',
        topMainCopy: 'VITALBEAUTIE JOYSTEP GOLD',
        leftTitle: '조이스텝 골드 3중 멀티 케어',
        leftPoints: ['타마린드강황주정추출복합물 (관절·연골 건강)', '비타민D (뼈의 형성과 유지) · 아연 · 크롬', '재활의학과전문의 공동개발 (LAB PROVEN)'],
        directions: '1일 1회, 1회 1정을 물과 함께 섭취하십시오.',
        rawMaterials: '타마린드강황주정추출복합물(TamaFlex), 건조효모(크롬), 비타민D3혼합제제, 산화아연, 결정셀룰로스, 흰버드나무추출분말, 보스웰리아추출분말, 강황추출물',
        itemCode: '11077-1274',
      };
    }
  }

  // Override dimensions if explicitly specified in filename like 80x161mm
  const dimMatch = combined.match(/(\d{2,3}(?:\.\d+)?)\s*[xX×*]\s*(\d{2,3}(?:\.\d+)?)\s*(?:mm)?/);
  if (dimMatch) {
    const dw = parseFloat(dimMatch[1]);
    const dh = parseFloat(dimMatch[2]);
    if (dw >= 30 && dw <= 250 && dh >= 40 && dh <= 300) {
      profile.wMm = dw;
      profile.hMm = dh;
    }
  }

  return profile;
}

/**
 * Parse XML/SVG-based .ai or .svg file
 */
export function parseSvgAiFile(svgText, fileName = '') {
  const textMatches = [...svgText.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi)].map(m =>
    m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  ).filter(Boolean);

  const info = inferProductInfoFromTextAndName(textMatches.join(' '), fileName);

  const clipMatch = svgText.match(/<clipPath[^>]*>\s*<rect[^>]*width=["']([\d.]+)["'][^>]*height=["']([\d.]+)["']/i);
  if (clipMatch) {
    info.wMm = parseFloat(clipMatch[1]) || info.wMm;
    info.hMm = parseFloat(clipMatch[2]) || info.hMm;
  }

  return {
    format: 'SVG_AI',
    ...info,
    textSnippets: textMatches,
  };
}

/**
 * Parse ArtiosCAD / Adobe Illustrator PostScript .eps dieline file
 */
export function parseEpsDieline(epsText, fileName = '') {
  const lines = epsText.split(/\r\n|\r|\n/);
  let bbox = [0, 0, 840, 800];

  for (const l of lines) {
    if (l.startsWith('%%BoundingBox:')) {
      const p = l.replace('%%BoundingBox:', '').trim().split(/\s+/).map(Number);
      if (p.length >= 4 && !p.some(isNaN)) {
        bbox = p;
        break;
      }
    }
  }

  const [minXPt, minYPt, maxXPt, maxYPt] = bbox;
  const padMm = 6;
  const toX = (pt) => +((pt - minXPt) * PT_TO_MM + padMm).toFixed(2);
  const toY = (pt) => +((maxYPt - pt) * PT_TO_MM + padMm).toFixed(2);
  const totalWMm = +((maxXPt - minXPt) * PT_TO_MM + padMm * 2).toFixed(2);
  const totalHMm = +((maxYPt - minYPt) * PT_TO_MM + padMm * 2).toFixed(2);

  let curLayer = 'cut';
  const paths = [];
  let curD = '';
  let cx = 0, cy = 0;
  const vLines = [];
  const hLines = [];

  for (const raw of lines) {
    const l = raw.trim();
    if (!l || l.startsWith('%')) continue;
    if (l.includes('(*crease)') || l.includes('(*half_crease)') || l.includes('(*perf)')) {
      curLayer = 'crease';
      continue;
    }
    if (l.includes('(*cut)') || l.includes('(*bleed)') || l.includes('(*cut_&_crease)')) {
      curLayer = 'cut';
      continue;
    }
    if (l.includes('(*annotation)') || l.includes('(*text)') || l.includes('(*print_registration)')) {
      curLayer = 'annot';
      continue;
    }

    const tok = l.split(/\s+/);
    const cmd = tok[tok.length - 1];
    if (cmd === 'm' && tok.length >= 3) {
      const x = parseFloat(tok[0]), y = parseFloat(tok[1]);
      if (!isNaN(x) && !isNaN(y)) {
        cx = x; cy = y;
        curD += `M ${toX(x)} ${toY(y)} `;
      }
    } else if ((cmd === 'L' || cmd === 'l') && tok.length >= 3) {
      const nx = parseFloat(tok[0]), ny = parseFloat(tok[1]);
      if (!isNaN(nx) && !isNaN(ny)) {
        curD += `L ${toX(nx)} ${toY(ny)} `;
        const dx = Math.abs(nx - cx) * PT_TO_MM;
        const dy = Math.abs(ny - cy) * PT_TO_MM;
        if (curLayer === 'crease' || curLayer === 'cut') {
          if (dx < 0.6 && dy > 25) {
            vLines.push({
              x: toX((cx + nx) / 2),
              y1: Math.min(toY(cy), toY(ny)),
              y2: Math.max(toY(cy), toY(ny)),
              len: +dy.toFixed(1),
              type: curLayer,
            });
          } else if (dy < 0.6 && dx > 12) {
            hLines.push({
              y: toY((cy + ny) / 2),
              x1: Math.min(toX(cx), toX(nx)),
              x2: Math.max(toX(cx), toX(nx)),
              len: +dx.toFixed(1),
              type: curLayer,
            });
          }
        }
        cx = nx; cy = ny;
      }
    } else if ((cmd === 'C' || cmd === 'c') && tok.length >= 7) {
      const x1 = parseFloat(tok[0]), y1 = parseFloat(tok[1]);
      const x2 = parseFloat(tok[2]), y2 = parseFloat(tok[3]);
      const x3 = parseFloat(tok[4]), y3 = parseFloat(tok[5]);
      if (!isNaN(x3)) {
        curD += `C ${toX(x1)} ${toY(y1)}, ${toX(x2)} ${toY(y2)}, ${toX(x3)} ${toY(y3)} `;
        cx = x3; cy = y3;
      }
    } else if (cmd === 'S' || cmd === 's' || cmd === 'B' || cmd === 'b') {
      if (curD && (curLayer === 'cut' || curLayer === 'crease')) {
        paths.push({ d: curD.trim(), type: curLayer });
      }
      curD = '';
    } else if (cmd === 'N' || cmd === 'n') {
      curD = '';
    }
  }

  const groups = {};
  for (const v of vLines) {
    const key = `${Math.round(v.y1 / 2) * 2}_${Math.round(v.y2 / 2) * 2}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  }
  const bestGroup = Object.values(groups).sort((a, b) => b.length - a.length)[0] || [];

  const allXs = [];
  bestGroup.sort((a, b) => a.x - b.x).forEach(v => {
    if (!allXs.length || Math.abs(v.x - allXs[allXs.length - 1]) > 2.0) {
      allXs.push(v.x);
    }
  });

  let glueFlap = null;
  const xs = [...allXs];
  const bodyY1 = bestGroup[0]?.y1 ?? 46;
  const bodyY2 = bestGroup[0]?.y2 ?? 171;
  const bodyH = +(bodyY2 - bodyY1).toFixed(1);

  if (xs.length >= 6) {
    const leftW = xs[1] - xs[0];
    const rightW = xs[xs.length - 1] - xs[xs.length - 2];
    if (leftW < rightW) {
      glueFlap = { x: xs[0], y: bodyY1, w: +(xs[1] - xs[0]).toFixed(1), h: bodyH };
      xs.shift();
    } else {
      glueFlap = { x: xs[xs.length - 2], y: bodyY1, w: +(xs[xs.length - 1] - xs[xs.length - 2]).toFixed(1), h: bodyH };
      xs.pop();
    }
  } else if (xs.length === 5) {
    const leftGlueLine = vLines.find(v => v.x < xs[0] - 6 && v.x > xs[0] - 25 && v.len > bodyH * 0.7);
    if (leftGlueLine) {
      glueFlap = { x: leftGlueLine.x, y: bodyY1, w: +(xs[0] - leftGlueLine.x).toFixed(1), h: bodyH };
    }
  }

  let panels = null;
  let auxFlaps = [];
  if (xs.length >= 5) {
    const w0 = +(xs[1] - xs[0]).toFixed(1);
    const w1 = +(xs[2] - xs[1]).toFixed(1);
    const w2 = +(xs[3] - xs[2]).toFixed(1);
    const w3 = +(xs[4] - xs[3]).toFixed(1);
    const sideW = Math.min(w1, w3);
    const tuckH = Math.min(18, +(sideW * 0.45).toFixed(1));
    const dustH = +(sideW * 0.75).toFixed(1);

    panels = {
      BACK:   { id: 'BACK',   label: '후면 (BACK)',   x: xs[0], y: bodyY1, w: w0, h: bodyH },
      LEFT:   { id: 'LEFT',   label: '좌측면 (LEFT)', x: xs[1], y: bodyY1, w: w1, h: bodyH },
      FRONT:  { id: 'FRONT',  label: '전면 (FRONT)',  x: xs[2], y: bodyY1, w: w2, h: bodyH },
      RIGHT:  { id: 'RIGHT',  label: '우측면 (RIGHT)',x: xs[3], y: bodyY1, w: w3, h: bodyH },
      TOP:    { id: 'TOP',    label: '상단 (TOP)',    x: xs[2], y: +(bodyY1 - sideW).toFixed(1), w: w2, h: sideW },
      BOTTOM: { id: 'BOTTOM', label: '하단 (BOTTOM)', x: xs[0], y: bodyY2, w: w0, h: sideW },
    };

    if (glueFlap) auxFlaps.push(glueFlap);
    auxFlaps.push(
      { x: xs[2], y: Math.max(2, +(bodyY1 - sideW - tuckH).toFixed(1)), w: w2, h: tuckH, rx: 4 },
      { x: xs[0], y: +(bodyY2 + sideW).toFixed(1), w: w0, h: tuckH, rx: 4 },
      { x: xs[1], y: +(bodyY1 - dustH).toFixed(1), w: w1, h: dustH },
      { x: xs[3], y: +(bodyY1 - dustH).toFixed(1), w: w3, h: dustH },
      { x: xs[1], y: bodyY2, w: w1, h: dustH },
      { x: xs[3], y: bodyY2, w: w3, h: dustH },
      { x: xs[2], y: bodyY2, w: w2, h: dustH },
      { x: xs[0], y: +(bodyY1 - dustH).toFixed(1), w: w0, h: dustH }
    );
  }

  return {
    format: 'EPS_DIELINE',
    fileName,
    totalWMm,
    totalHMm,
    paths,
    panels,
    auxFlaps,
    ...inferProductInfoFromTextAndName(epsText.slice(0, 4000), fileName),
  };
}

/**
 * Universal parser for any uploaded .ai / .pdf / .eps / .svg file
 */
export async function parseUploadedArtworkOrDieline(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const headStr = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 2048));

  if (headStr.includes('<svg') || headStr.trim().startsWith('<?xml')) {
    const fullText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return parseSvgAiFile(fullText, file.name);
  }

  if (headStr.startsWith('%!PS-Adobe') && !headStr.includes('%PDF-')) {
    const latinText = new TextDecoder('iso-8859-1').decode(bytes);
    return parseEpsDieline(latinText, file.name);
  }

  const rawScan = scanRawPdfAiBinary(bytes);

  try {
    const pdfDoc = await loadPdfAiDocument(buffer);
    const meta = await extractPdfAiMetadata(pdfDoc);
    const inferred = inferProductInfoFromTextAndName(meta?.allText || '', file.name, rawScan);
    return {
      format: 'PDF_AI',
      pdfDoc,
      ...meta,
      ...rawScan,
      ...inferred,
    };
  } catch (e) {
    const latinText = new TextDecoder('iso-8859-1').decode(bytes);
    if (latinText.includes('(*cut)') || latinText.includes('%%BoundingBox:')) {
      return parseEpsDieline(latinText, file.name);
    }
    return {
      format: 'BINARY_AI',
      ...rawScan,
      ...inferProductInfoFromTextAndName('', file.name, rawScan),
    };
  }
}
