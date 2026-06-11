import { IBusLocation } from '../../types/bus';

export const getSpecifyBusLocation = async (cityCode: number, routeId: string, nodeId: string) : Promise<IBusLocation[]> => {
  const PUBLIC_API_PRIVATE_KEY = import.meta.env.PUBLIC_API_PRIVATE_KEY;
  const API_BUS_LOCATION_URL = import.meta.env.API_BUS_LOCATION_URL;
  try {
    const response = await fetch(
      `${API_BUS_LOCATION_URL}/getRouteAcctoSpcifySttnAccesBusLcInfo?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=250&_type=json&routeId=${routeId}&nodeId=${nodeId}&cityCode=${cityCode}`
    );
    const data = await response.json() as any;

    if (!data?.response?.body?.items?.item) return [];
    const item = data.response.body.items?.item;
    if (!item) return []; // ← 추가
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error; // 에러 발생 시 호출한 곳으로 전달
  }
}