import { IBusRoute } from "../../types/bus";

export const getBusRouteNoList = async (cityCode: number, routeNo: string): Promise<IBusRoute[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_BUS_ROUTE_URL;

  const response = await fetch(`${apiUrl}/getRouteNoList?serviceKey=${apiKey}&pageNo=1&numOfRows=50&_type=json&cityCode=${cityCode}&routeNo=${routeNo}`);

  try {
    const data = await response.json();
    return data.response.body.items.item;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};