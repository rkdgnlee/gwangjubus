import { IStop } from "../../types/stop";

export const getBusStopNoList = async (cityCode: number, nodeNm: string, nodeNo?: string): Promise<IStop[]> => {
  const PUBLIC_API_PRIVATE_KEY = import.meta.env.PUBLIC_API_PRIVATE_KEY;
  const API_STOP_URL = import.meta.env.API_STOP_URL;

  try {
    // URLSearchParams 쓰지 말고 직접 넣기
    const response = await fetch(
      `${API_STOP_URL}/getSttnNoList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=6&_type=json&cityCode=${cityCode}&nodeNm=${encodeURIComponent(nodeNm)}${nodeNo ? `&nodeNo=${nodeNo}` : ''}`
    );
    const data = await response.json() as any;

    if (!data?.response?.body?.items?.item) return [];
    
    const item = data.response.body.items.item;
    if (!item) return []; // ← null 반환
    return Array.isArray(item) ? item : [item];
  } catch (error) {
    console.error('Error fetching bus stop info:', error);
    throw error;
  }
};