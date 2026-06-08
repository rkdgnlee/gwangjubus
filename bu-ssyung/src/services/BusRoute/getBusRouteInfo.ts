import { IBusRouteInfo } from "../../types/bus";

export const getBusRouteInfo = async (cityCode: number, routeId: string): Promise<IBusRouteInfo | null> => {
  const PUBLIC_API_PRIVATE_KEY = import.meta.env.PUBLIC_API_PRIVATE_KEY;
  const API_BUS_ROUTE_URL = import.meta.env.API_BUS_ROUTE_URL;

  try {
    const response = await fetch(
      `${API_BUS_ROUTE_URL}/getRouteInfoIem?serviceKey=${PUBLIC_API_PRIVATE_KEY}&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json() as any;

    if (!data?.response?.body?.items?.item) return null;
    const item = data.response.body.items?.item;
    return Array.isArray(item) ? item[0] : item;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};