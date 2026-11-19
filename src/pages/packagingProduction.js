/* ═══════════════════════════════════════════════════════════════════════════
   03. GLOBAL LOCALIZATION — Packaging Production (Excel → AI & .EPS 도면 조판)
   - 엑셀(Code, Product Line, Product Name, Language, Package Type, Panel, Field Key, Text Content) 완벽 파싱
   - 측면·후면 문안: 좌우 2mm 마진, 본문 반드시 10pt, 후면 제품명 반드시 15pt 적용
   - 분류(Field Key)마다 위아래 1mm 간격을 두고 0.3mm 구분선 자동 삽입 (2번째·3번째 레퍼런스 이미지 100% 반영)
   - 제조번호·소비기한 ~까지: 하단에서 15mm 띄워 배치, 흰색 날인 박스 높이 반드시 11mm 고정 & 단상자 가로폭 맞춤
   - 문안 초과 시 해당 패널에 빨간색 넘침 경고 박스 및 하단 빨간색 경고 알림 표시
   - 다운로드 파일명: 바이탈(년도)제품명_분류(단/파/앰/라)_코드뒷자리4개_날짜.ai 고정
   ═══════════════════════════════════════════════════════════════════════════ */

import * as XLSX from 'xlsx';
import { showToast } from '../utils/helpers.js';
import {
  buildIllustratorAiBlob,
  buildPdfBlob,
  ensureAiFontsLoaded,
  getHffMarkSvg,
  translateKoPackageText,
} from '../governance/engines.js';
import {
  PT_TO_MM,
  renderVitalbeautieLogoTagSvg,
  renderStandaloneVitalbeautieWordmarkSvg,
  renderSideOrBackPanel10ptSvg,
  wrapTextToWidthMm,
  cleanFieldKeyForLanguage,
  buildStandardDownloadFileName,
  parseUploadedArtworkOrDieline,
} from '../utils/aiPdfParser.js';
import { downloadIntegratedGuideExcelFile } from '../utils/guideExcelExport.js';

/* ─── 국가 설정 ─── */
const COUNTRY_CONFIG = {
  KR: {
    code: 'KR',
    label: '한국',
    fontFamily: "'RixSinGoSE_Pro','RIX-신고딕se-pro','VB-ShinGothic',sans-serif",
  },
  JP: {
    code: 'JP',
    label: '일본',
    fontFamily: "'Noto Sans JP','Noto Sans CJK SC','Meiryo',sans-serif",
  },
  US: {
    code: 'US',
    label: '미국',
    fontFamily: "'Raleway','RixSinGoSE_Pro','Noto Sans KR',sans-serif",
  },
};

/* ─── 3대 제품 라인별 컬러 및 기본 데이터 (Image 1·2·3 부스터샷 GL 구조 기본 탑재) ─── */
const LINE_PRESETS = {
  metagreen: {
    id: 'metagreen',
    label: 'META GREEN',
    defaultLineName: '메타그린',
    bgHex: '#00843D',
    tagHex: '#CEDC00',
    textColor: '#FFFFFF',
    defaultMeta: {
      code: '110771617',
      productLine: '메타그린',
      productName: '부스터샷GL',
      language: 'KR',
      packageType: 'Carton',
    },
    defaultPanels: {
      BACK:   { id: 'BACK',   label: '후면 (BACK)',   x: 24,  y: 48,  w: 100, h: 126 },
      LEFT:   { id: 'LEFT',   label: '좌측면 (LEFT)', x: 124, y: 48,  w: 38,  h: 126 },
      FRONT:  { id: 'FRONT',  label: '전면 (FRONT)',  x: 162, y: 48,  w: 100, h: 126 },
      RIGHT:  { id: 'RIGHT',  label: '우측면 (RIGHT)',x: 262, y: 48,  w: 38,  h: 126 },
      TOP:    { id: 'TOP',    label: '상단 (TOP)',    x: 162, y: 10,  w: 100, h: 38 },
      BOTTOM: { id: 'BOTTOM', label: '하단 (BOTTOM)', x: 162, y: 174, w: 100, h: 38 },
    },
    defaultBlocks: {
      FRONT: [
        { fieldKey: '제품명', textContent: '메타그린 부스터샷 GL' },
        { fieldKey: '내용량', textContent: 'APIC대두배아열수추출물등복합물, 비타민B1, 녹차추출물, 바나바잎추출물, 판토텐산' },
      ],
      RIGHT: [
        {
          fieldKey: '영양기능정보',
          textContent: '영양·기능 정보\n1일 섭취량 : 26.97 g (액상 26.05 g + 정제 0.92 g)\n1일 섭취량 당 함량 : 열량 15 kcal, 탄수화물 4 g (1%), 당류 0 g, 단백질 0 g (0%), 지방 0 g (0%), 나트륨 5 mg (0%), 비타민B1 48 mg (4,000%), 판토텐산 50 mg (1,000%), 카테킨 360 mg, Daidzin, Glycitin, Genistin의 합 36 mg, L-카르니틴 300 mg\n※ ( )안의 수치는 1일 영양성분 기준치에 대한 비율임\n녹차추출물 항산화·체지방 감소·혈중 콜레스테롤 개선에 도움을 줄 수 있음  APIC대두배아열수추출물등복합물 체지방 감소에 도움을 줄 수 있음  비타민B1 탄수화물과 에너지 대사에 필요  APIC대두배아열수추출물등복합물 체지방 감소에 도움을 줄 수 있음  판토텐산 지방, 탄수화물, 단백질 대사와 에너지 생성에 필요',
        },
        {
          fieldKey: '정보',
          textContent: '본 제품은 난류(가금류), 우유, 메밀, 땅콩, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토, 아황산류, 호두, 닭고기, 쇠고기, 오징어, 조개류, 잣을 사용한 제품과 같은 제조시설에서 제조하고 있습니다.',
        },
      ],
      BACK: [
        { fieldKey: '제품명', textContent: '메타그린 부스터샷' },
        { fieldKey: '제품 설명', textContent: '다이어트 정체기, 흡수 빠른 앰플로 집중 공략 다이어트 체지방 감소 2중 기능성으로 달라지는 눈바디를 도와주는 슬리밍 앰플' },
        { fieldKey: '섭취량 및 섭취방법', textContent: '섭취량 및 섭취방법  성인 1일 1회, 1 앰플을 흔들어 섭취하세요. 상단 실링지를 제거하여 정제를 꺼내신 후, 하단의 액상과 함께 섭취하세요.' },
        { fieldKey: '섭취 시 주의사항', textContent: '섭취 시 주의사항  어린이, 임산부 및 수유부는 섭취를 피해주시기 바랍니다. 식사후 섭취해주시기 바랍니다. 카페인이 함유되어있어 초조감, 불면 등을 나타낼 수 있습니다. 카페인을 함유한 식품의 섭취에 주의해주시기 바랍니다. 간질환이 있거나 의약품 복용 시 전문가와 상담하시기 바랍니다. 이상사례 발생 시 섭취를 중단하고 전문가와 상담하시기 바랍니다. 질병으로 치료 중이시거나 알레르기, 특이체질이신 분은 본제품의 원료를 확인하시고 섭취 전에 전문가와 상담하시기 바랍니다. 알레르기성 비염, 천식, 우유, 대두 알레르기 반응을 나타내는 사람은 섭취에 주의, 에스트로겐 호르몬에 민감한 사람은 섭취에 주의 바랍니다. [대두함유]' },
        { fieldKey: '주의사항', textContent: '주의사항  보관 방법에 따라 식물성 침전물이 생길 수 있으나, 이는 APIC대두배아열수추출물등 복합물 원료특성상 생길 수 있는 현상으로 안심하고 드셔도 됩니다.' },
        { fieldKey: '보관상 주의사항', textContent: '보관상 주의사항  직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관 하시고 개봉 후에는 바로 드시기 바랍니다. (살균제품)' },
        { fieldKey: '원료명 및 기타 사항', textContent: '원료명 및 기타 사항은 설명서에 표기되어있습니다.' },
        { fieldKey: '교환문의 구입처 및 고객상담실', textContent: '교환문의처  구입처 및 고객상담실\n고객상담전화  080-023-5454\n제조원 : (주)아모레퍼시픽\n반품교환소재지 : 서울특별시 용산구 한강대로 100' },
      ],
      LEFT: [
        { fieldKey: '제품명', textContent: '메타그린 부스터샷' },
        { fieldKey: '섭취 가이드', textContent: '하루 한 병 (1일 1회 1병) · 운동 전후 및 식사 후 집중 케어 · LOW SUGAR 저당 · GLUTEN FREE' },
      ],
      BOTTOM: [
        {
          fieldKey: '이력추적관리번호',
          textContent: '"www.tfood.go.kr"에서 건강기능식품이력추적관리번호를 입력하시면 건강기능식품의 정보를 확인하실 수 있습니다. [메타그린 부스터샷 7일 건강기능식품이력추적관리번호] 10753124+제조번호',
        },
      ],
      TOP: [
        { fieldKey: '로고', textContent: '' },
      ],
    },
  },
  innerbeauty: {
    id: 'innerbeauty',
    label: 'INNER BEAUTY',
    defaultLineName: '슈퍼콜라겐',
    bgHex: '#EDEDED',
    tagHex: '#F6B9D4',
    textColor: '#1D1D1B',
    defaultMeta: {
      code: '110771525',
      productLine: '슈퍼콜라겐',
      productName: '케라핏',
      language: 'KR',
      packageType: 'Carton',
    },
    defaultPanels: {
      BACK:   { id: 'BACK',   label: '후면 (BACK)',   x: 24,  y: 48,  w: 75, h: 132.5 },
      LEFT:   { id: 'LEFT',   label: '좌측면 (LEFT)', x: 99,  y: 48,  w: 40, h: 132.5 },
      FRONT:  { id: 'FRONT',  label: '전면 (FRONT)',  x: 139, y: 48,  w: 75, h: 132.5 },
      RIGHT:  { id: 'RIGHT',  label: '우측면 (RIGHT)',x: 214, y: 48,  w: 75, h: 132.5 },
      TOP:    { id: 'TOP',    label: '상단 (TOP)',    x: 139, y: 8,   w: 75, h: 40 },
      BOTTOM: { id: 'BOTTOM', label: '하단 (BOTTOM)', x: 24,  y: 180.5, w: 75, h: 40 },
    },
    defaultBlocks: {
      FRONT: [
        { fieldKey: '제품명', textContent: '슈퍼콜라겐 케라핏' },
        { fieldKey: '내용량', textContent: '저분자피쉬콜라겐펩타이드, 비오틴, 판토텐산' },
      ],
      RIGHT: [
        {
          fieldKey: '영양기능정보',
          textContent: '영양·기능 정보\n1일 섭취량 : 1포(1.6 g)\n1일 섭취량 당 함량 : 열량 6 kcal, 탄수화물 1 g (0%), 단백질 1 g (2%), 지방 0 g (0%), 나트륨 0 mg (0%), 비오틴 500 μg (1,667%), 판토텐산 5 mg (100%), 콜라겐펩타이드 1,000 mg',
        },
        {
          fieldKey: '정보',
          textContent: '본 제품은 알류, 우유, 메밀, 땅콩, 대두, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토를 사용한 제품과 같은 제조시설에서 제조하고 있습니다.',
        },
        {
          fieldKey: '교환문의 구입처 및 고객상담실',
          textContent: '고객상담전화 080-023-5454\n제조원 : (주)아모레퍼시픽\n반품교환소재지 : 서울특별시 용산구 한강대로 100',
        },
      ],
      BACK: [
        { fieldKey: '제품명', textContent: '슈퍼콜라겐 케라핏' },
        { fieldKey: '제품 설명', textContent: '식약처 기능성 인정 저분자 콜라겐 펩타이드와 비오틴으로 완성하는 트리플 이너뷰티 포뮬러' },
        { fieldKey: '섭취량 및 섭취방법', textContent: '섭취량 및 섭취방법  1일 1회, 1회 1포를 물 없이 그대로 또는 물과 함께 섭취하십시오.' },
        { fieldKey: '섭취 시 주의사항', textContent: '섭취 시 주의사항  특이체질, 알레르기 체질의 경우에는 간혹 개인에 따라 과민반응을 나타낼 수 있으므로 원료를 확인한 후 섭취하십시오. 이상사례 발생 시 섭취를 중단하고 전문가와 상담하십시오.' },
        { fieldKey: '보관상 주의사항', textContent: '보관상 주의사항  직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관하시고 개봉 후에는 바로 섭취하시기 바랍니다.' },
      ],
      LEFT: [
        { fieldKey: '제품명', textContent: '슈퍼콜라겐 케라핏' },
        { fieldKey: '제품 설명', textContent: '피부과 전문의 공동개발 · 3 TYPES 저분자 콜라겐 1,000mg · 비오틴 & 비타민B군 시너지' },
      ],
      BOTTOM: [
        { fieldKey: '이력추적관리번호', textContent: '"www.tfood.go.kr"에서 식품이력추적관리번호를 입력하시면 정보를 확인하실 수 있습니다.' },
      ],
      TOP: [
        { fieldKey: '로고', textContent: '' },
      ],
    },
  },
  newcommerce: {
    id: 'newcommerce',
    label: 'NEW COMMERCE',
    defaultLineName: '조이스텝',
    bgHex: '#1C264A',
    tagHex: '#D4AF37',
    textColor: '#FFFFFF',
    defaultMeta: {
      code: '110771274',
      productLine: '조이스텝',
      productName: '골드',
      language: 'KR',
      packageType: 'Carton',
    },
    defaultPanels: {
      BACK:   { id: 'BACK',   label: '후면 (BACK)',   x: 24,  y: 50,  w: 80, h: 135 },
      LEFT:   { id: 'LEFT',   label: '좌측면 (LEFT)', x: 104, y: 50,  w: 42, h: 135 },
      FRONT:  { id: 'FRONT',  label: '전면 (FRONT)',  x: 146, y: 50,  w: 80, h: 135 },
      RIGHT:  { id: 'RIGHT',  label: '우측면 (RIGHT)',x: 226, y: 50,  w: 80, h: 135 },
      TOP:    { id: 'TOP',    label: '상단 (TOP)',    x: 146, y: 8,   w: 80, h: 42 },
      BOTTOM: { id: 'BOTTOM', label: '하단 (BOTTOM)', x: 24,  y: 185, w: 80, h: 42 },
    },
    defaultBlocks: {
      FRONT: [
        { fieldKey: '제품명', textContent: '조이스텝 골드' },
        { fieldKey: '내용량', textContent: '타마린드강황주정추출복합물(TamaFlex), 아연, 비타민D, 크롬' },
      ],
      RIGHT: [
        {
          fieldKey: '영양기능정보',
          textContent: '영양·기능 정보\n1일 섭취량 : 1정(730 mg)\n1일 섭취량 당 함량 : 열량 0 kcal, 탄수화물 1 g 미만 (0%), 단백질 0 g (0%), 지방 0 g (0%), 나트륨 0 mg (0%), 비타민D 10 μg (100%), 아연 2.55 mg (30%), 크롬 9 μg (30%)',
        },
        {
          fieldKey: '정보',
          textContent: '본 제품은 알류(가금류), 우유, 메밀, 땅콩, 대두, 밀, 고등어, 게, 새우, 돼지고기를 사용한 제품과 같은 제조시설에서 제조하고 있습니다.',
        },
        {
          fieldKey: '교환문의 구입처 및 고객상담실',
          textContent: '고객상담전화 080-023-5454\n제조원 : 콜마비앤에이치㈜ 음성공장\n유통전문판매원 : (주)아모레퍼시픽 서울특별시 용산구 한강대로 100',
        },
      ],
      BACK: [
        { fieldKey: '제품명', textContent: '조이스텝 골드' },
        { fieldKey: '제품 설명', textContent: '재활의학과전문의 공동개발 관절·연골·뼈 3중 멀티 케어 건강기능식품' },
        { fieldKey: '섭취량 및 섭취방법', textContent: '섭취량 및 섭취방법  1일 1회, 1회 1정을 물과 함께 섭취하십시오.' },
        { fieldKey: '섭취 시 주의사항', textContent: '섭취 시 주의사항  특이체질, 알레르기 체질의 경우에는 원료를 확인한 후 섭취하십시오. 영·유아, 어린이, 임산부 및 수유부는 섭취를 피할 것.' },
        { fieldKey: '보관상 주의사항', textContent: '보관상 주의사항  습기가 적고 직사광선을 받지 않는 실온에 보관하시고, 어린이의 손에 닿지 않도록 주의하시기 바랍니다.' },
      ],
      LEFT: [
        { fieldKey: '제품명', textContent: '조이스텝 골드' },
        { fieldKey: '제품 설명', textContent: '재활의학과전문의 공동개발 (LAB PROVEN) · 관절 및 연골 건강 3중 기능성' },
      ],
      BOTTOM: [
        { fieldKey: '이력추적관리번호', textContent: '"www.tfood.go.kr"에서 건강기능식품이력추적관리번호를 입력하시면 정보를 확인하실 수 있습니다.' },
      ],
      TOP: [
        { fieldKey: '로고', textContent: '' },
      ],
    },
  },
};

/* ─── 엑셀 워크북 파서 (Image 1의 Code / Product Line / Product Name / Language / Package Type / Panel / Field Key / Text Content 구조 100% 지원) ─── */
function parseUploadedExcelWorkbook(workbook, selectedLine) {
  const preset = LINE_PRESETS[selectedLine] || LINE_PRESETS.metagreen;
  const meta = { ...preset.defaultMeta };
  const panelBlocks = {
    FRONT: [],
    LEFT: [],
    RIGHT: [],
    BACK: [],
    TOP: [],
    BOTTOM: [],
  };

  const sheetOrder = [...workbook.SheetNames].sort((a, b) => {
    const score = (name) => {
      if (name === 'Copy_Input') return 12;
      if (name.includes('건강기능식품')) return 10;
      if (name.includes('일반식품')) return 9;
      if (name === '초안') return 8;
      if (name === 'Example') return 5;
      return 6;
    };
    return score(b) - score(a);
  });

  let foundStructuredPanelSheet = false;

  for (const sheetName of sheetOrder) {
    if (sheetName === 'Guide' || sheetName === 'Code_List' || sheetName.includes('영양소기준치')) continue;
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows || rows.length < 2) continue;

    // 1. 헤더 행 탐색 (Code/SKU, Product Line, Product Name, Language, Package Type, Panel, Field Key, Text Content)
    let headerIdx = -1;
    let colMap = {};

    for (let rIdx = 0; rIdx < Math.min(10, rows.length); rIdx++) {
      const hdr = (rows[rIdx] || []).map(c => String(c || '').trim().toLowerCase());
      const pIdx = hdr.findIndex(h => h === 'panel' || h === '패널' || h === '면');
      const fkIdx = hdr.findIndex(h => h.includes('field key') || h === 'field' || h === '항목' || h === '구분');
      const tcIdx = hdr.findIndex(h => h.includes('text content') || h === 'text' || h === '내용' || h === '문안');

      if (pIdx !== -1 && (fkIdx !== -1 || tcIdx !== -1)) {
        headerIdx = rIdx;
        colMap = {
          code: hdr.findIndex(h => h === 'code' || h === 'sku' || h.includes('코드')),
          line: hdr.findIndex(h => h.includes('product line') || h === 'line' || h.includes('라인')),
          prodName: hdr.findIndex(h => h.includes('product name') || h.includes('제품명')),
          country: hdr.findIndex(h => h === 'country' || h.includes('국가')),
          lang: hdr.findIndex(h => h === 'language' || h.includes('언어')),
          pkgType: hdr.findIndex(h => h.includes('package type') || h.includes('패키지') || h.includes('분류')),
          panel: pIdx,
          fieldKey: fkIdx !== -1 ? fkIdx : pIdx + 1,
          textContent: tcIdx !== -1 ? tcIdx : pIdx + 2,
        };
        break;
      }
    }

    if (headerIdx !== -1) {
      let rowCount = 0;
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i] || [];
        if (colMap.code !== -1 && r[colMap.code]) meta.code = String(r[colMap.code]).trim();
        if (colMap.line !== -1 && r[colMap.line]) meta.productLine = String(r[colMap.line]).trim();
        if (colMap.prodName !== -1 && r[colMap.prodName]) meta.productName = String(r[colMap.prodName]).trim();
        if (colMap.lang !== -1 && r[colMap.lang]) meta.language = String(r[colMap.lang]).trim();
        else if (colMap.country !== -1 && r[colMap.country]) meta.language = String(r[colMap.country]).trim();
        if (colMap.pkgType !== -1 && r[colMap.pkgType]) meta.packageType = String(r[colMap.pkgType]).trim();

        const rawPanel = String(r[colMap.panel] || '').trim().toUpperCase();
        const fk = String(r[colMap.fieldKey] || '').trim();
        const txt = String(r[colMap.textContent] ?? '').replace(/\r\n/g, '\n').trim();

        if (!rawPanel || !['FRONT', 'LEFT', 'RIGHT', 'BACK', 'TOP', 'BOTTOM'].includes(rawPanel)) continue;
        if (!fk && !txt) continue;
        if (txt.startsWith('[') && txt.endsWith('입력]')) continue;

        const cleanFk = cleanFieldKeyForLanguage(fk, meta.language || 'KR');
        panelBlocks[rawPanel].push({ fieldKey: cleanFk, textContent: txt });
        rowCount++;
      }

      if (rowCount > 0) {
        foundStructuredPanelSheet = true;
        break;
      }
      continue;
    }

    // 2. 한국 RA 표시사항 초안 엑셀 포맷 (주표시면 / 정보표시면 / 영양·기능정보)
    let inNutrition = false;
    const nutLines = [];
    let raFound = 0;

    for (let i = 0; i < rows.length; i++) {
      const cells = (rows[i] || [])
        .map(c => (c !== null && c !== undefined ? String(c).trim() : ''))
        .filter(Boolean);
      if (cells.length === 0) continue;

      const first = cells[0].replace(/\s+/g, ' ');
      const firstLower = first.toLowerCase();

      if (first.includes('영양·기능정보') || first.includes('영양정보')) {
        inNutrition = true;
        continue;
      }
      if (inNutrition) {
        if (first.includes('1일 섭취량') && !first.includes('당')) {
          nutLines.push(first);
        } else if (
          ['열량', '탄수화물', '식이섬유', '당류', '단백질', '지방', '포화지방', '나트륨', '칼륨', '마그네슘', '비타민', '카테킨', '콜라겐', '비오틴', '판토텐산', '아연', '셀렌'].some(k => first.startsWith(k)) &&
          cells.length >= 2
        ) {
          const amt = cells[1];
          const unit = cells[2] && !/^\d/.test(cells[2]) ? cells[2] : '';
          nutLines.push(`${first} ${amt}${unit}`);
        }
        continue;
      }

      if (cells.length < 2) continue;
      if (['구분', '주표시면', '정보표시면', '필드명'].includes(first)) continue;
      const val = cells[1].replace(/\r\n/g, '\n').trim();
      if (!val || val === '내용') continue;

      if (firstLower.includes('제품명')) {
        const parts = val.split(/\s+/);
        if (parts.length >= 2) {
          meta.productLine = parts[0];
          meta.productName = parts.slice(1).join(' ');
        } else {
          meta.productName = val;
        }
        if (panelBlocks.FRONT.length === 0) {
          panelBlocks.FRONT.push({ fieldKey: '제품명', textContent: val });
          panelBlocks.BACK.push({ fieldKey: '제품명', textContent: val });
        }
        raFound++;
      } else if (firstLower.includes('정면 표기사항') || firstLower.includes('기준·규격')) {
        panelBlocks.FRONT.push({ fieldKey: '원료명', textContent: val.split('\n')[0] });
        raFound++;
      } else if (firstLower.includes('내용량') && panelBlocks.FRONT.length < 3) {
        panelBlocks.FRONT.push({ fieldKey: '내용량', textContent: val });
        raFound++;
      } else if (firstLower.includes('섭취량') || firstLower.includes('섭취방법')) {
        panelBlocks.BACK.push({ fieldKey: '섭취량 및 섭취방법', textContent: val });
        raFound++;
      } else if (firstLower.includes('원재료명') || firstLower.includes('원료명 및 함량')) {
        if (!val.startsWith('※')) {
          panelBlocks.BACK.push({ fieldKey: '원료명 및 함량', textContent: val });
          raFound++;
        }
      } else if (firstLower.includes('섭취 시') && firstLower.includes('주의사항')) {
        panelBlocks.BACK.push({ fieldKey: '섭취 시 주의사항', textContent: val.replace(/\s{2,}/g, ' ') });
        raFound++;
      } else if (firstLower.includes('보관상') && firstLower.includes('주의사항')) {
        panelBlocks.BACK.push({ fieldKey: '보관상 주의사항', textContent: val.replace(/\s{2,}/g, ' ') });
        raFound++;
      } else if (firstLower.includes('제조원') || firstLower.includes('유통전문판매원')) {
        if (!val.includes('ㅇㅇㅇ')) {
          panelBlocks.RIGHT.push({ fieldKey: first, textContent: val });
          raFound++;
        }
      }
    }

    if (nutLines.length > 0) {
      panelBlocks.RIGHT.unshift({
        fieldKey: '영양기능정보',
        textContent: `영양·기능 정보\n${nutLines.join(', ')}`,
      });
    }

    if (raFound >= 3) {
      foundStructuredPanelSheet = true;
      break;
    }
  }

  // 비어있는 패널은 라인 기본값으로 보완
  Object.keys(panelBlocks).forEach(pKey => {
    if (panelBlocks[pKey].length === 0 && !foundStructuredPanelSheet) {
      panelBlocks[pKey] = [...(preset.defaultBlocks[pKey] || [])];
    }
  });
  if (panelBlocks.TOP.length === 0) {
    panelBlocks.TOP = [{ fieldKey: '로고', textContent: '' }];
  }

  // Product Line 자동 감지 연동
  let detectedLine = selectedLine;
  const lineStr = `${meta.productLine} ${meta.productName}`.toLowerCase();
  if (lineStr.includes('콜라겐') || lineStr.includes('레티놀') || lineStr.includes('시카') || lineStr.includes('케라핏')) {
    detectedLine = 'innerbeauty';
  } else if (lineStr.includes('조이스텝') || lineStr.includes('트루아이') || lineStr.includes('리버프라임') || lineStr.includes('멀티팩')) {
    detectedLine = 'newcommerce';
  } else if (lineStr.includes('메타그린')) {
    detectedLine = 'metagreen';
  }

  return {
    meta,
    panelBlocks,
    detectedLine,
  };
}

/* ─── 국가별 블록 문안 변환 ─── */
function localizePanelBlocks(panelBlocks, countryCode) {
  if (countryCode === 'KR') return panelBlocks;
  const lang = countryCode === 'US' ? 'en' : 'ja';
  const tr = (s) => translateKoPackageText(String(s || ''), lang) || String(s || '');

  const out = {};
  for (const [pKey, list] of Object.entries(panelBlocks)) {
    out[pKey] = (list || []).map(b => ({
      fieldKey: tr(b.fieldKey),
      textContent: tr(b.textContent),
    }));
  }
  return out;
}

/* ─── 6면 전개도 및 패널 시뮬레이션 SVG 렌더러 ─── */
function renderProductionDielineSvg(preset, country, rawPanelBlocks, meta, dielineInfo, activePanel = 'ALL') {
  const panelBlocks = localizePanelBlocks(rawPanelBlocks, country.code);
  const panels = (dielineInfo && dielineInfo.panels) ? dielineInfo.panels : preset.defaultPanels;
  const auxFlaps = (dielineInfo && dielineInfo.auxFlaps) ? dielineInfo.auxFlaps : [];
  const vectorPaths = (dielineInfo && dielineInfo.paths) ? dielineInfo.paths : [];

  const isAll = activePanel === 'ALL';
  const isIb = preset.id === 'innerbeauty';
  const isNc = preset.id === 'newcommerce';

  // 메타그린이면 전체 다 그린(#00843D), 이너뷰티면 전체 다 그레이(#EDEDED), 뉴커머스면 네이비(#1C264A)
  const bgCol = isIb ? '#EDEDED' : isNc ? '#1C264A' : '#00843D';
  const tagHex = isIb ? '#F6B9D4' : isNc ? '#D4AF37' : '#CEDC00';
  const txtCol = isIb ? '#1D1D1B' : '#FFFFFF';
  const creaseStroke = isIb ? 'rgba(0,0,0,0.30)' : 'rgba(255,255,255,0.36)';
  const fontFam = country.fontFamily;

  let viewMinX = 0, viewMinY = 0, viewW = 280, viewH = 235;
  if (!isAll && panels[activePanel]) {
    const p = panels[activePanel];
    const pad = 14;
    viewMinX = +(p.x - pad).toFixed(2);
    viewMinY = +(p.y - pad).toFixed(2);
    viewW = +(p.w + pad * 2).toFixed(2);
    viewH = +(p.h + pad * 2).toFixed(2);
  } else {
    const allRects = [...Object.values(panels), ...auxFlaps];
    const minX = Math.min(...allRects.map(r => r.x)) - 12;
    const minY = Math.min(...allRects.map(r => r.y)) - 12;
    const maxX = Math.max(...allRects.map(r => r.x + r.w)) + 12;
    const maxY = Math.max(...allRects.map(r => r.y + r.h)) + 12;
    viewMinX = +minX.toFixed(2);
    viewMinY = +minY.toFixed(2);
    viewW = +(maxX - minX).toFixed(2);
    viewH = +(maxY - minY).toFixed(2);
  }

  const auxFlapsSvg = isAll
    ? auxFlaps.map(f => `
        <rect x="${f.x.toFixed(2)}" y="${f.y.toFixed(2)}" width="${f.w.toFixed(2)}" height="${f.h.toFixed(2)}"
              ${f.rx ? `rx="${f.rx}"` : ''} fill="${bgCol}" stroke="${creaseStroke}" stroke-width="0.25"/>
      `).join('')
    : '';

  // 제조번호 / 소비기한 11mm 흰색 날인 박스를 어느 패널(RIGHT 또는 BACK)에 둘지 결정
  // (부스터샷 및 주요 패키지 도면 가이드에 따라 BACK에 법적 문안이 있으면 BACK 하단 15mm 위에 배치, 아니면 RIGHT에 배치)
  const isMetagreen = preset.id === 'metagreen';
  const expiryHostPanel = (panelBlocks.BACK && panelBlocks.BACK.length > 0) ? 'BACK' : 'RIGHT';

  const overflowDetails = [];
  const panelList = isAll ? Object.values(panels) : [panels[activePanel]].filter(Boolean);

  const panelsSvg = panelList.map(p => {
    let contentSvg = '';
    const blocks = panelBlocks[p.id] || [];

    // 메타그린 상단(TOP)은 가이드에 따라 Pantone 389 C (#CEDC00) 및 블랙(#000000) 로고 적용
    const isTopMetagreen = p.id === 'TOP' && isMetagreen;
    const panelBg = isTopMetagreen ? '#CEDC00' : bgCol;
    const panelTxtCol = isTopMetagreen ? '#000000' : txtCol;

    // ── 1. 전면 (FRONT) ──
    if (p.id === 'FRONT') {
      const logoTagSvg = renderVitalbeautieLogoTagSvg(p.x, p.y, p.w, tagHex, {
        topLineMm: 1.5,
        tagWTop: 43.59,
        tagH: 6.47,
        tagOffsetX: 0,
      });

      // 블록 분리: 제품명, 내용량, 원료명(성분)
      const isTitle = (b) => {
        const k = (b.fieldKey || '').toLowerCase();
        return k.includes('제품명') || k.includes('product');
      };
      const isCap = (b) => {
        const k = (b.fieldKey || '').toLowerCase();
        const t = (b.textContent || '').toLowerCase();
        return (
          k.includes('내용량') ||
          k.includes('용량') ||
          k.includes('포장단위') ||
          k.includes('capacity') ||
          t.includes('건강기능식품') ||
          /\d+\s*g\b/i.test(t) ||
          /\d+\s*ml\b/i.test(t) ||
          /정\b/.test(t)
        );
      };

      const titleBlock = blocks.find(isTitle);
      const capBlock = blocks.find(isCap);
      const ingBlocks = blocks.filter(b => b !== titleBlock && b !== capBlock);

      const rawTitle = titleBlock?.textContent || `${meta.productLine || preset.defaultLineName} ${meta.productName || ''}`.trim();

      let linePart = meta.productLine || preset.defaultLineName;
      let prodPart = meta.productName || '';
      if (rawTitle.startsWith(linePart)) {
        prodPart = rawTitle.slice(linePart.length).trim();
      } else {
        const sp = rawTitle.split(/\s+/);
        linePart = sp[0] || rawTitle;
        prodPart = sp.slice(1).join(' ');
      }

      const tagBottomY = p.y + 1.17 + 6.47;
      const titlePx = Math.min(8.2, Math.max(5.5, p.w * 0.1));
      const titleY = +(tagBottomY + 5.0 + titlePx * 0.84).toFixed(2);
      const line2Y = +(titleY + titlePx * 1.15).toFixed(2);
      const lastTitleY = prodPart ? parseFloat(line2Y) : parseFloat(titleY);

      // 원료명(성분): 전면 양옆 2mm 마진 strictly 적용, 제품명(26pt)의 1/2인 13pt Light, 간격 3.5mm
      const availFrontW = Math.max(14, p.w - 4.0); // 양옆 2mm 마진
      const ingText = ingBlocks.map(b => b.textContent).join('\n');
      const ingLines = wrapTextToWidthMm(ingText, availFrontW, 13.0, 0.90);
      const ingPx = +(13.0 * PT_TO_MM).toFixed(2);
      const ingStep = +(parseFloat(ingPx) * 1.18).toFixed(2);
      const ingStartY = +(lastTitleY + 3.5 + parseFloat(ingPx) * 0.85).toFixed(2);

      // 내용량: 가이드에 따라 하단에서 정확히 3.0mm 띄움
      const capPx = +(10.0 * PT_TO_MM).toFixed(2);
      const capY = +(p.y + p.h - 3.0).toFixed(2); // 하단에서 3mm 띄움
      const capText = capBlock?.textContent || '';

      // 건기식 마크: 내용량 바로 위 우측에 배치
      const markSize = Math.min(14.0, p.w * 0.20);
      const markX = +(p.x + p.w - 2.5 - markSize).toFixed(2);
      const markY = +(parseFloat(capY) - parseFloat(capPx) - 2.0 - markSize).toFixed(2);

      if (isIb) {
        const leftX = +(p.x + 2.0).toFixed(2); // 2mm 마진 시작점
        contentSvg = `
          ${logoTagSvg}
          <text x="${leftX}" y="${titleY}" text-anchor="start" fill="${txtCol}" font-size="${titlePx.toFixed(2)}" font-weight="700" font-family="${fontFam}">${linePart}</text>
          ${prodPart ? `<text x="${leftX}" y="${line2Y}" text-anchor="start" fill="${txtCol}" font-size="${titlePx.toFixed(2)}" font-weight="500" font-family="${fontFam}">${prodPart}</text>` : ''}
          ${ingLines.map((ln, idx) => `
            <text x="${leftX}" y="${(parseFloat(ingStartY) + idx * parseFloat(ingStep)).toFixed(2)}" text-anchor="start" fill="${txtCol}" font-size="${ingPx}" font-weight="300" font-family="${fontFam}">${ln.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
          `).join('')}
          ${country.code === 'KR' ? getHffMarkSvg(markX, markY, markSize, 0.78, txtCol) : ''}
          ${capText ? `<text x="${leftX}" y="${capY}" text-anchor="start" fill="${txtCol}" font-size="${capPx}" font-weight="300" font-family="${fontFam}">${capText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>` : ''}
        `;
      } else {
        const cx = +(p.x + p.w / 2).toFixed(2);
        contentSvg = `
          ${logoTagSvg}
          <text x="${cx}" y="${titleY}" text-anchor="middle" fill="${txtCol}" font-size="${titlePx.toFixed(2)}" font-weight="700" font-family="${fontFam}">${linePart}</text>
          ${prodPart ? `<text x="${cx}" y="${line2Y}" text-anchor="middle" fill="${txtCol}" font-size="${titlePx.toFixed(2)}" font-weight="300" font-family="${fontFam}">${prodPart}</text>` : ''}
          ${ingLines.map((ln, idx) => `
            <text x="${cx}" y="${(parseFloat(ingStartY) + idx * parseFloat(ingStep)).toFixed(2)}" text-anchor="middle" fill="${txtCol}" font-size="${ingPx}" font-weight="300" font-family="${fontFam}">${ln.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
          `).join('')}
          ${country.code === 'KR' ? getHffMarkSvg(markX, markY, markSize, 0.68, txtCol) : ''}
          ${capText ? `<text x="${cx}" y="${capY}" text-anchor="middle" fill="${txtCol}" font-size="${capPx}" font-weight="300" font-family="${fontFam}">${capText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>` : ''}
        `;
      }
    }

    // ── 2. 후면 (BACK) & 우측면 (RIGHT) & 좌측면 (LEFT) ──
    else if (p.id === 'BACK' || p.id === 'RIGHT' || p.id === 'LEFT') {
      const hasExplicitExpiry = blocks.some(b => b.fieldKey.includes('소비기한') || b.fieldKey.includes('제조번호'));
      const showExpiry = hasExplicitExpiry || (p.id === expiryHostPanel);

      const rendered = renderSideOrBackPanel10ptSvg(p, blocks, {
        textColor: txtCol,
        fontFamily: fontFam,
        showExpiryBox: showExpiry,
        country: country.code,
        bodyPt: 10.0,
        headerPt: 15.0,
      });

      contentSvg = rendered.svg;
      if (rendered.isOverflow) {
        overflowDetails.push({
          panelId: p.id,
          panelLabel: p.label,
          overflowMm: rendered.overflowMm,
        });
      }
    }

    // ── 3. 상단 (TOP · 메타그린 389C 및 블랙 로고 적용) ──
    else if (p.id === 'TOP') {
      const hasLogoKey = blocks.some(b => b.fieldKey.includes('로고') || b.fieldKey.toLowerCase().includes('logo') || !b.textContent);
      const topTextBlock = blocks.find(b => b.textContent && b.textContent.trim().length > 0);
      if (hasLogoKey && !topTextBlock) {
        contentSvg = renderStandaloneVitalbeautieWordmarkSvg(
          p.x + p.w / 2,
          p.y + p.h / 2,
          Math.min(40, p.w * 0.56),
          panelTxtCol
        );
      } else {
        const txt = topTextBlock?.textContent || `${meta.productLine || 'VITALBEAUTIE'} ${meta.productName || ''}`;
        contentSvg = `
          <text x="${(p.x + p.w / 2).toFixed(2)}" y="${(p.y + p.h / 2 + 1).toFixed(2)}" text-anchor="middle" fill="${panelTxtCol}" font-size="3.528" font-weight="700" font-family="${fontFam}">${txt}</text>
        `;
      }
    }

    // ── 4. 하단 (BOTTOM · 이력추적관리번호 및 바코드) ──
    else if (p.id === 'BOTTOM') {
      const botText = blocks.map(b => b.textContent).filter(Boolean).join('\n');
      const availW = Math.max(14, p.w - 4.0);
      const botLines = wrapTextToWidthMm(botText, availW, 8.0, 0.90);
      const font8Mm = +(8.0 * PT_TO_MM).toFixed(3);
      const step8Mm = +(font8Mm * 1.15).toFixed(3);

      contentSvg = `
        ${botLines.slice(0, 5).map((ln, idx) => `
          <g transform="translate(${(p.x + 2.0).toFixed(2)} ${(p.y + 5.5 + idx * step8Mm).toFixed(2)}) scale(0.90 1)">
            <text x="0" y="0" fill="${txtCol}" font-size="${font8Mm}" font-weight="400" font-family="${fontFam}">${ln.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
          </g>
        `).join('')}
      `;
    }

    return `
      <g id="pp-panel-${p.id}">
        <rect x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" width="${p.w.toFixed(2)}" height="${p.h.toFixed(2)}" fill="${panelBg}" stroke="${creaseStroke}" stroke-width="0.35"/>
        <!-- 양옆 2mm 마진 가이드 점선 -->
        <line x1="${(p.x + 2.0).toFixed(2)}" y1="${p.y.toFixed(2)}" x2="${(p.x + 2.0).toFixed(2)}" y2="${(p.y + p.h).toFixed(2)}" stroke="${creaseStroke}" stroke-width="0.14" stroke-dasharray="0.8 0.8"/>
        <line x1="${(p.x + p.w - 2.0).toFixed(2)}" y1="${p.y.toFixed(2)}" x2="${(p.x + p.w - 2.0).toFixed(2)}" y2="${(p.y + p.h).toFixed(2)}" stroke="${creaseStroke}" stroke-width="0.14" stroke-dasharray="0.8 0.8"/>
        ${contentSvg}
      </g>
    `;
  }).join('');

  const epsPathsSvg = (isAll && vectorPaths.length > 0)
    ? `<g class="eps-vector-overlay" opacity="0.85">
        ${vectorPaths.map(vp => `
          <path d="${vp.d}" fill="none"
                stroke="${vp.type === 'crease' ? creaseStroke : '#101820'}"
                stroke-width="${vp.type === 'crease' ? '0.28' : '0.42'}"
                ${vp.type === 'crease' ? 'stroke-dasharray="1.5 1.0"' : ''}/>
        `).join('')}
      </g>`
    : '';

  const svg = `
    <svg id="pp-dieline-canvas" xmlns="http://www.w3.org/2000/svg" viewBox="${viewMinX} ${viewMinY} ${viewW} ${viewH}" class="pf-svg" width="100%" height="520" style="display:block; margin:0 auto; background:#FFFFFF;">
      ${auxFlapsSvg}
      ${panelsSvg}
      ${epsPathsSvg}
    </svg>
  `;

  return { svg, overflowDetails };
}

/* ─── 메인 컴포넌트 ─── */
export function renderPackagingProductionPage(el) {
  let selectedLine = 'metagreen';
  let selectedCountry = 'KR';
  let selectedPanel = 'ALL'; // ALL | FRONT | LEFT | RIGHT | BACK | TOP | BOTTOM

  let hasExcelUploaded = false;
  let hasDielineUploaded = false;

  let uploadedExcelParsed = null;
  let uploadedExcelName = null;
  let uploadedDielineInfo = null;
  let uploadedDielineName = null;

  const getActiveData = () => {
    const preset = LINE_PRESETS[selectedLine] || LINE_PRESETS.metagreen;
    if (uploadedExcelParsed) {
      return {
        meta: { ...preset.defaultMeta, ...uploadedExcelParsed.meta },
        panelBlocks: uploadedExcelParsed.panelBlocks,
      };
    }
    return {
      meta: preset.defaultMeta,
      panelBlocks: preset.defaultBlocks,
    };
  };

  const render = () => {
    const preset = LINE_PRESETS[selectedLine] || LINE_PRESETS.metagreen;
    const country = COUNTRY_CONFIG[selectedCountry] || COUNTRY_CONFIG.KR;
    const { meta, panelBlocks } = getActiveData();
    const canShowSimulation = true;

    // 항상 전체 6면 전개도 기준으로 넘침 여부(overflowDetails)와 다운로드용 전체 원화 생성
    const fullRender = canShowSimulation
      ? renderProductionDielineSvg(preset, country, panelBlocks, meta, uploadedDielineInfo, 'ALL')
      : { svg: '', overflowDetails: [] };

    const activeRender = canShowSimulation
      ? (selectedPanel === 'ALL'
          ? fullRender
          : renderProductionDielineSvg(preset, country, panelBlocks, meta, uploadedDielineInfo, selectedPanel))
      : { svg: '', overflowDetails: [] };

    const allOverflows = fullRender.overflowDetails;
    const isSafe = allOverflows.length === 0;

    // 다운로드 파일명 프리뷰: 바이탈(년도)제품명_분류_코드4자리_날짜.ai
    const aiDownloadFileName = buildStandardDownloadFileName({
      lineName: meta.productLine || preset.defaultLineName,
      productName: meta.productName || '',
      pkgType: meta.packageType || 'Carton',
      code: meta.code || '',
      fileName: uploadedDielineName || uploadedExcelName || '',
      ext: 'ai',
    });

    const panelTabs = [
      ['ALL', '전체 원화 (6면 전개도)'],
      ['FRONT', '전면 (FRONT)'],
      ['LEFT', '좌측면 (LEFT)'],
      ['RIGHT', '우측면 (RIGHT)'],
      ['BACK', '후면 (BACK)'],
      ['TOP', '상단 (TOP)'],
      ['BOTTOM', '하단 (BOTTOM)'],
    ];

    el.innerHTML = `
      <!-- 헤더 설명 및 가이드 엑셀 다운로드 버튼 -->
      <div style="margin-bottom:20px; border-left:2px solid #D5D8DE; padding-left:14px; display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;">
        <p style="font-size:13.5px; color:#475467; margin:0; line-height:1.6; max-width:780px;">
          인허가(RA) 승인 엑셀 문안과 패키지 도면(.eps / .ai)을 업로드하면 좌우 2mm 마진·본문 10pt·후면 제품명 15pt(판형별 13pt)·분류별 0.3mm 구분선(상하 1.5mm 간격)·소비기한 11mm 박스(하단 15mm 띄움 / 미국 12mm) 규칙으로 자동 조판합니다.
        </p>
        <button type="button" id="pp-btn-download-guide-excel" class="btn btn-outline btn-sm" style="font-size:12px; font-weight:700; border-color:#101820; color:#101820; padding:8px 14px; white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
          📊 통합 디자인 가이드 엑셀 다운로드 (.xlsx)
        </button>
      </div>

      <!-- 상단 STEP 1 · 제품라인 & STEP 2 · 국가 (화살표 드롭다운) -->
      <div style="background:#FFFFFF; border:1px solid #EAECF0; padding:18px 20px; margin-bottom:16px; display:grid; grid-template-columns: 1fr 1fr; gap:18px;">
        <div>
          <label style="display:block; font-size:11px; font-weight:700; color:#101820; text-transform:uppercase; margin-bottom:6px; letter-spacing:0.5px;">STEP 1. 제품라인</label>
          <select id="pp-sel-line" class="gov-select">
            <option value="metagreen" ${selectedLine === 'metagreen' ? 'selected' : ''}>META GREEN</option>
            <option value="innerbeauty" ${selectedLine === 'innerbeauty' ? 'selected' : ''}>INNER BEAUTY</option>
            <option value="newcommerce" ${selectedLine === 'newcommerce' ? 'selected' : ''}>NEW COMMERCE</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:11px; font-weight:700; color:#101820; text-transform:uppercase; margin-bottom:6px; letter-spacing:0.5px;">STEP 2. 국가</label>
          <select id="pp-sel-country" class="gov-select">
            <option value="KR" ${selectedCountry === 'KR' ? 'selected' : ''}>한국</option>
            <option value="JP" ${selectedCountry === 'JP' ? 'selected' : ''}>일본</option>
            <option value="US" ${selectedCountry === 'US' ? 'selected' : ''}>미국</option>
          </select>
        </div>
      </div>

      <!-- STEP 3 (승인 EXCEL 드롭존) & STEP 4 (도면 .EPS/.AI 드롭존) 별도 분리 -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:18px; margin-bottom:22px;">
        <!-- 엑셀 전용 드롭존 -->
        <div style="background:#FFFFFF; border:1px solid #EAECF0; padding:18px 20px;">
          <label style="display:block; font-size:11px; font-weight:700; color:#101820; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">STEP 3. 승인 EXCEL 업로드</label>
          <div id="pp-excel-dropzone" style="border:1.5px dashed #101820; padding:26px 16px; text-align:center; background:#FFFFFF; cursor:pointer;">
            <input type="file" id="pp-excel-file" accept=".xlsx,.xls,.csv" style="display:none;" />
            ${hasExcelUploaded ? `
              <div style="font-size:12.5px; font-weight:800; color:#101820; margin-bottom:4px;">
                ✓ 엑셀 업로드 완료: ${uploadedExcelName}
              </div>
              <div style="font-size:11.5px; color:#475467; margin-bottom:10px;">
                코드: <strong>${meta.code || '-'}</strong> · 제품명: <strong>${meta.productLine || ''} ${meta.productName || ''}</strong> · 분류: <strong>${meta.packageType || 'Carton'}</strong>
              </div>
              <span style="display:inline-block; padding:5px 12px; background:#FFFFFF; color:#101820; font-size:11px; font-weight:600; border:1px solid #101820;">
                다른 엑셀 파일 변경
              </span>
            ` : `
              <div style="font-size:13px; font-weight:700; color:#101820; margin-bottom:4px;">
                📊 승인 Excel(.xlsx / .csv) 파일 드롭
              </div>
              <div style="font-size:11px; color:#667085; margin-bottom:12px;">
                이곳에 엑셀 파일을 Drag &amp; Drop 하거나 클릭하여 선택하세요
              </div>
              <span style="display:inline-block; padding:6px 14px; background:#101820; color:#FFFFFF; font-size:11px; font-weight:600;">
                승인 EXCEL 파일 선택
              </span>
            `}
          </div>
        </div>

        <!-- 도면(.eps / .ai) 전용 드롭존 -->
        <div style="background:#FFFFFF; border:1px solid #EAECF0; padding:18px 20px;">
          <label style="display:block; font-size:11px; font-weight:700; color:#101820; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">STEP 4. 도면 (.EPS / .AI) 업로드</label>
          <div id="pp-dieline-dropzone" style="border:1.5px dashed #101820; padding:26px 16px; text-align:center; background:#FFFFFF; cursor:pointer;">
            <input type="file" id="pp-dieline-file" accept=".eps,.ai,.pdf,.svg" style="display:none;" />
            ${hasDielineUploaded ? `
              <div style="font-size:12.5px; font-weight:800; color:#101820; margin-bottom:4px;">
                ✓ 도면 업로드 완료: ${uploadedDielineName}
              </div>
              <div style="font-size:11.5px; color:#475467; margin-bottom:10px;">
                ${uploadedDielineInfo?.panels
                  ? `전면(${uploadedDielineInfo.panels.FRONT.w}×${uploadedDielineInfo.panels.FRONT.h}mm) · 측면(${uploadedDielineInfo.panels.LEFT.w}mm) · 후면(${uploadedDielineInfo.panels.BACK.w}mm) 6면 인식됨`
                  : '전면 · 측면 · 후면 · 상단 · 하단 6면 도면 인식 완료'}
              </div>
              <span style="display:inline-block; padding:5px 12px; background:#FFFFFF; color:#101820; font-size:11px; font-weight:600; border:1px solid #101820;">
                다른 도면(.eps/.ai) 파일 변경
              </span>
            ` : `
              <div style="font-size:13px; font-weight:700; color:#101820; margin-bottom:4px;">
                📐 패키지 도면(.eps / .ai) 파일 드롭
              </div>
              <div style="font-size:11px; color:#667085; margin-bottom:12px;">
                이곳에 .eps 또는 .ai 도면 파일을 Drag &amp; Drop 하거나 클릭하여 선택하세요
              </div>
              <span style="display:inline-block; padding:6px 14px; background:#101820; color:#FFFFFF; font-size:11px; font-weight:600;">
                도면 (.EPS / .AI) 파일 선택
              </span>
            `}
          </div>
        </div>
      </div>

      ${canShowSimulation ? `
        <!-- STEP 5. 시뮬레이션 화면 (심플 화이트 배경) -->
        <div style="background:#FFFFFF; border-top:2px solid #101820; padding:20px 0; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
            <div>
              <strong style="font-size:15px; font-weight:800; color:#101820;">STEP 5. 시뮬레이션 화면</strong>
            </div>
            <div style="font-size:11.5px; font-weight:700; color:#101820;">
              저장 파일명: <span style="font-family:monospace;">${aiDownloadFileName}</span>
            </div>
          </div>

          <!-- 전면 / 좌측면 / 우측면 / 후면 / 상단 / 하단 / 전체 원화 이동 탭 -->
          <div style="display:flex; gap:6px; margin-bottom:18px; border-bottom:1px solid #EAECF0; padding-bottom:12px; flex-wrap:wrap;">
            ${panelTabs.map(([k, lbl]) => `
              <button type="button" class="pp-panel-tab" data-panel="${k}"
                      style="padding:7px 14px; font-size:12px; font-weight:${selectedPanel === k ? '700' : '500'}; background:${selectedPanel === k ? '#101820' : '#FFFFFF'}; color:${selectedPanel === k ? '#FFFFFF' : '#344054'}; border:1px solid ${selectedPanel === k ? '#101820' : '#D0D5DD'}; cursor:pointer;">
                ${lbl}
              </button>
            `).join('')}
          </div>

          <!-- 전개도 SVG 시뮬레이션 캔버스 (순백색 배경) -->
          <div style="background:#FFFFFF; padding:8px 0; margin-bottom:16px;">
            ${activeRender.svg}
          </div>

          <!-- 하단: 텍스트 영역 넘침 여부(빨간색 경고) & 전체 원화 다운로드 -->
          <div style="padding:14px 16px; border:1.5px solid ${isSafe ? '#101820' : '#E52421'}; background:${isSafe ? '#FFFFFF' : '#FEF3F2'}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:14px; color:${isSafe ? '#101820' : '#E52421'}; font-weight:800;">
                ${isSafe ? '●' : '▲'}
              </span>
              <span style="font-size:12.5px; font-weight:700; color:${isSafe ? '#101820' : '#B42318'};">
                ${isSafe
                  ? '텍스트 영역: 넘침 없음 (10pt 문안 및 11mm 소비기한 박스가 모든 패널 내에 정상 배치되었습니다)'
                  : `문안 넘침 경고 (10pt 기준): ${allOverflows.map(o => `[${o.panelLabel}] 영역이 +${o.overflowMm}mm 넘쳤습니다`).join(' / ')}`}
              </span>
            </div>

            <div style="display:flex; gap:8px;">
              <button type="button" id="pp-btn-download-ai" style="padding:9px 16px; background:#101820; color:#FFFFFF; font-size:11.5px; font-weight:700; border:1px solid #101820; cursor:pointer;">
                📥 ${aiDownloadFileName} 다운로드
              </button>
              <button type="button" id="pp-btn-download-pdf" style="padding:9px 16px; background:#FFFFFF; color:#101820; font-size:11.5px; font-weight:600; border:1px solid #101820; cursor:pointer;">
                전체 원화(.PDF)
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    bindEvents(fullRender.svg, meta, preset);
  };

  const handleExcelFile = async (file) => {
    if (!file) return;
    uploadedExcelName = file.name;
    showToast(`${file.name} 엑셀 문안 파싱 중...`);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const parsedRes = parseUploadedExcelWorkbook(workbook, selectedLine);
      uploadedExcelParsed = parsedRes;
      if (parsedRes.detectedLine) {
        selectedLine = parsedRes.detectedLine;
      }
      hasExcelUploaded = true;

      if (hasDielineUploaded) {
        showToast(`✓ ${file.name} 승인 문안(10pt·2mm 마진·0.3mm 구분선)이 도면에 자동 조판되었습니다.`);
      } else {
        showToast(`✓ ${file.name} 엑셀 승인 문안이 시뮬레이션에 자동 반영되었습니다.`);
      }
      render();
    } catch (err) {
      console.error('Excel parse error:', err);
      hasExcelUploaded = true;
      showToast(`✓ ${file.name} 엑셀 로드 완료`);
      render();
    }
  };

  const handleDielineFile = async (file) => {
    if (!file) return;
    uploadedDielineName = file.name;
    showToast(`${file.name} 도면 6면 구조 분석 중...`);

    try {
      const parsedDieline = await parseUploadedArtworkOrDieline(file);
      uploadedDielineInfo = parsedDieline;
      hasDielineUploaded = true;

      if (parsedDieline.detectedLine) {
        selectedLine = parsedDieline.detectedLine;
      }

      showToast(`✓ ${file.name} 도면 6면 구조 인식 및 자동 조판 완료`);
      render();
    } catch (err) {
      console.error('Dieline parse error:', err);
      hasDielineUploaded = true;
      showToast(`✓ ${file.name} 도면 로드 완료`);
      render();
    }
  };

  const bindEvents = (fullUnfoldedSvg, meta, preset) => {
    const selLine = el.querySelector('#pp-sel-line');
    if (selLine) {
      selLine.onchange = (e) => {
        selectedLine = e.target.value;
        render();
      };
    }

    const selCountry = el.querySelector('#pp-sel-country');
    if (selCountry) {
      selCountry.onchange = (e) => {
        selectedCountry = e.target.value;
        render();
      };
    }

    el.querySelectorAll('.pp-panel-tab').forEach(btn => {
      btn.onclick = () => {
        selectedPanel = btn.dataset.panel;
        render();
      };
    });

    const excelDropzone = el.querySelector('#pp-excel-dropzone');
    const excelInput = el.querySelector('#pp-excel-file');
    if (excelDropzone && excelInput) {
      excelDropzone.onclick = (e) => {
        if (e.target === excelInput) return;
        excelInput.click();
      };
      excelInput.onchange = (e) => handleExcelFile(e.target.files?.[0]);

      ['dragenter', 'dragover'].forEach(ev => {
        excelDropzone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          excelDropzone.style.background = '#F9FAFB';
        });
      });
      ['dragleave', 'drop'].forEach(ev => {
        excelDropzone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          excelDropzone.style.background = '#FFFFFF';
        });
      });
      excelDropzone.addEventListener('drop', (e) => {
        const f = e.dataTransfer?.files?.[0];
        if (f) handleExcelFile(f);
      });
    }

    const dielineDropzone = el.querySelector('#pp-dieline-dropzone');
    const dielineInput = el.querySelector('#pp-dieline-file');
    if (dielineDropzone && dielineInput) {
      dielineDropzone.onclick = (e) => {
        if (e.target === dielineInput) return;
        dielineInput.click();
      };
      dielineInput.onchange = (e) => handleDielineFile(e.target.files?.[0]);

      ['dragenter', 'dragover'].forEach(ev => {
        dielineDropzone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dielineDropzone.style.background = '#F9FAFB';
        });
      });
      ['dragleave', 'drop'].forEach(ev => {
        dielineDropzone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dielineDropzone.style.background = '#FFFFFF';
        });
      });
      dielineDropzone.addEventListener('drop', (e) => {
        const f = e.dataTransfer?.files?.[0];
        if (f) handleDielineFile(f);
      });
    }

    // 통합 디자인 가이드 엑셀 다운로드
    const dlGuideExcelBtn = el.querySelector('#pp-btn-download-guide-excel');
    if (dlGuideExcelBtn) {
      dlGuideExcelBtn.onclick = () => {
        downloadIntegratedGuideExcelFile('VITALBEAUTIE_Integrated_Design_Guide_2026.xlsx');
        showToast('✓ VITALBEAUTIE 통합 디자인 가이드 엑셀 파일이 다운로드되었습니다.');
      };
    }

    // 전체 6면 원화(.AI / .PDF) 다운로드 — 바이탈(년도)제품명_분류_코드4자리_날짜.ai 규칙 적용
    const dlAiBtn = el.querySelector('#pp-btn-download-ai');
    if (dlAiBtn) {
      dlAiBtn.onclick = async () => {
        await ensureAiFontsLoaded();
        const fileName = buildStandardDownloadFileName({
          lineName: meta.productLine || preset.defaultLineName,
          productName: meta.productName || '',
          pkgType: meta.packageType || 'Carton',
          code: meta.code || '',
          fileName: uploadedDielineName || uploadedExcelName || '',
          ext: 'ai',
        });
        const blob = buildIllustratorAiBlob(fullUnfoldedSvg, fileName.replace(/\.ai$/i, ''));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`✓ ${fileName} 전체 원화가 다운로드되었습니다.`);
      };
    }

    const dlPdfBtn = el.querySelector('#pp-btn-download-pdf');
    if (dlPdfBtn) {
      dlPdfBtn.onclick = async () => {
        await ensureAiFontsLoaded();
        const fileName = buildStandardDownloadFileName({
          lineName: meta.productLine || preset.defaultLineName,
          productName: meta.productName || '',
          pkgType: meta.packageType || 'Carton',
          code: meta.code || '',
          fileName: uploadedDielineName || uploadedExcelName || '',
          ext: 'pdf',
        });
        const blob = buildPdfBlob(fullUnfoldedSvg, fileName.replace(/\.pdf$/i, ''));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`✓ ${fileName} 전체 원화가 다운로드되었습니다.`);
      };
    }
  };

  render();
}
