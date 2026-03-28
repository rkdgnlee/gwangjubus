import { PUBLIC_API_PRIVATE_KEY, API_STOP_URL } from '@env';
import { IStopThroghBusRoute } from '../../types/stop';

export const getBusStopThroghRouteList = async (
  cityCode: number,
  nodeid: string,
  numOfRows: number = 50
): Promise<IStopThroghBusRoute[]> => {
  try {
    const response = await fetch(
      `${API_STOP_URL}/getSttnThrghRouteList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=${numOfRows}&_type=json&cityCode=${cityCode}&nodeid=${nodeid}`
    );
    const data = await response.json();
    const item = data.response.body.items.item;
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus stop through route:', error);
    throw error;
  }
};