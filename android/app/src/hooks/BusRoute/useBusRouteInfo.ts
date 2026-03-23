import { useState, useCallback } from 'react';
import { IStopThroghBusRoute } from '../../types/stop';
import { getBusStopThroghRouteList } from '../../services/BusStop/getBusStopThroghRouteList';
import { getBusRouteInfo } from '../../services/BusRoute/getBusRouteInfo';
import { IBusRouteInfo } from '../../types/bus';


export const useBusRouteInfo = () => {
  const [routes, setRoutes] = useState<IBusRouteInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행 함수 (useCallback으로 메모이제이션)
  const search = useCallback(async (cityCode: number, routeId: string) => {
    if (!routeId.trim()) return; // 빈 검색어 방지

    setLoading(true);
    setError(null);

    try {
      const data = await getBusRouteInfo(cityCode, routeId);
      
      if (data) {
        setRoutes(Array.isArray(data) ? data : [data]);
      } else {
        setRoutes([]);
      }
    } catch (err) {
      setError("정보를 가져오는데 실패했습니다. 🚌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 상태 초기화가 필요할 때 사용
  const reset = () => {
    setRoutes([]);
    setError(null);
  };

  return { routes, loading, error, search, reset };
};