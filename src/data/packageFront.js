/* ═══════════════════════════════════════
   META GREEN 단상자 전면(주표시면) 거버넌스 룰 데이터 (Rule as Data)
   근거
   - 브랜드: 「메타그린 단상자 전면 디자인 가이드」(빨간 가이드 주석 8면) 실측
   - 법정: 식품 등의 표시·광고에 관한 법률, 「식품등의 표시기준」(제2026-37호),
           「건강기능식품의 표시기준」 (2028.1.1 시행 개정 도안 별도)
   단위: 길이 mm, 글자 pt (1pt = 0.3528mm)
   ═══════════════════════════════════════ */

export const PT_MM = 25.4 / 72;

/* ─── 라인 아이덴티티 ─── */
export const MG_LINE = {
  name: '메타그린',
  bg: { pantone: 'PANTONE 348C', hex: '#00843D' },        // 단상자 배경
  tag: { pantone: 'PANTONE 389C', hex: '#CEDC00' },       // 상단 라인 + 로고 태그
  logoInk: { label: 'VITALBEAUTIE Black', hex: '#1D1D1B' },
  text: { hex: '#FFFFFF' },                                // 전면 문안은 화이트
  font: 'Rix신고딕SE_Pro',
  colorDeltaE: 6,                                          // 아트웍 실측 컬러 허용 ΔE2000
};

/* ─── 규격 클래스 (가이드 실측) ───
   소형: 메타그린 슬림업(54.4×83.7) · 브이레디(53.9×88.9)
   표준: 부스터샷(100×126) · 젤리 더블컷/애사비(80×161) · 클린티(80×150) · 효소(75×115) · 크레아틴(89.6×144.4) */
export const SIZE_CLASS = {
  smallMaxWidth: 60, // 전면 폭 60mm 미만 → 소형
  small: {
    label: '소형 단상자',
    examples: '슬림업 · 브이케어 · 브이레디',
    topLine: 1.2,
    tag: { wTop: 33, wBottom: 28, h: 5.6, range: { wTop: [30, 36], h: [5, 6.2] } },
    gapTagToName: [3, 4],
    namePt: [18, 18],
  },
  standard: {
    label: '표준 단상자',
    examples: '부스터샷 · 젤리 · 클린티 · 효소 · 크레아틴',
    topLine: 1.5,
    tag: { wTop: 43.6, wBottom: 37, h: 7.3, range: { wTop: [42, 45], h: [7, 7.6] } },
    gapTagToName: [5, 5],
    namePt: [26, 28],
  },
  lineTolerance: 0.05,  // 상단 라인 두께 허용 ±mm
  gapTolerance: 0.5,    // 간격 허용 ±mm
};

/* ─── 타이포그래피 룰 (빨간 주석 원문 기반) ─── */
export const TYPO = {
  name: {
    lineWeight: 'Bold', productWeight: 'Light', scale: 100,
    note: '라인명 Rix신고딕SE_Pro Bold + 제품명 Light, 동일 pt / 장평 100%. 단상자 면적에 비해 제품명이 길 경우 두 줄로 기입',
  },
  hffIngredient: {
    weight: 'Light', ratio: 0.5, tolerancePt: 1, gapFromName: 3, scale: 100,
    note: '[건강기능식품] 기능성 원재료명은 제품명 바로 아래 3mm, Light, 제품명의 1/2 사이즈',
  },
  foodIngredient: {
    weight: 'Medium', pt: 14, exceptionPt: [10, 12], opacity: 70, scale: 100,
    note: '[일반식품] 원료명은 제품명 밑이 아니라 하단(용량 위)에 투명도 70%, 함량(%)과 함께 반드시 14pt. 면적이 작을 경우에만 10~12pt 예외, 문안이 안 보이면 투명도 없이(100%)',
  },
  capacity: {
    weights: ['Medium', 'Bold'], pt: 10, scale: 90, tracking: -5, bottomMargin: 3,
    note: '용량 Rix신고딕SE_Pro Medium(또는 Bold) 10pt / 장평 90% / 자간 -5, 하단 재단선에서 3mm',
  },
  sideSafe: 3, // 좌우 안전 여백(권장)
};

/* ─── 건강기능식품 인증 도안 ─── */
export const HFF_MARK = {
  sizeMm: 15,
  legalSmallAreaCm2: 150,
  position: '전면 하단 우측(용량 라인과 동일 하단 여백)',
  note: '건강기능식품 도안 15×15mm (브랜드 필수). 법정 기준은 15×15mm 이상이며 포장면적 150㎠ 이하에는 크기 조정 예외가 있으나, 메타그린 라인은 15mm 고정',
  nextRevision: '2026.9.15 공포 · 2028.1.1 시행 개정 도안(건강기능식품·GMP) 별도 적용 예정',
};

/* ─── 오인·금지 표현 키워드 (전면 카피 스캔) ─── */
export const CLAIM_KEYWORDS = {
  // 일반식품: 기능성 오인 가능 표현 → 검토(WARN)
  foodFunctional: ['체지방', '혈당', '다이어트', '슬리밍', '감소', '개선', '억제', '컷', 'cut', 'blood sugar', '지방 분해', '배출', '디톡스', '면역', '건강기능식품', '기능성'],
  // 공통: 질병 예방·치료 표현 → 금지(FAIL)
  disease: ['치료', '예방', '완치', '처방', '특효', '당뇨', '비만 치료', '고혈압', '질병'],
  // 영양강조 표현 → 기준 충족 근거 확인(WARN)
  nutritionClaim: ['무설탕', '저당', '제로', '0kcal', '고단백', '고식이섬유', 'high fiber', '저칼로리', '무가당'],
};

/* ─── 룰 카탈로그 (거버넌스 탭 표시용) ─── */
export const RULE_CATALOG = [
  // 법정 필수
  { id: 'L1', level: 'legal', scope: 'all', title: '제품명 주표시면 표시', body: '품목제조보고 정식 제품명. 브랜드명·라인명과 구분' },
  { id: 'L2', level: 'legal', scope: 'all', title: '내용량 주표시면 표시', body: 'g·mL·개수 등 단위와 총량/구성 표기' },
  { id: 'L3', level: 'legal', scope: 'hff', title: '건강기능식품 문구 또는 도안', body: '주표시면에 15×15mm 이상 도안 또는 「건강기능식품」 문구 (150㎠ 이하 예외)' },
  { id: 'L4', level: 'legal', scope: 'food', title: '제품명에 쓴 원재료의 함량(%)', body: '원재료명을 제품명(일부)으로 사용 시 주표시면에 함량(%)을 14pt 이상 표시. 면적 부족 시 예외' },
  { id: 'L5', level: 'legal', scope: 'food', title: '내용량에 해당하는 열량', body: '영양표시 대상 일반식품은 내용량과 함께 열량(kcal) 병기' },
  { id: 'L6', level: 'legal', scope: 'all', title: '법정 문안 글자 10pt · 장평 90% · 자간 -5% 이상', body: '소형 포장은 고시상 요건 충족 시에만 예외. 무조건 6~7pt 불가' },
  { id: 'L7', level: 'legal', scope: 'all', title: '배경과 명확히 구별되는 색상', body: '법정 문안은 바탕과 대비 확보, 금박·그라데이션·홀로그램 위 배치 지양' },
  { id: 'L8', level: 'legal', scope: 'all', title: '질병 예방·치료 표현 금지 / 기능성 오인 금지', body: '일반식품은 기능성 오인 표현, 건강기능식품은 인정 범위 외 기능성 표현 금지' },
  { id: 'L9', level: 'legal', scope: 'food', title: '일반식품에 건강기능식품 문구·도안 사용 금지', body: '건강기능식품 도안과 GMP 도안 혼용 금지' },
  // 브랜드 필수 (메타그린 가이드)
  { id: 'B1', level: 'brand', scope: 'all', title: '배경 PANTONE 348C', body: '메타그린 라인 단상자 전면 배경 컬러' },
  { id: 'B2', level: 'brand', scope: 'all', title: '상단 389C 라인 + 사다리꼴 태그 + VITALBEAUTIE 로고', body: '태그는 상단 라인에 매달린 형태로 중앙 정렬, 로고는 블랙' },
  { id: 'B3', level: 'brand', scope: 'all', title: '태그 상단 라인 두께', body: '표준 1.5mm / 소형(슬림업·브이케어·브이레디) 1.2mm' },
  { id: 'B4', level: 'brand', scope: 'all', title: '태그 → 제품명 간격', body: '표준 5mm / 소형 3~4mm' },
  { id: 'B5', level: 'brand', scope: 'all', title: '제품명 타이포', body: '라인명 Bold + 제품명 Light 동일 pt, 장평 100%. 표준 26~28pt / 소형 18pt. 길면 두 줄' },
  { id: 'B6', level: 'brand', scope: 'hff', title: '원재료명 = 제품명의 1/2 크기', body: '제품명 아래 3mm, Light. 26pt→13pt · 28pt→14pt · 18pt→9pt' },
  { id: 'B7', level: 'brand', scope: 'food', title: '원료명+함량% 하단 배치, 투명도 70%, 14pt', body: '용량 위 하단 중앙. 면적이 작을 때만 10~12pt, 안 보이면 투명도 없이' },
  { id: 'B8', level: 'brand', scope: 'all', title: '용량 10pt / 장평 90% / 자간 -5', body: 'Rix신고딕SE_Pro Medium(Bold), 하단 3mm. 건강기능식품은 「건강기능식품」 문구 선행' },
  { id: 'B9', level: 'brand', scope: 'hff', title: '건강기능식품 마크 15mm', body: '전면 하단 우측, 공식 원본 도안 사용' },
  { id: 'B10', level: 'brand', scope: 'all', title: '전면 문안 화이트', body: '348C 배경 위 화이트(대비 4.8:1)' },
  // 권장
  { id: 'R1', level: 'recommend', scope: 'all', title: '좌우 안전 여백 3mm', body: '문안·마크가 재단선에서 3mm 이상 안쪽' },
  { id: 'R2', level: 'recommend', scope: 'all', title: '법정 문안에 그림자·외곽선·회전 지양', body: '바닥면과 평행 배치' },
];

/* ─── 가이드 8면 프리셋 (SVG 실측값) ─── */
export const PRESETS = [
  {
    id: 'slimup', label: '메타그린 슬림업', type: 'hff', w: 54.4, h: 83.7,
    lineName: '메타그린', productName: '슬림업', nameLines: 1, namePt: 18, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: '녹차추출물, 바나바잎추출물, 판토텐산', ingPt: 9, ingWeight: 'Light', ingOpacity: 100, ingPos: 'under',
    capacity: '20.4 g | 680 mg X 30정', capPt: 10, capWeight: 'Medium', capScale: 90, capTracking: -5, capPrefix: true,
    markMm: 15, topLine: 1.2, tagW: 34.9, tagH: 5.85, gapTagName: 3, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#00843D', smallException: false, claims: 'Blood Sugar Cut, 1 Tablet a day',
  },
  {
    id: 'booster', label: '메타그린 부스터샷', type: 'hff', w: 100, h: 126,
    lineName: '메타그린', productName: '부스터샷', nameLines: 2, namePt: 26, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: 'APIC대두배아열수추출물등복합물, 비타민B1, 녹차추출물, 바나바잎추출물, 판토텐산', ingPt: 13, ingWeight: 'Light', ingOpacity: 100, ingPos: 'under',
    capacity: '188.79 g [26.97 g x 7 EA]', capPt: 10, capWeight: 'Medium', capScale: 90, capTracking: -5, capPrefix: true,
    markMm: 15, topLine: 1.5, tagW: 43.6, tagH: 7.3, gapTagName: 5, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#00843D', smallException: false, claims: '#GL',
  },
  {
    id: 'doublecut', label: '메타그린 젤리 더블컷', type: 'hff', w: 80, h: 161,
    lineName: '메타그린', productName: '젤리 더블컷', nameLines: 2, namePt: 26, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: '가르시니아캄보지아추출물, 난소화성말토덱스트린, 크롬', ingPt: 13, ingWeight: 'Light', ingOpacity: 100, ingPos: 'under',
    capacity: '200 g [20 g X 10포]', capPt: 10, capWeight: 'Medium', capScale: 90, capTracking: -5, capPrefix: true,
    markMm: 15, topLine: 1.5, tagW: 43.6, tagH: 7.3, gapTagName: 5, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#00843D', smallException: false, claims: 'Carbo Cut, Orange Flavor',
  },
  {
    id: 'acv', label: '메타그린 젤리 애사비', type: 'food', w: 80, h: 161,
    lineName: '메타그린', productName: '젤리 애사비', nameLines: 2, namePt: 26, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: '사과초모식초(애플사이다비니거) 35% 함유', ingPt: 14, ingWeight: 'Medium', ingOpacity: 70, ingPos: 'bottom',
    capacity: '200 g [20 g × 10포 / 140 kcal]', capPt: 10, capWeight: 'Medium', capScale: 90, capTracking: -5, capPrefix: false,
    markMm: 0, topLine: 1.5, tagW: 43.6, tagH: 7.3, gapTagName: 5, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#B3262E', smallException: false, claims: 'Apple Cider Vinegar, High Fiber 고식이섬유',
  },
  {
    id: 'cleantea', label: '메타그린 클린티', type: 'food', w: 79.9, h: 150.3,
    lineName: '메타그린', productName: '클린티', nameLines: 1, namePt: 26, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: '구연산칼륨 29.697%\n파인애플추출분말 3.448%\n올리브잎추출물 8.621%\n용성비타민P 10.345%', ingPt: 14, ingWeight: 'Medium', ingOpacity: 70, ingPos: 'bottom',
    capacity: '음료베이스(분말제품) 29 g [2.9 g x 10포] (85 kcal)', capPt: 10, capWeight: 'Bold', capScale: 90, capTracking: -5, capPrefix: false,
    markMm: 0, topLine: 1.5, tagW: 43.6, tagH: 7.3, gapTagName: 5, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#5DA05A', smallException: false, claims: 'Blood sugar Cut, 1 Stick a Day, Citrus Flavor',
  },
  {
    id: 'enzyme', label: '메타그린 효소', type: 'food', w: 75.1, h: 114.7,
    lineName: '메타그린', productName: '효소', nameLines: 1, namePt: 26, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: 'α-아밀라아제 600,000 unit/3 g\n프로테아제 6,000 unit/3 g\n메타프로효소포뮬라 35 %', ingPt: 10, ingWeight: 'Medium', ingOpacity: 70, ingPos: 'bottom',
    capacity: '효소식품 3 g X 14포 (42 g/170 kcal)', capPt: 10, capWeight: 'Bold', capScale: 92, capTracking: -5, capPrefix: false,
    markMm: 0, topLine: 1.5, tagW: 43.6, tagH: 7.3, gapTagName: 5, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#00843D', smallException: true, claims: 'Before Meals, Balance',
  },
  {
    id: 'creatine', label: '메타그린 크레아틴 액티브', type: 'hff', w: 89.6, h: 144.4,
    lineName: '메타그린', productName: '크레아틴 액티브', nameLines: 2, namePt: 28, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: '크레아틴', ingPt: 14, ingWeight: 'Light', ingOpacity: 100, ingPos: 'under',
    capacity: '140 g [10 g X 14포]', capPt: 10, capWeight: 'Bold', capScale: 90, capTracking: -5, capPrefix: true,
    markMm: 15, topLine: 1.5, tagW: 43.6, tagH: 7.3, gapTagName: 5, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#00843D', smallException: false, claims: 'Active Up, Orzo Latte Flavor',
  },
  {
    id: 'vready', label: '메타그린 브이레디', type: 'food', w: 53.9, h: 88.9,
    lineName: '메타그린', productName: '브이레디', nameLines: 1, namePt: 18, lineWeight: 'Bold', productWeight: 'Light',
    ingredient: '효소처리헤스페리딘\n8.6957%', ingPt: 12, ingWeight: 'Medium', ingOpacity: 100, ingPos: 'bottom',
    capacity: '69 g | 1,150 mg X 60정 (256 kcal)', capPt: 10, capWeight: 'Medium', capScale: 90, capTracking: -5, capPrefix: false,
    markMm: 0, topLine: 1.2, tagW: 31.4, tagH: 5.27, gapTagName: 4, gapNameIng: 3, bottomMargin: 3,
    bg: '#00843D', tagColor: '#CEDC00', textColor: '#FFFFFF', ingBg: '#E9C46A', smallException: true, claims: 'Mineral Blend, Take with water, K Mg',
  },
];

/* VITALBEAUTIE 워드마크 벡터 (가이드 원본에서 추출, 태그 좌표계 123.55×20.74pt 기준) */
export const TAG_LOGO = {
  tagW: 123.55,
  tagH: 20.74,
  originX: 229.93,
  originY: 283.61,
  paths: `<path d="m305.17,288.82l-.13-.3-.12.3-3.86,9.04-.04.09h1.13l1.07-2.51c.04-.08.12-.14.21-.14h3.21c.09,0,.18.06.21.14l1.02,2.51h1.2l-3.91-9.13Zm-.1,2.32c1.2,2.88,1.23,2.96,1.16,3.08-.04.06-.11.1-.19.1h-2.04c-.07,0-.15-.04-.18-.1-.04-.06-.05-.14-.02-.22l1.19-2.86.04-.09.04.09Z"/><path d="m309.11,297.97h-1.24s-1.02-2.52-1.02-2.52c-.03-.08-.11-.13-.19-.13h-3.21c-.08,0-.16.05-.19.13l-1.07,2.52h-1.17l.05-.11,3.86-9.04.14-.34.14.34,3.92,9.15Zm-1.22-.03h1.17l-3.9-9.11-.11-.27-.11.27-3.88,9.11h1.1l1.06-2.5c.04-.09.13-.15.22-.15h3.21c.1,0,.19.06.23.15l1.01,2.5Zm-1.84-3.61h-2.04c-.08,0-.15-.04-.2-.11-.05-.07-.06-.16-.02-.23l1.25-2.98.05.12c1.22,2.91,1.24,2.97,1.16,3.09-.04.07-.12.11-.2.11Zm-1.01-3.24l-.02.06-1.19,2.86c-.03.07-.02.14.02.2.04.06.1.09.17.09h2.04c.07,0,.13-.04.17-.09.07-.11.03-.22-1.16-3.06l-.03-.06Z"/><polygon points="253.47 288.83 251.29 294.18 249.03 288.83 247.01 288.83 251.32 298.37 255.43 288.83 253.47 288.83"/><rect x="257.31" y="288.83" width="1.89" height="9.16"/><polygon points="260.95 288.83 260.95 290.58 263.5 290.58 263.5 297.99 265.39 297.99 265.39 290.58 267.93 290.58 267.93 288.83 260.95 288.83"/><rect x="326.96" y="288.83" width="1.07" height="9.12"/><path d="m328.05,297.97h-1.1v-9.15h1.1v9.15Zm-1.07-.03h1.04v-9.09h-1.04v9.09Z"/><path d="m290.67,293.07c-.08-.02-.14-.09-.15-.18,0-.09.04-.17.11-.21.47-.24.98-.71.98-1.62,0-1.4-.96-2.23-2.57-2.23h-3.15v9.12h3.4c1.87,0,2.98-.99,2.98-2.66,0-1.1-.55-1.91-1.61-2.21m-1.71-.5h-1.8c-.12,0-.21-.09-.21-.21v-2.45c0-.12.09-.21.21-.21h1.8c1.05,0,1.59.47,1.59,1.4s-.53,1.47-1.59,1.47m-2.01,1c0-.12.09-.21.21-.21h1.98c1.29,0,2.04.68,2.04,1.87s-.68,1.85-1.97,1.85h-2.05c-.12,0-.21-.09-.21-.21v-3.29Z"/><path d="m289.29,297.97h-3.42v-9.15h3.17c1.62,0,2.58.84,2.58,2.25,0,.94-.53,1.41-.98,1.64-.07.04-.11.11-.11.19,0,.08.06.15.14.17,1.04.3,1.62,1.09,1.62,2.23,0,1.68-1.12,2.68-3,2.68Zm-3.39-.03h3.39c1.86,0,2.97-.99,2.97-2.65,0-1.12-.57-1.9-1.59-2.2-.09-.03-.15-.1-.16-.2,0-.09.04-.18.12-.22.44-.22.96-.68.96-1.61,0-1.39-.95-2.22-2.55-2.22h-3.14v9.09Zm3.3-.84h-2.05c-.12,0-.22-.1-.22-.23v-3.29c0-.13.1-.23.22-.23h1.98c1.3,0,2.05.69,2.05,1.88s-.69,1.87-1.98,1.87Zm-2.05-3.72c-.11,0-.19.08-.19.2v3.29c0,.11.09.2.19.2h2.05c1.28,0,1.95-.64,1.95-1.84s-.74-1.85-2.02-1.85h-1.98Zm1.8-.79h-1.8c-.12,0-.22-.1-.22-.23v-2.45c0-.13.1-.23.22-.23h1.8c1.06,0,1.6.48,1.6,1.42s-.54,1.49-1.6,1.49Zm-1.8-2.88c-.1,0-.19.09-.19.2v2.45c0,.11.09.2.19.2h1.8c1.04,0,1.57-.49,1.57-1.46s-.53-1.39-1.57-1.39h-1.8Z"/><path d="m295.43,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/><path d="m299.64,297.97h-5.51v-9.15h5.31v.94h-4.02c-.11,0-.19.09-.19.19v2.83c0,.11.09.19.19.19h3.5v.92h-3.5c-.11,0-.19.09-.19.19v2.74c0,.11.09.2.19.2h4.21v.94Zm-5.48-.03h5.45v-.88h-4.18c-.12,0-.22-.1-.22-.23v-2.74c0-.12.1-.22.22-.22h3.47v-.85h-3.47c-.12,0-.22-.1-.22-.23v-2.83c0-.12.1-.23.22-.23h3.99v-.88h-5.25v9.09Z"/><path d="m332.19,297.04c-.11,0-.21-.09-.21-.21v-2.74c0-.12.09-.21.21-.21h3.49v-.89h-3.49c-.11,0-.21-.09-.21-.21v-2.83c0-.12.09-.21.21-.21h4v-.91h-5.28v9.12h5.48v-.91h-4.2Z"/><path d="m336.41,297.97h-5.51v-9.15h5.32v.94h-4.02c-.1,0-.19.09-.19.19v2.83c0,.1.09.19.19.19h3.5v.92h-3.5c-.1,0-.19.09-.19.19v2.74c0,.11.09.2.19.2h4.21v.94Zm-5.48-.03h5.45v-.88h-4.18c-.12,0-.22-.1-.22-.23v-2.74c0-.12.1-.22.22-.22h3.47v-.85h-3.47c-.12,0-.22-.1-.22-.23v-2.83c0-.12.1-.23.22-.23h3.99v-.88h-5.25v9.09Z"/><path d="m316.06,288.83v5.88c0,1.59-.8,2.43-2.33,2.43s-2.34-.84-2.34-2.43v-5.88h-1.07v5.96c0,2.06,1.28,3.28,3.42,3.28s3.4-1.23,3.4-3.28v-5.96h-1.08Z"/><path d="m313.73,298.09c-2.15,0-3.43-1.23-3.43-3.3v-5.98h1.1v5.9c0,1.58.81,2.41,2.33,2.41s2.31-.83,2.31-2.41v-5.9h1.11v5.98c0,2.07-1.28,3.3-3.42,3.3Zm-3.4-9.25v5.95c0,2.05,1.27,3.27,3.4,3.27s3.39-1.22,3.39-3.27v-5.95h-1.05v5.87c0,1.6-.81,2.44-2.34,2.44s-2.36-.85-2.36-2.44v-5.87h-1.04Z"/><path d="m318.66,288.83v.91h2.61c.11,0,.21.09.21.21v8h1.07v-8c0-.12.09-.21.21-.21h2.61v-.91h-6.71Z"/><path d="m322.57,297.97h-1.11v-8.01c0-.11-.09-.2-.19-.2h-2.63v-.94h6.74v.94h-2.62c-.11,0-.19.08-.19.2v8.01Zm-1.07-.03h1.04v-7.98c0-.13.1-.23.22-.23h2.59v-.88h-6.68v.88h2.59c.12,0,.22.1.22.23v7.98Z"/><polygon points="279.63 296.24 279.63 288.83 277.74 288.83 277.74 297.99 282.33 297.99 284.1 296.24 279.63 296.24"/><polygon points="272.26 288.45 268.04 297.99 270 297.99 272.23 292.62 274.44 297.99 276.46 297.99 272.26 288.45"/>`,
};


