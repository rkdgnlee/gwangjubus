// getBusLocation.ts
import { PUBLIC_API_PRIVATE_KEY, API_BUS_LOCATION_URL } from '@env';
import { IBusLocation } from '../../types/bus';

export const getBusLocation = async (cityCode: number, routeId: string): Promise<IBusLocation[]> => {
  try {
    const response = await fetch(
      `${API_BUS_LOCATION_URL}/getRouteAcctoBusLcList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json();
    const item = data.response.body.items?.item;

    if (!item) return []; // ← 추가
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus location:', error);
    throw error;
  }
};