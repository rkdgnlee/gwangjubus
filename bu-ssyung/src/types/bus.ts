/**
 * 버스 정류장 정보에 대한 타입 정의
 */

export interface IBusViaRoute {
  gpslati: number;
  gpslong: number;
  nodeid: string;
  nodenm: string;
  nodeno: number;
  routeid: string;
  nodeord: number;
}
export interface IBusRoute {
  endnodenm: string;
  endvehicletime: string;
  routeid: string;
  routeno: string;
  routetp: string;
  startnodenm: string;
  startvehicletime: string;
}

export interface IBusRouteInfo extends IBusRoute {
  intervalsattime: number;
  intervalsuntime: number;
  intervaltime: number;
}


export interface IBusLocation {
    gpslati: number;
    gpslong: number;
    nodeid: string;
    nodenm: string;
    nodeord: number;
    routenm: number;
    routetp: string;
    vehicleno: string;
}