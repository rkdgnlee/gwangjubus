// getBusRouteInfo.ts
import { PUBLIC_API_PRIVATE_KEY, API_BUS_ROUTE_URL } from '@env';
import { IBusRouteInfo } from '../../types/bus';
// /getRouteInfoIem?serviceKey=ㅁㅁㅁ&_type=xml&cityCode=25&routeId=DJB30300004
export const getBusRouteInfo = async (cityCode: number, routeId: string): Promise<IBusRouteInfo> => {
  try {
    const response = await fetch(
      `${API_BUS_ROUTE_URL}/getRouteInfoIem?serviceKey=${PUBLIC_API_PRIVATE_KEY}&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json();
    const item = data.response.body.items.item;
    return Array.isArray(item) ? item[0] : item;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};