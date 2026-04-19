export interface IBusRideHistory {
  id: string;              // uuid
  routeid: string;
  routeno: string;
  stopNodeid: string;
  stopNodenm: string;
  arrivedAt: string;       // ISO timestamp
  cityName: string;
}