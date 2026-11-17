/* ═══════════════════════════════════════════════════════════════════════════
   Global Language State & EN / KR Translation Engine
   - 기본 국문(KR) 모드에서는 하단 버튼에 'EN' 표시 → 클릭 시 전체 영문(EN) 변환 및 버튼 'KR' 표시
   - 'KR' 클릭 시 다시 국문(KR) 모드로 전환
   ═══════════════════════════════════════════════════════════════════════════ */

const LANG_STORAGE_KEY = 'vb_site_lang_v1';
let currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem(LANG_STORAGE_KEY)) || 'kr';
const listeners = new Set();

export function getLang() {
  return currentLang;
}

export function isEn() {
  return currentLang === 'en';
}

export function t(krText, enText) {
  return currentLang === 'en' ? (enText ?? krText) : krText;
}

export function setLang(nextLang) {
  currentLang = nextLang === 'en' ? 'en' : 'kr';
  try {
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  } catch (_) {}
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('lang-en', currentLang === 'en');
    document.body.classList.toggle('lang-kr', currentLang === 'kr');
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'ko';
  }
  listeners.forEach(fn => {
    try { fn(currentLang); } catch (_) {}
  });
}

export function toggleLang() {
  setLang(currentLang === 'en' ? 'kr' : 'en');
  return currentLang;
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// 공통 UI 구문 자동 영문화 사전 (DOM 후처리용)
const PHRASE_MAP_KR_TO_EN = [
  ['이 디자인 코드 복사', 'Copy Design Spec'],
  ['전체 라인업', 'All Lineup'],
  ['이커머스 채널', 'E-Commerce Channel'],
  ['뉴커머스 채널', 'New-Commerce Channel'],
  ['개 카테고리', ' Categories'],
  ['초기화', 'Reset'],
  ['검색 결과가 없습니다.', 'No matching results found.'],
  ['색상 배경 · 반전 로고', 'Colored Background · Inverted Logo'],
  ['제품명 또는 팬톤 번호 검색 (예: 213C, 메타그린)', 'Search product or Pantone code (e.g., 213C, Meta Green)'],
  ['클릭하여 HEX 복사', 'Click to copy HEX'],
  ['클릭하여 HEX 및 팬톤 복사', 'Click to copy HEX & Pantone'],
  ['이커머스 · ', 'E-Commerce · '],
  ['뉴커머스 · ', 'New-Commerce · '],
  ['이너뷰티', 'Inner Beauty'],
  ['슬리밍', 'Slimming'],
  ['장건강', 'Gut Care'],
  ['간건강', 'Liver Care'],
  ['눈건강', 'Eye Care'],
  ['관절/뼈', 'Joint & Bone'],
  ['비타민/활력', 'Vitamin & Energy'],
  ['홍삼/면역', 'Ginseng & Immunity'],
  ['헤리티지', 'Heritage'],
  ['프리미엄', 'Premium'],
  ['웰니스', 'Wellness'],
  ['건강기능식품', 'Health Functional Food'],
  ['일반식품', 'General Food'],
  ['빨간 가이드 치수선 ON', 'Red Dimension Guides ON'],
  ['빨간 가이드 치수선 OFF', 'Red Dimension Guides OFF'],
  ['.AI 파일 다운로드', 'Download .AI File'],
  ['.AI 벡터 다운로드', 'Download .AI Vector'],
  ['.SVG 다운로드', 'Download .SVG'],
  ['전체 .AI 다운로드', 'Download All .AI'],
  ['전체 .SVG 다운로드', 'Download All .SVG'],
  ['원형 라인 배지', 'Circle Line Badge'],
  ['원형 + 원호 카피', 'Circle + Arc Copy'],
  ['채운 원 반전', 'Solid Circle Inverted'],
  ['아이콘 + 키워드', 'Icon + Keyword'],
  ['라운드 프레임', 'Rounded Frame'],
  ['단독 아이콘', 'Standalone Icon'],
  ['1단계 심플', 'Lv.1 Simple'],
  ['2단계 베이직', 'Lv.2 Basic'],
  ['3단계 스탠다드', 'Lv.3 Standard'],
  ['4단계 컴플렉스', 'Lv.4 Complex'],
  ['① 심플', '① Simple'],
  ['② 베이직', '② Basic'],
  ['③ 스탠다드', '③ Standard'],
  ['④ 컴플렉스', '④ Complex'],
  ['바툴로 복잡도 실시간 조절', 'Adjust complexity level with slider'],
  ['바이탈뷰티 6가지 배지 스타일 실시간 시뮬레이션', 'VITALBEAUTIE 6 Badge Styles Live Simulation'],
];

export function translateDomIfEn(root = document.body) {
  if (!root || currentLang !== 'en') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const textNode of nodes) {
    let val = textNode.nodeValue;
    if (!val || !/[가-힣]/.test(val)) continue;
    for (const [kr, en] of PHRASE_MAP_KR_TO_EN) {
      if (val.includes(kr)) {
        val = val.split(kr).join(en);
      }
    }
    if (val !== textNode.nodeValue) {
      textNode.nodeValue = val;
    }
  }
  root.querySelectorAll?.('[placeholder],[title]').forEach(el => {
    const ph = el.getAttribute('placeholder');
    if (ph && /[가-힣]/.test(ph)) {
      let nextPh = ph;
      for (const [kr, en] of PHRASE_MAP_KR_TO_EN) {
        if (nextPh.includes(kr)) nextPh = nextPh.split(kr).join(en);
      }
      el.setAttribute('placeholder', nextPh);
    }
    const ti = el.getAttribute('title');
    if (ti && /[가-힣]/.test(ti)) {
      let nextTi = ti;
      for (const [kr, en] of PHRASE_MAP_KR_TO_EN) {
        if (nextTi.includes(kr)) nextTi = nextTi.split(kr).join(en);
      }
      el.setAttribute('title', nextTi);
    }
  });
}

