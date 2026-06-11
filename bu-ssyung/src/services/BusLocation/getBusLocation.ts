// getBusLocation.ts
import { IBusLocation } from '../../types/bus';

export const getBusLocation = async (cityCode: number, routeId: string): Promise<IBusLocation[]> => {
  const PUBLIC_API_PRIVATE_KEY = import.meta.env.PUBLIC_API_PRIVATE_KEY;
  const API_BUS_LOCATION_URL = import.meta.env.API_BUS_LOCATION_URL;
  try {
    const response = await fetch(
      `${API_BUS_LOCATION_URL}/getRouteAcctoBusLcList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json() as any;

    if (!data?.response?.body?.items?.item) return [];
    const item = data.response.body.items?.item;

    if (!item) return []; // ← 추가
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus location:', error);
    throw error;
  }
};