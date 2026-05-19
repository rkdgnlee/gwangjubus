import { PUBLIC_API_PRIVATE_KEY, API_STOP_URL } from '@env';
import { IStopThroghBusRoute } from '../../types/stop';

export const getBusStopThroghRouteList = async (
  cityCode: number,
  nodeid: string,
  numOfRows: number = 50
): Promise<IStopThroghBusRoute[]> => {
  console.log(nodeid)
  try {
    const response = await fetch(
      `${API_STOP_URL}/getSttnThrghRouteList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=${numOfRows}&_type=json&cityCode=${cityCode}&nodeid=${nodeid}`
    );
    const data = await response.json();
    const item = data.response.body.items.item;
    if (!item) return []; // ← null 반환
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus stop through route:', error);
    throw error;
  }
};