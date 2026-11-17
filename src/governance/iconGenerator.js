/* ═══════════════════════════════════════════════════════════════════════════
   VITALBEAUTIE Icon Generator Engine
   - Lucide (ISC) + Tabler Outline/Filled (MIT) 8,281개 글로벌 아이콘 인덱스 검색
   - 한/영 시맨틱 사전 (웰니스·건강·뷰티·원료·신체·자연·과학·일상 전 영역)
   - 복잡도(Complexity) 기반 12단계 후보 정렬 (심플 → 베이직 → 스탠다드 → 디테일 → 컴플렉스)
   - 바이탈뷰티 6종 배지/아이콘 스타일 재가공 (모든 아이콘 기본 VITALBEAUTIE BLACK #101820)
   - 단일 30×30mm .ai 및 전체 아트보드 .ai / .svg 벡터 출력
   ═══════════════════════════════════════════════════════════════════════════ */
import { buildIllustratorAiBlob } from './engines.js';
import { EXTRA_WELLNESS_MOTIF_PRESETS } from '../data/wellnessMotifsExtra.js';
import { BG, LIB_SVGS, CORNER_BADGES, MASTER_CRESTS, withCornerBadge, withCrestAndBadge } from '../data/iconCraftComposers.js';

const VB_BLACK = '#101820';
const LEARNED_STORAGE_KEY = 'vb_icon_generator_learned_v1';

let iconIndexCache = null;
let iconIndexPromise = null;

export async function loadIconIndex() {
  if (iconIndexCache && iconIndexCache.icons && iconIndexCache.icons.length > 0) return iconIndexCache;
  if (!iconIndexPromise) {
    const tryPaths = [
      './assets/icons/icon-index.json',
      '/assets/icons/icon-index.json',
    ];
    iconIndexPromise = (async () => {
      for (const p of tryPaths) {
        try {
          const r = await fetch(p);
          if (r.ok) {
            const data = await r.json();
            if (data && Array.isArray(data.icons) && data.icons.length > 0) {
              iconIndexCache = data;
              return data;
            }
          }
        } catch {
          // try next path
        }
      }
      iconIndexCache = { sets: { L: 'Lucide (ISC)', T: 'Tabler Outline (MIT)', F: 'Tabler Filled (MIT)' }, icons: [] };
      return iconIndexCache;
    })();
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

  // 1) 정확 또는 부분 일치 시맨틱 사전 검색 (단일 글자 키 오매칭 방지)
  const matchedTerms = [];
  let enCopy = '';

  for (const entry of KO_SEMANTIC_DICT) {
    if (entry.ko.some(k => lower === k || (k.length >= 2 && lower.includes(k)) || (lower.length >= 2 && k.includes(lower)))) {
      if (!enCopy) enCopy = entry.en;
      matchedTerms.push(...entry.terms);
    }
  }

  // 2) 단일 단어 사전 매칭 (1글자 단어는 정확 일치 시에만 매칭하여 '포도'->'포', '유전자'->'자' 오매칭 차단)
  for (const [koWord, enWord] of Object.entries(KO_WORD_MAP)) {
    if (lower === koWord || (koWord.length >= 2 && lower.includes(koWord))) {
      if (!enCopy) enCopy = enWord.replace(/-/g, ' ');
      matchedTerms.unshift(enWord);
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
      ['leaf', 'droplet', 'sparkles', 'heart', 'shield', 'sun', 'flower', 'star', 'award', 'gem', 'crown'],
      ['sprout', 'apple', 'citrus', 'flame', 'zap', 'waves', 'wind', 'cloud', 'trees', 'compass', 'target'],
      ['dna', 'atom', 'activity', 'heart-pulse', 'brain', 'eye', 'flask-conical', 'microscope', 'feather', 'infinity'],
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
 * 매칭 점수가 가장 높은 대표 아이콘을 우선 추출한다.
 */
export function searchCandidateIcons(indexData, rawKeyword, offsetPage = 0) {
  const { raw, enCopy, terms } = resolveKeywordSearchTerms(rawKeyword);
  const icons = indexData?.icons || [];
  const learned = getLearnedPreferences()[raw.toLowerCase()];

  const scored = [];
  for (let i = 0; i < icons.length; i++) {
    const [name, setCode, tagStr, innerSvg, comp] = icons[i];
    if (setCode === 'F') continue; // 바이탈뷰티 라인 배지 통일성을 위해 라인(Outline) 아이콘만 선별
    const id = `${setCode}:${name}`;
    const nameLower = name.toLowerCase();
    const tagsLower = tagStr.toLowerCase();

    let score = 0;
    for (let tIdx = 0; tIdx < terms.length; tIdx++) {
      const term = terms[tIdx];
      const priorityWeight = Math.max(1, 12 - tIdx * 2);
      if (nameLower === term) score += 80 * priorityWeight;
      else if (nameLower.startsWith(term + '-') || nameLower.endsWith('-' + term)) score += 32 * priorityWeight;
      else if (nameLower.includes(term)) score += 14 * priorityWeight;
      else if (tagsLower.split('|').includes(term)) score += 10 * priorityWeight;
      else if (tagsLower.includes(term)) score += 3 * priorityWeight;
    }

    if (score > 0 && !nameLower.endsWith('-off')) {
      if (setCode === 'L' || setCode === 'T') score += 6;
      scored.push({
        id,
        name,
        setCode,
        setName: setCode === 'L' ? 'Lucide' : 'Tabler Outline',
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
    if (usedNames.has(item.name) && rotated.length > 12) continue;
    usedNames.add(item.name);
    picked.push(item);
    if (picked.length === 12) break;
  }

  for (const item of rotated) {
    if (picked.length >= 12) break;
    if (!picked.includes(item)) picked.push(item);
  }

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

/**
 * 바이탈뷰티 아이콘 레이어 아키텍처 원칙 (전 모티프 & 동적 생성 공통 엔진):
 * 1. 비간섭 영역 분리 (Spatial Zone Separation):
 *    Lv.1(심플) → Lv.2(베이직) → Lv.3(스탠다드) → Lv.4(컴플렉스)로 갈 때
 *    추가되는 보조 요소(별, 파동, 스파클, 리본, 오라 등)는 메인 모티프와 선이 교차하지 않는 독립 좌표 구역에 배치한다.
 * 2. 전면 레이어 속공간 비움 (Front-Layer Knockout Occlusion):
 *    공간이 좁아 배경 요소(점선 오라 링, 배경 구름, 후면 캡슐, 후면 쉴드 등)와 겹쳐야 하는 경우,
 *    배경 레이어를 먼저 그리고 맨 앞에 오는 전면 레이어에 반드시 `fill="var(--vb-icon-bg, #FFFFFF)"`를 부여하여
 *    전면 레이어의 속공간을 깨끗하게 비워 뒤쪽 선이 비치지 않도록 처리한다.
 */
const WELLNESS_MOTIF_PRESETS = [
  {
    keys: ['수면', '숙면', '잠', '밤', '나이트', 'sleep', 'night', '가바', '멜라토닌', '락티움'],
    enCopy: 'good sleep',
    motifs: [
      {
        id: 'moon',
        title: '달 (Moon)',
        enTitle: 'Moon & Night Sky',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '초승달 미니멀 실루엣 라인',
            customSvg: '<path d="M12.5 3a6.2 6.2 0 0 0 8.5 8.5 8.5 8.5 0 1 1-8.5-8.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '초승달 + 상단 독립 구역 반짝이는 별 포인트 추가',
            customSvg: '<path d="M12.5 3a6.2 6.2 0 0 0 8.5 8.5 8.5 8.5 0 1 1-8.5-8.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M19 2.5v3M20.5 4h-3"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '후면 초승달 + 전면 밤구름 (구름 내부 속공간 비움으로 뒤쪽 달 선 가림)',
            customSvg: '<path d="M12 2.5a5.8 5.8 0 0 0 8 8 8 8 0 1 1-8-8Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M19.5 2v2.6M20.8 3.3h-2.6"/><path d="M17.5 20.5H8.2a4.2 4.2 0 0 1-.4-8.4 4.8 4.8 0 0 1 9.1-1.2 3.6 3.6 0 0 1 .6 9.6Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 초승달(평온한 눈) + 별무리 + 전면 밤구름 (전면 구름 속공간 비움)',
            customSvg: '<path d="M12 2.5a5.8 5.8 0 0 0 8 8 8 8 0 1 1-8-8Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M9.2 9.2c.5.5 1.3.5 1.8 0"/><path d="M19.5 2v2.6M20.8 3.3h-2.6"/><circle cx="21" cy="7.2" r="0.65" fill="currentColor" stroke="none"/><circle cx="4.2" cy="6.5" r="0.65" fill="currentColor" stroke="none"/><path d="M17.5 20.5H8.2a4.2 4.2 0 0 1-.4-8.4 4.8 4.8 0 0 1 9.1-1.2 3.6 3.6 0 0 1 .6 9.6Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
        ],
      },
      {
        id: 'bed',
        title: '침대 (Bed)',
        enTitle: 'Comfort Bed',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '침대 기본 프레임 미니멀 실루엣',
            customSvg: '<path d="M2.5 7.5v12.5M21.5 12.5v7.5M2.5 13.5h19M2.5 17.5h19"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '침대 프레임 + 전면 베개 & 이불 레이어 (속공간 비움으로 선 겹침 차단)',
            customSvg: '<path d="M2.5 7.5v12.5M21.5 12.5v7.5"/><rect x="4.2" y="9.8" width="5.6" height="3.7" rx="1.4" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M10.8 13.5v-2.2c0-.9.7-1.6 1.6-1.6h6.5c.9 0 1.6.7 1.6 1.6v2.2" fill="var(--vb-icon-bg, #FFFFFF)"/><rect x="2.5" y="13.5" width="19" height="4" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '침대 + 전면 베개 & 이불 + 상단 독립 구역 초승달 나이트 모빌',
            customSvg: '<path d="M2.5 7.5v12.5M21.5 12.5v7.5"/><rect x="4.2" y="9.8" width="5.6" height="3.7" rx="1.4" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M10.8 13.5v-2.2c0-.9.7-1.6 1.6-1.6h6.5c.9 0 1.6.7 1.6 1.6v2.2" fill="var(--vb-icon-bg, #FFFFFF)"/><rect x="2.5" y="13.5" width="19" height="4" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M16.5 2.5a3.2 3.2 0 0 0 4.2 4.2 4.2 4.2 0 1 1-4.2-4.2Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '침대 + 베개 & 이불 + 상단 좌·중·우 3분할 구역 (별빛 · Z기호 · 초승달 비간섭 배치)',
            customSvg: '<path d="M2.5 7.5v12.5M21.5 12.5v7.5"/><rect x="4.2" y="9.8" width="5.6" height="3.7" rx="1.4" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M10.8 13.5v-2.2c0-.9.7-1.6 1.6-1.6h6.5c.9 0 1.6.7 1.6 1.6v2.2" fill="var(--vb-icon-bg, #FFFFFF)"/><rect x="2.5" y="13.5" width="19" height="4" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M6.8 3.2v2.4M8 4.4H5.6"/><path d="M11.2 3.2h2.6l-2.6 3.2h2.6"/><path d="M17.2 2.2a3 3 0 0 0 4 4 4 4 0 1 1-4-4Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
        ],
      },
      {
        id: 'star',
        title: '별 (Stars & Night Aura)',
        enTitle: 'Night Stars & Glow',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '단일 4-포인트 스파클 별 라인',
            customSvg: '<path d="M12 2.2l2.4 7.4L21.8 12l-7.4 2.4L12 21.8l-2.4-7.4L2.2 12l7.4-2.4Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '중심 별 + 우상단 독립 구역 보조 별 추가',
            customSvg: '<path d="M12 2.2l2.4 7.4L21.8 12l-7.4 2.4L12 21.8l-2.4-7.4L2.2 12l7.4-2.4Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M19 3v3M20.5 4.5h-3"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '후면 나이트 클라우드 + 전면 중심 별 & 코어 다이아몬드 (속공간 비움)',
            customSvg: '<path d="M17.5 19.5H7.8a3.8 3.8 0 0 1-.4-7.6 4.4 4.4 0 0 1 8.4-1 3.2 3.2 0 0 1 1.7 8.6Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12 2.2l2.2 6.8L21 11.2l-6.8 2.2L12 20.2l-2.2-6.8L3 11.2 9.8 9Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="11.2" r="1.4" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '보태니컬 나이트 월계수 크레스트 + 중심 별 코어 + 초승달 슬립 엠블럼',
            customSvg: withCrestAndBadge('<path d="M12 2.2l2.4 7.4L21.8 12l-7.4 2.4L12 21.8l-2.4-7.4L2.2 12l7.4-2.4Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="12" r="1.5" fill="var(--vb-icon-bg, #FFFFFF)"/>', 'laurel', 'shield'),
          },
        ],
      },
      {
        id: 'face',
        title: '자는 얼굴 (Sleep Face)',
        enTitle: 'Sleep Face & Relax',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '눈을 감은 두 눈과 평온한 미소 라인',
            customSvg: '<path d="M7.8 11.5c.6.7 1.8.7 2.4 0M13.8 11.5c.6.7 1.8.7 2.4 0"/><path d="M10.2 15.2c.9.7 2.7.7 3.6 0"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '잠든 눈/미소 + 얼굴 원형 윤곽 결합',
            customSvg: '<circle cx="12" cy="12" r="8.2" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M8 11.5c.6.6 1.6.6 2.2 0M13.8 11.5c.6.6 1.6.6 2.2 0"/><path d="M10.4 15c.8.6 2.4.6 3.2 0"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '얼굴 윤곽 + 잠든 눈/미소 + 우상단 비간섭 Z기호',
            customSvg: '<circle cx="11.2" cy="12.5" r="7.5" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M7.6 12c.5.5 1.5.5 2 0M12.8 12c.5.5 1.5.5 2 0"/><path d="M9.8 15.2c.7.5 2.1.5 2.8 0"/><path d="M18.2 3h2.8l-2.8 3.2h2.8"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 얼굴 윤곽 + 전면 구름 베개 (전면 구름 속공간 비움으로 턱선 가림) + Z기호 & 별',
            customSvg: '<circle cx="12" cy="10.5" r="7.2" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M8.4 10c.5.5 1.5.5 2 0M13.6 10c.5.5 1.5.5 2 0"/><path d="M10.6 13c.7.5 2.1.5 2.8 0"/><path d="M18.5 2.2h2.5l-2.5 2.8h2.5"/><path d="M4.2 3.5v2.4M5.4 4.7H3"/><path d="M17.2 21H6.8a2.6 2.6 0 0 1-.3-5.2 3.4 3.4 0 0 1 6.5-1 3.2 3.2 0 0 1 4.5 1 2.6 2.6 0 0 1-.3 5.2Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
        ],
      },
    ],
  },
  {
    keys: ['콜라겐', '피부', '탄력', '뷰티', '광채', '주름', '미백', 'collagen', 'inner beauty', '히알루론산', '엘라스틴', '세라마이드'],
    enCopy: 'inner beauty',
    motifs: [
      {
        id: 'droplet',
        title: '수분 물방울 (Hydra Drop)',
        enTitle: 'Skin Hydration Drop',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '단일 수분 물방울 클린 라인',
            customSvg: '<path d="M12 2.5C12 2.5 5.5 10.2 5.5 15a6.5 6.5 0 0 0 13 0C18.5 10.2 12 2.5 12 2.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '물방울 + 내부 수분 광채 하이라이트 곡선',
            customSvg: '<path d="M12 2.5C12 2.5 5.5 10.2 5.5 15a6.5 6.5 0 0 0 13 0C18.5 10.2 12 2.5 12 2.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M8.8 14.2a3.5 3.5 0 0 0 3.2 3.2"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '후면 수분 파동 링 + 전면 물방울 (물방울 속공간 비움으로 파동선 관통 차단)',
            customSvg: '<ellipse cx="12" cy="18.8" rx="8.5" ry="2.6" fill="none"/><path d="M12 2.2C12 2.2 6 9.4 6 13.8a6 6 0 0 0 12 0C18 9.4 12 2.2 12 2.2Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M9.2 13.2a3 3 0 0 0 2.8 2.8"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 수분 파동 링 + 전면 물방울(속공간 비움) + 좌우 상단 광채 스파클',
            customSvg: '<ellipse cx="12" cy="18.8" rx="8.8" ry="2.7" fill="none"/><path d="M12 2.2C12 2.2 6 9.4 6 13.8a6 6 0 0 0 12 0C18 9.4 12 2.2 12 2.2Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M9.2 13.2a3 3 0 0 0 2.8 2.8"/><path d="M19 3.5v2.8M20.4 4.9h-2.8"/><circle cx="4.8" cy="6" r="0.75" fill="currentColor" stroke="none"/>',
          },
        ],
      },
      {
        id: 'glow',
        title: '광채 스타 (Skin Radiance)',
        enTitle: 'Radiant Glow',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '단일 광채 스파클 별 실루엣',
            customSvg: '<path d="M12 2.5L14.2 9.8L21.5 12L14.2 14.2L12 21.5L9.8 14.2L2.5 12L9.8 9.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '광채 스파클 + 내부 비간섭 코어 펄',
            customSvg: '<path d="M12 2.5L14.2 9.8L21.5 12L14.2 14.2L12 21.5L9.8 14.2L2.5 12L9.8 9.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="12" r="1.5" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '광채 스파클 + 코어 펄 + 4방향 외곽 광선 (별과 겹치지 않는 대각선 외곽 배치)',
            customSvg: '<path d="M12 2.5L14.2 9.8L21.5 12L14.2 14.2L12 21.5L9.8 14.2L2.5 12L9.8 9.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="12" r="1.5" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M5.2 5.2L7.2 7.2M18.8 5.2L16.8 7.2M5.2 18.8L7.2 16.8M18.8 18.8L16.8 16.8"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '바이오 육각 분자 프레임 + 광채 다이아몬드 코어 + 히알루론산 수분 드롭 배지',
            customSvg: withCrestAndBadge('<path d="M12 2.2L14.3 9.7L21.8 12L14.3 14.3L12 21.8L9.7 14.3L2.2 12L9.7 9.7Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="12" r="1.5" fill="var(--vb-icon-bg, #FFFFFF)"/>', 'bio_hex', 'drop'),
          },
        ],
      },
      {
        id: 'capsule',
        title: '탄력 캡슐 (Elasticity Capsule)',
        enTitle: 'Collagen Bio Capsule',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '바이오 캡슐 미니멀 외곽선',
            customSvg: '<g transform="rotate(-35 12 12)"><rect x="4.2" y="8.2" width="15.6" height="7.6" rx="3.8" fill="var(--vb-icon-bg, #FFFFFF)"/></g>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '캡슐 + 캡슐 축에 정렬된 직교 분할 라인 (외곽 돌출 없음)',
            customSvg: LIB_SVGS.pill_L,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '듀얼 정제 & 타블렛 복합 제형 (Studio Dual Tablets)',
            customSvg: LIB_SVGS.pills_T,
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '바이오 육각 분자 프레임 + 콜라겐 캡슐 코어 + 수분 에센스 드롭 배지',
            customSvg: withCrestAndBadge(LIB_SVGS.pill_L, 'bio_hex', 'drop'),
          },
        ],
      },
      {
        id: 'skin_spring',
        title: '진피 콜라겐 탄력층 (Dermal Elasticity)',
        enTitle: 'Dermal Collagen Spring',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '피부 표피 웨이브 & 진피 층 라인',
            customSvg: '<path d="M3 8.5c3-1.8 6 1.8 9 0s6 1.8 9 0M3 16.5h18"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '피부층 + 진피 탄력을 받쳐주는 수직 리프팅 화살표',
            customSvg: '<path d="M3 7.5c3-1.6 6 1.6 9 0s6 1.6 9 0M3 18.5h18"/><path d="M7.5 16v-5.5M5.8 12.2L7.5 10.5l1.7 1.7M16.5 16v-5.5M14.8 12.2l1.7-1.7 1.7 1.7"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '피부층 + 3중 콜라겐 리프팅 기둥 + 전면 콜라겐 코어(속공간 비움)',
            customSvg: '<path d="M3 7c3-1.5 6 1.5 9 0s6 1.5 9 0M3 19h18"/><path d="M6.5 16.8v-6M12 16.8v-6.5M17.5 16.8v-6"/><circle cx="12" cy="13.2" r="2.6" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '피부 탄력층 + 리프팅 화살표 + 전면 히알루론산 수분 드롭 배지(속공간 비움)',
            customSvg: withCornerBadge('<path d="M3 7.2c3-1.5 6 1.5 9 0s6 1.5 9 0M3 19.2h18"/><path d="M6.5 17v-5.8M5 12.7l1.5-1.5 1.5 1.5M17.5 17v-5.8M16 12.7l1.5-1.5 1.5 1.5"/><circle cx="12" cy="13.5" r="2.8" fill="var(--vb-icon-bg, #FFFFFF)"/>', 'drop'),
          },
        ],
      },
      {
        id: 'lifting_face',
        title: 'V라인 리프팅 · 주름 케어 (V-Lifting Care)',
        enTitle: 'V-Line Lifting',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '매끄러운 V라인 페이스 윤곽 실루엣',
            customSvg: '<path d="M6.2 6.5c0 6.2 2.6 11.2 5.8 13 3.2-1.8 5.8-6.8 5.8-13" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: 'V라인 윤곽 + 좌우 대칭 리프팅 업 화살표 (비간섭 외곽 배치)',
            customSvg: '<path d="M6.5 6c0 5.8 2.4 10.5 5.5 12.2 3.1-1.7 5.5-6.4 5.5-12.2" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M3.2 15.5c.8-2.2 1.4-4.5 1.6-7M3 10.2l1.8-1.7 1.4 1.9M20.8 15.5c-.8-2.2-1.4-4.5-1.6-7M21 10.2l-1.8-1.7-1.4 1.9"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: 'V라인 윤곽 + 양측 리프팅 화살표 + 전면 콜라겐 수분 드롭 배지',
            customSvg: withCornerBadge('<path d="M6.5 6c0 5.8 2.4 10.5 5.5 12.2 3.1-1.7 5.5-6.4 5.5-12.2" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M3.2 15.5c.8-2.2 1.4-4.5 1.6-7M3 10.2l1.8-1.7 1.4 1.9M20.8 15.5c-.8-2.2-1.4-4.5-1.6-7M21 10.2l-1.8-1.7-1.4 1.9"/>', 'drop'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '보태니컬 월계수 크레스트 + V라인 리프팅 윤곽 + 피부 장벽 쉴드 배지',
            customSvg: withCrestAndBadge('<path d="M6.5 5.5c0 5.8 2.4 10.5 5.5 12.2 3.1-1.7 5.5-6.4 5.5-12.2Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M3.2 15.5c.8-2.2 1.4-4.5 1.6-7M3 10.2l1.8-1.7 1.4 1.9M20.8 15.5c-.8-2.2-1.4-4.5-1.6-7M21 10.2l-1.8-1.7-1.4 1.9"/>', 'laurel', 'shield'),
          },
        ],
      },
      {
        id: 'collagen_helix',
        title: '저분자 콜라겐 펩타이드 사슬 (Collagen Helix)',
        enTitle: 'Collagen Tri-Peptide',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '콜라겐 3중 나선 펩타이드 기본 웨이브',
            customSvg: LIB_SVGS.dna_T,
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '콜라겐 이중 나선 + 펩타이드 브릿지 결합 구조',
            customSvg: LIB_SVGS.dna2_T,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '정밀 대각선 콜라겐 트리펩타이드 사슬 (Studio Peptide Helix)',
            customSvg: LIB_SVGS.dna_L,
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '바이오 육각 분자 프레임 + 콜라겐 펩타이드 나선 + 수분 에센스 드롭 배지',
            customSvg: withCrestAndBadge(LIB_SVGS.dna2_T, 'bio_hex', 'drop'),
          },
        ],
      },
    ],
  },
  {
    keys: ['모발', '두피', '탈모', '비오틴', '케라틴', '손톱', '네일', '판토텐산', '맥주효모', '머리카락', '풍성', 'hair', 'biotin', 'keratin', 'scalp'],
    enCopy: 'biotin hair care',
    motifs: [
      {
        id: 'hair_follicle',
        title: '모근 · 두피 탄력 케어 (Hair Follicle Root)',
        enTitle: 'Biotin Hair Follicle',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '두피 표면과 건강하게 뻗어 나오는 모발 & 모근 구근 실루엣',
            customSvg: '<path d="M4 13.5c4-1.2 12-1.2 16 0"/><path d="M12 3.5c-.8 3.5-1.2 6.8-1.2 10a2.8 2.8 0 1 0 5.6 0c0-3.2-.8-6.5-4.4-10Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '두피층 + 전면 모근 코어(속공간 비움으로 두피선 겹침 차단) + 모유두 핵',
            customSvg: '<path d="M3.5 13.5c4.5-1.2 12.5-1.2 17 0"/><path d="M12 3c-1 3.8-2.6 8-2.6 12.2a2.6 2.6 0 0 0 5.2 0C14.6 11 13 6.8 12 3Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="15.4" r="0.9" fill="currentColor" stroke="none"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '두피층 + 전면 모근(속공간 비움) + 좌우 비간섭 영양 공급 화살표',
            customSvg: '<path d="M3.5 13.5c4.5-1.2 12.5-1.2 17 0"/><path d="M12 3c-1 3.8-2.6 8-2.6 12.2a2.6 2.6 0 0 0 5.2 0C14.6 11 13 6.8 12 3Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="15.4" r="0.9" fill="currentColor" stroke="none"/><path d="M5.5 9.5l2.2-2.2M18.5 9.5l-2.2-2.2"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '보태니컬 월계수 크레스트 + 전면 두피 & 모근(속공간 비움) + 에센스 드롭 배지',
            customSvg: withCrestAndBadge('<path d="M3.5 13.5c4.5-1.2 12.5-1.2 17 0"/><path d="M12 3c-1 3.8-2.6 8-2.6 12.2a2.6 2.6 0 0 0 5.2 0C14.6 11 13 6.8 12 3Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="15.4" r="0.9" fill="currentColor" stroke="none"/>', 'laurel', 'drop'),
          },
        ],
      },
      {
        id: 'shine_locks',
        title: '실크 머릿결 · 케라틴 볼륨 (Keratin Volume Wave)',
        enTitle: 'Silky Keratin Locks',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '탄력 있게 흐르는 2중 실크 모발 웨이브',
            customSvg: '<path d="M8 3.5c-3 4 3 8 0 12s1 4.5 1 4.5M14 3.5c-3 4 3 8 0 12s1 4.5 1 4.5"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '실크 모발 웨이브 + 전면 케라틴 코팅 쉴드 배지 (속공간 비움)',
            customSvg: withCornerBadge('<path d="M8 3.5c-3 4 3 8 0 12s1 4.5 1 4.5M13.5 3.5c-3 4 3 8 0 12s1 4.5 1 4.5"/>', 'shield'),
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '실크 모발 웨이브 + 전면 비오틴 육각 분자 배지 (속공간 비움)',
            customSvg: withCornerBadge('<path d="M8 3.5c-3 4 3 8 0 12s1 4.5 1 4.5M13.5 3.5c-3 4 3 8 0 12s1 4.5 1 4.5"/>', 'hexagon'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 바이오 육각 링 + 전면 실크 모발 웨이브 & 케라틴 쉴드 배지 (속공간 비움)',
            customSvg: withCrestAndBadge('<path d="M8 3.5c-3 4 3 8 0 12s1 4.5 1 4.5M13.5 3.5c-3 4 3 8 0 12s1 4.5 1 4.5"/>', 'bio_hex', 'shield'),
          },
        ],
      },
    ],
  },
  {
    keys: ['다이어트', '슬리밍', '체지방', '더블컷', '체중', '체중계', '줄자', '칼로리', '대사', '신진대사', '슬림', '핏', 'diet', 'slim', '카테킨', '가르시니아'],
    enCopy: 'slim double cut',
    motifs: [
      {
        id: 'waist',
        title: '웨이스트 더블컷 (Waistline Cut)',
        enTitle: 'Body Slimline Cut',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '슬림 웨이스트 모래시계 라인',
            customSvg: '<path d="M6.5 3.5C10 8.5 10 15.5 6.5 20.5M17.5 3.5C14 8.5 14 15.5 17.5 20.5"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '웨이스트 라인 + 전면 피팅 벨트 밴드 (속공간 비움으로 교차선 제거)',
            customSvg: '<path d="M6.5 3.5C10 8.5 10 15.5 6.5 20.5M17.5 3.5C14 8.5 14 15.5 17.5 20.5"/><rect x="7.6" y="10.2" width="8.8" height="3.6" rx="1.2" fill="var(--vb-icon-bg, #FFFFFF)"/><line x1="12" y1="10.2" x2="12" y2="13.8"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '웨이스트 + 전면 벨트 + 좌우 외곽 슬리밍 인워드 화살표 (비간섭 배치)',
            customSvg: '<path d="M6.5 3.5C10 8.5 10 15.5 6.5 20.5M17.5 3.5C14 8.5 14 15.5 17.5 20.5"/><rect x="7.6" y="10.2" width="8.8" height="3.6" rx="1.2" fill="var(--vb-icon-bg, #FFFFFF)"/><line x1="12" y1="10.2" x2="12" y2="13.8"/><path d="M2 12h3.2M3.8 10.4L5.4 12l-1.6 1.6M22 12h-3.2M20.2 10.4L18.6 12l1.6 1.6"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '웨이스트 + 전면 피팅 벨트 + 좌우 인워드 화살표 + 대사 플레임 배지 (속공간 비움)',
            customSvg: withCornerBadge('<path d="M6.5 3.5C10 8.5 10 15.5 6.5 20.5M17.5 3.5C14 8.5 14 15.5 17.5 20.5"/><rect x="7.6" y="10.2" width="8.8" height="3.6" rx="1.2" fill="var(--vb-icon-bg, #FFFFFF)"/><line x1="12" y1="10.2" x2="12" y2="13.8"/><path d="M2 12h3.2M3.8 10.4L5.4 12l-1.6 1.6M22 12h-3.2M20.2 10.4L18.6 12l1.6 1.6"/>', 'flame'),
          },
        ],
      },
      {
        id: 'weight_scale',
        title: '체중 감량 스케일 (Weight Care Scale)',
        enTitle: 'Smart Weight Scale',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '체중계 라운드 스퀘어 바디 & 상단 디스플레이 창',
            customSvg: '<rect x="4" y="4" width="16" height="16" rx="3.5" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M8.5 8.5h7"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '체중계 바디 + 반원형 게이지 다이얼 및 바늘',
            customSvg: LIB_SVGS.scale,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '체중계 + 다이얼 바늘 + 하단 체중 감소 다운 화살표',
            customSvg: '<rect x="4" y="4" width="16" height="16" rx="3.5" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M8 10a4 4 0 0 1 8 0Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12 10l-1.5-2.2"/><path d="M12 13v4.2M10.2 15.4L12 17.2l1.8-1.8"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 대사 순환 듀얼 아크 + 전면 체중계(속공간 비움) + 칼로리 버닝 배지',
            customSvg: withCrestAndBadge(LIB_SVGS.scale, 'orbit_flow', 'flame'),
          },
        ],
      },
      {
        id: 'flame',
        title: '대사 버닝 (Metabolic Flame)',
        enTitle: 'Calorie Metabolic Burn',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '칼로리 연소 불꽃 외곽 실루엣',
            customSvg: LIB_SVGS.flame,
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '불꽃 + 내부 코어 플레임 (겹침 없는 동심원 배치)',
            customSvg: `${LIB_SVGS.flame}<path d="M12 18.8a2.6 2.6 0 0 0 2.6-2.6c0-1.2-.8-2.2-2.2-3.4-.6 1.2-3 2-3 3.4A2.6 2.6 0 0 0 12 18.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/>`,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '코어 플레임 + 전면 신진대사 순환 화살표 배지 (속공간 비움)',
            customSvg: withCornerBadge(`${LIB_SVGS.flame}<path d="M12 18.8a2.6 2.6 0 0 0 2.6-2.6c0-1.2-.8-2.2-2.2-3.4-.6 1.2-3 2-3 3.4A2.6 2.6 0 0 0 12 18.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/>`, 'cycle'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 대사 순환 듀얼 아크 + 전면 코어 플레임 & 보태니컬 리프 배지 (속공간 비움)',
            customSvg: withCrestAndBadge(`${LIB_SVGS.flame}<path d="M12 18.8a2.6 2.6 0 0 0 2.6-2.6c0-1.2-.8-2.2-2.2-3.4-.6 1.2-3 2-3 3.4A2.6 2.6 0 0 0 12 18.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/>`, 'orbit_flow', 'leaf'),
          },
        ],
      },
      {
        id: 'leaf',
        title: '카테킨 녹차 잎 (Catechin Leaf)',
        enTitle: 'Botanical Catechin Leaf',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '단일 녹차 잎 미니멀 외곽선',
            customSvg: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '녹차 잎 + 중심 엽맥 라인',
            customSvg: LIB_SVGS.leaf,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '녹차 잎 + 엽맥 + 전면 카테킨 에센스 드롭 배지 (속공간 비움)',
            customSvg: withCornerBadge(LIB_SVGS.leaf, 'drop'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '보태니컬 월계수 크레스트 + 전면 녹차 잎(속공간 비움) + 카테킨 에센스 드롭 배지',
            customSvg: withCrestAndBadge(LIB_SVGS.leaf, 'laurel', 'drop'),
          },
        ],
      },
    ],
  },
  {
    keys: ['유산균', '프로바이오틱스', '장건강', '장', '대장', '소장', '배변', '쾌변', '바이옴', 'probiotics', 'gut', 'intestine', '포스트바이오틱스'],
    enCopy: 'probiotics care',
    motifs: [
      {
        id: 'intestine_organ',
        title: '인체 장 기관 (Intestine & Gut Tract)',
        enTitle: 'Healthy Gut Tract',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '장(Intestine) 연동 굴곡 루프 기본 실루엣',
            customSvg: '<path d="M7.5 5.5h9a2.5 2.5 0 0 1 0 5h-9a2.5 2.5 0 0 0 0 5h9a2.5 2.5 0 0 1 0 5H12v2"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '장 굴곡 루프 + 전면 장 건강 보호 체크 배지 (전면 배지 속공간 비움)',
            customSvg: '<path d="M7.5 5h9a2.5 2.5 0 0 1 0 5h-9a2.5 2.5 0 0 0 0 5h9a2.5 2.5 0 0 1 0 5H12"/><circle cx="17" cy="17" r="4.2" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="m15.3 17 1.2 1.2 2.4-2.4"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '장 굴곡 루프 + 전면 장벽 방어 쉴드 배지 (속공간 비움)',
            customSvg: withCornerBadge('<path d="M7.5 5h9a2.5 2.5 0 0 1 0 5h-9a2.5 2.5 0 0 0 0 5h9a2.5 2.5 0 0 1 0 5H12"/>', 'shield'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 마이크로바이옴 쉴드 크레스트 + 전면 장 루프 & 방어 배지 (속공간 비움)',
            customSvg: withCrestAndBadge('<path d="M7.5 5h9a2.5 2.5 0 0 1 0 5h-9a2.5 2.5 0 0 0 0 5h9a2.5 2.5 0 0 1 0 5H12"/>', 'shield_crest', 'cycle'),
          },
        ],
      },
      {
        id: 'shield',
        title: '장 바이옴 쉴드 (Gut Bio Shield)',
        enTitle: 'Microbiome Shield',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '바이오 보호 쉴드 외곽선',
            customSvg: LIB_SVGS.shield,
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '쉴드 + 중앙 유익균 인증 체크마크',
            customSvg: `${LIB_SVGS.shield}<path d="m9 12 2.2 2.2 4.2-4.2"/>`,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '장벽 보호 쉴드 + 전면 장내 순환 화살표 배지 (속공간 비움)',
            customSvg: withCornerBadge(`${LIB_SVGS.shield}<path d="m9 12 2.2 2.2 4.2-4.2"/>`, 'cycle'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 바이오 육각 구조 링 + 전면 장벽 보호 쉴드 & 순환 배지 (속공간 비움)',
            customSvg: withCrestAndBadge(`${LIB_SVGS.shield}<path d="m9 12 2.2 2.2 4.2-4.2"/>`, 'bio_hex', 'cycle'),
          },
        ],
      },
      {
        id: 'microbe',
        title: '유익균 활성 (Beneficial Microbes)',
        enTitle: 'Active Probiotics',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '유익 간균 단일 캡슐 실루엣',
            customSvg: '<rect x="5.5" y="8.5" width="13" height="7" rx="3.5" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '유익균 + 내부 코어 생균 도트 (비간섭 배치)',
            customSvg: '<rect x="5.5" y="8.5" width="13" height="7" rx="3.5" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="9.2" cy="12" r="0.9" fill="currentColor" stroke="none"/><circle cx="14.8" cy="12" r="0.9" fill="currentColor" stroke="none"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '후면 증식 유익균 + 전면 주 유익균 (전면 캡슐 속공간 비움으로 겹침선 제거)',
            customSvg: '<rect x="9.5" y="4.5" width="11" height="6" rx="3" fill="var(--vb-icon-bg, #FFFFFF)"/><rect x="3.5" y="10.5" width="13" height="7" rx="3.5" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="7.2" cy="14" r="0.9" fill="currentColor" stroke="none"/><circle cx="12.8" cy="14" r="0.9" fill="currentColor" stroke="none"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 장내 대사 순환 아크 + 전면 이중 유익균 캡슐 & 장벽 쉴드 배지 (속공간 비움)',
            customSvg: withCrestAndBadge('<rect x="9.5" y="4.5" width="11" height="6" rx="3" fill="var(--vb-icon-bg, #FFFFFF)"/><rect x="3.5" y="10.5" width="13" height="7" rx="3.5" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="7.2" cy="14" r="0.9" fill="currentColor" stroke="none"/><circle cx="12.8" cy="14" r="0.9" fill="currentColor" stroke="none"/>', 'orbit_flow', 'shield'),
          },
        ],
      },
    ],
  },
  {
    keys: ['비타민', '활력', '에너지', '피로', '부스터', 'vitamin', 'energy', '레티놀', '항산화'],
    enCopy: 'vital vitamin',
    motifs: [
      {
        id: 'sun',
        title: '바이탈 썬 (Vital Solar Vitamin)',
        enTitle: 'Solar Vitamin C',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '태양 코어 + 4방향 기본 광선',
            customSvg: '<circle cx="12" cy="12" r="5" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12 2.2v2.2M12 19.6v2.2M2.2 12h2.2M19.6 12h2.2"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '태양 코어 + 8방향 비타민 에너지 광선 (코어와 비간섭 이격)',
            customSvg: LIB_SVGS.sun,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '태양 + 8방향 광선 + 전면 시트러스 슬라이스 배지 (속공간 비움)',
            customSvg: withCornerBadge(LIB_SVGS.sun, 'slice'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 활력 순환 듀얼 아크 + 전면 태양 광선 & 시트러스 슬라이스 배지 (속공간 비움)',
            customSvg: withCrestAndBadge(LIB_SVGS.sun, 'orbit_flow', 'slice'),
          },
        ],
      },
      {
        id: 'bolt',
        title: '바이탈 에너지 볼트 (Vital Energy Bolt)',
        enTitle: 'Energy Power Pulse',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '에너지 번개 볼트 클린 라인',
            customSvg: LIB_SVGS.bolt,
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '후면 에너지 코어 링 + 전면 번개 볼트 (전면 볼트 속공간 비움으로 뒤쪽 원 가림)',
            customSvg: `<circle cx="12" cy="12" r="7.2" fill="var(--vb-icon-bg, #FFFFFF)"/>${LIB_SVGS.bolt}`,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '번개 볼트 + 전면 바이탈 펄스 파형 배지 (속공간 비움)',
            customSvg: withCornerBadge(LIB_SVGS.bolt, 'pulse'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 에너지 순환 듀얼 아크 + 전면 번개 볼트 & 바이탈 펄스 배지 (속공간 비움)',
            customSvg: withCrestAndBadge(LIB_SVGS.bolt, 'orbit_flow', 'pulse'),
          },
        ],
      },
    ],
  },
  {
    keys: ['간', '간건강', '간세포', '밀크씨슬', '실리마린', '엉겅퀴', '숙취', '리버', '담낭', '해독', 'liver'],
    enCopy: 'liver care',
    motifs: [
      {
        id: 'liver_organ',
        title: '인체 간 기관 (Liver Organ Care)',
        enTitle: 'Healthy Liver Organ',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '인체 간(Liver) 해부학적 좌우 2엽 실루엣',
            customSvg: '<path d="M3.5 11.5C3.5 7 7 5 12.5 5c5 0 8 2 8 5.2 0 4.2-4.8 8.8-11.5 8.8-3.5 0-5.5-2.8-5.5-7.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12.5 5c-.5 4.2.5 8.5 2 11.2"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '간 2엽 실루엣 + 전면 간세포 회복 플러스 배지 (속공간 비움)',
            customSvg: '<path d="M3.5 11.5C3.5 7 7 5 12.5 5c5 0 8 2 8 5.2 0 4.2-4.8 8.8-11.5 8.8-3.5 0-5.5-2.8-5.5-7.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12.5 5c-.5 4.2.5 8.5 2 11.2"/><circle cx="17" cy="16.5" r="4" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M17 14.7v3.6M18.8 16.5h-3.6"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '간 기관 + 전면 간세포 보호 쉴드 배지 (속공간 비움)',
            customSvg: withCornerBadge('<path d="M3.5 11.5C3.5 7 7 5 12.5 5c5 0 8 2 8 5.2 0 4.2-4.8 8.8-11.5 8.8-3.5 0-5.5-2.8-5.5-7.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12.5 5c-.5 4.2.5 8.5 2 11.2"/>', 'shield'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 해독 대사 순환 아크 + 전면 간 기관(속공간 비움) + 리버 쉴드 배지',
            customSvg: withCrestAndBadge('<path d="M3.5 11.5C3.5 7 7 5 12.5 5c5 0 8 2 8 5.2 0 4.2-4.8 8.8-11.5 8.8-3.5 0-5.5-2.8-5.5-7.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12.5 5c-.5 4.2.5 8.5 2 11.2"/>', 'orbit_flow', 'shield'),
          },
        ],
      },
      {
        id: 'thistle',
        title: '밀크씨슬 (Milk Thistle)',
        enTitle: 'Milk Thistle Flower',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '밀크씨슬 꽃봉오리 실루엣',
            customSvg: '<path d="M12 3a4.2 4.2 0 0 1 4.2 4.2c0 3.2-4.2 6.2-4.2 6.2S7.8 10.4 7.8 7.2A4.2 4.2 0 0 1 12 3Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '꽃봉오리 + 전면 꽃받침 레이어 (속공간 비움으로 겹침 제거)',
            customSvg: '<path d="M12 3a4.2 4.2 0 0 1 4.2 4.2c0 3.2-4.2 6.2-4.2 6.2S7.8 10.4 7.8 7.2A4.2 4.2 0 0 1 12 3Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M7.2 12.5c-1.8.5-2.7 2.2-2.2 3.8.6 1.8 3.2 2.2 7 2.2s6.4-.4 7-2.2c.5-1.6-.4-3.3-2.2-3.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '꽃봉오리 + 전면 꽃받침 + 하단 줄기 및 좌우 잎사귀',
            customSvg: '<path d="M12 3a4.2 4.2 0 0 1 4.2 4.2c0 3.2-4.2 6.2-4.2 6.2S7.8 10.4 7.8 7.2A4.2 4.2 0 0 1 12 3Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M7.2 12.5c-1.8.5-2.7 2.2-2.2 3.8.6 1.8 3.2 2.2 7 2.2s6.4-.4 7-2.2c.5-1.6-.4-3.3-2.2-3.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12 18.5v3M9 20.5h6"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '보태니컬 월계수 크레스트 + 전면 밀크씨슬(속공간 비움) + 실리마린 에센스 드롭 배지',
            customSvg: withCrestAndBadge('<path d="M12 3a4.2 4.2 0 0 1 4.2 4.2c0 3.2-4.2 6.2-4.2 6.2S7.8 10.4 7.8 7.2A4.2 4.2 0 0 1 12 3Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M7.2 12.5c-1.8.5-2.7 2.2-2.2 3.8.6 1.8 3.2 2.2 7 2.2s6.4-.4 7-2.2c.5-1.6-.4-3.3-2.2-3.8Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12 18.5v3"/>', 'laurel', 'drop'),
          },
        ],
      },
    ],
  },
  {
    keys: ['눈', '루테인', '지아잔틴', '시력', '안구', 'eye', 'vision', '트루아이', '아스타잔틴'],
    enCopy: 'eye macular care',
    motifs: [
      {
        id: 'eye',
        title: '맑은 눈 / 시야 (Clear Eye)',
        enTitle: 'Clear Vision',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '부드러운 안구 아몬드 외곽선',
            customSvg: '<path d="M2.2 12s3.5-6.5 9.8-6.5 9.8 6.5 9.8 6.5-3.5 6.5-9.8 6.5-9.8-6.5-9.8-6.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '안구 + 중심 홍채 원형 링',
            customSvg: LIB_SVGS.eye,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '안구 + 홍채 & 동공 코어 + 상하 외곽 비간섭 광선',
            customSvg: '<path d="M2.2 12s3.5-6.5 9.8-6.5 9.8 6.5 9.8 6.5-3.5 6.5-9.8 6.5-9.8-6.5-9.8-6.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="12" r="3.2" fill="var(--vb-icon-bg, #FFFFFF)"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M12 2.2v1.8M7.5 3l.8 1.6M16.5 3l-.8 1.6"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '광학 포커스 뷰파인더 프레임 + 전면 안구·홍채 코어(속공간 비움) + 황반 보호 쉴드 배지',
            customSvg: withCrestAndBadge(LIB_SVGS.eye, 'optic_scan', 'shield'),
          },
        ],
      },
    ],
  },
  {
    keys: ['혈당', '당케어', '바나바잎', '난소화성', '탄수화물', 'glucose', 'sugar'],
    enCopy: 'blood sugar cut',
    motifs: [
      {
        id: 'banaba',
        title: '바나바 더블컷 (Banaba Cut)',
        enTitle: 'Carb Glucose Cut',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '바나바 잎 실루엣 미니멀 라인',
            customSvg: '<path d="M12 2.5C7 2.5 4.8 8 4.8 13.8c0 4.5 3.4 7.7 7.2 7.7s7.2-3.2 7.2-7.7C19.2 8 17 2.5 12 2.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '바나바 잎 + 중심 엽맥 라인',
            customSvg: LIB_SVGS.leaf,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '바나바 잎 + 엽맥 + 전면 우하단 당 컷팅 쉴드 배지 (속공간 비움)',
            customSvg: withCornerBadge(LIB_SVGS.leaf, 'shield'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 혈당 밸런스 순환 아크 + 전면 바나바 잎(속공간 비움) + 당케어 쉴드 배지',
            customSvg: withCrestAndBadge(LIB_SVGS.leaf, 'orbit_flow', 'shield'),
          },
        ],
      },
    ],
  },
  {
    keys: ['홍삼', '인삼', '진생', '명작수', '면역', '면역력', 'ginseng', 'immunity'],
    enCopy: 'ginseng heritage',
    motifs: [
      {
        id: 'ginseng',
        title: '진생 루트 (Ginseng Root)',
        enTitle: 'Royal Ginseng Root',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '홍삼 몸통 주근 미니멀 실루엣',
            customSvg: '<path d="M12 5.5c-2 0-3.6 2.6-3.6 6.2 0 4.2 1.8 7.8 3.6 9.5 1.8-1.7 3.6-5.3 3.6-9.5 0-3.6-1.6-6.2-3.6-6.2Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '홍삼 주근 + 좌우 비간섭 잔뿌리 분기선',
            customSvg: '<path d="M12 5.5c-2 0-3.6 2.6-3.6 6.2 0 4.2 1.8 7.8 3.6 9.5 1.8-1.7 3.6-5.3 3.6-9.5 0-3.6-1.6-6.2-3.6-6.2Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M8.6 13.5c-1.8.8-2.8 2.4-2.8 4.2M15.4 13.5c1.8.8 2.8 2.4 2.8 4.2"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '홍삼 + 잔뿌리 + 상단 분리된 진생베리 3구 열매',
            customSvg: '<path d="M12 6c-1.9 0-3.4 2.5-3.4 6 0 4 1.7 7.4 3.4 9 1.7-1.6 3.4-5 3.4-9 0-3.5-1.5-6-3.4-6Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M8.8 13.8c-1.7.8-2.6 2.3-2.6 4M15.2 13.8c1.7.8 2.6 2.3 2.6 4"/><circle cx="10.2" cy="3.5" r="1" fill="currentColor" stroke="none"/><circle cx="13.8" cy="3.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="2.2" r="1" fill="currentColor" stroke="none"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 면역 쉴드 프레임 + 전면 홍삼 주근(속공간 비움) + 상단 진생베리',
            customSvg: '<path d="M12 22s8-3.8 8-9.8V4.8L12 2 4 4.8v7.4C4 18.2 12 22 12 22Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M12 7.2c-1.6 0-2.9 2.1-2.9 5 0 3.3 1.4 6.1 2.9 7.4 1.5-1.3 2.9-4.1 2.9-7.4 0-2.9-1.3-5-2.9-5Z" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M9.3 13.5c-1.3.6-2 1.8-2 3.2M14.7 13.5c1.3.6 2 1.8 2 3.2"/><circle cx="10.5" cy="5" r="0.85" fill="currentColor" stroke="none"/><circle cx="13.5" cy="5" r="0.85" fill="currentColor" stroke="none"/>',
          },
        ],
      },
    ],
  },
  {
    keys: ['관절', '연골', '뼈', '칼슘', '보스웰리아', 'msm', '콘드로이친', '글루코사민', '조이스텝', 'joint', 'bone', 'calcium'],
    enCopy: 'joint mobility',
    motifs: [
      {
        id: 'joint',
        title: '관절 · 연골 가동성 (Joint Cushion)',
        enTitle: 'Joint Cushion Care',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '상하 마디가 마주보는 관절 기본 실루엣',
            customSvg: '<path d="M9 3v4a3 3 0 0 0 6 0V3M9 21v-4a3 3 0 0 1 6 0v4"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '상하 관절 + 중앙 전면 연골 완충 캡슐 (전면 캡슐 속공간 비움)',
            customSvg: '<path d="M9 2.5v3.8a3 3 0 0 0 6 0V2.5M9 21.5v-3.8a3 3 0 0 1 6 0v3.8"/><rect x="7.2" y="10.2" width="9.6" height="3.6" rx="1.8" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '관절 + 전면 연골 쿠션(속공간 비움) + 좌우 비간섭 가동성 아크',
            customSvg: '<path d="M9 2.5v3.8a3 3 0 0 0 6 0V2.5M9 21.5v-3.8a3 3 0 0 1 6 0v3.8"/><rect x="7.2" y="10.2" width="9.6" height="3.6" rx="1.8" fill="var(--vb-icon-bg, #FFFFFF)"/><path d="M4.2 8.5a6.5 6.5 0 0 0 0 7M19.8 8.5a6.5 6.5 0 0 1 0 7"/>',
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 바이오 육각 프레임 + 전면 관절 마디 & 연골 쿠션(속공간 비움) + 가동성 아크',
            customSvg: withCrestAndBadge('<path d="M9 2.5v3.8a3 3 0 0 0 6 0V2.5M9 21.5v-3.8a3 3 0 0 1 6 0v3.8" fill="var(--vb-icon-bg, #FFFFFF)"/><rect x="7.2" y="10.2" width="9.6" height="3.6" rx="1.8" fill="var(--vb-icon-bg, #FFFFFF)"/>', 'bio_hex', 'shield'),
          },
        ],
      },
    ],
  },
  {
    keys: ['기억력', '두뇌', '뇌', '인지력', '집중력', '포스파티딜세린', '은행잎', '브레인', 'brain', 'memory', 'focus'],
    enCopy: 'brain focus',
    motifs: [
      {
        id: 'brain',
        title: '두뇌 시냅스 (Brain Synapse)',
        enTitle: 'Neural Synapse',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '좌우 대칭 두뇌 코어 미니멀 라인',
            customSvg: '<path d="M12 4.5a4.5 4.5 0 0 0-4.5 4.5c0 1.4.6 2.6 1.5 3.4A4 4 0 0 0 12 19.5a4 4 0 0 0 3-7.1c.9-.8 1.5-2 1.5-3.4A4.5 4.5 0 0 0 12 4.5Z" fill="var(--vb-icon-bg, #FFFFFF)"/>',
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '두뇌 외곽 + 중앙 분리선 및 좌우 대뇌 주름 디테일',
            customSvg: LIB_SVGS.brain,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '두뇌 시냅스 + 전면 신경 활성 펄스 배지 (속공간 비움)',
            customSvg: withCornerBadge(LIB_SVGS.brain, 'pulse'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 바이오 육각 신경망 링 + 전면 두뇌 코어 & 시냅스 펄스 배지 (속공간 비움)',
            customSvg: withCrestAndBadge(LIB_SVGS.brain, 'bio_hex', 'pulse'),
          },
        ],
      },
    ],
  },
  {
    keys: ['혈행', '혈압', '콜레스테롤', '코엔자임', 'coq10', '오메가', '오메가3', '알티지', '심장', '순환', 'omega', 'heart', 'circulation'],
    enCopy: 'circulation care',
    motifs: [
      {
        id: 'heart',
        title: '심혈관 · 혈행 순환 (Heart Circulation)',
        enTitle: 'Cardio Circulation',
        levels: [
          {
            level: 1,
            label: '1단계 심플',
            desc: '심혈관 하트 코어 미니멀 실루엣',
            customSvg: LIB_SVGS.heart,
          },
          {
            level: 2,
            label: '2단계 베이직',
            desc: '하트 코어 + 내부 바이탈 맥박 파형',
            customSvg: `${LIB_SVGS.heart}<path d="M7.5 12h2l1.3-2.5 2.2 5 1.3-2.5h2.2"/>`,
          },
          {
            level: 3,
            label: '3단계 스탠다드',
            desc: '하트 코어 + 맥박 파형 + 전면 혈류 순환 아크 배지 (속공간 비움)',
            customSvg: withCornerBadge(`${LIB_SVGS.heart}<path d="M7.5 12h2l1.3-2.5 2.2 5 1.3-2.5h2.2"/>`, 'cycle'),
          },
          {
            level: 4,
            label: '4단계 컴플렉스',
            desc: '후면 혈류 순환 듀얼 아크 + 전면 심혈관 하트 코어 & 맥박 배지 (속공간 비움)',
            customSvg: withCrestAndBadge(`${LIB_SVGS.heart}<path d="M7.5 12h2l1.3-2.5 2.2 5 1.3-2.5h2.2"/>`, 'orbit_flow', 'pulse'),
          },
        ],
      },
    ],
  },
];

export function searchMotifClusters(indexData, rawKeyword) {
  const kw = (rawKeyword || '수면').trim();
  const lower = kw.toLowerCase();

  const searchRes = searchCandidateIcons(indexData, kw, 0);
  const candidates = searchRes.candidates || [];
  const fallbackLeafSvg = LIB_SVGS.leaf;

  const badgeOrder = ['leaf', 'drop', 'shield', 'pulse', 'cycle', 'slice', 'hexagon', 'flame'];
  const crestOrder = ['laurel', 'bio_hex', 'orbit_flow', 'shield_crest', 'optic_scan'];

  const makeCumulativeLevels = (baseIcon, baseName, variantIdx = 0) => {
    const rawSvg = baseIcon.innerSvg || fallbackLeafSvg;
    const badge1 = badgeOrder[variantIdx % badgeOrder.length];
    const badge2 = badgeOrder[(variantIdx + 2) % badgeOrder.length];
    const crest = crestOrder[variantIdx % crestOrder.length];

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
        desc: `${baseName} 코어 + 전면 웰니스 포인트 배지 (속공간 비움)`,
        icon: {
          ...baseIcon,
          innerSvg: withCornerBadge(rawSvg, badge1),
        },
      },
      {
        level: 3,
        label: '3단계 스탠다드',
        desc: `${baseName} 코어 + 전면 기능성 쉴드·순환 배지 (속공간 비움)`,
        icon: {
          ...baseIcon,
          innerSvg: withCornerBadge(rawSvg, badge2),
        },
      },
      {
        level: 4,
        label: '4단계 컴플렉스',
        desc: `후면 마스터 크레스트 프레임 + 전면 ${baseName} & 기능성 배지 (속공간 비움)`,
        icon: {
          ...baseIcon,
          innerSvg: withCrestAndBadge(rawSvg, crest, badge1),
        },
      },
    ];
  };

  const allPresets = [...WELLNESS_MOTIF_PRESETS, ...EXTRA_WELLNESS_MOTIF_PRESETS];
  let bestPreset = null;
  let bestScore = 0;

  for (const preset of allPresets) {
    let score = 0;
    for (const k of preset.keys) {
      const kl = k.trim().toLowerCase();
      if (!kl) continue;
      if (lower === kl) {
        score = Math.max(score, 120 + kl.length * 5);
      } else if (kl.length >= 2 && lower.includes(kl)) {
        score = Math.max(score, 30 + kl.length * 8);
      } else if (lower.length >= 2 && kl.includes(lower)) {
        score = Math.max(score, 15 + lower.length * 4);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPreset = preset;
    }
  }

  if (bestPreset && bestScore > 0) {
    const hydratedMotifs = bestPreset.motifs.map(m => ({
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

    // 모티프가 3개 미만인 경우 8,281개 글로벌 스튜디오 아이콘 라이브러리에서 연관 후보를 추가하여 풍부한 선택지 제공
    let extraIdx = 0;
    while (hydratedMotifs.length < 3 && candidates[extraIdx]) {
      const cand = candidates[extraIdx * 3] || candidates[extraIdx];
      if (cand) {
        const mNum = hydratedMotifs.length + 1;
        hydratedMotifs.push({
          id: `lib-${cand.id || mNum}`,
          title: `글로벌 라이브러리 심볼 · ${cand.name || kw}`,
          enTitle: `${bestPreset.enCopy} Symbol ${mNum}`,
          currentLevel: 1,
          levels: makeCumulativeLevels(cand, cand.name || kw, mNum),
        });
      }
      extraIdx++;
    }

    return {
      keyword: kw,
      enCopy: bestPreset.enCopy,
      motifs: hydratedMotifs,
    };
  }

  const base1 = candidates[0] || { name: kw, innerSvg: fallbackLeafSvg };
  const base2 = candidates[4] || candidates[1] || base1;
  const base3 = candidates[8] || candidates[2] || base1;

  return {
    keyword: kw,
    enCopy: searchRes.enCopy,
    motifs: [
      {
        id: 'motif-1',
        title: `모티프 1 · ${base1.name || kw}`,
        enTitle: `${searchRes.enCopy} Core`,
        currentLevel: 1,
        levels: makeCumulativeLevels(base1, base1.name || kw, 0),
      },
      {
        id: 'motif-2',
        title: `모티프 2 · ${base2.name || '보조 심볼'}`,
        enTitle: `${searchRes.enCopy} Variant`,
        currentLevel: 1,
        levels: makeCumulativeLevels(base2, base2.name || '보조 심볼', 1),
      },
      {
        id: 'motif-3',
        title: `모티프 3 · ${base3.name || '확장 심볼'}`,
        enTitle: `${searchRes.enCopy} Extended`,
        currentLevel: 1,
        levels: makeCumulativeLevels(base3, base3.name || '확장 심볼', 2),
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
  const bg = isSolidBadge ? VB_BLACK : '#FFFFFF';
  const strokeW = 2.4;

  // 24x24 원본 픽토그램을 120x120 캔버스 중앙에 시원하게 배치하기 위한 스케일
  let iconScale = 2.65;
  let iconOffsetY = 0;
  if (variantId === 'standalone') {
    iconScale = 4.0;
  } else if (variantId === 'circle-arc') {
    iconScale = 2.4;
    iconOffsetY = 5;
  } else if (variantId === 'circle-solid') {
    iconScale = 2.35;
    iconOffsetY = 1;
  } else if (variantId === 'circle-keyword') {
    iconScale = 2.3;
    iconOffsetY = -9;
  }

  const tx = +(60 - 12 * iconScale).toFixed(2);
  const ty = +(60 - 12 * iconScale + iconOffsetY).toFixed(2);
  const innerStrokeW = +(strokeW / iconScale).toFixed(2);

  const glyphGroup = isFilledSource
    ? `<g transform="translate(${tx} ${ty}) scale(${iconScale})" fill="${fg}" stroke="none" style="--vb-icon-bg:${bg};--vb-icon-fg:${fg};color:${fg};">${candidate.innerSvg}</g>`
    : `<g transform="translate(${tx} ${ty}) scale(${iconScale})" fill="none" stroke="${fg}" stroke-width="${innerStrokeW}" stroke-linecap="round" stroke-linejoin="round" style="--vb-icon-bg:${bg};--vb-icon-fg:${fg};color:${fg};">${candidate.innerSvg}</g>`;

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

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%" style="--vb-icon-bg:${bg};--vb-icon-fg:${fg};color:${fg};">
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
  const isSolidBadge = variantId === 'circle-solid';
  const bg = isSolidBadge ? VB_BLACK : '#FFFFFF';
  const fg = isSolidBadge ? '#FFFFFF' : VB_BLACK;
  let inner = renderVbStyledIconSvg(candidate, variantId, { koText, enText, uid: 'export' })
    .replace(/^[\s\S]*?<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '');
  inner = inner.split('var(--vb-icon-bg, #FFFFFF)').join(bg);
  inner = inner.split('var(--vb-icon-fg, #101820)').join(fg);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="30mm" viewBox="0 0 120 120" style="background:${isSolidBadge ? bg : 'transparent'};">
  ${inner}
</svg>`;
}

/**
 * 전체 .ai 시트 생성: 각 키워드별 모티프 누적 디테일(Lv.1~4) + 바이탈뷰티 6가지 배지 버전 모두 포함
 */
export function buildAllKeywordsSheetSvg(keywordBlocks) {
  const rowHeight = 310;
  const totalH = Math.max(340, keywordBlocks.length * rowHeight + 40);
  const totalW = 960;

  const rowsSvg = keywordBlocks.map((block, bIdx) => {
    const y0 = 24 + bIdx * rowHeight;
    let motifsOrCandsSvg = '';
    let primaryIcon = null;

    if (block.motifs && block.motifs.length) {
      const allLevels = [];
      block.motifs.forEach((m, mIdx) => {
        m.levels.forEach((lvl, lIdx) => {
          allLevels.push({
            motifTitle: m.title,
            level: lvl.level,
            label: lvl.label,
            icon: lvl.icon,
            isPrimary: mIdx === 0 && lIdx === 0,
          });
        });
      });

      primaryIcon = block.motifs[0]?.levels[0]?.icon || null;

      motifsOrCandsSvg = allLevels.slice(0, 12).map((item, cIdx) => {
        const cx = 24 + cIdx * 76;
        const cy = y0 + 26;
        const glyph = item.icon?.setCode === 'F'
          ? `<g transform="translate(${cx + 20} ${cy + 10}) scale(1.4)" fill="${VB_BLACK}" stroke="none">${item.icon.innerSvg}</g>`
          : `<g transform="translate(${cx + 20} ${cy + 10}) scale(1.4)" fill="none" stroke="${VB_BLACK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${item.icon ? item.icon.innerSvg : ''}</g>`;
        return `
          <rect x="${cx}" y="${cy}" width="68" height="66" fill="#FFFFFF" stroke="${item.isPrimary ? VB_BLACK : '#D5D8DE'}" stroke-width="${item.isPrimary ? 1.5 : 0.7}" rx="3"/>
          ${glyph}
          <text x="${cx + 34}" y="${cy + 58}" text-anchor="middle" fill="#666B75" font-size="7" font-family="'Noto Sans KR',sans-serif">Lv.${item.level} ${escXml(item.label)}</text>`;
      }).join('');
    } else if (block.candidates && block.candidates.length) {
      primaryIcon = block.selectedCandidate || block.candidates[0];
      motifsOrCandsSvg = block.candidates.map((cand, cIdx) => {
        const cx = 24 + cIdx * 72;
        const cy = y0 + 28;
        const glyph = cand.setCode === 'F'
          ? `<g transform="translate(${cx + 16} ${cy + 10}) scale(1.35)" fill="${VB_BLACK}" stroke="none">${cand.innerSvg}</g>`
          : `<g transform="translate(${cx + 16} ${cy + 10}) scale(1.35)" fill="none" stroke="${VB_BLACK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${cand.innerSvg}</g>`;
        return `
          <rect x="${cx}" y="${cy}" width="64" height="64" fill="#FFFFFF" stroke="${cand.id === primaryIcon?.id ? VB_BLACK : '#D5D8DE'}" stroke-width="${cand.id === primaryIcon?.id ? 1.5 : 0.7}"/>
          ${glyph}
          <text x="${cx + 32}" y="${cy + 56}" text-anchor="middle" fill="#666B75" font-size="7.5" font-family="'Noto Sans KR',sans-serif">${escXml(cand.tierLabel)}</text>`;
      }).join('');
    }

    const variantsSvg = VB_ICON_VARIANTS.map((v, vIdx) => {
      const vx = 24 + vIdx * 152;
      const vy = y0 + 112;
      const inner = primaryIcon ? renderVbStyledIconSvg(primaryIcon, v.id, {
        koText: block.keyword,
        enText: block.enCopy,
        uid: `sheet-${bIdx}-${vIdx}`,
      })
        .replace(/^[\s\S]*?<svg[^>]*>/i, '')
        .replace(/<\/svg>\s*$/i, '') : '';
      return `
        <rect x="${vx}" y="${vy}" width="142" height="150" fill="#FFFFFF" stroke="#D5D8DE" stroke-width="0.7" rx="4"/>
        <g transform="translate(${vx + 23} ${vy + 10}) scale(0.8)">${inner}</g>
        <text x="${vx + 71}" y="${vy + 138}" text-anchor="middle" fill="#4A505C" font-size="9" font-family="'Noto Sans KR',sans-serif">${escXml(v.label)}</text>`;
    }).join('');

    return `
      <text x="24" y="${y0 + 16}" fill="${VB_BLACK}" font-size="13" font-weight="700" font-family="'Noto Sans KR',sans-serif">${escXml(block.keyword)} <tspan fill="#7A808C" font-weight="400" font-size="11">${escXml(block.enCopy)}</tspan></text>
      ${motifsOrCandsSvg}
      ${variantsSvg}`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}pt" height="${totalH}pt" viewBox="0 0 ${totalW} ${totalH}">
  <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#FFFFFF"/>
  ${rowsSvg}
</svg>`;
}

export { buildIllustratorAiBlob };
