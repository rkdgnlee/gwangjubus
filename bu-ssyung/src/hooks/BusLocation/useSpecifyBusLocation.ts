import { useState, useCallback } from 'react';
import { IBusLocation } from '../../types/bus';
import { getSpecifyBusLocation } from '../../services/api-service-proxy'

export const useSpecifyBusLocation = () => {
  const [locations, setLocations] = useState<IBusLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행 함수 (useCallback으로 메모이제이션)
  const search = useCallback(async (cityCode: number, routeId: string, nodeId:string) => {
    if (!routeId.trim()) return; // 빈 검색어 방지

    setLoading(true);
    setError(null);

    try {
      const data = await getSpecifyBusLocation(cityCode, routeId, nodeId);
      
      if (data) {
        setLocations(Array.isArray(data) ? data : [data]);
      } else {
        setLocations([]);
      }
    } catch (err) {
      setError("버스 위치 정보를 가져오는데 실패했습니다. 🚌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 상태 초기화가 필요할 때 사용
  const reset = () => {
    setLocations([]);
    setError(null);
  };

  return { locations, loading, error, search, reset };
};