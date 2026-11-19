/* ═══════════════════════════════════════════════════════════════════════════
   VITALBEAUTIE 통합 디자인 가이드 엑셀 내보내기 유틸리티
   - 전면 / 측면 / 후면 / 상단 / 하단 / 글로벌(US/JP) / 엑셀 문안 템플릿 / 파일명 규칙
   ═══════════════════════════════════════════════════════════════════════════ */

import * as XLSX from 'xlsx';

export function generateIntegratedGuideExcelBlob() {
  const wb = XLSX.utils.book_new();

  // 1. 브랜드 및 제품 라인 개요
  const sheet1Data = [
    ['VITALBEAUTIE 통합 패키지 디자인 가이드 및 인쇄 규격 총괄표', '', '', '', ''],
    ['최종 개정일', '2026.11.26', '버전', 'v2.8 Master Approved', ''],
    ['', '', '', '', ''],
    ['제품 라인', '라인 영문명', '메인 팬톤 컬러 (Pantone)', 'HEX 색상', '로고 태그 팬톤 (상단 바)'],
    ['메타그린', 'META GREEN', 'PANTONE 348 C', '#00843D', 'PANTONE 389 C (#CEDC00)'],
    ['이너뷰티', 'INNER BEAUTY', 'PANTONE 230 C / 제품별 포인트 컬러', '#EDEDED 베이스 / #F6B9D4 등', 'PANTONE 230 C / 포인트 팬톤'],
    ['뉴커머스', 'NEW COMMERCE', 'PANTONE 294 C / 네이비', '#1C264A', 'PANTONE 871 C / 골드 (#D4AF37)'],
    ['', '', '', '', ''],
    ['[주요 폰트 규격]', '', '', '', ''],
    ['국문 (KR)', 'Rix신고딕SE_Pro (Bold / Medium / Light) / 210 옴니고딕', '', '', ''],
    ['영문 (US)', 'Alright Sans (Bold / Medium / Light) / Arial', '', '', ''],
    ['일문 (JP)', 'Noto Sans JP (Bold / Medium / Regular)', '', '', ''],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 28 }, { wch: 18 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, ws1, '01.브랜드_라인개요');

  // 2. 전면(주표시면) 디자인 규칙
  const sheet2Data = [
    ['구분', '건강기능식품 (부스터샷, 젤리 더블컷, 슬림업 등)', '일반식품 (젤리 애사비, 클린티, 효소, 브이레디 등)', '비고 및 법적 근거'],
    ['상단 베다 바', '두께 1.5mm (PANTONE 389C)', '두께 1.5mm (PANTONE 389C)', '소형 판형(폭<60mm)은 1.2mm 허용'],
    ['로고 태그', '상단 43.59mm × 높이 6.47mm 사다리꼴 태그', '상단 43.59mm × 높이 6.47mm 사다리꼴 태그', '전면 중앙 정렬 (편차 0mm)'],
    ['태그~제품명 간격', '5.0mm', '5.0mm', '가이드 실측 명시값'],
    ['제품명 타이포', '라인명 Bold 26pt + 제품명 Light 26pt (장평 100%)', '라인명 Bold 26pt + 제품명 Light 26pt (장평 100%)', '가로폭 초과 시 두 줄 자동 개행'],
    ['원료명 배치 및 크기', '제품명 바로 아래 3.0~3.5mm 간격 배치\n반드시 제품명의 1/2 크기 (26pt 기준 13pt Light)', '제품명 밑이 아닌 패키지 하단(용량 위 3.0mm) 배치\n반드시 14pt Medium (투명도 70%)', '건기식: 1/2 사이즈 필수\n일반식품: 하단 14pt 70% 필수'],
    ['내용량 (용량) 표기', '하단 안전마진 3.0mm 이격, 정중앙 정렬\n10pt Medium / 장평 90% / 자간 -5\n「건강기능식품」 문구 선행 표기', '하단 안전마진 3.0mm 이격, 정중앙 정렬\n10pt Medium / 장평 90% / 자간 -5\n열량(kcal) 필수 병기', '식약처 표시기준 10pt 준수'],
    ['건강기능식품 도안', '15×15mm 공식 마크 (전면 하단 우측 배치)', '표시 금지 (도안 및 오인 문구 일체 불가)', '식약처 고시 및 브랜드 필수'],
    ['상단 (TOP)', 'PANTONE 389C 베다 배경\n접었을 때 정방향이 되도록 180도 반전 VITALBEAUTIE 로고', 'PANTONE 389C 베다 배경\n접었을 때 정방향이 되도록 180도 반전 VITALBEAUTIE 로고', '상단 개봉부 슬로건 또는 로고'],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [{ wch: 20 }, { wch: 45 }, { wch: 45 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws2, '02.전면_주표시면_규칙');

  // 3. 측면 및 후면(정보표시면) 규칙
  const sheet3Data = [
    ['항목', '규정 수치 및 상세 기준', '허용 편차 / 예외', '적용 예시'],
    ['좌우 안전 마진', '양옆 2.0mm 마진 (availWidth = 패널 폭 - 4.0mm)', '최소 1.8mm 이상 유지', '모든 본문 문안은 좌우 2mm 안쪽에 배치'],
    ['후면 상단 제품명', '판형에 따라 분기 적용:\n- 표준/대형 판형 (부스터샷, 클린티 등): 15.0pt Bold (장평 90%)\n- 세로 슬림 판형 (젤리 더블컷 등): 13.0pt Bold (장평 90%)', '라인명 Bold + 제품명 Light 구성', '메타그린 부스터샷 7일 (15pt)\n메타그린 젤리 더블컷 (13pt)'],
    ['본문 법정 의무문안', '반드시 10.0pt (Rix신고딕SE_Pro, 장평 90%)\n분류명 및 항목명은 Bold, 상세 내용은 Medium/Light', '법정 최소 10pt 하한선 미달 불가', '섭취량 및 섭취방법, 섭취 시 주의사항 등'],
    ['분류 간 구분선', '두께 0.3mm 가로 실선\n선 위 1.5mm 간격, 선 아래 1.5mm 간격 (위아래 1.5mm)', '1.5mm 간격 고정', '문안 항목이 바뀔 때마다 자동 삽입'],
    ['제조번호/소비기한 흰색 박스 (KR)', '높이 반드시 11.0mm 고정\n단상자 하단 칼선에서 반드시 15.0mm 띄움\n박스 가로 길이는 단상자 폭에 맞춤', '소비기한 박스 위 1.5mm 구분선 배치', '흰색 박스 바로 위에 「제조번호」 / 「소비기한」 표기\n우측 하단에 「까지」 표기'],
    ['하단 고객센터/제조원 블록', '하단 15mm 여백 영역에 교환문의처, 고객상담전화, 제조원, 반품교환소재지 배치', '10pt 본문 행간 적용', '교환문의처 구입처 및 고객상담실 / 080-023-5454'],
    ['문안 넘침(Overflow) 감지', '문안이 너무 많아 패널 한계를 넘거나 소비기한 박스를 침범할 경우 빨간색 경고', '줄바꿈 및 자간 미세 조정', '오버플로우 발생 시 시뮬레이션 창에 붉은색 알림'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3['!cols'] = [{ wch: 22 }, { wch: 50 }, { wch: 30 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, ws3, '03.측면_후면_상세규칙');

  // 4. 글로벌 로컬라이제이션(미국 US & 일본 JP)
  const sheet4Data = [
    ['국가', '구분', '타이포그래피 및 레이아웃 규칙', '비고 및 FDA/후생노동성 규격'],
    ['미국 (US)', '전면 상단 바', '1.5mm (PANTONE 389C)', '한국과 동일'],
    ['미국 (US)', '전면 태그 간격', '5.0mm', '한국과 동일'],
    ['미국 (US)', '전면 제품명', '라인명 Alright Sans Bold 21pt / 100%\n제품명 Alright Sans Medium 21pt / 100%', '두 줄 개행 지원 (META GREEN / BOOSTER SHOT GL)'],
    ['미국 (US)', '전면 서브타이틀', '제품명 아래 3.5mm 간격\nDietary Supplement (Alright Sans Bold 12pt / 100%)', '향/플레이버 표기 시 그 아래 3.5mm 간격 10pt Light'],
    ['미국 (US)', '전면 내용량', '하단 3.0mm 여백, Alright Sans Medium 8pt / 100%', '7 - 0.95 oz (26.97 g) Bottles / Net Wt. 6.66 oz (188.79 g)'],
    ['미국 (US)', '후면 Supplement Facts', '화이트 배경 + 블랙 0.75pt 테두리 박스\n헤더 Arial Black 19pt, 서브헤더 Arial Bold 9pt / 90%', 'FDA 필수 포맷'],
    ['미국 (US)', '후면 면책 문구 박스', '화이트 배경 + 블랙 0.75pt 테두리\n**These statements have not been evaluated...', 'FDA 필수 문구'],
    ['미국 (US)', '측면 일반 문안', 'Alright Sans Light 7pt / 90% (제목 Medium 7pt)\n문안 블록 간 간격 3.0mm', 'Other Ingredients, Warnings, Suggested Use 등'],
    ['미국 (US)', '소비기한 박스 (US)', '높이 12.0mm 화이트 박스 고정 (하단 15mm 위치)', 'Lot number / Best by (MM/DD/YYYY)'],
    ['일본 (JP)', '전면 제품명', 'Noto Sans JP Bold 22pt + Medium 22pt', 'メタグリーン スリムアップ'],
    ['일본 (JP)', '전면 서브타이틀', '機能性表示食品 (Noto Sans JP Bold 9.5pt)', '일반식품은 미표기'],
    ['일본 (JP)', '전면 내용량', '하단 3.0mm, Noto Sans JP Medium 10pt', '保健機能食品 75.6g (420mg × 180錠)'],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
  ws4['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, ws4, '04.글로벌_미국_일본규정');

  // 5. 승인 엑셀 업로드용 문안 템플릿 양식
  const sheet5Data = [
    ['Code', 'Product Line', 'Product Name', 'Language', 'Package Type', 'Panel', 'Field Key', 'Text Content'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'FRONT', '제품명', '메타그린 부스터샷 GL'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'FRONT', '내용량', '188.79 g [26.97 g x 7 EA]'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'FRONT', '원재료명', 'APIC대두배아열수추출물등복합물, 녹차추출물, 바나바잎추출물, 비타민B1, 판토텐산'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'TOP', '로고', 'VITALBEAUTIE'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'RIGHT', '영양기능정보', '1일 섭취량 : 27.19 g (액상 26.35 g+정제 0.84 g)\n1일 섭취량 당 함량 : 열량 15 kcal, 탄수화물 4 g (1%), 당류 0 g, 단백질 0 g (0%), 지방 0 g (0%), 나트륨 5 mg (0%), 비타민C 30 mg (30%), 판토텐산 25 mg (500%), 카테킨 360 mg, Daidzin, Glycitin, Genistin의 합 36 mg, L-카르니틴 300 mg\n※ ( )안의 수치는 1일 영양성분 기준치에 대한 비율임\n녹차추출물 항산화·체지방 감소·혈중 콜레스테롤 개선에 도움을 줄 수 있음\nAPIC대두배아열수추출물등복합물 체지방 감소에 도움을 줄 수 있음\n비타민C 항산화 작용을 하여 유해 산소로부터 세포를 보호하는데 필요\n판토텐산 지방, 탄수화물, 단백질 대사와 에너지 생성에 필요'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'RIGHT', '정보', '본 제품은 난류(가금류), 우유, 메밀, 땅콩, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토, 아황산류, 호두, 닭고기, 쇠고기, 오징어, 조개류, 잣을 사용한 제품과 같은 제조시설에서 제조하고 있습니다.'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'RIGHT', '교환문의처', '구입처 및 고객상담실 080-023-5454\n제조원 : (주)아모레퍼시픽\n반품교환소재지 : 서울특별시 용산구 한강대로 100'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'BACK', '제품명', '메타그린 부스터샷 7일'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'BACK', '제품 설명', '다이어트 정체기, 흡수 빠른 앰플로 집중 공략 다이어트 체지방 감소 2중 기능성으로 달라지는 눈바디를 도와주는 슬리밍 앰플'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'BACK', '섭취량 및 섭취방법', '성인 1일 1회, 1 앰플을 흔들어 섭취하세요. 상단 실링지를 제거하여 정제를 꺼내신 후, 하단의 액상과 함께 섭취하세요.'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'BACK', '섭취 시 주의사항', '어린이, 임산부 및 수유부는 섭취를 피해주시기 바랍니다. 식사후 섭취해주시기 바랍니다. 카페인이 함유되어있어 초조감, 불면 등을 나타낼 수 있습니다. 카페인을 함유한 식품의 섭취에 주의해주시기 바랍니다. 간질환이 있거나 의약품 복용 시 전문가와 상담하시기 바랍니다. 대두함유'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'BACK', '주의사항', '보관 방법에 따라 식물성 침전물이 생길 수 있으나, 이는 APIC대두배아열수추출물등 복합물 원료특성상 생길 수 있는 현상으로 안심하고 드셔도 됩니다.'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'BACK', '보관상 주의사항', '직사광선 및 고온 다습한 곳을 피하여 서늘한 장소에 보관 하시고 개봉 후에는 바로 드시기 바랍니다. (살균제품)\n원료명 및 기타 사항은 설명서에 표기되어있습니다.'],
    ['110771617', '메타그린', '부스터샷 GL', 'KR', 'Carton', 'BOTTOM', '이력추적관리번호', 'www.tfood.go.kr에서 건강기능식품이력추적관리번호를 입력하시면 건강기능식품의 정보를 확인하실 수 있습니다.'],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(sheet5Data);
  ws5['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws5, '05.문안템플릿_입력양식');

  // 6. 파일 명명 규칙
  const sheet6Data = [
    ['포맷 규칙', '파일명 예시', '설명'],
    ['바이탈(년도)제품명_분류_코드_날짜.ai', '바이탈(26)메타그린부스터샷_단_1315_261126.ai', '2026년 메타그린 부스터샷 단상자 (코드: 1315, 저장일: 261126)'],
    ['분류 약어: 단상자', '단', '단상자 패키지'],
    ['분류 약어: 파우치', '파', '스틱/파우치 패키지'],
    ['분류 약어: 앰플', '앰', '액상 앰플 용기/패키지'],
    ['분류 약어: 라벨', '라', '용기 부착형 라벨'],
    ['분류 약어: 용기', '용', '보틀/용기 직접 인쇄'],
  ];
  const ws6 = XLSX.utils.aoa_to_sheet(sheet6Data);
  ws6['!cols'] = [{ wch: 32 }, { wch: 45 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws6, '06.파일명_명명규칙');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadIntegratedGuideExcelFile(filename = 'VITALBEAUTIE_Integrated_Design_Guide_2026.xlsx') {
  const blob = generateIntegratedGuideExcelBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

