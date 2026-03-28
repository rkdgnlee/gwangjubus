// getBusRouteAccetoThroghSttnList.ts
import { PUBLIC_API_PRIVATE_KEY, API_BUS_ROUTE_URL } from '@env';
import { IBusViaRoute } from '../../types/bus';

export const getBusRouteAccetoThroghSttnList = async (cityCode: number, routeId: string): Promise<IBusViaRoute[]> => {
  try {
    const response = await fetch(
      `${API_BUS_ROUTE_URL}/getRouteAcctoThrghSttnList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=100&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json();
    const item = data.response.body.items.item;
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus via route:', error);
    throw error;
  }
};