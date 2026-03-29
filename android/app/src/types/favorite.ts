export type FavoriteType = 'stop' | 'bus';

export interface IFavoriteBase {
  id: string;
  type: FavoriteType;
  cityName: string;
  emoji: string;
  memo: string;
  savedAt: number;
}

export interface IFavoriteStop extends IFavoriteBase {
  type: 'stop';
  nodeid: string;
  nodenm: string;
  nodeno: number;
}

export interface IFavoriteBus extends IFavoriteBase {
  type: 'bus';
  routeid: string;
  routeno: string;
  routetp: string;
  startnodenm: string;
  endnodenm: string;
}

export type IFavorite = IFavoriteStop | IFavoriteBus;