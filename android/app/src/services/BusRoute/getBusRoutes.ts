import { IBusViaRoute } from "../../types/bus";

export const getBusRoutes = async (
  cityCode: string,
  routeId: string,
): Promise<IBusViaRoute[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_BUS_ROUTE_URL;

  // endpoint: getRouteAcctoThrghSttnList (노선별 경유 정류소 목록 조회)
  const url = `${apiUrl}/getRouteAcctoThrghSttnList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeId}&_type=json&numOfRows=200&pageNo=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    // 1. API 응답 결과가 정상이 아닐 경우
    if (data.response.header.resultCode !== '00') {
      console.warn('API Error:', data.response.header.resultMsg);
      return [];
    }

    const itemsWrapper = data.response.body.items;

    // 2. 검색 결과가 아예 없는 경우 (item 필드가 없거나 빈 문자열)
    if (!itemsWrapper || !itemsWrapper.item) {
      return [];
    }

    const result = itemsWrapper.item;

    // 3. 데이터 정규화 (배열인지 객체인지 판단)
    if (Array.isArray(result)) {
      // 결과가 여러 개인 경우 (배열)
      return result;
    } else {
      // 결과가 1개인 경우 (객체 하나를 배열로 감싸서 반환)
      return [result as IBusViaRoute];
    }

  } catch (error) {
    console.error('getBusRoutes Error:', error);
    return []; // 에러 시 빈 배열 반환으로 런타임 에러 방지
  }
};