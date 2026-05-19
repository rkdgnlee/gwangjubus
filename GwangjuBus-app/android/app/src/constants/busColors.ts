// 도시별, 버스 종류별 색상 매핑
// 사용법: BUS_TYPE_COLORS[도시이름][버스종류]

export const BUS_TYPE_COLORS: Record<string, Record<string, string>> = {
  "광주": {
    "급행": "#FF5C5C", // 예: 붉은 계열
    "간선": "#4A90E2", // 예: 파란 계열
    "지선": "#F5A623", // 예: 노란/주황 계열
    "마을": "#7ED321", // 예: 초록 계열
    "공항": "#9013FE", 
  },
  "서울": {
    "간선": "#374CAB", // 파랑
    "지선": "#5BB025", // 초록
    "광역": "#E60012", // 빨강
    "순환": "#F2B70A", // 노랑
  },
  // 여기에 다른 도시를 계속 추가하세요
  "부산": {
    "일반": "#0095DA",
    "급행": "#F05A28",
  }
};

// 매핑된 색상이 없을 경우 사용할 기본 색상
export const DEFAULT_BUS_COLOR = "#999999";

// 색상을 가져오는 헬퍼 함수
export const getBusTypeColor = (city: string, type: string): string => {
  return BUS_TYPE_COLORS[city]?.[type] || DEFAULT_BUS_COLOR;
};