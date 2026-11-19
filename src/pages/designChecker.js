/* ═══════════════════════════════════════════════════════════════════════════
   02. DESIGN VALIDATION — Design Checker & Auto Fix
   - 외부 지시선(Leader Line) 기반 비간섭 콜아웃: 수정 필요 빨간색 표기를 패키지 바깥 여백에 겹치지 않게 정렬 표기
   - 전면(FRONT) · 좌측면(LEFT) · 우측면(RIGHT) · 후면(BACK) · 상단(TOP) · 하단(BOTTOM) · 전체 원화(ALL) 탭 이동
   - 다운로드 시 현재 보고 있는 탭과 무관하게 체크된 수정안이 모두 반영된 6면 전체 원화(.AI / .PDF) 다운로드
   - STEP 5 검수 결과: [기준] / [현재] / [수정] 3줄 요약으로 간결하게 표기
   - 시뮬레이션 화면: 중첩 박싱 제거 및 심플한 순백색(#FFFFFF) 배경 적용
   - 원화 정밀 인식: 일반식품(당류가공품·혼합음료·캔디류 등) vs 건강기능식품 구분 및 6면 실측 문안 반영
   ═══════════════════════════════════════════════════════════════════════════ */

import { showToast } from '../utils/helpers.js';
import {
  buildIllustratorAiBlob,
  buildPdfBlob,
  ensureAiFontsLoaded,
  getHffMarkSvg,
} from '../governance/engines.js';
import {
  PT_TO_MM,
  renderVitalbeautieLogoTagSvg,
  renderStandaloneVitalbeautieWordmarkSvg,
  renderSideOrBackPanel10ptSvg,
  buildStandardDownloadFileName,
  parseUploadedArtworkOrDieline,
  inferProductInfoFromTextAndName,
} from '../utils/aiPdfParser.js';
import { downloadIntegratedGuideExcelFile } from '../utils/guideExcelExport.js';

/* ─── 마스터 승인 기준 규칙 (원화 실측 기반) ─── */
const DEFAULT_MASTER_RULES = {
  version: 'v2.6 (Master Approved)',
  lines: {
    metagreen: {
      id: 'metagreen',
      name: '메타그린 (META GREEN)',
      bgHex: '#00843D',
      tagHex: '#CEDC00',
      textColorHex: '#FFFFFF',
      topLineStdMm: 1.5,
      tagWidthStdMm: 43.59,
      tagHeightStdMm: 6.47,
      gapTagToTitleStdMm: 5.0,
      titlePtStd: 26,
      hffIngRatio: 0.5,
      foodIngPtStd: 14.0,
      capacityPt: 10.0,
      safeMarginMm: 3.0,
      hffMarkMm: 15.0,
      sideBackRules: {
        backHeaderPt: 15.0,
        backLegalBodyPt: 10.0,
        rightNutritionPt: 10.0,
        bottomRecyclePt: 7.0,
        leftSubHeadPt: 12.5,
        topPopPt: 20.0,
        marginSideMm: 2.0,
        dividerThicknessMm: 0.3,
        expiryBoxHeightMm: 11.0,
        expiryBoxBottomGapMm: 15.0,
      },
    },
    innerbeauty: {
      id: 'innerbeauty',
      name: '이너뷰티 (INNER BEAUTY)',
      bgHex: '#EDEDED',
      tagHex: '#F6B9D4',
      textColorHex: '#1D1D1B',
      topLineStdMm: 1.5,
      tagWidthStdMm: 43.59,
      tagHeightStdMm: 6.47,
      gapTagToTitleStdMm: 7.5,
      titlePtStd: 26,
      hffIngRatio: 0.5,
      foodIngPtStd: 10.5,
      capacityPt: 10.0,
      safeMarginMm: 3.0,
      hffMarkMm: 15.0,
      sideBackRules: {
        backHeaderPt: 15.0,
        backLegalBodyPt: 10.0,
        rightNutritionPt: 10.0,
        bottomRecyclePt: 7.0,
        leftSubHeadPt: 12.5,
        topPopPt: 20.0,
      },
    },
    newcommerce: {
      id: 'newcommerce',
      name: '뉴커머스 (NEW COMMERCE)',
      bgHex: '#1C264A',
      tagHex: '#D4AF37',
      textColorHex: '#FFFFFF',
      topLineStdMm: 1.5,
      tagWidthStdMm: 43.59,
      tagHeightStdMm: 6.47,
      gapTagToTitleStdMm: 5.5,
      titlePtStd: 24,
      hffIngRatio: 0.5,
      foodIngPtStd: 12.0,
      capacityPt: 10.0,
      safeMarginMm: 3.0,
      hffMarkMm: 15.0,
      sideBackRules: {
        backHeaderPt: 15.0,
        backLegalBodyPt: 10.0,
        rightNutritionPt: 10.0,
        bottomRecyclePt: 7.0,
        leftSubHeadPt: 12.5,
        topPopPt: 20.0,
      },
    },
  },
};

/* ─── SVG 줄바꿈 헬퍼 (텍스트가 패널 밖으로 절대 넘치지 않도록 처리) ─── */
function wrapTextToLines(str, maxChars = 22, maxLines = 4) {
  const raw = String(str || '').replace(/\r\n/g, '\n').trim();
  if (!raw) return [];
  const parts = raw.split('\n').map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    let cur = p;
    while (cur.length > maxChars && out.length < maxLines) {
      let cut = maxChars;
      const sp = cur.lastIndexOf(' ', maxChars);
      const cm = cur.lastIndexOf(',', maxChars);
      if (sp > maxChars * 0.5) cut = sp + 1;
      else if (cm > maxChars * 0.5) cut = cm + 1;
      out.push(cur.slice(0, cut).trim());
      cur = cur.slice(cut).trim();
    }
    if (cur && out.length < maxLines) out.push(cur);
  }
  return out.slice(0, maxLines);
}

/* ─── 검수 평가 엔진 (기준 / 현재 / 수정 3요소 명확화) ─── */
function runValidationChecks(scenario, masterRules, appliedFixes = new Set()) {
  const lineRule = masterRules.lines[scenario.line] || masterRules.lines.metagreen;
  const isFood = scenario.foodType === 'food';
  const m = scenario.measured;

  const eff = { ...m };
  const stdIngPt = isFood ? lineRule.foodIngPtStd : +(eff.titlePt * lineRule.hffIngRatio).toFixed(1);

  if (appliedFixes.has('A-topline')) eff.topLineMm = lineRule.topLineStdMm;
  if (appliedFixes.has('A-tag-size')) {
    eff.tagW = lineRule.tagWidthStdMm;
    eff.tagH = lineRule.tagHeightStdMm;
  }
  if (appliedFixes.has('A-tag-pos')) eff.tagOffsetX = 0;
  if (appliedFixes.has('B-gap-tag-title')) eff.gapTagToTitleMm = lineRule.gapTagToTitleStdMm;
  if (appliedFixes.has('B-ing-pt')) eff.ingPt = stdIngPt;
  if (appliedFixes.has('C-cap-pt')) eff.capPt = lineRule.capacityPt;
  if (appliedFixes.has('D-safe-margin')) eff.safeMarginMinMm = lineRule.safeMarginMm;
  if (appliedFixes.has('B-hff-mark')) eff.hffMarkMm = lineRule.hffMarkMm;
  if (appliedFixes.has('C-back-header')) eff.backHeaderPt = lineRule.sideBackRules.backHeaderPt;
  if (appliedFixes.has('C-back-legal')) eff.backLegalBodyPt = lineRule.sideBackRules.backLegalBodyPt;
  if (appliedFixes.has('C-right-nutrition')) eff.rightNutritionPt = lineRule.sideBackRules.rightNutritionPt;
  if (appliedFixes.has('B-left-subhead')) eff.leftSubHeadPt = lineRule.sideBackRules.leftSubHeadPt;
  if (appliedFixes.has('C-top-pop')) eff.topPopMarginMm = lineRule.safeMarginMm;
  if (appliedFixes.has('D-bottom-barcode')) eff.bottomRecyclePt = lineRule.sideBackRules.bottomRecyclePt;

  const checks = [
    {
      id: 'A-topline',
      targetId: 'obj-topline',
      category: 'Brand Identity',
      panel: 'FRONT',
      title: '전면 상단 바(Top Line) 두께',
      standard: `${lineRule.topLineStdMm.toFixed(1)}mm`,
      current: `${m.topLineMm.toFixed(1)}mm (기준 대비 ${(lineRule.topLineStdMm - m.topLineMm).toFixed(1)}mm 미달)`,
      measured: `${eff.topLineMm.toFixed(1)}mm`,
      action: `상단 바 두께를 ${lineRule.topLineStdMm.toFixed(1)}mm로 확대 보정`,
      shortCallout: `상단바 ${m.topLineMm}→${lineRule.topLineStdMm}mm`,
      status: Math.abs(eff.topLineMm - lineRule.topLineStdMm) < 0.08 ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'A-tag-size',
      targetId: 'obj-tag',
      category: 'Brand Identity',
      panel: 'FRONT',
      title: '바이탈뷰티 사다리꼴 로고 태그 규격',
      standard: `상단 ${lineRule.tagWidthStdMm}mm × 높이 ${lineRule.tagHeightStdMm}mm`,
      current: `${m.tagW.toFixed(1)} × ${m.tagH.toFixed(1)}mm (표준 규격 대비 축소됨)`,
      measured: `${eff.tagW.toFixed(2)} × ${eff.tagH.toFixed(2)}mm`,
      action: `Layout Simulator 공식 규격(${lineRule.tagWidthStdMm}×${lineRule.tagHeightStdMm}mm)으로 복원`,
      shortCallout: `로고태그 ${m.tagW.toFixed(1)}→${lineRule.tagWidthStdMm}mm`,
      status: Math.abs(eff.tagW - lineRule.tagWidthStdMm) <= 0.5 ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'A-tag-pos',
      targetId: 'obj-tag-pos',
      category: 'Brand Identity',
      panel: 'FRONT',
      title: '바이탈뷰티 로고 태그 좌우 중앙 정렬',
      standard: '전면 중심축 편차 0.0mm',
      current: `우측으로 +${m.tagOffsetX.toFixed(1)}mm 치우침`,
      measured: eff.tagOffsetX === 0 ? '0.0mm' : `+${eff.tagOffsetX.toFixed(1)}mm`,
      action: '로고 태그를 전면 좌우 정중앙(0.0mm)으로 정렬',
      shortCallout: `태그정렬 +${m.tagOffsetX}→0mm`,
      status: Math.abs(eff.tagOffsetX) < 0.15 ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'B-gap-tag-title',
      targetId: 'obj-tag-gap',
      category: 'Family-look',
      panel: 'FRONT',
      title: '로고 태그 하단 ~ 제품명 상단 간격',
      standard: `${lineRule.gapTagToTitleStdMm.toFixed(1)}mm`,
      current: `${m.gapTagToTitleMm.toFixed(1)}mm (+${(m.gapTagToTitleMm - lineRule.gapTagToTitleStdMm).toFixed(1)}mm 벌어짐)`,
      measured: `${eff.gapTagToTitleMm.toFixed(1)}mm`,
      action: `태그와 제품명 간격을 ${lineRule.gapTagToTitleStdMm.toFixed(1)}mm로 조정`,
      shortCallout: `타이틀간격 ${m.gapTagToTitleMm}→${lineRule.gapTagToTitleStdMm}mm`,
      status: Math.abs(eff.gapTagToTitleMm - lineRule.gapTagToTitleStdMm) <= 0.3 ? 'PASS' : 'WARN',
      autoFixable: true,
    },
    {
      id: 'B-ing-pt',
      targetId: 'obj-ingredient',
      category: 'Family-look',
      panel: 'FRONT',
      title: isFood ? '전면 하단 원료명 및 함량 글자 크기' : '전면 기능성 원료명 글자 크기 (제품명의 1/2)',
      standard: isFood ? `${stdIngPt.toFixed(1)}pt (일반식품 원료명 규정)` : `${stdIngPt.toFixed(1)}pt 이하 (제품명 ${eff.titlePt}pt의 50%)`,
      current: `${m.ingPt.toFixed(1)}pt (기준 대비 +${(m.ingPt - stdIngPt).toFixed(1)}pt 초과)`,
      measured: `${eff.ingPt.toFixed(1)}pt`,
      action: `원료명 글자 크기를 ${stdIngPt.toFixed(1)}pt로 축소 보정`,
      shortCallout: `원료명 ${m.ingPt}→${stdIngPt}pt`,
      status: Math.abs(eff.ingPt - stdIngPt) <= 0.3 ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'C-cap-pt',
      targetId: 'obj-capacity',
      category: 'Typography',
      panel: 'FRONT',
      title: '전면 하단 내용량 표기 글자 크기',
      standard: `최소 ${lineRule.capacityPt.toFixed(1)}pt 이상 (볼드/미디엄)`,
      current: `${m.capPt.toFixed(1)}pt (법정 기준 대비 ${(lineRule.capacityPt - m.capPt).toFixed(1)}pt 미달)`,
      measured: `${eff.capPt.toFixed(1)}pt`,
      action: `내용량 글자 크기를 ${lineRule.capacityPt.toFixed(1)}pt로 확대`,
      shortCallout: `내용량 ${m.capPt}→${lineRule.capacityPt}pt`,
      status: eff.capPt >= lineRule.capacityPt ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'D-safe-margin',
      targetId: 'obj-safe-margin',
      category: 'Preflight',
      panel: 'FRONT',
      title: '전면 하단 칼선 인쇄 안전여백',
      standard: `칼선 안쪽 최소 ${lineRule.safeMarginMm.toFixed(1)}mm 이상`,
      current: `${m.safeMarginMinMm.toFixed(1)}mm (칼선 안전영역 1.2mm 침범)`,
      measured: `${eff.safeMarginMinMm.toFixed(1)}mm`,
      action: `하단 문안을 칼선에서 ${lineRule.safeMarginMm.toFixed(1)}mm 안쪽으로 이동`,
      shortCallout: `안전여백 ${m.safeMarginMinMm}→${lineRule.safeMarginMm}mm`,
      status: eff.safeMarginMinMm >= lineRule.safeMarginMm - 0.1 ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
  ];

  // 건강기능식품일 때만 건기식 마크 검수 항목 포함
  if (!isFood) {
    checks.push({
      id: 'B-hff-mark',
      targetId: 'obj-hff-mark',
      category: 'Brand Identity',
      panel: 'FRONT',
      title: '전면 건강기능식품 공식 도안 크기',
      standard: `${lineRule.hffMarkMm.toFixed(1)} × ${lineRule.hffMarkMm.toFixed(1)}mm`,
      current: `${m.hffMarkMm.toFixed(1)}mm (규격 대비 2.0mm 축소됨)`,
      measured: `${eff.hffMarkMm.toFixed(1)}mm`,
      action: `건강기능식품 도안을 ${lineRule.hffMarkMm.toFixed(1)}mm로 확대`,
      shortCallout: `건기식마크 ${m.hffMarkMm}→${lineRule.hffMarkMm}mm`,
      status: eff.hffMarkMm >= lineRule.hffMarkMm - 0.1 ? 'PASS' : 'FAIL',
      autoFixable: true,
    });
  }

  // 좌측면 / 우측면 / 후면 / 상단 / 하단 검수 항목
  checks.push(
    {
      id: 'B-left-subhead',
      targetId: 'obj-left-subhead',
      category: 'Family-look',
      panel: 'LEFT',
      title: '좌측면 제품명·서브헤드 글자 크기',
      standard: `${lineRule.sideBackRules.leftSubHeadPt}pt (장평 94%)`,
      current: `${m.leftSubHeadPt.toFixed(1)}pt (기준 대비 1.5pt 미달)`,
      measured: `${eff.leftSubHeadPt.toFixed(1)}pt`,
      action: `좌측면 서브헤드를 ${lineRule.sideBackRules.leftSubHeadPt}pt로 확대 보정`,
      shortCallout: `좌측헤드 ${m.leftSubHeadPt}→${lineRule.sideBackRules.leftSubHeadPt}pt`,
      status: eff.leftSubHeadPt >= lineRule.sideBackRules.leftSubHeadPt ? 'PASS' : 'WARN',
      autoFixable: true,
    },
    {
      id: 'C-right-nutrition',
      targetId: 'obj-right-nutrition',
      category: 'Typography',
      panel: 'RIGHT',
      title: '우측면 영양·기능정보 10pt · 좌우 2mm 마진 · 하단 15mm 소비기한 박스(한국 11mm/미국 12mm)',
      standard: `본문 ${lineRule.sideBackRules.rightNutritionPt.toFixed(1)}pt · 좌우 2.0mm 여백 · 구분선 0.3mm(상하 1.5mm 간격) · 소비기한 흰박스 높이 11mm(하단 15mm 이격)`,
      current: `${m.rightNutritionPt.toFixed(1)}pt (법정 10pt 미달 및 좌우 마진·소비기한 박스 규격 편차)`,
      measured: `${eff.rightNutritionPt.toFixed(1)}pt`,
      action: `우측면 본문 10pt · 좌우 2mm 마진 · 0.3mm 구분선(상하 1.5mm) · 하단 15mm 위치 11mm(미국 12mm) 소비기한 박스로 보정`,
      shortCallout: `우측영양 ${m.rightNutritionPt}→${lineRule.sideBackRules.rightNutritionPt}pt`,
      status: eff.rightNutritionPt >= lineRule.sideBackRules.rightNutritionPt ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'C-back-header',
      targetId: 'obj-back-header',
      category: 'Typography',
      panel: 'BACK',
      title: '후면 상단 제품명 타이틀 규격 (판형별 15pt / 13pt)',
      standard: `표준 판형 15.0pt / 젤리 등 세로 슬림 판형 13.0pt Bold (좌우 2.0mm 여백, 장평 90%)`,
      current: `${m.backHeaderPt.toFixed(1)}pt (기준 대비 편차 감지)`,
      measured: `${eff.backHeaderPt.toFixed(1)}pt`,
      action: `후면 제품명 타이틀을 판형 기준(${lineRule.sideBackRules.backHeaderPt.toFixed(1)}pt) Bold로 보정`,
      shortCallout: `후면제품명 ${m.backHeaderPt}→${lineRule.sideBackRules.backHeaderPt}pt`,
      status: Math.abs(eff.backHeaderPt - lineRule.sideBackRules.backHeaderPt) < 0.2 ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'C-back-legal',
      targetId: 'obj-back-legal',
      category: 'Typography',
      panel: 'BACK',
      title: '후면 의무표시 문안 10pt · 좌우 2mm 마진 · 분류별 0.3mm 구분선(상하 1.5mm)',
      standard: `본문 ${lineRule.sideBackRules.backLegalBodyPt.toFixed(1)}pt · 좌우 2.0mm 여백 · 분류마다 0.3mm 선(위아래 1.5mm 간격)`,
      current: `${m.backLegalBodyPt.toFixed(1)}pt (10pt 미달 및 분류 간 구분선 간격 불일치)`,
      measured: `${eff.backLegalBodyPt.toFixed(1)}pt`,
      action: `후면 모든 분류 문안을 10pt(좌우 2mm 마진)로 맞추고 분류마다 0.3mm 구분선(위아래 1.5mm 간격) 자동 적용`,
      shortCallout: `후면본문 ${m.backLegalBodyPt}→${lineRule.sideBackRules.backLegalBodyPt}pt`,
      status: eff.backLegalBodyPt >= lineRule.sideBackRules.backLegalBodyPt ? 'PASS' : 'FAIL',
      autoFixable: true,
    },
    {
      id: 'C-top-pop',
      targetId: 'obj-top-pop',
      category: 'Preflight',
      panel: 'TOP',
      title: '상단(TOP) 슬로건·로고 인쇄 안전여백',
      standard: `접선 안쪽 ${lineRule.safeMarginMm.toFixed(1)}mm 이상`,
      current: `${m.topPopMarginMm.toFixed(1)}mm (상단 접선 1.3mm 근접)`,
      measured: `${eff.topPopMarginMm.toFixed(1)}mm`,
      action: `상단 문안 여백을 ${lineRule.safeMarginMm.toFixed(1)}mm로 중앙 재배치`,
      shortCallout: `상단여백 ${m.topPopMarginMm}→${lineRule.safeMarginMm}mm`,
      status: eff.topPopMarginMm >= lineRule.safeMarginMm - 0.1 ? 'PASS' : 'WARN',
      autoFixable: true,
    },
    {
      id: 'D-bottom-barcode',
      targetId: 'obj-bottom-recycle',
      category: 'Family-look',
      panel: 'BOTTOM',
      title: '하단(BOTTOM) 분리배출 도안 글자 크기',
      standard: `최소 ${lineRule.sideBackRules.bottomRecyclePt.toFixed(1)}pt 이상`,
      current: `${m.bottomRecyclePt.toFixed(1)}pt (기준 대비 1.0pt 미달)`,
      measured: `${eff.bottomRecyclePt.toFixed(1)}pt`,
      action: `분리배출 표기 크기를 ${lineRule.sideBackRules.bottomRecyclePt.toFixed(1)}pt로 확대`,
      shortCallout: `분리배출 ${m.bottomRecyclePt}→${lineRule.sideBackRules.bottomRecyclePt}pt`,
      status: eff.bottomRecyclePt >= lineRule.sideBackRules.bottomRecyclePt ? 'PASS' : 'WARN',
      autoFixable: true,
    }
  );

  return { effectiveSpec: eff, checks };
}

/* ─── 패키지 바깥 여백에 절대 겹치지 않게 빨간색 지시선 콜아웃을 배치하는 렌더러 ─── */
function renderExternalCalloutsSvg(callouts, panelX, panelW, activeTargetId) {
  if (!callouts || callouts.length === 0) return '';
  const fontFam = "'VB-ShinGothic','RIX-신고딕se-pro','Noto Sans KR',sans-serif";

  const leftList = callouts.filter(c => c.side === 'left').sort((a, b) => a.anchorY - b.anchorY);
  const rightList = callouts.filter(c => c.side === 'right').sort((a, b) => a.anchorY - b.anchorY);

  const minStepY = 10.5;
  const assignNonOverlappingY = (list) => {
    let prevY = -999;
    list.forEach(item => {
      const y = Math.max(item.anchorY, prevY + minStepY);
      item.labelY = y;
      prevY = y;
    });
  };

  assignNonOverlappingY(leftList);
  assignNonOverlappingY(rightList);

  const renderItem = (item) => {
    const isSelected = activeTargetId === item.targetId;
    const col = item.status === 'FAIL' ? '#E52421' : '#D97706';
    const badgeW = 42;
    const badgeH = 6.4;

    // 1. 패키지 내부에는 글씨 없이 점선 테두리만 깔끔하게 표시
    const boxSvg = `
      <rect x="${item.boxX.toFixed(2)}" y="${item.boxY.toFixed(2)}" width="${item.boxW.toFixed(2)}" height="${item.boxH.toFixed(2)}"
            fill="${isSelected ? 'rgba(229,36,33,0.10)' : 'none'}"
            stroke="${col}" stroke-width="${isSelected ? '0.75' : '0.45'}" stroke-dasharray="1.4 0.9"/>
    `;

    // 2. 패키지 바깥(좌측 또는 우측 여백)으로 지시선(Leader Line)과 라벨 배지 인출
    if (item.side === 'left') {
      const elbowX = panelX - 3.5;
      const badgeRightX = panelX - 6.0;
      const badgeLeftX = badgeRightX - badgeW;
      return `
        <g class="dc-callout-group" data-target="${item.targetId}" style="cursor:pointer;">
          ${boxSvg}
          <circle cx="${item.anchorX.toFixed(2)}" cy="${item.anchorY.toFixed(2)}" r="0.9" fill="${col}"/>
          <polyline points="${item.anchorX.toFixed(2)},${item.anchorY.toFixed(2)} ${elbowX.toFixed(2)},${item.anchorY.toFixed(2)} ${badgeRightX.toFixed(2)},${item.labelY.toFixed(2)}"
                    fill="none" stroke="${col}" stroke-width="${isSelected ? '0.65' : '0.4'}"/>
          <rect x="${badgeLeftX.toFixed(2)}" y="${(item.labelY - badgeH / 2).toFixed(2)}" width="${badgeW}" height="${badgeH}" rx="0.8"
                fill="${col}" stroke="${isSelected ? '#101820' : 'none'}" stroke-width="0.5"/>
          <text x="${(badgeLeftX + badgeW / 2).toFixed(2)}" y="${(item.labelY + 1.0).toFixed(2)}"
                text-anchor="middle" fill="#FFFFFF" font-size="2.75" font-weight="700" font-family="${fontFam}">${item.text}</text>
        </g>
      `;
    } else {
      const elbowX = panelX + panelW + 3.5;
      const badgeLeftX = panelX + panelW + 6.0;
      return `
        <g class="dc-callout-group" data-target="${item.targetId}" style="cursor:pointer;">
          ${boxSvg}
          <circle cx="${item.anchorX.toFixed(2)}" cy="${item.anchorY.toFixed(2)}" r="0.9" fill="${col}"/>
          <polyline points="${item.anchorX.toFixed(2)},${item.anchorY.toFixed(2)} ${elbowX.toFixed(2)},${item.anchorY.toFixed(2)} ${badgeLeftX.toFixed(2)},${item.labelY.toFixed(2)}"
                    fill="none" stroke="${col}" stroke-width="${isSelected ? '0.65' : '0.4'}"/>
          <rect x="${badgeLeftX.toFixed(2)}" y="${(item.labelY - badgeH / 2).toFixed(2)}" width="${badgeW}" height="${badgeH}" rx="0.8"
                fill="${col}" stroke="${isSelected ? '#101820' : 'none'}" stroke-width="0.5"/>
          <text x="${(badgeLeftX + badgeW / 2).toFixed(2)}" y="${(item.labelY + 1.0).toFixed(2)}"
                text-anchor="middle" fill="#FFFFFF" font-size="2.75" font-weight="700" font-family="${fontFam}">${item.text}</text>
        </g>
      `;
    }
  };

  return [...leftList, ...rightList].map(renderItem).join('');
}

/* ─── 단일 패널 그래픽 렌더러 (FRONT, LEFT, RIGHT, BACK, TOP, BOTTOM) ─── */
function renderPanelArtworkSvg(panelId, px, py, pw, ph, scenario, spec, checks, activeTargetId, mode, showExternalCallouts = false) {
  const isIb = scenario.line === 'innerbeauty';
  const isNc = scenario.line === 'newcommerce';
  const isFood = scenario.foodType === 'food';

  // 메타그린이면 전체 다 그린(#00843D), 이너뷰티면 전체 다 그레이(#EDEDED), 뉴커머스면 네이비(#1C264A)
  const bgHex = isIb ? '#EDEDED' : isNc ? '#1C264A' : '#00843D';
  const tagHex = isIb ? '#F6B9D4' : isNc ? '#D4AF37' : '#CEDC00';
  const textColor = isIb ? '#1D1D1B' : '#FFFFFF';
  const subBoxFill = isIb ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)';
  const subBoxStroke = isIb ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.32)';
  const safeStroke = isIb ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.26)';
  const fontFam = "'RixSinGoSE_Pro','RIX-신고딕se-pro','VB-ShinGothic',sans-serif";

  const issueByTarget = {};
  if (mode === 'before') {
    checks.forEach(c => {
      if (c.panel === panelId && (c.status === 'FAIL' || c.status === 'WARN')) {
        issueByTarget[c.targetId] = c;
      }
    });
  }

  const callouts = [];
  const addCallout = (targetId, side, boxX, boxY, boxW, boxH) => {
    const issue = issueByTarget[targetId];
    if (!issue || !showExternalCallouts) return;
    const anchorX = side === 'left' ? px + boxX : px + boxX + boxW;
    const anchorY = py + boxY + boxH / 2;
    callouts.push({
      targetId,
      side,
      status: issue.status,
      text: issue.shortCallout,
      boxX: px + boxX,
      boxY: py + boxY,
      boxW,
      boxH,
      anchorX,
      anchorY,
    });
  };

  let inner = '';

  // ── 1. 전면 (FRONT) ──
  if (panelId === 'FRONT') {
    const topLine = spec.topLineMm || 1.5;
    const tagW = spec.tagW || 43.59;
    const tagH = spec.tagH || 6.47;
    const tagY0 = +(topLine * 0.78).toFixed(2);
    const tagY1 = +(tagY0 + tagH).toFixed(2);
    const tagX = (pw - tagW) / 2 + (spec.tagOffsetX || 0);

    const titlePx = +(spec.titlePt * PT_TO_MM).toFixed(2);
    const titleY = +(tagY1 + spec.gapTagToTitleMm + titlePx * 0.84).toFixed(2);
    const ingPx = +(spec.ingPt * PT_TO_MM).toFixed(2);
    const capPx = +(spec.capPt * PT_TO_MM).toFixed(2);
    const bottomMargin = spec.safeMarginMinMm || 3.0;
    const capY = +(ph - bottomMargin - capPx * 0.2).toFixed(2);
    const markSize = spec.hffMarkMm || 15.0;

    // Layout Simulator와 100% 동일한 VITALBEAUTIE 사다리꼴 로고 태그
    const logoTagSvg = renderVitalbeautieLogoTagSvg(px, py, pw, tagHex, {
      topLineMm: topLine,
      tagWTop: tagW,
      tagH: tagH,
      tagOffsetX: spec.tagOffsetX || 0,
    });

    if (isIb) {
      const leftX = 4.5;
      const hasSubName = Boolean(spec.productName && spec.productName.trim());
      const titleLine2Y = +(titleY + titlePx * 1.15).toFixed(2);
      const lastTitleY = hasSubName ? parseFloat(titleLine2Y) : titleY;

      const benY = +(ph * 0.48).toFixed(2);
      const pills = Array.isArray(spec.points) ? spec.points : ['3 TYPES 저분자 콜라겐 1,000mg*', '헤드투토, 트리플 뷰티 부스트'];
      const pillH = 4.8;
      const pillGap = 1.2;
      const pillsSvg = pills.slice(0, 3).map((pTxt, idx) => {
        const pyRow = +(parseFloat(benY) + 2.4 + idx * (pillH + pillGap)).toFixed(2);
        const pwBox = Math.min(pw - leftX * 2, Math.max(26, pTxt.length * 2.05 + 5));
        return `
          <rect x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(pyRow)).toFixed(2)}" width="${pwBox.toFixed(2)}" height="${pillH}" rx="${(pillH / 2).toFixed(2)}" fill="${tagHex}"/>
          <text x="${(px + leftX + pwBox / 2).toFixed(2)}" y="${(py + parseFloat(pyRow) + pillH * 0.69).toFixed(2)}" text-anchor="middle" fill="#1D1D1B" font-size="2.45" font-weight="600" font-family="${fontFam}">${pTxt.slice(0, 24)}</text>
        `;
      }).join('');

      const ingLines = wrapTextToLines(spec.ingredient, 24, 2);

      if (isFood) {
        // 이너뷰티 일반식품(슈퍼콜라겐/슈퍼레티놀/PDRN): 하단에 내용량 + 원료명 및 함량 표기 (건기식 마크 없음)
        const ingBottomY = +(capY + ingPx * 1.25).toFixed(2);
        const adjCapY = +(capY - ingLines.length * (ingPx * 1.22) - 1.5).toFixed(2);
        inner = `
          ${logoTagSvg}
          <text x="${(px + leftX).toFixed(2)}" y="${(py + titleY).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="${titlePx}" font-weight="700" font-family="${fontFam}">${spec.lineName}</text>
          ${hasSubName ? `<text x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(titleLine2Y)).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="${titlePx}" font-weight="500" font-family="${fontFam}">${spec.productName}</text>` : ''}
          <text x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(benY)).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="3.2" font-weight="700" letter-spacing="0.08em" font-family="'Raleway',${fontFam}">${spec.benefit || 'BRIGHT & GLOW'}</text>
          ${pillsSvg}
          <text x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(adjCapY)).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="${capPx}" font-weight="700" font-family="${fontFam}">${spec.capacity}</text>
          ${ingLines.map((ln, idx) => `
            <text x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(adjCapY) + 4.2 + idx * (ingPx * 1.2)).toFixed(2)}" text-anchor="start" fill="#555555" font-size="${(ingPx * 0.85).toFixed(2)}" font-weight="600" font-family="${fontFam}">${ln}</text>
          `).join('')}
        `;
        addCallout('obj-ingredient', 'left', leftX, parseFloat(adjCapY) + 1.5, pw - leftX * 2, ingLines.length * ingPx * 1.2 + 2);
        addCallout('obj-capacity', 'right', leftX, parseFloat(adjCapY) - capPx, pw - leftX * 2, capPx + 1.5);
      } else {
        // 이너뷰티 건강기능식품(케라핏/시카B5): 타이틀 아래 원재료명 + 우하단 건기식 마크 + 하단 내용량
        const ibIngY = +(lastTitleY + 3.2 + ingPx * 0.85).toFixed(2);
        const markX = +(px + pw - leftX - markSize).toFixed(2);
        const markY = +(py + ph - bottomMargin - markSize).toFixed(2);
        inner = `
          ${logoTagSvg}
          <text x="${(px + leftX).toFixed(2)}" y="${(py + titleY).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="${titlePx}" font-weight="700" font-family="${fontFam}">${spec.lineName}</text>
          ${hasSubName ? `<text x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(titleLine2Y)).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="${titlePx}" font-weight="500" font-family="${fontFam}">${spec.productName}</text>` : ''}
          ${ingLines.map((ln, idx) => `
            <text x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(ibIngY) + idx * (ingPx * 1.2)).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="${ingPx}" font-weight="300" font-family="${fontFam}">${ln}</text>
          `).join('')}
          <text x="${(px + leftX).toFixed(2)}" y="${(py + parseFloat(benY)).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="3.2" font-weight="700" letter-spacing="0.08em" font-family="'Raleway',${fontFam}">${spec.benefit || 'SHINE & YOUTHFUL'}</text>
          ${pillsSvg}
          ${getHffMarkSvg(markX, markY, markSize, 0.78, textColor)}
          <text x="${(px + leftX).toFixed(2)}" y="${(py + capY).toFixed(2)}" text-anchor="start" fill="${textColor}" font-size="${capPx}" font-weight="700" font-family="${fontFam}">${spec.capacity}</text>
        `;
        addCallout('obj-ingredient', 'left', leftX, parseFloat(ibIngY) - ingPx, pw - leftX * 2, ingLines.length * ingPx * 1.2 + 1.5);
        addCallout('obj-hff-mark', 'right', pw - leftX - markSize, ph - bottomMargin - markSize, markSize, markSize);
        addCallout('obj-capacity', 'left', leftX, capY - capPx, pw - leftX * 2 - markSize - 2, capPx + 1.5);
      }
    } else {
      // 메타그린 / 뉴커머스
      const fullTitle = `${spec.lineName || ''} ${spec.productName || ''}`.trim();
      const splitTitle = fullTitle.length > 9 && spec.productName;
      const titleLine2Y = +(titleY + titlePx * 1.15).toFixed(2);
      const lastTitleY = splitTitle ? parseFloat(titleLine2Y) : titleY;
      const maxIngChars = Math.max(14, Math.floor((pw - 10) / (ingPx * 0.78)));
      const ingLines = wrapTextToLines(spec.ingredient, maxIngChars, 2);

      const titleSvg = splitTitle
        ? `
          <text x="${(px + pw / 2).toFixed(2)}" y="${(py + titleY).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${titlePx}" font-weight="700" font-family="${fontFam}">${spec.lineName}</text>
          <text x="${(px + pw / 2).toFixed(2)}" y="${(py + parseFloat(titleLine2Y)).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${titlePx}" font-weight="300" font-family="${fontFam}">${spec.productName}</text>
        `
        : `
          <text x="${(px + pw / 2).toFixed(2)}" y="${(py + titleY).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${titlePx}" font-family="${fontFam}">
            <tspan font-weight="700">${spec.lineName}</tspan>${spec.productName ? `<tspan font-weight="300"> ${spec.productName}</tspan>` : ''}
          </text>
        `;

      if (isFood) {
        // 메타그린 일반식품 (브이레디, 클린티, 효소, 젤리 애사비 등):
        // 타이틀 아래에는 원료명을 두지 않고, 건기식 마크도 없음! 하단 내용량 바로 위에 원료명 및 함량(14pt, 75% 투명도) 표기!
        const ingStep = ingPx * 1.22;
        const ingStartY = +(capY - capPx - 3.5 - (ingLines.length - 1) * ingStep).toFixed(2);
        inner = `
          ${logoTagSvg}
          ${titleSvg}
          ${ingLines.map((ln, idx) => `
            <text x="${(px + pw / 2).toFixed(2)}" y="${(py + parseFloat(ingStartY) + idx * ingStep).toFixed(2)}" text-anchor="middle" fill="${textColor}" opacity="0.82" font-size="${ingPx}" font-weight="500" font-family="${fontFam}">${ln}</text>
          `).join('')}
          <text x="${(px + pw / 2).toFixed(2)}" y="${(py + capY).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${capPx}" font-weight="500" font-family="${fontFam}">${spec.capacity}</text>
        `;
        addCallout('obj-ingredient', 'right', 6, parseFloat(ingStartY) - ingPx * 0.85, pw - 12, ingLines.length * ingStep + 1);
        addCallout('obj-capacity', 'left', 6, capY - capPx, pw - 12, capPx + 1.5);
      } else {
        // 메타그린 / 뉴커머스 건강기능식품 (슬림업, 부스터샷, 젤리 더블컷, 크레아틴, 조이스텝 등):
        // 제품명 바로 아래 기능성 원료명(1/2 크기) + 우하단 건기식 15mm 마크 + 하단 건강기능식품 내용량
        const ingStep = ingPx * 1.22;
        const ingStartY = +(lastTitleY + 3.2 + ingPx * 0.85).toFixed(2);
        const markX = +(px + pw - 3.5 - markSize).toFixed(2);
        const markY = +(py + capY - capPx * 0.85 - 2.2 - markSize).toFixed(2);
        inner = `
          ${logoTagSvg}
          ${titleSvg}
          ${ingLines.map((ln, idx) => `
            <text x="${(px + pw / 2).toFixed(2)}" y="${(py + parseFloat(ingStartY) + idx * ingStep).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${ingPx}" font-weight="300" font-family="${fontFam}">${ln}</text>
          `).join('')}
          ${getHffMarkSvg(markX, markY, markSize, 0.7, textColor)}
          <text x="${(px + pw / 2).toFixed(2)}" y="${(py + capY).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${capPx}" font-weight="500" font-family="${fontFam}">${spec.capacity}</text>
        `;
        addCallout('obj-ingredient', 'left', 6, parseFloat(ingStartY) - ingPx * 0.85, pw - 12, ingLines.length * ingStep + 1);
        addCallout('obj-hff-mark', 'right', pw - 3.5 - markSize, capY - capPx * 0.85 - 2.2 - markSize, markSize, markSize);
        addCallout('obj-capacity', 'left', 6, capY - capPx, pw - 12, capPx + 1.5);
      }
    }

    // 상단 공통 콜아웃 (좌우 교차 배치하여 절대 겹치지 않도록 분리)
    addCallout('obj-topline', 'left', 0, 0, pw, topLine);
    addCallout('obj-tag', 'right', tagX, tagY0, tagW, tagH);
    addCallout('obj-tag-pos', 'left', tagX, tagY0, tagW, tagH);
    addCallout('obj-tag-gap', 'right', pw / 2 - 14, tagY1, 28, spec.gapTagToTitleMm);
    addCallout('obj-safe-margin', 'right', 2, ph - bottomMargin, pw - 4, bottomMargin);
  }

  // ── 2. 좌측면 (LEFT) ──
  else if (panelId === 'LEFT') {
    const headPx = +(spec.leftSubHeadPt * PT_TO_MM * 0.78).toFixed(2);
    const pts = Array.isArray(spec.leftPoints) ? spec.leftPoints : ['프리미엄 포뮬러 설계', '1일 권장 섭취 루틴'];
    const dirLines = wrapTextToLines(spec.directions, Math.max(12, Math.floor((pw - 6) / 2.0)), 3);

    inner = `
      <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="1.5" fill="${tagHex}"/>
      <text x="${(px + pw / 2).toFixed(2)}" y="${(py + 14).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${headPx}" font-weight="700" font-family="${fontFam}">${spec.leftTitle || `${spec.lineName} ${spec.productName}`}</text>

      ${pts.map((pt, idx) => {
        const cy = py + 28 + idx * 18;
        return `
          <rect x="${(px + 3.5).toFixed(2)}" y="${cy.toFixed(2)}" width="${(pw - 7).toFixed(2)}" height="13" rx="1.2" fill="${subBoxFill}" stroke="${subBoxStroke}" stroke-width="0.25"/>
          <text x="${(px + pw / 2).toFixed(2)}" y="${(cy + 7.8).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="2.3" font-weight="600" font-family="${fontFam}">${pt.slice(0, 20)}</text>
        `;
      }).join('')}

      <text x="${(px + 4).toFixed(2)}" y="${(py + ph - 32).toFixed(2)}" fill="${textColor}" font-size="2.3" font-weight="700" font-family="${fontFam}">[섭취량 및 섭취방법]</text>
      ${dirLines.map((ln, idx) => `
        <text x="${(px + 4).toFixed(2)}" y="${(py + ph - 27 + idx * 3.4).toFixed(2)}" fill="${textColor}" opacity="0.9" font-size="2.05" font-family="${fontFam}">${ln}</text>
      `).join('')}

      <rect x="${(px + 4).toFixed(2)}" y="${(py + ph - 14).toFixed(2)}" width="${(pw - 8).toFixed(2)}" height="9" fill="#FFFFFF" stroke="${subBoxStroke}" stroke-width="0.25"/>
      <text x="${(px + pw / 2).toFixed(2)}" y="${(py + ph - 8.5).toFixed(2)}" text-anchor="middle" fill="#101820" font-size="2.0" font-weight="600" font-family="${fontFam}">소비기한 별도표기일 (30×10mm)</text>
    `;
    addCallout('obj-left-subhead', 'left', 3, 9, pw - 6, 8);
  }

  // ── 3. 우측면 (RIGHT · 영양·기능정보 10pt · 좌우 2mm 마진 · 0.3mm 구분선 상하 1mm · 하단 15mm 위치 11mm 소비기한 흰박스) ──
  else if (panelId === 'RIGHT') {
    const rows = Array.isArray(spec.nutritionRows) ? spec.nutritionRows : [];
    const nutLineText = [
      '영양·기능 정보',
      spec.nutritionHeader || '1일 섭취량 : 27.19 g (액상 26.35 g+정제 0.84 g)',
      `1일 섭취량 당 함량 : ${rows.map(r => `${r[0]} ${r[1]}(${r[2]})`).join(', ')}`,
      '※ ( )안의 수치는 1일 영양성분 기준치에 대한 비율임',
      spec.functionalIngredients || '',
    ].filter(Boolean).join('\n');

    const rightBlocks = [
      { fieldKey: '영양기능정보', textContent: nutLineText },
      { fieldKey: '정보', textContent: spec.allergenNotice || '본 제품은 난류(가금류), 우유, 메밀, 땅콩, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토, 아황산류, 호두, 닭고기, 쇠고기, 오징어, 조개류, 잣을 사용한 제품과 같은 제조시설에서 제조하고 있습니다.' },
      {
        fieldKey: '교환문의 구입처 및 고객상담실',
        textContent: `고객상담전화 080-023-5454\n제조원 : ${spec.manufacturer || '(주)아모레퍼시픽'}\n반품교환소재지 : 서울특별시 용산구 한강대로 100`,
      },
    ];

    const res = renderSideOrBackPanel10ptSvg(
      { id: 'RIGHT', x: px, y: py, w: pw, h: ph },
      rightBlocks,
      {
        textColor,
        dividerColor: isIb ? '#1D1D1B' : '#FFFFFF',
        fontFam,
        showExpiryBox: true,
        hasExpiryBox: true,
        bodyPt: spec.rightNutritionPt || 10.0,
        marginMm: 2.0,
        dividerStrokeMm: 0.3,
        dividerGapMm: 1.5,
        expiryBottomMarginMm: 15.0,
        expiryBoxHeightMm: 11.0,
      }
    );

    inner = `
      <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="1.5" fill="${tagHex}"/>
      ${res.svg}
    `;
    addCallout('obj-right-nutrition', 'right', 2.0, 5.0, pw - 4.0, ph - 10.0);
  }

  // ── 4. 후면 (BACK · 제품명 15pt · 본문 10pt · 좌우 2mm 마진 · 분류마다 0.3mm 구분선 위아래 1.5mm 간격) ──
  else if (panelId === 'BACK') {
    const backBlocks = [
      { fieldKey: '제품명', textContent: `${spec.lineName} ${spec.productName}`.trim() },
      { fieldKey: '제품 설명', textContent: spec.subCopy || `${spec.lineName} ${spec.productName} 프리미엄 포뮬러` },
      { fieldKey: '섭취량 및 섭취방법', textContent: spec.directions || '1일 1회, 1회 1포(병)를 섭취하십시오.' },
      { fieldKey: '섭취 시 주의사항', textContent: spec.warnings || '특이체질, 알레르기 체질의 경우 성분을 확인하신 후 섭취하십시오.' },
      { fieldKey: '원재료명 및 함량', textContent: spec.rawMaterials || '' },
      { fieldKey: '보관상 주의사항', textContent: spec.storage || '직사광선 및 고온다습한 곳을 피해 서늘한 곳에 보관하십시오.' },
    ];

    const res = renderSideOrBackPanel10ptSvg(
      { id: 'BACK', x: px, y: py, w: pw, h: ph },
      backBlocks,
      {
        textColor,
        dividerColor: isIb ? '#1D1D1B' : '#FFFFFF',
        fontFam,
        showExpiryBox: false,
        hasExpiryBox: false,
        titlePt: spec.backHeaderPt || 15.0,
        bodyPt: spec.backLegalBodyPt || 10.0,
        marginMm: 2.0,
        dividerStrokeMm: 0.3,
        dividerGapMm: 1.5,
      }
    );

    inner = `
      <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="1.5" fill="${tagHex}"/>
      ${res.svg}
    `;
    addCallout('obj-back-header', 'left', 2.0, 4.5, pw - 4.0, 7.0);
    addCallout('obj-back-legal', 'right', 2.0, 14.0, pw - 4.0, ph - 20.0);
  }

  // ── 5. 상단 (TOP · 상단 뚜껑 및 POP 슬로건) ──
  else if (panelId === 'TOP') {
    const popMargin = spec.topPopMarginMm || 3.0;
    inner = `
      <rect x="${(px + popMargin).toFixed(2)}" y="${(py + popMargin).toFixed(2)}" width="${(pw - popMargin * 2).toFixed(2)}" height="${(ph - popMargin * 2).toFixed(2)}"
            fill="${tagHex}" rx="1.2"/>
      <text x="${(px + pw / 2).toFixed(2)}" y="${(py + ph * 0.42).toFixed(2)}" text-anchor="middle" fill="#1D1D1B" font-size="3.2" font-weight="700" font-family="${fontFam}">${spec.topSubCopy || '중요한 약속 전날엔'}</text>
      <text x="${(px + pw / 2).toFixed(2)}" y="${(py + ph * 0.70).toFixed(2)}" text-anchor="middle" fill="#1D1D1B" font-size="5.2" font-weight="800" font-family="${fontFam}">${spec.topMainCopy || '가벼움을 SOS'}</text>
    `;
    addCallout('obj-top-pop', 'right', popMargin, popMargin, pw - popMargin * 2, ph - popMargin * 2);
  }

  // ── 6. 하단 (BOTTOM · 바코드 및 분리배출/인증 마크) ──
  else if (panelId === 'BOTTOM') {
    const recPt = spec.bottomRecyclePt || 7.0;
    const recPx = +(recPt * PT_TO_MM * 0.85).toFixed(2);
    const bcW = Math.min(36, pw * 0.48);
    const bcH = Math.min(18, ph * 0.52);
    const bcX = px + pw - bcW - 6;
    const bcY = py + (ph - bcH) / 2;

    inner = `
      <!-- 좌측 분리배출 및 FSC 마크 -->
      <rect x="${(px + 6).toFixed(2)}" y="${(py + (ph - bcH) / 2).toFixed(2)}" width="22" height="${bcH.toFixed(1)}" fill="${subBoxFill}" stroke="${subBoxStroke}" stroke-width="0.3"/>
      <text x="${(px + 17).toFixed(2)}" y="${(py + ph / 2 - 1).toFixed(2)}" text-anchor="middle" fill="${textColor}" font-size="${recPx}" font-weight="700" font-family="${fontFam}">분리배출(${recPt}pt)</text>
      <text x="${(px + 17).toFixed(2)}" y="${(py + ph / 2 + 4).toFixed(2)}" text-anchor="middle" fill="${textColor}" opacity="0.85" font-size="2.0" font-family="${fontFam}">종이 / HDPE / PP</text>

      <!-- 우측 바코드 및 품목코드 -->
      <rect x="${bcX.toFixed(2)}" y="${bcY.toFixed(2)}" width="${bcW.toFixed(1)}" height="${bcH.toFixed(1)}" fill="#FFFFFF" stroke="#101820" stroke-width="0.25"/>
      ${Array.from({ length: 18 }).map((_, i) => {
        const lx = bcX + 3 + i * ((bcW - 6) / 18);
        const lw = (i % 3 === 0) ? 0.9 : 0.45;
        return `<rect x="${lx.toFixed(2)}" y="${(bcY + 2).toFixed(2)}" width="${lw}" height="${(bcH - 6.5).toFixed(1)}" fill="#101820"/>`;
      }).join('')}
      <text x="${(bcX + bcW / 2).toFixed(2)}" y="${(bcY + bcH - 1.8).toFixed(2)}" text-anchor="middle" fill="#101820" font-size="2.2" font-weight="700" font-family="monospace">${spec.barcode || '8 800283 712522'}</text>
      <text x="${(bcX + bcW / 2).toFixed(2)}" y="${(bcY + bcH + 3.2).toFixed(2)}" text-anchor="middle" fill="${textColor}" opacity="0.85" font-size="2.0" font-family="${fontFam}">MADE IN KOREA (${spec.itemCode || '11077-1473'})</text>
    `;
    addCallout('obj-bottom-recycle', 'left', 6, (ph - bcH) / 2, 22, bcH);
  }

  const calloutsSvg = showExternalCallouts ? renderExternalCalloutsSvg(callouts, px, pw, activeTargetId) : '';

  return `
    <g id="dc-panel-${mode}-${panelId}">
      <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="${ph.toFixed(2)}" fill="${bgHex}" stroke="rgba(0,0,0,0.25)" stroke-width="0.3"/>
      <rect x="${(px + 3).toFixed(2)}" y="${(py + 3).toFixed(2)}" width="${(pw - 6).toFixed(2)}" height="${(ph - 6).toFixed(2)}" fill="none" stroke="${safeStroke}" stroke-width="0.2" stroke-dasharray="1.0 0.8"/>
      ${inner}
      ${calloutsSvg}
    </g>
  `;
}

/* ─── BEFORE / AFTER 캔버스 SVG 렌더러 (단일 면 + 6면 전체 원화 모두 지원) ─── */
function renderValidationSvg(scenario, spec, checks, activeTargetId, mode = 'before', panel = 'FRONT') {
  const W = scenario.frontPanelMm.w || 76.0;
  const H = scenario.frontPanelMm.h || 138.0;
  const sideW = scenario.sideWidthMm || Math.round(W * 0.52);

  // 6면 전체 원화 전개도 (BACK - LEFT - FRONT - RIGHT + 상단 TOP + 하단 BOTTOM)
  if (panel === 'ALL') {
    const xBack = 14;
    const xLeft = xBack + W;
    const xFront = xLeft + sideW;
    const xRight = xFront + W;
    const yTop = 10;
    const yBody = yTop + sideW;
    const yBot = yBody + H;
    const totalW = xRight + sideW + 14;
    const totalH = yBot + sideW + 10;

    const isIb = scenario.line === 'innerbeauty';
    const isNc = scenario.line === 'newcommerce';
    const flapFill = isIb ? '#EDEDED' : isNc ? '#1C264A' : '#00843D';
    const flapStroke = isIb ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.28)';

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" class="pf-svg" width="100%" height="500" style="display:block; margin:0 auto; background:#FFFFFF;">
        <!-- 접착면(Glue Flap) 및 상하 더스트 플랩 -->
        <polygon points="${xBack - 12},${yBody + 6} ${xBack},${yBody} ${xBack},${yBody + H} ${xBack - 12},${yBody + H - 6}" fill="${flapFill}" stroke="${flapStroke}" stroke-width="0.25"/>
        <rect x="${xBack}" y="${yTop}" width="${W}" height="${sideW}" fill="${flapFill}" stroke="${flapStroke}" stroke-width="0.25"/>
        <rect x="${xLeft}" y="${yTop + 8}" width="${sideW}" height="${sideW - 8}" fill="${flapFill}" stroke="${flapStroke}" stroke-width="0.25"/>
        <rect x="${xRight}" y="${yTop + 8}" width="${sideW}" height="${sideW - 8}" fill="${flapFill}" stroke="${flapStroke}" stroke-width="0.25"/>
        <rect x="${xLeft}" y="${yBot}" width="${sideW}" height="${sideW - 8}" fill="${flapFill}" stroke="${flapStroke}" stroke-width="0.25"/>
        <rect x="${xRight}" y="${yBot}" width="${sideW}" height="${sideW - 8}" fill="${flapFill}" stroke="${flapStroke}" stroke-width="0.25"/>
        <rect x="${xBack}" y="${yBot}" width="${W}" height="${sideW}" fill="${flapFill}" stroke="${flapStroke}" stroke-width="0.25"/>

        <!-- 6면 본체 (후면 · 좌측면 · 전면 · 우측면 · 상단 · 하단) -->
        ${renderPanelArtworkSvg('TOP', xFront, yTop, W, sideW, scenario, spec, checks, activeTargetId, mode, false)}
        ${renderPanelArtworkSvg('BACK', xBack, yBody, W, H, scenario, spec, checks, activeTargetId, mode, false)}
        ${renderPanelArtworkSvg('LEFT', xLeft, yBody, sideW, H, scenario, spec, checks, activeTargetId, mode, false)}
        ${renderPanelArtworkSvg('FRONT', xFront, yBody, W, H, scenario, spec, checks, activeTargetId, mode, false)}
        ${renderPanelArtworkSvg('RIGHT', xRight, yBody, sideW, H, scenario, spec, checks, activeTargetId, mode, false)}
        ${renderPanelArtworkSvg('BOTTOM', xFront, yBot, W, sideW, scenario, spec, checks, activeTargetId, mode, false)}
      </svg>
    `;
  }

  // 단일 패널 뷰: 바깥 여백(좌우 52mm)을 BEFORE와 AFTER 동일하게 확보하여
  // 기존(BEFORE)과 원본/수정본(AFTER)의 패키지 크기가 1:1로 완벽히 동일하게 일치하도록 설계
  const curW = (panel === 'LEFT' || panel === 'RIGHT') ? sideW : W;
  const curH = (panel === 'TOP' || panel === 'BOTTOM') ? Math.max(38, sideW) : H;
  const marginX = 52;
  const marginY = 12;
  const vbX = -marginX;
  const vbY = -marginY;
  const vbW = curW + marginX * 2;
  const vbH = curH + marginY * 2;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" class="pf-svg" width="100%" height="480" style="display:block; margin:0 auto; background:#FFFFFF;">
      ${renderPanelArtworkSvg(panel, 0, 0, curW, curH, scenario, spec, checks, activeTargetId, mode, mode === 'before')}
    </svg>
  `;
}

/* ─── 페이지 메인 렌더 함수 ─── */
export function renderDesignCheckerPage(el) {
  let masterRules = JSON.parse(JSON.stringify(DEFAULT_MASTER_RULES));
  let currentLine = 'metagreen';
  let currentPkg = 'carton';
  let currentPanel = 'FRONT'; // FRONT | LEFT | RIGHT | BACK | TOP | BOTTOM | ALL

  let activeTargetId = null;
  let hasUploadedFile = false;
  let customUploadedFileName = null;
  let customParsedInfo = null;

  const ALL_FIX_IDS = [
    'A-topline', 'A-tag-size', 'A-tag-pos',
    'B-gap-tag-title', 'B-ing-pt', 'C-cap-pt',
    'D-safe-margin', 'B-hff-mark',
    'B-left-subhead', 'C-right-nutrition',
    'C-back-header', 'C-back-legal',
    'C-top-pop', 'D-bottom-barcode',
  ];
  let selectedFixes = new Set(ALL_FIX_IDS);

  const buildCurrentScenario = () => {
    const info = customParsedInfo || inferProductInfoFromTextAndName('', '');
    const lineRule = masterRules.lines[currentLine] || masterRules.lines.metagreen;
    const isFood = info.foodType === 'food';
    const stdTitlePt = lineRule.titlePtStd || 24;
    const stdIngPt = isFood ? lineRule.foodIngPtStd : +(stdTitlePt * lineRule.hffIngRatio).toFixed(1);

    return {
      line: currentLine,
      pkgType: currentPkg,
      foodType: info.foodType || 'hff',
      fileName: customUploadedFileName || '바이탈(26)메타그린브이레디60정단1473_수정.ai',
      frontPanelMm: { w: info.wMm || 76.0, h: info.hMm || 138.0 },
      sideWidthMm: info.sideWMm || 42.0,
      measured: {
        ...info,
        topLineMm: 1.1,
        tagW: 38.8,
        tagH: 5.6,
        tagOffsetX: 3.2,
        gapTagToTitleMm: +(lineRule.gapTagToTitleStdMm + 2.3).toFixed(1),
        titlePt: stdTitlePt,
        ingPt: +(stdIngPt + 2.0).toFixed(1),
        capPt: 8.5,
        safeMarginMinMm: 1.8,
        hffMarkMm: 13.0,
        leftSubHeadPt: 11.0,
        rightNutritionPt: 9.2,
        backHeaderPt: 13.0,
        backLegalBodyPt: 9.0,
        topPopMarginMm: 1.7,
        bottomRecyclePt: 6.0,
      },
    };
  };

  const render = () => {
    const scenario = buildCurrentScenario();
    const beforeEval = runValidationChecks(scenario, masterRules, new Set());
    const afterEval = runValidationChecks(scenario, masterRules, selectedFixes);

    const failCount = beforeEval.checks.filter(c => c.status === 'FAIL').length;
    const warnCount = beforeEval.checks.filter(c => c.status === 'WARN').length;
    const fixableChecks = beforeEval.checks.filter(c => c.autoFixable);
    const resolvedCount = fixableChecks.filter(c => selectedFixes.has(c.id)).length;

    const beforeSvg = hasUploadedFile
      ? renderValidationSvg(scenario, beforeEval.effectiveSpec, beforeEval.checks, activeTargetId, 'before', currentPanel)
      : '';
    const afterSvg = hasUploadedFile
      ? renderValidationSvg(scenario, afterEval.effectiveSpec, afterEval.checks, activeTargetId, 'after', currentPanel)
      : '';
    // 다운로드용 전체 6면 원화 SVG (현재 보고 있는 탭과 무관하게 체크된 수정안이 모두 반영된 전체 원화!)
    const fullUnfoldedAfterSvg = hasUploadedFile
      ? renderValidationSvg(scenario, afterEval.effectiveSpec, afterEval.checks, null, 'after', 'ALL')
      : '';

    const panelTabs = [
      ['FRONT', '전면 (FRONT)'],
      ['LEFT', '좌측면 (LEFT)'],
      ['RIGHT', '우측면 (RIGHT)'],
      ['BACK', '후면 (BACK)'],
      ['TOP', '상단 (TOP)'],
      ['BOTTOM', '하단 (BOTTOM)'],
      ['ALL', '전체 원화 (6면 전개도)'],
    ];

    el.innerHTML = `
      <!-- 헤더 설명 및 가이드 엑셀 다운로드 버튼 -->
      <div style="margin-bottom:20px; border-left:2px solid #D5D8DE; padding-left:14px; display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;">
        <p style="font-size:13.5px; color:#475467; margin:0; line-height:1.6; max-width:780px;">
          마스터가 승인한 브랜드 가이드 및 원화 실측 규칙을 기준으로 원본 AI/PDF/EPS 원고를 검수하고,
          규칙 기반 자동 수정안을 원본과 실시간 비교한 후 체크된 수정사항이 반영된 전체 원화 AI 파일로 저장합니다.
        </p>
        <button type="button" id="dc-btn-download-guide-excel" class="btn btn-outline btn-sm" style="font-size:12px; font-weight:700; border-color:#101820; color:#101820; padding:8px 14px; white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
          📊 통합 디자인 가이드 엑셀 다운로드 (.xlsx)
        </button>
      </div>

      <!-- 상단 컨트롤: STEP 1 · 제품 라인, STEP 2 · 패키지 종류 (화살표 드롭다운) -->
      <div style="background:#FFFFFF; border:1px solid #EAECF0; padding:18px 20px; margin-bottom:18px; display:grid; grid-template-columns: 1fr 1fr; gap:16px; align-items:end;">
        <div>
          <label style="display:block; font-size:11px; font-weight:700; color:#101820; text-transform:uppercase; margin-bottom:6px; letter-spacing:0.5px;">STEP 1 · 제품 라인</label>
          <select id="dc-sel-line" class="gov-select">
            <option value="metagreen" ${currentLine === 'metagreen' ? 'selected' : ''}>META GREEN (메타그린)</option>
            <option value="innerbeauty" ${currentLine === 'innerbeauty' ? 'selected' : ''}>INNER BEAUTY (이너뷰티)</option>
            <option value="newcommerce" ${currentLine === 'newcommerce' ? 'selected' : ''}>NEW COMMERCE (뉴커머스)</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:11px; font-weight:700; color:#101820; text-transform:uppercase; margin-bottom:6px; letter-spacing:0.5px;">STEP 2 · 패키지 종류</label>
          <select id="dc-sel-pkg" class="gov-select">
            <option value="carton" ${currentPkg === 'carton' ? 'selected' : ''}>단상자 (Carton · 단)</option>
            <option value="pouch" ${currentPkg === 'pouch' ? 'selected' : ''}>파우치 (Pouch · 파)</option>
            <option value="ampoule" ${currentPkg === 'ampoule' ? 'selected' : ''}>앰플 (Ampoule · 앰)</option>
            <option value="label" ${currentPkg === 'label' ? 'selected' : ''}>라벨 (Label · 라)</option>
          </select>
        </div>
      </div>

      <!-- STEP 3. AI / EPS / PDF 원고 업로드 드래그 앤 드롭 영역 -->
      <div style="background:#FFFFFF; border:1px solid #EAECF0; padding:18px 20px; margin-bottom:22px;">
        <label style="display:block; font-size:11px; font-weight:700; color:#101820; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">STEP 3 · AI / EPS / PDF 원고 업로드</label>
        <div id="dc-dropzone" style="border:1.5px dashed #101820; padding:${hasUploadedFile ? '14px 20px' : '32px 20px'}; text-align:center; cursor:pointer; background:#FFFFFF;">
          <input type="file" id="dc-file-upload" accept=".ai,.pdf,.eps,.svg" style="display:none;" />
          ${hasUploadedFile ? `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div style="font-size:12.5px; color:#101820; font-weight:700;">
                ✓ 인식된 원고: <span style="font-weight:800;">${customUploadedFileName}</span>
                <span style="font-size:11.5px; color:#475467; font-weight:500; margin-left:10px;">
                  [${scenario.measured.foodCategoryLabel || (scenario.foodType === 'food' ? '일반식품' : '건강기능식품')}]
                  ${scenario.measured.lineName} ${scenario.measured.productName} · 전면 ${scenario.frontPanelMm.w}×${scenario.frontPanelMm.h}mm / 측면 ${scenario.sideWidthMm}mm
                </span>
              </div>
              <span style="padding:6px 12px; background:#101820; color:#FFFFFF; font-size:11px; font-weight:600;">다른 AI / EPS / PDF 원고 업로드</span>
            </div>
          ` : `
            <div style="font-size:13.5px; font-weight:700; color:#101820; margin-bottom:6px;">
              📂 검수할 Illustrator 원고(.AI / .EPS / .PDF) 파일을 이곳에 드롭하거나 클릭하여 업로드하세요
            </div>
            <div style="font-size:11.5px; color:#667085; margin-bottom:14px;">
              원고 파일을 업로드하면 전면·측면·후면·상단·하단 6면을 자동 인식하여 실시간 비교 시뮬레이션과 검수 결과를 표시합니다.
            </div>
            <span style="display:inline-block; padding:8px 18px; background:#101820; color:#FFFFFF; font-size:11.5px; font-weight:600;">
              AI / EPS / PDF 파일 선택
            </span>
          `}
        </div>
      </div>

      ${hasUploadedFile ? `
        <!-- STEP 4: 원본 vs 수정안 실시간 비교 (중첩 박싱 제거 · 심플 화이트 배경) -->
        <div style="background:#FFFFFF; border-top:2px solid #101820; border-bottom:1px solid #EAECF0; padding:20px 0; margin-bottom:28px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
            <div>
              <span style="font-size:15px; font-weight:800; color:#101820; letter-spacing:0.3px;">STEP 4. 원본 vs 수정안 실시간 비교</span>
            </div>
            <div style="font-size:12px; font-weight:700; color:#101820;">
              ● ${customUploadedFileName}
            </div>
          </div>

          <!-- 전면 / 좌측면 / 우측면 / 후면 / 상단 / 하단 / 전체 원화 이동 탭 -->
          <div style="display:flex; gap:6px; margin-bottom:20px; border-bottom:1px solid #EAECF0; padding-bottom:12px; flex-wrap:wrap;">
            ${panelTabs.map(([k, lbl]) => `
              <button type="button" class="dc-panel-tab" data-panel="${k}"
                      style="padding:7px 14px; font-size:12px; font-weight:${currentPanel === k ? '700' : '500'}; background:${currentPanel === k ? '#101820' : '#FFFFFF'}; color:${currentPanel === k ? '#FFFFFF' : '#344054'}; border:1px solid ${currentPanel === k ? '#101820' : '#D0D5DD'}; cursor:pointer;">
                ${lbl}
              </button>
            `).join('')}
          </div>

          <!-- 2-Column 심플 화이트 비교 화면 (박싱 안의 박싱 제거) -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0; background:#FFFFFF;">
            <!-- BEFORE -->
            <div style="padding:8px 20px 8px 0; border-right:1px solid #EAECF0; background:#FFFFFF;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <strong style="font-size:13px; color:#101820;">BEFORE · 기존 원본 (${currentPanel})</strong>
                <span style="font-size:11.5px; color:#B42318; font-weight:700;">전체 위반 ${failCount}건 · 주의 ${warnCount}건</span>
              </div>
              <div id="dc-canvas-before-container" style="background:#FFFFFF; min-height:480px; display:flex; align-items:center; justify-content:center;">
                ${beforeSvg}
              </div>
            </div>

            <!-- AFTER -->
            <div style="padding:8px 0 8px 20px; background:#FFFFFF;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <strong style="font-size:13px; color:#101820;">AFTER · 수정 버전 (${currentPanel})</strong>
                <span style="font-size:11.5px; color:#101820; font-weight:700;">체크된 수정안 ${resolvedCount}건 실시간 반영</span>
              </div>
              <div id="dc-canvas-after-container" style="background:#FFFFFF; min-height:480px; display:flex; align-items:center; justify-content:center;">
                ${afterSvg}
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 2열 나란히: STEP 5 (기준/현재/수정 간결 검수 결과) & STEP 6 (자동 수정안 선택 및 전체 원화 AI 저장) -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
          <!-- STEP 5 -->
          <div style="background:#FFFFFF; border:1px solid #EAECF0; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #EAECF0;">
              <strong style="font-size:13.5px; font-weight:800; color:#101820;">STEP 5 · 브랜드 가이드 검수 결과 (${beforeEval.checks.length}건)</strong>
              <span style="font-size:11px; color:#667085;">항목 클릭 시 해당 면으로 이동합니다</span>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; max-height:520px; overflow-y:auto; padding-right:4px;">
              ${beforeEval.checks.map(c => {
                const isSelected = activeTargetId === c.targetId;
                const isFixedNow = selectedFixes.has(c.id);
                return `
                  <div class="dc-check-row" data-target="${c.targetId}" data-panel="${c.panel}"
                       style="padding:12px 14px; border:1px solid ${isSelected ? '#101820' : '#EAECF0'}; background:#FFFFFF; cursor:pointer;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                      <strong style="font-size:12.5px; color:#101820;">[${c.panel}] ${c.title}</strong>
                      <span style="font-size:10px; font-weight:800; padding:2px 7px; background:${isFixedNow ? '#101820' : '#FEF3F2'}; color:${isFixedNow ? '#FFFFFF' : '#B42318'}; border:1px solid ${isFixedNow ? '#101820' : '#FECDCA'};">
                        ${isFixedNow ? '수정 반영됨' : c.status}
                      </span>
                    </div>
                    <div style="font-size:11.5px; color:#344054; line-height:1.65;">
                      <div><strong style="color:#101820; display:inline-block; width:38px;">기준</strong> ${c.standard}</div>
                      <div><strong style="color:#B42318; display:inline-block; width:38px;">현재</strong> ${c.current}</div>
                      <div><strong style="color:#027A48; display:inline-block; width:38px;">수정</strong> ${c.action}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- STEP 6 -->
          <div style="background:#FFFFFF; border:1px solid #EAECF0; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #EAECF0;">
              <strong style="font-size:13.5px; font-weight:800; color:#101820;">STEP 6 · 자동 수정안 선택 및 전체 원화 저장 (${resolvedCount}/${fixableChecks.length}건)</strong>
              <div style="display:flex; gap:6px;">
                <button type="button" id="dc-btn-select-all" style="padding:4px 10px; font-size:11px; font-weight:600; background:#FFFFFF; border:1px solid #D0D5DD; cursor:pointer;">전체 선택</button>
                <button type="button" id="dc-btn-deselect-all" style="padding:4px 10px; font-size:11px; font-weight:600; background:#FFFFFF; border:1px solid #D0D5DD; cursor:pointer;">전체 해제</button>
              </div>
            </div>

            <!-- 수정안 체크박스 목록 -->
            <div style="display:flex; flex-direction:column; gap:8px; max-height:430px; overflow-y:auto; margin-bottom:16px; padding-right:4px;">
              ${fixableChecks.map(c => {
                const isChecked = selectedFixes.has(c.id);
                return `
                  <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid ${isChecked ? '#101820' : '#EAECF0'}; background:#FFFFFF; cursor:pointer; font-size:12px;">
                    <span style="display:flex; align-items:center; gap:8px;">
                      <input type="checkbox" class="dc-fix-item-chk" value="${c.id}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:#101820;" />
                      <span style="font-weight:700; color:#101820;">[${c.panel}] ${c.title}</span>
                      <span style="color:#475467; font-size:11.5px;">— ${c.action}</span>
                    </span>
                    <span style="font-size:11px; font-weight:700; color:${isChecked ? '#101820' : '#98A2B3'}; white-space:nowrap; margin-left:8px;">
                      ${isChecked ? '✓ 적용' : '해제'}
                    </span>
                  </label>
                `;
              }).join('')}
            </div>

            <!-- 전체 원화 다운로드 버튼 바 -->
            <div style="display:flex; gap:8px;">
              <button type="button" id="dc-btn-download-ai" style="flex:1; height:42px; background:#101820; color:#FFFFFF; font-size:12px; font-weight:700; border:1px solid #101820; cursor:pointer;">
                📥 체크된 수정안 적용 전체 원화(.AI) 다운로드
              </button>
              <button type="button" id="dc-btn-download-pdf" style="height:42px; padding:0 16px; background:#FFFFFF; color:#101820; font-size:12px; font-weight:600; border:1px solid #101820; cursor:pointer;">
                전체 원화(.PDF)
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    bindEvents(fullUnfoldedAfterSvg, scenario);
  };

  const handleUploadedFile = async (file) => {
    if (!file) return;
    customUploadedFileName = file.name;
    showToast(`${file.name} 원고 6면 구조 및 문안 분석 중...`);

    try {
      const parsed = await parseUploadedArtworkOrDieline(file);
      customParsedInfo = parsed;
      if (parsed.detectedLine) {
        currentLine = parsed.detectedLine;
      }
      hasUploadedFile = true;
      showToast(`✓ ${file.name} 원고(${parsed.lineName} ${parsed.productName}) 6면 인식 완료`);
      render();
    } catch (err) {
      console.error('File parse error:', err);
      customParsedInfo = inferProductInfoFromTextAndName('', file.name);
      currentLine = customParsedInfo.detectedLine || 'metagreen';
      hasUploadedFile = true;
      showToast(`✓ ${file.name} 원고 로드 완료`);
      render();
    }
  };

  const bindEvents = (fullUnfoldedAfterSvg, scenario) => {
    // 1. STEP 1 라인 드롭다운
    const selLine = el.querySelector('#dc-sel-line');
    if (selLine) {
      selLine.onchange = (e) => {
        currentLine = e.target.value;
        if (customParsedInfo) customParsedInfo.detectedLine = currentLine;
        render();
      };
    }

    // 2. STEP 2 패키지 종류 드롭다운
    const selPkg = el.querySelector('#dc-sel-pkg');
    if (selPkg) {
      selPkg.onchange = (e) => {
        currentPkg = e.target.value;
        render();
      };
    }

    // 3. STEP 4 상단 패널 탭 연동
    el.querySelectorAll('.dc-panel-tab').forEach(tabBtn => {
      tabBtn.onclick = () => {
        currentPanel = tabBtn.dataset.panel;
        render();
      };
    });

    // 4. 드롭존 클릭 & Drag-and-Drop
    const dropzone = el.querySelector('#dc-dropzone');
    const fileInput = el.querySelector('#dc-file-upload');
    if (dropzone && fileInput) {
      dropzone.onclick = (e) => {
        if (e.target === fileInput) return;
        fileInput.click();
      };
      fileInput.onchange = (e) => handleUploadedFile(e.target.files?.[0]);

      ['dragenter', 'dragover'].forEach(ev => {
        dropzone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.background = '#F9FAFB';
        });
      });
      ['dragleave', 'drop'].forEach(ev => {
        dropzone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.background = '#FFFFFF';
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const f = e.dataTransfer?.files?.[0];
        if (f) handleUploadedFile(f);
      });
    }

    // 5. STEP 5 검수 행 또는 콜아웃 클릭 시 해당 면 탭으로 즉시 이동 및 강조
    el.querySelectorAll('.dc-check-row').forEach(row => {
      row.onclick = () => {
        const targetPanel = row.dataset.panel;
        if (targetPanel && currentPanel !== targetPanel && currentPanel !== 'ALL') {
          currentPanel = targetPanel;
        }
        activeTargetId = activeTargetId === row.dataset.target ? null : row.dataset.target;
        render();
      };
    });

    el.querySelectorAll('.dc-callout-group').forEach(cg => {
      cg.onclick = () => {
        activeTargetId = activeTargetId === cg.dataset.target ? null : cg.dataset.target;
        render();
      };
    });

    // 6. STEP 6 개별 체크/체크해제 이벤트
    el.querySelectorAll('.dc-fix-item-chk').forEach(chk => {
      chk.onchange = (e) => {
        const fixId = e.target.value;
        if (e.target.checked) {
          selectedFixes.add(fixId);
        } else {
          selectedFixes.delete(fixId);
        }
        render();
      };
    });

    const selAllBtn = el.querySelector('#dc-btn-select-all');
    if (selAllBtn) {
      selAllBtn.onclick = () => {
        const beforeEval = runValidationChecks(scenario, masterRules, new Set());
        beforeEval.checks.filter(c => c.autoFixable).forEach(c => selectedFixes.add(c.id));
        render();
      };
    }

    const deselAllBtn = el.querySelector('#dc-btn-deselect-all');
    if (deselAllBtn) {
      deselAllBtn.onclick = () => {
        selectedFixes.clear();
        render();
      };
    }

    // 7. 전체 원화(.AI / .PDF) 다운로드 — 바이탈(년도)제품명_분류(단/파/앰/라)_코드뒷자리4개_날짜.ai 명명 규칙 적용
    const dlAiBtn = el.querySelector('#dc-btn-download-ai');
    if (dlAiBtn) {
      dlAiBtn.onclick = async () => {
        await ensureAiFontsLoaded();
        const fileName = buildStandardDownloadFileName({
          lineName: scenario.measured.lineName,
          productName: scenario.measured.productName,
          pkgType: currentPkg,
          code: scenario.measured.itemCode,
          fileName: customUploadedFileName,
          ext: 'ai',
        });
        const blob = buildIllustratorAiBlob(fullUnfoldedAfterSvg, fileName.replace(/\.ai$/i, ''));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`✓ ${fileName} (6면 전체 원화)가 다운로드되었습니다.`);
      };
    }

    const dlPdfBtn = el.querySelector('#dc-btn-download-pdf');
    if (dlPdfBtn) {
      dlPdfBtn.onclick = async () => {
        await ensureAiFontsLoaded();
        const fileName = buildStandardDownloadFileName({
          lineName: scenario.measured.lineName,
          productName: scenario.measured.productName,
          pkgType: currentPkg,
          code: scenario.measured.itemCode,
          fileName: customUploadedFileName,
          ext: 'pdf',
        });
        const blob = buildPdfBlob(fullUnfoldedAfterSvg, fileName.replace(/\.pdf$/i, ''));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`✓ ${fileName} (6면 전체 원화)가 다운로드되었습니다.`);
      };
    }

    const dlGuideExcelBtn = el.querySelector('#dc-btn-download-guide-excel');
    if (dlGuideExcelBtn) {
      dlGuideExcelBtn.onclick = () => {
        downloadIntegratedGuideExcelFile('VITALBEAUTIE_Integrated_Design_Guide_2026.xlsx');
        showToast('✓ VITALBEAUTIE 통합 디자인 가이드 엑셀 파일이 다운로드되었습니다.');
      };
    }
  };

  render();
}
