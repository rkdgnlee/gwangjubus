import { IArriveInBusStop } from "../types/arrive";
import { IBusLocation, IBusRoute, IBusRouteInfo, IBusViaRoute } from "../types/bus";
import { IStop, IStopThroghBusRoute } from "../types/stop";

const PROXY_BASE = 'https://gwangjubus-proxy.vercel.app';

const call = async (path: string, params: Record<string, string | number>): Promise<any> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => searchParams.set(k, String(v)));
  const response = await fetch(`${PROXY_BASE}${path}?${searchParams.toString()}`);
  if (!response.ok) throw new Error(`Network error: ${response.status}`);
  return response.json();
};

const extractItems = (data: any) => {
  const item = data?.response?.body?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
};

// ── 도착 정보 ──────────────────────────────────────────────────────────────

export const getArriveInfoInBusStop = async (cityCode: number, nodeId: string): Promise<IArriveInBusStop[]> => {
  try {
    const data = await call('/api/stop-arrive', {
      endpoint: 'getSttnAcctoArvlPrearngeInfoList',
      pageNo: 1,
      numOfRows: 50,
      cityCode,
      nodeId,
    });
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching arrive info:', error);
    throw error;
  }
};

export const getSpecifyArriveInfoInBusStop = async (cityCode: number, nodeId: string, routeId: string): Promise<IArriveInBusStop[]> => {
  try {
    const data = await call('/api/stop-arrive', {
      endpoint: 'getSttnAcctoSpcifyRouteBusArvlPrearngeInfoList',
      pageNo: 1,
      numOfRows: 200,
      cityCode,
      nodeId,
      routeId,
    });
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching specify arrive info:', error);
    throw error;
  }
};

// ── 버스 위치 ──────────────────────────────────────────────────────────────

export const getBusLocation = async (cityCode: number, routeId: string): Promise<IBusLocation[]> => {
  try {
    const data = await call('/api/bus-location', {
      endpoint: 'getRouteAcctoBusLcList',
      cityCode,
      routeId,
    });
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching bus location:', error);
    throw error;
  }
};

export const getSpecifyBusLocation = async (cityCode: number, routeId: string, nodeId: string): Promise<IBusLocation[]> => {
  try {
    const data = await call('/api/bus-location', {
      endpoint: 'getRouteAcctoSpcifySttnAccesBusLcInfo',
      pageNo: 1,
      numOfRows: 250,
      cityCode,
      routeId,
      nodeId,
    });
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching specify bus location:', error);
    throw error;
  }
};

// ── 버스 노선 ──────────────────────────────────────────────────────────────

export const getBusRouteAccetoThroghSttnList = async (cityCode: number, routeId: string): Promise<IBusViaRoute[]> => {
  try {
    const data = await call('/api/bus-route', {
      endpoint: 'getRouteAcctoThrghSttnList',
      pageNo: 1,
      numOfRows: 100,
      cityCode,
      routeId,
    });
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching bus via route:', error);
    throw error;
  }
};

export const getBusRouteInfo = async (cityCode: number, routeId: string): Promise<IBusRouteInfo | null> => {
  try {
    const data = await call('/api/bus-route', {
      endpoint: 'getRouteInfoIem',
      cityCode,
      routeId,
    });
    const items = extractItems(data);
    return items[0] ?? null;
  } catch (error) {
    console.error('Error fetching bus route info:', error);
    throw error;
  }
};

export const getBusRouteNoList = async (cityCode: number, routeNo: string): Promise<IBusRoute[]> => {
  try {
    const data = await call('/api/bus-route', {
      endpoint: 'getRouteNoList',
      pageNo: 1,
      numOfRows: 20,
      cityCode,
      routeNo,
    });
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching bus route no list:', error);
    throw error;
  }
};

// ── 정류소 정보 ────────────────────────────────────────────────────────────

export const getBusStopNoList = async (cityCode: number, nodeNm: string, nodeNo?: string): Promise<IStop[]> => {
  try {
    const params: Record<string, string | number> = {
      endpoint: 'getSttnNoList',
      pageNo: 1,
      numOfRows: 6,
      cityCode,
      nodeNm,
    };
    if (nodeNo) params.nodeNo = nodeNo;

    const data = await call('/api/stop', params);
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching bus stop info:', error);
    throw error;
  }
};

export const getBusStopThroghRouteList = async (cityCode: number, nodeid: string, numOfRows: number = 50): Promise<IStopThroghBusRoute[]> => {
  try {
    const data = await call('/api/stop', {
      endpoint: 'getSttnThrghRouteList',
      pageNo: 1,
      numOfRows,
      cityCode,
      nodeid,
    });
    return extractItems(data);
  } catch (error) {
    console.error('Error fetching bus stop through route:', error);
    throw error;
  }
};