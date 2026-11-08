/* ═══════════════════════════════════════
   Governance Engines (rule-based, deterministic)
   ═══════════════════════════════════════ */
import { getContrastRatio } from '../utils/helpers.js';
import { IDENTITY, VISUAL_DNA, PACKAGE_LINES, REGULATIONS, LOCALE_TYPO } from '../data/governance.js';
import { MG_LINE, SIZE_CLASS, TYPO, HFF_MARK, CLAIM_KEYWORDS, PT_MM } from '../data/packageFront.js';
import { PANTONE_SOLID_COATED, REPRESENTATIVE_COLOR_CHIPS, GLOBAL_FUNCTION_COLOR_DB } from '../data/pantoneCoated.js';

/* ─── Color science ─── */
export function hexToLab(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const x = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047;
  const y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  const z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

export function labToHex([L, a, b]) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const inv = t => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);
  const X = inv(fx) * 0.95047, Y = inv(fy), Z = inv(fz) * 1.08883;
  let rgb = [
    X * 3.2406 - Y * 1.5372 - Z * 0.4986,
    -X * 0.9689 + Y * 1.8758 + Z * 0.0415,
    X * 0.0557 - Y * 0.204 + Z * 1.057,
  ];
  const inGamut = rgb.every(v => v >= -0.001 && v <= 1.001);
  rgb = rgb.map(v => Math.min(1, Math.max(0, v)))
    .map(v => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
  const hex = '#' + rgb.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  return { hex, inGamut };
}

export function deltaE2000(l1, l2) {
  const [L1, a1, b1] = l1, [L2, a2, b2] = l2;
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (b, a) => { const v = Math.atan2(b, a) / rad; return v < 0 ? v + 360 : v; };
  const h1p = h(b1, a1p), h2p = h(b2, a2p);
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = h2p - h1p;
  if (C1p * C2p === 0) dhp = 0; else if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) hbp = Math.abs(h1p - h2p) > 180 ? (hbp + 360) / 2 : hbp / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad)
    + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const RT = -2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * Math.sin(2 * dTheta * rad);
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}

/* ─── 모듈 1: Logo Placement ─── */
const ANCHOR_POS = {
  'top-center': (W, H, w, h, m) => [(W - w) / 2, m],
  'top-left': (W, H, w, h, m) => [m, m],
  'center': (W, H, w, h) => [(W - w) / 2, (H - h) / 2],
  'upper-third': (W, H, w, h) => [(W - w) / 2, H / 3 - h / 2],
  'bottom-right': (W, H, w, h, m) => [W - w - m, H - h - m],
};

export function suggestLogo(tpKey, bgHex, custom = {}) {
  const tp = { ...IDENTITY.touchpoints[tpKey], ...custom };
  const { aspect, clearspace, minPrintMm, minDigitalPx } = IDENTITY.logo;
  let width = tp.w * ((tp.sizeRatio[0] + tp.sizeRatio[1]) / 2);
  const notes = [];
  const minW = tp.unit === 'mm' ? minPrintMm : minDigitalPx;
  if (width < minW) { notes.push(`최소 크기 ${minW}${tp.unit}로 보정`); width = minW; }
  if (tp.viewDistanceM) {
    const minH = (tp.viewDistanceM * 1000) / 250; // 시인거리 공식
    if (width / aspect < minH) { width = minH * aspect; notes.push(`시인거리 ${tp.viewDistanceM}m 기준 높이 ${minH.toFixed(0)}mm 이상으로 보정`); }
  }
  const height = width / aspect;
  const margin = height * clearspace * 2;
  if (width + margin * 2 > tp.w) { width = tp.w - margin * 2; notes.push('캔버스 폭에 맞춰 축소'); }

  const ranked = IDENTITY.versions
    .map(v => ({ ...v, contrast: +getContrastRatio(v.hex, bgHex) }))
    .sort((a, b) => b.contrast - a.contrast);

  const candidates = tp.anchors.flatMap(anchor => ranked.slice(0, 2).map(v => {
    const [x, y] = ANCHOR_POS[anchor](tp.w, tp.h, width, width / aspect, margin);
    const pass = v.contrast >= IDENTITY.minContrast;
    const score = Math.round(Math.min(v.contrast / 7, 1) * 70 + (anchor === tp.anchors[0] ? 30 : 18));
    return { anchor, version: v, x, y, w: width, h: width / aspect, pass, score };
  })).sort((a, b) => b.score - a.score);

  return { tp, candidates, notes, margin };
}

/* ─── 모듈 2: Visual DNA (VITALBEAUTIE 원형 엠블럼 & 라인별 배지 생성기) ─── */
const PICTOGRAM_LIBRARY = [
  {
    key: 'sugar-cut',
    match: ['혈당', '당류', '설탕', 'blood', 'sugar', '글루코스', '식후혈당'],
    arcEn: 'Blood Sugar Cut',
    ko: '혈당 컷',
    draw: () => `
      <path d="M29 31.5c3-4.2 5.5-7.4 5.5-10.3" stroke-dasharray="1.5 1.5"/>
      <polygon points="31,32 39,28 45,32 45,40 37,44 31,40" />
      <polyline points="31,32 37,36 45,32" />
      <line x1="37" y1="36" x2="37" y2="44" />
      <path d="M24 27c2 2.6 3.5 4.8 3.5 6.8a3.5 3.5 0 0 1-7 0c0-2 1.5-4.2 3.5-6.8z" />`,
  },
  {
    key: 'carbo-cut',
    match: ['탄수화물', '체지방', '더블컷', '가르시니아', '컷', '슬리밍', '다이어트', 'carbo', 'fat', 'cut'],
    arcEn: 'Carbo Cut',
    ko: '탄수화물 컷',
    draw: () => `
      <circle cx="25.5" cy="30" r="3.4" />
      <circle cx="25.5" cy="40" r="3.4" />
      <line x1="28.3" y1="31.8" x2="43.5" y2="41.5" />
      <line x1="28.3" y1="38.2" x2="43.5" y2="28.5" />
      <line x1="19" y1="35" x2="46" y2="35" stroke-dasharray="1.6 1.8" />`,
  },
  {
    key: 'water',
    match: ['물', '수분', '보습', '워터', '히알루론산', 'water', 'hydration', '콜라겐'],
    arcEn: 'Take with water',
    ko: '물과 함께',
    draw: () => `
      <polygon points="24,25 40,25 37.6,44 26.4,44" />
      <path d="M25.2 33c2.2-1.4 4.5-1.4 6.8 0s4.6 1.4 6.8 0" />
      <ellipse cx="32" cy="28" rx="4.2" ry="1.7" transform="rotate(-18 32 28)" />`,
  },
  {
    key: 'tablet',
    match: ['하루 한 알', '1정', '타블렛', '정제', '캡슐', 'tablet', 'pill'],
    arcEn: '1 Tablet a day',
    ko: '하루 한 알',
    draw: () => `
      <g transform="rotate(-32 32 35)">
        <rect x="21" y="29" width="22" height="12" rx="6" />
        <line x1="32" y1="29" x2="32" y2="41" />
      </g>`,
  },
  {
    key: 'stick',
    match: ['하루 한 포', '스틱', '분말', '파우더', '젤리', '포', 'stick', 'powder'],
    arcEn: '1 Stick a Day',
    ko: '하루 한 포',
    draw: () => `
      <polygon points="23,41 37,24 42,28 28,45" />
      <line x1="35" y1="26.5" x2="40" y2="30.5" />
      <circle cx="23" cy="30" r="0.9" fill="currentColor" stroke="none"/>
      <circle cx="20" cy="34" r="0.9" fill="currentColor" stroke="none"/>`,
  },
  {
    key: 'ampoule',
    match: ['앰플', '부스터', '샷', '병', '하루 한 병', 'ampoule', 'shot', 'drink'],
    arcEn: '1 Ampoule a day',
    ko: '하루 한 병',
    draw: () => `
      <rect x="26" y="29" width="12" height="15" rx="1.5" />
      <rect x="28.5" y="24" width="7" height="5" />
      <line x1="26" y1="34" x2="38" y2="34" />
      <line x1="26" y1="40" x2="38" y2="40" />`,
  },
  {
    key: 'active',
    match: ['운동', '근육', '크레아틴', '활력', '덤벨', '헬스', '파워', 'active', 'workout', 'muscle'],
    arcEn: 'Active Up',
    ko: '활력 충전',
    draw: () => `
      <rect x="20" y="30" width="3.2" height="10" rx="1" />
      <rect x="23.2" y="28" width="3.2" height="14" rx="1" />
      <line x1="26.4" y1="35" x2="37.6" y2="35" />
      <rect x="37.6" y="28" width="3.2" height="14" rx="1" />
      <rect x="40.8" y="30" width="3.2" height="10" rx="1" />`,
  },
  {
    key: 'protein',
    match: ['단백질', '프로틴', '퍼포먼스', '부스터', 'protein', 'booster', 'performance'],
    arcEn: 'Protein Booster',
    ko: '단백질 부스터',
    draw: () => `
      <path d="M23 39c0-5 3.5-9 7.5-9 2.5 0 4 1.8 4 4 0 3.2-3.2 4.5-3.2 4.5s4.5.8 6.5-2.5c1.5-2.5.8-6.5-1.5-8.5" />
      <path d="M23 39c1.5 3.5 6 5 11 4.2 4-.6 7-3.5 7.5-7.2" />`,
  },
  {
    key: 'meal',
    match: ['식사', '식전', '식후', '효소', '소화', 'meal', 'before', 'after', 'enzyme'],
    arcEn: 'Before Meals',
    ko: '식사 전후',
    draw: () => `
      <circle cx="32" cy="35" r="7.2" />
      <circle cx="32" cy="35" r="4.2" />
      <line x1="21.5" y1="28" x2="21.5" y2="42" />
      <path d="M20 28v4.5c0 1 .7 1.6 1.5 1.6s1.5-.6 1.5-1.6V28" />
      <path d="M42.5 28v14M42.5 28c1.5 1.5 1.8 4.5 0 6" />`,
  },
  {
    key: 'balance',
    match: ['밸런스', '대사', '신진대사', '라인', '순환', 'balance', 'metabolism', 'body'],
    arcEn: 'Body Balance',
    ko: '대사 밸런스',
    draw: () => `
      <path d="M24 25c2.2 4.5 2.2 9.5 0 19" />
      <path d="M40 25c-2.2 4.5-2.2 9.5 0 19" />
      <path d="M28.5 34a3.8 3.8 0 1 1 6.6 2.5" />
      <polyline points="35.5,33.5 35.2,36.8 32,36.2" />`,
  },
  {
    key: 'gut',
    match: ['장', '배변', '쾌변', '유산균', '식이섬유', '클렌즈', '프로바이오틱스', 'gut', 'fiber', 'cleanse'],
    arcEn: 'High Fiber Care',
    ko: '장 건강·식이섬유',
    draw: () => `
      <path d="M25 27h11a3.2 3.2 0 0 1 0 6.4H28a3.2 3.2 0 0 0 0 6.4h11" />
      <polyline points="36,37.5 39.5,39.8 36,42.1" />
      <circle cx="25" cy="27" r="1.2" fill="currentColor" stroke="none"/>`,
  },
  {
    key: 'apple-cider',
    match: ['사과', '애사비', '식초', '초모', 'apple', 'vinegar', 'cider'],
    arcEn: 'Apple Cider Vinegar',
    ko: '사과초모식초',
    draw: () => `
      <path d="M32 29c-3.5-2-7.5.5-7.5 5.2 0 4.8 3.5 9.3 6.2 9.3.8 0 1.3-.4 1.3-.4s.5.4 1.3.4c2.7 0 6.2-4.5 6.2-9.3 0-4.7-4-7.2-7.5-5.2z" />
      <path d="M32 28.5c0-2.5 1.8-4.2 4-4.5.2 2.2-1.4 4.2-4 4.5z" />`,
  },
  {
    key: 'citrus-vitamin',
    match: ['비타민', '레몬', '오렌지', '시트러스', '헤스페리딘', '항산화', '레티놀', 'vitamin', 'citrus', 'lemon'],
    arcEn: 'Citrus Vitamin',
    ko: '비타민·항산화',
    draw: () => `
      <path d="M23 39a10.5 10.5 0 0 1 18-11z" />
      <path d="M25.2 37.2a7.8 7.8 0 0 1 13.5-8.2" />
      <line x1="32" y1="33" x2="28" y2="28.5" />
      <line x1="32" y1="33" x2="34.5" y2="27.2" />`,
  },
  {
    key: 'mineral',
    match: ['미네랄', '칼륨', '마그네슘', '아연', '철분', '브이레디', 'mineral', 'blend'],
    arcEn: 'Mineral Blend',
    ko: '미네랄 블렌드',
    draw: () => `
      <circle cx="29" cy="35" r="5.8" />
      <circle cx="35" cy="35" r="5.8" />
      <text x="27" y="36.6" font-size="4.4" font-family="sans-serif" font-weight="600" fill="currentColor" stroke="none" text-anchor="middle">K</text>
      <text x="36.8" y="36.6" font-size="4.1" font-family="sans-serif" font-weight="600" fill="currentColor" stroke="none" text-anchor="middle">Mg</text>`,
  },
  {
    key: 'energy',
    match: ['에너지', '피로', '비타민b', '부스팅', '집중', '기억력', 'energy', 'recharging', 'focus'],
    arcEn: 'Energy Recharging',
    ko: '에너지 충전',
    draw: () => `
      <polygon points="33.5,24.5 25.5,35.5 31.5,35.5 30,44.5 38.5,33.2 32.5,33.2" />`,
  },
  {
    key: 'sleep-relax',
    match: ['수면', '숙면', '가바', '릴렉스', '진정', '스트레스', 'sleep', 'relax', 'calm', 'cica'],
    arcEn: 'Deep Sleep Care',
    ko: '숙면·릴렉스',
    draw: () => `
      <path d="M35.5 25.5a8.5 8.5 0 1 0 3 15.2 7.2 7.2 0 0 1-3-15.2z" />
      <path d="M38 27v3M36.5 28.5h3" />`,
  },
  {
    key: 'joint-bone',
    match: ['관절', '연골', '뼈', '칼슘', '조이스텝', 'joint', 'bone', 'step'],
    arcEn: 'Joint & Bone Care',
    ko: '관절·연골 케어',
    draw: () => `
      <path d="M24 31a2.5 2.5 0 1 1 2.5-2.5h11A2.5 2.5 0 1 1 40 31v4a2.5 2.5 0 1 1-2.5 2.5h-11A2.5 2.5 0 1 1 24 35z" />`,
  },
  {
    key: 'eye-liver',
    match: ['눈', '루테인', '오메가', '트루아이', '간', '밀크씨슬', '리버', 'eye', 'omega', 'liver'],
    arcEn: 'Clear Care Formula',
    ko: '집중 케어',
    draw: () => `
      <path d="M21.5 35c3-5 6.8-7.2 10.5-7.2S39.5 30 42.5 35c-3 5-6.8 7.2-10.5 7.2S24.5 40 21.5 35z" />
      <circle cx="32" cy="35" r="3.2" />`,
  },
  {
    key: 'ginseng-immunity',
    match: ['면역', '홍삼', '인삼', '진생', '명작수', '활', '천', 'immunity', 'ginseng', 'royal'],
    arcEn: 'Lab Proven Formula',
    ko: '면역·명작 포뮬라',
    draw: () => `
      <ellipse cx="32" cy="35" rx="9.5" ry="4.2" />
      <ellipse cx="32" cy="35" rx="9.5" ry="4.2" transform="rotate(60 32 35)" />
      <ellipse cx="32" cy="35" rx="9.5" ry="4.2" transform="rotate(-60 32 35)" />
      <circle cx="32" cy="35" r="1.6" fill="currentColor" stroke="none" />`,
  },
];

export function matchFunctionalPictogram(keyword = '') {
  const q = keyword.trim().toLowerCase();
  if (!q) return PICTOGRAM_LIBRARY[0];
  for (const item of PICTOGRAM_LIBRARY) {
    if (item.match.some(m => q.includes(m.toLowerCase()))) return item;
  }
  // 키워드가 사전에 없으면 문자열 해시로 일관된 복합 모티프 선택
  const hash = [...q].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PICTOGRAM_LIBRARY[hash % PICTOGRAM_LIBRARY.length];
}

export function getPictogramLibrary() {
  return PICTOGRAM_LIBRARY;
}

/**
 * VITALBEAUTIE 공식 icon.svg 스타일을 그대로 따르는 기능 아이콘 생성
 * styleVariant:
 *  - 'metagreen'  : 56.7×56.7pt 원형 1.2pt 보더 + 상단 곡선 영문 아크 + 0.8pt round 픽토그램 (389C / 화이트 / 블랙)
 *  - 'innerbeauty': 솔리드 원형 배경 + 화이트 반전 픽토그램
 *  - 'vitalcleanse': 솔리드 블랙 원형 + 상하 영문 아크 + 중앙 네온 픽토그램
 *  - 'myeongjaksu': 명작수 육각 프레임 + 픽토그램
 */
export function generateCustomDnaIcon({
  keyword = '혈당 컷',
  enArc = '',
  styleVariant = 'metagreen',
  colorTheme = 'metagreen-lime',
} = {}) {
  const matched = matchFunctionalPictogram(keyword);
  const topText = (enArc && enArc.trim()) || matched.arcEn;
  const themes = {
    'metagreen-lime': { bg: '#CEDC00', fg: '#00843D', ring: '#00843D' },
    'metagreen-white': { bg: 'none', fg: '#1D1D1B', ring: '#1D1D1B' },
    'innerbeauty-pink': { bg: '#E31C79', fg: '#FFFFFF', ring: '#E31C79' },
    'cleanse-black': { bg: '#101820', fg: '#FFFFFF', ring: '#101820' },
    'myeongjaksu-gold': { bg: '#FEF8E7', fg: '#4F2C1D', ring: '#4F2C1D' },
  };
  const pal = themes[colorTheme] || themes['metagreen-lime'];

  const isHex = styleVariant === 'myeongjaksu';
  const isSolid = styleVariant === 'innerbeauty' || styleVariant === 'vitalcleanse';

  const frameSvg = isHex
    ? `<polygon points="18,7 46,7 59,32 46,57 18,57 5,32" fill="${pal.bg === 'none' ? '#FEF8E7' : pal.bg}" stroke="${pal.ring}" stroke-width="1.2" stroke-linejoin="round"/>`
    : `<circle cx="32" cy="32" r="28.35" fill="${isSolid ? (pal.bg === 'none' ? '#101820' : pal.bg) : pal.bg}" stroke="${pal.ring}" stroke-width="1.2"/>`;

  const arcSvg = isHex ? '' : `
    <defs>
      <path id="vb-arc-top" d="M 10.5,32 A 21.5,21.5 0 1,1 53.5,32" />
    </defs>
    <text fill="${isSolid ? '#FFFFFF' : pal.fg}" font-family="'Exo 2','Raleway',sans-serif" font-size="5.6" font-weight="600" letter-spacing="0.45">
      <textPath href="#vb-arc-top" startOffset="50%" text-anchor="middle">${topText.slice(0, 22)}</textPath>
    </text>`;

  const iconInk = isSolid ? '#FFFFFF' : pal.fg;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  ${frameSvg}
  ${arcSvg}
  <g fill="none" stroke="${iconInk}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color:${iconInk}">
    ${matched.draw()}
  </g>
</svg>`;

  return { svg, matched, topText, pal };
}

/**
 * Adobe Illustrator (.ai) 호환 벡터 파일 생성
 * Illustrator는 PostScript / PDF-1.5 기반 .ai 또는 XML SVG 스트림을 직접 열 수 있으나,
 * 실무 호환성이 가장 높은 PDF-1.4 / AI 10+ 하이브리드 벡터 컨테이너(.ai)로 패키징하거나
 * Illustrator 전용 메타데이터가 포함된 AI-SVG 벡터 파일로 내보낸다.
 */
export function buildIllustratorAiBlob(svgText, title = 'VITALBEAUTIE_Icon') {
  const vbMatch = svgText.match(/viewBox="([^"]+)"/i);
  const vb = vbMatch ? vbMatch[1].trim().split(/[\s,]+/).map(Number) : [0, 0, 64, 64];
  const pw = Math.round(vb[2] || 64);
  const ph = Math.round(vb[3] || 64);
  const aiHeader = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 27.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [
  <!ENTITY ns_ai "http://ns.adobe.com/AdobeIllustrator/10.0/">
  <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/">
]>
`;
  const body = svgText
    .replace(/^<\?xml[^>]*\?>\s*/i, '')
    .replace('<svg ', `<svg xmlns:i="&ns_ai;" i:viewOrigin="0 ${ph}" i:rulerOrigin="0 0" i:pageBounds="0 ${ph} ${pw} 0" data-name="${title}" `);
  return new Blob([aiHeader + body], { type: 'application/postscript;charset=utf-8' });
}

export function generateDnaIcon(shapeKey, accentKey, withMotif = true) {
  return generateCustomDnaIcon({ keyword: shapeKey, enArc: accentKey }).svg;
}

export function checkDna(svgText) {
  const d = VISUAL_DNA;
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return [{ rule: 'SVG 파싱', status: 'fail', detail: '유효한 SVG가 아닙니다' }];
  const res = [];
  const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  const validGrid = (vb[2] === 64 && vb[3] === 64) || (vb[2] === d.grid && vb[3] === d.grid);
  res.push({ rule: '엠블럼 규격 그리드 (64×64pt · 원형 R28.35)', status: validGrid ? 'pass' : 'warn', detail: `viewBox ${vb.join(' ') || '없음'}` });

  const els = [...svg.querySelectorAll('*')];
  const attr = (el, n) => el.getAttribute(n) ?? el.closest(`[${n}]`)?.getAttribute(n);
  const strokes = [...new Set(els.filter(e => attr(e, 'stroke') && attr(e, 'stroke') !== 'none').map(e => parseFloat(attr(e, 'stroke-width') || 1)))];
  const okStroke = strokes.every(s => s >= 0.6 && s <= 1.8);
  res.push({ rule: 'VITALBEAUTIE 선 두께 규격 (보더 1.2pt · 픽토그램 0.8~1.2pt)', status: okStroke ? 'pass' : 'warn', detail: `사용: ${strokes.join(', ') || '-'}pt` });

  const caps = [...new Set(els.map(e => attr(e, 'stroke-linecap')).filter(Boolean))];
  res.push({ rule: '선 끝 Round 마감 (stroke-linecap: round)', status: caps.includes('round') ? 'pass' : 'warn', detail: caps.join(', ') || '미지정' });

  const hasCircleOrHex = svg.querySelector('circle, polygon');
  res.push({ rule: '시그니처 외곽 프레임 (원형 배지 / 명작수 육각)', status: hasCircleOrHex ? 'pass' : 'fail', detail: hasCircleOrHex ? '프레임 확인' : '외곽 배지 누락' });

  const hasArc = svg.querySelector('textPath, text');
  res.push({ rule: '상단 아크 타이포그래피 (Exo 2 / Raleway)', status: hasArc ? 'pass' : 'warn', detail: hasArc ? '아크 캡션 포함' : '픽토그램 단독' });
  return res;
}

/* ─── 모듈 3: Family Look (글로벌 건강기능식품·일반식품 컬러 세미오틱스 & 전 영역 PANTONE Solid Coated 추천) ─── */
const PANTONE_COATED_WITH_LAB = PANTONE_SOLID_COATED.map(p => {
  const lab = hexToLab(p.hex);
  const C = Math.hypot(lab[1], lab[2]);
  const hue = ((Math.atan2(lab[2], lab[1]) * 180) / Math.PI + 360) % 360;
  return { ...p, lab, L: lab[0], C, hue };
});

function nearestPantoneName(lab) {
  let best = PANTONE_COATED_WITH_LAB[0];
  let minD = Infinity;
  for (const p of PANTONE_COATED_WITH_LAB) {
    const d = deltaE2000(lab, p.lab);
    if (d < minD) {
      minD = d;
      best = p;
    }
  }
  return best.code;
}

/**
 * 입력한 성분·기능·카테고리 키워드를 분석하여
 * 글로벌 건강기능식품·일반식품 시장에서 통용되는 대표 컬러 계열과 그 이유를 반환
 */
export function resolveGlobalFunctionColor(funcText = '') {
  const raw = (funcText || '').trim();
  const q = raw.toLowerCase();

  if (!raw) {
    return {
      keyword: '웰니스 포뮬라',
      categoryTitle: '하이퍼포먼스 웰니스 (High-Performance Wellness)',
      globalColorName: '보태니컬 그린 · 코발트 블루 · 코랄 핑크 계열',
      globalReason: '성분이나 기능을 입력하면 글로벌 건강기능식품·일반식품 시장에서 해당 원료와 효능을 상징하는 표준 컬러 계열과 선정 근거를 제안합니다.',
      preferredTones: ['green', 'blue', 'pink', 'orange'],
    };
  }

  // 1) GLOBAL_FUNCTION_COLOR_DB에서 가장 매칭 점수가 높은 항목 탐색 (복수 키워드 지원)
  const matchedEntries = [];
  for (const entry of GLOBAL_FUNCTION_COLOR_DB) {
    let score = 0;
    for (const kw of entry.keywords) {
      const k = kw.toLowerCase();
      if (q === k) score += 30;
      else if (q.includes(k)) score += 12 + k.length;
      else if (k.length >= 2 && k.includes(q)) score += 8;
    }
    if (score > 0) {
      matchedEntries.push({ entry, score });
    }
  }

  matchedEntries.sort((a, b) => b.score - a.score);

  if (matchedEntries.length === 1) {
    const top = matchedEntries[0].entry;
    return {
      keyword: raw,
      categoryTitle: top.categoryTitle,
      globalColorName: top.globalColorName,
      globalReason: top.globalReason,
      preferredTones: top.preferredTones,
    };
  }

  if (matchedEntries.length >= 2) {
    const top1 = matchedEntries[0].entry;
    const top2 = matchedEntries[1].entry;
    if (matchedEntries[1].score >= matchedEntries[0].score * 0.55 && top1.id !== top2.id) {
      const combinedTones = [...new Set([...top1.preferredTones, ...top2.preferredTones])];
      return {
        keyword: raw,
        categoryTitle: `${top1.categoryTitle.split('(')[0].trim()} × ${top2.categoryTitle.split('(')[0].trim()}`,
        globalColorName: `${top1.globalColorName.replace(/ 계열$/, '')} & ${top2.globalColorName}`,
        globalReason: `[${top1.categoryTitle.split('·')[0].trim()}] ${top1.globalReason} 또한 [${top2.categoryTitle.split('·')[0].trim()}] 측면에서는 ${top2.globalReason}`,
        preferredTones: combinedTones,
      };
    }
    return {
      keyword: raw,
      categoryTitle: top1.categoryTitle,
      globalColorName: top1.globalColorName,
      globalReason: top1.globalReason,
      preferredTones: top1.preferredTones,
    };
  }

  // 2) 사전에 없는 신규 원료/일반식품 키워드가 입력된 경우 의미 추론
  const fallbackPool = GLOBAL_FUNCTION_COLOR_DB;
  const hash = [...q].reduce((a, c) => a + c.charCodeAt(0), 0);
  const inferred = fallbackPool[hash % fallbackPool.length];
  return {
    keyword: raw,
    categoryTitle: `글로벌 뉴트리션 · 기능성 포뮬라 (${raw})`,
    globalColorName: inferred.globalColorName,
    globalReason: `글로벌 건강기능식품 및 일반식품 패키지에서 「${raw}」 관련 성분·기능을 시각적으로 직관화할 때, 원료의 신뢰감과 생체 활력을 전달하는 ${inferred.globalColorName}이(가) 통용됩니다. ${inferred.globalReason}`,
    preferredTones: inferred.preferredTones,
  };
}

export function suggestChips(options = {}, count = 8) {
  const opts = Array.isArray(options) ? { extraHex: options } : options;
  const minDeltaE = opts.minDeltaE || PACKAGE_LINES.familyRules.minDeltaE;
  const funcText = opts.funcText || '';
  const selectedToneId = opts.selectedToneId || 'auto';
  const offset = opts.offset || 0;

  const globalAnalysis = resolveGlobalFunctionColor(funcText);
  const selectedChipObj = REPRESENTATIVE_COLOR_CHIPS.find(c => c.id === selectedToneId) || REPRESENTATIVE_COLOR_CHIPS[0];

  // 대상 컬러 패밀리 결정: 대표 컬러칩을 직접 선택한 경우 해당 패밀리 우선, 'auto'인 경우 키워드 기반 글로벌 추천 패밀리 적용
  const targetFamilies = selectedToneId !== 'auto'
    ? [selectedToneId]
    : globalAnalysis.preferredTones;

  // 바이탈뷰티 기존 전 제품 팬톤칩 DB (중복 제외 대상)
  const usedList = PACKAGE_LINES.allProducts.map(p => ({
    ...p,
    normCode: p.pantone.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, ''),
    lab: hexToLab(p.hex),
  }));
  const usedCodes = new Set(usedList.map(u => u.normCode));

  // 전체 PANTONE Solid Coated 중 기존 제품과 겹치지 않는 후보 필터링
  const candidates = [];
  for (const pms of PANTONE_COATED_WITH_LAB) {
    if (!targetFamilies.includes(pms.family)) continue;
    const normPms = pms.code.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, '');
    if (usedCodes.has(normPms)) continue;

    let nearest = usedList[0];
    let minD = Infinity;
    for (const u of usedList) {
      const d = deltaE2000(u.lab, pms.lab);
      if (d < minD) {
        minD = d;
        nearest = u;
      }
    }

    if (minD >= minDeltaE) {
      const famRank = targetFamilies.indexOf(pms.family);
      const score = (10 - famRank * 2) * 10 + Math.min(minD, 38);
      candidates.push({
        pantoneCode: pms.code,
        hex: pms.hex,
        family: pms.family,
        lab: pms.lab,
        minD,
        hue: Math.round(pms.hue),
        score,
        nearestName: nearest.name,
        nearestPantone: nearest.pantone,
        nearestHex: nearest.hex,
      });
    }
  }

  // 만약 엄격한 minDeltaE로 인해 후보가 부족하면 기준을 소폭 완화해 최소 count개 확보
  if (candidates.length < count) {
    for (const pms of PANTONE_COATED_WITH_LAB) {
      if (!targetFamilies.includes(pms.family)) continue;
      if (candidates.some(c => c.pantoneCode === pms.code)) continue;
      const normPms = pms.code.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, '');
      if (usedCodes.has(normPms)) continue;

      let nearest = usedList[0];
      let minD = Infinity;
      for (const u of usedList) {
        const d = deltaE2000(u.lab, pms.lab);
        if (d < minD) {
          minD = d;
          nearest = u;
        }
      }
      if (minD >= 7) {
        candidates.push({
          pantoneCode: pms.code,
          hex: pms.hex,
          family: pms.family,
          lab: pms.lab,
          minD,
          hue: Math.round(pms.hue),
          score: minD,
          nearestName: nearest.name,
          nearestPantone: nearest.pantone,
          nearestHex: nearest.hex,
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const stride = count;
  const startIdx = (offset * stride) % Math.max(1, candidates.length);
  const rotated = [...candidates.slice(startIdx), ...candidates.slice(0, startIdx)];

  const picked = [];
  for (const c of rotated) {
    if (picked.every(q => deltaE2000(q.lab, c.lab) >= 7.5)) {
      picked.push(c);
    }
    if (picked.length >= count) break;
  }
  for (const c of rotated) {
    if (picked.length >= count) break;
    if (!picked.includes(c)) picked.push(c);
  }

  return {
    picked,
    globalAnalysis,
    selectedChipObj,
    totalChecked: usedList.length,
    totalPantoneLearned: PANTONE_COATED_WITH_LAB.length,
  };
}

export function checkChip(hex) {
  const lab = hexToLab(hex);
  const { lightness, chroma, minDeltaE } = PACKAGE_LINES.familyRules;
  const C = Math.hypot(lab[1], lab[2]);
  const hue = ((Math.atan2(lab[2], lab[1]) * 180) / Math.PI + 360) % 360;
  // 전체 제품 DB 기준으로 가장 가까운 팬톤칩 계산
  const seen = new Set();
  const uniqueProducts = PACKAGE_LINES.allProducts.filter(p => {
    const k = `${p.pantone}-${p.hex}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const dist = uniqueProducts
    .map(l => ({ ...l, dE: deltaE2000(hexToLab(l.hex), lab) }))
    .sort((a, b) => a.dE - b.dE);
  return {
    lab,
    C,
    hue,
    pantoneCode: nearestPantoneName(lab, hue),
    dist,
    inTone: lab[0] >= lightness[0] - 3 && lab[0] <= lightness[1] + 3 && C >= chroma[0] - 4 && C <= chroma[1] + 4,
    distinct: dist[0].dE >= minDeltaE,
  };
}

export function checkSpecScale(measures) {
  const { specs, baseSpec, tolerance } = PACKAGE_LINES;
  const base = specs.find(s => s.id === baseSpec);
  return specs.map(s => {
    const scale = Math.min(s.w / base.w, s.h / base.h);
    const els = Object.fromEntries(PACKAGE_LINES.elements.map(el => {
      const expected = measures[baseSpec][el] * scale;
      const actual = measures[s.id][el];
      const dev = (actual - expected) / expected;
      const tooSmall = el === 'logo' && actual < IDENTITY.logo.minPrintMm;
      return [el, { expected, actual, dev, status: tooSmall ? 'fail' : Math.abs(dev) <= tolerance ? 'pass' : Math.abs(dev) <= tolerance * 2 ? 'warn' : 'fail' }];
    }));
    return { spec: s, scale, els };
  });
}

/* ─── 모듈 4: Localization ─── */
export function checkRegulation(country, text, fontPt, panelCm2) {
  const r = REGULATIONS[country];
  const items = r.mandatory.map(m => ({ rule: `필수문안 · ${m}`, status: text.includes(m) ? 'pass' : 'fail' }));
  const minPt = panelCm2 <= r.smallPanelCm2 ? r.smallPanelPt : r.minPt;
  items.push({ rule: `최소 폰트 ${minPt}pt (패널 ${panelCm2}cm²)`, status: fontPt >= minPt ? 'pass' : 'fail', detail: `현재 ${fontPt}pt` });
  r.certs.forEach(c => items.push({ rule: `인증/표기 · ${c}`, status: text.includes(c) ? 'pass' : 'warn', detail: '마크/표기 확인 필요' }));
  return { items, minPt };
}

const PT_TO_PX = 96 / 72, MM_TO_PX = 96 / 25.4;
let _ctx;
function wrap(text, fontPx, family, tracking, maxW) {
  _ctx = _ctx || document.createElement('canvas').getContext('2d');
  _ctx.font = `400 ${fontPx}px ${family}`;
  const meas = s => _ctx.measureText(s).width + s.length * tracking * fontPx;
  const lines = [];
  text.split('\n').forEach(para => {
    const tokens = para.match(/[\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]|[^\s\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]+\s*|\s+/g) || [''];
    let line = '';
    tokens.forEach(t => {
      if (meas(line + t) > maxW && line) { lines.push(line.trimEnd()); line = t.trimStart(); } else line += t;
    });
    lines.push(line);
  });
  return lines;
}

/** 브랜드 룰 우선순위: 행간 → 자간 → 폰트 → (실패 시) 영역 분할 제안 */
export function autoLayout(lang, text, boxMm, basePt, minPt) {
  const t = LOCALE_TYPO[lang];
  const maxW = boxMm.w * MM_TO_PX, maxH = boxMm.h * MM_TO_PX;
  let s = { pt: basePt, leading: t.baseLeading, tracking: 0 };
  const log = [];
  const fit = st => {
    const px = st.pt * PT_TO_PX;
    const lines = wrap(text, px, t.font, st.tracking, maxW);
    return { lines, h: lines.length * px * st.leading };
  };
  let r = fit(s);
  while (r.h > maxH && s.leading > t.minLeading + 1e-6) { s.leading = +(s.leading - 0.05).toFixed(2); r = fit(s); }
  if (s.leading !== t.baseLeading) log.push(`행간 ${t.baseLeading * 100}% → ${Math.round(s.leading * 100)}%`);
  while (r.h > maxH && s.tracking > t.minTracking + 1e-6) { s.tracking = +(s.tracking - 0.01).toFixed(2); r = fit(s); }
  if (s.tracking) log.push(`자간 ${Math.round(s.tracking * 1000)}`);
  while (r.h > maxH && s.pt - 0.25 >= minPt - 1e-6) { s.pt = +(s.pt - 0.25).toFixed(2); r = fit(s); }
  if (s.pt !== basePt) log.push(`폰트 ${basePt}pt → ${s.pt}pt (규정 최소 ${minPt}pt)`);
  const overflow = r.h > maxH;
  if (overflow) log.push(`⚠ 최소 규정 내 수용 불가 — 정보영역 ${Math.ceil((r.h / MM_TO_PX) - boxMm.h)}mm 확장 또는 측면 패널 분할 제안`);
  if (!log.length) log.push('조정 불필요 — 기본 룰 그대로 적용');
  return { ...s, ...r, overflow, log, font: t.font, fillRatio: r.h / maxH, scale: MM_TO_PX };
}

/* ─── 모듈 4 확장: 국문 디자인 파일(SVG/JSON/TXT) 파싱 · US/JP 자동 번역 · 위치 보존 시뮬레이션 ─── */
const KO_EN_DICT = [
  ['건강기능식품', 'DIETARY SUPPLEMENT'],
  ['음료베이스(분말제품)', 'Powdered Beverage Base'],
  ['효소식품', 'Enzyme Food Formula'],
  ['메타그린 슬림업', 'META GREEN SLIM UP'],
  ['메타그린 부스터샷', 'META GREEN BOOSTER SHOT'],
  ['메타그린 젤리 더블컷', 'META GREEN JELLY DOUBLE CUT'],
  ['메타그린젤리 더블컷', 'META GREEN JELLY DOUBLE CUT'],
  ['메타그린 젤리 애사비', 'META GREEN JELLY APPLE CIDER VINEGAR'],
  ['메타그린젤리 애사비', 'META GREEN JELLY APPLE CIDER VINEGAR'],
  ['메타그린 클린티', 'META GREEN CLEAN TEA'],
  ['메타그린 효소', 'META GREEN ENZYME'],
  ['메타그린 크레아틴 액티브', 'META GREEN CREATINE ACTIVE'],
  ['메타그린크레아틴 액티브', 'META GREEN CREATINE ACTIVE'],
  ['메타그린 브이레디', 'META GREEN V-READY'],
  ['메타그린', 'META GREEN'],
  ['슬림업', 'SLIM UP'],
  ['부스터샷', 'BOOSTER SHOT'],
  ['젤리 더블컷', 'JELLY DOUBLE CUT'],
  ['젤리 애사비', 'JELLY APPLE CIDER VINEGAR'],
  ['클린티', 'CLEAN TEA'],
  ['크레아틴 액티브', 'CREATINE ACTIVE'],
  ['브이레디', 'V-READY'],
  ['바이탈뷰티 슈퍼콜라겐', 'VITALBEAUTIE Super Collagen'],
  ['바이탈뷰티', 'VITALBEAUTIE'],
  ['슈퍼콜라겐', 'Super Collagen'],
  ['APIC대두배아열수추출물등복합물', 'APIC Soybean Embryo Hot-Water Extract Complex'],
  ['가르시니아캄보지아추출물', 'Garcinia Cambogia Extract'],
  ['난소화성말토덱스트린', 'Indigestible Maltodextrin'],
  ['사과초모식초(애플사이다비니거)', 'Apple Cider Vinegar (with Mother)'],
  ['사과초모식초', 'Apple Cider Vinegar'],
  ['애플사이다비니거', 'Apple Cider Vinegar'],
  ['효소처리헤스페리딘', 'Enzyme-Treated Hesperidin'],
  ['AP콜라겐효소분해펩타이드', 'AP Collagen Enzymatic Peptides'],
  ['파인애플추출분말', 'Pineapple Extract Powder'],
  ['바나바잎추출물', 'Banaba Leaf Extract'],
  ['올리브잎추출물', 'Olive Leaf Extract'],
  ['메타프로효소포뮬라', 'Meta-Pro Enzyme Formula'],
  ['녹차추출물', 'Green Tea Extract (Catechin)'],
  ['구연산칼륨', 'Potassium Citrate'],
  ['용성비타민P', 'Soluble Vitamin P'],
  ['α-아밀라아제', 'α-Amylase'],
  ['프로테아제', 'Protease'],
  ['히알루론산', 'Hyaluronic Acid'],
  ['엘라스틴', 'Elastin'],
  ['판토텐산', 'Pantothenic Acid'],
  ['비타민B1', 'Vitamin B1'],
  ['비타민C', 'Vitamin C'],
  ['크레아틴', 'Creatine Monohydrate'],
  ['크롬', 'Chromium'],
  ['정제수', 'Purified Water'],
  ['고식이섬유', 'HIGH FIBER'],
  ['효소', 'ENZYME'],
  ['제품명', 'Product Name'],
  ['내용량', 'Net Quantity'],
  ['원재료명', 'Active Ingredients'],
  ['섭취방법', 'Suggested Use'],
  ['주의사항', 'Warnings'],
  ['함유', 'Contained'],
  ['포', ' Sticks'],
  ['정', ' Tablets'],
];

const KO_JA_DICT = [
  ['건강기능식품', '機能性表示食品'],
  ['음료베이스(분말제품)', '粉末清涼飲料ベース'],
  ['효소식품', '酵素加工食品'],
  ['메타그린 슬림업', 'メタグリーン スリムアップ'],
  ['메타그린 부스터샷', 'メタグリーン ブースターショット'],
  ['메타그린 젤리 더블컷', 'メタグリーン ゼリー ダブルカット'],
  ['메타그린젤리 더블컷', 'メタグリーン ゼリー ダブルカット'],
  ['메타그린 젤리 애사비', 'メタグリーン ゼリー アップルサイダービネガー'],
  ['메타그린젤리 애사비', 'メタグリーン ゼリー アップルサイダービネガー'],
  ['메타그린 클린티', 'メタグリーン クリーンティー'],
  ['메타그린 효소', 'メタグリーン 酵素'],
  ['메타그린 크레아틴 액티브', 'メタグリーン クレアチン 액ティブ'],
  ['메타그린크레아틴 액티브', 'メタグリーン クレアチン アクティブ'],
  ['메타그린 브이레디', 'メタグリーン V-レディ'],
  ['메타그린', 'メタグリーン'],
  ['슬림업', 'スリムアップ'],
  ['부스터샷', 'ブースターショット'],
  ['젤리 더블컷', 'ゼリー ダブルカット'],
  ['젤리 애사비', 'ゼリー アップルサイダービネガー'],
  ['클린티', 'クリーンティー'],
  ['크레아틴 액티브', 'クレアチン アクティブ'],
  ['브이레디', 'V-レディ'],
  ['바이탈뷰티 슈퍼콜라겐', 'バイタルビューティー スーパーコラーゲン'],
  ['바이탈뷰티', 'バイタルビューティー'],
  ['슈퍼콜라겐', 'スーパーコラーゲン'],
  ['APIC대두배아열수추출물등복합물', 'APIC大豆胚芽熱水抽出物複合体'],
  ['가르시니아캄보지아추출물', 'ガルシニアカンボジア抽出物'],
  ['난소화성말토덱스트린', '難消化性デキストリン'],
  ['사과초모식초(애플사이다비니거)', 'りんご酢（アップルサイダービネガー）'],
  ['사과초모식초', 'りんご酢'],
  ['애플사이다비니거', 'アップルサイダービネガー'],
  ['효소처리헤스페리딘', '酵素処理ヘスペリジン'],
  ['AP콜라겐효소분해펩타이드', 'APコラーゲンペプチド'],
  ['파인애플추출분말', 'パイナップル抽出粉末'],
  ['바나바잎추출물', 'バナバ葉抽出物'],
  ['올리브잎추출물', 'オリーブ葉抽出物'],
  ['메타프로효소포뮬라', 'メタプロ酵素フォーミュラ'],
  ['녹차추출물', '緑茶抽出物（カテキン）'],
  ['구연산칼륨', 'クエン酸カリウム'],
  ['용성비타민P', '水溶性ビタミンP'],
  ['α-아밀라아제', 'α-アミラーゼ'],
  ['프로테아제', 'プロテアーゼ'],
  ['히알루론산', 'ヒアルロン酸'],
  ['엘라스틴', 'エラスチン'],
  ['판토텐산', 'パントテン酸'],
  ['비타민B1', 'ビタミンB1'],
  ['비타민C', 'ビタミンC'],
  ['크레아틴', 'クレアチン'],
  ['크롬', 'クロム'],
  ['정제수', '精製水'],
  ['고식이섬유', '高食物繊維'],
  ['효소', '酵素'],
  ['제품명', '品名'],
  ['내용량', '内容量'],
  ['원재료명', '原材料名・機能性関与成分'],
  ['섭취방법', '摂取方法'],
  ['주의사항', '摂取上の注意'],
  ['함유', '配合'],
  ['포', '包'],
  ['정', '粒'],
];

export function translateKoPackageText(text = '', targetLang = 'en') {
  if (!text) return '';
  let out = text;
  const dict = targetLang === 'ja' ? KO_JA_DICT : KO_EN_DICT;
  for (const [ko, tr] of dict) {
    out = out.split(ko).join(tr);
  }
  if (targetLang === 'en') {
    // g 단위 옆에 미국 FDA 규격용 oz 병기 보조 (단상자 용량 줄에 g가 있고 oz가 없을 때)
    out = out.replace(/(\d+(?:\.\d+)?)\s*g\b(?!\s*\/)/, (m, g) => {
      const oz = (parseFloat(g) * 0.035274).toFixed(2);
      return `${m} (${oz} oz)`;
    });
  }
  return out;
}

/**
 * 업로드된 국문 기준 SVG 파일(메타그린 디자인 가이드 또는 패키지 원고 SVG)을 분석해
 * 1) 단상자 폭·높이(mm)와 주표시면 면적(cm²)
 * 2) 문안 요소들의 실제 X/Y 좌표(mm)와 역할(제품명 / 원재료명 / 용량)
 * 을 자동으로 추출한다. 빨간색 가이드 지시선(#e52421)은 자동 제외한다.
 */
export function parseKoreanPackageFile(svgText, fileName = 'uploaded.svg') {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return null;

  const styleText = [...svg.querySelectorAll('style')].map(s => s.textContent).join('\n');
  const redClasses = new Set();
  const greenClasses = new Set();
  const fontSizeByClass = {};

  for (const m of styleText.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const sel = m[1], body = m[2].toLowerCase();
    const classes = sel.split(',').map(c => c.trim().replace(/^\./, ''));
    if (body.includes('#e52421')) classes.forEach(c => redClasses.add(c));
    if (body.includes('#00833e') || body.includes('#00843d')) classes.forEach(c => greenClasses.add(c));
    const fs = body.match(/font-size:\s*([\d.]+)px/);
    if (fs) classes.forEach(c => (fontSizeByClass[c] = parseFloat(fs[1])));
  }

  // 단상자 박스 rect 탐색 (#00833e 배경 rect 우선, 없으면 가장 큰 rect 또는 viewBox)
  let boxRect = null;
  for (const r of svg.querySelectorAll('rect')) {
    const cls = (r.getAttribute('class') || '').split(/\s+/);
    const fill = (r.getAttribute('fill') || '').toLowerCase();
    const w = parseFloat(r.getAttribute('width') || 0);
    const h = parseFloat(r.getAttribute('height') || 0);
    if (w > 80 && h > 120 && (cls.some(c => greenClasses.has(c)) || fill === '#00833e' || fill === '#00843d')) {
      boxRect = { x: parseFloat(r.getAttribute('x') || 0), y: parseFloat(r.getAttribute('y') || 0), w, h };
      break;
    }
  }
  if (!boxRect) {
    const vb = (svg.getAttribute('viewBox') || '0 0 226.77 456.38').split(/[\s,]+/).map(Number);
    boxRect = { x: vb[0] || 0, y: vb[1] || 0, w: vb[2] || 226.77, h: vb[3] || 456.38 };
  }

  const wMm = +(boxRect.w * PT_MM).toFixed(1);
  const hMm = +(boxRect.h * PT_MM).toFixed(1);
  const areaCm2 = +((wMm * hMm) / 100).toFixed(1);

  // 텍스트 노드 추출 (빨간 가이드 주석 및 1글자 회전 아크 제외)
  const rawNodes = [];
  for (const t of svg.querySelectorAll('text')) {
    const cls = (t.getAttribute('class') || '').split(/\s+/);
    const fill = (t.getAttribute('fill') || '').toLowerCase();
    if (cls.some(c => redClasses.has(c)) || fill === '#e52421') continue;
    const innerCls = [...t.querySelectorAll('[class]')].flatMap(e => (e.getAttribute('class') || '').split(/\s+/));
    if (innerCls.some(c => redClasses.has(c))) continue;

    const tr = t.getAttribute('transform') || '';
    if (/rotate\(-?[1-9]\d*(\.\d+)?\)/.test(tr)) continue; // 원형 엠블럼 회전 글자 제외

    const tm = tr.match(/translate\(\s*([\d.-]+)[,\s]+([\d.-]+)\s*\)/);
    const tx = tm ? parseFloat(tm[1]) : parseFloat(t.getAttribute('x') || 0);
    const ty = tm ? parseFloat(tm[2]) : parseFloat(t.getAttribute('y') || 0);
    if (tx < boxRect.x - 15 || tx > boxRect.x + boxRect.w + 15 || ty < boxRect.y - 15 || ty > boxRect.y + boxRect.h + 15) continue;

    const textContent = t.textContent.replace(/\s+/g, ' ').trim();
    if (!textContent || textContent.length <= 1) continue;

    const ptSize = cls.map(c => fontSizeByClass[c]).find(Boolean) || parseFloat(t.getAttribute('font-size') || 12);
    const relXMm = +((tx - boxRect.x) * PT_MM).toFixed(1);
    const relYMm = +((ty - boxRect.y) * PT_MM).toFixed(1);
    const relYRatio = +((ty - boxRect.y) / boxRect.h).toFixed(3);

    rawNodes.push({ text: textContent, xMm: relXMm, yMm: relYMm, yRatio: relYRatio, pt: ptSize });
  }

  rawNodes.sort((a, b) => a.yMm - b.yMm);

  // 역할 분류: 용량(하단 + g/mg/정/포/kcal), 제품명(상단 + 큰 pt 또는 메타그린), 원재료명(나머지)
  const classified = rawNodes.map(n => {
    const isCap = n.yRatio > 0.85 && /\d+\s*(g|mg|ml|정|포|EA|kcal)/i.test(n.text);
    const isTitle = !isCap && (n.pt >= 16 || /메타그린|슬림업|부스터샷|더블컷|애사비|클린티|효소|크레아틴|브이레디/.test(n.text));
    const role = isCap ? 'capacity' : isTitle ? 'title' : 'ingredient';
    return { ...n, role };
  });

  const isHff = classified.some(n => n.text.includes('건강기능식품'))
    || classified.some(n => n.role === 'ingredient' && n.yRatio < 0.55);

  return {
    fileName,
    wMm,
    hMm,
    areaCm2,
    type: isHff ? 'hff' : 'food',
    nodes: classified,
  };
}

/**
 * 식품의약품안전처 공식 건강기능식품 15mm 인증 마크 벡터 SVG
 * 사용자가 첨부한 mark.svg 원본 벡터 패스 기반 (viewBox: 274.74 398.8 45.04 45.04)
 */
export function getHffMarkSvg(x, y, size = 15) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="274.74 398.8 45.04 45.04" opacity="0.95">
    <path fill="#ffffff" d="m293.63,411.69c-.12.18-.29.34-.49.47-.21.13-.44.25-.7.34-.27.1-.53.19-.81.27l.38.46c.25-.06.5-.14.75-.24.25-.09.49-.2.71-.33.22-.13.41-.29.58-.47.17-.18.29-.39.37-.62h1.5v2.37h.38c.13,0,.21-.03.25-.08.04-.06.06-.15.06-.3v-4.14h-.69v1.55h-1.42v-.44c0-.18-.01-.33-.05-.45-.04-.12-.1-.21-.17-.28-.08-.07-.17-.12-.3-.14-.12-.03-.26-.04-.43-.04h-1.7v.58h1.57c.17,0,.27.03.32.1.05.07.07.18.07.35v.38c0,.25-.06.47-.18.66"/>
    <path fill="#ffffff" d="m296.69,415.58s.06-.11.06-.2v-.32h-3.17s-.07-.05-.07-.13v-1.38h-.69v1.59c0,.15.05.28.14.37.09.1.22.15.37.15h3.15c.1,0,.16-.03.21-.07"/>
    <path fill="#ffffff" d="m298.78,413.39c-.19.1-.36.24-.49.41-.13.17-.2.39-.2.67s.07.49.19.67c.13.17.29.3.48.4.2.09.41.16.64.19.23.04.44.05.65.05s.41-.02.64-.05c.22-.04.43-.1.62-.19.19-.1.35-.23.47-.4.13-.18.2-.39.2-.66s-.07-.5-.2-.67c-.13-.17-.28-.31-.47-.41-.19-.1-.4-.17-.62-.21-.23-.03-.44-.05-.64-.05s-.41.02-.63.05c-.22.04-.44.11-.64.21m1.28.32c.11,0,.24,0,.37.03.15.02.28.06.4.11.13.06.24.13.33.23.09.1.13.22.13.38s-.04.28-.13.38c-.09.09-.19.17-.32.22-.12.05-.26.09-.41.1-.14.02-.27.03-.38.03s-.25,0-.39-.03c-.15-.02-.29-.06-.42-.1-.13-.05-.24-.13-.33-.22-.1-.09-.14-.22-.14-.38s.04-.29.14-.38c.09-.1.2-.18.33-.23.13-.05.28-.09.42-.11.14-.02.28-.03.39-.03"/>
    <path fill="#ffffff" d="m298.43,412.76c.3-.12.56-.26.79-.43.22-.17.4-.38.53-.62.14-.24.2-.52.2-.84v-.34c0-.18-.02-.33-.05-.45-.03-.12-.09-.21-.17-.28-.07-.07-.17-.12-.3-.14-.12-.03-.26-.04-.43-.04h-1.7v.59h1.57c.16,0,.28.03.32.1.05.07.07.18.07.35v.25c0,.26-.06.48-.18.66-.12.18-.28.34-.49.47-.2.13-.43.24-.69.33-.26.09-.53.17-.8.24l.38.47c.33-.09.64-.19.94-.3"/>
    <path fill="#ffffff" d="m301.84,412.93c.05-.06.06-.15.06-.27v-1.3h.86v-.59h-.86v-1.35h-.68v3.6h.38c.12,0,.2-.03.24-.08"/>
    <path fill="#ffffff" d="m291.09,423.44c.06-.06.07-.16.07-.3v-5.85h-.68v6.23h.36c.12,0,.2-.03.25-.08"/>
    <path fill="#ffffff" d="m288.39,420.09c-.04.11-.08.22-.15.32-.06.1-.13.2-.22.29-.08.09-.17.18-.26.26-.1.08-.21.17-.33.24-.13.07-.26.14-.4.2-.14.06-.28.11-.42.16-.14.05-.28.09-.41.13l.38.49c.39-.09.74-.22,1.05-.37.3-.16.56-.34.78-.53.22-.21.4-.44.54-.7.13-.26.2-.54.2-.84v-1.13c0-.18-.02-.33-.06-.45-.04-.13-.1-.23-.18-.3-.08-.07-.2-.13-.32-.17-.13-.04-.29-.06-.48-.06h-1.73v.6h1.61c.2,0,.32.03.38.09.06.06.09.17.09.33v1.09c0,.12-.02.24-.06.35"/>
    <path fill="#ffffff" d="m292.86,417.37c-.07-.09-.17-.14-.27-.14h-.33v1.75c0,.25.05.4.15.49.1.08.26.12.48.12h3.28c.1,0,.17-.03.21-.07.05-.04.07-.11.07-.2v-.32h-3.4s-.07,0-.08-.03c-.01-.02-.01-.06-.01-.11v-1.18c0-.12-.04-.22-.1-.31"/>
    <path fill="#ffffff" d="m295.12,421.2c-.24-.06-.51-.09-.79-.09-.3,0-.58.03-.83.08-.26.05-.48.13-.67.24-.19.11-.34.24-.45.4-.11.16-.16.34-.16.56s.06.41.17.56c.11.16.27.29.46.39.19.1.41.18.67.23.25.05.52.07.8.07.3,0,.58-.03.83-.08.25-.05.47-.14.66-.25.18-.11.33-.24.42-.39.11-.16.16-.33.16-.53,0-.21-.06-.39-.17-.55-.11-.16-.26-.3-.44-.4-.19-.11-.41-.19-.67-.24m.49,1.46c-.07.08-.17.16-.28.22-.12.06-.27.1-.44.13-.17.03-.35.04-.55.04s-.4-.01-.58-.05c-.17-.03-.31-.07-.44-.13-.12-.05-.21-.13-.27-.21-.07-.08-.1-.17-.1-.27,0-.21.12-.38.36-.5.24-.12.59-.18,1.04-.18.2,0,.38.01.55.05.16.03.31.08.43.14.12.06.22.13.29.21.07.08.1.18.1.28s-.03.19-.09.27"/>
    <path fill="#ffffff" d="m297.1,420.62l-.23-.23c.1-.05.19-.11.3-.17v-.1h-5.7v.6h5.41c.1,0,.17-.04.22-.1"/>
    <path fill="#ffffff" d="m301.89,423.53c.11,0,.19-.03.24-.09.05-.06.08-.16.08-.31v-1.39c0-.16-.05-.27-.14-.35-.1-.08-.22-.12-.37-.12h-3.37v.59h3.11c.06,0,.09.03.09.09v1.58h.36Z"/>
    <path fill="#ffffff" d="m297.1,420.62l.22.23c.34-.18.64-.38.89-.61.25-.23.45-.45.6-.66.09.1.19.21.31.31.12.11.25.22.38.32.14.1.27.19.41.28.14.09.28.16.4.21l.39-.45c-.21-.11-.41-.22-.6-.34-.19-.12-.35-.25-.5-.38-.14-.13-.26-.28-.34-.44-.08-.16-.12-.33-.12-.51v-.91c0-.09-.02-.17-.05-.22-.03-.06-.1-.08-.22-.08h-.44v1.2c0,.2-.05.38-.14.55-.09.17-.21.34-.36.49-.15.16-.33.3-.51.43-.1.06-.19.11-.28.16v.18c0,.1-.03.17-.07.22"/>
    <path fill="#ffffff" d="m302.23,417.29h-.69v3.63h.36c.13,0,.22-.04.26-.1.05-.07.07-.18.07-.31v-3.22Z"/>
    <path fill="#ffffff" d="m308.12,420.72c.19,0,.29-.11.29-.32v-.28h-5.7v.6h2.52v.61h-1.7v1.55c0,.22.06.39.18.5.11.11.25.17.41.17h2.68c.29,0,.5-.08.63-.23.13-.15.2-.37.2-.64v-1.35h-1.72v-.61h2.21Zm-1.18,1.19v.81c0,.1-.02.17-.08.2-.06.03-.12.04-.22.04h-2.3c-.09,0-.14-.05-.14-.16v-.89h2.75Z"/>
    <path fill="#ffffff" d="m307.97,419.33v-.25h-.89s.02-.1.03-.14c0-.05.01-.1.01-.14v-.87h.71v-.57h-4.53v.57h.71v.87s0,.1.01.15c0,.05.02.09.03.14h-.87v.57h4.49c.2,0,.3-.11.3-.32m-1.53-.53c0,.09-.01.15-.04.2-.03.05-.08.07-.16.07h-1.35c-.07,0-.12-.03-.15-.07-.03-.05-.05-.11-.05-.2v-.88h1.75v.88Z"/>
    <path fill="#ffffff" d="m312.85,420.15c.04.16.06.31.06.47,0,3.02-7.01,5.48-15.66,5.48s-15.65-2.45-15.65-5.48c0-.16.02-.31.06-.47-1.11.81-1.73,1.73-1.73,2.7,0,3.43,7.75,6.19,17.32,6.19s17.33-2.77,17.33-6.19c0-.97-.62-1.89-1.73-2.7"/>
    <rect fill="#ffffff" x="288.82" y="434.97" width=".9" height=".57"/>
    <path fill="#ffffff" d="m301.58,434.96c-.62,0-.62,1.22,0,1.22s.62-1.22,0-1.22"/>
    <path fill="#ffffff" d="m292.03,434.94c-.63,0-.63,1.53,0,1.53s.64-1.53,0-1.53"/>
    <rect fill="#ffffff" x="298.11" y="437.01" width="1.6" height=".5"/>
    <path fill="#ffffff" d="m295.11,434.96c-.65,0-.67,1.08,0,1.08s.63-1.08,0-1.08"/>
    <rect fill="#ffffff" x="288.47" y="437.01" width="1.6" height=".5"/>
    <path fill="#ffffff" d="m297.26,398.8c-12.43,0-22.51,10.08-22.51,22.52s10.08,22.51,22.51,22.51,22.52-10.08,22.52-22.51-10.08-22.52-22.52-22.52m-12.72,37.29c.44-.22.91-.57.91-1.09v-.36h.47v.36c0,.5.44.87.91,1.1l-.18.33c-.38-.13-.74-.43-.99-.73-.12.23-.58.63-.95.73l-.17-.33Zm2.91,1.73h-.48v-.85h-2.07v-.32h2.54v1.17Zm0-1.35h-.48v-1.89h.48v1.89Zm3.24-.05h-1.19v.26h1.04v1.14h-2.54v-1.14h1.04v-.26h-1.19v-.32h2.84v.32Zm-2.69-1.45v-.32h2.54v.32h-.36v.57h.36v.32h-2.54v-.32h.35v-.57h-.35Zm5.9,2.85h-.47v-.43c-.25.1-.44.11-.71.11h-1.67v-.31h1.79c.22,0,.37-.04.57-.1.02-.02.02-2.51.02-2.51h.47v3.24Zm-1.86-3.21c1.26,0,1.28,2.18,0,2.18s-1.26-2.18,0-2.18m3.08,0c1.29,0,1.29,1.79,0,1.79s-1.3-1.79,0-1.79m1.87,3.21h-.47v-.88h-2.07v-.32h2.54v1.2Zm.37-2.49h-.37v.32h.37v.36h-.37v.42h-.47v-1.85h.47v.39h.37v.35Zm2.99,1.1h-1.19v.26h1.04v1.14h-2.54v-1.14h1.04v-.26h-1.19v-.32h2.85v.32Zm-2.69-1.45v-.32h2.54v.32h-.36v.57h.36v.32h-2.54v-.32h.35v-.57h-.35Zm3.93-.36c1.25,0,1.24,1.93,0,1.93s-1.24-1.93,0-1.93m1.87,3.21h-2.46v-1.02h.47v.71h1.99v.32Zm.33-2.07h-.37v1.18h-.47v-2.35h.47v.82h.37v.36Zm.05.47c.44-.23.91-.55.91-1.09v-.16h-.73v-.32h1.91v.32h-.71v.16c0,.5.47.89.9,1.09l-.17.33c-.36-.12-.76-.42-.97-.7-.16.2-.62.59-.97.7l-.18-.33Zm1.96-.58v-.32h.47v-.75h.47v2.32h-.47v-1.25h-.47Zm.97,2.17h-2.49v-1.07h.43v.75h2.07v.32Zm2.25-.29c-.33-.14-.66-.47-.87-.76-.16.29-.57.62-.87.76l-.19-.32c.54-.35.82-.71.82-1.37v-.73h-.62v-.32h.62v-.29h.46v.29h.63v.32h-.63v.74c0,.6.3,1.05.82,1.36l-.18.32Zm.89.29h-.46v-1.86h-.55v-.32h.55v-1.07h.46v3.24Zm-30.36-5.3c-2.06-3.24-3.24-7.08-3.24-11.2,0-11.57,9.38-20.96,20.94-20.96s20.95,9.38,20.95,20.96c0,4.12-1.19,7.96-3.25,11.2h-35.41Z"/>
    <rect fill="#ffffff" x="298.47" y="434.97" width=".9" height=".57"/>
  </svg>`;
}

/**
 * 인식된 국문 패키지 레이아웃을 기반으로 국가별(KR / US / JP) 시뮬레이션 SVG 생성
 * - 원본에서 인식한 각 문안의 Y좌표(mm)·역할·폰트 계층을 유지하면서
 * - US(FDA Dietary Supplement / Nutrition Facts 규정: Net Wt + oz 병기, Supplement Facts 뱃지, FDA 면책문구)
 * - JP(소비자청 機能性表示食品 / 食品表示基準: 届出表示·内容量·食生活バランス 문구)
 * 를 시뮬레이션 캔버스에 함께 표시한다.
 */
export function renderLocalizedPackageSvg(parsed, country = 'KR') {
  const W = parsed.wMm, H = parsed.hMm;
  const sc = getSizeClass(W);
  const langMap = { KR: 'ko', US: 'en', JP: 'ja', CN: 'zh', EU: 'en' };
  const lang = langMap[country] || 'en';
  const isHff = parsed.type === 'hff';

  const topLine = sc.topLine;
  const tagWTop = sc.tag.wTop, tagWBot = sc.tag.wBottom, tagH = sc.tag.h;
  const tagY0 = topLine * 0.78, tagY1 = tagY0 + tagH;
  const tx0 = (W - tagWTop) / 2, tx1 = tx0 + tagWTop;
  const bx0 = (W - tagWBot) / 2, bx1 = bx0 + tagWBot;

  const logoScale = tagWTop / (123.55 * PT_MM);
  const logoTx = tx0 - 229.93 * PT_MM * logoScale;
  const logoTy = tagY0 - 283.61 * PT_MM * logoScale;

  // 번역 및 좌표 매핑
  const translatedNodes = parsed.nodes.map(n => {
    const trText = lang === 'ko' ? n.text : translateKoPackageText(n.text, lang);
    // 영문/일문 길이에 맞춰 자동 폰트 스케일링
    const lenRatio = trText.length / Math.max(n.text.length, 1);
    const scaleFactor = lang === 'ko' ? 1 : lenRatio > 1.6 ? 0.68 : lenRatio > 1.25 ? 0.78 : 0.88;
    const pt = +(n.pt * scaleFactor).toFixed(1);
    return { ...n, trText, renderPt: pt };
  });

  // 국가별 법정 필수 추가 배지/문구 (전면 시뮬레이션 하단/상단 반영)
  const countryFooter = country === 'US'
    ? (isHff ? '*DIETARY SUPPLEMENT · FDA 21 CFR 101.36' : '*NUTRITION FACTS PANEL SEE BACK · FDA COMPLIANT')
    : country === 'JP'
      ? (isHff ? '機能性表示食品 · 届出番号 J-VB01 (消費者庁基準)' : '食品表示基準適合 · 栄養成分表示裏面記載')
      : (isHff ? '식품의약품안전처 건강기능식품 표시기준 적합' : '식품등의 표시기준(제2026-37호) 적합');

  const markSize = 15;
  const markX = W - 3 - markSize;
  const markY = H - 3 - markSize;

  const markBlock = country === 'KR' && isHff
    ? getHffMarkSvg(markX, markY, markSize)
    : country === 'US' ? `
    <g transform="translate(${W - 23} ${H - 14.5})">
      <rect x="0" y="0" width="20" height="7" fill="rgba(0,0,0,0.28)" stroke="#FFFFFF" stroke-width="0.3"/>
      <text x="10" y="3.1" text-anchor="middle" fill="#CEDC00" font-size="1.75" font-weight="700">FDA 21 CFR</text>
      <text x="10" y="5.6" text-anchor="middle" fill="#FFFFFF" font-size="1.65">${isHff ? 'SUPPLEMENT' : 'FOOD LABEL'}</text>
    </g>` : country === 'JP' ? `
    <g transform="translate(${W - 24} ${H - 14.5})">
      <rect x="0" y="0" width="21" height="7" fill="rgba(0,0,0,0.28)" stroke="#FFFFFF" stroke-width="0.3"/>
      <text x="10.5" y="3.1" text-anchor="middle" fill="#CEDC00" font-size="1.7" font-weight="700">消費者庁基準</text>
      <text x="10.5" y="5.6" text-anchor="middle" fill="#FFFFFF" font-size="1.65">${isHff ? '機能性表示食品' : '一般加工食品'}</text>
    </g>` : '';

  const wrapSvgLines = (str, maxChars) => {
    if (str.length <= maxChars) return [str];
    const words = str.split(/\s+/);
    if (words.length === 1) return [str.slice(0, maxChars), str.slice(maxChars)];
    const lines = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > maxChars && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = (cur + ' ' + w).trim();
      }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  };

  const nodesSvg = translatedNodes.map(n => {
    const px = n.renderPt * PT_MM;
    const isCap = n.role === 'capacity';
    
    // 내용량: 중앙정렬 1순위 유지 + 15mm 마크 간섭 시 위치를 살짝 위로 이동
    let effY = n.yMm;
    if (isCap && isHff && country === 'KR') {
      const approxW = n.trText.length * px * 0.58;
      if ((W / 2) + (approxW / 2) > markX - 1.5) {
        effY = Math.min(n.yMm, markY - 2.5);
      }
    }

    const maxChars = Math.max(12, Math.floor((W - 8) / (px * (lang === 'en' ? 0.52 : 0.82))));
    const lines = wrapSvgLines(n.trText, maxChars);
    const weight = n.role === 'title' ? 700 : isCap ? 600 : 400;
    const opacity = !isHff && n.role === 'ingredient' ? 0.78 : 1;
    const badgeColor = n.role === 'title' ? '#CEDC00' : n.role === 'ingredient' ? '#78BE20' : '#41B6E6';

    return `
      <g opacity="${opacity}">
        <!-- 인식된 문안 좌표 마커 -->
        <line x1="2.2" y1="${effY}" x2="${W - 2.2}" y2="${effY}" stroke="${badgeColor}" stroke-width="0.18" stroke-dasharray="1 1" opacity="0.65"/>
        <rect x="1.5" y="${effY - px * 0.95}" width="11.5" height="2.8" fill="${badgeColor}" rx="0.5" opacity="0.9"/>
        <text x="7.25" y="${effY - px * 0.95 + 2}" text-anchor="middle" fill="#101820" font-size="1.65" font-weight="700" font-family="sans-serif">${n.role.toUpperCase()} Y:${effY.toFixed(1)}</text>
        ${lines.map((l, idx) => `
          <text x="${W / 2}" y="${effY + idx * px * 1.18}" text-anchor="middle" fill="#FFFFFF" font-size="${px}" font-weight="${weight}" font-family="${LOCALE_TYPO[lang]?.font || 'sans-serif'}">${l}</text>
        `).join('')}
      </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 ${W + 12} ${H + 14}" class="pf-svg">
    <defs>
      <clipPath id="loc-clip-${country}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
      <radialGradient id="loc-glow-${country}" cx="50%" cy="52%" r="42%">
        <stop offset="0%" stop-color="#6DB52D" stop-opacity="0.38"/>
        <stop offset="100%" stop-color="#00843D" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g clip-path="url(#loc-clip-${country})">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#00843D"/>
      <ellipse cx="${W / 2}" cy="${H * 0.54}" rx="${W * 0.38}" ry="${H * 0.24}" fill="url(#loc-glow-${country})"/>
      <polygon points="${tx0},${tagY0} ${bx0},${tagY1} ${bx1},${tagY1} ${tx1},${tagY0}" fill="#CEDC00"/>
      <rect x="0" y="0" width="${W}" height="${topLine}" fill="#CEDC00"/>
      <g transform="translate(${logoTx} ${logoTy}) scale(${PT_MM * logoScale})" fill="#1D1D1B">
        <polygon points="253.47 288.83 251.29 294.18 249.03 288.83 247.01 288.83 251.32 298.37 255.43 288.83 253.47 288.83"/>
        <rect x="257.31" y="288.83" width="1.89" height="9.16"/>
        <polygon points="260.95 288.83 260.95 290.58 263.5 290.58 263.5 297.99 265.39 297.99 265.39 290.58 267.93 290.58 267.93 288.83 260.95 288.83"/>
        <polygon points="272.26 288.45 268.04 297.99 270 297.99 272.23 292.62 274.44 297.99 276.46 297.99 272.26 288.45"/>
        <polygon points="279.63 296.24 279.63 288.83 277.74 288.83 277.74 297.99 282.33 297.99 284.1 296.24 279.63 296.24"/>
        <path d="m290.67,293.07c-.08-.02-.14-.09-.15-.18,0-.09.04-.17.11-.21.47-.24.98-.71.98-1.62,0-1.4-.96-2.23-2.57-2.23h-3.15v9.12h3.4c1.87,0,2.98-.99,2.98-2.66,0-1.1-.55-1.91-1.61-2.21Z"/>
        <path d="m295.43,297.04v-2.95h3.49v-.89h-3.49v-3.04h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/>
        <path d="m305.17,288.82l-.13-.3-.12.3-3.86,9.04h1.13l1.07-2.51h3.42l1.02,2.51h1.2l-3.73-9.04Z"/>
        <path d="m316.06,288.83v5.88c0,1.59-.8,2.43-2.33,2.43s-2.34-.84-2.34-2.43v-5.88h-1.07v5.96c0,2.06,1.28,3.28,3.42,3.28s3.4-1.23,3.4-3.28v-5.96h-1.08Z"/>
        <path d="m318.66,288.83v.91h2.82v8h1.07v-8h2.82v-.91h-6.71Z"/>
        <rect x="326.96" y="288.83" width="1.07" height="9.12"/>
        <path d="m332.19,297.04v-2.95h3.49v-.89h-3.49v-3.04h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/>
      </g>
      ${nodesSvg}
      ${markBlock}
      <rect x="0" y="${H - 3.2}" width="${W}" height="3.2" fill="rgba(0,0,0,0.32)"/>
      <text x="${W / 2}" y="${H - 1.1}" text-anchor="middle" fill="#CEDC00" font-size="1.75" font-family="sans-serif">${countryFooter}</text>
    </g>
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#101820" stroke-width="0.3"/>
    <text x="${W / 2}" y="-1.8" text-anchor="middle" fill="#E52421" font-size="2.3" font-weight="700" font-family="sans-serif">${W} × ${H}mm (${parsed.areaCm2}㎠)</text>
  </svg>`;
}

/* ─── 모듈 5: 메타그린 단상자 전면(주표시면) 거버넌스 ─── */
const blendHex = (fg, bg, alpha) => {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const f = p(fg), b = p(bg);
  return '#' + f.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('').toUpperCase();
};

export function getSizeClass(wMm) {
  return wMm < SIZE_CLASS.smallMaxWidth ? { key: 'small', ...SIZE_CLASS.small } : { key: 'standard', ...SIZE_CLASS.standard };
}

/**
 * 단상자 전면 가로 안전폭(maxWidthMm)을 넘어가는 문안을 자동 줄바꿈(Wrapping)
 * 한글/영문/숫자 폭 비율을 실측 추정하여 자연스러운 공백·쉼표 단위로 개행하고,
 * 공백 없는 긴 복합원료명도 가로 영역을 절대 넘지 않도록 글자 단위로 분할한다.
 */
const charWidthFactor = ch => {
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(ch)) return 0.94;
  if (/[A-Z]/.test(ch)) return 0.64;
  if (/[a-z0-9]/.test(ch)) return 0.54;
  if (/\s/.test(ch)) return 0.3;
  return 0.52;
};

export const estimateTextWidthMm = (str = '', fontMm = 3.5, scaleX = 1) =>
  [...str].reduce((sum, ch) => sum + charWidthFactor(ch) * fontMm * scaleX, 0);

export function wrapSvgTextToWidth(rawText = '', fontMm = 3.5, maxWidthMm = 68, scaleX = 1) {
  const safeMax = Math.max(12, maxWidthMm);
  const out = [];
  const paragraphs = String(rawText || '').split('\n');

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (estimateTextWidthMm(trimmed, fontMm, scaleX) <= safeMax) {
      out.push(trimmed);
      continue;
    }
    // 쉼표(,)나 공백 단위로 토큰 분리 후 폭에 맞춰 줄바꿈
    const tokens = trimmed.split(/(?<=[,，·/])\s*|\s+/);
    let line = '';
    for (const tok of tokens) {
      if (!tok) continue;
      const candidate = line ? `${line} ${tok}` : tok;
      if (estimateTextWidthMm(candidate, fontMm, scaleX) <= safeMax) {
        line = candidate;
      } else {
        if (line) out.push(line);
        // 단일 토큰 자체가 가로 영역보다 긴 경우 글자 단위로 강제 분할
        if (estimateTextWidthMm(tok, fontMm, scaleX) > safeMax) {
          let chunk = '';
          for (const ch of tok) {
            if (estimateTextWidthMm(chunk + ch, fontMm, scaleX) > safeMax && chunk) {
              out.push(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          line = chunk;
        } else {
          line = tok;
        }
      }
    }
    if (line) out.push(line);
  }
  return out.length ? out : [''];
}

const PANTONE_SWATCH_MAP = {
  // VITALBEAUTIE 공식 제품군 팬톤
  '348C': { hex: '#00843D', name: '메타그린 대표 그린' },
  '389C': { hex: '#CEDC00', name: '메타그린 로고 태그 라임' },
  '144C': { hex: '#ED8B00', name: '메타그린 젤리 더블컷 오렌지' },
  '3546C': { hex: '#39B54A', name: '메타그린 젤리 애사비 그린' },
  '2270C': { hex: '#78BE20', name: '메타그린 클린치 라임그린' },
  '211C': { hex: '#E96B99', name: '메타그린 크레아틴 핑크' },
  '213C': { hex: '#E31C79', name: '슈퍼에센셜 마젠타' },
  '230C': { hex: '#F479C9', name: '슈퍼콜라겐 시그니처 핑크' },
  '394C': { hex: '#EAF044', name: '슈퍼레티놀 레몬옐로우' },
  '3945C': { hex: '#E2EC3F', name: '슈퍼레티놀 젤리 옐로우' },
  '353C': { hex: '#A8E4A0', name: '슈퍼시카B5 민트그린' },
  '2645C': { hex: '#B89FD5', name: '슈퍼 바이오틱스 라벤더' },
  '2345C': { hex: '#D82E84', name: '슈퍼콜라겐 PDRN 핫핑크' },
  '294C': { hex: '#002F6C', name: '에너지샷 딥네이비' },
  '2112C': { hex: '#2C2A4A', name: '굿슬립가바 나이트인디고' },
  '802C': { hex: '#44D62C', name: '녹차유산균 브라이트그린' },
  '214C': { hex: '#CE1163', name: '슈퍼콜라겐 플래티넘 루비' },
  '207C': { hex: '#A6192E', name: '우먼밸런스 버건디레드' },
  '871C': { hex: '#86724C', name: '올인원 멀티팩 메탈릭골드' },
  '165C': { hex: '#FF671F', name: '액티브 멀티팩 비비드오렌지' },
  '1505C': { hex: '#FF6900', name: '비타클렌즈 오렌지' },
  '1235C': { hex: '#FFB81C', name: '프로바이오틱스 골드옐로우' },
  '2173C': { hex: '#4976BA', name: '조이스텝 코발트블루' },
  '301C': { hex: '#005596', name: '오메가케어 오션블루' },
  '2746C': { hex: '#1E22AA', name: '트루아이 로얄블루' },
  '2091C': { hex: '#502D7F', name: '리버프라임 딥퍼플' },
  '3252C': { hex: '#2CD5C4', name: '덴프레쉬 아쿠아민트' },
  '4625C': { hex: '#4F2C1D', name: '명작수 다크브라운' },
  '4685C': { hex: '#D8C3A5', name: '명작수 EC 베이지골드' },
  '289C': { hex: '#0C2340', name: '명작수 활 미드나잇네이비' },
  // 주요 표준 PANTONE Solid Coated
  '102C': { hex: '#FCE300', name: 'Pantone Yellow' },
  '109C': { hex: '#FFD100', name: 'Pantone Golden Yellow' },
  '116C': { hex: '#FFCD00', name: 'Pantone Amber Yellow' },
  '122C': { hex: '#FED141', name: 'Pantone Soft Yellow' },
  '123C': { hex: '#FFC72C', name: 'Pantone Warm Yellow' },
  '130C': { hex: '#F2A900', name: 'Pantone Marigold' },
  '137C': { hex: '#FFA300', name: 'Pantone Bright Orange-Yellow' },
  '1375C': { hex: '#FF9E1B', name: 'Pantone Tangerine' },
  '151C': { hex: '#FF8200', name: 'Pantone Orange' },
  '1575C': { hex: '#FF7F32', name: 'Pantone Coral Orange' },
  '158C': { hex: '#E87722', name: 'Pantone Deep Orange' },
  '166C': { hex: '#E35205', name: 'Pantone Vermilion' },
  '172C': { hex: '#FA4616', name: 'Pantone Red-Orange' },
  '1788C': { hex: '#EE2737', name: 'Pantone Poppy Red' },
  '1795C': { hex: '#D22630', name: 'Pantone Crimson Red' },
  '185C': { hex: '#E4002B', name: 'Pantone Classic Red' },
  '186C': { hex: '#C8102E', name: 'Pantone Flag Red' },
  '191C': { hex: '#F4436C', name: 'Pantone Rose Red' },
  '199C': { hex: '#D50032', name: 'Pantone Ruby Red' },
  '200C': { hex: '#BA0C2F', name: 'Pantone Deep Red' },
  '202C': { hex: '#862633', name: 'Pantone Wine Burgundy' },
  '218C': { hex: '#E56DB1', name: 'Pantone Orchid Pink' },
  '219C': { hex: '#DA1884', name: 'Pantone Vivid Pink' },
  '226C': { hex: '#D0006F', name: 'Pantone Cerise' },
  '2582C': { hex: '#9B59B6', name: 'Pantone Amethyst Purple' },
  '266C': { hex: '#753BBD', name: 'Pantone Royal Violet' },
  '2665C': { hex: '#9063CD', name: 'Pantone Soft Violet' },
  '2685C': { hex: '#330072', name: 'Pantone Deep Indigo' },
  '2716C': { hex: '#7986CB', name: 'Pantone Periwinkle' },
  '2728C': { hex: '#0047BB', name: 'Pantone Cobalt Blue' },
  '285C': { hex: '#0072CE', name: 'Pantone Azure Blue' },
  '286C': { hex: '#0032A0', name: 'Pantone Classic Blue' },
  '2925C': { hex: '#009CDE', name: 'Pantone Sky Blue' },
  '298C': { hex: '#41B6E6', name: 'PantoneCyan Blue' },
  '300C': { hex: '#005EB8', name: 'Pantone Sapphire Blue' },
  '3125C': { hex: '#00AEC7', name: 'Pantone Aqua Blue' },
  '320C': { hex: '#009CA6', name: 'Pantone Teal' },
  '3262C': { hex: '#00BFB3', name: 'Pantone Turquoise' },
  '3272C': { hex: '#00A389', name: 'Pantone Jade Green' },
  '334C': { hex: '#009A44', name: 'Pantone Emerald' },
  '3385C': { hex: '#50C878', name: 'Pantone Mint Emerald' },
  '340C': { hex: '#00965E', name: 'Pantone Pine Green' },
  '347C': { hex: '#009A44', name: 'Pantone Kelly Green' },
  '349C': { hex: '#046A38', name: 'Pantone Forest Green' },
  '354C': { hex: '#00B140', name: 'Pantone Vivid Green' },
  '355C': { hex: '#009639', name: 'Pantone Leaf Green' },
  '356C': { hex: '#007A33', name: 'Pantone Deep Green' },
  '361C': { hex: '#43B02A', name: 'Pantone Apple Green' },
  '368C': { hex: '#78BE20', name: 'Pantone Fresh Green' },
  '375C': { hex: '#97D700', name: 'Pantone Lime Green' },
  '382C': { hex: '#C4D600', name: 'Pantone Chartreuse' },
  '388C': { hex: '#D0DF00', name: 'Pantone Citrus Lime' },
  '7423C': { hex: '#E63E6D', name: 'Pantone Coral Rose' },
  '7480C': { hex: '#26D07C', name: 'Pantone Bright Mint' },
  '7481C': { hex: '#00B74F', name: 'Pantone Meadow Green' },
  '7482C': { hex: '#008F4C', name: 'Pantone Botanical Green' },
  '7503C': { hex: '#A39161', name: 'Pantone Warm Taupe' },
  '7556C': { hex: '#B4833E', name: 'Pantone Ochre Gold' },
  '7724C': { hex: '#008542', name: 'Pantone Herbal Green' },
  '7739C': { hex: '#3A913F', name: 'Pantone Natural Green' },
};

const hslToHexColor = (h, s, l) => {
  const sn = s / 100, ln = l / 100;
  const k = n => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = n => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toH = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toH(f(0))}${toH(f(8))}${toH(f(4))}`.toUpperCase();
};

export function resolvePantoneInput(raw) {
  const s = (raw || '').trim();
  if (!s) return { code: 'PANTONE 348C', shortCode: '348C', hex: '#00843D', name: '메타그린 대표 그린' };

  // 1) 직접 #HEX 입력 시
  if (/^#?[0-9A-F]{6}$/i.test(s)) {
    const hex = (s.startsWith('#') ? s : '#' + s).toUpperCase();
    return { code: hex, shortCode: hex, hex, name: '사용자 HEX 지정' };
  }

  // 2) PANTONE 코드 정규화 (예: "PANTONE 348 C", "348c", "348" -> "348C")
  const cleaned = s.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, '');
  const withC = /[CU]$/.test(cleaned) ? cleaned : `${cleaned}C`;
  const numMatch = cleaned.match(/(\d{3,4})/);
  const numKey = numMatch ? `${numMatch[1]}C` : withC;

  if (PANTONE_SWATCH_MAP[withC]) {
    const m = PANTONE_SWATCH_MAP[withC];
    return { code: `PANTONE ${withC}`, shortCode: withC, hex: m.hex, name: m.name };
  }
  if (PANTONE_SWATCH_MAP[numKey]) {
    const m = PANTONE_SWATCH_MAP[numKey];
    return { code: `PANTONE ${numKey}`, shortCode: numKey, hex: m.hex, name: m.name };
  }

  // 3) PANTONE_SOLID_COATED 전체 공식 데이터베이스 검색
  const fromSolidDb = PANTONE_SOLID_COATED.find(
    p => p.code.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, '') === withC ||
         p.code.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, '') === numKey
  );
  if (fromSolidDb) {
    return { code: fromSolidDb.code, shortCode: withC, hex: fromSolidDb.hex, name: fromSolidDb.code };
  }

  // 4) PACKAGE_LINES 전체 제품군 검색
  const fromProd = PACKAGE_LINES.allProducts.find(p => p.pantone.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, '') === numKey);
  if (fromProd) {
    return { code: fromProd.pantone, shortCode: numKey, hex: fromProd.hex, name: fromProd.name };
  }

  // 4) 임의의 팬톤 넘버(100~9999)를 PANTONE Solid Coated 색상환 규칙에 맞춰 변환
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    let h = 145, sat = 76, lit = 36;
    if (n >= 100 && n <= 139) {
      h = 42 + ((n - 100) / 40) * 14; sat = 92; lit = 48 - ((n % 7) * 3);
    } else if (n >= 140 && n <= 169) {
      h = 18 + ((n - 140) / 30) * 20; sat = 88; lit = 48 - ((n % 7) * 3);
    } else if (n >= 170 && n <= 209) {
      h = 348 + ((n - 170) / 40) * 18; sat = 84; lit = 42 - ((n % 7) * 3);
    } else if (n >= 210 && n <= 249) {
      h = 315 + ((n - 210) / 40) * 30; sat = 78; lit = 52 - ((n % 7) * 3.5);
    } else if (n >= 250 && n <= 269) {
      h = 265 + ((n - 250) / 20) * 35; sat = 66; lit = 44 - ((n % 7) * 3);
    } else if (n >= 270 && n <= 309) {
      h = 200 + ((n - 270) / 40) * 45; sat = 82; lit = 38 - ((n % 7) * 3);
    } else if (n >= 310 && n <= 339) {
      h = 165 + ((n - 310) / 30) * 30; sat = 80; lit = 38 - ((n % 7) * 3);
    } else if (n >= 340 && n <= 379) {
      h = 105 + ((n - 340) / 40) * 50; sat = 84; lit = 34 + ((n - 340) * 0.4);
    } else if (n >= 380 && n <= 399) {
      h = 68 + ((n - 380) / 20) * 32; sat = 86; lit = 46;
    } else if (n >= 400 && n <= 449) {
      h = 210; sat = 8; lit = 58 - ((n - 400) * 0.8);
    } else if (n >= 450 && n <= 499) {
      h = 28 + ((n - 450) % 25); sat = 42; lit = 34;
    } else if (n >= 500 && n <= 587) {
      h = ((n - 500) / 87) * 340; sat = 45; lit = 38;
    } else if (n >= 600 && n <= 699) {
      h = ((n - 600) / 100) * 340; sat = 55; lit = 48;
    } else if (n >= 7400 && n <= 7775) {
      h = ((n - 7400) / 375) * 330 + 35; sat = 72; lit = 40 - ((n % 8) * 2);
    } else {
      h = (n * 37) % 360; sat = 68; lit = 38;
    }
    const hex = hslToHexColor((h + 360) % 360, sat, Math.max(20, Math.min(78, lit)));
    return { code: `PANTONE ${numKey}`, shortCode: numKey, hex, name: `Pantone Solid Coated ${numKey}` };
  }

  return { code: 'PANTONE 348C', shortCode: '348C', hex: '#00843D', name: '메타그린 대표 그린' };
}

export function autoSpecPackageFront(spec) {
  const sc = getSizeClass(spec.w);
  // 사용자가 직접 입력한 namePt가 있으면 우선 적용, 없으면 규격 기본값(표준 26pt / 소형 18pt)
  const namePt = spec.customNamePt && spec.customNamePt > 0 ? +spec.customNamePt : sc.namePt[0];
  const estOneLineMm = estimateTextWidthMm(`${spec.lineName} ${spec.productName}`.trim(), namePt * PT_MM, 1);
  const nameLines = estOneLineMm > spec.w - TYPO.sideSafe * 2 ? 2 : 1;
  const isHff = spec.type === 'hff';
  const resolvedBg = spec.bg || MG_LINE.bg.hex;
  const ingBg = spec.ingBg || resolvedBg;
  // 브이레디 예외: 하단 배경이 밝아 70% 투명도에서 대비 부족 시 100%로 전환
  const contrastAt70 = +getContrastRatio(blendHex('#FFFFFF', ingBg, 0.7), ingBg);
  const ingOpacity = isHff ? 100 : contrastAt70 < 2.2 ? 100 : TYPO.foodIngredient.opacity;
  const foodPt = spec.smallException ? (sc.key === 'small' ? 12 : 10) : TYPO.foodIngredient.pt;

  return {
    ...spec,
    bg: resolvedBg,
    tagColor: MG_LINE.tag.hex,
    textColor: MG_LINE.text.hex,
    topLine: sc.topLine,
    tagW: sc.tag.wTop,
    tagH: sc.tag.h,
    gapTagName: sc.gapTagToName[0],
    namePt,
    nameLines,
    lineWeight: 'Bold',
    productWeight: 'Light',
    ingPos: isHff ? 'under' : 'bottom',
    // 건강기능식품일 때 원재료명은 항상 제품명(namePt)의 정확히 1/2 사이즈로 자동 연동
    ingPt: isHff ? +(namePt * TYPO.hffIngredient.ratio).toFixed(1) : foodPt,
    ingWeight: isHff ? 'Light' : 'Medium',
    ingOpacity,
    gapNameIng: TYPO.hffIngredient.gapFromName,
    capPt: TYPO.capacity.pt,
    capWeight: 'Medium',
    capScale: TYPO.capacity.scale,
    capTracking: TYPO.capacity.tracking,
    capPrefix: isHff,
    bottomMargin: TYPO.capacity.bottomMargin,
    markMm: isHff ? HFF_MARK.sizeMm : 0,
  };
}

export function checkPackageFront(s) {
  const sc = getSizeClass(s.w);
  const areaCm2 = +((s.w * s.h) / 100).toFixed(1);
  const isHff = s.type === 'hff';
  const checks = [];
  const add = (cat, level, id, rule, status, detail) => checks.push({ cat, level, id, rule, status, detail });

  // 1) 규격 & 상단 389C 태그/라인
  const bgDe = deltaE2000(hexToLab(s.bg), hexToLab(MG_LINE.bg.hex));
  add('brand', '필수', 'B1', `배경 컬러 ${MG_LINE.bg.pantone} (${MG_LINE.bg.hex})`,
    bgDe <= MG_LINE.colorDeltaE ? 'pass' : 'fail', `현재 ${s.bg} · ΔE ${bgDe.toFixed(1)}`);

  const tagDe = deltaE2000(hexToLab(s.tagColor), hexToLab(MG_LINE.tag.hex));
  add('brand', '필수', 'B2', `상단 바이탈뷰티 태그 컬러 ${MG_LINE.tag.pantone}`,
    tagDe <= MG_LINE.colorDeltaE ? 'pass' : 'fail', `현재 ${s.tagColor} · ΔE ${tagDe.toFixed(1)}`);

  const lineOk = Math.abs(s.topLine - sc.topLine) <= SIZE_CLASS.lineTolerance;
  add('brand', '필수', 'B3', `상단 라인 두께 ${sc.topLine}mm (${sc.label})`,
    lineOk ? 'pass' : 'fail', `현재 ${s.topLine}mm · 기준 ${sc.key === 'small' ? '소형(슬림업·브이케어·브이레디) 1.2mm' : '표준 1.5mm'}`);

  const [wMin, wMax] = sc.tag.range.wTop, [hMin, hMax] = sc.tag.range.h;
  const tagSizeOk = s.tagW >= wMin && s.tagW <= wMax && s.tagH >= hMin && s.tagH <= hMax;
  add('brand', '권장', 'B2', `사다리꼴 로고 태그 규격 (${wMin}–${wMax} × ${hMin}–${hMax}mm)`,
    tagSizeOk ? 'pass' : 'warn', `현재 ${s.tagW} × ${s.tagH}mm`);

  // 2) 제품명
  const hasName = Boolean(s.lineName.trim() && s.productName.trim());
  add('legal', '법정필수', 'L1', '주표시면 제품명 표시 (라인명·제품명 구분)',
    hasName ? 'pass' : 'fail', hasName ? `${s.lineName} / ${s.productName}` : '제품명 누락');

  const [gMin, gMax] = sc.gapTagToName;
  const gapOk = s.gapTagName >= gMin - SIZE_CLASS.gapTolerance && s.gapTagName <= gMax + SIZE_CLASS.gapTolerance;
  add('brand', '필수', 'B4', `태그 하단 → 제품명 간격 ${gMin === gMax ? gMin : gMin + '~' + gMax}mm`,
    gapOk ? 'pass' : 'fail', `현재 ${s.gapTagName}mm`);

  const [ptMin, ptMax] = sc.namePt;
  const namePtOk = s.namePt >= ptMin && s.namePt <= ptMax;
  const weightOk = s.lineWeight === 'Bold' && s.productWeight === 'Light';
  add('brand', '필수', 'B5', `제품명 Rix신고딕SE_Pro (라인명 Bold + 제품명 Light) ${ptMin === ptMax ? ptMin : ptMin + '~' + ptMax}pt / 100%`,
    namePtOk && weightOk ? 'pass' : 'fail', `현재 ${s.lineWeight}+${s.productWeight} ${s.namePt}pt`);

  const estOneLineW = (s.lineName + ' ' + s.productName).length * s.namePt * PT_MM * 0.85;
  const needTwo = estOneLineW > s.w - TYPO.sideSafe * 2;
  add('brand', '권장', 'B5', '단상자 폭 대비 긴 제품명 2줄 기입',
    !needTwo || s.nameLines === 2 ? 'pass' : 'warn',
    needTwo ? `1줄 예상폭 ${estOneLineW.toFixed(0)}mm > 안전폭 ${(s.w - 6).toFixed(0)}mm → ${s.nameLines}줄` : `${s.nameLines}줄 적합`);

  // 3) 원재료명 / 원료명 (건기식 vs 일반식품 핵심 분기)
  const hasIng = Boolean(s.ingredient.trim());
  if (isHff) {
    const expectedPt = s.namePt * TYPO.hffIngredient.ratio;
    const halfOk = Math.abs(s.ingPt - expectedPt) <= TYPO.hffIngredient.tolerancePt;
    add('brand', '필수', 'B6', `건강기능식품 원재료명 = 제품명의 1/2 크기 (${expectedPt}pt ±1pt)`,
      hasIng && halfOk ? 'pass' : 'fail', `현재 ${s.ingPt}pt (제품명 ${s.namePt}pt의 ${((s.ingPt / s.namePt) * 100).toFixed(0)}%)`);

    const posOk = s.ingPos === 'under' && Math.abs(s.gapNameIng - 3) <= SIZE_CLASS.gapTolerance;
    add('brand', '필수', 'B6', '건강기능식품 원재료명 위치: 제품명 아래 3mm · Light · 불투명 100%',
      posOk && s.ingWeight === 'Light' && s.ingOpacity === 100 ? 'pass' : 'warn',
      `위치 ${s.ingPos === 'under' ? '제품명 하단' : '패키지 하단'} · 간격 ${s.gapNameIng}mm · ${s.ingWeight} · ${s.ingOpacity}%`);
  } else {
    const hasPct = /%|％|unit/i.test(s.ingredient);
    add('legal', '법정필수', 'L4', '일반식품 원료명 + 함량(%) 표기',
      hasIng && hasPct ? 'pass' : 'fail', hasPct ? '함량 표기 확인' : '원재료 함량(%) 누락');

    add('brand', '필수', 'B7', '일반식품 원료명 위치: 제품명 밑이 아닌 패키지 하단(용량 위)',
      s.ingPos === 'bottom' ? 'pass' : 'fail', s.ingPos === 'bottom' ? '하단 배치' : '제품명 아래 배치됨(건기식 위치)');

    const pt14 = s.ingPt === 14;
    const ptExc = s.smallException && (s.ingPt >= 10 && s.ingPt <= 12);
    add('brand', '필수', 'B7', '일반식품 원료명 14pt (면적이 작을 경우에만 10~12pt 예외)',
      pt14 ? 'pass' : ptExc ? 'warn' : 'fail',
      pt14 ? '14pt 준수' : ptExc ? `소형·협소 예외 ${s.ingPt}pt 적용 (효소 10pt / 브이레디 12pt 기준)` : `현재 ${s.ingPt}pt`);

    const effHex = blendHex(s.textColor, s.ingBg || s.bg, s.ingOpacity / 100);
    const effContrast = +getContrastRatio(effHex, s.ingBg || s.bg);
    const op70 = s.ingOpacity === 70;
    const opExc = s.ingOpacity === 100 && +getContrastRatio(blendHex(s.textColor, s.ingBg || s.bg, 0.7), s.ingBg || s.bg) < 2.5;
    add('brand', '필수', 'B7', '일반식품 원료명 투명도 70% (문안이 안 보일 경우 예외적 100%)',
      op70 && effContrast >= 2.2 ? 'pass' : opExc ? 'pass' : op70 ? 'warn' : 'fail',
      `투명도 ${s.ingOpacity}% · 배경 대비 ${effContrast.toFixed(2)}:1${opExc ? ' (저대비 배경 예외 100%)' : ''}`);
  }

  // 4) 내용량(용량) & 타이포그래피 법정 기준
  const hasUnit = /\d+\s*(g|kg|ml|mL|L|정|포|캡슐|병|EA)/i.test(s.capacity);
  add('legal', '법정필수', 'L2', '주표시면 내용량 및 단위(g·mL·정·포) 표시',
    hasUnit ? 'pass' : 'fail', s.capacity || '내용량 누락');

  if (!isHff) {
    const hasKcal = /kcal|칼로리/i.test(s.capacity);
    add('legal', '법정필수', 'L5', '일반식품 내용량에 해당하는 열량(kcal) 병기',
      hasKcal ? 'pass' : 'warn', hasKcal ? 'kcal 표기됨' : '영양표시 대상 품목 여부 및 kcal 병기 확인');
  } else {
    add('legal', '법정필수', 'L3', '건강기능식품 문구 용량 앞 병기',
      s.capPrefix ? 'pass' : 'warn', s.capPrefix ? '「건강기능식품」 선행 표기' : '도안 단독 표기 여부 확인');
  }

  const legalTypoOk = s.capPt >= 10 && s.capScale >= 90 && s.capTracking >= -5;
  add('legal', '법정필수', 'L6', '법정 표시사항 글자 크기 ≥ 10pt · 장평 ≥ 90% · 자간 ≥ -5%',
    legalTypoOk ? 'pass' : 'fail', `현재 ${s.capPt}pt / 장평 ${s.capScale}% / 자간 ${s.capTracking}`);

  const brandCapOk = s.capPt === 10 && s.capScale >= 90 && s.capScale <= 92 && s.capTracking === -5
    && Math.abs(s.bottomMargin - 3) <= SIZE_CLASS.gapTolerance;
  add('brand', '필수', 'B8', '용량 Rix신고딕SE_Pro Medium(Bold) 10pt / 90% / -5 · 하단 3mm',
    brandCapOk ? 'pass' : 'warn', `${s.capWeight} ${s.capPt}pt / ${s.capScale}% / ${s.capTracking} · 하단 ${s.bottomMargin}mm`);

  // 5) 건강기능식품 인증 도안
  if (isHff) {
    const markBrandOk = Math.abs(s.markMm - HFF_MARK.sizeMm) <= 0.5;
    const markLegalOk = s.markMm >= HFF_MARK.sizeMm || (areaCm2 <= HFF_MARK.legalSmallAreaCm2 && s.markMm >= 12);
    add('legal', '법정필수', 'L3', `건강기능식품 인증 도안 15×15mm (주표시면 면적 ${areaCm2}㎠)`,
      markBrandOk ? 'pass' : markLegalOk ? 'warn' : 'fail',
      `현재 ${s.markMm}mm · 브랜드 기준 15mm 고정${areaCm2 <= 150 ? ' (법정 소형포장 ≤150㎠ 예외 대상)' : ''}`);
  } else {
    const noMark = s.markMm === 0 && !s.capPrefix;
    add('legal', '법정필수', 'L9', '일반식품에 건강기능식품 도안·문구 표시 금지',
      noMark ? 'pass' : 'fail', noMark ? '미표시 적합' : '일반식품에 건기식 표기 혼입');
  }

  // 6) 대비 & 오인/금지 표현
  const txtContrast = +getContrastRatio(s.textColor, s.bg);
  add('legal', '법정필수', 'L7', '법정 문안 배경 대비 (식별성 ≥ 4.5:1)',
    txtContrast >= 4.5 ? 'pass' : txtContrast >= 3 ? 'warn' : 'fail', `${txtContrast.toFixed(2)}:1 (${s.textColor} on ${s.bg})`);

  const allCopy = `${s.lineName} ${s.productName} ${s.ingredient} ${s.capacity} ${s.claims || ''}`.toLowerCase();
  const badDisease = CLAIM_KEYWORDS.disease.filter(k => allCopy.includes(k));
  add('legal', '법정필수', 'L8', '질병 예방·치료 오인 표현 금지',
    badDisease.length ? 'fail' : 'pass', badDisease.length ? `금지 어휘 검출: ${badDisease.join(', ')}` : '검출 없음');

  if (!isHff) {
    const fnHits = CLAIM_KEYWORDS.foodFunctional.filter(k => allCopy.includes(k.toLowerCase()));
    add('legal', '주의', 'L8', '일반식품 기능성 오인 가능 카피 검토',
      fnHits.length ? 'warn' : 'pass',
      fnHits.length ? `「${fnHits.join(', ')}」 — 기능성 표시·광고 심의 및 원료 근거 확인 필요` : '기능성 오인 어휘 없음');
  }
  const nutHits = CLAIM_KEYWORDS.nutritionClaim.filter(k => allCopy.includes(k.toLowerCase()));
  if (nutHits.length) {
    add('legal', '주의', 'L8', '전면 영양강조표시 기준 충족 확인', 'warn',
      `「${nutHits.join(', ')}」 — 식품등의 표시기준 영양강조 요건 확인`);
  }

  const score = Math.round(
    (checks.reduce((a, c) => a + (c.status === 'pass' ? 1 : c.status === 'warn' ? 0.6 : 0), 0) / checks.length) * 100
  );
  return { checks, score, sc, areaCm2 };
}

export function renderPackageFrontSvg(s, showGuides = true) {
  const W = s.w, H = s.h;
  const sc = getSizeClass(W);
  const safeW = Math.max(16, W - TYPO.sideSafe * 2);
  const tagWTop = s.tagW, tagWBot = +(s.tagW * (sc.tag.wBottom / sc.tag.wTop)).toFixed(2);
  const tagY0 = s.topLine * 0.78, tagY1 = tagY0 + s.tagH;
  const tx0 = (W - tagWTop) / 2, tx1 = tx0 + tagWTop;
  const bx0 = (W - tagWBot) / 2, bx1 = bx0 + tagWBot;

  const namePx = s.namePt * PT_MM;
  const nameLineStep = namePx * 1.15;
  const nameY1 = tagY1 + s.gapTagName + namePx * 0.84;

  // 제품명 가로폭 초과 시 자동 줄바꿈
  const oneLineName = `${s.lineName} ${s.productName}`.trim();
  const forceMultiLine = s.nameLines === 2 || estimateTextWidthMm(oneLineName, namePx, 1) > safeW;
  let titleRows = [];
  if (!forceMultiLine) {
    titleRows = [{ type: 'mixed', lineName: s.lineName, productName: s.productName }];
  } else {
    const linePartRows = wrapSvgTextToWidth(s.lineName, namePx, safeW, 1).map(t => ({
      type: 'single', text: t, weight: s.lineWeight === 'Bold' ? 700 : 300,
    }));
    const prodPartRows = wrapSvgTextToWidth(s.productName, namePx, safeW, 1).map(t => ({
      type: 'single', text: t, weight: s.productWeight === 'Light' ? 300 : 700,
    }));
    titleRows = [...linePartRows, ...prodPartRows];
  }
  const lastTitleY = nameY1 + (titleRows.length - 1) * nameLineStep;

  // 용량(내용량) 항상 단상자 정중앙(W / 2) 정렬 + 15mm 마크 간섭 시 위치를 살짝 위로 이동
  const capPx = s.capPt * PT_MM;
  const capLineStep = capPx * 1.22;
  const markSize = s.type === 'hff' ? (s.markMm || 15) : 0;
  const markX = W - TYPO.sideSafe - markSize, markY = H - s.bottomMargin - markSize;
  const capText = (s.type === 'hff' && s.capPrefix ? '건강기능식품  ' : '') + s.capacity;
  
  // 내용량 텍스트 길이 추정 (장평 capScale 반영)
  const approxCapW = capText.length * capPx * 0.58 * (s.capScale / 100);

  // 간섭 판정: 중앙정렬된 내용량의 오른쪽 끝이 15mm 마크의 왼쪽 경계(markX - 1.5mm)를 침범하는지 확인
  const isInterferingWithMark = markSize > 0 && ((W / 2) + (approxCapW / 2) > markX - 1.5);

  // 중앙정렬 1순위: safeW 전체를 기준으로 줄바꿈하여 억지로 쪼개지는 현상 방지
  const capMaxW = isInterferingWithMark ? safeW : Math.min(safeW, Math.max(16, (markX - 1.5 - W / 2) * 2));
  const capLines = wrapSvgTextToWidth(capText, capPx, isInterferingWithMark ? safeW : capMaxW, s.capScale / 100);

  const capX = W / 2; // 중앙 정렬 1순위 고정

  // 간섭 시: 중앙정렬을 1순위로 유지하고 위치를 15mm 마크 위쪽(markY - 2.5mm)으로 살짝 이동
  // 비간섭 시: 기존 하단 3mm 기준선 유지
  const capBottomY = isInterferingWithMark
    ? markY - 2.5
    : (H - s.bottomMargin - capPx * 0.2);
  const capStartY = capBottomY - (capLines.length - 1) * capLineStep;

  // 원재료명 / 원료명 가로폭 초과 시 자동 줄바꿈
  const ingPx = s.ingPt * PT_MM;
  const ingLineStep = ingPx * 1.22;
  const ingLines = wrapSvgTextToWidth(s.ingredient, ingPx, safeW, 1);

  // 로고 벡터를 현재 태그 폭에 맞춰 스케일링
  const logoScale = tagWTop / (123.55 * PT_MM);
  const logoTx = tx0 - 229.93 * PT_MM * logoScale;
  const logoTy = tagY0 - 283.61 * PT_MM * logoScale;

  // 원재료 Y 좌표
  let ingStartY;
  if (s.ingPos === 'under') {
    const lastNameBottom = lastTitleY + namePx * 0.16;
    ingStartY = lastNameBottom + s.gapNameIng + ingPx * 0.85;
  } else {
    const capTop = capStartY - capPx * 0.85;
    const blockH = (ingLines.length - 1) * ingLineStep;
    ingStartY = capTop - 3.5 - blockH;
  }

  const padL = 22, padR = 26, padT = 8, padB = 8;
  const vb = `${-padL} ${-padT} ${W + padL + padR} ${H + padT + padB}`;
  const dimLine = (x, y1, y2, label) => `
    <g stroke="#E52421" stroke-width="0.22" fill="none">
      <path d="M${x},${y1} h1.2 v${Math.max(y2 - y1, 0.4)} h-1.2"/>
    </g>
    <text x="${x + 2.4}" y="${(y1 + y2) / 2 + 0.9}" fill="#E52421" font-size="2.6" font-family="sans-serif">${label}</text>`;

  const calloutL = (y, targetX, lines) => `
    <line x1="-2.2" y1="${y}" x2="${targetX}" y2="${y}" stroke="#E52421" stroke-width="0.22"/>
    ${lines.map((l, i) => `<text x="-3" y="${y - ((lines.length - 1) * 1.2) + i * 2.5}" text-anchor="end" fill="#E52421" font-size="2.1" font-family="sans-serif">${l}</text>`).join('')}`;

  const guides = !showGuides ? '' : `
    ${dimLine(W + 2, 0, s.topLine, `${s.topLine}mm`)}
    ${dimLine(W + 2, tagY1, tagY1 + s.gapTagName, `${s.gapTagName}mm`)}
    ${s.ingPos === 'under' ? dimLine(W + 2, lastTitleY + namePx * 0.16, lastTitleY + namePx * 0.16 + s.gapNameIng, `${s.gapNameIng}mm`) : ''}
    ${dimLine(W + 2, H - s.bottomMargin, H, `${s.bottomMargin}mm`)}
    ${calloutL(nameY1 - namePx * 0.3, 2, [`라인명 ${s.lineWeight} ${s.namePt}pt`, `제품명 ${s.productWeight} ${s.namePt}pt`])}
    ${calloutL(ingStartY - ingPx * 0.3, 2, s.type === 'hff'
      ? [`원재료 ${s.ingWeight} ${s.ingPt}pt`, '제품명의 1/2']
      : [`일반식품 하단 ${s.ingOpacity}%`, `${s.ingWeight} ${s.ingPt}pt`])}
    ${calloutL(capStartY - capPx * 0.3, 2, [`${s.capWeight} ${s.capPt}pt`, `${s.capScale}% / ${s.capTracking}`])}`;

  const boldStroke = `stroke="${s.textColor}" stroke-width="${(namePx * 0.022).toFixed(3)}" paint-order="stroke fill"`;
  const titleSvg = titleRows.map((row, idx) => {
    const y = nameY1 + idx * nameLineStep;
    if (row.type === 'mixed') {
      const lIsBold = s.lineWeight === 'Bold';
      const pIsLight = s.productWeight === 'Light';
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="${s.textColor}" font-size="${namePx}" font-family="'Noto Sans KR','Apple SD Gothic Neo','RIX-신고딕se-pro',sans-serif"><tspan font-weight="${lIsBold ? 700 : 300}" ${lIsBold ? boldStroke : ''}>${row.lineName}</tspan>${row.productName ? `<tspan font-weight="${pIsLight ? 300 : 700}" ${!pIsLight ? boldStroke : ''}> ${row.productName}</tspan>` : ''}</text>`;
    }
    const isBoldRow = row.weight >= 700;
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="${s.textColor}" font-size="${namePx}" font-weight="${isBoldRow ? 700 : 300}" ${isBoldRow ? boldStroke : ''} font-family="'Noto Sans KR','Apple SD Gothic Neo','RIX-신고딕se-pro',sans-serif">${row.text}</text>`;
  }).join('\n      ');

  const glowColor = (s.bg || '').toUpperCase() === '#00843D' ? '#6DB52D' : blendHex('#FFFFFF', s.bg || '#00843D', 0.45);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="pf-svg">
    <defs>
      <clipPath id="pf-clip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
      <radialGradient id="pf-glow" cx="50%" cy="52%" r="42%">
        <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="${s.bg}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g clip-path="url(#pf-clip)">
      <rect x="0" y="0" width="${W}" height="${H}" fill="${s.bg}"/>
      <ellipse cx="${W / 2}" cy="${H * 0.54}" rx="${W * 0.38}" ry="${H * 0.24}" fill="url(#pf-glow)"/>
      ${s.ingBg && s.ingBg !== s.bg ? `<rect x="0" y="${H * 0.68}" width="${W}" height="${H * 0.32}" fill="${s.ingBg}" opacity="0.85"/>` : ''}
      <!-- 389C 상단 라인 + 사다리꼴 태그 -->
      <polygon points="${tx0},${tagY0} ${bx0},${tagY1} ${bx1},${tagY1} ${tx1},${tagY0}" fill="${s.tagColor}"/>
      <rect x="0" y="0" width="${W}" height="${s.topLine}" fill="${s.tagColor}"/>
      <!-- VITALBEAUTIE 워드마크 -->
      <g transform="translate(${logoTx} ${logoTy}) scale(${PT_MM * logoScale})" fill="${MG_LINE.logoInk.hex}">
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
      <!-- 제품명 (가로폭 초과 시 자동 개행) -->
      ${titleSvg}
      <!-- 원재료명 / 원료명 (가로폭 초과 시 자동 개행) -->
      <g opacity="${s.ingOpacity / 100}">
        ${ingLines.map((line, i) => `<text x="${W / 2}" y="${ingStartY + i * ingLineStep}" text-anchor="middle" fill="${s.textColor}" font-size="${ingPx}" font-weight="${s.ingWeight === 'Bold' ? 700 : s.ingWeight === 'Medium' ? 500 : 300}" font-family="'RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>`).join('')}
      </g>
      <!-- 용량 (가로폭 초과 시 자동 개행) -->
      <g transform="translate(${capX} ${capStartY}) scale(${s.capScale / 100} 1)">
        ${capLines.map((line, i) => `<text x="0" y="${i * capLineStep}" text-anchor="middle" fill="${s.textColor}" font-size="${capPx}" font-weight="${s.capWeight === 'Bold' ? 700 : 500}" letter-spacing="${s.capTracking * 0.004}em" font-family="'RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>`).join('')}
      </g>
      <!-- 건강기능식품 15mm 마크 (공식 mark.svg 벡터) -->
      ${markSize > 0 ? getHffMarkSvg(markX, markY, markSize) : ''}
    </g>
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="0.25"/>
    ${guides}
  </svg>`;
}

