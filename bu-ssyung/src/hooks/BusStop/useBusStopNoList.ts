import { useState, useCallback } from 'react';
import { getBusStopNoList } from '../../services/api-service-proxy'
import { getBusStopThroghRouteList } from '../../services/BusStop/getBusStopThroghRouteList';
import { IStop, IStopThroghBusRoute } from '../../types/stop';

export interface IStopWithRoutes extends IStop {
  routes: IStopThroghBusRoute[];
}

export const useBusStopNoList = () => {
  const [stops, setStops] = useState<IStopWithRoutes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (cityCode: number, nodeNm: string, nodeNo?: string) => {
    if (!nodeNm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const stopList = await getBusStopNoList(cityCode, nodeNm, nodeNo);

      // stopList가 null, undefined이거나 배열이 아닌 경우(에러 발생 시 등) 예외 처리
      if (!stopList || !Array.isArray(stopList)) {
        setStops([]);
        return;
      }

      // 각 정류장마다 경유 버스 목록 병렬 조회
      const stopsWithRoutes = await Promise.all(
        stopList.map(async (stop) => {
          // stop 객체가 유효한지 한 번 더 체크
          if (!stop || !stop.nodeid) return { ...stop, routes: [] };
          try {
            const routes = await getBusStopThroghRouteList(cityCode, stop.nodeid, 10);
            // routes 데이터가 단일 객체이거나 없을 경우를 대비해 배열로 정규화
            const validRoutes = Array.isArray(routes) ? routes : (routes ? [routes] : []);
            return { ...stop, routes: validRoutes };
          } catch {
            return { ...stop, routes: [] };
          }
        })
      );

      setStops(stopsWithRoutes);
    } catch (err) {
      setError('버스 정류장 정보를 가져오는데 실패했습니다. 🚌');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setStops([]);
    setError(null);
  };

  return { stops, loading, error, search, reset };
};