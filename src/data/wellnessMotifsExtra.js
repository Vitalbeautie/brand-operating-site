/* ═══════════════════════════════════════════════════════════════════════════
   Global Standard Health Functional Food & General Food Motif Presets
   - 8,281개 글로벌 온라인 아이콘(Lucide + Tabler) 정밀 벡터 및 도메인 맞춤형 오브제 결합
   - 단순 점선 동그라미(stroke-dasharray) 및 십자 반짝이(+) 완전 배제
   - Lv.1(미니멀 컨투어) → Lv.2(해부학/식물학 내부 디테일) → Lv.3(단면·과즙·순환·방패 복합 레이어)
     → Lv.4(월계수 크레스트·분자 육각링·생체 순환 아크·클리니컬 쉴드 마스터 엠블럼)
   ═══════════════════════════════════════════════════════════════════════════ */
import { BG, LIB_SVGS, CORNER_BADGES, withCornerBadge, withCrestAndBadge } from './iconCraftComposers.js';

function craftMotif(id, title, enTitle, lv1Desc, lv1Svg, lv2Desc, lv2Svg, lv3Desc, lv3Svg, lv4Desc, lv4Svg) {
  return {
    id,
    title,
    enTitle,
    levels: [
      { level: 1, label: '1단계 심플', desc: lv1Desc, customSvg: lv1Svg },
      { level: 2, label: '2단계 베이직', desc: lv2Desc, customSvg: lv2Svg },
      { level: 3, label: '3단계 스탠다드', desc: lv3Desc, customSvg: lv3Svg },
      { level: 4, label: '4단계 컴플렉스', desc: lv4Desc, customSvg: lv4Svg },
    ],
  };
}

export const EXTRA_WELLNESS_MOTIF_PRESETS = [
  // ── 1. 신체기관 (Human Organs) ──
  {
    keys: ['위', '위건강', '위점막', '소화', '속쓰림', '매스틱검', '스페인감초', '헬리코박터', 'stomach', 'digestion'],
    enCopy: 'stomach care',
    motifs: [
      craftMotif(
        'stomach_organ', '인체 위 기관 · 점막 보호 (Stomach & Mucosa)', 'Stomach Mucosa Care',
        '위(Stomach) 해부학 미니멀 실루엣',
        `<path d="M9.5 3.5v2.8c-3.5.8-5.5 3.8-5.5 7.2 0 3.8 2.8 6.5 6.8 6.5 4.5 0 7.7-3.2 7.7-7.8 0-3.2-2-5.5-4.8-6V3.5" fill="${BG}"/>`,
        '위 실루엣 + 내부 위점막 주름 및 소화액 레벨 디테일',
        `<path d="M9.5 3.5v2.8c-3.5.8-5.5 3.8-5.5 7.2 0 3.8 2.8 6.5 6.8 6.5 4.5 0 7.7-3.2 7.7-7.8 0-3.2-2-5.5-4.8-6V3.5" fill="${BG}"/><path d="M6.8 14.2c2 1.6 4.2-1.2 6.2.4 1.2.9 2.4.4 3.2-.4"/><path d="M8.5 10.2c1.2-.8 2.8-.8 4 0"/>`,
        '위 점막 구조 + 전면 소화 연동 순환 화살표 배지 (속공간 비움)',
        withCornerBadge(`<path d="M9.5 3.5v2.8c-3.5.8-5.5 3.8-5.5 7.2 0 3.8 2.8 6.5 6.8 6.5 4.5 0 7.7-3.2 7.7-7.8 0-3.2-2-5.5-4.8-6V3.5" fill="${BG}"/><path d="M6.8 14.2c2 1.6 4.2-1.2 6.2.4"/>`, 'cycle'),
        '클리니컬 방어 쉴드 크레스트 + 위 점막 보호 코어 + 매스틱 에센스 드롭',
        withCrestAndBadge(`<path d="M9.5 3.5v2.8c-3.5.8-5.5 3.8-5.5 7.2 0 3.8 2.8 6.5 6.8 6.5 4.5 0 7.7-3.2 7.7-7.8 0-3.2-2-5.5-4.8-6V3.5" fill="${BG}"/><path d="M7.5 13.8c1.8 1.4 4.5 1.4 6.5 0"/>`, 'shield_crest', 'drop')
      ),
    ],
  },
  {
    keys: ['폐', '기관지', '호흡기', '목건강', '도라지', '배도라지', '프로폴리스', '코건강', '비염', 'lung', 'breath', 'throat'],
    enCopy: 'respiratory care',
    motifs: [
      craftMotif(
        'lungs_organ', '폐 · 기관지 호흡기 (Lungs & Bronchi)', 'Respiratory Care',
        '좌우 대칭 폐엽 미니멀 실루엣',
        `<path d="M12 3v7M9.5 6C6 6 4 9.5 4 14.5c0 3 1.8 4.8 4.2 4.8 1.5 0 2.3-1 2.3-2.8V8.5C10.5 7 10 6 9.5 6ZM14.5 6C18 6 20 9.5 20 14.5c0 3-1.8 4.8-4.2 4.8-1.5 0-2.3-1-2.3-2.8V8.5c0-1.5.5-2.5 1-2.5Z" fill="${BG}"/>`,
        '스튜디오 해부학 폐엽 & 기관지 분기 트리 구조',
        LIB_SVGS.lungs_T,
        '해부학 폐·기관지 + 전면 호흡기 방어 쉴드 배지 (속공간 비움)',
        withCornerBadge(LIB_SVGS.lungs_T, 'shield'),
        '청정 산소 순환 듀얼 아크 + 폐·기관지 코어 + 보태니컬 허브 배지',
        withCrestAndBadge(LIB_SVGS.lungs_T, 'orbit_flow', 'leaf')
      ),
    ],
  },
  {
    keys: ['신장', '콩팥', '방광', '요로', '전립선', '쏘팔메토', '옥타코사놀', '크랜베리요로', '배뇨', 'kidney', 'urinary', 'prostate'],
    enCopy: 'kidney & urinary',
    motifs: [
      craftMotif(
        'kidneys_organ', '신장 · 요로 케어 (Kidney & Urinary)', 'Kidney & Urinary Care',
        '좌우 대칭 신장(콩팥) 외곽 실루엣',
        `<path d="M8.5 5.5C5.2 5.5 3.8 8.2 3.8 12s1.4 6.5 4.7 6.5c1.8 0 2.5-1.2 2-3-.4-1.2-.4-4.8 0-6 .5-1.8-.2-3-2-3ZM15.5 5.5c3.3 0 4.7 2.7 4.7 6.5s-1.4 6.5-4.7 6.5c-1.8 0-2.5-1.2-2-3 .4-1.2.4-4.8 0-6-.5-1.8.2-3 2-3Z" fill="${BG}"/>`,
        '신장 좌우 신우(Renal Pelvis) 및 요관 해부학 연결 구조',
        `<path d="M8.5 5.5C5.2 5.5 3.8 8.2 3.8 12s1.4 6.5 4.7 6.5c1.8 0 2.5-1.2 2-3-.4-1.2-.4-4.8 0-6 .5-1.8-.2-3-2-3ZM15.5 5.5c3.3 0 4.7 2.7 4.7 6.5s-1.4 6.5-4.7 6.5c-1.8 0-2.5-1.2-2-3 .4-1.2.4-4.8 0-6-.5-1.8.2-3 2-3Z" fill="${BG}"/><path d="M10.2 11.5H12v7.5M13.8 11.5H12M6.8 9.2c-1 1.5-1 4.1 0 5.6M17.2 9.2c1 1.5 1 4.1 0 5.6"/>`,
        '신장·요관 구조 + 전면 워터 밸런스 정화 드롭 배지 (속공간 비움)',
        withCornerBadge(`<path d="M8.5 5.5C5.2 5.5 3.8 8.2 3.8 12s1.4 6.5 4.7 6.5c1.8 0 2.5-1.2 2-3-.4-1.2-.4-4.8 0-6 .5-1.8-.2-3-2-3ZM15.5 5.5c3.3 0 4.7 2.7 4.7 6.5s-1.4 6.5-4.7 6.5c-1.8 0-2.5-1.2-2-3 .4-1.2.4-4.8 0-6-.5-1.8.2-3 2-3Z" fill="${BG}"/><path d="M10.2 11.5H12v7.5M13.8 11.5H12"/>`, 'drop'),
        '생체 여과 순환 아크 + 신장 코어 + 요로 방어 쉴드 배지',
        withCrestAndBadge(`<path d="M8.5 5.5C5.2 5.5 3.8 8.2 3.8 12s1.4 6.5 4.7 6.5c1.8 0 2.5-1.2 2-3-.4-1.2-.4-4.8 0-6 .5-1.8-.2-3-2-3ZM15.5 5.5c3.3 0 4.7 2.7 4.7 6.5s-1.4 6.5-4.7 6.5c-1.8 0-2.5-1.2-2-3 .4-1.2.4-4.8 0-6-.5-1.8.2-3 2-3Z" fill="${BG}"/><path d="M10.2 11.5H12v7.5M13.8 11.5H12"/>`, 'orbit_flow', 'shield')
      ),
    ],
  },
  {
    keys: ['치아', '잇몸', '구강', '치주', '구취', '리소짐', '자일리톨', 'tooth', 'dental', 'oral'],
    enCopy: 'dental & gum care',
    motifs: [
      craftMotif(
        'tooth_organ', '치아 · 에나멜 치주 케어 (Dental & Gum)', 'Dental Enamel Care',
        '치아 크라운 및 치근 미니멀 실루엣',
        `<path d="M7.5 4.5c-2.2 0-3.5 1.8-3.5 4.5 0 2.8 1.2 5.2 2 8.5.4 1.5 1.2 2.5 2.2 2.5.9 0 1.4-1.2 1.8-3.2.4-1.8 1.2-1.8 2-1.8s1.6 0 2 1.8c.4 2 .9 3.2 1.8 3.2 1 0 1.8-1 2.2-2.5.8-3.3 2-5.7 2-8.5 0-2.7-1.3-4.5-3.5-4.5-1.6 0-2.8.8-4.5.8s-2.9-.8-4.5-.8Z" fill="${BG}"/>`,
        '스튜디오 덴탈 크라운 & 에나멜 입체 교합 라인',
        LIB_SVGS.dental_T,
        '덴탈 에나멜 코어 + 전면 치주 방어 쉴드 배지 (속공간 비움)',
        withCornerBadge(LIB_SVGS.dental_T, 'shield'),
        '클리니컬 쉴드 아머 프레임 + 덴탈 크라운 코어 (치아·잇몸 이중 보호)',
        withCrestAndBadge(LIB_SVGS.dental_T, 'shield_crest', null, 0.66)
      ),
    ],
  },
  {
    keys: ['귀', '청력', '이명', '달팽이관', 'ear', 'hearing'],
    enCopy: 'hearing care',
    motifs: [
      craftMotif(
        'ear_organ', '귀 · 달팽이관 청력 케어 (Auditory Care)', 'Auditory Care',
        '귀 바퀴(Auricle) 미니멀 윤곽선',
        LIB_SVGS.ear_T,
        '귀 해부학 이륜 & 내부 외이도·달팽이관 곡선 디테일',
        LIB_SVGS.ear_L,
        '귀 달팽이관 구조 + 음파 공명 파동 아크 결합',
        `<g transform="translate(2.5 1.2) scale(0.86)">${LIB_SVGS.ear_L}</g><path d="M3.2 8.5a7.5 7.5 0 0 0 0 7M1.2 6.5a10.5 10.5 0 0 0 0 11"/>`,
        '정밀 청각 타겟팅 스캔 프레임 + 달팽이관 청력 코어',
        LIB_SVGS.ear_scan
      ),
    ],
  },
  {
    keys: ['여성', '갱년기', '자궁', '난소', '질유산균', '질건강', '철분', '엽산', '임산부', '회화나무', '이소플라본', '보라지유', '감마리놀렌산', 'women', 'menopause', 'folate', 'iron'],
    enCopy: 'women balance',
    motifs: [
      craftMotif(
        'uterus_organ', '여성 · 호르몬 밸런스 케어 (Women Balance)', 'Women Vitality Care',
        '여성 생체 밸런스 코어 실루엣',
        `<path d="M12 6.5c-2.8 0-4.5 2.2-3.5 6.2.7 2.8 2 5.8 3.5 5.8s2.8-3 3.5-5.8c1-4-.7-6.2-3.5-6.2Z" fill="${BG}"/><path d="M8.5 8C5.5 7 3.8 8.2 3.8 10.2c0 1.5 1.2 2.4 2.5 2M15.5 8c3-1 4.7.2 4.7 2.2 0 1.5-1.2 2.4-2.5 2"/>`,
        '여성 보태니컬 블로섬 & 잎사귀 밸런스 구조',
        LIB_SVGS.flower2_L,
        '손으로 감싸 안은 하트 케어 (Hand & Heart Care 스튜디오 벡터)',
        LIB_SVGS.hand_heart,
        '보태니컬 월계수 크레스트 + 여성 생체 밸런스 코어 + 보호 쉴드 배지',
        withCrestAndBadge(`<path d="M12 6.5c-2.8 0-4.5 2.2-3.5 6.2.7 2.8 2 5.8 3.5 5.8s2.8-3 3.5-5.8c1-4-.7-6.2-3.5-6.2Z" fill="${BG}"/><path d="M8.5 8C5.5 7 3.8 8.2 3.8 10.2c0 1.5 1.2 2.4 2.5 2M15.5 8c3-1 4.7.2 4.7 2.2 0 1.5-1.2 2.4-2.5 2"/>`, 'laurel', 'shield')
      ),
    ],
  },
  {
    keys: ['갑상선', '호르몬', '셀레늄', '요오드', '면역세포', 'nk세포', '아연', '글루타치온', '백옥', '항산화세포', 'thyroid', 'selenium', 'zinc', 'glutathione'],
    enCopy: 'cellular shield',
    motifs: [
      craftMotif(
        'thyroid_organ', '갑상선 · 면역세포 코어 (Thyroid & Cell Shield)', 'Cellular Defense',
        '갑상선 나비형 생체 호르몬 기관 실루엣',
        `<path d="M12 8.5c-1.5-2.8-4.5-3.5-6.2-1.8-1.8 1.8-1.5 6.2.5 8.8 1.6 2 4.2 1.5 5.7-1.2 1.5 2.7 4.1 3.2 5.7 1.2 2-2.6 2.3-7 .5-8.8-1.7-1.7-4.7-1-6.2 1.8Z" fill="${BG}"/>`,
        '항산화 원자 코어 및 이중 전자 궤도 (Atom Cellular Orbit)',
        LIB_SVGS.atom_L,
        '갑상선·세포 코어 + 전면 바이오 육각 분자 배지 (속공간 비움)',
        withCornerBadge(`<path d="M12 8.5c-1.5-2.8-4.5-3.5-6.2-1.8-1.8 1.8-1.5 6.2.5 8.8 1.6 2 4.2 1.5 5.7-1.2 1.5 2.7 4.1 3.2 5.7 1.2 2-2.6 2.3-7 .5-8.8-1.7-1.7-4.7-1-6.2 1.8Z" fill="${BG}"/><path d="M12 4.5v13"/>`, 'hexagon'),
        '바이오 육각 분자 링 프레임 + 항산화 원자 코어 + 방어 쉴드 배지',
        withCrestAndBadge(LIB_SVGS.atom_L, 'bio_hex', 'shield')
      ),
    ],
  },
  {
    keys: ['세포', '유전자', 'dna', 'rna', '텔로미어', '안티에이징', '노화', '장수', 'nmn', '예노벨라', 'cell', 'longevity'],
    enCopy: 'dna cellular care',
    motifs: [
      craftMotif(
        'dna_helix', 'DNA 이중나선 · 세포 코어 (DNA Double Helix)', 'DNA Cellular Care',
        '미니멀 DNA 나선 교차 루프',
        LIB_SVGS.dna_T,
        '염기서열 브릿지가 결합된 수직 DNA 이중나선',
        LIB_SVGS.dna2_T,
        '정밀 대각선 유전자 이중나선 사슬 (Studio DNA Helix)',
        LIB_SVGS.dna_L,
        '바이오 육각 분자 프레임 + 정밀 DNA 이중나선 코어',
        withCrestAndBadge(LIB_SVGS.dna2_T, 'bio_hex', null, 0.66)
      ),
    ],
  },

  // ── 2. 다이어트 · 운동 · 단백질 (Diet, Fitness & Protein) ──
  {
    keys: ['단백질', '프로틴', '근육', '근력', '운동', '헬스', '아령', '덤벨', '아르기닌', '크레아틴', 'bcaa', '류신', '아미노산', '스포츠', 'protein', 'muscle', 'fitness'],
    enCopy: 'active protein',
    motifs: [
      craftMotif(
        'dumbbell', '액티브 프로틴 웨이트 (Active Protein Weight)', 'Muscle Protein Power',
        '코어 스트렝스 케틀벨 실루엣 (Studio Kettlebell)',
        LIB_SVGS.kettlebell_T,
        '45도 다이나믹 덤벨 웨이트 (Studio Dumbbell)',
        LIB_SVGS.dumbbell_L,
        '이중 원판 바벨 스트렝스 기어 (Studio Barbell)',
        LIB_SVGS.barbell_T,
        '생체 대사 순환 아크 + 다이나믹 덤벨 + 칼로리 버닝 플레임 배지',
        withCrestAndBadge(LIB_SVGS.dumbbell_L, 'orbit_flow', 'flame')
      ),
    ],
  },

  // ── 3. 과일류 (Fruits Global Standard) ──
  {
    keys: ['사과', '풋사과', '애사비', '사과초모식초', '애플', '폴리페놀', 'apple', 'cider'],
    enCopy: 'apple polyphenol',
    motifs: [
      craftMotif(
        'apple_fruit', '풋사과 · 애플 폴리페놀 (Fresh Apple)', 'Apple Polyphenol',
        '미니멀 사과 외곽 컨투어 (Lucide Apple)',
        LIB_SVGS.apple_L,
        '입체 볼륨 곡선과 줄기가 살아있는 정밀 사과 (Tabler Apple)',
        LIB_SVGS.apple_T,
        '후면 통사과 + 전면 반쪽 사과 단면(씨앗 2개 & 속공간 비움) 레이어링',
        `<g transform="translate(-1.5 -1) scale(0.88)">${LIB_SVGS.apple_L}</g><path d="M11.5 11.5c0-2.5 2-4.2 4.5-4.2s4.5 1.7 4.5 4.2c0 3.5-2.2 6.8-4.5 6.8s-4.5-3.3-4.5-6.8Z" fill="${BG}"/><circle cx="15" cy="12" r="0.65" fill="currentColor"/><circle cx="17" cy="12" r="0.65" fill="currentColor"/>`,
        '보태니컬 월계수 크레스트 + 정밀 사과 코어 + 애사비 에센스 드롭 배지',
        withCrestAndBadge(LIB_SVGS.apple_T, 'laurel', 'drop')
      ),
    ],
  },
  {
    keys: ['포도', '청포도', '샤인머스캣', '적포도', '머스캣', '포도씨', '레스베라트롤', 'grape', 'muscat'],
    enCopy: 'shine muscat grape',
    motifs: [
      craftMotif(
        'grape_cluster', '청포도 · 샤인머스캣 송이 (Grape Cluster)', 'Muscat Grape Cluster',
        '6알 포도송이 & 줄기 미니멀 클러스터',
        `<path d="M12 2.5v3M9.5 4c1.5-.8 3.5-.8 5 0"/><circle cx="9.2" cy="8.5" r="2.5" fill="${BG}"/><circle cx="14.8" cy="8.5" r="2.5" fill="${BG}"/><circle cx="12" cy="8.5" r="2.6" fill="${BG}"/><circle cx="10.4" cy="13" r="2.5" fill="${BG}"/><circle cx="13.6" cy="13" r="2.5" fill="${BG}"/><circle cx="12" cy="17.5" r="2.5" fill="${BG}"/>`,
        '덩굴 줄기와 8알 포도알이 입체 중첩된 스튜디오 포도송이 (Lucide Grape)',
        LIB_SVGS.grape_L,
        '보태니컬 포도 잎사귀가 상단을 감싸는 포도송이 (Tabler Grape)',
        LIB_SVGS.grape_T,
        '보태니컬 포도송이 + 전면 과육 에센스 드롭 배지 & 월계수 크레스트',
        withCrestAndBadge(LIB_SVGS.grape_T, 'laurel', 'drop')
      ),
    ],
  },
  {
    keys: ['레몬', '라임', '유자', '시트러스', '구연산', '레몬밤', 'lemon', 'lime', 'yuzu', 'citrus'],
    enCopy: 'fresh citrus lemon',
    motifs: [
      craftMotif(
        'lemon_fruit', '시트러스 레몬 · 유자 (Fresh Lemon)', 'Citrus Lemon Vita',
        '통레몬 미니멀 외곽 실루엣 (Tabler Whole Lemon)',
        LIB_SVGS.lemon_whole,
        '시트러스 과육 웨지 슬라이스 (Lucide Citrus Wedge)',
        LIB_SVGS.citrus_wedge,
        '과육 세그먼트가 정교하게 분할된 레몬 하프 단면 (Tabler Lemon Slice)',
        LIB_SVGS.lemon_slice,
        '후면 통레몬 + 전면 과육 세그먼트 슬라이스(속공간 비움) + 비타민 과즙 드롭',
        `<g transform="translate(-1.5 -1.5) scale(0.85)">${LIB_SVGS.lemon_whole}</g>${CORNER_BADGES.slice}`
      ),
    ],
  },
  {
    keys: ['오렌지', '자몽', '감귤', '한라봉', '천혜향', '귤', '블러드오렌지', '모로실', '모로오렌지', 'orange', 'grapefruit', 'mandarin'],
    enCopy: 'citrus moro orange',
    motifs: [
      craftMotif(
        'orange_slice', '모로 오렌지 · 자몽 단면 (Citrus Slice)', 'Moro Orange Slice',
        '오렌지 열매 & 상단 잎사귀 미니멀 실루엣',
        `<circle cx="12" cy="13" r="7.5" fill="${BG}"/><path d="M12 5.5c0-2 1.5-3.2 3.5-3.2 0 2-1.5 3.2-3.5 3.2Z" fill="${BG}"/>`,
        '시트러스 웨지 단면 & 방사형 과육 결 (Lucide Citrus)',
        LIB_SVGS.citrus_wedge,
        '8조각 오렌지 과육 세그먼트 전체 단면도',
        `<circle cx="12" cy="12" r="8.5" fill="${BG}"/><circle cx="12" cy="12" r="1.4" fill="${BG}"/><path d="M12 3.5v7.1M12 13.4v7.1M3.5 12h7.1M13.4 12h7.1M6 6l5 5M13 13l5 5M18 6l-5 5M11 13l-5 5"/>`,
        '후면 통오렌지 + 전면 8조각 과육 단면 + 모로실 농축 과즙 드롭 배지',
        withCornerBadge(`<circle cx="12" cy="12" r="8.5" fill="${BG}"/><circle cx="12" cy="12" r="1.4" fill="${BG}"/><path d="M12 3.5v7.1M12 13.4v7.1M3.5 12h7.1M13.4 12h7.1M6 6l5 5M13 13l5 5M18 6l-5 5M11 13l-5 5"/>`, 'drop')
      ),
    ],
  },
  {
    keys: ['복숭아', '피치', '납작복숭아', '자두', '푸룬', '건자두', '살구', '매실', 'peach', 'plum', 'prune', 'apricot'],
    enCopy: 'sweet peach & prune',
    motifs: [
      craftMotif(
        'peach_fruit', '스위트 피치 · 푸룬 (Peach & Prune)', 'Sweet Peach & Prune',
        '복숭아 하트형 곡선 미니멀 실루엣',
        `<path d="M12 6.8C9 5 5 7 5 12c0 4.5 3.8 7.8 7 8.5 3.2-.7 7-4 7-8.5 0-5-4-7-7-5.2Z" fill="${BG}"/>`,
        '복숭아 입체 골곡 라인 & 상단 보태니컬 잎사귀',
        `<path d="M12 6.8C9 5 5 7 5 12c0 4.5 3.8 7.8 7 8.5 3.2-.7 7-4 7-8.5 0-5-4-7-7-5.2Z" fill="${BG}"/><path d="M12 6.8c0 3.2-1.8 6.2-3 8.2"/><path d="M12 3c2-.5 3.8.6 3.5 2.6-1.8.4-3.5-.6-3.5-2.6Z" fill="${BG}"/>`,
        '복숭아·푸룬 원물 + 전면 과즙 에센스 드롭 배지 (속공간 비움)',
        withCornerBadge(`<path d="M12 6.8C9 5 5 7 5 12c0 4.5 3.8 7.8 7 8.5 3.2-.7 7-4 7-8.5 0-5-4-7-7-5.2Z" fill="${BG}"/><path d="M12 6.8c0 3.2-1.8 6.2-3 8.2"/><path d="M12 3c2-.5 3.8.6 3.5 2.6-1.8.4-3.5-.6-3.5-2.6Z" fill="${BG}"/>`, 'drop'),
        '보태니컬 월계수 크레스트 + 복숭아·푸룬 코어 + 식이섬유 리프 배지',
        withCrestAndBadge(`<path d="M12 6.8C9 5 5 7 5 12c0 4.5 3.8 7.8 7 8.5 3.2-.7 7-4 7-8.5 0-5-4-7-7-5.2Z" fill="${BG}"/><path d="M12 6.8c0 3.2-1.8 6.2-3 8.2"/>`, 'laurel', 'leaf')
      ),
    ],
  },
  {
    keys: ['딸기', '블루베리', '아사이베리', '엘더베리', '크랜베리', '라즈베리', '빌베리', '아로니아', '오미자', '세븐베리', '베리', 'berry', 'blueberry', 'strawberry', 'cranberry'],
    enCopy: 'antioxidant berry',
    motifs: [
      craftMotif(
        'berry_fruit', '항산화 베리 · 딸기 (Antioxidant Berry)', 'Antioxidant Berry',
        '딸기·베리 열매 & 꽃받침 미니멀 실루엣',
        `<path d="M12 6.5c-4 0-6.2 2.8-5.5 6.8.6 3.5 3.2 6.8 5.5 6.8s4.9-3.3 5.5-6.8c.7-4-1.5-6.8-5.5-6.8Z" fill="${BG}"/><path d="M8.5 5.2 12 6.8l3.5-1.6M12 3.2v3.6"/>`,
        '트윈 체리·베리 열매와 보태니컬 잎사귀 (Lucide Twin Berry)',
        LIB_SVGS.cherry_L,
        '입체 더블 베리 & 상단 아치형 잎사귀 (Tabler Berry Cluster)',
        LIB_SVGS.cherry_T,
        '보태니컬 월계수 크레스트 + 더블 베리 클러스터 + 안토시아닌 에센스 드롭',
        withCrestAndBadge(LIB_SVGS.cherry_L, 'laurel', 'drop')
      ),
    ],
  },
  {
    keys: ['석류', '체리', '타트체리', '몽모랑시', '엘라그산', 'pomegranate', 'cherry', 'tart cherry'],
    enCopy: 'ruby pomegranate & cherry',
    motifs: [
      craftMotif(
        'pomegranate_fruit', '루비 석류 · 타트체리 (Pomegranate & Cherry)', 'Ruby Pomegranate',
        '왕관 석류 열매 미니멀 외곽 실루엣',
        `<circle cx="12" cy="13" r="6.8" fill="${BG}"/><path d="M9.2 6.5 10 3.8l2 1.6 2-1.6.8 2.7"/>`,
        '타트체리 트윈 열매 & 보태니컬 리프 (Studio Tart Cherry)',
        LIB_SVGS.cherry_L,
        '왕관 석류 단면 + 내부 루비 씨앗(Arils) 클러스터 + 에센스 드롭 배지',
        withCornerBadge(`<circle cx="12" cy="13" r="6.8" fill="${BG}"/><path d="M9.2 6.5 10 3.8l2 1.6 2-1.6.8 2.7"/><circle cx="10" cy="11.8" r="1.2" fill="${BG}"/><circle cx="14" cy="11.8" r="1.2" fill="${BG}"/><circle cx="12" cy="15" r="1.2" fill="${BG}"/>`, 'drop'),
        '보태니컬 월계수 크레스트 + 루비 석류 과육 단면 + 엘라그산 분자 코어',
        withCrestAndBadge(`<circle cx="12" cy="13" r="6.8" fill="${BG}"/><path d="M9.2 6.5 10 3.8l2 1.6 2-1.6.8 2.7"/><circle cx="10" cy="11.8" r="1.2" fill="${BG}"/><circle cx="14" cy="11.8" r="1.2" fill="${BG}"/><circle cx="12" cy="15" r="1.2" fill="${BG}"/>`, 'laurel', 'hexagon')
      ),
    ],
  },
  {
    keys: ['파인애플', '브로멜라인', '바나나', '망고', '패션후르츠', '열대과일', '구아바', '파파야', 'pineapple', 'banana', 'mango'],
    enCopy: 'tropical enzyme',
    motifs: [
      craftMotif(
        'pineapple_fruit', '트로피컬 파인애플 · 망고 · 바나나 (Tropical Fruit)', 'Bromelain Pineapple',
        '트로피컬 망고 & 잎줄기 실루엣 (Lucide Mango)',
        LIB_SVGS.mango_L,
        '트로피컬 바나나 송이 실루엣 (Lucide Banana)',
        LIB_SVGS.banana_L,
        '파인애플 크라운 잎사귀 & 다이아몬드 과피 격자 세공',
        `<ellipse cx="12" cy="14.2" rx="5.4" ry="6.2" fill="${BG}"/><path d="M9.2 8.2 7.2 4l3.2 2.4L12 2.8l1.6 3.6L16.8 4l-2 4.2"/><path d="M8.2 11.2 15.8 17.2M8.2 14.5l5.5 4.2M10.2 9.2l5.5 4.2M15.8 11.2 8.2 17.2M15.8 14.5l-5.5 4.2M13.8 9.2l-5.5 4.2"/>`,
        '보태니컬 월계수 크레스트 + 파인애플 다이아몬드 세공 + 브로멜라인 효소 배지',
        withCrestAndBadge(`<ellipse cx="12" cy="14.2" rx="5.4" ry="6.2" fill="${BG}"/><path d="M9.2 8.2 7.2 4l3.2 2.4L12 2.8l1.6 3.6L16.8 4l-2 4.2"/><path d="M8.2 11.2 15.8 17.2M15.8 11.2 8.2 17.2"/>`, 'laurel', 'cycle')
      ),
    ],
  },
  {
    keys: ['수박', '멜론', '참외', '시트룰린', 'watermelon', 'melon'],
    enCopy: 'cool watermelon',
    motifs: [
      craftMotif(
        'watermelon_slice', '수박 · 멜론 슬라이스 (Watermelon & Melon)', 'Citrulline Melon',
        '반달 수박 웨지 미니멀 실루엣',
        `<path d="M3.5 9.5h17A8.5 8.5 0 0 1 3.5 9.5Z" fill="${BG}"/>`,
        '수박 이중 과피 라인 & 씨앗 디테일',
        `<path d="M3 9h18A9 9 0 0 1 3 9Z" fill="${BG}"/><path d="M5.5 9a6.5 6.5 0 0 0 13 0"/><circle cx="9.5" cy="11.8" r="0.65" fill="currentColor"/><circle cx="14.5" cy="11.8" r="0.65" fill="currentColor"/><circle cx="12" cy="13.8" r="0.65" fill="currentColor"/>`,
        '후면 통수박 스트라이프 + 전면 삼각 수박 웨지 슬라이스(속공간 비움)',
        `<circle cx="10.5" cy="11.5" r="7" fill="${BG}"/><path d="M7.5 5.2c-1.5 3.5-1.5 9 0 12.6M13.5 5.2c1.5 3.5 1.5 9 0 12.6"/><path d="M10 14h11a5.5 5.5 0 0 1-11 0Z" fill="${BG}"/><circle cx="14" cy="16" r="0.55" fill="currentColor"/><circle cx="17" cy="16" r="0.55" fill="currentColor"/>`,
        '보태니컬 월계수 크레스트 + 수박 슬라이스 + 수분 전해질 드롭 배지',
        withCrestAndBadge(`<path d="M3 9h18A9 9 0 0 1 3 9Z" fill="${BG}"/><path d="M5.5 9a6.5 6.5 0 0 0 13 0"/><circle cx="9.5" cy="11.8" r="0.65" fill="currentColor"/><circle cx="14.5" cy="11.8" r="0.65" fill="currentColor"/><circle cx="12" cy="13.8" r="0.65" fill="currentColor"/>`, 'laurel', 'drop')
      ),
    ],
  },
  {
    keys: ['아보카도', '키위', '골드키위', '그린키위', '코코넛', '올리브', '액티니딘', 'avocado', 'kiwi', 'olive'],
    enCopy: 'superfood avocado & kiwi',
    motifs: [
      craftMotif(
        'avocado_fruit', '아보카도 · 키위 슈퍼푸드 (Avocado & Kiwi)', 'Superfood Avocado',
        '아보카도 반쪽 단면 및 씨앗 코어 (Lucide Avocado)',
        LIB_SVGS.avocado_L,
        '아보카도 이중 과육 라인 & 입체 씨앗 코어',
        `<path d="M12 3c-3.5 0-6.8 5.6-6.8 10.8a6.8 6.8 0 0 0 13.6 0C18.8 8.6 15.5 3 12 3Z" fill="${BG}"/><path d="M12 5.2c-2.4 0-4.6 4.2-4.6 8.6a4.6 4.6 0 0 0 9.2 0c0-4.4-2.2-8.6-4.6-8.6Z"/><circle cx="12" cy="14.2" r="2.4" fill="${BG}"/>`,
        '아보카도 단면 + 전면 식물성 오메가 오일 드롭 배지 (속공간 비움)',
        withCornerBadge(LIB_SVGS.avocado_L, 'drop'),
        '보태니컬 월계수 크레스트 + 아보카도 코어 + 슈퍼푸드 리프 배지',
        withCrestAndBadge(LIB_SVGS.avocado_L, 'laurel', 'leaf')
      ),
    ],
  },

  // ── 4. 채소류 · 구근 · 버섯 · 곡물 (Vegetables, Roots, Mushrooms & Grains) ──
  {
    keys: ['토마토', '라이코펜', '방울토마토', '화이트토마토', 'tomato', 'lycopene'],
    enCopy: 'tomato lycopene',
    motifs: [
      craftMotif(
        'tomato_veg', '토마토 · 라이코펜 (Tomato Lycopene)', 'Lycopene Tomato',
        '토마토 열매 및 별 모양 꼭지 실루엣',
        `<ellipse cx="12" cy="13.2" rx="7.5" ry="6.5" fill="${BG}"/><path d="M8 6.8 12 8.5l4-1.7M12 4.2v4.3"/>`,
        '토마토 열매 + 왕관형 5엽 꽃받침 & 입체 하이라이트 곡선',
        `<ellipse cx="12" cy="13.5" rx="7.8" ry="6.3" fill="${BG}"/><path d="M7.5 6.5 10.5 8l1.5-3 1.5 3 3-1.5M9.5 9.5 12 8l2.5 1.5"/><path d="M7.2 12a4.2 4.2 0 0 0 2.2 4.2"/>`,
        '후면 통토마토 + 전면 토마토 과육 단면 슬라이스(속공간 비움)',
        `<g transform="translate(-1.5 -1) scale(0.86)"><ellipse cx="12" cy="13.2" rx="7.5" ry="6.5" fill="${BG}"/><path d="M8 6.8 12 8.5l4-1.7M12 4.2v4.3"/></g>${CORNER_BADGES.slice}`,
        '보태니컬 월계수 크레스트 + 토마토 코어 + 항산화 라이코펜 분자 배지',
        withCrestAndBadge(`<ellipse cx="12" cy="13.5" rx="7.8" ry="6.3" fill="${BG}"/><path d="M7.5 6.5 10.5 8l1.5-3 1.5 3 3-1.5"/><path d="M7.2 12a4.2 4.2 0 0 0 2.2 4.2"/>`, 'laurel', 'hexagon')
      ),
    ],
  },
  {
    keys: ['당근', '베타카로틴', '카로틴', '비타민a', 'carrot', 'carotene'],
    enCopy: 'beta-carotene carrot',
    motifs: [
      craftMotif(
        'carrot_veg', '당근 · 베타카로틴 (Beta-Carotene Carrot)', 'Beta-Carotene Carrot',
        '대각선 당근 구근 및 무성한 잎사귀 (Lucide Carrot)',
        LIB_SVGS.carrot_L,
        '당근 구근의 가로 결 주름과 쌍떡잎이 살아있는 정밀 당근 (Tabler Carrot)',
        LIB_SVGS.carrot_T,
        '정밀 당근 원물 + 전면 베타카로틴 에센스 드롭 배지 (속공간 비움)',
        withCornerBadge(LIB_SVGS.carrot_T, 'drop'),
        '보태니컬 월계수 크레스트 + 정밀 당근 코어 + 비타민 리프 배지',
        withCrestAndBadge(LIB_SVGS.carrot_L, 'laurel', 'leaf')
      ),
    ],
  },
  {
    keys: ['브로콜리', '설포라판', '컬리플라워', '양배추', '케일', '시금치', '샐러드', '채소', '야채', '녹즙', '새싹보리', '밀싹', '클로렐라', '스피루리나', '엽록소', '식이섬유', 'broccoli', 'cabbage', 'kale', 'salad', 'veggie', 'fiber'],
    enCopy: 'green veggie fiber',
    motifs: [
      craftMotif(
        'broccoli_veg', '브로콜리 · 케일 · 그린 샐러드 (Green Superfood)', 'Sulforaphane Green',
        '신선한 케일·시금치 잎채소와 엽맥 (Lucide Leafy Green)',
        LIB_SVGS.leafy_green,
        '풍성한 송이와 줄기 분기가 살아있는 브로콜리 (Lucide Broccoli)',
        LIB_SVGS.broccoli_L,
        '신선한 잎채소가 담긴 그린 샐러드 볼 (Lucide Salad Bowl)',
        LIB_SVGS.salad_L,
        '토마토·브로콜리·잎채소가 풍성하게 담긴 가든 슈퍼푸드 볼 (Tabler Rich Salad)',
        LIB_SVGS.salad_T
      ),
    ],
  },
  {
    keys: ['호박', '단호박', '늙은호박', '옥수수', '옥수수수염', '붓기', '클렌즈', 'pumpkin', 'corn'],
    enCopy: 'pumpkin v-line care',
    motifs: [
      craftMotif(
        'pumpkin_veg', '단호박 · 브이라인 클렌즈 (Pumpkin Cleanse)', 'Pumpkin Care',
        '단호박 외곽 및 꼭지 실루엣',
        `<ellipse cx="12" cy="13.5" rx="8" ry="6" fill="${BG}"/><path d="M12 7.5c0-2.2 1.2-3.5 2.8-3.5"/>`,
        '단호박 5갈래 입체 골곡 리브(Ribs) 및 덩굴 꼭지 디테일',
        `<ellipse cx="12" cy="13.5" rx="8.2" ry="6" fill="${BG}"/><ellipse cx="12" cy="13.5" rx="5" ry="6" fill="${BG}"/><ellipse cx="12" cy="13.5" rx="2" ry="6" fill="${BG}"/><path d="M12 7.5c0-2.2 1.2-3.5 2.8-3.5"/>`,
        '입체 단호박 + 전면 워터 클렌즈 순환 드롭 배지 (속공간 비움)',
        withCornerBadge(`<ellipse cx="12" cy="13.5" rx="8.2" ry="6" fill="${BG}"/><ellipse cx="12" cy="13.5" rx="4.4" ry="6" fill="${BG}"/><path d="M12 7.5c0-2.2 1.2-3.5 2.8-3.5"/>`, 'drop'),
        '생체 순환 듀얼 아크 + 입체 단호박 코어 + 보태니컬 리프 배지',
        withCrestAndBadge(`<ellipse cx="12" cy="13.5" rx="8.2" ry="6" fill="${BG}"/><ellipse cx="12" cy="13.5" rx="4.4" ry="6" fill="${BG}"/><path d="M12 7.5c0-2.2 1.2-3.5 2.8-3.5"/>`, 'orbit_flow', 'leaf')
      ),
    ],
  },
  {
    keys: ['버섯', '영지버섯', '상황버섯', '차가버섯', '노루궁뎅이버섯', '표고버섯', '베타글루칸', '꽃송이버섯', 'mushroom', 'reishi', 'glucan'],
    enCopy: 'beta-glucan mushroom',
    motifs: [
      craftMotif(
        'mushroom_veg', '약용 버섯 · 베타글루칸 (Beta-Glucan Mushroom)', 'Beta-Glucan Mushroom',
        '버섯 갓 및 기둥 클린 실루엣 (Tabler Mushroom)',
        LIB_SVGS.mushroom_T,
        '약용 버섯 갓의 포자 무늬 및 주름 디테일',
        `${LIB_SVGS.mushroom_T}<circle cx="9" cy="8.5" r="1" fill="${BG}"/><circle cx="14.5" cy="9" r="1.2" fill="${BG}"/><circle cx="12" cy="6.2" r="0.8" fill="${BG}"/>`,
        '대·소 2송이 버섯 군락 레이어링 (전면 작은 버섯 속공간 비움)',
        `<g transform="translate(-1.8 -0.5) scale(0.88)">${LIB_SVGS.mushroom_T}</g><path d="M15.5 16v4a1.5 1.5 0 0 0 3 0v-4" fill="${BG}"/><path d="M12.5 16a4.5 4.5 0 0 1 9 0Z" fill="${BG}"/>`,
        '보태니컬 월계수 크레스트 + 약용 버섯 군락 + 베타글루칸 방어 쉴드 배지',
        withCrestAndBadge(`${LIB_SVGS.mushroom_T}<circle cx="9.5" cy="8.5" r="1" fill="${BG}"/><circle cx="14.5" cy="9" r="1" fill="${BG}"/>`, 'laurel', 'shield')
      ),
    ],
  },
  {
    keys: ['고추', '파프리카', '캡사이신', '피망', '페퍼', '블랙페퍼', '피페린', 'chili', 'pepper', 'capsaicin'],
    enCopy: 'capsaicin pepper',
    motifs: [
      craftMotif(
        'chili_veg', '고추 · 캡사이신 버닝 (Capsaicin Chili)', 'Capsaicin Burn',
        '스튜디오 칠리 페퍼 실루엣 (Tabler Pepper)',
        LIB_SVGS.pepper_T,
        '칠리 페퍼 + 꼭지 꽃받침 및 입체 하이라이트 곡선',
        `${LIB_SVGS.pepper_T}<path d="M13 15.5c2.5-.5 4.5-2.5 5-5"/>`,
        '칠리 페퍼 원물 + 전면 캡사이신 열대사 플레임 배지 (속공간 비움)',
        withCornerBadge(LIB_SVGS.pepper_T, 'flame'),
        '생체 열대사 순환 아크 + 칠리 페퍼 + 버닝 플레임 배지',
        withCrestAndBadge(LIB_SVGS.pepper_T, 'orbit_flow', 'flame')
      ),
    ],
  },
  {
    keys: ['마늘', '흑마늘', '알리신', '양파', '적양파', '퀘르세틴', '생강', '강황', '울금', '커큐민', 'garlic', 'onion', 'ginger', 'turmeric', 'curcumin'],
    enCopy: 'black garlic & quercetin',
    motifs: [
      craftMotif(
        'garlic_veg', '흑마늘 · 양파 퀘르세틴 (Garlic & Quercetin)', 'Allicin & Quercetin',
        '마늘·양파 구근 미니멀 외곽 실루엣',
        `<path d="M12 3.5c-1.2 3-6.8 5.5-6.8 10.8a6.8 6.8 0 0 0 13.6 0c0-5.3-5.6-7.8-6.8-10.8Z" fill="${BG}"/>`,
        '마늘·양파 구근의 입체 쪽(Clove) 결 분할 및 하단 뿌리 수염',
        `<path d="M12 3.5c-1.2 3-6.8 5.5-6.8 10.8a6.8 6.8 0 0 0 13.6 0c0-5.3-5.6-7.8-6.8-10.8Z" fill="${BG}"/><path d="M12 4.5v16M9 7.8c-1.8 2.8-1.8 8.2 0 12.2M15 7.8c1.8 2.8 1.8 8.2 0 12.2M10 21l-1 1.5M12 21v1.8M14 21l1 1.5"/>`,
        '통마늘 구근 + 전면 알리신 면역 방어 쉴드 배지 (속공간 비움)',
        withCornerBadge(`<path d="M12 3.5c-1.2 3-6.8 5.5-6.8 10.8a6.8 6.8 0 0 0 13.6 0c0-5.3-5.6-7.8-6.8-10.8Z" fill="${BG}"/><path d="M12 4.5v16M9 7.8c-1.8 2.8-1.8 8.2 0 12.2M15 7.8c1.8 2.8 1.8 8.2 0 12.2"/>`, 'shield'),
        '보태니컬 월계수 크레스트 + 흑마늘·양파 구근 + 알리신 에센스 드롭 배지',
        withCrestAndBadge(`<path d="M12 3.5c-1.2 3-6.8 5.5-6.8 10.8a6.8 6.8 0 0 0 13.6 0c0-5.3-5.6-7.8-6.8-10.8Z" fill="${BG}"/><path d="M12 4.5v16M9 7.8c-1.8 2.8-1.8 8.2 0 12.2M15 7.8c1.8 2.8 1.8 8.2 0 12.2"/>`, 'laurel', 'drop')
      ),
    ],
  },
  {
    keys: ['감자', '고구마', '우엉', '연근', '비트', '레드비트', '무', '오이', '뿌리', '구근', 'beet', 'beetroot', 'root', 'potato'],
    enCopy: 'vital root beet',
    motifs: [
      craftMotif(
        'beet_veg', '레드비트 · 뿌리 구근 (Red Beetroot)', 'Vital Beetroot',
        '비트 구근 및 상단 줄기 미니멀 실루엣',
        `<path d="M12 7.5a5.8 5.8 0 0 0-5.8 5.8c0 4 4.4 6.5 5.8 8.8 1.4-2.3 5.8-4.8 5.8-8.8A5.8 5.8 0 0 0 12 7.5Z" fill="${BG}"/><path d="M12 7.5V3M9 4l3 3.5L15 4"/>`,
        '레드비트 구근 + 내부 동심원 나이테 단면 결 & 무성한 잎줄기',
        `<path d="M12 7.5a5.8 5.8 0 0 0-5.8 5.8c0 4 4.4 6.5 5.8 8.8 1.4-2.3 5.8-4.8 5.8-8.8A5.8 5.8 0 0 0 12 7.5Z" fill="${BG}"/><circle cx="12" cy="13.2" r="3" fill="${BG}"/><path d="M12 7.5V2.5M8.5 3.8 12 7.5l3.5-3.7"/>`,
        '레드비트 구근 + 전면 혈류 활력 펄스 배지 (속공간 비움)',
        withCornerBadge(`<path d="M12 7.5a5.8 5.8 0 0 0-5.8 5.8c0 4 4.4 6.5 5.8 8.8 1.4-2.3 5.8-4.8 5.8-8.8A5.8 5.8 0 0 0 12 7.5Z" fill="${BG}"/><circle cx="12" cy="13.2" r="3" fill="${BG}"/><path d="M12 7.5V2.5M8.5 3.8 12 7.5l3.5-3.7"/>`, 'pulse'),
        '보태니컬 월계수 크레스트 + 레드비트 구근 + 농축 비트즙 드롭 배지',
        withCrestAndBadge(`<path d="M12 7.5a5.8 5.8 0 0 0-5.8 5.8c0 4 4.4 6.5 5.8 8.8 1.4-2.3 5.8-4.8 5.8-8.8A5.8 5.8 0 0 0 12 7.5Z" fill="${BG}"/><circle cx="12" cy="13.2" r="2.8" fill="${BG}"/><path d="M12 7.5V2.5M8.5 3.8 12 7.5l3.5-3.7"/>`, 'laurel', 'drop')
      ),
    ],
  },
  {
    keys: ['곡물', '귀리', '오트', '카무트', '파로', '보리', '현미', '쌀', '밀', '효소', '파로효소', '카무트효소', '콩', '대두', '검은콩', '서리태', '이소플라본', 'grain', 'oat', 'kamut', 'farro', 'enzyme', 'soy'],
    enCopy: 'grain enzyme care',
    motifs: [
      craftMotif(
        'wheat_grain', '골든 곡물 · 발효 효소 (Golden Grain Enzyme)', 'Grain Enzyme',
        '발아하는 곡물 새싹과 대지 (Lucide Sprout)',
        LIB_SVGS.sprout_L,
        '대칭으로 뻗은 보리·카무트 곡물 이삭 (Tabler Wheat)',
        LIB_SVGS.wheat_T,
        '겹겹의 낟알이 정밀하게 조각된 황금 밀·파로 이삭 (Lucide Detailed Wheat)',
        LIB_SVGS.wheat_L,
        '후면 황금 곡물 이삭 + 전면 발효 효소 대사 순환 배지 (속공간 비움)',
        withCornerBadge(LIB_SVGS.wheat_L, 'cycle')
      ),
    ],
  },
  {
    keys: ['알로에', '병풀', '시카', '어성초', '티트리', '유칼립투스', '민트', '페퍼민트', '허브', 'aloe', 'cica', 'herb', 'mint'],
    enCopy: 'soothing aloe & cica',
    motifs: [
      craftMotif(
        'aloe_botanical', '알로에 · 시카 보태니컬 허브 (Aloe & Cica Herb)', 'Soothing Aloe & Cica',
        '대칭으로 피어나는 보태니컬 새싹 (Tabler Seedling)',
        LIB_SVGS.seedling_T,
        '보태니컬 화분 & 다육 허브 잎사귀 (Tabler Plant)',
        LIB_SVGS.plant_T,
        '겹겹이 펼쳐진 알로에·시카 로제트 잎사귀 (Tabler Rosette Plant)',
        LIB_SVGS.plant2_T,
        '보태니컬 월계수 크레스트 + 알로에 로제트 코어 + 수딩 수분 드롭 배지',
        withCrestAndBadge(LIB_SVGS.plant2_T, 'laurel', 'drop')
      ),
    ],
  },
  {
    keys: ['녹차', '말차', '콤부차', '홍차', '루이보스', '마테차', '우롱차', '보이차', '히비스커스', '캐모마일', '티', '차', 'tea', 'matcha', 'kombucha'],
    enCopy: 'botanical tea ritual',
    motifs: [
      craftMotif(
        'tea_ritual', '보태니컬 티 · 콤부차 (Botanical Tea Ritual)', 'Botanical Tea Ritual',
        '상쾌한 아이스 콤부차·클린티 텀블러 (Lucide Cup Soda)',
        LIB_SVGS.cup_soda_L,
        '따뜻한 온기가 피어오르는 브루잉 티컵 (Lucide Hot Tea Cup)',
        LIB_SVGS.coffee_L,
        '전통 인퓨전 티포트 주전자 (Tabler Teapot)',
        LIB_SVGS.teapot_T,
        '인퓨전 티포트 + 전면 보태니컬 녹차 카테킨 잎사귀 배지 (속공간 비움)',
        withCornerBadge(LIB_SVGS.teapot_T, 'leaf')
      ),
    ],
  },
];
