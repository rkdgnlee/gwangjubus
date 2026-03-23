import { IArriveInBusStop } from "../../types/arrive";

export const getSpecifyArriveInfoInBusStop = async (cityCode: number, nodeId: string, routeId: string) : Promise<IArriveInBusStop[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_STOP_ARRIVE_URL;

  try {
    const response = await fetch(
      `${apiUrl}/getSttnAcctoSpcifyRouteBusArvlPrearngeInfoList?serviceKey=${apiKey}&pageNo=1&numOfRows=200&_type=json&cityCode=${cityCode}&nodeId=${nodeId}&routeId=${routeId}`
    );
    const data = await response.json();
    return data.response.body.items.item;
    } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error; // 에러 발생 시 호출한 곳으로 전달
    }
}