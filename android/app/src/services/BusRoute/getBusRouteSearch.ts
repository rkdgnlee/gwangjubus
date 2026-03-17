import { IBusRoute } from "../../types/bus";

const getBusRouteSearch = async (routeId: string): Promise<IBusRoute[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_BUS_ROUTE_URL;

  // URL 파라미터 구성 (JSON 응답을 받기 위해 보통 _type=json 추가가 필요할 수 있음)
  const response = await fetch(`${apiUrl}/getRouteAcctoThrghSttnList?serviceKey=${apiKey}&routeId=${routeId}&_type=json`);

  try {
    const data = await response.json();
    return data.response.body.items.item;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};