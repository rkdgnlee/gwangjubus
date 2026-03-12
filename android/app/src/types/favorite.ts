// src/types/favorite.ts

export interface FavoriteBus {
  id: string;          // 고유 키 (busStopId + busName 조합 추천)
  busStopId: number;   // 정류장 ID
  busName: string;     // 버스 번호 (예: "봉선27")
  busAddress: number;  // 정류장 주소 번호 또는 방향
  createdAt: number;   // 즐겨찾기 추가 시간 (정렬용)
  // 필요한 필드(정류장 이름 등)를 더 추가하세요.
}