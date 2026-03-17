import { IBusLocation } from "../../types/stop";

const getBusLocation = async (cityCode: number, routeId: string) : Promise<IBusLocation[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_BUS_ROUTE_URL;

  try {
    const response = await fetch(
      `${apiUrl}/getRouteAcctoBusLcList?serviceKey=${apiKey}&_type=json&cityCode=${cityCode}&routeId=${routeId}`
    );
    const data = await response.json();
    return data.response.body.items.item;
    } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error; // 에러 발생 시 호출한 곳으로 전달
    }
}