import { IBusViaRoute } from "../../types/bus";

export const getBusRouteAccetoThroghSttnList = async (cityCode: number, routeId: string): Promise<IBusViaRoute[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_BUS_ROUTE_URL;

  // &pageNo=1&numOfRows=10&_type=xml&cityCode=24&routeNo=첨단
  const response = await fetch(`${apiUrl}/getRouteAcctoThrghSttnList?serviceKey=${apiKey}&pageNo=1&numOfRows=50&_type=json&cityCode=${cityCode}&routeId=${routeId}`);

  try {
    const data = await response.json();
    return data.response.body.items.item;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};