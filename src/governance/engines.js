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
 * Adobe Illustrator (.ai) 네이티브 호환 벡터 파일(PDF-1.4 Vector Stream) 컴파일러
 * - Adobe Illustrator CS~CC 2026은 .ai 확장자 파일을 열 때 헤더가 %PDF-1.4 / %!PS-Adobe-3.0 이어야
 *   "Text Import Options" 대화상자 없이 즉시 네이티브 벡터 아트보드 및 패스로 오픈한다.
 * - SVG의 모든 벡터 요소(<path>, <circle>, <ellipse>, <rect>, <line>, <polyline>, <polygon>, <g transform>, <text>, <textPath>)를
 *   정식 PDF-1.4 벡터 그래픽 명령어(m, l, c, h, f, S, B, cm, rg, RG, BT/ET)와 정확한 xref 테이블로 컴파일한다.
 */
function parseHexOrNamedColor(raw, defsGradMap = {}) {
  if (!raw) return null;
  let s = String(raw).trim();
  const varMatch = s.match(/var\([^,]+,\s*([^)]+)\)/i);
  if (varMatch) s = varMatch[1].trim();
  if (/^(none|transparent)$/i.test(s)) return null;
  if (/^currentColor$/i.test(s)) return [0.063, 0.094, 0.125];
  const urlMatch = s.match(/url\(#([^)]+)\)/i);
  if (urlMatch && defsGradMap[urlMatch[1]]) {
    s = defsGradMap[urlMatch[1]];
  }
  const named = {
    white: '#FFFFFF',
    w: '#FFFFFF',
    wh: '#FFFFFF',
    '화이트': '#FFFFFF',
    '흰색': '#FFFFFF',
    '백색': '#FFFFFF',
    '하양': '#FFFFFF',
    '하얀색': '#FFFFFF',
    black: '#1D1D1B',
    bk: '#1D1D1B',
    blk: '#1D1D1B',
    k: '#1D1D1B',
    k100: '#1D1D1B',
    '블랙': '#1D1D1B',
    '검정': '#1D1D1B',
    '검정색': '#1D1D1B',
    '검은색': '#1D1D1B',
    '흑색': '#1D1D1B',
    '먹색': '#1D1D1B',
    red: '#E02020',
    '레드': '#E02020',
    '빨강': '#E02020',
    green: '#00843D',
    '그린': '#00843D',
    '초록': '#00843D',
  };
  if (named[s.toLowerCase()]) s = named[s.toLowerCase()];
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) return [r, g, b];
    }
  }
  const rgbMatch = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgbMatch) {
    return [
      Math.min(1, Math.max(0, parseFloat(rgbMatch[1]) / 255)),
      Math.min(1, Math.max(0, parseFloat(rgbMatch[2]) / 255)),
      Math.min(1, Math.max(0, parseFloat(rgbMatch[3]) / 255)),
    ];
  }
  return [0.063, 0.094, 0.125];
}

function mulAffine(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

function parseSvgTransformToMatrix(transformStr) {
  if (!transformStr) return null;
  let mat = [1, 0, 0, 1, 0, 0];
  const re = /(translate|scale|rotate|matrix)\s*\(([^)]*)\)/gi;
  let m;
  while ((m = re.exec(transformStr)) !== null) {
    const type = m[1].toLowerCase();
    const nums = (m[2].match(/[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:e[+-]?\d+)?/gi) || []).map(Number);
    let sub = [1, 0, 0, 1, 0, 0];
    if (type === 'translate') {
      sub = [1, 0, 0, 1, nums[0] || 0, nums[1] || 0];
    } else if (type === 'scale') {
      const sx = nums[0] ?? 1;
      const sy = nums[1] ?? sx;
      sub = [sx, 0, 0, sy, 0, 0];
    } else if (type === 'rotate') {
      const rad = ((nums[0] || 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cx = nums[1] || 0;
      const cy = nums[2] || 0;
      if (cx || cy) {
        sub = mulAffine(
          mulAffine([1, 0, 0, 1, cx, cy], [cos, sin, -sin, cos, 0, 0]),
          [1, 0, 0, 1, -cx, -cy]
        );
      } else {
        sub = [cos, sin, -sin, cos, 0, 0];
      }
    } else if (type === 'matrix' && nums.length >= 6) {
      sub = nums.slice(0, 6);
    }
    mat = mulAffine(mat, sub);
  }
  return mat;
}

function arcToCubicCurves(x1, y1, rxIn, ryIn, angleDeg, largeArcFlag, sweepFlag, x2, y2) {
  if (x1 === x2 && y1 === y2) return [];
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0) return [[x1, y1, x2, y2, x2, y2]];

  const phi = (angleDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const dx2 = (x1 - x2) / 2;
  const dy2 = (y1 - y2) / 2;
  const x1p = cosPhi * dx2 + sinPhi * dy2;
  const y1p = -sinPhi * dx2 + cosPhi * dy2;

  let rxSq = rx * rx;
  let rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  const lam = x1pSq / rxSq + y1pSq / rySq;
  if (lam > 1) {
    const s = Math.sqrt(lam);
    rx *= s;
    ry *= s;
    rxSq = rx * rx;
    rySq = ry * ry;
  }

  const sign = largeArcFlag === sweepFlag ? -1 : 1;
  const num = Math.max(0, rxSq * rySq - rxSq * y1pSq - rySq * x1pSq);
  const den = rxSq * y1pSq + rySq * x1pSq;
  const coef = sign * Math.sqrt(den === 0 ? 0 : num / den);
  const cxp = coef * ((rx * y1p) / ry);
  const cyp = coef * (-(ry * x1p) / rx);

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  const vecAngle = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let ang = Math.acos(Math.min(1, Math.max(-1, len === 0 ? 1 : dot / len)));
    if (ux * vy - uy * vx < 0) ang = -ang;
    return ang;
  };

  const theta1 = vecAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dTheta = vecAngle(
    (x1p - cxp) / rx,
    (y1p - cyp) / ry,
    (-x1p - cxp) / rx,
    (-y1p - cyp) / ry
  );
  if (!sweepFlag && dTheta > 0) dTheta -= 2 * Math.PI;
  else if (sweepFlag && dTheta < 0) dTheta += 2 * Math.PI;

  const segs = Math.max(1, Math.ceil(Math.abs(dTheta) / (Math.PI / 2)));
  const delta = dTheta / segs;
  const alpha = (4 / 3) * Math.tan(delta / 4);

  const curves = [];
  let t = theta1;
  for (let i = 0; i < segs; i++) {
    const cos1 = Math.cos(t);
    const sin1 = Math.sin(t);
    const cos2 = Math.cos(t + delta);
    const sin2 = Math.sin(t + delta);

    const p1x = cx + rx * (cosPhi * cos1 - sinPhi * sin1);
    const p1y = cy + ry * (sinPhi * cos1 + cosPhi * sin1);
    const p2x = cx + rx * (cosPhi * cos2 - sinPhi * sin2);
    const p2y = cy + ry * (sinPhi * cos2 + cosPhi * sin2);

    const d1x = -rx * (cosPhi * sin1 + sinPhi * cos1);
    const d1y = -ry * (sinPhi * sin1 - cosPhi * cos1);
    const d2x = -rx * (cosPhi * sin2 + sinPhi * cos2);
    const d2y = -ry * (sinPhi * sin2 - cosPhi * cos2);

    curves.push([
      p1x + alpha * d1x,
      p1y + alpha * d1y,
      p2x - alpha * d2x,
      p2y - alpha * d2y,
      p2x,
      p2y,
    ]);
    t += delta;
  }
  return curves;
}

function svgPathToPdfOps(dStr) {
  if (!dStr) return '';
  const ops = [];
  const f = n => +Number(n).toFixed(3);
  const cmdRe = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  const numRe = /[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:e[+-]?\d+)?/gi;

  let cx = 0, cy = 0;
  let sx = 0, sy = 0;
  let lastCubicX = 0, lastCubicY = 0;
  let lastQuadX = 0, lastQuadY = 0;
  let prevCmd = '';
  let m;

  while ((m = cmdRe.exec(dStr)) !== null) {
    const cmd = m[1];
    const argStr = m[2];
    if (cmd === 'Z' || cmd === 'z') {
      ops.push('h');
      cx = sx;
      cy = sy;
      prevCmd = cmd;
      continue;
    }

    let nums = [];
    if (cmd === 'A' || cmd === 'a') {
      // Special tokenizer for arc flags (flags can be single '0' or '1' digits)
      const arcTokenRe = /[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:e[+-]?\d+)?/gi;
      nums = (argStr.match(arcTokenRe) || []).map(Number);
    } else {
      nums = (argStr.match(numRe) || []).map(Number);
    }

    let i = 0;
    const isRel = cmd === cmd.toLowerCase();
    const upper = cmd.toUpperCase();

    if (upper === 'M') {
      while (i + 1 < nums.length) {
        const nx = (isRel ? cx : 0) + nums[i];
        const ny = (isRel ? cy : 0) + nums[i + 1];
        if (i === 0) {
          ops.push(`${f(nx)} ${f(ny)} m`);
          sx = nx;
          sy = ny;
        } else {
          ops.push(`${f(nx)} ${f(ny)} l`);
        }
        cx = nx;
        cy = ny;
        i += 2;
      }
    } else if (upper === 'L') {
      while (i + 1 < nums.length) {
        cx = (isRel ? cx : 0) + nums[i];
        cy = (isRel ? cy : 0) + nums[i + 1];
        ops.push(`${f(cx)} ${f(cy)} l`);
        i += 2;
      }
    } else if (upper === 'H') {
      while (i < nums.length) {
        cx = (isRel ? cx : 0) + nums[i];
        ops.push(`${f(cx)} ${f(cy)} l`);
        i += 1;
      }
    } else if (upper === 'V') {
      while (i < nums.length) {
        cy = (isRel ? cy : 0) + nums[i];
        ops.push(`${f(cx)} ${f(cy)} l`);
        i += 1;
      }
    } else if (upper === 'C') {
      while (i + 5 < nums.length) {
        const x1 = (isRel ? cx : 0) + nums[i];
        const y1 = (isRel ? cy : 0) + nums[i + 1];
        const x2 = (isRel ? cx : 0) + nums[i + 2];
        const y2 = (isRel ? cy : 0) + nums[i + 3];
        const x = (isRel ? cx : 0) + nums[i + 4];
        const y = (isRel ? cy : 0) + nums[i + 5];
        ops.push(`${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x)} ${f(y)} c`);
        lastCubicX = x2;
        lastCubicY = y2;
        cx = x;
        cy = y;
        prevCmd = 'C';
        i += 6;
      }
      continue;
    } else if (upper === 'S') {
      while (i + 3 < nums.length) {
        const x1 = (prevCmd === 'C' || prevCmd === 'S') ? 2 * cx - lastCubicX : cx;
        const y1 = (prevCmd === 'C' || prevCmd === 'S') ? 2 * cy - lastCubicY : cy;
        const x2 = (isRel ? cx : 0) + nums[i];
        const y2 = (isRel ? cy : 0) + nums[i + 1];
        const x = (isRel ? cx : 0) + nums[i + 2];
        const y = (isRel ? cy : 0) + nums[i + 3];
        ops.push(`${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x)} ${f(y)} c`);
        lastCubicX = x2;
        lastCubicY = y2;
        cx = x;
        cy = y;
        prevCmd = 'S';
        i += 4;
      }
      continue;
    } else if (upper === 'Q') {
      while (i + 3 < nums.length) {
        const qx = (isRel ? cx : 0) + nums[i];
        const qy = (isRel ? cy : 0) + nums[i + 1];
        const x = (isRel ? cx : 0) + nums[i + 2];
        const y = (isRel ? cy : 0) + nums[i + 3];
        const x1 = cx + (2 / 3) * (qx - cx);
        const y1 = cy + (2 / 3) * (qy - cy);
        const x2 = x + (2 / 3) * (qx - x);
        const y2 = y + (2 / 3) * (qy - y);
        ops.push(`${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x)} ${f(y)} c`);
        lastQuadX = qx;
        lastQuadY = qy;
        cx = x;
        cy = y;
        prevCmd = 'Q';
        i += 4;
      }
      continue;
    } else if (upper === 'T') {
      while (i + 1 < nums.length) {
        const qx = (prevCmd === 'Q' || prevCmd === 'T') ? 2 * cx - lastQuadX : cx;
        const qy = (prevCmd === 'Q' || prevCmd === 'T') ? 2 * cy - lastQuadY : cy;
        const x = (isRel ? cx : 0) + nums[i];
        const y = (isRel ? cy : 0) + nums[i + 1];
        const x1 = cx + (2 / 3) * (qx - cx);
        const y1 = cy + (2 / 3) * (qy - cy);
        const x2 = x + (2 / 3) * (qx - x);
        const y2 = y + (2 / 3) * (qy - y);
        ops.push(`${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x)} ${f(y)} c`);
        lastQuadX = qx;
        lastQuadY = qy;
        cx = x;
        cy = y;
        prevCmd = 'T';
        i += 2;
      }
      continue;
    } else if (upper === 'A') {
      while (i + 6 < nums.length) {
        const rx = nums[i];
        const ry = nums[i + 1];
        const rot = nums[i + 2];
        const laf = nums[i + 3] ? 1 : 0;
        const sf = nums[i + 4] ? 1 : 0;
        const x = (isRel ? cx : 0) + nums[i + 5];
        const y = (isRel ? cy : 0) + nums[i + 6];
        const curves = arcToCubicCurves(cx, cy, rx, ry, rot, laf, sf, x, y);
        for (const c of curves) {
          ops.push(`${f(c[0])} ${f(c[1])} ${f(c[2])} ${f(c[3])} ${f(c[4])} ${f(c[5])} c`);
        }
        cx = x;
        cy = y;
        i += 7;
      }
    }
    prevCmd = upper;
  }
  return ops.join('\n');
}

function circleOrEllipseToPdfOps(cx, cy, rx, ry) {
  const f = n => +Number(n).toFixed(3);
  const k = 0.5522847498;
  const kx = rx * k;
  const ky = ry * k;
  return [
    `${f(cx + rx)} ${f(cy)} m`,
    `${f(cx + rx)} ${f(cy + ky)} ${f(cx + kx)} ${f(cy + ry)} ${f(cx)} ${f(cy + ry)} c`,
    `${f(cx - kx)} ${f(cy + ry)} ${f(cx - rx)} ${f(cy + ky)} ${f(cx - rx)} ${f(cy)} c`,
    `${f(cx - rx)} ${f(cy - ky)} ${f(cx - kx)} ${f(cy - ry)} ${f(cx)} ${f(cy - ry)} c`,
    `${f(cx + kx)} ${f(cy - ry)} ${f(cx + rx)} ${f(cy - ky)} ${f(cx + rx)} ${f(cy)} c`,
    'h',
  ].join('\n');
}

function rectToPdfOps(x, y, w, h, rxIn = 0, ryIn = 0) {
  const f = n => +Number(n).toFixed(3);
  const rx = Math.min(w / 2, Math.max(0, rxIn || ryIn));
  const ry = Math.min(h / 2, Math.max(0, ryIn || rxIn));
  if (rx <= 0 || ry <= 0) {
    return `${f(x)} ${f(y)} m\n${f(x + w)} ${f(y)} l\n${f(x + w)} ${f(y + h)} l\n${f(x)} ${f(y + h)} l\nh`;
  }
  const k = 0.5522847498;
  const kx = rx * k;
  const ky = ry * k;
  return [
    `${f(x + rx)} ${f(y)} m`,
    `${f(x + w - rx)} ${f(y)} l`,
    `${f(x + w - rx + kx)} ${f(y)} ${f(x + w)} ${f(y + ry - ky)} ${f(x + w)} ${f(y + ry)} c`,
    `${f(x + w)} ${f(y + h - ry)} l`,
    `${f(x + w)} ${f(y + h - ry + ky)} ${f(x + w - rx + kx)} ${f(y + h)} ${f(x + w - rx)} ${f(y + h)} c`,
    `${f(x + rx)} ${f(y + h)} l`,
    `${f(x + rx - kx)} ${f(y + h)} ${f(x)} ${f(y + h - ry + ky)} ${f(x)} ${f(y + h - ry)} c`,
    `${f(x)} ${f(y + ry)} l`,
    `${f(x)} ${f(y + ry - ky)} ${f(x + rx - kx)} ${f(y)} ${f(x + rx)} ${f(y)} c`,
    'h',
  ].join('\n');
}

/* ─── TrueType (.ttf) / OpenType (.otf) Vector Font Parser for Native .AI Export ─── */
const TTF_FONT_CACHE = {
  koBold: null,
  koMedium: null,
  koLight: null,
  omniBold: null,
  omniMedium: null,
  omniLight: null,
  enBold: null,
  enLight: null,
  loadingPromise: null,
};

function parseTtfBuffer(arrayBuffer) {
  const dv = new DataView(arrayBuffer);
  const numTables = dv.getUint16(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const off = 12 + i * 16;
    const tag = String.fromCharCode(
      dv.getUint8(off),
      dv.getUint8(off + 1),
      dv.getUint8(off + 2),
      dv.getUint8(off + 3)
    );
    tables[tag] = { offset: dv.getUint32(off + 8), length: dv.getUint32(off + 12) };
  }
  const headOff = tables.head.offset;
  const unitsPerEm = dv.getUint16(headOff + 18);
  const indexToLocFormat = dv.getInt16(headOff + 50);
  const numHMetrics = dv.getUint16(tables.hhea.offset + 34);
  const numGlyphs = dv.getUint16(tables.maxp.offset + 4);
  const hmtxOff = tables.hmtx.offset;
  const locaOff = tables.loca ? tables.loca.offset : 0;
  const glyfOff = tables.glyf ? tables.glyf.offset : 0;
  const isCff = Boolean(tables['CFF ']);

  const cmapOff = tables.cmap.offset;
  const numSub = dv.getUint16(cmapOff + 2);
  let fmt4Off = 0;
  let fmt12Off = 0;
  for (let i = 0; i < numSub; i++) {
    const pid = dv.getUint16(cmapOff + 4 + i * 8);
    const eid = dv.getUint16(cmapOff + 6 + i * 8);
    const subOff = cmapOff + dv.getUint32(cmapOff + 8 + i * 8);
    const fmt = dv.getUint16(subOff);
    if ((pid === 3 && (eid === 1 || eid === 10)) || pid === 0) {
      if (fmt === 12) fmt12Off = subOff;
      else if (fmt === 4 && !fmt4Off) fmt4Off = subOff;
    }
  }

  function codeToGid(code) {
    if (fmt12Off) {
      const nGroups = dv.getUint32(fmt12Off + 12);
      for (let i = 0; i < nGroups; i++) {
        const gOff = fmt12Off + 16 + i * 12;
        const sc = dv.getUint32(gOff);
        const ec = dv.getUint32(gOff + 4);
        if (code >= sc && code <= ec) return dv.getUint32(gOff + 8) + (code - sc);
      }
    }
    if (fmt4Off) {
      const segCount = dv.getUint16(fmt4Off + 6) >> 1;
      const endCountOff = fmt4Off + 14;
      const startCountOff = endCountOff + segCount * 2 + 2;
      const idDeltaOff = startCountOff + segCount * 2;
      const idRangeOff = idDeltaOff + segCount * 2;
      for (let i = 0; i < segCount; i++) {
        const ec = dv.getUint16(endCountOff + i * 2);
        if (code <= ec) {
          const sc = dv.getUint16(startCountOff + i * 2);
          if (code < sc) return 0;
          const delta = dv.getInt16(idDeltaOff + i * 2);
          const ro = dv.getUint16(idRangeOff + i * 2);
          if (ro === 0) return (code + delta) & 0xffff;
          const gAddr = idRangeOff + i * 2 + ro + (code - sc) * 2;
          const gid = dv.getUint16(gAddr);
          return gid === 0 ? 0 : (gid + delta) & 0xffff;
        }
      }
    }
    return 0;
  }

  function getAdvanceWidth(gid) {
    const idx = gid < numHMetrics ? gid : numHMetrics - 1;
    return dv.getUint16(hmtxOff + idx * 4);
  }

  function getGlyphOffset(gid) {
    if (!locaOff || !glyfOff || gid < 0 || gid >= numGlyphs) return [0, 0];
    if (indexToLocFormat === 0) {
      return [dv.getUint16(locaOff + gid * 2) * 2, dv.getUint16(locaOff + (gid + 1) * 2) * 2];
    }
    return [dv.getUint32(locaOff + gid * 4), dv.getUint32(locaOff + (gid + 1) * 4)];
  }

  function getGlyphContours(gid) {
    const [o1, o2] = getGlyphOffset(gid);
    if (o1 === o2) return [];
    const off = glyfOff + o1;
    const nContours = dv.getInt16(off);
    if (nContours === 0) return [];
    if (nContours > 0) {
      const endPts = [];
      for (let i = 0; i < nContours; i++) endPts.push(dv.getUint16(off + 10 + i * 2));
      const nPts = endPts[endPts.length - 1] + 1;
      const insLen = dv.getUint16(off + 10 + nContours * 2);
      let p = off + 12 + nContours * 2 + insLen;
      const flags = [];
      while (flags.length < nPts) {
        const fl = dv.getUint8(p++);
        flags.push(fl);
        if (fl & 8) {
          const rep = dv.getUint8(p++);
          for (let r = 0; r < rep; r++) flags.push(fl);
        }
      }
      const xs = new Array(nPts);
      let x = 0;
      for (let i = 0; i < nPts; i++) {
        const fl = flags[i];
        if (fl & 2) {
          const dx = dv.getUint8(p++);
          x += fl & 16 ? dx : -dx;
        } else if (!(fl & 16)) {
          x += dv.getInt16(p);
          p += 2;
        }
        xs[i] = x;
      }
      const ys = new Array(nPts);
      let y = 0;
      for (let i = 0; i < nPts; i++) {
        const fl = flags[i];
        if (fl & 4) {
          const dy = dv.getUint8(p++);
          y += fl & 32 ? dy : -dy;
        } else if (!(fl & 32)) {
          y += dv.getInt16(p);
          p += 2;
        }
        ys[i] = y;
      }
      const contours = [];
      let start = 0;
      for (const end of endPts) {
        const pts = [];
        for (let i = start; i <= end; i++) {
          pts.push({ x: xs[i], y: ys[i], on: Boolean(flags[i] & 1) });
        }
        contours.push(pts);
        start = end + 1;
      }
      return contours;
    }
    // Compound glyph
    let p = off + 10;
    const all = [];
    while (true) {
      const fl = dv.getUint16(p);
      const subGid = dv.getUint16(p + 2);
      p += 4;
      let dx = 0;
      let dy = 0;
      if (fl & 1) {
        dx = dv.getInt16(p);
        dy = dv.getInt16(p + 2);
        p += 4;
      } else {
        dx = dv.getInt8(p);
        dy = dv.getInt8(p + 1);
        p += 2;
      }
      let a = 1;
      let b = 0;
      let c = 0;
      let d = 1;
      if (fl & 8) {
        a = d = dv.getInt16(p) / 16384;
        p += 2;
      } else if (fl & 64) {
        a = dv.getInt16(p) / 16384;
        d = dv.getInt16(p + 2) / 16384;
        p += 4;
      } else if (fl & 128) {
        a = dv.getInt16(p) / 16384;
        b = dv.getInt16(p + 2) / 16384;
        c = dv.getInt16(p + 4) / 16384;
        d = dv.getInt16(p + 6) / 16384;
        p += 8;
      }
      const subC = getGlyphContours(subGid);
      for (const cnt of subC) {
        all.push(
          cnt.map(pt => ({
            x: a * pt.x + c * pt.y + dx,
            y: b * pt.x + d * pt.y + dy,
            on: pt.on,
          }))
        );
      }
      if (!(fl & 32)) break;
    }
    return all;
  }

  function glyphToPdfOps(gid, ox, oy, scale, rotRad = 0) {
    const contours = getGlyphContours(gid);
    if (!contours.length) return '';
    const f = n => +Number(n).toFixed(3);
    const cos = rotRad ? Math.cos(rotRad) : 1;
    const sin = rotRad ? Math.sin(rotRad) : 0;
    const tx = (px, py) => {
      const sx = px * scale;
      const sy = -py * scale;
      if (!rotRad) return [ox + sx, oy + sy];
      return [ox + sx * cos - sy * sin, oy + sx * sin + sy * cos];
    };
    const ops = [];
    for (const rawPts of contours) {
      const n = rawPts.length;
      if (n < 2) continue;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const cur = rawPts[i];
        const next = rawPts[(i + 1) % n];
        pts.push(cur);
        if (!cur.on && !next.on) {
          pts.push({ x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2, on: true });
        }
      }
      const firstOn = pts.findIndex(p => p.on);
      if (firstOn === -1) continue;
      const ordered = [...pts.slice(firstOn), ...pts.slice(0, firstOn)];
      let [cx, cy] = tx(ordered[0].x, ordered[0].y);
      ops.push(`${f(cx)} ${f(cy)} m`);
      let i = 1;
      while (i < ordered.length) {
        const p = ordered[i];
        if (p.on) {
          const [nx, ny] = tx(p.x, p.y);
          ops.push(`${f(nx)} ${f(ny)} l`);
          cx = nx;
          cy = ny;
          i++;
        } else {
          const q = p;
          const endP = ordered[(i + 1) % ordered.length];
          const [qx, qy] = tx(q.x, q.y);
          const [ex, ey] = tx(endP.x, endP.y);
          const cp1x = cx + (2 / 3) * (qx - cx);
          const cp1y = cy + (2 / 3) * (qy - cy);
          const cp2x = ex + (2 / 3) * (qx - ex);
          const cp2y = ey + (2 / 3) * (qy - ey);
          ops.push(`${f(cp1x)} ${f(cp1y)} ${f(cp2x)} ${f(cp2y)} ${f(ex)} ${f(ey)} c`);
          cx = ex;
          cy = ey;
          i += 2;
        }
      }
      const [sx, sy] = tx(ordered[0].x, ordered[0].y);
      if (Math.hypot(cx - sx, cy - sy) > 0.001) {
        ops.push(`${f(sx)} ${f(sy)} l`);
      }
      ops.push('h');
    }
    return ops.join('\n');
  }

  return { unitsPerEm, isCff, codeToGid, getAdvanceWidth, glyphToPdfOps };
}

export async function ensureAiFontsLoaded() {
  if (TTF_FONT_CACHE.koBold) return TTF_FONT_CACHE;
  if (TTF_FONT_CACHE.loadingPromise) return TTF_FONT_CACHE.loadingPromise;
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
  const loadOne = async (rel, fontKey, psName) => {
    try {
      const res = await fetch(base.replace(/\/$/, '') + '/' + rel.replace(/^\//, ''));
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const parsed = parseTtfBuffer(buf);
      parsed.rawBytes = new Uint8Array(buf);
      parsed.fontKey = fontKey;
      parsed.psName = psName;
      return parsed;
    } catch {
      return null;
    }
  };
  TTF_FONT_CACHE.loadingPromise = (async () => {
    const [koBold, koMedium, koLight, enBold, enLight, omniHeavy, omniBold, omniMedium, omniLight, omniThin, notoBold, notoRegular] = await Promise.all([
      loadOne('assets/fonts/RixSinGoSE_Pro-Bold.otf', 'F1', 'RixSinGoSEPB'),
      loadOne('assets/fonts/RixSinGoSE_Pro-Medium.otf', 'F2', 'RixSinGoSEPM'),
      loadOne('assets/fonts/RixSinGoSE_Pro-Light.otf', 'F3', 'RixSinGoSEPL'),
      loadOne('assets/fonts/Raleway-Bold.ttf', 'F4', 'Raleway-Bold'),
      loadOne('assets/fonts/Raleway-Light.ttf', 'F5', 'RalewayRoman-Light'),
      loadOne('assets/fonts/210OmniGothic-050.ttf', 'F6', 'TTOmniGothicH'),
      loadOne('assets/fonts/210OmniGothic-040.ttf', 'F7', 'TTOmniGothicB'),
      loadOne('assets/fonts/210OmniGothic-030.ttf', 'F8', 'TTOmniGothicM'),
      loadOne('assets/fonts/210OmniGothic-020.ttf', 'F9', 'TTOmniGothicL'),
      loadOne('assets/fonts/210OmniGothic-010.ttf', 'F10', 'TTOmniGothicT'),
      loadOne('assets/fonts/NotoSansCJKsc-Bold.otf', 'F11', 'NotoSansCJKsc-Bold'),
      loadOne('assets/fonts/NotoSansCJKsc-Regular.otf', 'F12', 'NotoSansCJKsc-Regular'),
    ]);
    TTF_FONT_CACHE.koBold = koBold;
    TTF_FONT_CACHE.koMedium = koMedium || koBold;
    TTF_FONT_CACHE.koLight = koLight || koMedium || koBold;
    TTF_FONT_CACHE.enBold = enBold || koBold;
    TTF_FONT_CACHE.enLight = enLight || koLight || koBold;
    TTF_FONT_CACHE.omniHeavy = omniHeavy || omniBold || koBold;
    TTF_FONT_CACHE.omniBold = omniBold || koBold;
    TTF_FONT_CACHE.omniMedium = omniMedium || omniBold || koMedium || koBold;
    TTF_FONT_CACHE.omniLight = omniLight || omniMedium || koLight || koBold;
    TTF_FONT_CACHE.omniThin = omniThin || omniLight || koLight || koBold;
    TTF_FONT_CACHE.notoBold = notoBold || koBold;
    TTF_FONT_CACHE.notoRegular = notoRegular || koMedium || koBold;
    return TTF_FONT_CACHE;
  })();
  return TTF_FONT_CACHE.loadingPromise;
}

if (typeof window !== 'undefined') {
  ensureAiFontsLoaded();
}

function selectTtfFontForChar(ch, weight = 500, fontFamily = '') {
  const w = Number(weight) || (/bold/i.test(String(weight)) ? 700 : /light/i.test(String(weight)) ? 300 : 500);

  // If pure OmniGothic is explicitly requested (not as a fallback in a list)
  const isExplicitOmni = (/^['"]?(?:210\s*)?omni/i.test(fontFamily.trim()) || /옴니/i.test(fontFamily)) && !/rix|shingothic|신고딕|singose/i.test(fontFamily);
  if (isExplicitOmni) {
    const of = w >= 800
      ? TTF_FONT_CACHE.omniHeavy
      : w >= 650
      ? TTF_FONT_CACHE.omniBold
      : w >= 450
      ? TTF_FONT_CACHE.omniMedium
      : w >= 250
      ? TTF_FONT_CACHE.omniLight
      : TTF_FONT_CACHE.omniThin;
    if (of && of.codeToGid(ch.charCodeAt(0)) > 0) return of;
  }

  const preferRaleway = /raleway/i.test(fontFamily) && /^[\x20-\x7E]$/.test(ch) && !/[0-9]/.test(ch);
  if (preferRaleway) {
    const rf = w >= 600 ? TTF_FONT_CACHE.enBold : TTF_FONT_CACHE.enLight;
    if (rf && rf.codeToGid(ch.charCodeAt(0)) > 0) return rf;
  }
  if (/noto|jp|ja|sc|cjk/i.test(fontFamily) || /[\u3040-\u30ff\u30fc\u30fb\u4e00-\u9fff]/.test(ch)) {
    const nf = w >= 600 ? TTF_FONT_CACHE.notoBold : TTF_FONT_CACHE.notoRegular;
    if (nf && nf.codeToGid(ch.charCodeAt(0)) > 0) return nf;
  }

  // VITALBEAUTIE 표준 가이드 기본 한글 폰트: RixSinGoSE_Pro (Bold / Medium / Light)
  if (w >= 650 && TTF_FONT_CACHE.koBold && TTF_FONT_CACHE.koBold.codeToGid(ch.charCodeAt(0)) > 0) return TTF_FONT_CACHE.koBold;
  if (w >= 450 && TTF_FONT_CACHE.koMedium && TTF_FONT_CACHE.koMedium.codeToGid(ch.charCodeAt(0)) > 0) return TTF_FONT_CACHE.koMedium;
  if (TTF_FONT_CACHE.koLight && TTF_FONT_CACHE.koLight.codeToGid(ch.charCodeAt(0)) > 0) return TTF_FONT_CACHE.koLight;
  if (TTF_FONT_CACHE.koBold && TTF_FONT_CACHE.koBold.codeToGid(ch.charCodeAt(0)) > 0) return TTF_FONT_CACHE.koBold;

  return TTF_FONT_CACHE.koMedium || TTF_FONT_CACHE.koBold;
}

function encodePdfTextCmd(str, fontSize, isBold = false) {
  const clean = String(str || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const isAscii = /^[\x20-\x7E]+$/.test(clean);
  const fs = +Number(fontSize || 10).toFixed(2);
  if (isAscii) {
    const escaped = clean.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    return `/${isBold ? 'F2' : 'F1'} ${fs} Tf (${escaped}) Tj`;
  }
  let hex = '';
  for (let i = 0; i < clean.length; i++) {
    hex += clean.charCodeAt(i).toString(16).padStart(4, '0').toUpperCase();
  }
  return `/F3 ${fs} Tf <${hex}> Tj`;
}

export function buildIllustratorAiBlob(svgText, title = 'VITALBEAUTIE_Asset') {
  const raw = String(svgText || '');
  const vbMatch = raw.match(/viewBox=["']([^"']+)["']/i);
  const vb = vbMatch ? vbMatch[1].trim().split(/[\s,]+/).map(Number) : [0, 0, 120, 120];
  const minX = vb[0] || 0;
  const minY = vb[1] || 0;
  const vbW = vb[2] || 120;
  const vbH = vb[3] || 120;

  // Artboard size in points (1mm = 2.83464567pt)
  let pw = vbW;
  let ph = vbH;
  const wMmMatch = raw.match(/<svg[^>]*\bwidth=["']([\d.]+)mm["']/i);
  const hMmMatch = raw.match(/<svg[^>]*\bheight=["']([\d.]+)mm["']/i);
  if (wMmMatch && hMmMatch) {
    pw = +(parseFloat(wMmMatch[1]) * 2.83464567).toFixed(2);
    ph = +(parseFloat(hMmMatch[1]) * 2.83464567).toFixed(2);
  } else if (/class=["'][^"']*pf-svg/i.test(raw)) {
    pw = +(vbW * 2.83464567).toFixed(2);
    ph = +(vbH * 2.83464567).toFixed(2);
  } else if (Math.max(vbW, vbH) < 90) {
    // Small viewBoxes (e.g. 45.04 or 64) scaled to 30mm (85.04pt) artboard
    const factor = 85.04 / Math.max(vbW, vbH);
    pw = +(vbW * factor).toFixed(2);
    ph = +(vbH * factor).toFixed(2);
  }

  const scaleX = pw / vbW;
  const scaleY = ph / vbH;

  // 1) Extract CSS class rules from <style>
  const classStyles = {};
  const styleMatches = raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  for (const sm of styleMatches) {
    const css = sm[1];
    const ruleRe = /\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g;
    let rm;
    while ((rm = ruleRe.exec(css)) !== null) {
      const cls = rm[1];
      const props = {};
      rm[2].split(';').forEach(pair => {
        const [k, v] = pair.split(':').map(s => s && s.trim());
        if (k && v) props[k.toLowerCase()] = v;
      });
      classStyles[cls] = props;
    }
  }

  // 2) Extract gradient stop colors & arc paths from <defs>
  const defsGradMap = {};
  const defsArcMap = {};
  const gradRe = /<(?:linearGradient|radialGradient)[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:linearGradient|radialGradient)>/gi;
  let gm;
  while ((gm = gradRe.exec(raw)) !== null) {
    const stopMatch = gm[2].match(/stop-color=["']([^"']+)["']/i);
    if (stopMatch) defsGradMap[gm[1]] = stopMatch[1];
  }
  const pathIdRe = /<path[^>]*\bid=["']([^"']+)["'][^>]*\bd=["']([^"']+)["'][^>]*\/?>/gi;
  let pm;
  while ((pm = pathIdRe.exec(raw)) !== null) {
    const arcNums = (pm[2].match(/[+-]?(?:\d+\.\d*|\d+|\.\d+)/g) || []).map(Number);
    if (arcNums.length >= 9) {
      const x1 = arcNums[0], y1 = arcNums[1];
      const r = arcNums[2];
      const x2 = arcNums[7], y2 = arcNums[8];
      defsArcMap[pm[1]] = { cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, r };
    }
  }

  // Strip <defs>, <clipPath>, <style> before rendering visible shapes
  const visibleSvg = raw
    .replace(/<defs[\s\S]*?<\/defs>/gi, '')
    .replace(/<clipPath[\s\S]*?<\/clipPath>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const parseAttrs = attrStr => {
    const attrs = {};
    const re = /([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = re.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2] !== undefined ? m[2] : m[3];
    }
    if (attrs.class && classStyles[attrs.class]) {
      Object.entries(classStyles[attrs.class]).forEach(([k, v]) => {
        if (attrs[k] === undefined) attrs[k] = v;
      });
    }
    if (attrs.style) {
      attrs.style.split(';').forEach(pair => {
        const idx = pair.indexOf(':');
        if (idx > 0) {
          const k = pair.slice(0, idx).trim().toLowerCase();
          const v = pair.slice(idx + 1).trim();
          if (k && v) attrs[k] = v;
        }
      });
    }
    return attrs;
  };

  // State stack for nested <svg> / <g>
  const defaultState = {
    fill: '#101820',
    stroke: 'none',
    strokeWidth: 1,
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    fillRule: 'nonzero',
    opacity: 1,
  };
  const stateStack = [{ ...defaultState }];
  const pdfLines = [];
  const usedFonts = new Map();
  let canvasBgRgb = [1, 1, 1];

  const recordGlyphForLiveFont = (ttf, ch) => {
    if (!ttf || !ttf.rawBytes) return null;
    const code = ch.charCodeAt(0);
    const gid = ttf.codeToGid(code);
    if (gid === 0 && ch !== ' ') return null;
    let entry = usedFonts.get(ttf.fontKey);
    if (!entry) {
      entry = { ttf, glyphs: new Map() };
      usedFonts.set(ttf.fontKey, entry);
    }
    const w1000 = Math.round((ttf.getAdvanceWidth(gid) * 1000) / ttf.unitsPerEm);
    entry.glyphs.set(gid, { unicode: code, width1000: w1000 });
    return gid.toString(16).padStart(4, '0').toUpperCase();
  };

  // Root coordinate transform: SVG top-left (minX, minY) -> PDF bottom-left (0, 0)
  const f = n => +Number(n).toFixed(3);
  pdfLines.push('q');
  pdfLines.push(`${f(scaleX)} 0 0 ${f(-scaleY)} ${f(-minX * scaleX)} ${f(ph + minY * scaleY)} cm`);

  // Check if this is a reverse-white asset that needs a dark artboard background rect
  const isReverseWhiteAsset = /white|reverse/i.test(title) && !/<rect[^>]*width=["']100%|<rect[^>]*fill=["']#(?:101820|00843D)/i.test(visibleSvg);
  if (isReverseWhiteAsset) {
    canvasBgRgb = [0.063, 0.094, 0.125];
    pdfLines.push('q');
    pdfLines.push('0.063 0.094 0.125 rg');
    pdfLines.push(rectToPdfOps(minX, minY, vbW, vbH));
    pdfLines.push('f');
    pdfLines.push('Q');
  }

  const mergeState = (parent, attrs) => ({
    fill: attrs.fill !== undefined ? attrs.fill : parent.fill,
    stroke: attrs.stroke !== undefined ? attrs.stroke : parent.stroke,
    strokeWidth: attrs['stroke-width'] !== undefined ? parseFloat(attrs['stroke-width']) : parent.strokeWidth,
    strokeLinecap: attrs['stroke-linecap'] !== undefined ? attrs['stroke-linecap'] : parent.strokeLinecap,
    strokeLinejoin: attrs['stroke-linejoin'] !== undefined ? attrs['stroke-linejoin'] : parent.strokeLinejoin,
    fillRule: attrs['fill-rule'] !== undefined ? attrs['fill-rule'] : parent.fillRule,
    opacity: (parent.opacity ?? 1) * (attrs.opacity !== undefined ? parseFloat(attrs.opacity) : 1),
  });

  const blendWithBg = (rgb, alpha) => {
    if (!rgb || alpha >= 0.995) return rgb;
    const a = Math.max(0, Math.min(1, alpha));
    return [
      rgb[0] * a + canvasBgRgb[0] * (1 - a),
      rgb[1] * a + canvasBgRgb[1] * (1 - a),
      rgb[2] * a + canvasBgRgb[2] * (1 - a),
    ];
  };

  const emitShapeWithStyle = (pathOps, st) => {
    if (!pathOps) return;
    const fillRgb = blendWithBg(parseHexOrNamedColor(st.fill, defsGradMap), st.opacity ?? 1);
    const strokeRgb = blendWithBg(parseHexOrNamedColor(st.stroke, defsGradMap), st.opacity ?? 1);
    if (!fillRgb && !strokeRgb) return;

    pdfLines.push('q');
    if (fillRgb) {
      pdfLines.push(`${f(fillRgb[0])} ${f(fillRgb[1])} ${f(fillRgb[2])} rg`);
    }
    if (strokeRgb) {
      pdfLines.push(`${f(strokeRgb[0])} ${f(strokeRgb[1])} ${f(strokeRgb[2])} RG`);
      pdfLines.push(`${f(st.strokeWidth || 1)} w`);
      const capMap = { butt: 0, round: 1, square: 2 };
      const joinMap = { miter: 0, round: 1, bevel: 2 };
      pdfLines.push(`${capMap[st.strokeLinecap] ?? 1} J`);
      pdfLines.push(`${joinMap[st.strokeLinejoin] ?? 1} j`);
    }
    pdfLines.push(pathOps);
    const isEvenOdd = st.fillRule === 'evenodd';
    if (fillRgb && strokeRgb) {
      pdfLines.push(isEvenOdd ? 'B*' : 'B');
    } else if (fillRgb) {
      pdfLines.push(isEvenOdd ? 'f*' : 'f');
    } else {
      pdfLines.push('S');
    }
    pdfLines.push('Q');
  };

  // Tokenize tags in document order
  const tagRe = /<\/?([A-Za-z][A-Za-z0-9:_-]*)([^>]*?)\/?>/g;
  let tm;
  let seenRootSvg = false;
  while ((tm = tagRe.exec(visibleSvg)) !== null) {
    const fullMatch = tm[0];
    const tagName = tm[1].toLowerCase();
    const attrStr = tm[2] || '';
    const isClosing = fullMatch.startsWith('</');
    const isSelfClosing = fullMatch.endsWith('/>');

    if (tagName === 'svg' || tagName === 'g') {
      if (isClosing) {
        if (stateStack.length > 1) {
          const popped = stateStack.pop();
          if (popped.hasTransform) pdfLines.push('Q');
        }
      } else if (!isSelfClosing) {
        const attrs = parseAttrs(attrStr);
        const cur = stateStack[stateStack.length - 1];
        const next = mergeState(cur, attrs);
        let mat = parseSvgTransformToMatrix(attrs.transform);
        const isNestedSvg = tagName === 'svg' && seenRootSvg;
        if (tagName === 'svg') seenRootSvg = true;

        if (isNestedSvg && (attrs.x !== undefined || attrs.y !== undefined || attrs.viewbox !== undefined || attrs.viewBox !== undefined)) {
          const sx = parseFloat(attrs.x || 0);
          const sy = parseFloat(attrs.y || 0);
          const vbRaw = attrs.viewbox || attrs.viewBox;
          if (vbRaw) {
            const parts = vbRaw.trim().split(/[\s,]+/).map(Number);
            const vx = parts[0] || 0, vy = parts[1] || 0, vw = parts[2] || 1, vh = parts[3] || 1;
            const sw = parseFloat(attrs.width || vw);
            const sh = parseFloat(attrs.height || vh);
            const kx = sw / vw;
            const ky = sh / vh;
            const subMat = [kx, 0, 0, ky, sx - vx * kx, sy - vy * ky];
            mat = mat ? mulAffine(mat, subMat) : subMat;
          } else if (sx !== 0 || sy !== 0) {
            const subMat = [1, 0, 0, 1, sx, sy];
            mat = mat ? mulAffine(mat, subMat) : subMat;
          }
        }
        if (mat) {
          pdfLines.push('q');
          pdfLines.push(`${f(mat[0])} ${f(mat[1])} ${f(mat[2])} ${f(mat[3])} ${f(mat[4])} ${f(mat[5])} cm`);
          next.hasTransform = true;
        }
        stateStack.push(next);
      }
      continue;
    }

    if (isClosing) continue;
    const attrs = parseAttrs(attrStr);
    const curState = mergeState(stateStack[stateStack.length - 1], attrs);
    const elemMat = parseSvgTransformToMatrix(attrs.transform);

    if (elemMat) {
      pdfLines.push('q');
      pdfLines.push(`${f(elemMat[0])} ${f(elemMat[1])} ${f(elemMat[2])} ${f(elemMat[3])} ${f(elemMat[4])} ${f(elemMat[5])} cm`);
    }

    if (tagName === 'path') {
      const ops = svgPathToPdfOps(attrs.d);
      emitShapeWithStyle(ops, curState);
    } else if (tagName === 'circle') {
      const cx = parseFloat(attrs.cx || 0);
      const cy = parseFloat(attrs.cy || 0);
      const r = parseFloat(attrs.r || 0);
      if (r > 0) emitShapeWithStyle(circleOrEllipseToPdfOps(cx, cy, r, r), curState);
    } else if (tagName === 'ellipse') {
      const cx = parseFloat(attrs.cx || 0);
      const cy = parseFloat(attrs.cy || 0);
      const rx = parseFloat(attrs.rx || 0);
      const ry = parseFloat(attrs.ry || 0);
      if (rx > 0 && ry > 0) emitShapeWithStyle(circleOrEllipseToPdfOps(cx, cy, rx, ry), curState);
    } else if (tagName === 'rect') {
      const x = parseFloat(attrs.x || 0);
      const y = parseFloat(attrs.y || 0);
      const w = parseFloat(attrs.width || 0);
      const h = parseFloat(attrs.height || 0);
      const rx = parseFloat(attrs.rx || 0);
      const ry = parseFloat(attrs.ry || 0);
      if (x === 0 && y === 0 && w >= vbW * 0.45 && h >= vbH * 0.6 && curState.fill && curState.fill !== 'none') {
        const bgC = parseHexOrNamedColor(curState.fill, defsGradMap);
        if (bgC) canvasBgRgb = bgC;
      }
      if (w > 0 && h > 0) emitShapeWithStyle(rectToPdfOps(x, y, w, h, rx, ry), curState);
    } else if (tagName === 'line') {
      const x1 = parseFloat(attrs.x1 || 0);
      const y1 = parseFloat(attrs.y1 || 0);
      const x2 = parseFloat(attrs.x2 || 0);
      const y2 = parseFloat(attrs.y2 || 0);
      emitShapeWithStyle(`${f(x1)} ${f(y1)} m\n${f(x2)} ${f(y2)} l`, curState);
    } else if (tagName === 'polyline' || tagName === 'polygon') {
      const pts = (attrs.points || '').match(/[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:e[+-]?\d+)?/gi) || [];
      if (pts.length >= 4) {
        const pOps = [`${f(pts[0])} ${f(pts[1])} m`];
        for (let i = 2; i + 1 < pts.length; i += 2) {
          pOps.push(`${f(pts[i])} ${f(pts[i + 1])} l`);
        }
        if (tagName === 'polygon') pOps.push('h');
        emitShapeWithStyle(pOps.join('\n'), curState);
      }
    } else if (tagName === 'text' && !isSelfClosing) {
      const closeIdx = visibleSvg.indexOf('</text>', tagRe.lastIndex);
      if (closeIdx !== -1) {
        const innerHtml = visibleSvg.slice(tagRe.lastIndex, closeIdx);
        tagRe.lastIndex = closeIdx + 7;
        const fontSize = parseFloat(attrs['font-size'] || 10);
        const parentWeight = attrs['font-weight'] || 500;
        const parentFam = attrs['font-family'] || '';
        const lsRaw = attrs['letter-spacing'] || '0';
        const lsMm = /em$/i.test(lsRaw)
          ? parseFloat(lsRaw) * fontSize
          : parseFloat(lsRaw) || 0;

        const tpMatch = innerHtml.match(/<textPath[^>]*href=["']#([^"']+)["'][^>]*>([\s\S]*?)<\/textPath>/i);
        if (tpMatch) {
          const arcId = tpMatch[1];
          const arcTxt = tpMatch[2].replace(/<[^>]+>/g, '').trim();
          const arcGeom = defsArcMap[arcId] || { cx: vbW / 2, cy: vbH / 2, r: 41.5 };
          if (arcTxt) {
            const charStepAngle = (fontSize * 0.66) / arcGeom.r;
            const totalAng = (arcTxt.length - 1) * charStepAngle;
            const startAng = -Math.PI / 2 - totalAng / 2;
            for (let i = 0; i < arcTxt.length; i++) {
              const ch = arcTxt[i];
              if (ch === ' ') continue;
              const ang = startAng + i * charStepAngle;
              const px = arcGeom.cx + arcGeom.r * Math.cos(ang);
              const py = arcGeom.cy + arcGeom.r * Math.sin(ang);
              const rot = ang + Math.PI / 2;
              const ttf = selectTtfFontForChar(ch, parentWeight, parentFam);
              const gidHex = recordGlyphForLiveFont(ttf, ch);
              const fillRgb = blendWithBg(parseHexOrNamedColor(curState.fill, defsGradMap) || [0.063, 0.094, 0.125], curState.opacity ?? 1);
              const c = Math.cos(rot);
              const s = Math.sin(rot);
              pdfLines.push('q');
              pdfLines.push(`${f(fillRgb[0])} ${f(fillRgb[1])} ${f(fillRgb[2])} rg`);
              pdfLines.push('BT');
              pdfLines.push(`${f(c)} ${f(s)} ${f(s)} ${f(-c)} ${f(px)} ${f(py)} Tm`);
              if (gidHex && ttf) {
                pdfLines.push(`/${ttf.fontKey} ${f(fontSize)} Tf <${gidHex}> Tj`);
              } else {
                pdfLines.push(encodePdfTextCmd(ch, fontSize, Number(parentWeight) >= 600));
              }
              pdfLines.push('ET');
              pdfLines.push('Q');
            }
          }
        } else {
          // Parse <tspan> runs or plain text
          const runs = [];
          const tspanRe = /<tspan([^>]*)>([\s\S]*?)<\/tspan>/gi;
          let tsm;
          while ((tsm = tspanRe.exec(innerHtml)) !== null) {
            const tsAttrs = parseAttrs(tsm[1] || '');
            const tsText = tsm[2].replace(/<[^>]+>/g, '');
            if (tsText) {
              runs.push({
                text: tsText,
                weight: tsAttrs['font-weight'] || parentWeight,
                fill: tsAttrs.fill || curState.fill,
                fontFamily: tsAttrs['font-family'] || parentFam,
              });
            }
          }
          if (!runs.length) {
            const plainTxt = innerHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            if (plainTxt) {
              runs.push({
                text: plainTxt,
                weight: parentWeight,
                fill: curState.fill,
                fontFamily: parentFam,
              });
            }
          }

          if (runs.length) {
            const tx = parseFloat(attrs.x || 0);
            const ty = parseFloat(attrs.y || 0);
            const anchor = (attrs['text-anchor'] || 'start').toLowerCase();

            // Pre-measure exact width of all runs using TrueType advance widths
            const measuredGlyphs = [];
            let totalWidth = 0;
            for (const run of runs) {
              for (const ch of run.text) {
                const ttf = selectTtfFontForChar(ch, run.weight, run.fontFamily);
                let gid = 0;
                let advMm = fontSize * (ch === ' ' ? 0.3 : /[\u3131-\uD79D\u3040-\u30FF\u4E00-\u9FAF]/.test(ch) ? 0.92 : 0.56);
                if (ttf) {
                  gid = ttf.codeToGid(ch.charCodeAt(0));
                  if (gid > 0 || ch === ' ') {
                    advMm = (ttf.getAdvanceWidth(gid) / ttf.unitsPerEm) * fontSize;
                  }
                }
                const gidHex = recordGlyphForLiveFont(ttf, ch);
                measuredGlyphs.push({ ch, gid, gidHex, ttf, advMm, run });
                totalWidth += advMm + lsMm;
              }
            }
            if (measuredGlyphs.length > 0) totalWidth -= lsMm;

            let curX = tx;
            if (anchor === 'middle') curX = tx - totalWidth / 2;
            else if (anchor === 'end') curX = tx - totalWidth;

            // Group contiguous live-font glyphs sharing the same fontKey and fill into single editable text strings
            let segs = [];
            for (const item of measuredGlyphs) {
              const itemX = curX;
              curX += item.advMm + lsMm;
              const fillStr = item.run.fill || curState.fill;
              if (item.gidHex && item.ttf) {
                const last = segs[segs.length - 1];
                if (last && last.type === 'live' && last.fontKey === item.ttf.fontKey && last.fill === fillStr) {
                  last.hex += item.gidHex;
                } else {
                  segs.push({
                    type: 'live',
                    fontKey: item.ttf.fontKey,
                    fill: fillStr,
                    x: itemX,
                    y: ty,
                    hex: item.gidHex,
                  });
                }
              } else if (item.ch !== ' ') {
                segs.push({
                  type: 'fallback',
                  ch: item.ch,
                  advMm: item.advMm,
                  fill: fillStr,
                  weight: item.run.weight,
                  x: itemX,
                  y: ty,
                });
              }
            }

            for (const seg of segs) {
              const fillRgb = blendWithBg(parseHexOrNamedColor(seg.fill, defsGradMap) || [0.063, 0.094, 0.125], curState.opacity ?? 1);
              if (seg.type === 'live') {
                pdfLines.push('q');
                pdfLines.push(`${f(fillRgb[0])} ${f(fillRgb[1])} ${f(fillRgb[2])} rg`);
                pdfLines.push('BT');
                if (Math.abs(lsMm) > 0.0005) {
                  pdfLines.push(`${f(lsMm)} Tc`);
                }
                pdfLines.push(`/${seg.fontKey} ${f(fontSize)} Tf`);
                pdfLines.push(`1 0 0 -1 ${f(seg.x)} ${f(seg.y)} Tm`);
                pdfLines.push(`<${seg.hex}> Tj`);
                pdfLines.push('ET');
                pdfLines.push('Q');
              } else if (seg.ch === 'ー') {
                const barOps = rectToPdfOps(seg.x + seg.advMm * 0.08, seg.y - fontSize * 0.42, seg.advMm * 0.84, fontSize * 0.09);
                emitShapeWithStyle(barOps, { ...curState, fill: seg.fill, stroke: 'none' });
              } else {
                pdfLines.push('q');
                pdfLines.push(`${f(fillRgb[0])} ${f(fillRgb[1])} ${f(fillRgb[2])} rg`);
                pdfLines.push('BT');
                pdfLines.push(`1 0 0 -1 ${f(seg.x)} ${f(seg.y)} Tm`);
                pdfLines.push(encodePdfTextCmd(seg.ch, fontSize, Number(seg.weight) >= 600));
                pdfLines.push('ET');
                pdfLines.push('Q');
              }
            }
          }
        }
      }
    }

    if (elemMat) {
      pdfLines.push('Q');
    }
  }

  while (stateStack.length > 1) {
    const popped = stateStack.pop();
    if (popped.hasTransform) pdfLines.push('Q');
  }
  pdfLines.push('Q');

  const streamContent = pdfLines.join('\n') + '\n';
  const enc = new TextEncoder();
  const streamBytes = enc.encode(streamContent);

  const safeTitle = String(title || 'VITALBEAUTIE').replace(/[()\\]/g, '');

  // Build PDF objects with embedded TrueType fonts (/FontFile2 + /Identity-H + /ToUnicode) so text stays 100% live & editable in Illustrator
  const objs = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(pw)} ${f(ph)}] /TrimBox [0 0 ${f(pw)} ${f(ph)}] /ArtBox [0 0 ${f(pw)} ${f(ph)}] /Contents 4 0 R /Resources 5 0 R >>`,
    { type: 'stream', bytes: streamBytes }, // Object 4
    '', // Object 5 placeholder (/Resources)
    `<< /Title (${safeTitle}) /Creator (Adobe Illustrator 27.0) /Producer (Adobe PDF library 17.00) >>`, // Object 6 (/Info)
  ];

  const fontResEntries = [
    `/F0 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  ];

  for (const [fontKey, entry] of usedFonts.entries()) {
    const { ttf, glyphs } = entry;
    const psName = ttf.psName || 'RixSinGoSEPM';
    const type0ObjId = objs.length + 1;
    const cidObjId = objs.length + 2;
    const fdObjId = objs.length + 3;
    const ffObjId = objs.length + 4;
    const cmapObjId = objs.length + 5;

    const wArr = [...glyphs.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([gid, info]) => `${gid} [${info.width1000}]`)
      .join(' ');

    const bfPairs = [...glyphs.entries()]
      .filter(([gid, info]) => gid > 0 && info.unicode > 0)
      .sort((a, b) => a[0] - b[0])
      .map(([gid, info]) => `<${gid.toString(16).padStart(4, '0').toUpperCase()}> <${info.unicode.toString(16).padStart(4, '0').toUpperCase()}>`);

    const cmapStr = [
      '/CIDInit /ProcSet findresource begin',
      '12 dict begin',
      'begincmap',
      '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
      '/CMapName /Adobe-Identity-UCS def',
      '/CMapType 2 def',
      '1 begincodespacerange',
      '<0000> <FFFF>',
      'endcodespacerange',
      `${bfPairs.length} beginbfchar`,
      ...bfPairs,
      'endbfchar',
      'endcmap',
      'CMapName currentdict /CMap defineresource pop',
      'end',
      'end',
    ].join('\n');
    const cmapBytes = enc.encode(cmapStr);

    fontResEntries.push(`/${fontKey} ${type0ObjId} 0 R`);

    if (ttf.isCff) {
      objs.push(
        `<< /Type /Font /Subtype /Type0 /BaseFont /${psName} /Encoding /Identity-H /DescendantFonts [${cidObjId} 0 R] /ToUnicode ${cmapObjId} 0 R >>`,
        `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /${psName} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${fdObjId} 0 R /DW 1000 /W [${wArr}] >>`,
        `<< /Type /FontDescriptor /FontName /${psName} /Flags 32 /FontBBox [-150 -250 1150 950] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 720 /StemV 80 /FontFile3 ${ffObjId} 0 R >>`,
        { type: 'opentypefile', bytes: ttf.rawBytes },
        { type: 'stream', bytes: cmapBytes }
      );
    } else {
      objs.push(
        `<< /Type /Font /Subtype /Type0 /BaseFont /${psName} /Encoding /Identity-H /DescendantFonts [${cidObjId} 0 R] /ToUnicode ${cmapObjId} 0 R >>`,
        `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${psName} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${fdObjId} 0 R /CIDToGIDMap /Identity /DW 1000 /W [${wArr}] >>`,
        `<< /Type /FontDescriptor /FontName /${psName} /Flags 32 /FontBBox [-150 -250 1150 950] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 720 /StemV 80 /FontFile2 ${ffObjId} 0 R >>`,
        { type: 'fontfile', bytes: ttf.rawBytes },
        { type: 'stream', bytes: cmapBytes }
      );
    }
  }

  objs[4] = `<< /Font <<\n  ${fontResEntries.join('\n  ')}\n>> >>`;

  const chunks = [];
  let byteLen = 0;
  const pushBytes = b => {
    chunks.push(b);
    byteLen += b.byteLength;
  };
  const pushStr = s => pushBytes(enc.encode(s));

  // PDF-1.4 Header with binary marker
  pushBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));

  const offsets = [0];
  for (let i = 0; i < objs.length; i++) {
    offsets.push(byteLen);
    const objNum = i + 1;
    const item = objs[i];
    if (item && typeof item === 'object' && item.type === 'stream') {
      pushStr(`${objNum} 0 obj\n<< /Length ${item.bytes.byteLength} >>\nstream\n`);
      pushBytes(item.bytes);
      pushStr(`\nendstream\nendobj\n`);
    } else if (item && typeof item === 'object' && item.type === 'fontfile') {
      pushStr(`${objNum} 0 obj\n<< /Length ${item.bytes.byteLength} /Length1 ${item.bytes.byteLength} >>\nstream\n`);
      pushBytes(item.bytes);
      pushStr(`\nendstream\nendobj\n`);
    } else if (item && typeof item === 'object' && item.type === 'opentypefile') {
      pushStr(`${objNum} 0 obj\n<< /Length ${item.bytes.byteLength} /Subtype /OpenType >>\nstream\n`);
      pushBytes(item.bytes);
      pushStr(`\nendstream\nendobj\n`);
    } else {
      pushStr(`${objNum} 0 obj\n${item}\nendobj\n`);
    }
  }

  const xrefOffset = byteLen;
  pushStr(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i < offsets.length; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return new Blob(chunks, { type: 'application/pdf' });
}

export function buildPdfBlob(svgText, title = 'VITALBEAUTIE_Asset') {
  return buildIllustratorAiBlob(svgText, title);
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
/**
 * 컬러 계열별 공통 시각화 의미 (타사 브랜드명 없이 화면에 노출되는 제안 근거)
 * - 벤치마크 데이터(benchmarks)는 톤 추천을 위한 내부 학습 데이터로만 사용한다.
 */
const NEUTRAL_COLOR_SEMIOTICS = {
  greengrape: '연두빛 라임·보태니컬 그린은 싱그러운 과육과 청량한 과즙감을 시각화하는 데 공통적으로 쓰이기 때문에, 프레시 라임·보태니컬 그린·민트 계열을 제안합니다.',
  lemon: '고채도 옐로우는 상큼한 산미와 비타민의 즉각적인 활력을 시각화하는 데 공통적으로 쓰이기 때문에, 비비드 레몬 옐로우·선샤인 옐로우·라임 계열을 제안합니다.',
  orange_fruit: '오렌지·탠저린 컬러는 잘 익은 과즙과 카로티노이드의 따뜻한 에너지를 시각화하는 데 공통적으로 쓰이기 때문에, 비비드 오렌지·탠저린·앰버 계열을 제안합니다.',
  grape_fruit: '딥 퍼플과 와인 컬러는 포도 껍질의 안토시아닌과 항산화 이미지를 시각화하는 데 공통적으로 쓰이기 때문에, 그레이프 퍼플·로얄 바이올렛·와인 계열을 제안합니다.',
  apple_fruit: '크림슨 레드는 잘 익은 사과의 식욕감과 발효 에너지를, 크리스프 그린은 풋사과의 상큼함을 시각화하는 데 공통적으로 쓰이기 때문에, 애플 레드·크리스프 그린 계열을 제안합니다.',
  berry_fruit: '베리 퍼플과 딥 마젠타는 진한 베리 과즙과 항산화력을 시각화하는 데 공통적으로 쓰이기 때문에, 베리 퍼플·인디고·마젠타 계열을 제안합니다.',
  peach_fruit: '소프트 코랄과 피치 핑크는 부드럽고 달콤한 과육과 촉촉한 생기를 시각화하는 데 공통적으로 쓰이기 때문에, 코랄·피치 핑크·블러쉬 핑크 계열을 제안합니다.',
  grapefruit_fruit: '코랄 핑크는 쌉싸름하고 상큼한 루비빛 과육을 시각화하는 데 공통적으로 쓰이기 때문에, 코랄 핑크·루비 핑크·비비드 코랄 계열을 제안합니다.',
  pomegranate_fruit: '루비 레드와 가넷 버건디는 깊고 진한 붉은 과즙과 여성 건강의 생명력을 시각화하는 데 공통적으로 쓰이기 때문에, 루비 레드·가넷 버건디·베리 로즈 계열을 제안합니다.',
  tropical_fruit: '골든 옐로우와 앰버는 열대 과일의 햇살 같은 과즙미를 시각화하는 데 공통적으로 쓰이기 때문에, 골든 옐로우·트로피컬 앰버·선샤인 골드 계열을 제안합니다.',
  sleep: '네이비·인디고·라벤더 퍼플은 밤하늘의 고요함과 깊은 휴식, 생체 리듬의 안정을 시각화하는 데 공통적으로 쓰이기 때문에, 미드나잇 네이비·인디고·딥 라벤더 퍼플 계열을 제안합니다.',
  relax: '채도가 낮은 라벤더·페리윙클·세이지 톤은 시각적 자극을 줄이고 마음의 평온을 시각화하는 데 공통적으로 쓰이기 때문에, 소프트 라벤더·페리윙클 블루·세이지 민트 계열을 제안합니다.',
  collagen: '로즈 핑크와 코랄은 피부의 생기와 탄력, 수분감을 시각화하는 데 공통적으로 쓰이기 때문에, 로즈 핑크·코랄 핑크·소프트 피치·아쿠아 블루 계열을 제안합니다.',
  vitamin: '옐로우와 오렌지는 하루의 활력과 에너지 충전을 시각화하는 데 공통적으로 쓰이기 때문에, 시트러스 옐로우·비비드 오렌지·골든 앰버 계열을 제안합니다.',
  slimming: '그린 계열은 가벼움과 클린한 대사, 식물성 원료의 순수함을 시각화하는 데 공통적으로 쓰이기 때문에, 보태니컬 그린·에메랄드 그린·프레시 라임 계열을 제안합니다.',
  bloodsugar: '리프 그린은 식물성 원료의 균형감을, 앰버 오렌지는 탄수화물 대사의 조절을 시각화하는 데 공통적으로 쓰이기 때문에, 리프 그린·다크 그린·앰버 오렌지 계열을 제안합니다.',
  probiotics: '라임 그린과 클린 블루는 살아있는 균의 생명력과 장내 환경의 깨끗한 균형을 시각화하는 데 공통적으로 쓰이기 때문에, 바이오 라임 그린·에코 그린·클린 블루·골든 옐로우 계열을 제안합니다.',
  eye: '블루 계열은 맑고 선명한 시야를, 마리골드 오렌지는 루테인 원료를 시각화하는 데 공통적으로 쓰이기 때문에, 로얄 블루·사파이어 블루·마리골드 오렌지·빌베리 퍼플 계열을 제안합니다.',
  omega: '오션·코발트 블루는 깨끗한 바다에서 온 원료와 순수함을 시각화하는 데 공통적으로 쓰이기 때문에, 오션 블루·코발트 블루·아쿠아 마린 계열을 제안합니다.',
  liver: '시슬 퍼플과 다크 그린은 밀크씨슬 원료의 색과 해독·보호의 이미지를 시각화하는 데 공통적으로 쓰이기 때문에, 시슬 퍼플·딥 플럼·보태니컬 다크 그린 계열을 제안합니다.',
  ginseng: '다크 브라운과 버건디, 골드는 뿌리 원료의 농밀함과 프리미엄 면역의 권위를 시각화하는 데 공통적으로 쓰이기 때문에, 어스 브라운·진생 버건디·샴페인 골드 계열을 제안합니다.',
  joint: '블루 계열은 매끄러운 움직임과 단단한 신뢰감, 쿨링감을 시각화하는 데 공통적으로 쓰이기 때문에, 코발트 블루·스틸 블루·아쿠아 블루 계열을 제안합니다.',
  muscle: '고채도 블루와 코랄, 차콜은 역동적인 퍼포먼스와 회복을 시각화하는 데 공통적으로 쓰이기 때문에, 일렉트릭 블루·액티브 코랄·포레스트 그린·차콜 계열을 제안합니다.',
  brain: '네이비와 사파이어 블루는 명료한 사고와 집중, 신뢰감을 시각화하는 데 공통적으로 쓰이기 때문에, 인텔렉추얼 네이비·딥 사파이어 블루·시안 계열을 제안합니다.',
  women: '버건디·가넷·로즈 모브는 여성 건강의 생명력과 우아한 밸런스를 시각화하는 데 공통적으로 쓰이기 때문에, 루비 버건디·가넷 레드·로즈 모브·블러쉬 핑크 계열을 제안합니다.',
  circulation: '크림슨·가넷 레드는 힘찬 혈류와 순환을 시각화하는 데 공통적으로 쓰이기 때문에, 크림슨 레드·코랄 레드·가넷 버건디 계열을 제안합니다.',
  oral: '아쿠아 민트와 터콰이즈는 즉각적인 쿨링감과 구강의 청결함을 시각화하는 데 공통적으로 쓰이기 때문에, 아쿠아 민트·터콰이즈·아이스 블루 계열을 제안합니다.',
  cica: '파스텔 민트와 셀라돈은 저자극 진정과 부드러운 장벽 보호를 시각화하는 데 공통적으로 쓰이기 때문에, 민트 그린·파스텔 셀라돈·아쿠아 그린 계열을 제안합니다.',
  hair: '로즈·마젠타 핑크와 앰버는 풍성한 볼륨과 윤기를 시각화하는 데 공통적으로 쓰이기 때문에, 마젠타 로즈 핑크·코랄 핑크·골든 앰버·바이올렛 계열을 제안합니다.',
  enzyme_food: '베이지·골드는 곡물 원물의 고소함을, 그린은 편안한 소화를 시각화하는 데 공통적으로 쓰이기 때문에, 오트밀 베이지·웜 골드·보태니컬 그린 계열을 제안합니다.',
  acv_food: '원물 고유의 과실·찻잎 컬러는 맛과 원료를 직관적으로 시각화하는 데 공통적으로 쓰이기 때문에, 프레시 티 그린·애플 레드·트로피컬 옐로우·코랄 계열을 제안합니다.',
  detox: '아쿠아 시안과 민트, 라임은 비움과 수분 충전의 청량감을 시각화하는 데 공통적으로 쓰이기 때문에, 아쿠아 시안·민트 틸·라임 그린·레몬 옐로우 계열을 제안합니다.',
};

const stripBenchmarkTitle = t => String(t || '').replace(/\s*·[^·()]*벤치마크/g, '');

export function resolveGlobalFunctionColor(funcText = '') {
  const res = resolveGlobalFunctionColorRaw(funcText);
  const findEntry = title => GLOBAL_FUNCTION_COLOR_DB.find(e => e.categoryTitle === title || e.categoryTitle.split('(')[0].trim() === String(title || '').trim());
  let neutralReason = '';
  if (String(res.categoryTitle || '').includes(' × ')) {
    const [t1, t2] = res.categoryTitle.split(' × ');
    const e1 = findEntry(t1), e2 = findEntry(t2);
    neutralReason = [e1 && NEUTRAL_COLOR_SEMIOTICS[e1.id], e2 && NEUTRAL_COLOR_SEMIOTICS[e2.id]].filter(Boolean).join(' 또한 ');
  } else {
    const e = findEntry(res.categoryTitle);
    if (e) neutralReason = NEUTRAL_COLOR_SEMIOTICS[e.id] || '';
  }
  if (!neutralReason) {
    neutralReason = funcText && funcText.trim()
      ? `그린·옐로우·오렌지는 자연 유래 원료의 순수함과 건강한 활력을 시각화하는 데 공통적으로 쓰이기 때문에, 「${funcText.trim()}」에는 보태니컬 그린·시트러스 옐로우·에너제틱 오렌지 계열을 제안합니다.`
      : res.globalReason;
  }
  return { ...res, categoryTitle: stripBenchmarkTitle(res.categoryTitle), neutralReason, globalReason: neutralReason };
}

function resolveGlobalFunctionColorRaw(funcText = '') {
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

  // 1) GLOBAL_FUNCTION_COLOR_DB에서 가장 매칭 점수가 높은 항목 탐색 (정확 일치 최우선 + 복수 키워드 지원)
  const matchedEntries = [];
  for (const entry of GLOBAL_FUNCTION_COLOR_DB) {
    let score = 0;
    let hasExact = false;
    for (const kw of entry.keywords) {
      const k = kw.toLowerCase();
      if (q === k) {
        score += 120;
        hasExact = true;
      } else if (k.length >= 2 && q.includes(k)) {
        score += 20 + k.length * 3;
      } else if (q.length >= 2 && k.length >= 2 && k.includes(q)) {
        score += 6;
      }
    }
    if (score > 0) {
      matchedEntries.push({ entry, score, hasExact });
    }
  }

  matchedEntries.sort((a, b) => b.score - a.score);

  const isMultiQuery = /[\s,·/+]+/.test(q);

  if (matchedEntries.length === 1 || (matchedEntries.length >= 1 && matchedEntries[0].hasExact && !isMultiQuery)) {
    const top = matchedEntries[0].entry;
    return {
      keyword: raw,
      categoryTitle: top.categoryTitle,
      globalColorName: top.globalColorName,
      globalReason: top.globalReason,
      preferredTones: top.preferredTones,
      benchmarks: top.benchmarks || [],
    };
  }

  if (matchedEntries.length >= 2) {
    const top1 = matchedEntries[0].entry;
    const top2 = matchedEntries[1].entry;
    if (isMultiQuery && matchedEntries[1].score >= matchedEntries[0].score * 0.45 && top1.id !== top2.id) {
      const combinedTones = [...new Set([...top1.preferredTones, ...top2.preferredTones])];
      const combinedBenchmarks = [...(top1.benchmarks || []).slice(0, 4), ...(top2.benchmarks || []).slice(0, 3)];
      return {
        keyword: raw,
        categoryTitle: `${top1.categoryTitle.split('(')[0].trim()} × ${top2.categoryTitle.split('(')[0].trim()}`,
        globalColorName: `${top1.globalColorName.replace(/ 계열$/, '')} & ${top2.globalColorName}`,
        globalReason: `[${top1.categoryTitle.split('·')[0].trim()}] ${top1.globalReason} 또한 [${top2.categoryTitle.split('·')[0].trim()}] 측면에서는 ${top2.globalReason}`,
        preferredTones: combinedTones,
        benchmarks: combinedBenchmarks,
      };
    }
    return {
      keyword: raw,
      categoryTitle: top1.categoryTitle,
      globalColorName: top1.globalColorName,
      globalReason: top1.globalReason,
      preferredTones: top1.preferredTones,
      benchmarks: top1.benchmarks || [],
    };
  }

  // 2) 사전 직접 매칭이 없는 경우 형태소/원료 키워드 추론
  const returnEntry = entry => ({
    keyword: raw,
    categoryTitle: entry.categoryTitle,
    globalColorName: entry.globalColorName,
    globalReason: entry.globalReason,
    preferredTones: entry.preferredTones,
    benchmarks: entry.benchmarks || [],
  });

  if (/포도|머스캣|muscat|grape|키위|멜론|매실/i.test(q)) {
    const isGreen = /청|샤인|그린|green|키위|멜론|매실/i.test(q);
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === (isGreen ? 'greengrape' : 'grape_fruit')) || GLOBAL_FUNCTION_COLOR_DB[0];
    return returnEntry(entry);
  }
  if (/레몬|라임|lemon|lime|시트론|citron|유자/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'lemon') || GLOBAL_FUNCTION_COLOR_DB[1];
    return returnEntry(entry);
  }
  if (/오렌지|만다린|감귤|한라봉|천혜향|orange|mandarin/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'orange_fruit') || GLOBAL_FUNCTION_COLOR_DB[2];
    return returnEntry(entry);
  }
  if (/사과|애플|apple/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'apple_fruit');
    if (entry) return returnEntry(entry);
  }
  if (/베리|berry/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'berry_fruit');
    if (entry) return returnEntry(entry);
  }
  if (/복숭아|피치|살구|자두|peach|apricot/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'peach_fruit');
    if (entry) return returnEntry(entry);
  }
  if (/석류|체리|크랜베리|딸기|오미자|pomegranate|cherry|cranberry/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'pomegranate_fruit');
    if (entry) return returnEntry(entry);
  }
  if (/망고|파인애플|바나나|트로피컬|mango|pineapple/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'tropical_fruit');
    if (entry) return returnEntry(entry);
  }
  if (/자몽|수박|grapefruit|watermelon/i.test(q)) {
    const entry = GLOBAL_FUNCTION_COLOR_DB.find(e => e.id === 'grapefruit_fruit');
    if (entry) return returnEntry(entry);
  }

  // 3) 완전히 새로운 신규 성분/기능 키워드의 경우 글로벌 웰니스 표준 추천
  return {
    keyword: raw,
    categoryTitle: `글로벌 뉴트리션 웰니스 포뮬라 (${raw})`,
    globalColorName: '보태니컬 그린 · 시트러스 옐로우 · 에너제틱 오렌지 계열',
    globalReason: `글로벌 대표 웰니스 브랜드(OLLY, HUM, Goli, Blackmores, Natrol, Thorne, Ritual, Seed)의 성분 데이터베이스 기준, 「${raw}」 성분의 자연 유래 식물성 순도와 생체 밸런스를 직관화하기 위해 보태니컬 그린과 옐로우·오렌지 계열을 제안합니다.`,
    preferredTones: ['green', 'yellow', 'orange'],
    benchmarks: [
      { brand: 'AG1 / Seed', product: 'Foundational Botanicals & Synbiotics', pantone: 'PANTONE 348 C', hex: '#00843D', note: '글로벌 웰니스 클린 보태니컬 그린' },
      { brand: 'Ritual / Blackmores', product: 'Daily Essential Nutrients', pantone: 'PANTONE 123 C', hex: '#FFC72C', note: '생체 대사 활력 선샤인 옐로우' },
      { brand: 'Thorne / OLLY', product: 'Active Cellular Vitality', pantone: 'PANTONE 151 C', hex: '#FF8200', note: '에너지 부스팅 비비드 오렌지' },
    ],
  };
}

export const FAMILY_KO_MAP = {
  navy: '네이비',
  purple: '퍼플',
  lavender: '라벤더',
  blue: '블루',
  teal: '틸',
  mint: '민트',
  green: '그린',
  lime: '라임',
  yellow: '옐로',
  gold: '골드',
  orange: '오렌지',
  coral: '코랄',
  red: '레드',
  wine: '와인',
  pink: '핑크',
  brown: '브라운',
  beige: '베이지',
  gray: '그레이',
};

/**
 * 성분·기능별 글로벌 패밀리룩 & 제안 팬톤칩과 기존 제품군 1:1 비교 분석 엔진
 * - 추천 계열별 그룹화 (네이비 계열, 퍼플 계열 등)
 * - 각 계열별 기존 제품 컬러 태그 행 ([에너지샷 바디앤브레인 PANTONE 294 C] 등)
 * - 각 계열별 딥 / 미디엄 / 라이트 음영 배지 및 제안 vs 기존 2열 실시간 색차(ΔE) 비교표
 */
export function suggestFamilyLook(options = {}) {
  const minDeltaE = options.minDeltaE != null ? options.minDeltaE : 10;
  const funcText = options.funcText || '수면';
  const selectedToneId = options.selectedToneId || 'auto';
  const offset = options.offset || 0;

  const globalAnalysis = resolveGlobalFunctionColor(funcText);

  const CHIP_FAMILY_MAP = {
    purple: ['purple'],
    lavender: ['purple'],
    blue: ['blue'],
    navy: ['navy'],
    teal: ['mint', 'blue'],
    mint: ['mint'],
    green: ['green', 'lime'],
    yellow: ['yellow'],
    gold: ['yellow', 'brown'],
    orange: ['orange'],
    coral: ['pink', 'orange'],
    red: ['red'],
    wine: ['red'],
    pink: ['pink'],
    brown: ['brown'],
    beige: ['beige'],
    gray: ['navy', 'beige'],
  };

  const targetFamilies = selectedToneId !== 'auto'
    ? (CHIP_FAMILY_MAP[selectedToneId] || [selectedToneId])
    : globalAnalysis.preferredTones;

  // 전체 제품군
  const usedList = PACKAGE_LINES.allProducts.map(p => ({
    ...p,
    normCode: p.pantone.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, ''),
    lab: hexToLab(p.hex),
  }));
  const usedCodes = new Set(usedList.map(u => u.normCode));

  // 제품 -> 계열 매핑 사전
  const PRODUCT_FAMILY_MAP = {
    '에너지샷 바디앤브레인': ['navy'],
    '굿슬립 가바 365': ['navy', 'purple'],
    '오메가케어': ['navy', 'blue'],
    '트루아이': ['navy', 'purple'],
    '명작수 활': ['navy'],
    '슈퍼 바이오틱스': ['purple'],
    '리버프라임': ['purple'],
    '슈퍼에센셜': ['pink'],
    '슈퍼콜라겐': ['pink'],
    '슈퍼콜라겐 케라핏': ['pink'],
    '슈퍼콜라겐 PDRN': ['pink'],
    '슈퍼레티놀 C': ['yellow', 'lime'],
    '슈퍼레티놀 젤리': ['yellow', 'lime'],
    '슈퍼시카 B5': ['mint', 'green'],
    '메타그린 슬림업': ['green'],
    '메타그린 부스터샷': ['lime', 'green'],
    '메타그린 골드': ['yellow', 'gold'],
    '메타그린 핏': ['green', 'lime'],
    '메타그린 젤리 애사비': ['yellow', 'lime'],
    '메타그린 칼로리컷': ['green'],
    '명작수': ['brown'],
    '명작수 EC': ['beige'],
    '자음보액': ['wine', 'red'],
    '액티브 멀티팩': ['orange'],
  };

  const families = targetFamilies.map(fam => {
    const famKo = FAMILY_KO_MAP[fam] || fam;

    // 이 계열의 기존 제품
    const existingProducts = usedList.filter(p => {
      const mapped = PRODUCT_FAMILY_MAP[p.name];
      if (mapped) return mapped.includes(fam);
      // fallback: pantone code or lab
      return false;
    });

    // 이 계열의 모든 PANTONE Solid Coated 칩
    const allFamChips = PANTONE_COATED_WITH_LAB.filter(pms => pms.family === fam);

    // 글로벌 건강기능식품 탑 브랜드(OLLY, HUM, Goli, Blackmores, Natrol, Thorne, Ritual, Seed, Nordic Naturals) 검증 팬톤칩 우선순위
    const priorityCodes = [
      // 네이비 & 퍼플 (수면·나이트·스트레스·밀크씨슬: OLLY Sleep, Natrol, HUM, Ritual, Thorne)
      'PANTONE 7671 C', 'PANTONE 5265 C', 'PANTONE 2756 C', 'PANTONE 265 C', 'PANTONE 2582 C', 'PANTONE 266 C', 'PANTONE 2577 C', 'PANTONE Purple C', 'PANTONE 2725 C', 'PANTONE 7442 C', 'PANTONE 258 C',
      // 청포도 & 프레시 라임 & 보태니컬 그린 (슬리밍·유산균·과즙: Seed, HUM Flatter Me, OLLY, Goli Supergreens, FANCL)
      'PANTONE 375 C', 'PANTONE 368 C', 'PANTONE 360 C', 'PANTONE 374 C', 'PANTONE 367 C', 'PANTONE 354 C', 'PANTONE 361 C', 'PANTONE 340 C', 'PANTONE 347 C', 'PANTONE 355 C', 'PANTONE 7481 C', 'PANTONE 2270 C',
      // 레몬 & 선샤인 옐로우 (비타민·시트러스: Ritual 108C, Blackmores 123C, OLLY 109C, Nordic Naturals 115C, Nature Made 1235C)
      'PANTONE 108 C', 'PANTONE 109 C', 'PANTONE 115 C', 'PANTONE 102 C', 'PANTONE 116 C', 'PANTONE 123 C', 'PANTONE 1235 C', 'PANTONE 130 C',
      // 비비드 쥬시 오렌지 (항산화·에너지·아이케어: OLLY 151C, HUM 1585C, Orthomol 158C, Thorne 1375C, Goli 165C)
      'PANTONE 151 C', 'PANTONE 1585 C', 'PANTONE 158 C', 'PANTONE 165 C', 'PANTONE 1375 C', 'PANTONE 144 C', 'PANTONE 1505 C', 'PANTONE Orange 021 C',
      // 코랄 & 로즈 핑크 (콜라겐·복숭아·자몽·비오틴: Thorne 1777C, OLLY 1775C/178C/170C, HUM 183C/212C, Natrol 213C)
      'PANTONE 1777 C', 'PANTONE 1775 C', 'PANTONE 178 C', 'PANTONE 177 C', 'PANTONE 170 C', 'PANTONE 183 C', 'PANTONE 184 C', 'PANTONE 204 C', 'PANTONE 212 C', 'PANTONE 213 C', 'PANTONE 1625 C',
      // 오션 & 코발트 블루 (오메가3·관절·두뇌: Nordic Naturals 2925C, Blackmores 3005C/293C, Thorne 285C, Garden of Life 306C)
      'PANTONE 2925 C', 'PANTONE 3005 C', 'PANTONE 285 C', 'PANTONE 293 C', 'PANTONE 306 C', 'PANTONE 298 C', 'PANTONE 2915 C', 'PANTONE 279 C',
      // 크림슨 & 루비 레드 (애사비·혈행·여성·석류: Goli ACV 186C, HUM Private Party 199C, Swisse 200C, Goli Beets 201C)
      'PANTONE 186 C', 'PANTONE 199 C', 'PANTONE 200 C', 'PANTONE 201 C', 'PANTONE 1795 C', 'PANTONE 185 C', 'PANTONE 1788 C',
      // 아쿠아 민트 & 틸 (구강·시카·클렌즈: HUM Daily Cleanse 3262C, Liquid I.V. 311C, 3258C)
      'PANTONE 3262 C', 'PANTONE 3258 C', 'PANTONE 311 C', 'PANTONE 3115 C', 'PANTONE 3265 C', 'PANTONE 338 C',
    ];

    // 이 계열의 모든 PANTONE Solid Coated 칩을 L값 순으로 정렬하여 딥 / 미디엄 / 라이트 3단계 분할
    // 계열마다 딥, 미디엄, 라이트가 각각 5개 이상씩 풍부하고 균형있게 제안되도록 설계
    const sortedFamChips = [...allFamChips].map(pms => {
      const normPms = pms.code.toUpperCase().replace(/^PANTONE\s*/i, '').replace(/\s+/g, '');
      let nearest = usedList[0];
      let minD = Infinity;
      for (const u of usedList) {
        const d = deltaE2000(u.lab, pms.lab);
        if (d < minD) {
          minD = d;
          nearest = u;
        }
      }
      const L = Array.isArray(pms.lab) ? pms.lab[0] : (pms.lab.l ?? 50);
      return {
        pantoneCode: pms.code,
        normCode: normPms,
        hex: pms.hex,
        L,
        lab: pms.lab,
        C: pms.C || Math.hypot(pms.lab[1], pms.lab[2]),
        minD,
        nearestName: nearest.name,
        nearestPantone: nearest.pantone,
        nearestHex: nearest.hex,
      };
    }).sort((a, b) => a.L - b.L);

    const nTotal = sortedFamChips.length;
    const nTertile = Math.max(1, Math.floor(nTotal / 3));

    const poolDeep = sortedFamChips.slice(0, nTertile).map(c => ({ ...c, shade: '딥' }));
    const poolMed = sortedFamChips.slice(nTertile, nTotal - nTertile).map(c => ({ ...c, shade: '미디엄' }));
    const poolLight = sortedFamChips.slice(nTotal - nTertile).map(c => ({ ...c, shade: '라이트' }));

    const rankFn = (a, b) => {
      const aUsed = usedCodes.has(a.normCode) ? 1 : 0;
      const bUsed = usedCodes.has(b.normCode) ? 1 : 0;
      if (aUsed !== bUsed) return aUsed - bUsed; // 이미 사용된 코드는 뒤로

      const aPri = priorityCodes.includes(a.pantoneCode);
      const bPri = priorityCodes.includes(b.pantoneCode);
      if (aPri !== bPri) return aPri ? -1 : 1;

      // 차별성(minD)과 채도(C) 종합 점수
      const aScore = Math.min(a.minD, 28) * 1.5 + (a.C || 0) * 0.8;
      const bScore = Math.min(b.minD, 28) * 1.5 + (b.C || 0) * 0.8;
      return bScore - aScore;
    };

    const pickShadeCards = (pool) => {
      // 사용자가 설정한 최소 색차(minDeltaE) 이상이고 기존 제품과 겹치지 않는 칩만 엄격하게 필터링
      return pool
        .filter(c => !usedCodes.has(c.normCode) && c.minD >= minDeltaE)
        .sort((a, b) => {
          const aScore = a.minD * 1.8 + (a.C || 0) * 0.6;
          const bScore = b.minD * 1.8 + (b.C || 0) * 0.6;
          return bScore - aScore;
        })
        .slice(0, 8);
    };

    const proposedDeep = pickShadeCards(poolDeep);
    const proposedMed = pickShadeCards(poolMed);
    const proposedLight = pickShadeCards(poolLight);

    const proposedCards = [...proposedDeep, ...proposedMed, ...proposedLight];
    const excludedCount = Math.max(0, allFamChips.length - proposedCards.length);

    return {
      familyId: fam,
      familyKo: famKo,
      existingProducts,
      excludedCount,
      proposedCards,
      byShade: {
        deep: proposedDeep,
        medium: proposedMed,
        light: proposedLight,
      },
      notice: null,
    };
  });

  return {
    keyword: funcText,
    globalAnalysis,
    families,
  };
}

export function suggestChips(options = {}, count = 8) {
  const opts = Array.isArray(options) ? { extraHex: options } : options;
  const minDeltaE = opts.minDeltaE != null ? opts.minDeltaE : (PACKAGE_LINES.familyRules.minDeltaE || 10);
  const funcText = opts.funcText || '';
  const selectedToneId = opts.selectedToneId || 'auto';
  const offset = opts.offset || 0;

  const globalAnalysis = resolveGlobalFunctionColor(funcText);
  const selectedChipObj = REPRESENTATIVE_COLOR_CHIPS.find(c => c.id === selectedToneId) || REPRESENTATIVE_COLOR_CHIPS[0];

  const CHIP_FAMILY_MAP = {
    purple: ['purple'],
    lavender: ['purple'],
    blue: ['blue'],
    navy: ['navy'],
    teal: ['mint', 'blue'],
    mint: ['mint'],
    green: ['green', 'lime'],
    yellow: ['yellow'],
    gold: ['yellow', 'brown'],
    orange: ['orange'],
    coral: ['pink', 'orange'],
    red: ['red'],
    wine: ['red'],
    pink: ['pink'],
    brown: ['brown'],
    beige: ['beige'],
    gray: ['navy', 'beige'],
  };

  // 대상 컬러 패밀리 결정: 대표 컬러칩을 직접 선택한 경우 해당 패밀리 우선, 'auto'인 경우 키워드 기반 글로벌 추천 패밀리 적용
  const targetFamilies = selectedToneId !== 'auto'
    ? (CHIP_FAMILY_MAP[selectedToneId] || [selectedToneId])
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
  ['바이탈뷰티 슈퍼콜라겐', 'VITALBEAUTIE SUPER COLLAGEN'],
  ['바이탈뷰티', 'VITALBEAUTIE'],
  ['슈퍼콜라겐 케라핏', 'SUPER COLLAGEN KERAFIT'],
  ['슈퍼콜라겐 앰플', 'SUPER COLLAGEN AMPOULE'],
  ['슈퍼콜라겐 PDRN', 'SUPER COLLAGEN PDRN'],
  ['슈퍼콜라겐', 'SUPER COLLAGEN'],
  ['케라핏', 'KERAFIT'],
  ['슈퍼레티놀', 'SUPER RETINOL'],
  ['슈퍼시카 B5', 'SUPER CICA B5'],
  ['슈퍼시카', 'SUPER CICA'],
  ['앰플', 'AMPOULE'],
  ['3 TYPES 저분자 콜라겐 1,000mg*', '3 TYPES Low-Molecular Collagen 1,000mg*'],
  ['저분자 콜라겐 3,500mg', 'Low-Molecular Collagen 3,500mg'],
  ['5가지 유형 콜라겐', '5 Types of Collagen'],
  ['저분자 콜라겐', 'Low-Molecular Collagen'],
  ['고순도* 연어 PDRN', 'High-Purity* Salmon PDRN'],
  ['헤드투토', 'Head-to-Toe'],
  ['트리플 뷰티 부스트', 'Triple Beauty Boost'],
  ['매일 생기+윤기+광채 완성', 'Daily Vitality + Radiance + Glow'],
  ['먹는 레티놀로 광채 시너지*', 'Edible Retinol Glow Synergy*'],
  ['레티놀 X 비타민C·E·아연·판토텐산', 'Retinol × Vit C·E·Zinc·Pantothenic Acid'],
  ['비건 레티놀 1,000μg*', 'Vegan Retinol 1,000μg*'],
  ['흡수 빠른 리포좀 레티놀 제형', 'Fast-Absorbing Liposomal Retinol'],
  ['속민감+속진정', 'Inner Calming + Soothing'],
  ['고함량 판토텐산', 'High-Potency Pantothenic Acid'],
  ['밀크세라마이드 1000', 'Milk Ceramide 1000'],
  ['녹차 유래 유산균 함유', 'With Green Tea Probiotics'],
  ['9.4배 흡수율*', '9.4x Faster Absorption*'],
  ['전신 초밀착', 'Full-Body Intensive Care'],
  ['흡수 빠른 액상형', 'Fast-Absorbing Liquid'],
  ['흡수 빠른 미세입자 액상 제형', 'Micro-Particle Liquid Formula'],
  ['히알루론산 · 엘라스틴 · 세라마이드 · 비타민C', 'Hyaluronic Acid · Elastin · Ceramide · Vit C'],
  ['*1일 1포 기준', '*Per daily serving (1 stick)'],
  ['*1일 영양성분 기준치 대비 2sticks', '*Per 2 sticks (% Daily Value)'],
  ['1일 영양성분 기준치 대비 2sticks', 'Per 2 sticks (% Daily Value)'],
  ['*자사 기존 제품 대비', '*Compared to previous formula'],
  ['*원료적 특성에 한함', '*Based on raw ingredient properties'],
  ['저분자피쉬콜라겐펩타이드', 'Low-Molecular Fish Collagen Peptide'],
  ['저분자 피쉬콜라겐 펩타이드', 'Low-Molecular Fish Collagen Peptide'],
  ['저분자콜라겐', 'Low-Molecular Collagen'],
  ['식물성 콜라겐', 'Plant-Based Collagen'],
  ['연어이리추출물(PDRN 함유)', 'Salmon Milt Extract (Contains PDRN)'],
  ['비타민 B, C 컴플렉스', 'Vitamin B & C Complex'],
  ['모링가잎추출물(비건레티놀)', 'Moringa Leaf Extract (Vegan Retinol)'],
  ['병풀추출분말', 'Centella Asiatica Extract Powder'],
  ['판토텐산칼슘', 'Calcium Pantothenate'],
  ['비타민A', 'Vitamin A'],
  ['비타민E', 'Vitamin E'],
  ['비타민D', 'Vitamin D'],
  ['비타민K', 'Vitamin K'],
  ['비타민B12', 'Vitamin B12'],
  ['비타민B6', 'Vitamin B6'],
  ['비타민B2', 'Vitamin B2'],
  ['비타민B1', 'Vitamin B1'],
  ['비타민B', 'Vitamin B'],
  ['비타민 B', 'Vitamin B'],
  ['비타민', 'Vitamin'],
  ['비오틴', 'Biotin'],
  ['나이아신', 'Niacin'],
  ['니아신', 'Niacin'],
  ['엽산', 'Folic Acid'],
  ['셀레늄', 'Selenium'],
  ['셀렌', 'Selenium'],
  ['세라마이드', 'Ceramide'],
  ['엘-시스틴', 'L-Cystine'],
  ['맥주효모', 'Brewer\'s Yeast'],
  ['아연', 'Zinc'],
  ['마그네슘', 'Magnesium'],
  ['칼슘', 'Calcium'],
  ['철분', 'Iron'],
  ['구리', 'Copper'],
  ['망간', 'Manganese'],
  ['몰리브덴', 'Molybdenum'],
  ['요오드', 'Iodine'],
  ['APIC대두배아열수추출물등복합물', 'APIC Soybean Embryo Hot-Water Extract Complex'],
  ['가르시니아캄보지아추출물', 'Garcinia Cambogia Extract'],
  ['가르시니아 캄보지아', 'Garcinia Cambogia'],
  ['가르시니아캄보지아', 'Garcinia Cambogia'],
  ['가르시니아', 'Garcinia Cambogia'],
  ['녹차추출물', 'Green Tea Extract (Catechin)'],
  ['녹차 추출물', 'Green Tea Extract'],
  ['카테킨', 'Catechin'],
  ['콜라겐펩타이드', 'Collagen Peptide'],
  ['피쉬콜라겐', 'Fish Collagen'],
  ['콜라겐', 'Collagen'],
  ['글루타치온', 'Glutathione'],
  ['코엔자임Q10', 'Coenzyme Q10'],
  ['코엔자임 Q10', 'Coenzyme Q10'],
  ['루테인', 'Lutein'],
  ['지아잔틴', 'Zeaxanthin'],
  ['아스타잔틴', 'Astaxanthin'],
  ['밀크씨슬추출물', 'Milk Thistle Extract'],
  ['밀크씨슬', 'Milk Thistle'],
  ['밀크시슬', 'Milk Thistle'],
  ['실리마린', 'Silymarin'],
  ['유산균', 'Probiotics'],
  ['프로바이오틱스', 'Probiotics'],
  ['프리바이오틱스', 'Prebiotics'],
  ['포스트바이오틱스', 'Postbiotics'],
  ['홍삼농축액', 'Red Ginseng Extract'],
  ['홍삼', 'Red Ginseng'],
  ['진세노사이드', 'Ginsenoside'],
  ['테아닌', 'L-Theanine'],
  ['가바', 'GABA'],
  ['오메가3', 'Omega-3'],
  ['차전자피', 'Psyllium Husk'],
  ['식이섬유', 'Dietary Fiber'],
  ['시카', 'Cica'],
  ['레티놀', 'Retinol'],
  ['타우린', 'Taurine'],
  ['아르기닌', 'L-Arginine'],
  ['카르니틴', 'L-Carnitine'],
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
  ['슈퍼콜라겐 케라핏', 'スーパーコラーゲン ケラフィット'],
  ['슈퍼콜라겐 앰플', 'スーパーコラーゲン アンプル'],
  ['슈퍼콜라겐 PDRN', 'スーパーコラーゲン PDRN'],
  ['슈퍼콜라겐', 'スーパーコラーゲン'],
  ['케라핏', 'ケラフィット'],
  ['슈퍼레티놀', 'スーパーレチノール'],
  ['슈퍼시카 B5', 'スーパーシカ B5'],
  ['슈퍼시카', 'スーパーシカ'],
  ['앰플', 'アンプル'],
  ['3 TYPES 저분자 콜라겐 1,000mg*', '3種の低分子コラーゲン 1,000mg*'],
  ['저분자 콜라겐 3,500mg', '低分子コラーゲン 3,500mg'],
  ['5가지 유형 콜라겐', '5種のコラーゲン配合'],
  ['저분자 콜라겐', '低分子コラーゲン'],
  ['고순도* 연어 PDRN', '高純度* サーモンPDRN'],
  ['헤드투토', 'ヘッドトゥトー全身ケア'],
  ['트리플 뷰티 부스트', 'トリプルビューティーブースト'],
  ['매일 생기+윤기+광채 완성', '毎日のハリ・ツヤ・輝きケア'],
  ['먹는 레티놀로 광채 시너지*', '飲むレチノールで輝きシナジー*'],
  ['레티놀 X 비타민C·E·아연·판토텐산', 'レチノール×ビタミンC・E・亜鉛・パントテン酸'],
  ['비건 레티놀 1,000μg*', 'ヴィーガンレチノール 1,000μg*'],
  ['흡수 빠른 리포좀 레티놀 제형', '高吸収リポソームレチノール処方'],
  ['속민감+속진정', 'インナースージング＆鎮静ケア'],
  ['고함량 판토텐산', '高含有パントテン酸'],
  ['밀크세라마이드 1000', 'ミルクセラミド 1000'],
  ['녹차 유래 유산균 함유', '緑茶由来乳酸菌配合'],
  ['9.4배 흡수율*', '吸収率9.4倍*'],
  ['전신 초밀착', '全身高密着ケア'],
  ['흡수 빠른 액상형', '素早く吸収されるドリンクタイプ'],
  ['흡수 빠른 미세입자 액상 제형', '微細粒子液体フォーミュラ'],
  ['히알루론산 · 엘라스틴 · 세라마이드 · 비타민C', 'ヒアルロン酸・エラスチン・セラミド・ビタミンC'],
  ['*1일 1포 기준', '*1日1包あたり'],
  ['*1일 영양성분 기준치 대비 2sticks', '*1日栄養成分基準値対比 2包あたり'],
  ['1일 영양성분 기준치 대비 2sticks', '1日栄養成分基準値対比 2包あたり'],
  ['*자사 기존 제품 대비', '*自社従来品比'],
  ['*원료적 특성에 한함', '*原料特性に限る'],
  ['저분자피쉬콜라겐펩타이드', '低分子フィッシュコラーゲンペプチド'],
  ['저분자 피쉬콜라겐 펩타이드', '低分子フィッシュコラーゲンペプチド'],
  ['저분자콜라겐', '低分子コラーゲン'],
  ['식물성 콜라겐', '植物性コラーゲン'],
  ['연어이리추출물(PDRN 함유)', 'サケ白子抽出物(PDRN含有)'],
  ['비타민 B, C 컴플렉스', 'ビタミンB・Cコンプレックス'],
  ['모링가잎추출물(비건레티놀)', 'モリンガ葉抽出物(ヴィーガンレチノール)'],
  ['병풀추출분말', 'ツボクサ抽出粉末'],
  ['판토텐산칼슘', 'パントテン酸カルシウム'],
  ['비타민A', 'ビタミンA'],
  ['비타민E', 'ビタミンE'],
  ['비타민D', 'ビタミンD'],
  ['비타민K', 'ビタミンK'],
  ['비타민B12', 'ビタミンB12'],
  ['비타민B6', 'ビタミンB6'],
  ['비타민B2', 'ビタミンB2'],
  ['비타민B1', 'ビタミンB1'],
  ['비타민B', 'ビタミンB'],
  ['비타민 B', 'ビタミンB'],
  ['비타민', 'ビタミン'],
  ['비오틴', 'ビオチン'],
  ['나이아신', 'ナイアシン'],
  ['니아신', 'ナイアシン'],
  ['엽산', '葉酸'],
  ['셀레늄', 'セレン'],
  ['셀렌', 'セレン'],
  ['세라마이드', 'セラミド'],
  ['엘-시스틴', 'L-シスチン'],
  ['맥주효모', 'ビール酵母'],
  ['아연', '亜鉛'],
  ['마그네슘', 'マグネシウム'],
  ['칼슘', 'カルシウム'],
  ['철분', '鉄'],
  ['구리', '銅'],
  ['망간', 'マンガン'],
  ['몰리브덴', 'モリブデン'],
  ['요오드', 'ヨウ素'],
  ['APIC대두배아열수추출물등복합물', 'APIC大豆胚芽熱水抽出物複合体'],
  ['가르시니아캄보지아추출물', 'ガルシニアカンボジア抽出物'],
  ['가르시니아 캄보지아', 'ガルシニアカンボジア'],
  ['가르시니아캄보지아', 'ガルシニアカンボジア'],
  ['가르시니아', 'ガルシニア'],
  ['녹차추출물', '緑茶抽出物（カテキン）'],
  ['녹차 추출물', '緑茶抽出物'],
  ['카테킨', 'カテキン'],
  ['콜라겐펩타이드', 'コラーゲンペプチド'],
  ['피쉬콜라겐', 'フィッシュコラーゲン'],
  ['콜라겐', 'コラーゲン'],
  ['글루타치온', 'グルタチオン'],
  ['코엔자임Q10', 'コエンザイムQ10'],
  ['코엔자임 Q10', 'コエンザイムQ10'],
  ['루테인', 'ルテイン'],
  ['지아잔틴', 'ゼアキサンチン'],
  ['아스타잔틴', 'アスタキサンチン'],
  ['밀크씨슬추출물', 'マリアアザミ抽出物'],
  ['밀크씨슬', 'マリアアザミ'],
  ['밀크시슬', 'マリアアザミ'],
  ['실리마린', 'シリマリン'],
  ['유산균', '乳酸菌'],
  ['프로바이오틱스', 'プロバイオティクス'],
  ['프리바이오틱스', 'プレバイオティクス'],
  ['포스트바이오틱스', 'ポストバイオティクス'],
  ['홍삼농축액', '濃縮紅参エキス'],
  ['홍삼', '紅参'],
  ['진세노사이드', 'ジンセノサイド'],
  ['테아닌', 'L-テアニン'],
  ['가바', 'GABA'],
  ['오메가3', 'オメガ3'],
  ['차전자피', 'オオバコ種皮（サイリウム）'],
  ['식이섬유', '食物繊維'],
  ['시카', 'ツボクサ（シカ）'],
  ['레티놀', 'レチノール'],
  ['타우린', 'タウリン'],
  ['아르기닌', 'L-アルギニン'],
  ['카르니틴', 'L-カルニチン'],
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

const CHOSUNG_RO = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const JUNGSUNG_RO = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const JONGSUNG_RO = ['', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 'h'];

function romanizeRemainingHangul(str) {
  return str.replace(/[가-힣]/g, ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    const cho = Math.floor(code / 588);
    const jung = Math.floor((code % 588) / 28);
    const jong = code % 28;
    return (CHOSUNG_RO[cho] || '') + (JUNGSUNG_RO[jung] || '') + (JONGSUNG_RO[jong] || '');
  });
}

function katakanaRemainingHangul(str) {
  const kanaMap = {
    '가': 'ガ', '나': 'ナ', '다': 'ダ', '라': 'ラ', '마': 'マ', '바': 'バ', '사': 'サ', '아': 'ア', '자': 'ジャ', '차': 'チャ', '카': 'カ', '타': 'タ', '파': 'パ', '하': 'ハ',
    '고': 'ゴ', '노': 'ノ', '도': 'ド', '로': 'ロ', '모': 'モ', '보': 'ボ', '소': 'ソ', '오': 'オ', '조': 'ジョ', '초': 'チョ', '코': 'コ', '토': 'ト', '포': 'ポ', '호': 'ホ',
    '구': 'グ', '누': 'ヌ', '두': 'ドゥ', '루': 'ル', '무': 'ム', '부': 'ブ', '수': 'ス', '우': 'ウ', '주': 'ジュ', '추': 'チュ', '쿠': 'ク', '투': 'トゥ', '푸': 'プ', '후': 'フ',
    '기': 'ギ', '니': 'ニ', '디': 'ディ', '리': 'リ', '미': 'ミ', '비': 'ビ', '시': 'シ', '이': 'イ', '지': 'ジ', '치': 'チ', '키': 'キ', '티': 'ティ', '피': 'ピ', '히': 'ヒ',
    '개': 'ゲ', '내': 'ネ', '대': 'デ', '래': 'レ', '매': 'メ', '배': 'ベ', '새': 'セ', '애': 'エ', '재': 'ジェ', '채': 'チェ', '캐': 'ケ', '태': 'テ', '패': 'ペ', '해': 'ヘ',
  };
  return str.replace(/[가-힣]/g, ch => kanaMap[ch] || romanizeRemainingHangul(ch));
}

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
    // 사전에 없는 미등록 한글 단어가 남아있을 경우 음차 fallback 변환하여 100% 영문화 보장
    if (/[가-힣]/.test(out)) {
      out = romanizeRemainingHangul(out);
    }
  } else if (targetLang === 'ja') {
    // 사전에 없는 미등록 한글 단어가 남아있을 경우 카타카나 fallback 변환하여 100% 일문화 보장
    if (/[가-힣]/.test(out)) {
      out = katakanaRemainingHangul(out);
    }
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
export function getHffMarkSvg(x, y, size = 15, opacity = 0.5, color = '#ffffff') {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="274.74 398.8 45.04 45.04" opacity="${opacity}">
    <path fill="${color}" d="m293.63,411.69c-.12.18-.29.34-.49.47-.21.13-.44.25-.7.34-.27.1-.53.19-.81.27l.38.46c.25-.06.5-.14.75-.24.25-.09.49-.2.71-.33.22-.13.41-.29.58-.47.17-.18.29-.39.37-.62h1.5v2.37h.38c.13,0,.21-.03.25-.08.04-.06.06-.15.06-.3v-4.14h-.69v1.55h-1.42v-.44c0-.18-.01-.33-.05-.45-.04-.12-.1-.21-.17-.28-.08-.07-.17-.12-.3-.14-.12-.03-.26-.04-.43-.04h-1.7v.58h1.57c.17,0,.27.03.32.1.05.07.07.18.07.35v.38c0,.25-.06.47-.18.66"/>
    <path fill="${color}" d="m296.69,415.58s.06-.11.06-.2v-.32h-3.17s-.07-.05-.07-.13v-1.38h-.69v1.59c0,.15.05.28.14.37.09.1.22.15.37.15h3.15c.1,0,.16-.03.21-.07"/>
    <path fill="${color}" d="m298.78,413.39c-.19.1-.36.24-.49.41-.13.17-.2.39-.2.67s.07.49.19.67c.13.17.29.3.48.4.2.09.41.16.64.19.23.04.44.05.65.05s.41-.02.64-.05c.22-.04.43-.1.62-.19.19-.1.35-.23.47-.4.13-.18.2-.39.2-.66s-.07-.5-.2-.67c-.13-.17-.28-.31-.47-.41-.19-.1-.4-.17-.62-.21-.23-.03-.44-.05-.64-.05s-.41.02-.63.05c-.22.04-.44.11-.64.21m1.28.32c.11,0,.24,0,.37.03.15.02.28.06.4.11.13.06.24.13.33.23.09.1.13.22.13.38s-.04.28-.13.38c-.09.09-.19.17-.32.22-.12.05-.26.09-.41.1-.14.02-.27.03-.38.03s-.25,0-.39-.03c-.15-.02-.29-.06-.42-.1-.13-.05-.24-.13-.33-.22-.1-.09-.14-.22-.14-.38s.04-.29.14-.38c.09-.1.2-.18.33-.23.13-.05.28-.09.42-.11.14-.02.28-.03.39-.03"/>
    <path fill="${color}" d="m298.43,412.76c.3-.12.56-.26.79-.43.22-.17.4-.38.53-.62.14-.24.2-.52.2-.84v-.34c0-.18-.02-.33-.05-.45-.03-.12-.09-.21-.17-.28-.07-.07-.17-.12-.3-.14-.12-.03-.26-.04-.43-.04h-1.7v.59h1.57c.16,0,.28.03.32.1.05.07.07.18.07.35v.25c0,.26-.06.48-.18.66-.12.18-.28.34-.49.47-.2.13-.43.24-.69.33-.26.09-.53.17-.8.24l.38.47c.33-.09.64-.19.94-.3"/>
    <path fill="${color}" d="m301.84,412.93c.05-.06.06-.15.06-.27v-1.3h.86v-.59h-.86v-1.35h-.68v3.6h.38c.12,0,.2-.03.24-.08"/>
    <path fill="${color}" d="m291.09,423.44c.06-.06.07-.16.07-.3v-5.85h-.68v6.23h.36c.12,0,.2-.03.25-.08"/>
    <path fill="${color}" d="m288.39,420.09c-.04.11-.08.22-.15.32-.06.1-.13.2-.22.29-.08.09-.17.18-.26.26-.1.08-.21.17-.33.24-.13.07-.26.14-.4.2-.14.06-.28.11-.42.16-.14.05-.28.09-.41.13l.38.49c.39-.09.74-.22,1.05-.37.3-.16.56-.34.78-.53.22-.21.4-.44.54-.7.13-.26.2-.54.2-.84v-1.13c0-.18-.02-.33-.06-.45-.04-.13-.1-.23-.18-.3-.08-.07-.2-.13-.32-.17-.13-.04-.29-.06-.48-.06h-1.73v.6h1.61c.2,0,.32.03.38.09.06.06.09.17.09.33v1.09c0,.12-.02.24-.06.35"/>
    <path fill="${color}" d="m292.86,417.37c-.07-.09-.17-.14-.27-.14h-.33v1.75c0,.25.05.4.15.49.1.08.26.12.48.12h3.28c.1,0,.17-.03.21-.07.05-.04.07-.11.07-.2v-.32h-3.4s-.07,0-.08-.03c-.01-.02-.01-.06-.01-.11v-1.18c0-.12-.04-.22-.1-.31"/>
    <path fill="${color}" d="m295.12,421.2c-.24-.06-.51-.09-.79-.09-.3,0-.58.03-.83.08-.26.05-.48.13-.67.24-.19.11-.34.24-.45.4-.11.16-.16.34-.16.56s.06.41.17.56c.11.16.27.29.46.39.19.1.41.18.67.23.25.05.52.07.8.07.3,0,.58-.03.83-.08.25-.05.47-.14.66-.25.18-.11.33-.24.42-.39.11-.16.16-.33.16-.53,0-.21-.06-.39-.17-.55-.11-.16-.26-.3-.44-.4-.19-.11-.41-.19-.67-.24m.49,1.46c-.07.08-.17.16-.28.22-.12.06-.27.1-.44.13-.17.03-.35.04-.55.04s-.4-.01-.58-.05c-.17-.03-.31-.07-.44-.13-.12-.05-.21-.13-.27-.21-.07-.08-.1-.17-.1-.27,0-.21.12-.38.36-.5.24-.12.59-.18,1.04-.18.2,0,.38.01.55.05.16.03.31.08.43.14.12.06.22.13.29.21.07.08.1.18.1.28s-.03.19-.09.27"/>
    <path fill="${color}" d="m297.1,420.62l-.23-.23c.1-.05.19-.11.3-.17v-.1h-5.7v.6h5.41c.1,0,.17-.04.22-.1"/>
    <path fill="${color}" d="m301.89,423.53c.11,0,.19-.03.24-.09.05-.06.08-.16.08-.31v-1.39c0-.16-.05-.27-.14-.35-.1-.08-.22-.12-.37-.12h-3.37v.59h3.11c.06,0,.09.03.09.09v1.58h.36Z"/>
    <path fill="${color}" d="m297.1,420.62l.22.23c.34-.18.64-.38.89-.61.25-.23.45-.45.6-.66.09.1.19.21.31.31.12.11.25.22.38.32.14.1.27.19.41.28.14.09.28.16.4.21l.39-.45c-.21-.11-.41-.22-.6-.34-.19-.12-.35-.25-.5-.38-.14-.13-.26-.28-.34-.44-.08-.16-.12-.33-.12-.51v-.91c0-.09-.02-.17-.05-.22-.03-.06-.1-.08-.22-.08h-.44v1.2c0,.2-.05.38-.14.55-.09.17-.21.34-.36.49-.15.16-.33.3-.51.43-.1.06-.19.11-.28.16v.18c0,.1-.03.17-.07.22"/>
    <path fill="${color}" d="m302.23,417.29h-.69v3.63h.36c.13,0,.22-.04.26-.1.05-.07.07-.18.07-.31v-3.22Z"/>
    <path fill="${color}" d="m308.12,420.72c.19,0,.29-.11.29-.32v-.28h-5.7v.6h2.52v.61h-1.7v1.55c0,.22.06.39.18.5.11.11.25.17.41.17h2.68c.29,0,.5-.08.63-.23.13-.15.2-.37.2-.64v-1.35h-1.72v-.61h2.21Zm-1.18,1.19v.81c0,.1-.02.17-.08.2-.06.03-.12.04-.22.04h-2.3c-.09,0-.14-.05-.14-.16v-.89h2.75Z"/>
    <path fill="${color}" d="m307.97,419.33v-.25h-.89s.02-.1.03-.14c0-.05.01-.1.01-.14v-.87h.71v-.57h-4.53v.57h.71v.87s0,.1.01.15c0,.05.02.09.03.14h-.87v.57h4.49c.2,0,.3-.11.3-.32m-1.53-.53c0,.09-.01.15-.04.2-.03.05-.08.07-.16.07h-1.35c-.07,0-.12-.03-.15-.07-.03-.05-.05-.11-.05-.2v-.88h1.75v.88Z"/>
    <path fill="${color}" d="m312.85,420.15c.04.16.06.31.06.47,0,3.02-7.01,5.48-15.66,5.48s-15.65-2.45-15.65-5.48c0-.16.02-.31.06-.47-1.11.81-1.73,1.73-1.73,2.7,0,3.43,7.75,6.19,17.32,6.19s17.33-2.77,17.33-6.19c0-.97-.62-1.89-1.73-2.7"/>
    <rect fill="${color}" x="288.82" y="434.97" width=".9" height=".57"/>
    <path fill="${color}" d="m301.58,434.96c-.62,0-.62,1.22,0,1.22s.62-1.22,0-1.22"/>
    <path fill="${color}" d="m292.03,434.94c-.63,0-.63,1.53,0,1.53s.64-1.53,0-1.53"/>
    <rect fill="${color}" x="298.11" y="437.01" width="1.6" height=".5"/>
    <path fill="${color}" d="m295.11,434.96c-.65,0-.67,1.08,0,1.08s.63-1.08,0-1.08"/>
    <rect fill="${color}" x="288.47" y="437.01" width="1.6" height=".5"/>
    <path fill="${color}" d="m297.26,398.8c-12.43,0-22.51,10.08-22.51,22.52s10.08,22.51,22.51,22.51,22.52-10.08,22.52-22.51-10.08-22.52-22.52-22.52m-12.72,37.29c.44-.22.91-.57.91-1.09v-.36h.47v.36c0,.5.44.87.91,1.1l-.18.33c-.38-.13-.74-.43-.99-.73-.12.23-.58.63-.95.73l-.17-.33Zm2.91,1.73h-.48v-.85h-2.07v-.32h2.54v1.17Zm0-1.35h-.48v-1.89h.48v1.89Zm3.24-.05h-1.19v.26h1.04v1.14h-2.54v-1.14h1.04v-.26h-1.19v-.32h2.84v.32Zm-2.69-1.45v-.32h2.54v.32h-.36v.57h.36v.32h-2.54v-.32h.35v-.57h-.35Zm5.9,2.85h-.47v-.43c-.25.1-.44.11-.71.11h-1.67v-.31h1.79c.22,0,.37-.04.57-.1.02-.02.02-2.51.02-2.51h.47v3.24Zm-1.86-3.21c1.26,0,1.28,2.18,0,2.18s-1.26-2.18,0-2.18m3.08,0c1.29,0,1.29,1.79,0,1.79s-1.3-1.79,0-1.79m1.87,3.21h-.47v-.88h-2.07v-.32h2.54v1.2Zm.37-2.49h-.37v.32h.37v.36h-.37v.42h-.47v-1.85h.47v.39h.37v.35Zm2.99,1.1h-1.19v.26h1.04v1.14h-2.54v-1.14h1.04v-.26h-1.19v-.32h2.85v.32Zm-2.69-1.45v-.32h2.54v.32h-.36v.57h.36v.32h-2.54v-.32h.35v-.57h-.35Zm3.93-.36c1.25,0,1.24,1.93,0,1.93s-1.24-1.93,0-1.93m1.87,3.21h-2.46v-1.02h.47v.71h1.99v.32Zm.33-2.07h-.37v1.18h-.47v-2.35h.47v.82h.37v.36Zm.05.47c.44-.23.91-.55.91-1.09v-.16h-.73v-.32h1.91v.32h-.71v.16c0,.5.47.89.9,1.09l-.17.33c-.36-.12-.76-.42-.97-.7-.16.2-.62.59-.97.7l-.18-.33Zm1.96-.58v-.32h.47v-.75h.47v2.32h-.47v-1.25h-.47Zm.97,2.17h-2.49v-1.07h.43v.75h2.07v.32Zm2.25-.29c-.33-.14-.66-.47-.87-.76-.16.29-.57.62-.87.76l-.19-.32c.54-.35.82-.71.82-1.37v-.73h-.62v-.32h.62v-.29h.46v.29h.63v.32h-.63v.74c0,.6.3,1.05.82,1.36l-.18.32Zm.89.29h-.46v-1.86h-.55v-.32h.55v-1.07h.46v3.24Zm-30.36-5.3c-2.06-3.24-3.24-7.08-3.24-11.2,0-11.57,9.38-20.96,20.94-20.96s20.95,9.38,20.95,20.96c0,4.12-1.19,7.96-3.25,11.2h-35.41Z"/>
    <rect fill="${color}" x="298.47" y="434.97" width=".9" height=".57"/>
  </svg>`;
}

/**
 * 미국(FDA) 공식 Dietary Supplement 15mm 인증 실 마크 벡터 SVG
 */
export function getUsDietarySupplementMarkSvg(x, y, size = 15) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 45 45" opacity="0.95">
    <circle cx="22.5" cy="22.5" r="21" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>
    <circle cx="22.5" cy="22.5" r="18.5" fill="none" stroke="#FFFFFF" stroke-width="0.6" stroke-dasharray="1.2 0.8"/>
    <path id="us-seal-arc" d="M 6.5,22.5 A 16,16 0 1,1 38.5,22.5" fill="none"/>
    <text fill="#CEDC00" font-family="'Raleway',sans-serif" font-size="3.6" font-weight="700" letter-spacing="0.4">
      <textPath href="#us-seal-arc" startOffset="50%" text-anchor="middle">DIETARY SUPPLEMENT</textPath>
    </text>
    <path d="M22.5 14.5 L24.5 19.5 L30 20 L26 23.5 L27.2 29 L22.5 26 L17.8 29 L19 23.5 L15 20 L20.5 19.5 Z" fill="#FFFFFF"/>
    <text x="22.5" y="37" text-anchor="middle" fill="#FFFFFF" font-family="'Raleway',sans-serif" font-size="3.2" font-weight="600" letter-spacing="0.5">VERIFIED</text>
  </svg>`;
}

/**
 * 일본(소비자청) 공식 機能性表示食品 15mm 인증 실 마크 벡터 SVG
 */
export function getJpFunctionalMarkSvg(x, y, size = 15) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 45 45" opacity="0.95">
    <circle cx="22.5" cy="22.5" r="21" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>
    <circle cx="22.5" cy="22.5" r="18.5" fill="none" stroke="#FFFFFF" stroke-width="0.6"/>
    <text x="22.5" y="15.5" text-anchor="middle" fill="#CEDC00" font-family="'Noto Sans JP',sans-serif" font-size="4.2" font-weight="700" letter-spacing="0.3">機能性</text>
    <text x="22.5" y="24" text-anchor="middle" fill="#FFFFFF" font-family="'Noto Sans JP',sans-serif" font-size="4.2" font-weight="700" letter-spacing="0.3">表示食品</text>
    <line x1="9" y1="27.5" x2="36" y2="27.5" stroke="#FFFFFF" stroke-width="0.6"/>
    <text x="22.5" y="35" text-anchor="middle" fill="#FFFFFF" font-family="'Noto Sans JP',sans-serif" font-size="2.9" font-weight="500">消費者庁届出</text>
  </svg>`;
}

/**
 * 인식된 국문 패키지 레이아웃을 기반으로 국가별(KR / US / JP) 시뮬레이션 SVG 생성
 * - 불필요한 박스선, 가이드라인, 붉은색 치수 텍스트 전면 제거
 * - 제품명: 좌우 최소 2mm 마진 strictly 보장 (safeW = W - 4mm)
 * - 라인명(라이트체 300) / 제품명(볼드체 700) 분리 적용
 * - US (FDA): Dietary Supplement 화이트 컬러 대소문자 표기 및 슬라이더 크기 조절 적용
 * - 건강기능식품 15mm 마크: 내용량 바로 위 1mm 간격 내외로 중앙 정렬 배치 (KR 전용)
 * - 각 국가별(한글, 영문, 일문) 제품명 크기 개별 슬라이더 반영
 */
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
 * 한글/영문/일문/숫자 폭 비율을 실측 추정하여 자연스러운 공백·쉼표 단위로 개행하고,
 * 공백 없는 긴 복합원료명도 좌우 2mm 마진 영역을 절대 넘지 않도록 글자 단위로 분할한다.
 */
const charWidthFactor = ch => {
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(ch)) return 0.94;
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
    // 쉼표(, / 、)나 공백 단위로 토큰 분리 후 폭에 맞춰 줄바꿈
    const tokens = trimmed.split(/(?<=[,，、·・/])\s*|\s+/);
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

function renderLocalizedInnerBeautySvg(parsed, country = 'KR') {
  const W = Math.max(35, +(parsed.wMm || parsed.w || 75));
  const H = Math.max(55, +(parsed.hMm || parsed.h || 132.5));
  const isHff = (parsed.type || 'hff') === 'hff';
  const isWide = W >= 120;
  const isExtraWide = W >= 195;
  const isMedium = W >= 95 && W < 120;
  const isSmall = W < 65;

  const leftX = isWide ? 8.0 : isSmall ? 3.2 : 4.0;
  const bottomMargin = 5.0;
  const safeW = Math.max(20, W - leftX * 2);
  const pointHex = parsed.pantoneHex || '#F6B9D4';

  // 바이탈뷰티 로고 크기: 건강기능식품·일반식품 구분 없이 일반식품 표준 크기(43.59mm 태그)로 100% 통일
  const topLine = 1.5;
  const tagWTop = 43.59;
  const tagWBot = 39.55;
  const tagY0 = 1.17;
  const tagH = 6.47;
  const tagY1 = +(tagY0 + tagH).toFixed(2);
  const tx0 = +((W - tagWTop) / 2).toFixed(2);
  const tx1 = +(tx0 + tagWTop).toFixed(2);
  const bx0 = +((W - tagWBot) / 2).toFixed(2);
  const bx1 = +(bx0 + tagWBot).toFixed(2);

  const logoScale = tagWTop / (123.55 * PT_MM);
  const logoTx = +(tx0 - 229.93 * PT_MM * logoScale).toFixed(3);
  const logoTy = +(tagY0 - 283.61 * PT_MM * logoScale).toFixed(3);

  const rawLineName = (parsed.lineName || '슈퍼콜라겐').trim();
  const rawProductName = (parsed.productName || '케라핏').trim();
  const rawIngredient = (parsed.ingredient || '').trim();
  const rawPoints = String(parsed.points ?? '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성');
  const rawFootnote = (parsed.footnote ?? '*1일 1포 기준').trim();

  let lineText = rawLineName;
  let prodText = rawProductName;
  let ingText = rawIngredient;
  let pointsText = rawPoints;
  let footnoteText = rawFootnote;

  if (country === 'US') {
    lineText = translateKoPackageText(rawLineName, 'en');
    prodText = translateKoPackageText(rawProductName, 'en');
    ingText = translateKoPackageText(rawIngredient, 'en');
    pointsText = translateKoPackageText(rawPoints, 'en');
    footnoteText = translateKoPackageText(rawFootnote, 'en');
  } else if (country === 'JP') {
    lineText = translateKoPackageText(rawLineName, 'ja');
    prodText = translateKoPackageText(rawProductName, 'ja');
    ingText = translateKoPackageText(rawIngredient, 'ja');
    pointsText = translateKoPackageText(rawPoints, 'ja');
    footnoteText = translateKoPackageText(rawFootnote, 'ja');
  }

  const fontFam = country === 'US'
    ? "'Raleway','Noto Sans KR',sans-serif"
    : country === 'JP'
      ? "'Noto Sans JP','Noto Sans CJK SC','Hiragino Kaku Gothic ProN','Meiryo',sans-serif"
      : "'VB-ShinGothic','RIX-신고딕se-pro','210 OmniGothic','Noto Sans KR',sans-serif";

  const titlePt = country === 'KR'
    ? (+parsed.krTitlePt || 27)
    : country === 'US'
      ? (+parsed.enTitlePt || 20)
      : (+parsed.jaTitlePt || 24);
  const dietaryPt = +parsed.dietaryPt || 11;

  const gapTagName = isExtraWide ? 15.0 : isWide ? 9.0 : isSmall ? 7.5 : 10.0;
  const namePx = titlePt * PT_MM;
  const nameY1 = tagY1 + gapTagName + namePx * 0.82;
  const nameLineStep = namePx * 1.16;

  const inlineSub = country === 'KR' && prodText && prodText.length <= 2 && /^[A-Za-z0-9]+$/.test(prodText) && lineText.length <= 4;
  let titleSvg = '';
  let lastTitleBaselineY = nameY1;

  if (inlineSub) {
    titleSvg = `<text x="${leftX}" y="${nameY1.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${namePx.toFixed(2)}" font-family="${fontFam}"><tspan font-weight="700">${lineText}</tspan><tspan font-weight="500"> ${prodText}</tspan></text>`;
  } else {
    const titleRows = [];
    if (lineText) {
      wrapSvgTextToWidth(lineText, namePx, safeW, 1).forEach(t => titleRows.push({ text: t, weight: 700 }));
    }
    if (prodText) {
      wrapSvgTextToWidth(prodText, namePx, safeW, 1).forEach(t => titleRows.push({ text: t, weight: 500 }));
    }
    titleSvg = titleRows.map((r, i) => {
      const ry = nameY1 + i * nameLineStep;
      lastTitleBaselineY = ry;
      return `<text x="${leftX}" y="${ry.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${namePx.toFixed(2)}" font-weight="${r.weight}" font-family="${fontFam}">${r.text}</text>`;
    }).join('\n      ');
  }

  let subTitleSvg = '';
  let subBottomY = lastTitleBaselineY;
  if (country === 'US' && isHff) {
    const dPx = dietaryPt * PT_MM;
    const dY = lastTitleBaselineY + dPx * 0.92 + 1.4;
    subTitleSvg = `<text x="${leftX}" y="${dY.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${dPx.toFixed(2)}" font-weight="700" font-family="${fontFam}">Dietary Supplement</text>`;
    subBottomY = dY;
  } else if (country === 'JP' && isHff) {
    const jPx = 9.5 * PT_MM;
    const jY = lastTitleBaselineY + jPx * 0.92 + 1.4;
    subTitleSvg = `<text x="${leftX}" y="${jY.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${jPx.toFixed(2)}" font-weight="700" font-family="${fontFam}">機能性表示食品</text>`;
    subBottomY = jY;
  }

  // 국가별 내용량(Capacity) 포맷 생성 (기본 10pt, 국가별 조절 연동)
  const capPt = country === 'KR'
    ? (+parsed.krCapPt || 10)
    : country === 'US'
      ? (+parsed.usCapPt || 10)
      : (+parsed.jpCapPt || 10);
  const capPx = capPt * PT_MM;
  const capLineStep = capPx * 1.22;
  const capScaleRatio = isWide ? 0.95 : 0.90;

  let rawCapLines = [];
  if (country === 'KR') {
    const krText = (parsed.krCapText || '48 g [1.6 g X 30포]').trim();
    const cleaned = krText.replace(/^(건강기능식품|일반식품)\s*/, '');
    rawCapLines = [isHff ? `건강기능식품 ${cleaned}` : `일반식품 ${cleaned}`];
  } else if (country === 'US') {
    const usText = parsed.usCapText || '30 - 0.056 oz (1.6 g) Stick\nNet Wt. 1.69 oz (48 g)';
    rawCapLines = usText.split('\n').map(s => s.trim()).filter(Boolean);
  } else if (country === 'JP') {
    const jpClass = parsed.jpClass || (isHff ? '機能性表示食品' : '一般食品');
    const jpText = parsed.jpCapText || '48g (1.6g × 30包)';
    rawCapLines = [`${jpClass} ${jpText}`];
  }

  // 건강기능식품 영문(US)은 제품명의 1/2이 아니라 10pt로 고정
  const ingPt = (isHff && country === 'US') ? 10.0 : (isHff ? Math.max(7.5, +(titlePt * 0.5).toFixed(1)) : 14.0);
  const ingPx = ingPt * PT_MM;

  let ingSvg = '';
  let capSvg = '';
  let markSvg = '';
  let upperBlockBottomY = subBottomY;
  let lowerBlockTopY = H - bottomMargin;

  if (isHff) {
    // [건강기능식품] 원재료명: 제품명(또는 서브타이틀) 아래 3mm · 1/2 크기 · Light(300) · 좌측 정렬
    const ingLineStep = ingPx * 1.22;
    const ingLines = wrapSvgTextToWidth(ingText, ingPx, safeW, 1);
    const gapBelowSub = country === 'KR' ? 3.0 : 1.8;
    const ingStartY = subBottomY + namePx * 0.14 + gapBelowSub + ingPx * 0.85;
    ingSvg = ingLines.map((line, i) => {
      const iy = ingStartY + i * ingLineStep;
      upperBlockBottomY = iy;
      return `<text x="${leftX}" y="${iy.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${ingPx.toFixed(2)}" font-weight="300" font-family="${fontFam}">${line}</text>`;
    }).join('\n      ');

    // 내용량: 하단 5mm 위 · 10pt Bold · 좌측 정렬 + KR 건강기능식품 마크 비간섭 배치
    const markSize = country === 'KR' ? 15 : 0;
    const markX = W - leftX - markSize;
    const joinedCap = rawCapLines.join(' ');
    const approxCapW = estimateTextWidthMm(joinedCap, capPx, capScaleRatio);
    const doesFitBesideMark = markSize === 0 || (leftX + approxCapW) <= (markX - 1.5);
    const capMaxW = doesFitBesideMark && markSize > 0 ? Math.max(16, markX - leftX - 1.5) : safeW;
    const capLines = rawCapLines.flatMap(l => wrapSvgTextToWidth(l, capPx, capMaxW, capScaleRatio));
    const capBottomY = H - bottomMargin - capPx * 0.16;
    const capStartY = capBottomY - (capLines.length - 1) * capLineStep;

    capSvg = `<g transform="translate(${leftX} ${capStartY.toFixed(2)}) scale(${capScaleRatio.toFixed(2)} 1)">
      ${capLines.map((line, i) => `<text x="0" y="${(i * capLineStep).toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${capPx.toFixed(2)}" font-weight="700" letter-spacing="-0.02em" font-family="${fontFam}">${line}</text>`).join('')}
    </g>`;

    if (country === 'KR') {
      const markY = doesFitBesideMark
        ? (H - bottomMargin - markSize)
        : (capStartY - capPx * 0.85 - markSize - 2.0);
      markSvg = getHffMarkSvg(markX, markY, markSize, 0.72, '#1D1D1B');
    }
    lowerBlockTopY = capStartY - capPx * 0.88;
  } else {
    // [일반식품] 하단 5mm 위 원재료명(14pt Bold #706F6F), 그 위에 내용량(10pt Bold #1D1D1B)
    const ingStep = 16 * PT_MM;
    const ingLines = wrapSvgTextToWidth(ingText, ingPx, safeW, 0.82);
    const maxRawIngW = Math.max(...ingLines.map(l => estimateTextWidthMm(l, ingPx, 1)), 1);
    const ingScaleX = Math.max(0.68, Math.min(0.90, +(safeW / maxRawIngW).toFixed(2)));

    const ingLastBaselineY = H - bottomMargin - ingPx * 0.12;
    const ingFirstBaselineY = ingLastBaselineY - (ingLines.length - 1) * ingStep;

    ingSvg = ingLines.map((line, i) => {
      const iy = ingFirstBaselineY + i * ingStep;
      return `<g transform="translate(${leftX} ${iy.toFixed(2)}) scale(${ingScaleX} 1)">
        <text x="0" y="0" text-anchor="start" fill="#706F6F" font-size="${ingPx.toFixed(2)}" font-weight="700" font-family="${fontFam}">${line}</text>
      </g>`;
    }).join('\n      ');

    const capLines = rawCapLines.flatMap(l => wrapSvgTextToWidth(l, capPx, safeW, capScaleRatio));
    const capBottomY = ingFirstBaselineY - ingPx * 0.86 - 2.5;
    const capStartY = capBottomY - (capLines.length - 1) * capLineStep;

    capSvg = `<g transform="translate(${leftX} ${capStartY.toFixed(2)}) scale(${capScaleRatio.toFixed(2)} 1)">
      ${capLines.map((line, i) => `<text x="0" y="${(i * capLineStep).toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${capPx.toFixed(2)}" font-weight="700" letter-spacing="-0.02em" font-family="${fontFam}">${line}</text>`).join('')}
    </g>`;

    lowerBlockTopY = capStartY - capPx * 0.88;
  }

  // 중단 스택: 영문 베네핏(대문자) + 강조 포인트(쉼표 분리 캡슐) + 기준치 문안
  const benefitPt = isExtraWide ? 14 : isWide ? 11.5 : isMedium ? 11 : 10.5;
  const gapBenefitPill = isWide ? 2.4 : 2.7;
  const pillPt = isExtraWide ? 11.0 : isWide ? 9.5 : isMedium ? 8.2 : 7.2;
  const pillH = isExtraWide ? 5.84 : isWide ? 5.10 : isMedium ? 5.05 : 4.90;
  const pillGapY = 1.20;
  const pillGapX = 1.20;
  const gapPillFootnote = 1.50;
  const footnotePt = isWide ? 6.0 : 5.0;

  const fnPx = footnotePt * PT_MM;
  const fnStep = fnPx * 1.26;
  const fnLines = String(footnoteText || '').split('\n').map(l => l.trim()).filter(Boolean);

  const pointRowStrings = String(pointsText || '')
    .split('\n')
    .map(r => r.trim())
    .filter(Boolean)
    .slice(0, 5);
  const pointRows = pointRowStrings.map(rowStr =>
    rowStr.split(/,(?!\d{3}(?:\D|$))|\|/).map(col => col.trim()).filter(Boolean)
  );

  const pillPx = pillPt * PT_MM;
  const pillsTotalH = pointRows.length > 0
    ? pointRows.length * pillH + (pointRows.length - 1) * pillGapY
    : 0;

  const benPx = benefitPt * PT_MM;
  const gapAboveLower = isWide ? 4.8 : 7.2;
  const idealFootnoteStartY = lowerBlockTopY - gapAboveLower - Math.max(0, (fnLines.length - 1) * fnStep);
  const idealPillsTopY = idealFootnoteStartY - (fnLines.length ? (fnPx * 0.85 + gapPillFootnote) : 0) - pillsTotalH;
  const idealBenefitY = idealPillsTopY - gapBenefitPill;

  const minBenefitY = upperBlockBottomY + (isWide ? 6.5 : 8.0);
  const benefitY = Math.max(minBenefitY, idealBenefitY);
  const pillsTopY = benefitY + gapBenefitPill;
  const fnStartY = pillsTopY + pillsTotalH + gapPillFootnote + fnPx * 0.82;

  const benefitUpper = String(parsed.benefit ?? 'SHINE & YOUTHFUL').toUpperCase().trim();
  const benefitSvg = benefitUpper ? `<g transform="translate(${leftX} ${benefitY.toFixed(2)}) scale(0.95 1)">
      <text x="0" y="0" text-anchor="start" fill="#1D1D1B" font-size="${benPx.toFixed(2)}" font-weight="700" letter-spacing="0.11em" font-family="'Raleway','VB-ShinGothic',sans-serif">${benefitUpper}</text>
    </g>` : '';

  const isPdrnRule = /PDRN/i.test(rawProductName);
  let pointsSvg = '';
  if (isPdrnRule) {
    const ruleW = isWide ? Math.min(safeW * 0.48, 68) : Math.min(safeW * 0.68, 54);
    const flatPoints = pointRows.flat();
    const rowH = pillH + 0.9;
    pointsSvg = flatPoints.map((txt, idx) => {
      const ryTop = pillsTopY + idx * rowH;
      const ty = ryTop + rowH * 0.67;
      return `
        <line x1="${leftX}" y1="${ryTop.toFixed(2)}" x2="${(leftX + ruleW).toFixed(2)}" y2="${ryTop.toFixed(2)}" stroke="#1D1D1B" stroke-width="0.14"/>
        <text x="${leftX}" y="${ty.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${pillPx.toFixed(2)}" font-weight="500" font-family="${fontFam}">${txt}</text>
        ${idx === flatPoints.length - 1 ? `<line x1="${leftX}" y1="${(ryTop + rowH).toFixed(2)}" x2="${(leftX + ruleW).toFixed(2)}" y2="${(ryTop + rowH).toFixed(2)}" stroke="#1D1D1B" stroke-width="0.14"/>` : ''}`;
    }).join('');
  } else {
    const padX = isWide ? 2.0 : 1.6;
    pointsSvg = pointRows.map((cols, rIdx) => {
      const py = pillsTopY + rIdx * (pillH + pillGapY);
      let curX = leftX;
      return cols.map(colText => {
        // 문안 가로폭 정밀 계산 (영문/일문/숫자 비율 반영)
        const textW = estimateTextWidthMm(colText, pillPx, 0.95);
        const availW = Math.max(16, safeW - (curX - leftX));
        const desiredW = textW + padX * 2.2;
        // 캡슐 폭은 가용폭을 초과하지 않음
        const pw = Math.min(availW, Math.max(pillH * 1.8, desiredW));
        // 내부 텍스트 최대 허용 가로폭 (패딩 확보)
        const maxTextW = Math.max(6, pw - padX * 2.0);
        // 텍스트가 캡슐 컬러 영역을 절대 벗어나지 않도록 정밀 축소
        const textScaleX = textW > maxTextW ? +(maxTextW / textW).toFixed(3) : 1.0;
        const rx = +(pillH / 2).toFixed(2);
        const cx = curX + pw / 2;
        const ty = py + pillH * 0.69;
        const itemSvg = `
          <rect x="${curX.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="${pillH.toFixed(2)}" rx="${rx}" ry="${rx}" fill="${pointHex}"/>
          <g transform="translate(${cx.toFixed(2)} ${ty.toFixed(2)}) scale(${textScaleX} 1)">
            <text x="0" y="0" text-anchor="middle" fill="#1D1D1B" font-size="${pillPx.toFixed(2)}" font-weight="500" font-family="${fontFam}" style="font-feature-settings:'lnum' 1, 'tnum' 1; font-variant-numeric:lining-nums;">${colText}</text>
          </g>`;
        curX += pw + pillGapX;
        return itemSvg;
      }).join('');
    }).join('\n      ');
  }

  const footnoteSvg = fnLines.map((line, i) => {
    const fy = fnStartY + i * fnStep;
    return `<text x="${leftX}" y="${fy.toFixed(2)}" text-anchor="start" fill="#878787" font-size="${fnPx.toFixed(2)}" font-weight="500" font-family="${fontFam}">${line}</text>`;
  }).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="pf-svg" style="border-radius:2px; font-feature-settings:'lnum' 1, 'tnum' 1; font-variant-numeric:lining-nums;">
    <defs>
      <clipPath id="loc-ib-clip-${country}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
      <style>
        text { font-feature-settings: 'lnum' 1, 'tnum' 1; font-variant-numeric: lining-nums; }
      </style>
    </defs>
    <g clip-path="url(#loc-ib-clip-${country})">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#EDEDED"/>
      <!-- 외곽 테두리 (0.1mm Stroke): 그림자 대체 및 흰 배경 구획 명확화 -->
      <rect x="0.05" y="0.05" width="${(W - 0.1).toFixed(2)}" height="${(H - 0.1).toFixed(2)}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="0.1"/>
      <polygon points="${tx0},${tagY0} ${bx0},${tagY1} ${bx1},${tagY1} ${tx1},${tagY0}" fill="${pointHex}"/>
      <rect x="0" y="0" width="${W}" height="${topLine}" fill="${pointHex}"/>
      <!-- VITALBEAUTIE 워드마크 -->
      <g transform="translate(${logoTx} ${logoTy}) scale(${PT_MM * logoScale})" fill="#1D1D1B">
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
      ${titleSvg}
      ${subTitleSvg}
      ${benefitSvg}
      ${pointsSvg}
      ${footnoteSvg}
      ${ingSvg}
      ${capSvg}
      ${markSvg}
    </g>
  </svg>`;
}

export function renderLocalizedPackageSvg(parsed, country = 'KR') {
  if (parsed && parsed.logic === 'innerbeauty') {
    return renderLocalizedInnerBeautySvg(parsed, country);
  }
  const W = +(parsed.wMm || parsed.w || 70.6);
  const H = +(parsed.hMm || parsed.h || 119.9);
  const sc = getSizeClass(W);
  const isHff = (parsed.type || 'hff') === 'hff';
  const bgHex = parsed.pantoneHex || '#00843D';

  // 바이탈뷰티 로고 크기: 건강기능식품·일반식품 구분 없이 일반식품 표준 크기(43.59mm 태그)로 100% 통일
  const topLine = 1.5;
  const tagWTop = 43.59, tagWBot = 39.55, tagH = 6.47;
  const tagY0 = topLine * 0.78, tagY1 = tagY0 + tagH;
  const tx0 = (W - tagWTop) / 2, tx1 = tx0 + tagWTop;
  const bx0 = (W - tagWBot) / 2, bx1 = bx0 + tagWBot;

  const logoScale = tagWTop / (123.55 * PT_MM);
  const logoTx = tx0 - 229.93 * PT_MM * logoScale;
  const logoTy = tagY0 - 283.61 * PT_MM * logoScale;

  // 좌우 최소 2mm 마진 보장 (safeW = W - 4mm)
  const safeW = Math.max(16, W - 4);

  // 원본 국문 데이터 추출
  const rawLineName = (parsed.lineName || '메타그린').trim();
  const rawProductName = (parsed.productName || '슬림업').trim();
  const rawIngredient = (parsed.ingredient || '녹차추출물').trim();

  // 언어별 텍스트 변환
  let lineText = rawLineName;
  let prodText = rawProductName;
  let ingText = rawIngredient;

  if (country === 'US') {
    lineText = translateKoPackageText(rawLineName, 'en') || 'META GREEN';
    prodText = translateKoPackageText(rawProductName, 'en') || 'SLIM UP';
    ingText = translateKoPackageText(rawIngredient, 'en') || 'Green Tea Extract';
  } else if (country === 'JP') {
    lineText = translateKoPackageText(rawLineName, 'ja') || 'メタグリーン';
    prodText = translateKoPackageText(rawProductName, 'ja') || 'スリムアップ';
    ingText = translateKoPackageText(rawIngredient, 'ja') || '緑茶抽出物';
  }

  const fontFam = country === 'US'
    ? "'Raleway','Noto Sans KR',sans-serif"
    : country === 'JP'
      ? "'Noto Sans JP','Noto Sans CJK SC','Hiragino Kaku Gothic ProN','Meiryo',sans-serif"
      : "'VB-ShinGothic','RIX-신고딕se-pro','210 OmniGothic','Noto Sans KR',sans-serif";

  // 제품명 폰트 크기 결정 (가이드 실측: KR 26pt, US Alright Sans 21pt, JP 22pt)
  const titlePt = country === 'KR'
    ? (+parsed.krTitlePt || 26)
    : country === 'US'
      ? (+parsed.enTitlePt || 21)
      : (+parsed.jaTitlePt || 22);
  const dietaryPt = +parsed.dietaryPt || 12;

  const titlePx = titlePt * PT_MM;
  const titleStep = titlePx * 1.15;
  const gapTagName = 5.0; // Metagreen_layoutguide2.ai 기준 5.0mm 고정
  const titleStartY = tagY1 + gapTagName + titlePx * 0.84;

  // 타이틀 줄바꿈: 좌우 2mm 마진(safeW)을 넘어가면 라인명(Bold 700) 아래로 제품명(Light 300)이 내려가도록 분리
  const oneLineTitle = `${lineText} ${prodText}`.trim();
  const fitsOneLine = country === 'KR' && estimateTextWidthMm(oneLineTitle, titlePx, 1) <= safeW;
  const boldStroke = `stroke="#FFFFFF" stroke-width="${(titlePx * 0.02).toFixed(3)}" paint-order="stroke fill"`;

  let titleRows = [];
  if (fitsOneLine) {
    titleRows = [{ type: 'mixed', lineName: lineText, productName: prodText }];
  } else {
    const linePartRows = wrapSvgTextToWidth(lineText, titlePx, safeW, 1).map(t => ({
      type: 'single', text: t, weight: 700,
    }));
    const prodPartRows = wrapSvgTextToWidth(prodText, titlePx, safeW, 1).map(t => ({
      type: 'single', text: t, weight: 300,
    }));
    titleRows = [...linePartRows, ...prodPartRows];
  }

  const titleSvg = titleRows.map((row, idx) => {
    const y = titleStartY + idx * titleStep;
    if (row.type === 'mixed') {
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="#FFFFFF" font-size="${titlePx}" font-family="${fontFam}"><tspan font-weight="700" ${boldStroke}>${row.lineName}</tspan>${row.productName ? `<tspan font-weight="300"> ${row.productName}</tspan>` : ''}</text>`;
    }
    const isBold = row.weight >= 700;
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="#FFFFFF" font-size="${titlePx}" font-weight="${row.weight}" ${isBold ? boldStroke : ''} font-family="${fontFam}">${row.text}</text>`;
  }).join('\n      ');

  const titleBottomY = titleStartY + (titleRows.length - 1) * titleStep;

  // US Dietary Supplement (Bold 700) / JP 機能性表示食品 (Bold 700) — 건강기능식품(hff)일 때만 표시
  let subTitleSvg = '';
  let subBottomY = titleBottomY;

  if (country === 'US' && isHff) {
    const dPx = dietaryPt * PT_MM; // 12pt
    const dY = titleBottomY + 3.5 + dPx * 0.88; // 3.5mm 간격
    subTitleSvg = `<text x="${W / 2}" y="${dY}" text-anchor="middle" fill="#FFFFFF" font-size="${dPx}" font-weight="700" font-family="${fontFam}">Dietary Supplement</text>`;
    subBottomY = dY;
  } else if (country === 'JP' && isHff) {
    const jPx = 9.5 * PT_MM;
    const jY = titleBottomY + jPx * 0.88 + 1.5;
    subTitleSvg = `<text x="${W / 2}" y="${jY}" text-anchor="middle" fill="#FFFFFF" font-size="${jPx}" font-weight="700" font-family="${fontFam}">機能性表示食品</text>`;
    subBottomY = jY;
  }

  // 국가별 내용량(Capacity) 포맷 생성 및 좌우 2mm 마진 줄바꿈 (국가별 pt 개별 적용, 기본 10pt)
  const capPt = country === 'KR'
    ? (+parsed.krCapPt || 10)
    : country === 'US'
      ? (+parsed.usCapPt || 10)
      : (+parsed.jpCapPt || 10);
  const capPx = capPt * PT_MM;
  const capStep = capPx * 1.18;
  let rawCapLines = [];

  if (country === 'KR') {
    let krText = parsed.krCapText;
    if (!krText) {
      const krTotalG = parsed.krTotalG || '200g';
      const krUnitG = parsed.krUnitG || '20g';
      const krCount = parsed.krCount || '10';
      const krUnitType = parsed.krUnitType || '포';
      krText = `${krTotalG} [${krUnitG} X ${krCount}${krUnitType}]`;
    }
    rawCapLines = [isHff ? (krText.startsWith('건강기능식품') ? krText : `건강기능식품 ${krText}`) : krText.replace(/^건강기능식품\s*/, '')];
  } else if (country === 'US') {
    let usText = parsed.usCapText;
    if (!usText) {
      const usCount = parsed.usCount || '10';
      const usUnitType = parsed.usUnitType || 'Packets';
      const usUnitOz = parsed.usUnitOz || '0.71 oz';
      const usUnitG = parsed.usUnitG || '20 g';
      const usTotalOz = parsed.usTotalOz || '7.05 oz';
      const usTotalG = parsed.usTotalG || '200 g';
      usText = `${usCount} - ${usUnitOz} (${usUnitG}) Packet\nNet Wt. ${usTotalOz} (${usTotalG})`;
    }
    rawCapLines = usText.split('\n').map(s => s.trim()).filter(Boolean);
  } else if (country === 'JP') {
    const jpClass = parsed.jpClass || (isHff ? '保健機能食品' : '一般食品');
    const jpText = parsed.jpCapText || '75.6g (420mg × 180錠)';
    rawCapLines = [`${jpClass} ${jpText}`];
  }

  const capLines = rawCapLines.flatMap(l => wrapSvgTextToWidth(l, capPx, safeW, 1));
  const capBottomY = H - 3 - capPx * 0.2;
  const capStartY = capBottomY - (capLines.length - 1) * capStep;

  const capSvg = capLines.map((line, idx) => {
    const y = capStartY + idx * capStep;
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="#FFFFFF" font-size="${capPx}" font-weight="500" font-family="${fontFam}">${line}</text>`;
  }).join('\n      ');

  // 원재료명(건강기능식품) vs 원료명 및 함량(일반식품) — Brand Visibility 규정과 동일하게 적용
  // - 건강기능식품(isHff): 국문·일문은 제품명의 1/2 크기, 영문(US)은 10pt 고정
  // - 일반식품(!isHff): 하단 내용량 바로 위에 14pt · Medium(500) · 70% 투명도로 배치
  const ingPt = (isHff && country === 'US') ? 10.0 : (isHff ? Math.max(8, +(titlePt * 0.5).toFixed(1)) : 14);
  const ingPx = ingPt * PT_MM;
  const ingStep = ingPx * 1.2;
  const ingLines = wrapSvgTextToWidth(ingText, ingPx, safeW, 1);
  const ingWeight = isHff ? 300 : 500;
  const ingOpacity = isHff ? 1 : 0.7;

  let ingStartY;
  if (isHff) {
    const gapBelowSub = country === 'KR' ? 3.0 : 1.4;
    ingStartY = subBottomY + gapBelowSub + ingPx * 0.85;
  } else {
    const capTopY = capStartY - capPx * 0.85;
    const ingBlockH = (ingLines.length - 1) * ingStep;
    ingStartY = capTopY - 2.8 - ingBlockH;
  }

  const ingSvg = ingLines.map((line, idx) => {
    const y = ingStartY + idx * ingStep;
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="#FFFFFF" opacity="${ingOpacity}" font-size="${ingPx}" font-weight="${ingWeight}" font-family="${fontFam}">${line}</text>`;
  }).join('\n      ');

  // 건강기능식품 15mm 마크: Layout Proposal과 동일하게 내용량 문구 바로 위 오른쪽 배치 (KR 전용)
  let markSvg = '';
  if (country === 'KR' && isHff) {
    const markSize = 15;
    const markX = +(W - 2.0 - markSize).toFixed(2);
    const markY = +((capStartY - capPx * 0.85) - 2.0 - markSize).toFixed(2);
    markSvg = getHffMarkSvg(markX, markY, markSize, 0.55);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="pf-svg" style="border-radius:2px; font-feature-settings:'lnum' 1, 'tnum' 1; font-variant-numeric:lining-nums;">
    <defs>
      <clipPath id="loc-clip-${country}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
      <style>
        text { font-feature-settings: 'lnum' 1, 'tnum' 1; font-variant-numeric: lining-nums; }
      </style>
    </defs>
    <g clip-path="url(#loc-clip-${country})">
      <rect x="0" y="0" width="${W}" height="${H}" fill="${bgHex}"/>
      <!-- 외곽 테두리 (0.1mm Stroke): 그림자 대체 및 흰 배경 구획 명확화 -->
      <rect x="0.05" y="0.05" width="${(W - 0.1).toFixed(2)}" height="${(H - 0.1).toFixed(2)}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="0.1"/>
      <polygon points="${tx0},${tagY0} ${bx0},${tagY1} ${bx1},${tagY1} ${tx1},${tagY0}" fill="#CEDC00"/>
      <rect x="0" y="0" width="${W}" height="${topLine}" fill="#CEDC00"/>
      <!-- VITALBEAUTIE 워드마크 -->
      <g transform="translate(${logoTx} ${logoTy}) scale(${PT_MM * logoScale})" fill="#1D1D1B">
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
      ${titleSvg}
      ${subTitleSvg}
      ${ingSvg}
      ${markSvg}
      ${capSvg}
    </g>
  </svg>`;
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
  '230C': { hex: '#F6B9D4', name: '슈퍼콜라겐 시그니처 핑크' },
  '394C': { hex: '#EAF044', name: '슈퍼레티놀 레몬옐로우' },
  '3945C': { hex: '#FFF600', name: '슈퍼레티놀 포인트 옐로우' },
  '353C': { hex: '#AAD196', name: '슈퍼시카B5 민트그린' },
  '2645C': { hex: '#B89FD5', name: '슈퍼 바이오틱스 라벤더' },
  '2345C': { hex: '#EB5B56', name: '슈퍼콜라겐 PDRN 코랄레드' },
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

  // 0) 한글/영문 통용 컬러명 직접 입력 시 (레몬색, 연두색, 연한 핑크, 핫핑크, 연보라, 하늘색, 네온옐로우 등)
  const normRaw = s.toLowerCase().trim();
  const cleanTerm = normRaw
    .replace(/^pantone\s+/i, '')
    .replace(/색상$|색$|color$|colour$/i, '')
    .replace(/\s+/g, '');

  const COMMON_NAMED_COLORS = {
    // 화이트 / 블랙
    white: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    w: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    wh: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    whitec: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    화이트: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    흰: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    흰색: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    백색: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    하양: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    하얀: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    순백: { code: 'WHITE', shortCode: 'WHITE', hex: '#FFFFFF', name: '화이트 (White)' },
    black: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },
    bk: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },
    blk: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },
    blackc: { code: 'PANTONE Black C', shortCode: 'Black C', hex: '#1D1D1B', name: '블랙 (Black)' },
    블랙: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },
    검정: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },
    검은: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },
    흑색: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },
    먹: { code: 'BLACK', shortCode: 'BLACK', hex: '#1D1D1B', name: '블랙 (Black)' },

    // 레몬 / 네온 옐로우 / 옐로우
    lemon: { code: 'PANTONE 394C', shortCode: '394C', hex: '#FFF44F', name: '레몬 (Lemon Yellow)' },
    레몬: { code: 'PANTONE 394C', shortCode: '394C', hex: '#FFF44F', name: '레몬 (Lemon Yellow)' },
    연노랑: { code: 'PANTONE 100C', shortCode: '100C', hex: '#FFF88A', name: '연노랑 (Pale Yellow)' },
    연한노랑: { code: 'PANTONE 100C', shortCode: '100C', hex: '#FFF88A', name: '연한 노랑 (Light Yellow)' },
    라이트옐로우: { code: 'PANTONE 100C', shortCode: '100C', hex: '#FFF88A', name: '라이트 옐로우' },
    lightyellow: { code: 'PANTONE 100C', shortCode: '100C', hex: '#FFF88A', name: 'Light Yellow' },
    paleyellow: { code: 'PANTONE 100C', shortCode: '100C', hex: '#FFF88A', name: 'Pale Yellow' },
    neonyellow: { code: 'PANTONE 3945C', shortCode: '3945C', hex: '#FFF600', name: '네온 옐로우 (Neon Yellow)' },
    fluoyellow: { code: 'PANTONE 3945C', shortCode: '3945C', hex: '#FFF600', name: '형광 옐로우' },
    네온옐로우: { code: 'PANTONE 3945C', shortCode: '3945C', hex: '#FFF600', name: '네온 옐로우 (Neon Yellow)' },
    형광노랑: { code: 'PANTONE 3945C', shortCode: '3945C', hex: '#FFF600', name: '형광 노랑' },
    형광옐로우: { code: 'PANTONE 3945C', shortCode: '3945C', hex: '#FFF600', name: '형광 옐로우' },
    yellow: { code: 'PANTONE 109C', shortCode: '109C', hex: '#FFD100', name: '옐로우 (Yellow)' },
    옐로우: { code: 'PANTONE 109C', shortCode: '109C', hex: '#FFD100', name: '옐로우 (Yellow)' },
    노랑: { code: 'PANTONE 109C', shortCode: '109C', hex: '#FFD100', name: '옐로우 (Yellow)' },
    진노랑: { code: 'PANTONE 1235C', shortCode: '1235C', hex: '#FFB81C', name: '진노랑 (Deep Yellow)' },
    진한노랑: { code: 'PANTONE 1235C', shortCode: '1235C', hex: '#FFB81C', name: '진한 노랑' },
    deepyellow: { code: 'PANTONE 1235C', shortCode: '1235C', hex: '#FFB81C', name: 'Deep Yellow' },
    darkyellow: { code: 'PANTONE 1235C', shortCode: '1235C', hex: '#FFB81C', name: 'Dark Yellow' },
    머스타드: { code: 'PANTONE 124C', shortCode: '124C', hex: '#EAAA00', name: '머스타드 (Mustard)' },
    mustard: { code: 'PANTONE 124C', shortCode: '124C', hex: '#EAAA00', name: 'Mustard' },
    겨자: { code: 'PANTONE 124C', shortCode: '124C', hex: '#EAAA00', name: '겨자 (Mustard)' },

    // 연두 / 라임 / 그린
    연두: { code: 'PANTONE 2270C', shortCode: '2270C', hex: '#8EE53F', name: '연두 (Yellow Green)' },
    연한연두: { code: 'PANTONE 2267C', shortCode: '2267C', hex: '#B8F274', name: '연한 연두 (Pale Green)' },
    연연두: { code: 'PANTONE 2267C', shortCode: '2267C', hex: '#B8F274', name: '연연두' },
    진연두: { code: 'PANTONE 376C', shortCode: '376C', hex: '#70BD00', name: '진한 연두' },
    진한연두: { code: 'PANTONE 376C', shortCode: '376C', hex: '#70BD00', name: '진한 연두' },
    yellowgreen: { code: 'PANTONE 2270C', shortCode: '2270C', hex: '#8EE53F', name: 'Yellow Green' },
    lightgreen: { code: 'PANTONE 2270C', shortCode: '2270C', hex: '#8EE53F', name: 'Light Green' },
    chartreuse: { code: 'PANTONE 389C', shortCode: '389C', hex: '#CEDC00', name: 'Chartreuse' },
    라임: { code: 'PANTONE 389C', shortCode: '389C', hex: '#CEDC00', name: '라임 (Lime)' },
    lime: { code: 'PANTONE 389C', shortCode: '389C', hex: '#CEDC00', name: 'Lime' },
    네온그린: { code: 'PANTONE 802C', shortCode: '802C', hex: '#44D62C', name: '네온 그린 (Neon Green)' },
    neongreen: { code: 'PANTONE 802C', shortCode: '802C', hex: '#44D62C', name: 'Neon Green' },
    형광연두: { code: 'PANTONE 802C', shortCode: '802C', hex: '#44D62C', name: '형광 연두' },
    형광초록: { code: 'PANTONE 802C', shortCode: '802C', hex: '#44D62C', name: '형광 초록' },
    green: { code: 'PANTONE 348C', shortCode: '348C', hex: '#00843D', name: '메타그린 대표 그린 (Green)' },
    그린: { code: 'PANTONE 348C', shortCode: '348C', hex: '#00843D', name: '그린 (Green)' },
    초록: { code: 'PANTONE 348C', shortCode: '348C', hex: '#00843D', name: '초록 (Green)' },
    연초록: { code: 'PANTONE 3546C', shortCode: '3546C', hex: '#39B54A', name: '연초록 (Light Green)' },
    진초록: { code: 'PANTONE 3435C', shortCode: '3435C', hex: '#004724', name: '진초록 (Dark Green)' },
    진한초록: { code: 'PANTONE 3435C', shortCode: '3435C', hex: '#004724', name: '진한 초록' },
    darkgreen: { code: 'PANTONE 3435C', shortCode: '3435C', hex: '#004724', name: 'Dark Green' },
    deepgreen: { code: 'PANTONE 3435C', shortCode: '3435C', hex: '#004724', name: 'Deep Green' },
    포레스트그린: { code: 'PANTONE 3435C', shortCode: '3435C', hex: '#004724', name: '포레스트 그린' },
    민트: { code: 'PANTONE 353C', shortCode: '353C', hex: '#AAD196', name: '슈퍼시카 민트 (Mint)' },
    mint: { code: 'PANTONE 353C', shortCode: '353C', hex: '#AAD196', name: 'Mint' },
    mintgreen: { code: 'PANTONE 353C', shortCode: '353C', hex: '#AAD196', name: 'Mint Green' },
    올리브: { code: 'PANTONE 5753C', shortCode: '5753C', hex: '#5B6734', name: '올리브 (Olive)' },
    olive: { code: 'PANTONE 5753C', shortCode: '5753C', hex: '#5B6734', name: 'Olive' },
    카키: { code: 'PANTONE 5753C', shortCode: '5753C', hex: '#5B6734', name: '카키 (Khaki)' },
    khaki: { code: 'PANTONE 5753C', shortCode: '5753C', hex: '#5B6734', name: 'Khaki' },

    // 핑크 (연핑크, 핫핑크, 진한 핑크, 코랄, 피치)
    연핑크: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: '슈퍼콜라겐 연핑크 (Light Pink)' },
    연한핑크: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: '연한 핑크 (Light Pink)' },
    연분홍: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: '연분홍 (Light Pink)' },
    연한분홍: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: '연한 분홍 (Light Pink)' },
    베이비핑크: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: '베이비 핑크 (Baby Pink)' },
    lightpink: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: 'Light Pink' },
    palepink: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: 'Pale Pink' },
    softpink: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: 'Soft Pink' },
    babypink: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6B9D4', name: 'Baby Pink' },
    pink: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6A9C5', name: '핑크 (Pink)' },
    핑크: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6A9C5', name: '핑크 (Pink)' },
    분홍: { code: 'PANTONE 230C', shortCode: '230C', hex: '#F6A9C5', name: '분홍 (Pink)' },
    핫핑크: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: '핫핑크 (Hot Pink)' },
    진핑크: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: '진핑크 (Deep Pink)' },
    진한핑크: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: '진한 핑크 (Deep Pink)' },
    진한분홍: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: '진한 분홍' },
    진분홍: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: '진분홍' },
    hotpink: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: 'Hot Pink' },
    deeppink: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: 'Deep Pink' },
    darkpink: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: 'Dark Pink' },
    vividpink: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: 'Vivid Pink' },
    마젠타: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: '마젠타 (Magenta)' },
    magenta: { code: 'PANTONE 213C', shortCode: '213C', hex: '#E31C79', name: 'Magenta' },
    코랄: { code: 'PANTONE 2345C', shortCode: '2345C', hex: '#EB5B56', name: '코랄 (Coral)' },
    coral: { code: 'PANTONE 2345C', shortCode: '2345C', hex: '#EB5B56', name: 'Coral' },
    연코랄: { code: 'PANTONE 1765C', shortCode: '1765C', hex: '#FF9994', name: '연코랄 (Light Coral)' },
    살구: { code: 'PANTONE 1555C', shortCode: '1555C', hex: '#F5C1A2', name: '살구 (Apricot)' },
    피치: { code: 'PANTONE 1555C', shortCode: '1555C', hex: '#F5C1A2', name: '피치 (Peach)' },
    peach: { code: 'PANTONE 1555C', shortCode: '1555C', hex: '#F5C1A2', name: 'Peach' },
    apricot: { code: 'PANTONE 1555C', shortCode: '1555C', hex: '#F5C1A2', name: 'Apricot' },

    // 보라 / 라벤더
    연보라: { code: 'PANTONE 2645C', shortCode: '2645C', hex: '#B89FD5', name: '연보라 (Lavender)' },
    연한보라: { code: 'PANTONE 2645C', shortCode: '2645C', hex: '#B89FD5', name: '연한 보라 (Light Purple)' },
    라벤더: { code: 'PANTONE 2645C', shortCode: '2645C', hex: '#B89FD5', name: '라벤더 (Lavender)' },
    lavender: { code: 'PANTONE 2645C', shortCode: '2645C', hex: '#B89FD5', name: 'Lavender' },
    lilac: { code: 'PANTONE 2645C', shortCode: '2645C', hex: '#B89FD5', name: 'Lilac' },
    lightpurple: { code: 'PANTONE 2645C', shortCode: '2645C', hex: '#B89FD5', name: 'Light Purple' },
    palepurple: { code: 'PANTONE 2645C', shortCode: '2645C', hex: '#B89FD5', name: 'Pale Purple' },
    purple: { code: 'PANTONE 266C', shortCode: '266C', hex: '#6B3FA0', name: '퍼플 (Purple)' },
    퍼플: { code: 'PANTONE 266C', shortCode: '266C', hex: '#6B3FA0', name: '퍼플 (Purple)' },
    보라: { code: 'PANTONE 266C', shortCode: '266C', hex: '#6B3FA0', name: '보라 (Purple)' },
    violet: { code: 'PANTONE 266C', shortCode: '266C', hex: '#6B3FA0', name: 'Violet' },
    바이올렛: { code: 'PANTONE 266C', shortCode: '266C', hex: '#6B3FA0', name: '바이올렛 (Violet)' },
    진보라: { code: 'PANTONE 273C', shortCode: '273C', hex: '#371870', name: '진보라 (Deep Purple)' },
    진한보라: { code: 'PANTONE 273C', shortCode: '273C', hex: '#371870', name: '진한 보라' },
    deeppurple: { code: 'PANTONE 273C', shortCode: '273C', hex: '#371870', name: 'Deep Purple' },
    darkpurple: { code: 'PANTONE 273C', shortCode: '273C', hex: '#371870', name: 'Dark Purple' },

    // 하늘 / 블루 / 네이비
    하늘: { code: 'PANTONE 2915C', shortCode: '2915C', hex: '#75C5F0', name: '하늘색 (Sky Blue)' },
    하늘색: { code: 'PANTONE 2915C', shortCode: '2915C', hex: '#75C5F0', name: '하늘색 (Sky Blue)' },
    연하늘: { code: 'PANTONE 290C', shortCode: '290C', hex: '#B9D9EB', name: '연하늘 (Pale Sky Blue)' },
    연한하늘: { code: 'PANTONE 290C', shortCode: '290C', hex: '#B9D9EB', name: '연한 하늘색' },
    스카이블루: { code: 'PANTONE 2915C', shortCode: '2915C', hex: '#75C5F0', name: '스카이 블루 (Sky Blue)' },
    skyblue: { code: 'PANTONE 2915C', shortCode: '2915C', hex: '#75C5F0', name: 'Sky Blue' },
    lightblue: { code: 'PANTONE 2915C', shortCode: '2915C', hex: '#75C5F0', name: 'Light Blue' },
    palesky: { code: 'PANTONE 290C', shortCode: '290C', hex: '#B9D9EB', name: 'Pale Sky' },
    연파랑: { code: 'PANTONE 2915C', shortCode: '2915C', hex: '#75C5F0', name: '연파랑 (Light Blue)' },
    연한파랑: { code: 'PANTONE 2915C', shortCode: '2915C', hex: '#75C5F0', name: '연한 파랑' },
    blue: { code: 'PANTONE 2935C', shortCode: '2935C', hex: '#0057B8', name: '블루 (Blue)' },
    블루: { code: 'PANTONE 2935C', shortCode: '2935C', hex: '#0057B8', name: '블루 (Blue)' },
    파랑: { code: 'PANTONE 2935C', shortCode: '2935C', hex: '#0057B8', name: '파랑 (Blue)' },
    청색: { code: 'PANTONE 2935C', shortCode: '2935C', hex: '#0057B8', name: '청색 (Blue)' },
    진파랑: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: '진파랑 (Deep Blue)' },
    진한파랑: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: '진한 파랑' },
    darkblue: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: 'Dark Blue' },
    deepblue: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: 'Deep Blue' },
    네이비: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: '네이비 (Navy)' },
    navy: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: 'Navy' },
    딥네이비: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: '딥 네이비 (Deep Navy)' },
    남색: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: '남색 (Navy)' },
    곤색: { code: 'PANTONE 294C', shortCode: '294C', hex: '#002F6C', name: '곤색 (Navy)' },
    청록: { code: 'PANTONE 326C', shortCode: '326C', hex: '#00A896', name: '청록 (Teal)' },
    teal: { code: 'PANTONE 326C', shortCode: '326C', hex: '#00A896', name: 'Teal' },
    터콰이즈: { code: 'PANTONE 326C', shortCode: '326C', hex: '#00A896', name: '터콰이즈 (Turquoise)' },
    turquoise: { code: 'PANTONE 326C', shortCode: '326C', hex: '#00A896', name: 'Turquoise' },

    // 오렌지 / 주황 / 레드
    orange: { code: 'PANTONE 1585C', shortCode: '1585C', hex: '#FF6A13', name: '오렌지 (Orange)' },
    오렌지: { code: 'PANTONE 1585C', shortCode: '1585C', hex: '#FF6A13', name: '오렌지 (Orange)' },
    주황: { code: 'PANTONE 1585C', shortCode: '1585C', hex: '#FF6A13', name: '주황 (Orange)' },
    연주황: { code: 'PANTONE 1555C', shortCode: '1555C', hex: '#F5C1A2', name: '연주황 (Light Orange)' },
    연한주황: { code: 'PANTONE 1555C', shortCode: '1555C', hex: '#F5C1A2', name: '연한 주황' },
    lightorange: { code: 'PANTONE 1555C', shortCode: '1555C', hex: '#F5C1A2', name: 'Light Orange' },
    진주황: { code: 'PANTONE 165C', shortCode: '165C', hex: '#FF4D00', name: '진주황 (Deep Orange)' },
    진한주황: { code: 'PANTONE 165C', shortCode: '165C', hex: '#FF4D00', name: '진한 주황' },
    deeporange: { code: 'PANTONE 165C', shortCode: '165C', hex: '#FF4D00', name: 'Deep Orange' },
    red: { code: 'RED', shortCode: 'RED', hex: '#E02020', name: '레드 (Red)' },
    레드: { code: 'RED', shortCode: 'RED', hex: '#E02020', name: '레드 (Red)' },
    빨강: { code: 'RED', shortCode: 'RED', hex: '#E02020', name: '빨강 (Red)' },
    빨간: { code: 'RED', shortCode: 'RED', hex: '#E02020', name: '빨간 (Red)' },
    연빨강: { code: 'PANTONE 1785C', shortCode: '1785C', hex: '#FF5C67', name: '연빨강 (Light Red)' },
    연한빨강: { code: 'PANTONE 1785C', shortCode: '1785C', hex: '#FF5C67', name: '연한 빨강' },
    lightred: { code: 'PANTONE 1785C', shortCode: '1785C', hex: '#FF5C67', name: 'Light Red' },
    진빨강: { code: 'PANTONE 200C', shortCode: '200C', hex: '#BA0C2F', name: '진빨강 (Dark Red)' },
    진한빨강: { code: 'PANTONE 200C', shortCode: '200C', hex: '#BA0C2F', name: '진한 빨강' },
    darkred: { code: 'PANTONE 200C', shortCode: '200C', hex: '#BA0C2F', name: 'Dark Red' },
    deepred: { code: 'PANTONE 200C', shortCode: '200C', hex: '#BA0C2F', name: 'Deep Red' },
    버건디: { code: 'PANTONE 207C', shortCode: '207C', hex: '#A6192E', name: '버건디 (Burgundy)' },
    burgundy: { code: 'PANTONE 207C', shortCode: '207C', hex: '#A6192E', name: 'Burgundy' },
    와인: { code: 'PANTONE 207C', shortCode: '207C', hex: '#A6192E', name: '와인 (Wine)' },
    wine: { code: 'PANTONE 207C', shortCode: '207C', hex: '#A6192E', name: 'Wine' },

    // 브라운 / 베이지 / 아이보리 / 그레이
    brown: { code: 'PANTONE 4625C', shortCode: '4625C', hex: '#4F2C1D', name: '브라운 (Brown)' },
    브라운: { code: 'PANTONE 4625C', shortCode: '4625C', hex: '#4F2C1D', name: '브라운 (Brown)' },
    갈색: { code: 'PANTONE 4625C', shortCode: '4625C', hex: '#4F2C1D', name: '갈색 (Brown)' },
    초코: { code: 'PANTONE 4625C', shortCode: '4625C', hex: '#4F2C1D', name: '초콜릿 (Chocolate)' },
    chocolate: { code: 'PANTONE 4625C', shortCode: '4625C', hex: '#4F2C1D', name: 'Chocolate' },
    베이지: { code: 'PANTONE 7527C', shortCode: '7527C', hex: '#D6D2C4', name: '베이지 (Beige)' },
    beige: { code: 'PANTONE 7527C', shortCode: '7527C', hex: '#D6D2C4', name: 'Beige' },
    아이보리: { code: 'IVORY', shortCode: 'IVORY', hex: '#FFFFF0', name: '아이보리 (Ivory)' },
    ivory: { code: 'IVORY', shortCode: 'IVORY', hex: '#FFFFF0', name: 'Ivory' },
    크림: { code: 'CREAM', shortCode: 'CREAM', hex: '#FFFDD0', name: '크림 (Cream)' },
    cream: { code: 'CREAM', shortCode: 'CREAM', hex: '#FFFDD0', name: 'Cream' },
    gray: { code: 'GRAY', shortCode: 'GRAY', hex: '#8C929A', name: '그레이 (Gray)' },
    grey: { code: 'GRAY', shortCode: 'GRAY', hex: '#8C929A', name: '그레이 (Gray)' },
    그레이: { code: 'GRAY', shortCode: 'GRAY', hex: '#8C929A', name: '그레이 (Gray)' },
    회색: { code: 'GRAY', shortCode: 'GRAY', hex: '#8C929A', name: '그레이 (Gray)' },
    연회색: { code: 'LIGHT GRAY', shortCode: 'LIGHT GRAY', hex: '#D1D5DB', name: '연회색 (Light Gray)' },
    밝은회색: { code: 'LIGHT GRAY', shortCode: 'LIGHT GRAY', hex: '#D1D5DB', name: '밝은 회색' },
    lightgray: { code: 'LIGHT GRAY', shortCode: 'LIGHT GRAY', hex: '#D1D5DB', name: 'Light Gray' },
    lightgrey: { code: 'LIGHT GRAY', shortCode: 'LIGHT GRAY', hex: '#D1D5DB', name: 'Light Grey' },
    진회색: { code: 'DARK GRAY', shortCode: 'DARK GRAY', hex: '#4B5563', name: '진회색 (Dark Gray)' },
    어두운회색: { code: 'DARK GRAY', shortCode: 'DARK GRAY', hex: '#4B5563', name: '어두운 회색' },
    darkgray: { code: 'DARK GRAY', shortCode: 'DARK GRAY', hex: '#4B5563', name: 'Dark Gray' },
    darkgrey: { code: 'DARK GRAY', shortCode: 'DARK GRAY', hex: '#4B5563', name: 'Dark Grey' },
    차콜: { code: 'CHARCOAL', shortCode: 'CHARCOAL', hex: '#374151', name: '차콜 (Charcoal)' },
    charcoal: { code: 'CHARCOAL', shortCode: 'CHARCOAL', hex: '#374151', name: 'Charcoal' },
    쥐색: { code: 'CHARCOAL', shortCode: 'CHARCOAL', hex: '#374151', name: '쥐색 (Charcoal)' },
    gold: { code: 'PANTONE 871C', shortCode: '871C', hex: '#B4975A', name: '골드 (Gold)' },
    골드: { code: 'PANTONE 871C', shortCode: '871C', hex: '#B4975A', name: '골드 (Gold)' },
    금: { code: 'PANTONE 871C', shortCode: '871C', hex: '#B4975A', name: '금색 (Gold)' },
    silver: { code: 'SILVER', shortCode: 'SILVER', hex: '#C0C0C0', name: '실버 (Silver)' },
    실버: { code: 'SILVER', shortCode: 'SILVER', hex: '#C0C0C0', name: '실버 (Silver)' },
    은: { code: 'SILVER', shortCode: 'SILVER', hex: '#C0C0C0', name: '은색 (Silver)' },
  };

  // 1) 정확한 컬러명 매핑 확인
  if (COMMON_NAMED_COLORS[cleanTerm]) {
    return COMMON_NAMED_COLORS[cleanTerm];
  }

  // 2) 수식어(연한, 진한, 핫, 네온, 라이트, 다크 등) 분해 매핑
  const isLight = /^(연한|연|밝은|라이트|light|pale|soft)/i.test(cleanTerm);
  const isDark = /^(진한|진|어두운|다크|딥|dark|deep)/i.test(cleanTerm);
  const isHot = /^(핫|비비드|hot|vivid)/i.test(cleanTerm);
  const isNeon = /^(네온|형광|neon|fluo)/i.test(cleanTerm);

  const baseTerm = cleanTerm
    .replace(/^(연한|연|밝은|라이트|진한|진|어두운|다크|딥|핫|비비드|네온|형광|light|pale|soft|dark|deep|hot|vivid|neon|fluo)/i, '')
    .trim();

  if (baseTerm && COMMON_NAMED_COLORS[baseTerm]) {
    const baseObj = COMMON_NAMED_COLORS[baseTerm];
    if (isNeon || isHot) {
      if (COMMON_NAMED_COLORS[`네온${baseTerm}`]) return COMMON_NAMED_COLORS[`네온${baseTerm}`];
      if (COMMON_NAMED_COLORS[`핫${baseTerm}`]) return COMMON_NAMED_COLORS[`핫${baseTerm}`];
    }
    if (isLight) {
      if (COMMON_NAMED_COLORS[`연한${baseTerm}`]) return COMMON_NAMED_COLORS[`연한${baseTerm}`];
      if (COMMON_NAMED_COLORS[`연${baseTerm}`]) return COMMON_NAMED_COLORS[`연${baseTerm}`];
      if (COMMON_NAMED_COLORS[`라이트${baseTerm}`]) return COMMON_NAMED_COLORS[`라이트${baseTerm}`];
    }
    if (isDark) {
      if (COMMON_NAMED_COLORS[`진한${baseTerm}`]) return COMMON_NAMED_COLORS[`진한${baseTerm}`];
      if (COMMON_NAMED_COLORS[`진${baseTerm}`]) return COMMON_NAMED_COLORS[`진${baseTerm}`];
      if (COMMON_NAMED_COLORS[`다크${baseTerm}`]) return COMMON_NAMED_COLORS[`다크${baseTerm}`];
    }
    return baseObj;
  }

  // 1) 직접 #HEX 입력 시 (6자리 또는 #포함 3자리)
  if (/^#?[0-9A-F]{6}$/i.test(s)) {
    const hex = (s.startsWith('#') ? s : '#' + s).toUpperCase();
    return { code: hex, shortCode: hex, hex, name: '사용자 HEX 지정' };
  }
  if (/^#[0-9A-F]{3}$/i.test(s) || /^(fff|000)$/i.test(s)) {
    const raw3 = s.replace(/^#/, '');
    const hex = ('#' + raw3[0] + raw3[0] + raw3[1] + raw3[1] + raw3[2] + raw3[2]).toUpperCase();
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

function renderPopHeaderSvg(W, pop, showGuides = false, dimLine = null, calloutL = null) {
  if (!pop || !pop.enabled) return { popH: 0, popSvg: '', popGuides: '' };
  const popH = Math.max(10, +pop.h || 35);
  const bgHex = pop.bgHex || '#CEDC00';
  const popMargin = 2.0; // POP 양쪽 마진 2mm 고정
  const popTopR = 1.0;   // POP 맨 위 꼭지점 두 곳 R=1mm 적용
  const safePopW = Math.max(16, W - popMargin * 2);

  const getFontFam = fontKey =>
    fontKey === 'omni'
      ? "'VB-OmniGothic','210 옴니고딕','210 OmniGothic','OmniGothic',sans-serif"
      : "'VB-ShinGothic','RIX-신고딕se-pro','RIX-신고딕',sans-serif";
  const getFontLabel = fontKey => (fontKey === 'omni' ? '옴니고딕' : '신고딕');

  const rows = [];
  if (pop.line1Text && pop.line1Text.trim()) {
    const pt1 = Math.max(6, +pop.line1Pt || 14);
    const px1 = pt1 * PT_MM;
    const fKey1 = pop.line1Font || 'shingo';
    const fam1 = getFontFam(fKey1);
    const w1 = +(pop.line1Weight || 700);
    const col1 = pop.line1Color || '#1D1D1B';
    const wrapped1 = wrapSvgTextToWidth(pop.line1Text.trim(), px1, safePopW, 1);
    wrapped1.forEach((txt, idx) => {
      rows.push({
        text: txt,
        pt: pt1,
        px: px1,
        fontKey: fKey1,
        fam: fam1,
        fontLabel: getFontLabel(fKey1),
        weight: w1,
        color: col1,
        isFirstOfGroup: idx === 0,
        groupIdx: 1,
      });
    });
  }
  if (pop.line2Text && pop.line2Text.trim()) {
    const pt2 = Math.max(6, +pop.line2Pt || 18);
    const px2 = pt2 * PT_MM;
    const fKey2 = pop.line2Font || 'shingo';
    const fam2 = getFontFam(fKey2);
    const w2 = +(pop.line2Weight || 700);
    const col2 = pop.line2Color || '#00843D';
    const wrapped2 = wrapSvgTextToWidth(pop.line2Text.trim(), px2, safePopW, 1);
    wrapped2.forEach((txt, idx) => {
      rows.push({
        text: txt,
        pt: pt2,
        px: px2,
        fontKey: fKey2,
        fam: fam2,
        fontLabel: getFontLabel(fKey2),
        weight: w2,
        color: col2,
        isFirstOfGroup: idx === 0,
        groupIdx: 2,
      });
    });
  }

  // Compute vertical positions centered inside [-popH, 0] with natural default line-height
  let totalTextH = 0;
  const rowGaps = [];
  rows.forEach((r, i) => {
    const capH = r.px * 0.78;
    totalTextH += capH;
    if (i < rows.length - 1) {
      const next = rows[i + 1];
      // 기본 타이포그래피 행간(line-height ~1.2) 적용: 과도하게 벌어지지 않는 기본 간격
      const gap = Math.max(1.0, (r.px + next.px) * 0.10);
      rowGaps.push(gap);
      totalTextH += gap;
    }
  });

  let curTopY = -popH / 2 - totalTextH / 2;
  const textEls = [];
  const calloutEls = [];

  rows.forEach((r, i) => {
    const capH = r.px * 0.78;
    const baselineY = curTopY + capH;
    textEls.push(
      `<text x="${(W / 2).toFixed(2)}" y="${baselineY.toFixed(2)}" text-anchor="middle" fill="${r.color}" font-size="${r.px.toFixed(2)}" font-weight="${r.weight}" font-family="${r.fam}">${r.text}</text>`
    );
    if (showGuides && calloutL && r.isFirstOfGroup) {
      const wName = r.weight >= 700 ? 'Bold' : r.weight >= 500 ? 'Medium' : 'Light';
      calloutEls.push(
        calloutL(baselineY - r.px * 0.3, popMargin, [
          `POP ${r.groupIdx === 1 ? '윗줄' : '아랫줄'} ${r.fontLabel}`,
          `${wName} ${r.pt}pt`,
        ])
      );
    }
    curTopY = baselineY + (rowGaps[i] || 0);
  });

  // POP 외곽 패스: 상단 좌·우 꼭지점 두 곳만 R=1mm 적용, 하단 좌·우 꼭지점은 직각(0mm)
  const k = +(popTopR * 0.55228475).toFixed(4);
  const topY = -popH;
  const popPathD = `M 0 0 L 0 ${(topY + popTopR).toFixed(2)} C 0 ${(topY + popTopR - k).toFixed(4)} ${k} ${topY.toFixed(2)} ${popTopR.toFixed(2)} ${topY.toFixed(2)} L ${(W - popTopR).toFixed(2)} ${topY.toFixed(2)} C ${(W - popTopR + k).toFixed(4)} ${topY.toFixed(2)} ${W} ${(topY + popTopR - k).toFixed(4)} ${W} ${(topY + popTopR).toFixed(2)} L ${W} 0 Z`;

  const popSvg = `
    <g id="pf-pop-header">
      <path d="${popPathD}" fill="${bgHex}"/>
      ${textEls.join('\n      ')}
      <path d="${popPathD}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="0.25"/>
      <line x1="0" y1="0" x2="${W}" y2="0" stroke="rgba(0,0,0,0.28)" stroke-width="0.25" stroke-dasharray="1.2 0.8"/>
    </g>`;

  const popGuides = !showGuides
    ? ''
    : `
      ${dimLine ? dimLine(W + 2, -popH, 0, `POP ${popH}mm`) : ''}
      <line x1="${popMargin}" y1="${(-popH).toFixed(2)}" x2="${popMargin}" y2="0" stroke="#E52421" stroke-width="0.16" stroke-dasharray="0.8 0.8"/>
      <line x1="${(W - popMargin).toFixed(2)}" y1="${(-popH).toFixed(2)}" x2="${(W - popMargin).toFixed(2)}" y2="0" stroke="#E52421" stroke-width="0.16" stroke-dasharray="0.8 0.8"/>
      <text x="${(W - 1).toFixed(2)}" y="${(-popH - 1.2).toFixed(2)}" text-anchor="end" fill="#E52421" font-size="2.1" font-family="sans-serif">상단 R1mm · 좌우 마진 2mm</text>
      ${calloutEls.join('')}`;

  return { popH, popSvg, popGuides };
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

  // 하단 표기 문안(용량/내용량)은 항상 하단에서 3mm 기준선 고정 & 단상자 정중앙(W / 2) 정렬
  const capPx = s.capPt * PT_MM;
  const capLineStep = capPx * 1.22;
  const markSize = s.type === 'hff' ? (s.markMm || 15) : 0;
  const markX = W - TYPO.sideSafe - markSize;
  const capText = (s.type === 'hff' && s.capPrefix ? '건강기능식품  ' : '') + s.capacity;
  const capX = W / 2; // 중앙 정렬 1순위 고정

  // 하단 3mm 기준선 고정 (문안 위치는 하단 3mm 불변)
  const capBottomY = H - s.bottomMargin - capPx * 0.2;

  // 내용량 텍스트 길이 추정 (장평 capScale 반영)
  const approxCapW = capText.length * capPx * 0.58 * (s.capScale / 100);

  // 문안이 짧을 때는 하단 우측 15mm 마크와 간섭되지 않으므로 마크를 피해서 wrap,
  // 문안이 길어서 넘어갈 때는 마크가 문안 위로 이동하므로 전체 safeW 폭을 활용하여 한 줄로 여유 있게 배치
  const doesFitBesideMark = markSize === 0 || ((W / 2) + (approxCapW / 2) <= markX - 1.5);
  const capMaxW = doesFitBesideMark ? Math.max(16, (markX - 1.5 - W / 2) * 2) : safeW;
  const capLines = wrapSvgTextToWidth(capText, capPx, capMaxW, s.capScale / 100);
  const capStartY = capBottomY - (capLines.length - 1) * capLineStep;

  // 건강기능식품 15mm 마크 배치:
  // - 문안이 짧을 때: 하단 3mm 기준선에 배치 (H - bottomMargin - markSize)
  // - 문안이 넘어갈 때: 문안 위쪽으로 마크 배치 (capStartY - markSize - 2.5mm)
  const isOverflowing = !doesFitBesideMark || ((W / 2) + (approxCapW / 2) > markX - 1.5);
  const markY = isOverflowing
    ? Math.max(capStartY - markSize - 2.5, H * 0.65)
    : (H - s.bottomMargin - markSize);

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

  // 빨간 치수선 ON/OFF 시에도 단상자 렌더링 크기 및 뷰포트 비율이 100% 동일하게 유지되도록 패딩 고정
  const padL = 26;
  const padR = 24;
  const padT = 5;
  const padB = 5;
  const dimLine = (x, y1, y2, label) => `
    <g stroke="#E52421" stroke-width="0.22" fill="none">
      <path d="M${x},${y1} h1.2 v${Math.max(y2 - y1, 0.4)} h-1.2"/>
    </g>
    <text x="${x + 2.4}" y="${(y1 + y2) / 2 + 0.9}" fill="#E52421" font-size="2.6" font-family="sans-serif">${label}</text>`;

  const calloutL = (y, targetX, lines) => `
    <line x1="-2.2" y1="${y}" x2="${targetX}" y2="${y}" stroke="#E52421" stroke-width="0.22"/>
    ${lines.map((l, i) => `<text x="-3" y="${y - ((lines.length - 1) * 1.2) + i * 2.5}" text-anchor="end" fill="#E52421" font-size="2.1" font-family="sans-serif">${l}</text>`).join('')}`;

  const { popH, popSvg, popGuides } = renderPopHeaderSvg(W, s.pop, showGuides, dimLine, calloutL);
  const vb = `${-padL} ${-popH - padT} ${W + padL + padR} ${H + popH + padT + padB}`;

  const guides = !showGuides ? '' : `
    ${popGuides}
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
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="${s.textColor}" font-size="${namePx}" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif"><tspan font-weight="${lIsBold ? 700 : 300}" ${lIsBold ? boldStroke : ''}>${row.lineName}</tspan>${row.productName ? `<tspan font-weight="${pIsLight ? 300 : 700}" ${!pIsLight ? boldStroke : ''}> ${row.productName}</tspan>` : ''}</text>`;
    }
    const isBoldRow = row.weight >= 700;
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" fill="${s.textColor}" font-size="${namePx}" font-weight="${isBoldRow ? 700 : 300}" ${isBoldRow ? boldStroke : ''} font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${row.text}</text>`;
  }).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W + padL + padR}mm" height="${H + popH + padT + padB}mm" class="pf-svg" style="font-feature-settings:'lnum' 1, 'tnum' 1; font-variant-numeric:lining-nums;">
    <defs>
      <clipPath id="pf-clip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
      <style>
        text { font-feature-settings: 'lnum' 1, 'tnum' 1; font-variant-numeric: lining-nums; }
      </style>
    </defs>
    ${popSvg}
    <g clip-path="url(#pf-clip)">
      <rect x="0" y="0" width="${W}" height="${H}" fill="${s.bg}"/>
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
        ${ingLines.map((line, i) => `<text x="${W / 2}" y="${ingStartY + i * ingLineStep}" text-anchor="middle" fill="${s.textColor}" font-size="${ingPx}" font-weight="${s.ingWeight === 'Bold' ? 700 : s.ingWeight === 'Medium' ? 500 : 300}" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>`).join('')}
      </g>
      <!-- 용량 (가로폭 초과 시 자동 개행) -->
      <g transform="translate(${capX} ${capStartY}) scale(${s.capScale / 100} 1)">
        ${capLines.map((line, i) => `<text x="0" y="${i * capLineStep}" text-anchor="middle" fill="${s.textColor}" font-size="${capPx}" font-weight="${s.capWeight === 'Bold' ? 700 : 500}" letter-spacing="${s.capTracking * 0.004}em" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>`).join('')}
      </g>
      <!-- 건강기능식품 15mm 마크 (공식 mark.svg 벡터) -->
      ${markSize > 0 ? getHffMarkSvg(markX, markY, markSize) : ''}
    </g>
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="0.25"/>
    ${guides}
  </svg>`;
}

/**
 * 이너뷰티(Inner Beauty) 단상자 전면 자동 설계 엔진
 * - Super_layoutguide-01~05 기반 규칙 내재화 (사용자 화면에는 가이드 수치 미표시)
 * - 건강기능식품(hff): 원재료명이 제품명 아래 1/2 크기(3mm 간격), 내용량은 하단 5mm 위 10pt, 건기식 마크 간섭 회피
 * - 일반식품(food): 하단 5mm 위 원재료명(14pt), 그 위에 내용량(10pt)
 */
export function autoSpecInnerBeautyFront(spec) {
  const W = Math.max(35, +spec.w || 75);
  const H = Math.max(55, +spec.h || 132.5);
  const isHff = (spec.type || 'hff') === 'hff';
  const isWide = W >= 120;
  const isExtraWide = W >= 195;
  const isMedium = W >= 95 && W < 120;
  const isSmall = W < 65;

  const defaultNamePt = isExtraWide ? 35 : isWide ? 32 : isMedium ? 29 : isSmall ? 21 : 27;
  const namePt = spec.customNamePt && spec.customNamePt > 0 ? +spec.customNamePt : defaultNamePt;

  const leftMargin = isWide ? 8.0 : isSmall ? 3.2 : 4.0;
  const bottomMargin = 5.0;

  const tagScale = isWide ? 1.33 : isSmall ? 0.82 : 1.0;
  const topLine = isWide ? 2.0 : isSmall ? 1.2 : 1.5;
  const tagWTop = +(43.59 * tagScale).toFixed(2);
  const tagWBot = +(39.55 * tagScale).toFixed(2);
  const tagY0 = +(1.17 * tagScale).toFixed(2);
  const tagH = +(6.47 * tagScale).toFixed(2);

  const gapTagName = isExtraWide ? 15.0 : isWide ? 9.0 : isSmall ? 7.5 : 10.0;
  const benefitPt = isExtraWide ? 14 : isWide ? 11.5 : isMedium ? 11 : 10.5;
  const gapBenefitPill = isWide ? 2.4 : 2.7;

  const pillPt = isExtraWide ? 12.0 : isWide ? 9.9 : isMedium ? 8.5 : 7.5;
  const pillH = isExtraWide ? 5.84 : isWide ? 5.10 : isMedium ? 5.05 : 4.90;
  const pillGapY = 1.20;
  const pillGapX = 1.20;

  const gapPillFootnote = 1.50;
  const footnotePt = isWide ? 6.0 : 5.0;

  const capPt = 10.0;
  const capScale = isWide ? 95 : 90;
  const capTracking = -5;

  // 건강기능식품일 때 원재료명은 제품명 크기의 1/2, 일반식품일 때는 14pt
  const ingPt = isHff ? +(namePt * 0.5).toFixed(1) : 14.0;
  const pointColor = spec.pointColor || spec.bg || '#F6B9D4';

  const isPdrnRuleStyle = spec.pointStyle === 'rule' || /PDRN/i.test(spec.productName || '');

  return {
    ...spec,
    logic: 'innerbeauty',
    type: isHff ? 'hff' : 'food',
    w: W,
    h: H,
    isWide,
    isExtraWide,
    isMedium,
    isSmall,
    baseBg: '#EDEDED',
    pointColor,
    leftMargin,
    bottomMargin,
    topLine,
    tagWTop,
    tagWBot,
    tagY0,
    tagH,
    gapTagName,
    namePt,
    benefit: String(spec.benefit ?? 'SHINE & YOUTHFUL').toUpperCase().trim(),
    benefitPt,
    gapBenefitPill,
    pointsRaw: spec.points ?? '3 TYPES 저분자 콜라겐 1,000mg*\n헤드투토, 트리플 뷰티 부스트\n매일 생기+윤기+광채 완성',
    pointStyle: isPdrnRuleStyle ? 'rule' : 'pill',
    pillPt,
    pillH,
    pillGapY,
    pillGapX,
    footnote: (spec.footnote ?? '*1일 1포 기준').trim(),
    gapPillFootnote,
    footnotePt,
    capPt,
    capScale,
    capTracking,
    ingPt,
    gapNameIng: 3.0,
    markMm: isHff ? HFF_MARK.sizeMm : 0,
  };
}

export function renderInnerBeautyFrontSvg(s, showGuides = true) {
  const W = s.w;
  const H = s.h;
  const isHff = s.type === 'hff';
  const leftX = s.leftMargin;
  const safeW = Math.max(20, W - leftX * 2);
  const pointHex = s.pointColor || '#F6B9D4';

  // 상단 바 & 사다리꼴 BI 태그
  const tagY0 = s.tagY0;
  const tagY1 = +(s.tagY0 + s.tagH).toFixed(2);
  const tx0 = +((W - s.tagWTop) / 2).toFixed(2);
  const tx1 = +(tx0 + s.tagWTop).toFixed(2);
  const bx0 = +((W - s.tagWBot) / 2).toFixed(2);
  const bx1 = +(bx0 + s.tagWBot).toFixed(2);

  const logoScale = s.tagWTop / (123.55 * PT_MM);
  const logoTx = +(tx0 - 229.93 * PT_MM * logoScale).toFixed(3);
  const logoTy = +(tagY0 - 283.61 * PT_MM * logoScale).toFixed(3);

  // 1) 라인명 (Bold) & 제품명 (Medium) — 좌측 정렬
  const namePx = s.namePt * PT_MM;
  const nameY1 = tagY1 + s.gapTagName + namePx * 0.82;
  const lineStr = (s.lineName || '').trim();
  const prodStr = (s.productName || '').trim();

  const inlineSub = prodStr && prodStr.length <= 2 && /^[A-Za-z0-9]+$/.test(prodStr) && lineStr.length <= 4;
  const nameLineStep = namePx + (s.isWide ? 4.2 : 3.8);

  let titleSvg = '';
  let lastTitleBaselineY = nameY1;
  if (inlineSub) {
    titleSvg = `<text x="${leftX}" y="${nameY1.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${namePx.toFixed(2)}" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif"><tspan font-weight="700">${lineStr}</tspan><tspan font-weight="500"> ${prodStr}</tspan></text>`;
  } else {
    const rows = [];
    if (lineStr) rows.push({ text: lineStr, weight: 700, isEn: /^[A-Za-z0-9\s&-]+$/.test(lineStr) });
    if (prodStr) rows.push({ text: prodStr, weight: 500, isEn: /^[A-Za-z0-9\s&-]+$/.test(prodStr) });
    titleSvg = rows.map((r, i) => {
      const ry = nameY1 + i * nameLineStep;
      lastTitleBaselineY = ry;
      const fam = r.isEn ? "'Raleway','VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif" : "'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif";
      const weight = r.isEn ? 600 : r.weight;
      return `<text x="${leftX}" y="${ry.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${namePx.toFixed(2)}" font-weight="${weight}" font-family="${fam}">${r.text}</text>`;
    }).join('\n      ');
  }

  // 2) 건강기능식품(isHff) vs 일반식품(!isHff) 원재료명·내용량·건강기능식품 마크 배치 분기
  const ingPx = s.ingPt * PT_MM;
  const rawIng = String(s.ingredient || '').trim();
  const capPx = s.capPt * PT_MM;
  const capLineStep = capPx * 1.22;
  const rawCap = String(s.capacity || '').trim();

  let ingSvg = '';
  let capSvg = '';
  let markSvg = '';
  let upperBlockBottomY = lastTitleBaselineY;
  let lowerBlockTopY = H - s.bottomMargin;
  let ingGuideY = lastTitleBaselineY;
  let capGuideY = H - s.bottomMargin;

  if (isHff) {
    // [건강기능식품]
    // (A) 원재료명: 제품명 바로 아래 3mm 간격 · 제품명 1/2 크기 · Light(300) · 좌측 정렬
    const ingLineStep = ingPx * 1.22;
    const ingLines = wrapSvgTextToWidth(rawIng, ingPx, safeW, 1);
    const lastNameBottom = lastTitleBaselineY + namePx * 0.16;
    const ingStartY = lastNameBottom + (s.gapNameIng || 3.0) + ingPx * 0.85;
    ingGuideY = ingStartY;
    ingSvg = ingLines.map((line, i) => {
      const iy = ingStartY + i * ingLineStep;
      upperBlockBottomY = iy;
      return `<text x="${leftX}" y="${iy.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${ingPx.toFixed(2)}" font-weight="300" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>`;
    }).join('\n      ');

    // (B) 내용량: 하단으로부터 5mm 위에 10pt 기입 + 건강기능식품 마크 비간섭 배치
    const markSize = s.markMm || 15;
    const markX = W - leftX - markSize;
    const cleanedCap = rawCap.replace(/^일반식품\s*/, '');
    const capText = cleanedCap
      ? (/^건강기능식품/.test(cleanedCap) ? cleanedCap : `건강기능식품 ${cleanedCap}`)
      : '건강기능식품';

    const capScaleRatio = s.capScale / 100;
    const approxCapW = estimateTextWidthMm(capText, capPx, capScaleRatio);
    const capBottomY = H - s.bottomMargin - capPx * 0.16;

    // 내용량이 우측 마크(markX - 1.5mm)와 겹치는지 판별
    const doesFitBesideMark = (leftX + approxCapW) <= (markX - 1.5);
    const capMaxW = doesFitBesideMark ? Math.max(16, markX - leftX - 1.5) : safeW;
    const capLines = wrapSvgTextToWidth(capText, capPx, capMaxW, capScaleRatio);
    const capStartY = capBottomY - (capLines.length - 1) * capLineStep;
    capGuideY = capStartY;

    capSvg = `<g transform="translate(${leftX} ${capStartY.toFixed(2)}) scale(${capScaleRatio.toFixed(2)} 1)">
      ${capLines.map((line, i) => `<text x="0" y="${(i * capLineStep).toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${capPx.toFixed(2)}" font-weight="700" letter-spacing="-0.02em" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>`).join('')}
    </g>`;

    const markY = doesFitBesideMark
      ? (H - s.bottomMargin - markSize)
      : (capStartY - capPx * 0.85 - markSize - 2.0);
    markSvg = getHffMarkSvg(markX, markY, markSize, 0.72, '#1D1D1B');

    lowerBlockTopY = capStartY - capPx * 0.88;
  } else {
    // [일반식품]
    // (A) 원재료명: 최하단 5mm 마진 기준 · 14pt Bold · #706F6F
    const ingStep = 16 * PT_MM;
    let ingLines = rawIng.split('\n').map(l => l.trim()).filter(Boolean);
    if (ingLines.length === 1 && !s.isWide && estimateTextWidthMm(ingLines[0], ingPx, 0.78) > safeW) {
      ingLines = wrapSvgTextToWidth(ingLines[0], ingPx, safeW, 0.78);
    }
    if (!ingLines.length) ingLines = [''];

    const maxRawIngW = Math.max(...ingLines.map(l => estimateTextWidthMm(l, ingPx, 1)), 1);
    const ingScaleX = Math.max(0.68, Math.min(0.90, +(safeW / maxRawIngW).toFixed(2)));

    const ingLastBaselineY = H - s.bottomMargin - ingPx * 0.12;
    const ingFirstBaselineY = ingLastBaselineY - (ingLines.length - 1) * ingStep;
    ingGuideY = ingFirstBaselineY;

    ingSvg = ingLines.map((line, i) => {
      const iy = ingFirstBaselineY + i * ingStep;
      return `<g transform="translate(${leftX} ${iy.toFixed(2)}) scale(${ingScaleX} 1)">
        <text x="0" y="0" text-anchor="start" fill="#706F6F" font-size="${ingPx.toFixed(2)}" font-weight="700" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>
      </g>`;
    }).join('\n      ');

    // (B) 내용량: 원재료명 위쪽 배치 · 10pt Bold · #1D1D1B
    const capText = rawCap.replace(/^건강기능식품\s*/, '');
    const capMaxScale = Math.min(s.capScale / 100, +(safeW / Math.max(estimateTextWidthMm(capText, capPx, 1), 1)).toFixed(2));
    const capDefaultY = s.isWide
      ? (ingFirstBaselineY - ingPx * 0.88 - 2.6)
      : Math.min(H - 17.9, ingFirstBaselineY - ingPx * 0.86 - 2.5);
    const capY = Math.max(lastTitleBaselineY + 24, capDefaultY);
    capGuideY = capY;

    capSvg = `<g transform="translate(${leftX} ${capY.toFixed(2)}) scale(${capMaxScale.toFixed(2)} 1)">
      <text x="0" y="0" text-anchor="start" fill="#1D1D1B" font-size="${capPx.toFixed(2)}" font-weight="700" letter-spacing="-0.02em" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${capText}</text>
    </g>`;

    lowerBlockTopY = capY - capPx * 0.88;
  }

  // 3) 중단 스택: 영문 베네핏(대문자) + 강조 포인트(쉼표로 같은 행 분리) + 기준치
  const fnPx = s.footnotePt * PT_MM;
  const fnStep = fnPx * 1.26;
  const fnLines = String(s.footnote || '').split('\n').map(l => l.trim()).filter(Boolean);

  const pointRowStrings = String(s.pointsRaw || '')
    .split('\n')
    .map(r => r.trim())
    .filter(Boolean)
    .slice(0, 5);
  // 쉼표(,)로 같은 행 내 캡슐 분리 (단, 1,000 등 천 단위 숫자 쉼표는 보존)
  const pointRows = pointRowStrings.map(rowStr =>
    rowStr.split(/,(?!\d{3}(?:\D|$))|\|/).map(col => col.trim()).filter(Boolean)
  );

  const pillH = s.pillH;
  const pillGapY = s.pillGapY;
  const pillGapX = s.pillGapX;
  const pillPx = s.pillPt * PT_MM;
  const pillsTotalH = pointRows.length > 0
    ? pointRows.length * pillH + (pointRows.length - 1) * pillGapY
    : 0;

  const benPx = s.benefitPt * PT_MM;
  const gapAboveLower = s.isWide ? 4.8 : 7.2;

  const idealFootnoteStartY = lowerBlockTopY - gapAboveLower - Math.max(0, (fnLines.length - 1) * fnStep);
  const idealPillsTopY = idealFootnoteStartY - (fnLines.length ? (fnPx * 0.85 + s.gapPillFootnote) : 0) - pillsTotalH;
  const idealBenefitY = idealPillsTopY - s.gapBenefitPill;

  const minBenefitY = upperBlockBottomY + (s.isWide ? 7.5 : 9.5);
  const benefitY = Math.max(minBenefitY, idealBenefitY);
  const pillsTopY = benefitY + s.gapBenefitPill;
  const fnStartY = pillsTopY + pillsTotalH + s.gapPillFootnote + fnPx * 0.82;

  const benefitUpper = String(s.benefit || '').toUpperCase();
  const benefitSvg = benefitUpper ? `<g transform="translate(${leftX} ${benefitY.toFixed(2)}) scale(0.95 1)">
      <text x="0" y="0" text-anchor="start" fill="#1D1D1B" font-size="${benPx.toFixed(2)}" font-weight="700" letter-spacing="0.11em" font-family="'Raleway','VB-ShinGothic','RIX-신고딕se-pro',sans-serif">${benefitUpper}</text>
    </g>` : '';

  let pointsSvg = '';
  if (s.pointStyle === 'rule') {
    const ruleW = s.isWide ? Math.min(safeW * 0.48, 68) : Math.min(safeW * 0.68, 54);
    const flatPoints = pointRows.flat();
    const rowH = pillH + 0.9;
    pointsSvg = flatPoints.map((txt, idx) => {
      const ryTop = pillsTopY + idx * rowH;
      const ty = ryTop + rowH * 0.67;
      return `
        <line x1="${leftX}" y1="${ryTop.toFixed(2)}" x2="${(leftX + ruleW).toFixed(2)}" y2="${ryTop.toFixed(2)}" stroke="#1D1D1B" stroke-width="0.14"/>
        <text x="${leftX}" y="${ty.toFixed(2)}" text-anchor="start" fill="#1D1D1B" font-size="${pillPx.toFixed(2)}" font-weight="500" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${txt}</text>
        ${idx === flatPoints.length - 1 ? `<line x1="${leftX}" y1="${(ryTop + rowH).toFixed(2)}" x2="${(leftX + ruleW).toFixed(2)}" y2="${(ryTop + rowH).toFixed(2)}" stroke="#1D1D1B" stroke-width="0.14"/>` : ''}`;
    }).join('');
  } else {
    const padX = s.isWide ? 2.0 : 1.6;
    pointsSvg = pointRows.map((cols, rIdx) => {
      const py = pillsTopY + rIdx * (pillH + pillGapY);
      let curX = leftX;
      return cols.map(colText => {
        const textW = estimateTextWidthMm(colText, pillPx, 0.95);
        const availW = Math.max(16, safeW - (curX - leftX));
        const desiredW = textW + padX * 2.2;
        const pw = Math.min(availW, Math.max(pillH * 1.8, desiredW));
        const maxTextW = Math.max(6, pw - padX * 2.0);
        const textScaleX = textW > maxTextW ? +(maxTextW / textW).toFixed(3) : 1.0;
        const rx = +(pillH / 2).toFixed(2);
        const cx = curX + pw / 2;
        const ty = py + pillH * 0.69;
        const itemSvg = `
          <rect x="${curX.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="${pillH.toFixed(2)}" rx="${rx}" ry="${rx}" fill="${pointHex}"/>
          <g transform="translate(${cx.toFixed(2)} ${ty.toFixed(2)}) scale(${textScaleX} 1)">
            <text x="0" y="0" text-anchor="middle" fill="#1D1D1B" font-size="${pillPx.toFixed(2)}" font-weight="500" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${colText}</text>
          </g>`;
        curX += pw + pillGapX;
        return itemSvg;
      }).join('');
    }).join('\n      ');
  }

  const footnoteSvg = fnLines.map((line, i) => {
    const fy = fnStartY + i * fnStep;
    return `<text x="${leftX}" y="${fy.toFixed(2)}" text-anchor="start" fill="#878787" font-size="${fnPx.toFixed(2)}" font-weight="500" font-family="'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif">${line}</text>`;
  }).join('\n      ');

  // 빨간 치수선 ON/OFF 시에도 단상자 렌더링 크기 및 뷰포트 비율이 100% 동일하게 유지되도록 패딩 고정
  const padL = 28;
  const padR = 24;
  const padT = 7;
  const padB = 5;

  const dimLine = (x, y1, y2, label) => `
    <g stroke="#E52421" stroke-width="0.22" fill="none">
      <path d="M${x},${y1.toFixed(2)} h1.2 v${Math.max(y2 - y1, 0.4).toFixed(2)} h-1.2"/>
    </g>
    <text x="${(x + 2.4).toFixed(2)}" y="${((y1 + y2) / 2 + 0.9).toFixed(2)}" fill="#E52421" font-size="2.6" font-family="sans-serif">${label}</text>`;

  const calloutL = (y, targetX, lines) => `
    <line x1="-2.2" y1="${y.toFixed(2)}" x2="${targetX.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#E52421" stroke-width="0.22"/>
    ${lines.map((l, i) => `<text x="-3" y="${(y - ((lines.length - 1) * 1.2) + i * 2.5).toFixed(2)}" text-anchor="end" fill="#E52421" font-size="2.1" font-family="sans-serif">${l}</text>`).join('')}`;

  const { popH, popSvg, popGuides } = renderPopHeaderSvg(W, s.pop, showGuides, dimLine, calloutL);
  const vb = `${-padL} ${-popH - padT} ${W + padL + padR} ${H + popH + padT + padB}`;

  const topMarginGuideY = -popH - 1.5;
  const guides = !showGuides ? '' : `
    ${popGuides}
    <!-- 좌측 정렬 마진 브래킷 (4mm / 8mm) -->
    <g stroke="#E52421" stroke-width="0.22" fill="none">
      <path d="M0,${(topMarginGuideY + 1.0).toFixed(2)} v-1.0 h${leftX} v1.0"/>
    </g>
    <text x="0" y="${(topMarginGuideY - 0.8).toFixed(2)}" fill="#E52421" font-size="2.4" font-family="sans-serif">${leftX}mm 마진</text>
    <!-- 우측 치수선 -->
    ${dimLine(W + 2, 0, s.topLine, `${s.topLine}mm`)}
    ${dimLine(W + 2, tagY1, tagY1 + s.gapTagName, `${s.gapTagName}mm`)}
    ${isHff ? dimLine(W + 2, lastTitleBaselineY + namePx * 0.16, lastTitleBaselineY + namePx * 0.16 + (s.gapNameIng || 3), `${s.gapNameIng || 3}mm`) : ''}
    ${pointRows.length > 0 ? dimLine(W + 2, benefitY, pillsTopY, `${s.gapBenefitPill}mm`) : ''}
    ${fnLines.length > 0 && pointRows.length > 0 ? dimLine(W + 2, pillsTopY + pillsTotalH, pillsTopY + pillsTotalH + s.gapPillFootnote, `${s.gapPillFootnote}mm`) : ''}
    ${dimLine(W + 2, H - s.bottomMargin, H, `${s.bottomMargin}mm`)}
    <!-- 좌측 서체 콜아웃 -->
    ${calloutL(nameY1 - namePx * 0.3, leftX - 0.6, [`라인명 Bold ${s.namePt}pt`, prodStr ? `제품명 Medium ${s.namePt}pt` : '컬러 K100'])}
    ${isHff ? calloutL(ingGuideY - ingPx * 0.3, leftX - 0.6, [`원재료 Light ${s.ingPt}pt`, '제품명의 1/2']) : ''}
    ${benefitUpper ? calloutL(benefitY - benPx * 0.3, leftX - 0.6, [`베네핏 Bold ${s.benefitPt}pt`, 'Raleway / K100']) : ''}
    ${pointRows.length > 0 ? calloutL(pillsTopY + pillH * 0.5, leftX - 0.6, [`강조포인트 Medium ${s.pillPt}pt`, '포인트 컬러 박스']) : ''}
    ${calloutL(capGuideY - capPx * 0.3, leftX - 0.6, [`내용량 Bold ${s.capPt}pt`, `${s.capScale}% / ${s.capTracking}`])}
    ${!isHff ? calloutL(ingGuideY - ingPx * 0.3, leftX - 0.6, [`원재료명 Bold ${s.ingPt}pt`, '컬러 K70']) : ''}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W + padL + padR}mm" height="${H + popH + padT + padB}mm" class="pf-svg" style="font-feature-settings:'lnum' 1, 'tnum' 1; font-variant-numeric:lining-nums;">
    <defs>
      <clipPath id="ib-clip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
      <style>
        text { font-feature-settings: 'lnum' 1, 'tnum' 1; font-variant-numeric: lining-nums; }
      </style>
    </defs>
    ${popSvg}
    <g clip-path="url(#ib-clip)">
      <!-- 베이스 배경 (#EDEDED) -->
      <rect x="0" y="0" width="${W}" height="${H}" fill="#EDEDED"/>
      <!-- 상단 포인트 바 + 사다리꼴 BI 태그 (포인트 팬톤 컬러) -->
      <polygon points="${tx0},${tagY0} ${bx0},${tagY1} ${bx1},${tagY1} ${tx1},${tagY0}" fill="${pointHex}"/>
      <rect x="0" y="0" width="${W}" height="${s.topLine}" fill="${pointHex}"/>
      <!-- VITALBEAUTIE 워드마크 (#1D1D1B) -->
      <g transform="translate(${logoTx} ${logoTy}) scale(${PT_MM * logoScale})" fill="#1D1D1B">
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
      <!-- 좌측 정렬 라인명·제품명 -->
      ${titleSvg}
      <!-- 좌측 정렬 영문 베네핏 -->
      ${benefitSvg}
      <!-- 좌측 정렬 강조 포인트 -->
      ${pointsSvg}
      <!-- 좌측 정렬 기준치 문안 -->
      ${footnoteSvg}
      <!-- 좌측 정렬 내용량 -->
      ${capSvg}
      <!-- 좌측 정렬 원재료명 -->
      ${ingSvg}
      <!-- 건강기능식품 마크 (건기식 선택 시) -->
      ${markSvg}
    </g>
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="0.25"/>
    ${guides}
  </svg>`;
}


