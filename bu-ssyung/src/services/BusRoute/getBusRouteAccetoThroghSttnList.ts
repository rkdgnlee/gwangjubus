// getBusRouteAccetoThroghSttnList.ts
import { IBusViaRoute } from '../../types/bus';

export const getBusRouteAccetoThroghSttnList = async (cityCode: number, routeId: string): Promise<IBusViaRoute[]> => {
  const PUBLIC_API_PRIVATE_KEY = import.meta.env.PUBLIC_API_PRIVATE_KEY;
  const API_BUS_ROUTE_URL = import.meta.env.API_BUS_ROUTE_URL;

  try {
    const response = await fetch(
      `${API_BUS_ROUTE_URL}/getRouteAcctoThrghSttnList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=100&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json() as any;

    if (!data?.response?.body?.items?.item) return [];
    const item = data.response.body.items?.item;
    if (!item) return []; // ← 추가
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus via route:', error);
    throw error;
  }
};