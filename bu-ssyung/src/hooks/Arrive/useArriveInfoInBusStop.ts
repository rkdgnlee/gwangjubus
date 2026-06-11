import { useState, useCallback } from 'react';
import { IArriveInBusStop } from '../../types/arrive';
import { getArriveInfoInBusStop } from '../../services/api-service-proxy'
import { getBusStopThroghRouteList } from '../../services/api-service-proxy'

export interface IArriveWithDestination extends Omit<Partial<IArriveInBusStop>, 'routeno' | 'routetp'> {
  routeid: string;
  routeno: string;
  routetp: string;
  endnodenm?: string;
}

export const useArriveInfoInBusStop = () => {
  const [locations, setLocations] = useState<IArriveWithDestination[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행 함수 (useCallback으로 메모이제이션)
  const search = useCallback(async (cityCode: number, nodeId: string) => {
    if (!nodeId.trim()) return; // 빈 검색어 방지

    setLoading(true);
    setError(null);

    try {
      // 도착 정보와 노선 상세 정보(종점 확인용)를 병렬로 호출
      // 한 쪽 API가 실패하더라도 다른 쪽 데이터를 최대한 활용할 수 있도록 개별 catch 고려 가능하나, 
      // 여기서는 기본적으로 두 정보가 모두 필요하므로 전체를 묶어 처리합니다.
      const [arriveData, routeListData] = await Promise.allSettled([
        getArriveInfoInBusStop(cityCode, nodeId),
        getBusStopThroghRouteList(cityCode, nodeId)
      ]);

      const arrivalsResult = arriveData.status === 'fulfilled' ? arriveData.value : [];
      const routesResult = routeListData.status === 'fulfilled' ? routeListData.value : [];
      
      const routeList = Array.isArray(routesResult) ? routesResult : (routesResult ? [routesResult] : []);
      const arrivals = Array.isArray(arrivalsResult) ? arrivalsResult : (arrivalsResult ? [arrivalsResult] : []);

      // 경유 노선 목록을 기준으로 도착 정보를 결합
      const combinedData = routeList.map(route => {
        const arrival = arrivals.find(a => a && a.routeid === route.routeid);
        return {
          ...arrival, // 실시간 정보가 있으면 덮어씌움
          routeid: route.routeid,
          routeno: route.routeno,
          routetp: route.routetp,
          endnodenm: route.endnodenm || '정보 없음'
        };
      });

      setLocations(combinedData);
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