import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';
import { IArriveWithDestination, useArriveInfoInBusStop } from '../../hooks/Arrive/useArriveInfoInBusStop';
import { COLORS } from '../../constants/theme';

// arrtime(초) → "N분" or "N분 M0초"
const formatArrTime = (seconds: number): string => {
  if (seconds < 60) return '곧 도착';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const roundedSec = Math.floor(sec / 10) * 10;
  if (roundedSec === 0) return `${min}분`;
  return `${min}분 ${roundedSec}초`;
};

const CITY_CODE_MAP: Record<string, number> = {
  '광주': 24, '서울': 11, '부산': 26, '대구': 22,
  '인천': 23, '대전': 25, '울산': 21, '세종': 12, '경기': 31,
};

interface BusStopDetailProps {
  stopInfo: any;
  cityName: string;
  onBack: () => void;
  onBusPress: (busInfo: any) => void;
}

const BusStopDetail = ({ stopInfo, cityName, onBack, onBusPress }: BusStopDetailProps) => {
  const cityCode = CITY_CODE_MAP[cityName] || 24;
  const { locations, loading, error, search, reset } = useArriveInfoInBusStop();
  const [refreshing, setRefreshing] = useState(false);

  // 도착 시간(arrtime) 기준 오름차순 정렬
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      const timeA = a.arrtime ?? 999999; // 정보 없으면 뒤로 보냄
      const timeB = b.arrtime ?? 999999;
      return timeA - timeB;
    });
  }, [locations]);

  const fetchData = useCallback(() => {
    search(cityCode, stopInfo.nodeid);
  }, [cityCode, stopInfo.nodeid]);

  useEffect(() => {
    fetchData();
    return () => reset();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await search(cityCode, stopInfo.nodeid);
    setRefreshing(false);
  }, [cityCode, stopInfo.nodeid]);

  const renderBusItem = ({ item }: { item: IArriveWithDestination }) => {
    const color = getBusTypeColor(cityName, item.routetp);
    
    // 도착 정보 존재 여부 확인
    const hasArrival = item.arrtime !== undefined && item.arrtime !== null;
    const arrprevstationcnt = item.arrprevstationcnt ?? 0;

    // 강조 단계 설정
    const isCritical = hasArrival && arrprevstationcnt <= 2; // 2정거장 이하 (완전 주목)
    const isWarning = hasArrival && item.arrtime! <= 300; // 5분 이내 (약간 주목)

    return (
      <TouchableOpacity
        style={styles.busItem}
        activeOpacity={0.7}
        onPress={() => onBusPress(item)}
      >
        <View style={styles.busInfoLeft}>
          <Text style={[styles.busName, { color }]}>{item.routeno}</Text>
          <Text style={styles.busDirection}>{item.endnodenm} 종점</Text>
        </View>
        <View style={styles.busInfoRight}>
          {hasArrival ? (
            <>
              <View 
                style={[
                  styles.timeBadge, 
                  isCritical 
                    ? styles.criticalBadge 
                    : isWarning 
                      ? styles.warningBadge 
                      : styles.normalBadge
                ]}
              >
                <Text 
                  style={[
                    styles.remainTime, 
                    isCritical 
                      ? styles.criticalText 
                      : isWarning 
                        ? styles.warningText 
                        : styles.normalText
                  ]}
                >
                  {formatArrTime(item.arrtime!)}
                </Text>
              </View>
              <Text style={styles.remainStop}>{arrprevstationcnt}정거장 전</Text>
            </>
          ) : (
            <Text style={styles.noArrivalText}>도착 정보 없음</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stopName}>{stopInfo.nodenm}</Text>
          <Text style={styles.arsId}>정류소 번호 {stopInfo.nodeno}</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>도착 예정 버스</Text>
        <Text style={styles.listCount}>총 {sortedLocations.length}대</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ADEBB3" />
          <Text style={{ marginTop: 10, color: '#888' }}>도착 정보를 불러오고 있어요...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: '#aaa' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={sortedLocations}
          keyExtractor={(item) => item.routeid}
          renderItem={renderBusItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ADEBB3"
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>도착 예정 버스가 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FBF6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { padding: 5, marginRight: 10 },
  backText: { fontSize: 24, color: '#333' },
  headerContent: { flex: 1 },
  stopName: { fontSize: 20, fontWeight: 'bold', color: '#191F28' },
  arsId: { fontSize: 13, color: '#8B95A1', marginTop: 2 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#191F28' },
  listCount: { fontSize: 14, color: '#8B95A1' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  busItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  busInfoLeft: { justifyContent: 'center' },
  busName: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
  busDirection: { fontSize: 14, color: '#8B95A1', fontWeight: '500' },
  busInfoRight: { alignItems: 'flex-end' },
  timeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 6 },
  
  // 상태별 배지 스타일
  normalBadge: { backgroundColor: '#F2F4F6' },
  warningBadge: { backgroundColor: '#E7F9ED' }, // 1단계: 연한 민트
  criticalBadge: { backgroundColor: '#31D698' }, // 2단계: 선명한 민트 (Toss Green)
  
  remainTime: { fontSize: 16, fontWeight: 'bold' },
  
  normalText: { color: '#4E5968' },
  warningText: { color: '#2E7D32' },
  criticalText: { color: '#FFFFFF' },

  remainStop: { fontSize: 13, color: '#8B95A1', fontWeight: '500' },
  noArrivalText: { fontSize: 14, color: '#D1D6DB', fontWeight: '500' }, // 연한 회색
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#aaa', fontSize: 16 },
});

export default BusStopDetail;