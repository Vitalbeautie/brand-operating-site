export const DEFAULT_BRAND = {
  "brandId": "vitalbeautie",
  "brandName": "VITALBEAUTIE",
  "brandNameKo": "바이탈뷰티",
  "tagline": "HIGH-PERFORMANCE WELLNESS, VITALBEAUTIE",

  "theme": {
    "primaryColor": "#101820",
    "secondaryColor": "#202630",
    "accentColor": "#9C874A",
    "backgroundColor": "#FFFFFF",
    "surfaceColor": "#FFFFFF",
    "textColor": "#101820",
    "textSecondary": "#555E70",
    "borderColor": "rgba(0, 0, 0, 0.08)",
    "fontHeading": "'Raleway', 'Outfit', sans-serif",
    "fontBody": "'RIX-신고딕se-pro', 'RIX-신고딕', 'Noto Sans KR', sans-serif"
  },

  "strategy": {
    "purpose": {
      "title": "Brand Philosophy",
      "content": "진정한 아름다움은 내면에서 가꾸어 외면으로 나타난다.",
      "mission": "아모레퍼시픽의 70여 년 피부과학 연구를 기반으로, 과학적으로 검증된 고효능 웰니스 솔루션을 제공한다.",
      "vision": "Lab-proven High Performance Wellness — 신체 기능 강화와 일상의 활력을 더하는 글로벌 No.1 이너뷰티 루틴",
      "values": ["High-Performance Wellness", "Lab-Proven Science", "Inner & Outer Balance", "Clinical Evidence"]
    },
    "personality": {
      "title": "Brand Personality",
      "keywords": ["High-Performance", "Lab-Proven", "Scientific", "Refined Elegance"],
      "spectrum": [
        { "axis": "Scientific ↔ Emotional", "position": 25 },
        { "axis": "High-Performance ↔ Mild", "position": 20 },
        { "axis": "Modern Architectural ↔ Decorative", "position": 15 },
        { "axis": "Global Standard ↔ Local", "position": 18 }
      ]
    },
    "principles": {
      "title": "Brand Principles",
      "main": "High-Performance Wellness by V=B Laboratory",
      "description": "과학적 검증(Lab-Proven)을 바탕으로 한 절제된 아름다움과 타협 없는 효능.",
      "subPrinciples": [
        "신뢰할 수 있는 임상 시험과 바이탈뷰티랩의 연구 자산에 기반한다",
        "순백의 캔버스와 글로시 실버, 블랙 실크의 건축적 조형미를 추구한다",
        "채널별(이커머스/뉴커머스) 제품 위계와 고유의 팬톤 컬러 시스템을 엄격히 준수한다"
      ]
    },
    "guidelineRules": {
      "logoEnMinSizeMm": 20,
      "logoKoMinSizeMm": 30,
      "symbolMinSizeMm": 15,
      "clearSpace": "1X (로고/심볼 높이 X 기준 4방향 여백 확보)",
      "colorRule": "0~50% 밝은 배경: VITALBEAUTIE Black 사용 / 50~100% 어두운 배경 및 유색 배경: White 사용"
    }
  },

  "typography": {
    "heading": {
      "fontFamily": "Raleway",
      "purchaseUrl": "https://fonts.google.com/specimen/Raleway",
      "license": "SIL Open Font License",
      "weights": ["Light (300)", "Regular (400)", "Medium (500)", "SemiBold (600)", "Bold (700)", "ExtraBold (800)"],
      "usage": "글로벌 영문 로고타입, 헤드라인, 웰니스 수치, 캡션"
    },
    "body": {
      "fontFamily": "RIX-신고딕se-pro",
      "webAlternative": "Noto Sans KR / Pretendard",
      "license": "RixFont Commercial License",
      "weights": ["L (Light)", "R (Regular)", "M (Medium)", "B (Bold)", "EB (ExtraBold)"],
      "usage": "국문 로고타입, 제품명, 전성분, 패키지 표시사항, 인쇄 조판"
    },
    "scale": [
      { "name": "Display Large", "size": "44px", "weight": "800", "lineHeight": "1.15", "letterSpacing": "3px" },
      { "name": "Heading 1", "size": "32px", "weight": "700", "lineHeight": "1.25", "letterSpacing": "2px" },
      { "name": "Heading 2", "size": "24px", "weight": "600", "lineHeight": "1.3", "letterSpacing": "1.5px" },
      { "name": "Section Eyebrow", "size": "11px", "weight": "700", "lineHeight": "1.4", "letterSpacing": "2px" },
      { "name": "Body Text", "size": "13px", "weight": "400", "lineHeight": "1.7", "letterSpacing": "0px" },
      { "name": "Caption & Spec", "size": "11px", "weight": "400", "lineHeight": "1.5", "letterSpacing": "0.5px" }
    ]
  },

  "colors": {
    "core": [
      {
        "name": "VITALBEAUTIE BLACK",
        "hex": "#101820",
        "rgb": "16, 24, 32",
        "cmyk": "82.19, 68.18, 66.46, 88.93",
        "pantone": "PANTONE Black 6c / Solid coated",
        "usage": "워드마크, LAB PROVEN 심볼, 주요 패키지 타이틀"
      },
      {
        "name": "PURE WHITE",
        "hex": "#FFFFFF",
        "rgb": "255, 255, 255",
        "cmyk": "0, 0, 0, 0",
        "pantone": "White",
        "usage": "에디토리얼 배경, 50% 이상 유색 배경 로고"
      },
      {
        "name": "CHAMPAGNE GOLD",
        "hex": "#9C874A",
        "rgb": "156, 135, 74",
        "cmyk": "20, 30, 70, 20",
        "pantone": "PANTONE 871 C (Gold Metallic)",
        "usage": "뉴커머스 골드 라인, 프리미엄 엠블럼"
      }
    ],

    /* 채널별 카테고리 & 제품별 공식 팬톤 컬러 매핑 (이미지 스펙 동기화) */
    "channels": {
      "ecommerce": {
        "channelName": "이커머스",
        "categories": [
          {
            "categoryName": "이커머스 · 이너뷰티",
            "products": [
              { "name": "슈퍼에센셜", "pantone": "PANTONE 213 C", "hex": "#E31C79", "rgb": "227, 28, 121", "cmyk": "0, 92, 18, 0" },
              { "name": "슈퍼콜라겐", "pantone": "PANTONE 230 C", "hex": "#F4A6D7", "rgb": "244, 166, 215", "cmyk": "1, 41, 0, 0" },
              { "name": "슈퍼레티놀 C", "pantone": "PANTONE 394 C", "hex": "#EDE939", "rgb": "237, 233, 57", "cmyk": "6, 0, 72, 0" },
              { "name": "슈퍼시카 B5", "pantone": "PANTONE 353 C", "hex": "#80E0A7", "rgb": "128, 224, 167", "cmyk": "41, 0, 36, 0" },
              { "name": "슈퍼콜라겐 케라핏", "pantone": "PANTONE 230 C", "hex": "#F4A6D7", "rgb": "244, 166, 215", "cmyk": "1, 41, 0, 0" },
              { "name": "슈퍼 바이오틱스", "pantone": "PANTONE 2645 C", "hex": "#AD96DC", "rgb": "173, 150, 220", "cmyk": "40, 44, 0, 0" },
              { "name": "슈퍼콜라겐 PDRN", "pantone": "PANTONE 2345 C", "hex": "#FF6D6A", "rgb": "255, 109, 106", "cmyk": "0, 59, 50, 0" },
              { "name": "슈퍼레티놀 젤리", "pantone": "PANTONE 3945 C", "hex": "#F3E500", "rgb": "243, 229, 0", "cmyk": "3, 0, 90, 0" }
            ]
          },
          {
            "categoryName": "이커머스 · 슬리밍",
            "products": [
              { "name": "메타그린 슬림업", "pantone": "PANTONE 348 C", "hex": "#00843D", "rgb": "0, 132, 61", "cmyk": "96, 2, 100, 12" },
              { "name": "메타그린 부스터샷 7일", "pantone": "PANTONE 348 C", "hex": "#00843D", "rgb": "0, 132, 61", "cmyk": "96, 2, 100, 12" },
              { "name": "메타그린 젤리 이너컷", "pantone": "PANTONE 348 C", "hex": "#00843D", "rgb": "0, 132, 61", "cmyk": "96, 2, 100, 12" },
              { "name": "메타그린 젤리 더블컷", "pantone": "PANTONE 144 C", "hex": "#ED8B00", "rgb": "237, 139, 0", "cmyk": "0, 51, 100, 0" },
              { "name": "메타그린 젤리 애사비", "pantone": "PANTONE 3546 C", "hex": "#C00D1E", "rgb": "192, 13, 30", "cmyk": "2, 100, 99, 4" },
              { "name": "메타그린 클린티", "pantone": "PANTONE 2270 C", "hex": "#2DC84D", "rgb": "45, 200, 77", "cmyk": "61, 0, 73, 0" },
              { "name": "메타그린 크레아틴", "pantone": "PANTONE 348 C", "hex": "#00843D", "rgb": "0, 132, 61", "cmyk": "96, 2, 100, 12" }
            ]
          },
          {
            "categoryName": "이커머스 · 기억력",
            "products": [
              { "name": "에너지샷 바디앤브레인", "pantone": "PANTONE 294 C", "hex": "#002F6C", "rgb": "0, 47, 108", "cmyk": "100, 69, 7, 30" }
            ]
          },
          {
            "categoryName": "이커머스 · 숙면",
            "products": [
              { "name": "굿슬립 가바 365", "pantone": "PANTONE 2112 C", "hex": "#351F65", "rgb": "53, 31, 101", "cmyk": "97, 96, 0, 41" }
            ]
          },
          {
            "categoryName": "이커머스 · 유산균",
            "products": [
              { "name": "녹차에서 온 유산균", "pantone": "PANTONE 802 C", "hex": "#44D62C", "rgb": "68, 214, 44", "cmyk": "51, 0, 85, 0" }
            ]
          }
        ]
      },

      "newcommerce": {
        "channelName": "뉴커머스",
        "categories": [
          {
            "categoryName": "뉴커머스 · 콜라겐",
            "products": [
              { "name": "슈퍼콜라겐 플래티넘", "pantone": "PANTONE 214 C", "hex": "#CE0F69", "rgb": "206, 15, 105", "cmyk": "0, 100, 24, 4" },
              { "name": "슈퍼콜라겐 골드", "pantone": "PANTONE 214 C", "hex": "#CE0F69", "rgb": "206, 15, 105", "cmyk": "0, 100, 24, 4" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 우먼",
            "products": [
              { "name": "우먼밸런스 플래티넘", "pantone": "PANTONE 207 C", "hex": "#A60034", "rgb": "166, 0, 52", "cmyk": "5, 100, 48, 22" },
              { "name": "우먼밸런스 골드", "pantone": "PANTONE 207 C", "hex": "#A60034", "rgb": "166, 0, 52", "cmyk": "5, 100, 48, 22" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 뉴트리션",
            "products": [
              { "name": "올인원 멀티팩", "pantone": "PANTONE 871 C", "hex": "#84754E", "rgb": "132, 117, 78", "cmyk": "0, 17, 55, 50" },
              { "name": "액티브 멀티팩", "pantone": "PANTONE 165 C", "hex": "#FF671F", "rgb": "255, 103, 31", "cmyk": "0, 70, 100, 0" },
              { "name": "멀티비타민 미네랄", "pantone": "PANTONE 165 C", "hex": "#FF671F", "rgb": "255, 103, 31", "cmyk": "0, 70, 100, 0" },
              { "name": "비타클렌즈", "pantone": "PANTONE 1505 C", "hex": "#FF6900", "rgb": "255, 105, 0", "cmyk": "0, 56, 90, 0" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 유산균",
            "products": [
              { "name": "프로바이오틱스 골드", "pantone": "PANTONE 1235 C", "hex": "#FFB81C", "rgb": "255, 184, 28", "cmyk": "0, 31, 98, 0" },
              { "name": "프로바이오틱스&이뮨", "pantone": "PANTONE 1235 C", "hex": "#FFB81C", "rgb": "255, 184, 28", "cmyk": "0, 31, 98, 0" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 관절.근육",
            "products": [
              { "name": "조이스텝", "pantone": "PANTONE 2173 C", "hex": "#0084D5", "rgb": "0, 132, 213", "cmyk": "88, 31, 0, 0" },
              { "name": "오메가케어", "pantone": "PANTONE 301 C", "hex": "#004B87", "rgb": "0, 75, 135", "cmyk": "100, 53, 4, 19" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 눈.간",
            "products": [
              { "name": "트루아이", "pantone": "PANTONE 2746 C", "hex": "#171CBF", "rgb": "23, 28, 143", "cmyk": "100, 98, 0, 0" },
              { "name": "리버프라임", "pantone": "PANTONE 2091 C", "hex": "#4C12A1", "rgb": "76, 18, 161", "cmyk": "86, 88, 0, 0" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 신진대사",
            "products": [
              { "name": "메타그린 골드", "pantone": "PANTONE 348 C", "hex": "#00843D", "rgb": "0, 132, 61", "cmyk": "96, 2, 100, 12" },
              { "name": "메타그린 멀티팩", "pantone": "PANTONE 348 C", "hex": "#00843D", "rgb": "0, 132, 61", "cmyk": "96, 2, 100, 12" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 구강",
            "products": [
              { "name": "덴프레쉬", "pantone": "PANTONE 3252 C", "hex": "#2AD2C9", "rgb": "42, 210, 201", "cmyk": "49, 0, 23, 0" }
            ]
          },
          {
            "categoryName": "뉴커머스 · 명작수",
            "products": [
              { "name": "극진단 금분", "pantone": "Pantone 미지정", "chipLabel": "금분", "hex": "#F5F5F7", "rgb": "245, 245, 247", "cmyk": "0, 0, 0, 4", "isSpecial": true },
              { "name": "명작수", "pantone": "PANTONE 4625 C", "hex": "#4F2C1D", "rgb": "79, 44, 29", "cmyk": "30, 72, 74, 80" },
              { "name": "명작수 EC", "pantone": "PANTONE 4685 C", "hex": "#E0C8AD", "rgb": "224, 198, 173", "cmyk": "2, 15, 23, 5" },
              { "name": "명작수 OY", "pantone": "PANTONE 4685 C", "hex": "#E0C8AD", "rgb": "224, 198, 173", "cmyk": "2, 15, 23, 5" },
              { "name": "명작수 활", "pantone": "PANTONE 289 C", "hex": "#0C2340", "rgb": "12, 35, 64", "cmyk": "100, 76, 12, 70" },
              { "name": "명작수 천", "pantone": "Pantone 미지정", "chipLabel": "지류 비터 초콜릿", "hex": "#F5F5F7", "rgb": "245, 245, 247", "cmyk": "0, 0, 0, 4", "isSpecial": true }
            ]
          }
        ]
      }
    }
  },

  "material": {
    "title": "패키지 소재 & 후가공 사양 (Material Guidelines)",
    "recommendations": [
      {
        "name": "글로시 유광 소재 (Glossy Finish)",
        "description": "광택이 없는 매트한 소재보다는 생명력과 신뢰를 극대화하는 고광택 유광 코팅을 권장합니다.",
        "usage": "단상자 겉면, 라벨 표면"
      },
      {
        "name": "은소지 · 실버 계열 (Silver Substrate)",
        "description": "빛을 반사하는 실버 베이스 기재를 활용하여 바이탈뷰티랩의 과학적·임상적 프리미엄 감도를 구현합니다.",
        "usage": "프리미엄 라인 단상자, 앰플 라벨"
      },
      {
        "name": "형압 · 블랙실크 (Embossing & Black Silk Screen)",
        "description": "심볼마크와 로고타입에 입체적인 형압(Embossing) 및 농밀한 블랙실크 인쇄를 적용하여 촉각적 하이엔드 퀄리티를 완성합니다.",
        "usage": "LAB PROVEN 심볼, 전면 브랜드 로고"
      }
    ]
  },

  "assets": {
    "categories": [
      { "id": "wordmark-en", "name": "영문 로고 (VITALBEAUTIE)", "icon": "🔤", "formats": ["SVG", "PNG", "AI"], "count": 4 },
      { "id": "wordmark-ko", "name": "국문 로고 (바이탈뷰티)", "icon": "🇰🇷", "formats": ["SVG", "PNG", "AI"], "count": 2 },
      { "id": "symbol-lab", "name": "공식 심볼 (LAB PROVEN)", "icon": "🔬", "formats": ["SVG", "PNG", "AI"], "count": 4 },
      { "id": "pdf-guideline", "name": "브랜드 아이덴티티 가이드라인 PDF", "icon": "📄", "formats": ["PDF"], "count": 1 },
      { "id": "product-map", "name": "전체 제품맵 (이커머스/뉴커머스)", "icon": "🗺️", "formats": ["PNG", "PDF"], "count": 1 },
      { "id": "pantone-palette", "name": "채널별 팬톤 컬러 칩 (30종)", "icon": "🎨", "formats": ["ASE", "JSON"], "count": 30 }
    ]
  },

  "versions": [
    { "version": "v3.1", "date": "2026.11", "summary": "공식 가이드라인 PDF 적용: LAB PROVEN 심볼, RIX신고딕/Raleway 서체, 전 제품 팬톤 컬러맵 구축", "type": "major" },
    { "version": "v3.0", "date": "2026.10", "summary": "AP Beauty 룩앤필 디자인 시스템 및 거버넌스 프레임워크 완성", "type": "major" }
  ]
};
