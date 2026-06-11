import { IBusRoute } from '../../types/bus';

export const getBusRouteNoList = async (cityCode: number, routeNo: string): Promise<IBusRoute[]> => {
  const PUBLIC_API_PRIVATE_KEY = import.meta.env.PUBLIC_API_PRIVATE_KEY;
  const API_BUS_ROUTE_URL = import.meta.env.API_BUS_ROUTE_URL;

  const url = `${API_BUS_ROUTE_URL}/getRouteNoList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=20&_type=json&cityCode=${cityCode}&routeNo=${routeNo}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    if (!data?.response?.body?.items?.item) return [];
    
    return data.response.body.items?.item;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};