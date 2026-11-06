/* ═══════════════════════════════════════
   VITALBEAUTIE — Official Governance Rule Data (Rule as Data)
   Based on VITALBEAUTIE Brand Identity Guidelines & Product Map
   ═══════════════════════════════════════ */

/* ─── 모듈 1: 식별자 (로고 및 심볼) 기준 ─── */
export const IDENTITY = {
  logo: {
    text: 'VITALBEAUTIE',
    wordmarkBold: 'VITAL',
    wordmarkLight: 'BEAUTIE',
    aspect: 7.2,
    clearspace: 1.0,         /* 공식 가이드: 1X 여백 확보 필수 */
    minPrintMm: 20,          /* 공식 가이드: 영문 가로폭 최소 20mm */
    minDigitalPx: 120,
    svgPath: '/assets/logos/vitalbeautie_wordmark.svg',
    uploadedPng: '/assets/logos/vitalbeautie_uploaded.png'
  },
  logoKo: {
    text: '바이탈뷰티',
    clearspace: 1.0,         /* 공식 가이드: 1X 여백 확보 필수 */
    minPrintMm: 30,          /* 공식 가이드: 국문 가로폭 최소 30mm */
    minDigitalPx: 140,
    svgPath: '/assets/logos/vitalbeautie_wordmark_ko.svg'
  },
  symbol: {
    name: 'LAB PROVEN',
    desc: 'Lab Solution by V=B Laboratory / cooperation development',
    clearspace: 1.0,         /* 1X 여백 */
    minPrintMm: 15,          /* 공식 가이드: 심볼 최소 직경 15mm */
    minDigitalPx: 90,
    svgPath: '/assets/logos/vitalbeautie_lab_proven.svg',
    svgWhitePath: '/assets/logos/vitalbeautie_lab_proven_white.svg'
  },
  versions: [
    { id: 'black', label: 'VITALBEAUTIE BLACK', hex: '#101820', pantone: 'Black 6c' },
    { id: 'white', label: 'Pure White', hex: '#FFFFFF', pantone: 'White' },
  ],
  minContrast: 4.5,
  touchpoints: {
    'package.carton': { label: '패키지 · 단상자 앰플', unit: 'mm', w: 45, h: 140, sizeRatio: [0.65, 0.8], anchors: ['top-center', 'center'] },
    'package.tube':   { label: '패키지 · 튜브 100ml', unit: 'mm', w: 50, h: 160, sizeRatio: [0.6, 0.75], anchors: ['upper-third'] },
    'online.pdp':     { label: '온라인 · PDP 상세페이지', unit: 'px', w: 860, h: 1200, sizeRatio: [0.25, 0.35], anchors: ['top-left', 'top-center'] },
    'online.sns':     { label: '온라인 · SNS 1:1', unit: 'px', w: 1080, h: 1080, sizeRatio: [0.22, 0.3], anchors: ['bottom-right', 'top-left'] },
    'vmd.fixture':    { label: 'VMD · 백화점/매장 집기', unit: 'mm', w: 1200, h: 300, sizeRatio: [0.4, 0.55], anchors: ['center'], viewDistanceM: 3 },
  },
};

/* ─── 모듈 2: 비주얼 DNA & LAB PROVEN ─── */
export const VISUAL_DNA = {
  grid: 24,
  padding: 2,
  stroke: 1.5,
  strokeTolerance: 0.25,
  cornerRadius: 0, /* Strict editorial sharp corners */
  lineCap: 'round',
  maxColors: 2,
  palette: ['#101820', '#FFFFFF', '#9C874A'],
  motif: 'lab-proven-seal', // 시그니처: LAB PROVEN 엠블럼 인장
  curveRatioMin: 0.5,
};

export const DNA_KEYWORDS = {
  function: {
    '보습 (슈퍼콜라겐)': 'drop',
    '슬리밍 (메타그린)': 'leaf',
    '항산화 (슈퍼레티놀)': 'sparkle',
    '관절연골 (조이스텝)': 'wave',
    '진정 (슈퍼시카B5)': 'ring',
    '눈피로 (트루아이)': 'circle',
    '수면 (굿슬립가바)': 'star',
    '명작수 (홍삼진생)': 'sun',
  },
  country: {
    KR: { label: '한국 (식약처)', accent: 'hanok-curve' },
    US: { label: '미국 (FDA)', accent: 'star' },
    JP: { label: '일본 (소비자청)', accent: 'circle' },
    CN: { label: '중국 (SAMR)', accent: 'cloud' },
    EU: { label: '유럽 (EFSA)', accent: 'arch' },
  },
};

/* ─── 모듈 3: 전체 채널/카테고리별 제품군 & 공식 팬톤 라인 ─── */
export const PACKAGE_LINES = {
  /* 채널별 전체 제품 팬톤 데이터베이스 (Brand Color 페이지 100% 동기화) */
  allProducts: [
    // [이커머스 - 이너뷰티]
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼에센셜', pantone: 'PANTONE 213 C', hex: '#E31C79' },
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼콜라겐', pantone: 'PANTONE 230 C', hex: '#F4A6D7' },
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼레티놀 C', pantone: 'PANTONE 394 C', hex: '#EDE939' },
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼시카 B5', pantone: 'PANTONE 353 C', hex: '#80E0A7' },
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼콜라겐 케라핏', pantone: 'PANTONE 230 C', hex: '#F4A6D7' },
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼 바이오틱스', pantone: 'PANTONE 2645 C', hex: '#AD96DC' },
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼콜라겐 PDRN', pantone: 'PANTONE 2345 C', hex: '#FF6D6A' },
    { channel: '이커머스', category: '이너뷰티', name: '슈퍼레티놀 젤리', pantone: 'PANTONE 3945 C', hex: '#F3E500' },

    // [이커머스 - 슬리밍]
    { channel: '이커머스', category: '슬리밍', name: '메타그린 슬림업', pantone: 'PANTONE 348 C', hex: '#00843D' },
    { channel: '이커머스', category: '슬리밍', name: '메타그린 부스터샷 7일', pantone: 'PANTONE 348 C', hex: '#00843D' },
    { channel: '이커머스', category: '슬리밍', name: '메타그린 젤리 이너컷', pantone: 'PANTONE 348 C', hex: '#00843D' },
    { channel: '이커머스', category: '슬리밍', name: '메타그린 젤리 더블컷', pantone: 'PANTONE 144 C', hex: '#ED8B00' },
    { channel: '이커머스', category: '슬리밍', name: '메타그린 젤리 애사비', pantone: 'PANTONE 3546 C', hex: '#C00D1E' },
    { channel: '이커머스', category: '슬리밍', name: '메타그린 클린티', pantone: 'PANTONE 2270 C', hex: '#2DC84D' },
    { channel: '이커머스', category: '슬리밍', name: '메타그린 크레아틴', pantone: 'PANTONE 348 C', hex: '#00843D' },

    // [이커머스 - 기억력 / 숙면 / 유산균]
    { channel: '이커머스', category: '기억력', name: '에너지샷 바디앤브레인', pantone: 'PANTONE 294 C', hex: '#002F6C' },
    { channel: '이커머스', category: '숙면', name: '굿슬립 가바 365', pantone: 'PANTONE 2112 C', hex: '#351F65' },
    { channel: '이커머스', category: '유산균', name: '녹차에서 온 유산균', pantone: 'PANTONE 802 C', hex: '#44D62C' },

    // [뉴커머스 - 콜라겐 & 우먼]
    { channel: '뉴커머스', category: '콜라겐', name: '슈퍼콜라겐 플래티넘', pantone: 'PANTONE 214 C', hex: '#CE0F69' },
    { channel: '뉴커머스', category: '콜라겐', name: '슈퍼콜라겐 골드', pantone: 'PANTONE 214 C', hex: '#CE0F69' },
    { channel: '뉴커머스', category: '우먼', name: '우먼밸런스 플래티넘', pantone: 'PANTONE 207 C', hex: '#A60034' },
    { channel: '뉴커머스', category: '우먼', name: '우먼밸런스 골드', pantone: 'PANTONE 207 C', hex: '#A60034' },

    // [뉴커머스 - 뉴트리션 & 유산균]
    { channel: '뉴커머스', category: '뉴트리션', name: '올인원 멀티팩', pantone: 'PANTONE 871 C', hex: '#84754E' },
    { channel: '뉴커머스', category: '뉴트리션', name: '액티브 멀티팩', pantone: 'PANTONE 165 C', hex: '#FF671F' },
    { channel: '뉴커머스', category: '뉴트리션', name: '멀티비타민 미네랄', pantone: 'PANTONE 165 C', hex: '#FF671F' },
    { channel: '뉴커머스', category: '뉴트리션', name: '비타클렌즈', pantone: 'PANTONE 1505 C', hex: '#FF6900' },
    { channel: '뉴커머스', category: '유산균', name: '프로바이오틱스 골드', pantone: 'PANTONE 1235 C', hex: '#FFB81C' },
    { channel: '뉴커머스', category: '유산균', name: '프로바이오틱스&이뮨', pantone: 'PANTONE 1235 C', hex: '#FFB81C' },

    // [뉴커머스 - 기능별]
    { channel: '뉴커머스', category: '신진대사', name: '메타그린 골드', pantone: 'PANTONE 348 C', hex: '#00843D' },
    { channel: '뉴커머스', category: '신진대사', name: '메타그린 멀티팩', pantone: 'PANTONE 348 C', hex: '#00843D' },
    { channel: '뉴커머스', category: '관절.근육', name: '조이스텝', pantone: 'PANTONE 2173 C', hex: '#0084D5' },
    { channel: '뉴커머스', category: '관절.근육', name: '오메가케어', pantone: 'PANTONE 301 C', hex: '#004B87' },
    { channel: '뉴커머스', category: '눈.간', name: '트루아이', pantone: 'PANTONE 2746 C', hex: '#171CBF' },
    { channel: '뉴커머스', category: '눈.간', name: '리버프라임', pantone: 'PANTONE 2091 C', hex: '#4C12A1' },
    { channel: '뉴커머스', category: '구강', name: '덴프레쉬', pantone: 'PANTONE 3252 C', hex: '#2AD2C9' },

    // [뉴커머스 - 명작수]
    { channel: '뉴커머스', category: '명작수', name: '극진단 금분', pantone: '금분 (Gold Powder)', hex: '#D4AF37' },
    { channel: '뉴커머스', category: '명작수', name: '명작수', pantone: 'PANTONE 4625 C', hex: '#4F2C1D' },
    { channel: '뉴커머스', category: '명작수', name: '명작수 EC', pantone: 'PANTONE 4685 C', hex: '#E0C8AD' },
    { channel: '뉴커머스', category: '명작수', name: '명작수 OY', pantone: 'PANTONE 4685 C', hex: '#E0C8AD' },
    { channel: '뉴커머스', category: '명작수', name: '명작수 활', pantone: 'PANTONE 289 C', hex: '#0C2340' },
    { channel: '뉴커머스', category: '명작수', name: '명작수 천', pantone: '지류 비터 초콜릿', hex: '#2B1A12' },
  ],

  /* 대표 벤치마크 라인 (Family-Look Checker 기준) */
  lines: [
    { id: 'meta-green', name: '메타그린 (슬리밍)', pantone: '348C', hex: '#00843D' },
    { id: 'super-collagen', name: '슈퍼콜라겐 (이너뷰티)', pantone: '230C', hex: '#F479C9' },
    { id: 'super-retinol', name: '슈퍼레티놀 (항산화)', pantone: '394C', hex: '#EAF044' },
    { id: 'all-in-one', name: '올인원 멀티팩 (골드)', pantone: '871C', hex: '#86724C' },
    { id: 'myeongjaksu', name: '명작수 (진생베리)', pantone: '4625C', hex: '#4F2C1D' },
  ],

  familyRules: { minDeltaE: 14, lightness: [30, 88], chroma: [20, 85] },
  baseSpec: 'carton-50',
  specs: [
    { id: 'carton-50', label: '단상자 50ml (앰플/세럼)', w: 45, h: 140 },
    { id: 'carton-30', label: '단상자 30ml', w: 38, h: 118 },
    { id: 'carton-15', label: '단상자 15ml (부스터샷)', w: 30, h: 92 },
    { id: 'tube-100',  label: '튜브 100ml / 파우치', w: 50, h: 160 },
  ],
  elements: ['logo', 'graphic', 'info'],
  tolerance: 0.05,
};

/* ─── 모듈 4: 국가별 필수 규정 ─── */
export const REGULATIONS = {
  KR: { label: '한국', source: '식품의약품안전처 「건강기능식품의 표시기준」 / 「식품등의 표시기준」(제2026-37호)', minPt: 10, smallPanelCm2: 100, smallPanelPt: 7,
        mandatory: ['제품명', '내용량', '원재료명', '영양·기능정보', '섭취방법', '주의사항'], certs: ['건강기능식품'] },
  US: { label: '미국', source: 'FDA 21 CFR 101 / Dietary Supplement', minPt: 4.5, smallPanelCm2: 77, smallPanelPt: 3.2,
        mandatory: ['Product Name', 'Supplement Facts', 'Net Quantity', 'Ingredients', 'Distributor', 'Directions', 'Warnings'], certs: [] },
  JP: { label: '일본', source: '消費者庁 食品表示基準 / 機能性表示食品', minPt: 5.5, smallPanelCm2: 50, smallPanelPt: 4.5,
        mandatory: ['品名', '内容量', '原材料名', '栄養成分表示', '届出番号', '製造所', '摂取方法 및 注意'], certs: ['機能性表示'] },
  CN: { label: '중국', source: 'SAMR 保健食品标签说明书管理办法', minPt: 6, smallPanelCm2: 50, smallPanelPt: 5,
        mandatory: ['产品名称', '净含量', '原料与辅料', '功效成分', '注册人', '保质期', '食用方法', '蓝帽子'], certs: ['蓝帽子(SAMR)'] },
  EU: { label: '유럽', source: 'EFSA / Directive 2002/46/EC', minPt: 6, smallPanelCm2: 50, smallPanelPt: 4,
        mandatory: ['Product Name', 'Net Quantity', 'Nutrient Profile', 'Responsible Food Business', 'Batch', 'Best Before'], certs: [] },
};

/* 언어별 서체 룰 (공식: 영문 Raleway, 국문 RIX-신고딕) */
export const LOCALE_TYPO = {
  ko: { label: '국문', font: "'RIX-신고딕se-pro', 'RIX-신고딕', 'Noto Sans KR'", baseLeading: 1.5, minLeading: 1.3, minTracking: -0.01 },
  en: { label: '영문', font: "'Raleway', 'Outfit'", baseLeading: 1.35, minLeading: 1.15, minTracking: -0.01 },
  ja: { label: '일문', font: "'Noto Sans JP', 'Noto Sans KR'", baseLeading: 1.6, minLeading: 1.35, minTracking: -0.02 },
  zh: { label: '중문', font: "'Noto Sans SC', 'Noto Sans KR'", baseLeading: 1.6, minLeading: 1.35, minTracking: -0.02 },
};

export const SAMPLE_COPY = {
  ko: '제품명: 바이탈뷰티 슈퍼콜라겐\n내용량: 25ml × 28포 (700ml)\n원재료명: AP콜라겐효소분해펩타이드, 히알루론산, 엘라스틴, 비타민C, 정제수\n섭취방법: 1일 1회, 1회 1포를 그대로 섭취하십시오.\n주의사항: 임산부 및 수유부는 섭취 전 전문의와 상담하십시오.',
  en: 'Product Name: VITALBEAUTIE Super Collagen\nNet Quantity: 25ml × 28 Ampoules (700ml / 23.66 fl.oz.)\nIngredients: AP Collagen Enzymatic Peptides, Hyaluronic Acid, Elastin, Vitamin C, Purified Water\nDirections: Take one ampoule once daily.\nWarnings: Consult a healthcare professional before use if pregnant or nursing.',
  ja: '品名：バイタルビューティー スーパーコラーゲン\n内容量：25ml × 28本 (700ml)\n原材料名：APコラーゲンペプチド、ヒ알루론산、エラスチン、ビタミンC、精製水\nお召し上がり方：1日1回、1回1本を目安にお召し上がりください。',
  zh: '产品名称：VITALBEAUTIE 胶原蛋白口服液\n净含量：25ml × 28支 (700ml)\n配料表：AP胶原蛋白肽、透明质酸、弹性蛋白、维生素C、纯化水\n食用方法及食用量：每日1次，每次1支。',
};
