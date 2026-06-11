import { PUBLIC_API_PRIVATE_KEY, API_BUS_ROUTE_URL } from '@env';
import { IBusRoute } from '../../types/bus';

export const getBusRouteNoList = async (cityCode: number, routeNo: string): Promise<IBusRoute[]> => {
  const url = `${API_BUS_ROUTE_URL}/getRouteNoList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=20&_type=json&cityCode=${cityCode}&routeNo=${routeNo}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data) return []; // ← null 반환
    return data.response.body.items?.item;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};