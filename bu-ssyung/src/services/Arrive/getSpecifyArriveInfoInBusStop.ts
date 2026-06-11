import { IArriveInBusStop } from "../../types/arrive";

export const getSpecifyArriveInfoInBusStop = async (cityCode: number, nodeId: string, routeId: string) : Promise<IArriveInBusStop[]> => {
  const PUBLIC_API_PRIVATE_KEY = import.meta.env.PUBLIC_API_PRIVATE_KEY;
  const API_STOP_ARRIVE_URL = import.meta.env.API_STOP_ARRIVE_URL;
  try {
    const response = await fetch(
      `${API_STOP_ARRIVE_URL}/getSttnAcctoSpcifyRouteBusArvlPrearngeInfoList?serviceKey=${PUBLIC_API_PRIVATE_KEY}&pageNo=1&numOfRows=200&_type=json&cityCode=${cityCode}&nodeId=${nodeId}&routeId=${routeId}`
    );
    const data = await response.json() as any;

    if (!data?.response?.body?.items?.item) return [];
    const item = data.response.body.items?.item;
    if (!item) return []; // ← null 반환 
    return Array.isArray(item) ? item : [item];
    } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error; // 에러 발생 시 호출한 곳으로 전달
    }
}