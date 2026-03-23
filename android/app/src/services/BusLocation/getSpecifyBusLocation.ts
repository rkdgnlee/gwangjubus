import { IBusLocation } from "../../types/bus";

export const getSpecifyBusLocation = async (cityCode: number, routeId: string, nodeId: string) : Promise<IBusLocation[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_BUS_ROUTE_URL;
  try {
    const response = await fetch(
      `${apiUrl}/getRouteAcctoSpcifySttnAccesBusLcInfo?serviceKey=${apiKey}&pageNo=1&numOfRows=250&_type=json&routeId=${routeId}&nodeId=${nodeId}&cityCode=${cityCode}`
    );
    const data = await response.json();
    return data.response.body.items.item;
    } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error; // 에러 발생 시 호출한 곳으로 전달
    }
}