/* ═══════════════════════════════════════════════════════════════════════════
   VITALBEAUTIE Icon Generator Engine
   - Lucide (ISC) + Tabler Outline/Filled (MIT) 8,281개 글로벌 아이콘 인덱스 검색
   - 한/영 시맨틱 사전 (웰니스·건강·뷰티·원료·신체·자연·과학·일상 전 영역)
   - 복잡도(Complexity) 기반 12단계 후보 정렬 (심플 → 베이직 → 스탠다드 → 디테일 → 컴플렉스)
   - 바이탈뷰티 6종 배지/아이콘 스타일 재가공 (모든 아이콘 기본 VITALBEAUTIE BLACK #101820)
   - 단일 30×30mm .ai 및 전체 아트보드 .ai / .svg 벡터 출력
   ═══════════════════════════════════════════════════════════════════════════ */
import { buildIllustratorAiBlob } from './engines.js';

const VB_BLACK = '#101820';
const LEARNED_STORAGE_KEY = 'vb_icon_generator_learned_v1';

let iconIndexCache = null;
let iconIndexPromise = null;

export async function loadIconIndex() {
  if (iconIndexCache) return iconIndexCache;
  if (!iconIndexPromise) {
    iconIndexPromise = fetch('./assets/icons/icon-index.json')
      .then(r => r.json())
      .then(data => {
        iconIndexCache = data;
        return data;
      })
      .catch(() => {
        iconIndexCache = { sets: { L: 'Lucide (ISC)', T: 'Tabler Outline (MIT)', F: 'Tabler Filled (MIT)' }, icons: [] };
        return iconIndexCache;
      });
  }
  return iconIndexPromise;
}

/**
 * 포괄적 한국어 → 영어 검색어 & 상단 아크 카피 사전
 * 어떤 키워드를 넣어도 관련 아이콘이 풍성하게 매칭되도록 구성
 */
const KO_SEMANTIC_DICT = [
  // 수면 / 릴렉스 / 멘탈
  { ko: ['수면', '숙면', '잠', '나이트', '밤'], en: 'good sleep', terms: ['moon', 'bed', 'moon-stars', 'zzz', 'sleep', 'night', 'star', 'cloud-moon', 'bed-flat', 'alarm'] },
  { ko: ['스트레스', '릴렉스', '휴식', '안정', '진정', '마음', '힐링', '명상'], en: 'relax care', terms: ['sparkles', 'feather', 'leaf', 'cloud', 'wind', 'smile', 'heart-handshake', 'flower', 'lotus', 'sun-wind'] },
  // 디톡스 / 클렌즈 / 수분
  { ko: ['디톡스', '클렌즈', '정화', '배출', '클린'], en: 'detox', terms: ['droplet', 'droplets', 'glass-water', 'recycle', 'refresh', 'sparkles', 'filter', 'waves', 'flame', 'leaf'] },
  { ko: ['물', '수분', '보습', '워터', '하이드라', '촉촉'], en: 'hydration', terms: ['droplet', 'droplets', 'glass-water', 'waves', 'cloud-rain', 'cup-soda', 'bottle', 'ripple', 'mist'] },
  // 슬리밍 / 다이어트 / 대사 / 혈당
  { ko: ['다이어트', '슬리밍', '체지방', '체중', '슬림', '감량', '핏', '바디'], en: 'slim fit', terms: ['scale', 'flame', 'activity', 'zap', 'scissors', 'trending-down', 'gauge', 'person-standing', 'dumbbell', 'heart-pulse'] },
  { ko: ['혈당', '당류', '당케어', '글루코', '탄수화물', '더블컷', '컷'], en: 'blood sugar cut', terms: ['droplet', 'activity', 'shield-check', 'trending-down', 'scissors', 'slash', 'ban', 'chart-line', 'gauge', 'target'] },
  { ko: ['대사', '신진대사', '순환', '연소', '칼로리', '열량'], en: 'metabolism', terms: ['flame', 'refresh-cw', 'repeat', 'recycle', 'zap', 'activity', 'Orbit', 'infinity', 'wind', 'sun'] },
  // 이너뷰티 / 피부 / 콜라겐
  { ko: ['콜라겐', '탄력', '피부', '뷰티', '광채', '주름', '안티에이징', '미백', '브라이트닝'], en: 'inner beauty', terms: ['sparkles', 'sparkle', 'gem', 'diamond', 'flower', 'flower-2', 'sun', 'wand', 'layers', 'droplet'] },
  { ko: ['레티놀', '비타민', '멀티비타민', '비타민c', '비타민b', '비타민d', '항산화'], en: 'vitamin care', terms: ['sun', 'sparkles', 'citrus', ' citrus', 'orange', 'lemon', 'zap', 'shield', 'pill', ' capsules'] },
  { ko: ['시카', '병풀', '알로에', '허브', '식물', '비건', '자연', '네이처'], en: 'botanical care', terms: ['leaf', 'sprout', 'trees', 'tree', 'flower', 'clover', 'vegan', 'plant', 'seedling', 'flower-lotus'] },
  // 장 건강 / 유산균 / 효소 / 소화
  { ko: ['유산균', '프로바이오틱스', '장건강', '장', '소화', '배변', '쾌변', '바이옴'], en: 'probiotics', terms: ['shield-check', 'infinity', 'activity', 'refresh-cw', 'circle-dot', 'sparkles', 'waves', 'dna', 'microscope', 'heart'] },
  { ko: ['효소', '발효', '곡물', '소화효소'], en: 'enzyme', terms: ['wheat', 'sparkles', 'flame', 'FlaskConical', 'beaker', 'droplets', 'hourglass', 'sun', 'leaf', 'grain'] },
  // 에너지 / 활력 / 피로 / 부스터
  { ko: ['에너지', '활력', '피로', '부스터', '부스팅', '파워', '스태미나', '충전'], en: 'energy boost', terms: ['zap', 'bolt', 'battery-charging', 'flame', 'rocket', 'sun', 'sunrise', 'activity', 'trending-up', 'award'] },
  // 기억력 / 뇌 / 집중 / 인지
  { ko: ['기억력', '두뇌', '뇌', '집중', '집중력', '인지', '학습', '스마트', '멘탈'], en: 'brain focus', terms: ['brain', 'lightbulb', 'cpu', 'sparkles', 'target', 'compass', 'eye', 'book-open', 'zap', 'puzzle'] },
  // 면역 / 홍삼 / 인삼 / 명작수
  { ko: ['면역', '면역력', '방어', '보호', '실드', '홍삼', '인삼', '진생', '명작수'], en: 'immunity shield', terms: ['shield', 'shield-check', 'shield-plus', 'crown', 'award', 'sun', 'sparkles', 'heart-pulse', 'flower', 'gem'] },
  // 관절 / 뼈 / 근육 / 칼슘 / 단백질
  { ko: ['관절', '연골', '뼈', '칼슘', '조이스텝', '보행', '걸음'], en: 'joint & bone', terms: ['bone', 'footprints', 'activity', 'dumbbell', 'person-standing', 'Accessibility', 'link', 'shield', 'move', 'layers'] },
  { ko: ['근육', '단백질', '프로틴', '운동', '피트니스', '스포츠', '크레아틴', '헬스'], en: 'muscle power', terms: ['dumbbell', 'flame', 'zap', 'activity', 'trophy', 'medal', 'biceps-flexed', 'heart-pulse', 'bike', 'footprints'] },
  // 눈 / 간 / 심장 / 혈행 / 치아 / 모발
  { ko: ['눈', '시력', '아이', '루테인', '안구'], en: 'eye care', terms: ['eye', 'glasses', 'sparkles', 'sun', 'focus', 'scan-eye', 'view', 'aperture', 'camera', 'Search'] },
  { ko: ['간', '밀크씨슬', '숙취', '피로회복', '리버'], en: 'liver care', terms: ['shield-plus', 'heart-pulse', 'refresh-cw', 'sparkles', 'leaf', 'droplet', 'activity', 'battery-charging', 'sun', 'plus-circle'] },
  { ko: ['혈행', '혈관', '혈액', '심장', '오메가', '콜레스테롤', '하트'], en: 'blood flow', terms: ['heart', 'heart-pulse', 'activity', 'droplet', 'waves', 'refresh-cw', 'infinity', 'fish', 'shield-heart'] },
  { ko: ['구강', '치아', '이', '덴탈', '입', '상쾌'], en: 'oral care', terms: ['smile', 'sparkles', 'shield-check', 'wind', 'star', 'tooth', ' dental', 'heart'] },
  { ko: ['모발', '머리', '두피', '탈모', '비오틴', '손톱', '케라틴'], en: 'hair & nail', terms: ['sparkles', 'feather', 'wind', 'crown', 'layers', 'sprout', 'wand', 'Scissors', 'brush'] },
  // 여성 / 남성 / 키즈 / 시니어 / 가족
  { ko: ['여성', '우먼', '갱년기', '철분', '엽산', '임산부', '핑크'], en: 'women care', terms: ['flower', 'heart', 'sparkles', 'gem', 'venus', 'user', 'smile', 'crown', 'sun'] },
  { ko: ['남성', '맨', '전립선', '지구력'], en: 'men care', terms: ['shield', 'zap', 'mars', 'award', 'flame', 'dumbbell', 'compass', 'crown', 'target'] },
  { ko: ['키즈', '어린이', '아이', '성장', '청소년', '베이비'], en: 'kids growth', terms: ['smile', 'star', 'sparkles', 'baby', 'rocket', 'sprout', 'balloon', 'toy-brick', 'heart'] },
  // 원료 / 과일 / 식품 / 제형
  { ko: ['사과', '애사비', '사과식초', '식초', '애플'], en: 'apple cider', terms: ['apple', 'cherry', 'citrus', 'droplet', 'bottle', 'cup-soda', 'leaf', 'sparkles'] },
  { ko: ['녹차', '카테킨', '차', '티', '클린티', '잎'], en: 'green tea', terms: ['leaf', 'cup-soda', 'coffee', 'mug', 'sprout', 'droplet', 'trees', 'flower'] },
  { ko: ['레몬', '오렌지', '자몽', '시트러스', '감귤', '과일', '베리'], en: 'citrus fruit', terms: ['citrus', 'apple', 'cherry', 'grape', 'banana', 'sun', 'sparkles', 'droplet'] },
  { ko: ['정제', '타블렛', '캡슐', '알약', '소프트젤', '필'], en: 'tablet & pill', terms: ['pill', 'pills', 'tablets', 'capsule', 'circle-dot', 'disc', 'plus-circle', 'shield'] },
  { ko: ['액상', '앰플', '샷', '부스터샷', '드링크', '음료', '병'], en: 'liquid shot', terms: ['bottle', 'milk', 'cup-soda', 'flask-conical', 'test-tube', 'droplet', 'glass-water', 'wine'] },
  { ko: ['젤리', '구미', '스틱', '파우치', '포', '파우더', '분말'], en: 'jelly stick', terms: ['candy', 'cookie', 'package', 'sparkles', 'box', 'layers', 'bookmark', 'star'] },
  // 과학 / 연구 / 검증 / 시간 / 환경
  { ko: ['과학', '연구', '랩', '실험', '임상', '검증', '특허', '기술', '바이오', 'dna'], en: 'lab proven', terms: ['flask-conical', 'microscope', 'dna', 'atom', 'test-tube', 'beaker', 'award', 'check-circle', 'shield-check', 'sparkles'] },
  { ko: ['시간', '시계', '루틴', '데일리', '매일', '하루', '아침', '저녁', '타이머'], en: 'daily routine', terms: ['clock', 'alarm-clock', 'calendar', 'sun', 'sunrise', 'sunset', 'hourglass', 'repeat', 'check-circle'] },
  { ko: ['친환경', '환경', '에코', '지구', '재활용', '지속가능', '그린'], en: 'eco green', terms: ['recycle', 'globe', 'earth', 'leaf', 'sprout', 'trees', 'sun', 'wind', 'droplet'] },
  { ko: ['사랑', '하트', '행복', '미소', '웃음', '케어'], en: 'love & care', terms: ['heart', 'smile', 'heart-handshake', 'sparkles', 'star', 'sun', 'gift', 'thumbs-up'] },
  { ko: ['별', '스타', '베스트', '프리미엄', '골드', '명품', '1등', '어워드'], en: 'premium star', terms: ['star', 'award', 'trophy', 'crown', 'medal', 'gem', 'diamond', 'sparkles', 'Check'] },
  { ko: ['집', '홈', '공간', '실내', '가족'], en: 'home care', terms: ['home', 'house', 'heart', 'shield', 'sun', 'users', 'sofa', 'lamp'] },
  { ko: ['음악', '소리', '사운드', '리듬', '파동'], en: 'sound wave', terms: ['music', 'volume-2', 'headphones', 'radio', 'waves', 'activity', 'bell'] },
  { ko: ['여행', '비행기', '이동', '휴가', '캠핑', '아웃도어'], en: 'travel', terms: ['plane', 'compass', 'map-pin', 'globe', 'tent', 'mountain', 'sun', 'luggage'] },
  { ko: ['카메라', '사진', '이미지', '비전'], en: 'vision', terms: ['camera', 'image', 'aperture', 'eye', 'sparkles', 'focus', 'frame'] },
  { ko: ['책', '가이드', '지식', '교육', '문서'], en: 'guide', terms: ['book-open', 'book', 'file-text', 'bookmark', 'graduation-cap', 'pen-tool', 'award'] },
  { ko: ['보안', '안전', '잠금', '체크', '인증', '합격'], en: 'verified', terms: ['shield-check', 'check', 'circle-check', 'badge-check', 'lock', 'key', 'award'] },
  { ko: ['불', '불꽃', '열', '온도', '핫', '따뜻한'], en: 'thermal', terms: ['flame', 'fire', 'sun', 'thermometer', 'zap', 'sparkles'] },
  { ko: ['얼음', '쿨', '아이스', '차가운', '눈꽃'], en: 'cooling', terms: ['snowflake', 'wind', 'cloud-snow', 'thermometer-snowflake', 'droplet', 'sparkles'] },
  { ko: ['날씨', '태양', '구름', '바람', '비', '무지개'], en: 'weather', terms: ['sun', 'cloud', 'wind', 'cloud-rain', 'rainbow', 'sunrise', 'umbrella', 'sparkles'] },
  { ko: ['동물', '반려동물', '강아지', '고양이', '새', '물고기'], en: 'pet care', terms: ['dog', 'cat', 'bird', 'fish', 'paw-print', 'rabbit', 'turtle', 'heart'] },
];

// 추가 단일 한->영 단어 매핑 (사전에 없는 일상 명사·동사·개념까지 폭넓게 커버)
const KO_WORD_MAP = {
  달: 'moon', 별: 'star', 해: 'sun', 태양: 'sun', 구름: 'cloud', 바람: 'wind', 비: 'rain', 눈꽃: 'snowflake',
  번개: 'zap', 무지개: 'rainbow', 우산: 'umbrella', 안개: 'mist', 파도: 'waves', 폭풍: 'cloud-lightning',
  산: 'mountain', 바다: 'waves', 강: 'waves', 나무: 'tree', 숲: 'trees', 꽃: 'flower', 잎: 'leaf', 씨앗: 'sprout',
  새싹: 'sprout', 풀: 'sprout', 선인장: 'cactus', 버섯: 'mushroom', 지구: 'globe', 세계: 'globe', 우주: 'orbit',
  불: 'flame', 물방울: 'droplet', 전기: 'zap', 배터리: 'battery', 충전: 'battery-charging', 에너지: 'zap',
  시계: 'clock', 달력: 'calendar', 알람: 'alarm-clock', 모래시계: 'hourglass', 타이머: 'timer', 스톱워치: 'stopwatch',
  나침반: 'compass', 지도: 'map', 위치: 'map-pin', 핀: 'pin', 방향: 'navigation', 경로: 'route',
  집: 'home', 건물: 'building', 빌딩: 'building-2', 문: 'door-open', 창문: 'layout', 침대: 'bed', 의자: 'armchair',
  소파: 'sofa', 책상: 'desk', 램프: 'lamp', 조명: 'lightbulb', 전구: 'lightbulb', 계단: 'stairs',
  사람: 'user', 사용자: 'users', 가족: 'users', 친구: 'users', 어린이: 'baby', 아기: 'baby', 얼굴: 'smile',
  웃음: 'smile', 미소: 'smile', 행복: 'laugh', 슬픔: 'frown', 손: 'hand', 손가락: 'pointer', 발: 'footprints',
  발자국: 'footprints', 눈동자: 'eye', 시선: 'eye', 귀: 'ear', 코: 'wind', 입술: 'smile', 심장: 'heart',
  하트: 'heart', 뇌: 'brain', 생각: 'brain', 뼈: 'bone', 치아: 'tooth', 근육: 'dumbbell', 폐: 'lungs',
  사과: 'apple', 체리: 'cherry', 포도: 'grape', 바나나: 'banana', 레몬: 'citrus', 오렌지: 'citrus', 당근: 'carrot',
  밀: 'wheat', 곡물: 'wheat', 쌀: 'wheat', 옥수수: 'wheat', 채소: 'salad', 샐러드: 'salad', 수프: 'soup',
  빵: 'croissant', 케이크: 'cake', 쿠키: 'cookie', 사탕: 'candy', 아이스크림: 'ice-cream', 피자: 'pizza',
  햄버거: 'sandwich', 고기: 'beef', 생선: 'fish', 달걀: 'egg', 계란: 'egg', 치즈: 'cheese', 우유: 'milk',
  커피: 'coffee', 차: 'cup-soda', 녹차: 'leaf', 와인: 'wine', 맥주: 'beer', 칵테일: 'martini', 물컵: 'glass-water',
  주스: 'cup-soda', 물병: 'bottle', 요리: 'utensils', 식사: 'utensils', 포크: 'utensils', 숟가락: 'utensils',
  알약: 'pill', 캡슐: 'pill', 주사: 'syringe', 백신: 'syringe', 온도계: 'thermometer', 청진기: 'stethoscope',
  현미경: 'microscope', 플라스크: 'flask-conical', 비커: 'beaker', 시험관: 'test-tube', 밴드: 'bandage',
  구급상자: 'briefcase-medical', 병원: 'hospital', 약국: 'pill', 응급: 'ambulance', 건강: 'heart-pulse',
  유전자: 'dna', 원자: 'atom', 과학: 'atom', 실험: 'flask-conical', 연구: 'microscope', 공식: 'sigma',
  방패: 'shield', 보호: 'shield-check', 보안: 'lock', 안전: 'shield', 왕관: 'crown', 트로피: 'trophy',
  메달: 'medal', 상장: 'award', 보석: 'gem', 다이아몬드: 'diamond', 반지: 'gem', 선물: 'gift',
  열쇠: 'key', 자물쇠: 'lock', 종: 'bell', 알림: 'bell', 깃발: 'flag', 과녁: 'target', 목표: 'target',
  로켓: 'rocket', 비행기: 'plane', 자동차: 'car', 버스: 'bus', 트럭: 'truck', 자전거: 'bike', 오토바이: 'bike',
  배: 'ship', 보트: 'sailboat', 기차: 'train', 지하철: 'train', 헬리콥터: 'plane', 여행: 'luggage', 가방: 'briefcase',
  카메라: 'camera', 사진: 'image', 그림: 'palette', 예술: 'palette', 디자인: 'pen-tool', 브러시: 'brush',
  음악: 'music', 노래: 'music', 헤드폰: 'headphones', 이어폰: 'headphones', 마이크: 'mic', 스피커: 'volume-2',
  라디오: 'radio', 영화: 'film', 비디오: 'video', 티비: 'tv', 모니터: 'monitor', 게임: 'gamepad-2',
  컴퓨터: 'laptop', 노트북: 'laptop', 스마트폰: 'smartphone', 휴대폰: 'smartphone', 전화: 'phone', 태블릿: 'tablet',
  키보드: 'keyboard', 마우스: 'mouse', 프린터: 'printer', 서버: 'server', 데이터베이스: 'database', 클라우드: 'cloud',
  와이파이: 'wifi', 블루투스: 'bluetooth', 인터넷: 'globe', 코드: 'code', 코딩: 'terminal', 로봇: 'bot', 인공지능: 'sparkles',
  책: 'book', 독서: 'book-open', 노트: 'notebook', 문서: 'file-text', 폴더: 'folder', 파일: 'file',
  연필: 'pencil', 펜: 'pen', 만년필: 'feather', 지우개: 'eraser', 자: 'ruler', 가위: 'scissors', 클립: 'paperclip',
  편지: 'mail', 이메일: 'mail', 메일: 'mail', 메시지: 'message-circle', 채팅: 'message-square', 대화: 'messages-square',
  돋보기: 'search', 검색: 'search', 필터: 'filter', 설정: 'settings', 톱니바퀴: 'settings', 도구: 'wrench',
  망치: 'hammer', 드라이버: 'wrench', 칼: 'scissors', 자석: 'magnet', 나사: 'settings',
  차트: 'chart-bar', 그래프: 'trending-up', 통계: 'pie-chart', 분석: 'activity', 성장: 'trending-up', 하락: 'trending-down',
  돈: 'coins', 동전: 'coins', 지폐: 'banknote', 지갑: 'wallet', 카드: 'credit-card', 쇼핑: 'shopping-bag',
  장바구니: 'shopping-cart', 상점: 'store', 마트: 'shopping-cart', 영수증: 'receipt', 태그: 'tag', 할인: 'percent',
  저울: 'scale', 무게: 'scale', 아령: 'dumbbell', 운동: 'dumbbell', 달리기: 'footprints', 축구: 'circle',
  농구: 'circle', 야구: 'circle', 테니스: 'circle', 골프: 'flag', 수영: 'waves', 요가: 'sparkles', 캠핑: 'tent',
  강아지: 'dog', 개: 'dog', 고양이: 'cat', 새: 'bird', 물고기: 'fish', 토끼: 'rabbit', 거북이: 'turtle',
  나비: 'bug', 벌: 'bug', 발바닥: 'paw-print', 동물: 'paw-print',
  옷: 'shirt', 티셔츠: 'shirt', 신발: 'footprints', 안경: 'glasses', 선글라스: 'sunglasses', 모자: 'crown', 시계줄: 'watch',
  반짝: 'sparkles', 빛: 'sun', 화살표: 'arrow-right', 체크: 'check', 확인: 'check-circle', 금지: 'ban',
  경고: 'triangle-alert', 정보: 'info', 질문: 'circle-help', 느낌표: 'circle-alert', 플러스: 'plus', 마이너스: 'minus',
  무한: 'infinity', 재활용: 'recycle', 회전: 'refresh-cw', 새로고침: 'refresh-cw', 공유: 'share-2', 링크: 'link',
  다운로드: 'download', 업로드: 'upload', 저장: 'save', 삭제: 'trash-2', 휴지통: 'trash-2', 복사: 'copy',
  날개: 'feather', 깃털: 'feather', 리본: 'ribbon', 퍼즐: 'puzzle', 주사위: 'dice-5', 왕: 'crown', 마법: 'wand',
};

export function getLearnedPreferences() {
  try {
    return JSON.parse(localStorage.getItem(LEARNED_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveLearnedPreference(keyword, iconId) {
  try {
    const cur = getLearnedPreferences();
    cur[keyword.trim().toLowerCase()] = iconId;
    localStorage.setItem(LEARNED_STORAGE_KEY, JSON.stringify(cur));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * 입력 키워드(한국어/영어)를 분석해 영문 표시 카피(enCopy)와 검색 토큰 리스트를 반환
 */
export function resolveKeywordSearchTerms(rawKeyword) {
  const kw = (rawKeyword || '').trim();
  const lower = kw.toLowerCase();
  if (!kw) return { raw: '웰니스', enCopy: 'wellness', terms: ['sparkles', 'leaf', 'heart', 'sun', 'droplet'] };

  // 1) 정확 또는 부분 일치 시맨틱 사전 검색
  const matchedTerms = [];
  let enCopy = '';

  for (const entry of KO_SEMANTIC_DICT) {
    if (entry.ko.some(k => lower === k || lower.includes(k) || k.includes(lower))) {
      if (!enCopy) enCopy = entry.en;
      matchedTerms.push(...entry.terms);
    }
  }

  // 2) 단일 단어 사전 매칭
  for (const [koWord, enWord] of Object.entries(KO_WORD_MAP)) {
    if (lower.includes(koWord)) {
      if (!enCopy) enCopy = enWord.replace(/-/g, ' ');
      matchedTerms.push(enWord);
    }
  }

  // 3) 영문 입력이 포함된 경우 그대로 토큰 추가
  const enTokens = lower.match(/[a-z0-9]+/g) || [];
  if (enTokens.length) {
    if (!enCopy) enCopy = enTokens.join(' ');
    matchedTerms.push(...enTokens);
  }

  // 4) 만약 사전에서 못 찾은 새로운 한국어 단어라면 결정론적 해시로 다양한 웰니스/범용 아이콘 토큰 배정
  if (matchedTerms.length === 0) {
    const fallbackPools = [
      ['sparkles', 'star', 'sun', 'moon', 'flower', 'leaf', 'droplet', 'heart', 'shield', 'award', 'gem', 'crown'],
      ['circle-dot', 'compass', 'target', 'zap', 'flame', 'waves', 'wind', 'cloud', 'sprout', 'trees', 'apple', 'citrus'],
      ['flask-conical', 'microscope', 'dna', 'atom', 'activity', 'heart-pulse', 'brain', 'eye', 'smile', 'feather', 'infinity', 'recycle'],
    ];
    const hash = [...lower].reduce((a, c) => a + c.charCodeAt(0), 0);
    matchedTerms.push(...fallbackPools[hash % fallbackPools.length]);
    enCopy = 'vital wellness';
  }

  return {
    raw: kw,
    enCopy: enCopy || 'vital wellness',
    terms: [...new Set(matchedTerms.map(t => t.toLowerCase()))],
  };
}

const COMPLEXITY_LABELS = [
  '심플', '심플',
  '베이직', '베이직', '베이직',
  '스탠다드', '스탠다드',
  '디테일', '디테일', '디테일',
  '컴플렉스', '컴플렉스',
];

/**
 * 키워드에 대해 8,281개 글로벌 아이콘 인덱스에서 후보를 검색하고
 * 심플(낮은 복잡도) → 복잡(높은 복잡도) 순으로 12개 후보를 추출한다.
 * offsetPage를 올리면 '↻ 다른 형태' 버튼으로 다른 후보 세트를 순환한다.
 */
export function searchCandidateIcons(indexData, rawKeyword, offsetPage = 0) {
  const { raw, enCopy, terms } = resolveKeywordSearchTerms(rawKeyword);
  const icons = indexData?.icons || [];
  const learned = getLearnedPreferences()[raw.toLowerCase()];

  const scored = [];
  for (let i = 0; i < icons.length; i++) {
    const [name, setCode, tagStr, innerSvg, comp] = icons[i];
    const id = `${setCode}:${name}`;
    const nameLower = name.toLowerCase();
    const tagsLower = tagStr.toLowerCase();

    let score = 0;
    for (let tIdx = 0; tIdx < terms.length; tIdx++) {
      const term = terms[tIdx];
      const priorityWeight = Math.max(1, 10 - tIdx);
      if (nameLower === term) score += 50 * priorityWeight;
      else if (nameLower.startsWith(term + '-') || nameLower.endsWith('-' + term)) score += 28 * priorityWeight;
      else if (nameLower.includes(term)) score += 14 * priorityWeight;
      else if (tagsLower.split('|').includes(term)) score += 10 * priorityWeight;
      else if (tagsLower.includes(term)) score += 4 * priorityWeight;
    }

    if (score > 0) {
      // Outline 아이콘을 기본 선호하되 Filled도 적절히 포함
      if (setCode === 'L' || setCode === 'T') score += 6;
      scored.push({
        id,
        name,
        setCode,
        setName: setCode === 'L' ? 'Lucide' : setCode === 'T' ? 'Tabler Outline' : 'Tabler Filled',
        tags: tagStr ? tagStr.split('|').filter(Boolean).slice(0, 5) : [],
        innerSvg,
        complexity: comp || 10,
        score,
        isLearned: learned === id,
      });
    }
  }

  // 점수순 상위 풀 확보 (최소 48개 확보)
  scored.sort((a, b) => (b.isLearned - a.isLearned) || (b.score - a.score) || (a.complexity - b.complexity));

  // 동일 모양 중복 억제를 위해 상위 풀에서 다양성 있게 추출
  const poolSize = Math.min(scored.length, 72);
  const topPool = scored.slice(0, poolSize);

  // 페이지 오프셋에 따라 12개 샘플링
  const pageStride = 12;
  const start = (offsetPage * pageStride) % Math.max(1, topPool.length);
  const rotated = [...topPool.slice(start), ...topPool.slice(0, start)];

  const picked = [];
  const usedNames = new Set();
  for (const item of rotated) {
    const baseKey = `${item.setCode === 'F' ? 'F' : 'O'}:${item.name}`;
    if (usedNames.has(baseKey) && rotated.length > 18) continue;
    usedNames.add(baseKey);
    picked.push(item);
    if (picked.length === 12) break;
  }

  // 만약 12개 미만이면 나머지 채우기
  for (const item of rotated) {
    if (picked.length >= 12) break;
    if (!picked.includes(item)) picked.push(item);
  }

  // 복잡도(심플 → 복잡) 순으로 정렬하되, 사용자가 이전에 선택한(learned) 아이콘은 맨 앞에 배치
  picked.sort((a, b) => {
    if (a.isLearned !== b.isLearned) return b.isLearned - a.isLearned;
    return a.complexity - b.complexity;
  });

  const candidates = picked.map((item, idx) => ({
    ...item,
    tierLabel: COMPLEXITY_LABELS[idx] || '컴플렉스',
  }));

  return {
    keyword: raw,
    enCopy,
    candidates,
  };
}

/**
 * 바이탈뷰티 6가지 버전 정의 (레퍼런스 이미지 100% 동일 구성)
 */
export const VB_ICON_VARIANTS = [
  { id: 'circle-line', label: '원형 라인 배지', frameDesc: '원형 라인 컨테이너 (선 2.4/120)' },
  { id: 'circle-arc', label: '원형 + 원호 카피', frameDesc: '원형 라인 + 상단 원호 영문 카피' },
  { id: 'circle-solid', label: '채운 원 반전', frameDesc: '채운 VB 블랙 원형 + 화이트 반전 + 상하 카피' },
  { id: 'circle-keyword', label: '아이콘 + 키워드', frameDesc: '원형 라인 + 아이콘 + 하단 국문 키워드' },
  { id: 'squircle-line', label: '라운드 프레임', frameDesc: '라운드 스퀘어 프레임 (선 2.4/120)' },
  { id: 'standalone', label: '단독 아이콘', frameDesc: '프레임 없는 단독 픽토그램 (선 2.4/120)' },
];

const escXml = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * 선택한 후보 아이콘을 바이탈뷰티 6가지 스타일 중 하나로 렌더링 (120×120 그리드 기준, 기본 VB_BLACK #101820)
 */
export function renderVbStyledIconSvg(candidate, variantId = 'circle-line', { koText = '', enText = '', uid = 'vb' } = {}) {
  if (!candidate) return '';
  const isFilledSource = candidate.setCode === 'F';
  const isSolidBadge = variantId === 'circle-solid';
  const fg = isSolidBadge ? '#FFFFFF' : VB_BLACK;
  const strokeW = 2.4;

  // 24x24 원본 픽토그램을 120x120 캔버스 중앙에 배치하기 위한 변환 계산
  let iconScale = 2.25;
  let iconOffsetY = 0;
  if (variantId === 'standalone') {
    iconScale = 3.5;
  } else if (variantId === 'circle-arc') {
    iconScale = 2.05;
    iconOffsetY = 4;
  } else if (variantId === 'circle-solid') {
    iconScale = 1.9;
    iconOffsetY = 1;
  } else if (variantId === 'circle-keyword') {
    iconScale = 1.85;
    iconOffsetY = -8;
  }

  const tx = +(60 - 12 * iconScale).toFixed(2);
  const ty = +(60 - 12 * iconScale + iconOffsetY).toFixed(2);
  const innerStrokeW = +(strokeW / iconScale).toFixed(2);

  const glyphGroup = isFilledSource
    ? `<g transform="translate(${tx} ${ty}) scale(${iconScale})" fill="${fg}" stroke="none">${candidate.innerSvg}</g>`
    : `<g transform="translate(${tx} ${ty}) scale(${iconScale})" fill="none" stroke="${fg}" stroke-width="${innerStrokeW}" stroke-linecap="round" stroke-linejoin="round">${candidate.innerSvg}</g>`;

  const arcTopId = `arc-top-${uid}-${variantId}`;
  const enClean = escXml((enText || 'vital wellness').toLowerCase());
  const koClean = escXml(koText || '');

  let frameSvg = '';
  let textSvg = '';

  if (variantId === 'circle-line') {
    frameSvg = `<circle cx="60" cy="60" r="46" fill="none" stroke="${VB_BLACK}" stroke-width="${strokeW}"/>`;
  } else if (variantId === 'circle-arc') {
    frameSvg = `
      <defs><path id="${arcTopId}" d="M 22,60 A 38,38 0 1,1 98,60"/></defs>
      <circle cx="60" cy="60" r="46" fill="none" stroke="${VB_BLACK}" stroke-width="${strokeW}"/>`;
    textSvg = `
      <text fill="${VB_BLACK}" font-family="'Raleway','Noto Sans KR',sans-serif" font-size="7.2" font-weight="500" letter-spacing="0.6">
        <textPath href="#${arcTopId}" startOffset="50%" text-anchor="middle">${enClean}</textPath>
      </text>`;
  } else if (variantId === 'circle-solid') {
    frameSvg = `
      <defs><path id="${arcTopId}" d="M 24,60 A 36,36 0 1,1 96,60"/></defs>
      <circle cx="60" cy="60" r="46" fill="${VB_BLACK}"/>
      <circle cx="60" cy="60" r="42.2" fill="none" stroke="#FFFFFF" stroke-width="0.9" opacity="0.85"/>`;
    textSvg = `
      <text fill="#FFFFFF" font-family="'Raleway','Noto Sans KR',sans-serif" font-size="6.8" font-weight="500" letter-spacing="0.6">
        <textPath href="#${arcTopId}" startOffset="50%" text-anchor="middle">${enClean}</textPath>
      </text>
      <text x="60" y="95.5" text-anchor="middle" fill="#FFFFFF" font-family="'RIX-신고딕se-pro','Noto Sans KR',sans-serif" font-size="7.2" font-weight="500" letter-spacing="0.4">${koClean}</text>`;
  } else if (variantId === 'circle-keyword') {
    frameSvg = `<circle cx="60" cy="60" r="46" fill="none" stroke="${VB_BLACK}" stroke-width="${strokeW}"/>`;
    textSvg = `<text x="60" y="88" text-anchor="middle" fill="${VB_BLACK}" font-family="'RIX-신고딕se-pro','Noto Sans KR',sans-serif" font-size="8.4" font-weight="500" letter-spacing="0.3">${koClean}</text>`;
  } else if (variantId === 'squircle-line') {
    frameSvg = `<rect x="14" y="14" width="92" height="92" rx="24" ry="24" fill="none" stroke="${VB_BLACK}" stroke-width="${strokeW}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
    ${frameSvg}
    ${textSvg}
    ${glyphGroup}
  </svg>`;
}

/**
 * 후보 12개에 표시할 미니 단독 픽토그램 SVG (24x24, 항상 VB_BLACK #101820)
 */
export function renderCandidateThumbSvg(candidate) {
  if (!candidate) return '';
  if (candidate.setCode === 'F') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="${VB_BLACK}" stroke="none">${candidate.innerSvg}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="${VB_BLACK}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${candidate.innerSvg}</svg>`;
}

/**
 * 단일 선택 아이콘 30×30mm (85.04×85.04pt) 아트보드 .ai / .svg 생성
 */
export function buildSingleIconExportSvg(candidate, variantId, { koText = '', enText = '' } = {}) {
  const inner = renderVbStyledIconSvg(candidate, variantId, { koText, enText, uid: 'export' })
    .replace(/^[\s\S]*?<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="30mm" viewBox="0 0 120 120">
  ${inner}
</svg>`;
}

/**
 * 전체 .ai 시트 생성: 각 키워드별 12개 형태 후보 + 선택한 형태의 6가지 바이탈뷰티 버전 모두 포함
 */
export function buildAllKeywordsSheetSvg(keywordBlocks) {
  const rowHeight = 250;
  const totalH = Math.max(280, keywordBlocks.length * rowHeight + 40);
  const totalW = 920;

  const rowsSvg = keywordBlocks.map((block, bIdx) => {
    const y0 = 24 + bIdx * rowHeight;
    const candsSvg = block.candidates.map((cand, cIdx) => {
      const cx = 24 + cIdx * 72;
      const cy = y0 + 28;
      const glyph = cand.setCode === 'F'
        ? `<g transform="translate(${cx + 16} ${cy + 10}) scale(1.35)" fill="${VB_BLACK}" stroke="none">${cand.innerSvg}</g>`
        : `<g transform="translate(${cx + 16} ${cy + 10}) scale(1.35)" fill="none" stroke="${VB_BLACK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${cand.innerSvg}</g>`;
      return `
        <rect x="${cx}" y="${cy}" width="64" height="64" fill="#FFFFFF" stroke="${cand.id === block.selectedCandidate.id ? VB_BLACK : '#D5D8DE'}" stroke-width="${cand.id === block.selectedCandidate.id ? 1.5 : 0.7}"/>
        ${glyph}
        <text x="${cx + 32}" y="${cy + 56}" text-anchor="middle" fill="#666B75" font-size="7.5" font-family="'Noto Sans KR',sans-serif">${escXml(cand.tierLabel)}</text>`;
    }).join('');

    const variantsSvg = VB_ICON_VARIANTS.map((v, vIdx) => {
      const vx = 24 + vIdx * 144;
      const vy = y0 + 108;
      const inner = renderVbStyledIconSvg(block.selectedCandidate, v.id, {
        koText: block.keyword,
        enText: block.enCopy,
        uid: `sheet-${bIdx}-${vIdx}`,
      })
        .replace(/^[\s\S]*?<svg[^>]*>/i, '')
        .replace(/<\/svg>\s*$/i, '');
      return `
        <rect x="${vx}" y="${vy}" width="132" height="124" fill="#FFFFFF" stroke="#D5D8DE" stroke-width="0.7"/>
        <g transform="translate(${vx + 22} ${vy + 8}) scale(0.73)">${inner}</g>
        <text x="${vx + 66}" y="${vy + 114}" text-anchor="middle" fill="#4A505C" font-size="8.5" font-family="'Noto Sans KR',sans-serif">${escXml(v.label)}</text>`;
    }).join('');

    return `
      <text x="24" y="${y0 + 16}" fill="${VB_BLACK}" font-size="13" font-weight="700" font-family="'Noto Sans KR',sans-serif">${escXml(block.keyword)} <tspan fill="#7A808C" font-weight="400" font-size="11">${escXml(block.enCopy)}</tspan></text>
      ${candsSvg}
      ${variantsSvg}`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}pt" height="${totalH}pt" viewBox="0 0 ${totalW} ${totalH}">
  <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#FFFFFF"/>
  ${rowsSvg}
</svg>`;
}

export { buildIllustratorAiBlob };
