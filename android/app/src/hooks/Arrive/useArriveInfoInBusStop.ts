import { useState, useCallback } from 'react';
import { IArriveInBusStop } from '../../types/arrive';
import { getArriveInfoInBusStop } from '../../services/Arrive/getArriveInfoInBusStop';

export const useGetSpecifyArriveInfoInBusStop = () => {
  const [locations, setLocations] = useState<IArriveInBusStop[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행 함수 (useCallback으로 메모이제이션)
  const search = useCallback(async (cityCode: number, nodeId: string) => {
    if (!nodeId.trim()) return; // 빈 검색어 방지

    setLoading(true);
    setError(null);

    try {
      const data = await getArriveInfoInBusStop(cityCode, nodeId);
      
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