// hooks/BusRoute/useBusRouteDetail.ts
import { useState, useCallback } from 'react';
import { IBusRouteInfo, IBusViaRoute, IBusLocation } from '../../types/bus';
import { getBusRouteInfo } from '../../services/BusRoute/getBusRouteInfo';
import { getBusRouteAccetoThroghSttnList } from '../../services/BusRoute/getBusRouteAccetoThroghSttnList';
import { getBusLocation } from '../../services/BusLocation/getBusLocation';

export interface IBusRouteDetailState {
  info: IBusRouteInfo | null;
  stops: IBusViaRoute[];
  locations: IBusLocation[];
}

export const useBusRouteDetail = () => {
  const [state, setState] = useState<IBusRouteDetailState>({
    info: null,
    stops: [],
    locations: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (cityCode: number, routeId: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. 노선 기본 정보
      const info = await getBusRouteInfo(cityCode, routeId);

      // 2. 전체 경유 정류장
      const stops = await getBusRouteAccetoThroghSttnList(cityCode, routeId);

      // 3. 실시간 버스 위치
      const locations = await getBusLocation(cityCode, routeId);
      console.log(routeId, cityCode)
      console.log(info)
      setState({ info, stops, locations });
    } catch (err) {
      setError('노선 정보를 가져오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 실시간 위치만 갱신 (새로고침용)
  const refreshLocations = useCallback(async (cityCode: number, routeId: string) => {
    try {
      const locations = await getBusLocation(cityCode, routeId);
      setState(prev => ({ ...prev, locations }));
    } catch (err) {
      console.error('Error refreshing locations:', err);
    }
  }, []);

  const reset = () => setState({ info: null, stops: [], locations: [] });

  return { ...state, loading, error, fetch, refreshLocations, reset };
};