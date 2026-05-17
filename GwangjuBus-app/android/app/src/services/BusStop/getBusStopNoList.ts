import { PUBLIC_API_PRIVATE_KEY, API_STOP_URL } from '@env';
import { IStop } from "../../types/stop";

export const getBusStopNoList = async (cityCode: number, nodeNm: string, nodeNo?: string): Promise<IStop[]> => {
  try {
    // URLSearchParams 쓰지 말고 직접 넣기
    const response = await fetch(
      `${API_STOP_URL}/getSttnNoList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=6&_type=json&cityCode=${cityCode}&nodeNm=${encodeURIComponent(nodeNm)}${nodeNo ? `&nodeNo=${nodeNo}` : ''}`
    );
    const data = await response.json();
    const item = data.response.body.items.item;
    if (!item) return []; // ← null 반환
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus stop info:', error);
    throw error;
  }
};