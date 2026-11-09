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

  scored.sort((a, b) => (b.isLearned - a.isLearned) || (b.score - a.score) || (a.complexity - b.complexity));
  const poolSize = Math.min(scored.length, 72);
  const topPool = scored.slice(0, poolSize);

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

  for (const item of rotated) {
    if (picked.length >= 12) break;
    if (!picked.includes(item)) picked.push(item);
  }

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
 * 모티프별 4단계 복잡도(1단계 심플 ~ 4단계 컴플렉스) 프리셋 & 스마트 클러스터링 엔진
 */
function getIconFromIndexOrFallback(indexData, name, fallbackSvg = '') {
  const icons = indexData?.icons || [];
  const found = icons.find(i => i[0] === name) || icons.find(i => i[0].includes(name));
  if (found) {
    const [n, setCode, tagStr, innerSvg, comp] = found;
    return {
      id: `${setCode}:${n}`,
      name: n,
      setCode,
      setName: setCode === 'L' ? 'Lucide' : setCode === 'T' ? 'Tabler Outline' : 'Tabler Filled',
      innerSvg: fallbackSvg || innerSvg,
      complexity: comp || 10,
    };
  }
  return {
    id: `custom:${name}`,
    name,
    setCode: 'T',
    setName: 'VB Master Icon',
    innerSvg: fallbackSvg || '<circle cx="12" cy="12" r="9"/>',
    complexity: 12,
  };
}

const WELLNESS_MOTIF_PRESETS = [
  {
    keys: ['수면', '숙면', '잠', '밤', '나이트', 'sleep', 'night', '가바', '멜라토닌'],
    enCopy: 'good sleep',
    motifs: [
      {
        id: 'moon',
        title: '달 (Moon)',
        enTitle: 'Moon & Night Sky',
        levels: [
          { level: 1, label: '1단계 심플', desc: '초승달 미니멀 실루엣 라인', customSvg: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '초승달 + 반짝이는 별 포인트 추가', customSvg: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v3M20.5 4.5h-3"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '초승달 + 별 2개 + 몽환적인 밤구름 결합', customSvg: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 2v3M20.5 3.5h-3"/><path d="M4 19a3 3 0 0 1 3-3h1.5a3.5 3.5 0 0 1 6.8 0H16a3 3 0 0 1 0 6H7a3 3 0 0 1-3-3Z"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '초승달 + 별무리 + 밤구름 + 온화하게 잠든 미소 표정', customSvg: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 2v3M20.5 3.5h-3"/><path d="M4 19a3 3 0 0 1 3-3h1.5a3.5 3.5 0 0 1 6.8 0H16a3 3 0 0 1 0 6H7a3 3 0 0 1-3-3Z"/><path d="M7.8 11.5c.3.3.7.3 1 0M11 11.5c.3.3.7.3 1 0"/><path d="M9.2 14c.6.4 1.4.4 2 0"/><circle cx="21" cy="9" r="0.6" fill="currentColor"/>' },
        ],
      },
      {
        id: 'bed',
        title: '침대 (Bed)',
        enTitle: 'Comfort Bed',
        levels: [
          { level: 1, label: '1단계 심플', desc: '침대 기본 프레임 미니멀 실루엣', customSvg: '<path d="M2 18v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 14h20M2 18h20"/>' },
          { level: 2, label: '2단계 베이직', desc: '침대 프레임 + 푹신한 베개와 이불 라인 추가', customSvg: '<path d="M2 18v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 14h20M2 18h20"/><rect x="4" y="6" width="6" height="4" rx="1.5"/><path d="M10 14v-4h10v4"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '침대 + 베개 & 이불 + 은은한 침실 스탠드 조명 추가', customSvg: '<path d="M2 18v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 14h20M2 18h20"/><rect x="4" y="6" width="6" height="4" rx="1.5"/><path d="M10 14v-4h10v4"/><path d="M19 2v4M17 6h4"/><circle cx="19" cy="4" r="1.5" fill="none" stroke="currentColor"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '침대 + 베개 & 이불 + 조명 + 별빛과 Zzz 수면 파동', customSvg: '<path d="M2 18v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 14h20M2 18h20"/><rect x="4" y="6" width="6" height="4" rx="1.5"/><path d="M10 14v-4h10v4"/><path d="M19 2v4M17 6h4"/><circle cx="19" cy="4" r="1.5" fill="none" stroke="currentColor"/><path d="M13 3h2l-2 3h2M15 1h1.5l-1.5 2h1.5"/><path d="M7 2v2M8 3H6"/>' },
        ],
      },
      {
        id: 'star',
        title: '별 (Stars & Night Aura)',
        enTitle: 'Night Stars & Glow',
        levels: [
          { level: 1, label: '1단계 심플', desc: '단일 4-포인트 스파클 별 라인', customSvg: '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '중심 별 + 상단 2차 반짝이 별 추가', customSvg: '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/><path d="M19 3v3M20.5 4.5h-3"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '중심 별 + 다중 보조 별 + 방사형 빛의 코어 링', customSvg: '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/><path d="M19 2v3M20.5 3.5h-3"/><path d="M4 18v3M5.5 19.5h-3"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-dasharray="1 1.5"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '중심 별 + 다중 보조 별 + 초승달 헤일로 오라와 은하수 스타더스트', customSvg: '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/><path d="M19 2v3M20.5 3.5h-3"/><path d="M4 18v3M5.5 19.5h-3"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-dasharray="1 1.5"/><path d="M18 16a4 4 0 0 1-4 4 4.5 4.5 0 0 0 4-4Z"/><circle cx="7" cy="6" r="0.75" fill="currentColor"/><circle cx="17" cy="19" r="0.75" fill="currentColor"/>' },
        ],
      },
      {
        id: 'face',
        title: '자는 얼굴 (Sleep Face)',
        enTitle: 'Sleep Face & Relax',
        levels: [
          { level: 1, label: '1단계 심플', desc: '눈을 감은 두 눈과 평온한 미소 라인', customSvg: '<path d="M8 12c.5.5 1.5.5 2 0M14 12c.5.5 1.5.5 2 0"/><path d="M10 16c.8.6 2.2.6 3 0"/>' },
          { level: 2, label: '2단계 베이직', desc: '잠든 눈/미소 + 얼굴 원형 윤곽 결합', customSvg: '<circle cx="12" cy="12" r="9"/><path d="M8 12c.5.5 1.5.5 2 0M14 12c.5.5 1.5.5 2 0"/><path d="M10 16c.8.6 2.2.6 3 0"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '얼굴 윤곽 + 잠든 눈/미소 + 피어오르는 Zzz 수면 기호', customSvg: '<circle cx="12" cy="12" r="9"/><path d="M8 12c.5.5 1.5.5 2 0M14 12c.5.5 1.5.5 2 0"/><path d="M10 16c.8.6 2.2.6 3 0"/><path d="M18 4h2.5l-2.5 3h2.5M20 2h1.5l-1.5 2h1.5"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '얼굴 윤곽 + Zzz + 포근한 구름 베개와 별빛 반짝임', customSvg: '<circle cx="12" cy="12" r="9"/><path d="M8 12c.5.5 1.5.5 2 0M14 12c.5.5 1.5.5 2 0"/><path d="M10 16c.8.6 2.2.6 3 0"/><path d="M18 4h2.5l-2.5 3h2.5M20 2h1.5l-1.5 2h1.5"/><path d="M3 17a3 3 0 0 1 3-2h2a3 3 0 0 1 5 0h2a3 3 0 0 1 0 4H5a3 3 0 0 1-2-2Z"/><path d="M5 5v2M6 6H4"/>' },
        ],
      },
    ],
  },
  {
    keys: ['콜라겐', '피부', '탄력', '뷰티', 'collagen', 'inner beauty', '히알루론산', '엘라스틴'],
    enCopy: 'inner beauty',
    motifs: [
      {
        id: 'droplet',
        title: '수분 물방울 (Hydra Drop)',
        enTitle: 'Skin Hydration Drop',
        levels: [
          { level: 1, label: '1단계 심플', desc: '단일 수분 물방울 클린 라인', customSvg: '<path d="M12 2.5 C12 2.5 5 11 5 16 a7 7 0 0 0 14 0 C19 11 12 2.5 12 2.5 Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '물방울 + 내부 수분 광채 하이라이트 곡선', customSvg: '<path d="M12 2.5 C12 2.5 5 11 5 16 a7 7 0 0 0 14 0 C19 11 12 2.5 12 2.5 Z"/><path d="M9 13.5 a4 4 0 0 0 3 3"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '물방울 + 하이라이트 + 피부 흡수 수분 파동 링', customSvg: '<path d="M12 2.5 C12 2.5 5 11 5 16 a7 7 0 0 0 14 0 C19 11 12 2.5 12 2.5 Z"/><path d="M9 13.5 a4 4 0 0 0 3 3"/><path d="M2 19c3-1.5 7-1.5 10 0s7 1.5 10 0M4 22c2.5-1 5.5-1 8 0s5.5 1 8 0"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '물방울 + 파동 + 반짝이는 다이아몬드 광채 스파클 3개', customSvg: '<path d="M12 2.5 C12 2.5 5 11 5 16 a7 7 0 0 0 14 0 C19 11 12 2.5 12 2.5 Z"/><path d="M9 13.5 a4 4 0 0 0 3 3"/><path d="M2 19c3-1.5 7-1.5 10 0s7 1.5 10 0M4 22c2.5-1 5.5-1 8 0s5.5 1 8 0"/><path d="M18 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/><path d="M5 8l.7 1.3 1.3.7-1.3.7-.7 1.3-.7-1.3-1.3-.7 1.3-.7Z"/>' },
        ],
      },
      {
        id: 'glow',
        title: '광채 스타 (Skin Radiance)',
        enTitle: 'Radiant Glow',
        levels: [
          { level: 1, label: '1단계 심플', desc: '단일 광채 스파클 별 실루엣', customSvg: '<path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '스파클 + 내부 원형 래디언스 코어', customSvg: '<path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '스파클 + 코어 + 4방향 대각 광채 빔 광선', customSvg: '<path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor"/><path d="M6 6 L8 8 M18 6 L16 8 M6 18 L8 16 M18 18 L16 16"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '스파클 + 코어 + 광채 빔 + 진피 탄력 펄 파티클 오라', customSvg: '<path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor"/><path d="M6 6 L8 8 M18 6 L16 8 M6 18 L8 16 M18 18 L16 16"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-dasharray="1.2 2"/><circle cx="4" cy="5" r="0.8" fill="currentColor"/><circle cx="20" cy="19" r="0.8" fill="currentColor"/>' },
        ],
      },
      {
        id: 'capsule',
        title: '탄력 캡슐 (Elasticity Capsule)',
        enTitle: 'Collagen Bio Capsule',
        levels: [
          { level: 1, label: '1단계 심플', desc: '이중 바이오 캡슐 외곽 라인', customSvg: '<rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-30 12 12)"/>' },
          { level: 2, label: '2단계 베이직', desc: '캡슐 + 중앙 2중 분할 밴드 라인', customSvg: '<rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-30 12 12)"/><line x1="12" y1="5.5" x2="12" y2="18.5" stroke="currentColor"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '캡슐 + 분할 밴드 + 펩타이드 비즈 파티클', customSvg: '<rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-30 12 12)"/><line x1="12" y1="5.5" x2="12" y2="18.5" stroke="currentColor"/><circle cx="8.5" cy="12" r="1" fill="currentColor"/><circle cx="15.5" cy="12" r="1" fill="currentColor"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '캡슐 + 비즈 + 진피 흡수 보호 링 및 생기 스파크', customSvg: '<rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-30 12 12)"/><line x1="12" y1="5.5" x2="12" y2="18.5" stroke="currentColor"/><circle cx="8.5" cy="12" r="1" fill="currentColor"/><circle cx="15.5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-dasharray="1.5 2"/><path d="M19 3l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1Z"/>' },
        ],
      },
    ],
  },
  {
    keys: ['다이어트', '슬리밍', '체지방', '더블컷', '체중', 'diet', 'slim', '카테킨', '가르시니아'],
    enCopy: 'slim double cut',
    motifs: [
      {
        id: 'waist',
        title: '웨이스트 더블컷 (Waistline Cut)',
        enTitle: 'Body Slimline Cut',
        levels: [
          { level: 1, label: '1단계 심플', desc: '슬림 웨이스트 모래시계 라인', customSvg: '<path d="M7 3 C10 8 10 16 7 21 M17 3 C14 8 14 16 17 21"/>' },
          { level: 2, label: '2단계 베이직', desc: '웨이스트 라인 + 허리 측정 테이프 라인 추가', customSvg: '<path d="M7 3 C10 8 10 16 7 21 M17 3 C14 8 14 16 17 21"/><path d="M9 12h6M9.5 10v4M14.5 10v4"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '웨이스트 + 테이프 + 체지방 감소 하향 더블컷 화살표', customSvg: '<path d="M7 3 C10 8 10 16 7 21 M17 3 C14 8 14 16 17 21"/><path d="M9 12h6M9.5 10v4M14.5 10v4"/><path d="M12 7v10M9.5 14.5L12 17l2.5-2.5"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '웨이스트 + 테이프 + 더블컷 + 활력 대사 스파크 & 핏 가이드', customSvg: '<path d="M7 3 C10 8 10 16 7 21 M17 3 C14 8 14 16 17 21"/><path d="M9 12h6M9.5 10v4M14.5 10v4"/><path d="M12 7v10M9.5 14.5L12 17l2.5-2.5"/><path d="M19 4l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1Z"/><path d="M5 18l.8 1.2 1.2.8-1.2.8-.8 1.2-.8-1.2-1.2-.8 1.2-.8Z"/>' },
        ],
      },
      {
        id: 'leaf',
        title: '카테킨 녹차 잎 (Catechin Leaf)',
        enTitle: 'Botanical Catechin Leaf',
        levels: [
          { level: 1, label: '1단계 심플', desc: '단일 녹차 잎 미니멀 외곽선', customSvg: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '녹차 잎 + 중앙 주맥 및 측맥 엽맥 디테일', customSvg: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '녹차 잎 + 엽맥 + 맑은 이슬 물방울 포인트', customSvg: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/><circle cx="15" cy="8" r="1.5" fill="none" stroke="currentColor"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '녹차 잎 + 엽맥 + 이슬 + 카테킨 대사 순환 바이오 링', customSvg: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/><circle cx="15" cy="8" r="1.5" fill="none" stroke="currentColor"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-dasharray="1.5 2"/><path d="M21 11l-1 2 2 0Z"/>' },
        ],
      },
      {
        id: 'flame',
        title: '대사 버닝 (Metabolic Flame)',
        enTitle: 'Calorie Metabolic Burn',
        levels: [
          { level: 1, label: '1단계 심플', desc: '칼로리 연소 불꽃 외곽 실루엣', customSvg: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>' },
          { level: 2, label: '2단계 베이직', desc: '불꽃 + 내부 2중 코어 불꽃 라인', customSvg: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 18a2 2 0 0 0 2-2c0-.8-.4-1.3-.7-1.8-.7-1.2-.1-2.2 1.2-3.2"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '불꽃 + 코어 + 신진대사 순환 화살표 루프', customSvg: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 18a2 2 0 0 0 2-2c0-.8-.4-1.3-.7-1.8-.7-1.2-.1-2.2 1.2-3.2"/><path d="M3 12a9 9 0 0 1 18 0" stroke-dasharray="2 2"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '불꽃 + 코어 + 순환 루프 + 생체 에너지 볼트 번개 스파크', customSvg: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 18a2 2 0 0 0 2-2c0-.8-.4-1.3-.7-1.8-.7-1.2-.1-2.2 1.2-3.2"/><path d="M3 12a9 9 0 0 1 18 0" stroke-dasharray="2 2"/><path d="M13 2l-3 4h3l-2 4"/>' },
        ],
      },
    ],
  },
  {
    keys: ['유산균', '프로바이오틱스', '장건강', '바이옴', 'probiotics', 'gut'],
    enCopy: 'probiotics care',
    motifs: [
      {
        id: 'shield',
        title: '장 바이옴 쉴드 (Gut Bio Shield)',
        enTitle: 'Microbiome Shield',
        levels: [
          { level: 1, label: '1단계 심플', desc: '바이오 보호 쉴드 외곽선', customSvg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
          { level: 2, label: '2단계 베이직', desc: '쉴드 + 중앙 유익균 인증 체크마크', customSvg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '쉴드 + 체크마크 + 장내 유익균 군집 도트', customSvg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '쉴드 + 체크 + 군집 + 360도 장벽 방어막 펄스 링', customSvg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-dasharray="1.5 2"/>' },
        ],
      },
      {
        id: 'microbe',
        title: '유익균 활성 (Beneficial Microbes)',
        enTitle: 'Active Probiotics',
        levels: [
          { level: 1, label: '1단계 심플', desc: '유익 간균 단일 외곽 실루엣', customSvg: '<rect x="6" y="8" width="12" height="8" rx="4"/>' },
          { level: 2, label: '2단계 베이직', desc: '간균 + 2차 활성 분열 분기선', customSvg: '<rect x="6" y="8" width="12" height="8" rx="4"/><line x1="12" y1="8" x2="12" y2="16" stroke="currentColor"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '유익균 + 장내 증식 바이오 활성 파동', customSvg: '<rect x="6" y="8" width="12" height="8" rx="4"/><line x1="12" y1="8" x2="12" y2="16" stroke="currentColor"/><path d="M2 12h2M20 12h2M12 2v2M12 20v2"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '유익균 + 활성 파동 + 장 건강 쾌변 스마일 & 바이옴 스파클', customSvg: '<rect x="6" y="8" width="12" height="8" rx="4"/><line x1="12" y1="8" x2="12" y2="16" stroke="currentColor"/><path d="M2 12h2M20 12h2M12 2v2M12 20v2"/><path d="M9 11c.5.5 1 .5 1.5 0M13.5 11c.5.5 1 .5 1.5 0"/><path d="M18 4l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1Z"/>' },
        ],
      },
    ],
  },
  {
    keys: ['비타민', '활력', '에너지', '피로', 'vitamin', 'energy', '레티놀', '항산화'],
    enCopy: 'vital vitamin',
    motifs: [
      {
        id: 'sun',
        title: '시트러스 썬 (Citrus Sun)',
        enTitle: 'Solar Vitamin C',
        levels: [
          { level: 1, label: '1단계 심플', desc: '태양 코어 원 미니멀 윤곽', customSvg: '<circle cx="12" cy="12" r="5"/>' },
          { level: 2, label: '2단계 베이직', desc: '태양 코어 + 8방향 비타민 에너지 광선', customSvg: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '태양 + 광선 + 내부 시트러스 과육 휠 섹션', customSvg: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M12 7v10M7 12h10"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '태양 + 광선 + 시트러스 휠 + 세포 활력 스파크 & 오라', customSvg: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M12 7v10M7 12h10"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-dasharray="1 1.5"/><circle cx="19" cy="6" r="0.8" fill="currentColor"/>' },
        ],
      },
      {
        id: 'bolt',
        title: '바이탈 에너지 볼트 (Vital Energy Bolt)',
        enTitle: 'Energy Power Pulse',
        levels: [
          { level: 1, label: '1단계 심플', desc: '에너지 번개 볼트 클린 라인', customSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
          { level: 2, label: '2단계 베이직', desc: '번개 볼트 + 심장 박동 바이탈 펄스 라인', customSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><path d="M1 18h4l2-3 2 6 2-3h4"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '번개 + 펄스 + 원형 파워 충전 게이지 링', customSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><path d="M1 18h4l2-3 2 6 2-3h4"/><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-dasharray="2 2"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '번개 + 펄스 + 게이지 + 항산화 방어막 스파클 버스트', customSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><path d="M1 18h4l2-3 2 6 2-3h4"/><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-dasharray="2 2"/><path d="M19 3l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1Z"/><circle cx="4" cy="5" r="0.8" fill="currentColor"/>' },
        ],
      },
    ],
  },
  {
    keys: ['간', '밀크씨슬', '실리마린', '디톡스', 'liver', 'detox'],
    enCopy: 'liver detox',
    motifs: [
      {
        id: 'thistle',
        title: '밀크씨슬 (Milk Thistle)',
        enTitle: 'Milk Thistle Flower',
        levels: [
          { level: 1, label: '1단계 심플', desc: '밀크씨슬 엉겅퀴 꽃 실루엣', customSvg: '<path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '엉겅퀴 꽃 + 받침잎 가시 꽃받침 디테일', customSvg: '<path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4Z"/><path d="M8 12c-2 0-3 2-3 4s3 2 7 2 7 0 7-2-1-4-3-4"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '꽃 + 꽃받침 + 실리마린 활성 에센스 드롭', customSvg: '<path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4Z"/><path d="M8 12c-2 0-3 2-3 4s3 2 7 2 7 0 7-2-1-4-3-4"/><circle cx="12" cy="20" r="1.5" fill="none" stroke="currentColor"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '꽃 + 꽃받침 + 에센스 + 간 보호 바이탈 쉴드 오라', customSvg: '<path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4Z"/><path d="M8 12c-2 0-3 2-3 4s3 2 7 2 7 0 7-2-1-4-3-4"/><circle cx="12" cy="20" r="1.5" fill="none" stroke="currentColor"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-dasharray="1.5 2"/><path d="M19 4l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1Z"/>' },
        ],
      },
    ],
  },
  {
    keys: ['눈', '루테인', '지아잔틴', '시력', 'eye', 'vision', '트루아이'],
    enCopy: 'eye macular care',
    motifs: [
      {
        id: 'eye',
        title: '맑은 눈 / 시야 (Clear Eye)',
        enTitle: 'Clear Vision',
        levels: [
          { level: 1, label: '1단계 심플', desc: '부드러운 안구 아몬드 외곽선', customSvg: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '안구 + 중심 동공 및 홍채 원형 링', customSvg: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '안구 + 홍채 + 루테인 황반 포커스 십자선', customSvg: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="7" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="17"/><line x1="7" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="17" y2="12"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '안구 + 홍채 + 포커스 + 맑은 수분 드롭 & 비전 샤인', customSvg: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="7" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="17"/><line x1="7" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="17" y2="12"/><path d="M19 4l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1Z"/><circle cx="19" cy="18" r="1" fill="currentColor"/>' },
        ],
      },
    ],
  },
  {
    keys: ['혈당', '당케어', '바나바잎', '난소화성', 'glucose', 'sugar'],
    enCopy: 'blood sugar cut',
    motifs: [
      {
        id: 'banaba',
        title: '바나바 더블컷 (Banaba Cut)',
        enTitle: 'Carb Glucose Cut',
        levels: [
          { level: 1, label: '1단계 심플', desc: '바나바 잎 실루엣 미니멀 라인', customSvg: '<path d="M12 2C6.5 2 4 8 4 14c0 5 4 8 8 8s8-3 8-8c0-6-2.5-12-8-12Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '바나바 잎 + 식후 탄수화물 대각 컷팅 슬래시', customSvg: '<path d="M12 2C6.5 2 4 8 4 14c0 5 4 8 8 8s8-3 8-8c0-6-2.5-12-8-12Z"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="1.8"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '잎 + 슬래시 + 균형 잡힌 당 밸런스 저울 빔', customSvg: '<path d="M12 2C6.5 2 4 8 4 14c0 5 4 8 8 8s8-3 8-8c0-6-2.5-12-8-12Z"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="1.8"/><path d="M6 12h12M9 12v3M15 12v3"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '잎 + 슬래시 + 저울 + 안정된 혈당 수치 웨이브 라인', customSvg: '<path d="M12 2C6.5 2 4 8 4 14c0 5 4 8 8 8s8-3 8-8c0-6-2.5-12-8-12Z"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="1.8"/><path d="M6 12h12M9 12v3M15 12v3"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-dasharray="1.5 2"/>' },
        ],
      },
    ],
  },
  {
    keys: ['홍삼', '인삼', '진생', '명작수', 'ginseng', 'immunity'],
    enCopy: 'ginseng heritage',
    motifs: [
      {
        id: 'ginseng',
        title: '진생 루트 (Ginseng Root)',
        enTitle: 'Royal Ginseng Root',
        levels: [
          { level: 1, label: '1단계 심플', desc: '홍삼 몸통 주근 미니멀 실루엣', customSvg: '<path d="M12 4c-2 0-4 3-4 7 0 5 2 9 4 11 2-2 4-6 4-11 0-4-2-7-4-7Z"/>' },
          { level: 2, label: '2단계 베이직', desc: '홍삼 주근 + 미세 잔뿌리 분기선 추가', customSvg: '<path d="M12 4c-2 0-4 3-4 7 0 5 2 9 4 11 2-2 4-6 4-11 0-4-2-7-4-7Z"/><path d="M9 14c-2 1-3 3-3 5M15 14c2 1 3 3 3 5"/>' },
          { level: 3, label: '3단계 스탠다드', desc: '홍삼 + 잔뿌리 + 상단 붉은 진생베리 열매 송이', customSvg: '<path d="M12 4c-2 0-4 3-4 7 0 5 2 9 4 11 2-2 4-6 4-11 0-4-2-7-4-7Z"/><path d="M9 14c-2 1-3 3-3 5M15 14c2 1 3 3 3 5"/><circle cx="10" cy="3" r="1.2" fill="currentColor"/><circle cx="14" cy="3" r="1.2" fill="currentColor"/><circle cx="12" cy="1.5" r="1.2" fill="currentColor"/>' },
          { level: 4, label: '4단계 컴플렉스', desc: '홍삼 + 잔뿌리 + 베리 + 프리미엄 면역 골든 쉴드 테두리', customSvg: '<path d="M12 4c-2 0-4 3-4 7 0 5 2 9 4 11 2-2 4-6 4-11 0-4-2-7-4-7Z"/><path d="M9 14c-2 1-3 3-3 5M15 14c2 1 3 3 3 5"/><circle cx="10" cy="3" r="1.2" fill="currentColor"/><circle cx="14" cy="3" r="1.2" fill="currentColor"/><circle cx="12" cy="1.5" r="1.2" fill="currentColor"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor"/>' },
        ],
      },
    ],
  },
];

/**
 * 키워드에 대해 여러 가지 버전의 모티프(예: 수면 -> 달, 침대, 별, 자는 얼굴 등)를 제안하고,
 * 각 모티프마다 바툴 슬라이더로 1단계(심플) ~ 4단계(컴플렉스) 복잡도를 즉시 조절할 수 있도록 번들링
 */
export function searchMotifClusters(indexData, rawKeyword) {
  const kw = (rawKeyword || '수면').trim();
  const lower = kw.toLowerCase();

  // 1. 사전 정의된 글로벌 건강기능식품·일반식품 모티프 매칭 확인
  for (const preset of WELLNESS_MOTIF_PRESETS) {
    if (preset.keys.some(k => lower === k || lower.includes(k) || k.includes(lower))) {
      const hydratedMotifs = preset.motifs.map(m => ({
        id: m.id,
        title: m.title,
        enTitle: m.enTitle,
        currentLevel: 1,
        levels: m.levels.map(lvl => ({
          level: lvl.level,
          label: lvl.label,
          desc: lvl.desc,
          icon: {
            id: `motif:${m.id}:lvl${lvl.level}`,
            name: `${m.id}-lvl${lvl.level}`,
            setCode: 'T',
            setName: 'VB Progressive Motif',
            innerSvg: lvl.customSvg,
            complexity: lvl.level * 4,
          },
        })),
      }));
      return {
        keyword: kw,
        enCopy: preset.enCopy,
        motifs: hydratedMotifs,
      };
    }
  }

  // 2. 사전에 없는 경우 글로벌 인덱스 검색 결과로부터 3개 모티프 동적 생성
  // (동일한 베이스 디자인에 1~4단계 디테일이 누적 추가되는 원칙 100% 적용)
  const searchRes = searchCandidateIcons(indexData, kw, 0);
  const candidates = searchRes.candidates;

  const base1 = candidates[0] || { name: kw, innerSvg: '<circle cx="12" cy="12" r="9"/>' };
  const base2 = candidates[4] || candidates[1] || base1;
  const base3 = candidates[8] || candidates[2] || base1;

  const makeCumulativeLevels = (baseIcon, baseName) => {
    const rawSvg = baseIcon.innerSvg || '<circle cx="12" cy="12" r="9"/>';
    return [
      {
        level: 1,
        label: '1단계 심플',
        desc: `${baseName} 간결한 미니멀 실루엣 라인`,
        icon: { ...baseIcon, innerSvg: rawSvg },
      },
      {
        level: 2,
        label: '2단계 베이직',
        desc: `${baseName} 기본 실루엣 + 반짝이 별 포인트 추가`,
        icon: { ...baseIcon, innerSvg: `${rawSvg}<path d="M19 3v3M20.5 4.5h-3"/>` },
      },
      {
        level: 3,
        label: '3단계 스탠다드',
        desc: `${baseName} 실루엣 + 보조 별 + 바이오 에너지 링 추가`,
        icon: { ...baseIcon, innerSvg: `${rawSvg}<path d="M19 2v3M20.5 3.5h-3"/><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-dasharray="1.5 2"/>` },
      },
      {
        level: 4,
        label: '4단계 컴플렉스',
        desc: `${baseName} 실루엣 + 별무리 + 에너지 링 + 활력 스파클 오라`,
        icon: { ...baseIcon, innerSvg: `${rawSvg}<path d="M19 2v3M20.5 3.5h-3"/><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-dasharray="1.5 2"/><path d="M4 19l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1Z"/><circle cx="5" cy="5" r="0.8" fill="currentColor"/>` },
      },
    ];
  };

  return {
    keyword: kw,
    enCopy: searchRes.enCopy,
    motifs: [
      {
        id: 'motif-1',
        title: `모티프 1 · ${base1.name || kw}`,
        enTitle: `${searchRes.enCopy} Core`,
        currentLevel: 1,
        levels: makeCumulativeLevels(base1, base1.name || kw),
      },
      {
        id: 'motif-2',
        title: `모티프 2 · ${base2.name || '보조 심볼'}`,
        enTitle: `${searchRes.enCopy} Variant`,
        currentLevel: 1,
        levels: makeCumulativeLevels(base2, base2.name || '보조 심볼'),
      },
      {
        id: 'motif-3',
        title: `모티프 3 · ${base3.name || '확장 심볼'}`,
        enTitle: `${searchRes.enCopy} Extended`,
        currentLevel: 1,
        levels: makeCumulativeLevels(base3, base3.name || '확장 심볼'),
      },
    ],
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
