import { useState, useCallback } from 'react';
import { getBusStopNoList, getBusStopThroghRouteList } from '../../services/api-service-proxy'
import { IStop, IStopThroghBusRoute } from '../../types/stop';

export interface IStopWithRoutes extends IStop {
  routes: IStopThroghBusRoute[];
  routesLoaded: boolean;
}
export const useBusStopNoList = () => {
  const [stops, setStops] = useState<IStopWithRoutes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [routesLoading, setRoutesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (cityCode: number, nodeNm: string, nodeNo?: string) => {
    if (!nodeNm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const stopList = await getBusStopNoList(cityCode, nodeNm, nodeNo);

      if (!stopList || !Array.isArray(stopList)) {
        setStops([]);
        return;
      }

      // 1단계: 정류장 먼저 렌더링
      setStops(stopList.map(stop => ({ ...stop, routes: [], routesLoaded: false })));
      setLoading(false);

      // 2단계: routes 병렬 조회
      setRoutesLoading(true);
      const stopsWithRoutes = await Promise.all(
        stopList.map(async (stop) => {
          if (!stop || !stop.nodeid) return { ...stop, routes: [], routesLoaded: true };
          try {
            const routes = await getBusStopThroghRouteList(cityCode, stop.nodeid, 10);
            const validRoutes = Array.isArray(routes) ? routes.slice(0, 3) : (routes ? [routes] : []);
            return { ...stop, routes: validRoutes, routesLoaded: true };
          } catch {
            return { ...stop, routes: [], routesLoaded: true };
          }
        })
      );
      setStops(stopsWithRoutes);
    } catch (err) {
      setError('버스 정류장 정보를 가져오는데 실패했습니다. 🚌');
      console.error(err);
    } finally {
      setLoading(false);
      setRoutesLoading(false);
    }
  }, []);

  const reset = () => {
    setStops([]);
    setError(null);
  };

  return { stops, loading, routesLoading, error, search, reset };
};