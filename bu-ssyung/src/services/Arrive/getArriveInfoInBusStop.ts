import { PUBLIC_API_PRIVATE_KEY, API_STOP_ARRIVE_URL } from '@env';
import { IArriveInBusStop } from "../../types/arrive";

export const getArriveInfoInBusStop = async (cityCode: number, nodeId: string): Promise<IArriveInBusStop[]> => {
  try {
    const response = await fetch(
      `${API_STOP_ARRIVE_URL}/getSttnAcctoArvlPrearngeInfoList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=50&_type=json&cityCode=${cityCode}&nodeId=${nodeId}`
    );
    const data = await response.json();
    const item = data.response.body.items?.item;
    if (!item) return []; // ← null 반환
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching arrive info:', error);
    throw error;
  }
};