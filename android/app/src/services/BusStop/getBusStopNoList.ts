import { IStop } from "../../types/stop";

export const getBusStopNoList = async (cityCode: number, nodeNm: string, nodeNo?: string) : Promise<IStop[]> => {
  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  const apiUrl = process.env.API_STOP_URL;

  const params = new URLSearchParams({
    serviceKey: apiKey!,
    _type: 'json',
    cityCode: String(cityCode),
    nodeNm,
    ...(nodeNo && { nodeNo }),
  });


  try {
    const response = await fetch(
      `${apiUrl}/getSttnNoList?serviceKey=${apiKey}&_type=json&cityCode=${cityCode}&nodeNm=${nodeNm}&nodeNo=${nodeNo}`
    );
    const data = await response.json();
    return data.response.body.items.item;
    } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error; // 에러 발생 시 호출한 곳으로 전달
    }
}