import { useState, useCallback } from 'react';
import { getBusStopNoList } from '../../services/BusStop/getBusStopNoList';
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

      // 각 정류장마다 경유 버스 목록 병렬 조회
      const stopsWithRoutes = await Promise.all(
        stopList.map(async (stop) => {
          try {
            const routes = await getBusStopThroghRouteList(cityCode, stop.nodeid, 10);
            return { ...stop, routes: Array.isArray(routes) ? routes : [routes] };
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