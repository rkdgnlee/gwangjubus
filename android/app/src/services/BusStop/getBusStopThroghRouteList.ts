import { IStopThroghBusRoute } from "../../types/stop";

export const getBusStopThroghRouteList = async (cityCode: number, routeId: string) : Promise<IStopThroghBusRoute[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_STOP_URL;
  try {
    const response = await fetch(
      `${apiUrl}/getSttnThrghRouteList?serviceKey=${apiKey}&pageNo=1&numOfRows=50&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json();
    return data.response.body.items.item;
    } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error; // 에러 발생 시 호출한 곳으로 전달
    }
}