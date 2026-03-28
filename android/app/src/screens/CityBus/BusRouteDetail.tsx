import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';
import { useBusRouteDetail } from '../../hooks/BusRoute/useBusRouteDetail';
import { IBusViaRoute, IBusLocation } from '../../types/bus';

const CITY_CODE_MAP: Record<string, number> = {
  '광주': 24, '서울': 11, '부산': 26, '대구': 22,
  '인천': 23, '대전': 25, '울산': 21, '세종': 12, '경기': 31,
};

interface BusRouteDetailProps {
  busInfo: any;
  cityName: string;
  onBack: () => void;
  onStopPress: (stopInfo: any) => void;
}

const BusRouteDetail = ({ busInfo, cityName, onBack, onStopPress }: BusRouteDetailProps) => {
  const cityCode = CITY_CODE_MAP[cityName] || 24;
  const busColor = getBusTypeColor(cityName, busInfo.routetp);
  const { info, stops, locations, loading, error, fetch, refreshLocations } = useBusRouteDetail();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch(cityCode, busInfo.routeid);
  }, [busInfo.routeid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLocations(cityCode, busInfo.routeid);
    setRefreshing(false);
  }, [cityCode, busInfo.routeid]);

 
  // 정류장 nodeid 기준으로 버스 위치 매핑
  const locationMap: Record<string, IBusLocation[]> = {};
  locations.forEach(loc => {
    if (!locationMap[loc.nodeid]) locationMap[loc.nodeid] = [];
    locationMap[loc.nodeid].push(loc);
  });


  const sortedStops = [...stops].sort((a, b) => a.nodeord - b.nodeord);

  const listData: any[] = sortedStops.map(s => ({ ...s, __type: 'stop' }));

  const renderDivider = () => (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <View style={styles.dividerBadge}>
        <Text style={styles.dividerText}>↑ 상행 종료  |  하행 시작 ↓</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
  );

  const renderStop = (item: IBusViaRoute, index: number, sectionStops: IBusViaRoute[]) => {
    const busesHere = locationMap[item.nodeid] || [];
    const isFirst = index === 0;
    const isLast = index === sectionStops.length - 1;

    return (
      <View style={styles.itemContainer}>
        {/* 버스 위치 카드들 */}
        {busesHere.map((bus) => (
          <View key={bus.vehicleno} style={styles.busRow}>
            <View style={styles.timelineSection}>
              {!isFirst && <View style={[styles.line, styles.lineTop]} />}
              <View style={[styles.line, styles.lineBottom]} />
              <View style={[styles.busIconWrapper, { backgroundColor: busColor }]}>
                <Text style={styles.busIconEmoji}>🚌</Text>
              </View>
            </View>
            <View style={styles.busInfoSection}>
              <View style={styles.busInfoCard}>
                <Text style={styles.plateNo}>{bus.vehicleno}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* 정류장 행 */}
        <TouchableOpacity
          style={styles.stationRow}
          onPress={() => onStopPress(item)}
          activeOpacity={0.6}
        >
          <View style={styles.timelineSection}>
            {(isFirst && busesHere.length === 0) ? null : <View style={[styles.line, styles.lineTop]} />}
            {!isLast && <View style={[styles.line, styles.lineBottom]} />}
            <View style={[styles.nodeCircle, isFirst || isLast ? styles.nodeCircleEnd : {}]}>
              {(isFirst || isLast) && <View style={[styles.innerDot, { backgroundColor: busColor }]} />}
            </View>
          </View>
          <View style={styles.stationInfoSection}>
            <View style={styles.textColumn}>
              <Text style={[styles.stopName, (isFirst || isLast) && styles.stopNameEnd]}>{item.nodenm}</Text>
              <Text style={styles.nodeNo}>{item.nodeno}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.__type === 'divider') return renderDivider(); // 이제 안 쓰이지만 유지해도 무방
    return renderStop(item, index, sortedStops);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ADEBB3" />
        <Text style={{ marginTop: 10, color: '#888' }}>노선 정보를 불러오고 있어요...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#aaa' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBusTitleRow}>
            <Text style={[styles.headerBusName, { color: busColor }]}>{busInfo.routeno}</Text>
            <View style={[styles.routeTypeBadge, { backgroundColor: busColor + '15' }]}>
              <Text style={[styles.routeTypeSmall, { color: busColor }]}>{busInfo.routetp}</Text>
            </View>
          </View>
          <Text style={styles.headerDirection}>
            🚩 {busInfo.startnodenm}  →  🏁 {busInfo.endnodenm}
          </Text>
          {info && (
            <Text style={styles.headerInterval}>
              배차 {info.intervaltime}분 간격  |  첫차 {String(info.startvehicletime).slice(0, 2)}:{String(info.startvehicletime).slice(2, 4)}  막차 {String(info.endvehicletime).slice(0, 2)}:{String(info.endvehicletime).slice(2, 4)}
            </Text>
          )}
        </View>
      </View>

      {/* 노선 리스트 */}
      <FlatList
        data={listData}
        keyExtractor={(item, index) => item.nodeid ?? `divider-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ADEBB3"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FBF6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: { marginRight: 15, padding: 5 },
  backText: { fontSize: 24, color: '#333' },
  headerBusName: { fontSize: 24, fontWeight: 'bold' },
  headerBusTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 2 
  },
  routeTypeBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeTypeSmall: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerDirection: { fontSize: 15, color: '#555', marginTop: 2 },
  headerInterval: { fontSize: 13, color: '#ADEBB3', marginTop: 4, fontWeight: '600' },

  listContent: { paddingVertical: 20, paddingHorizontal: 20 },
  itemContainer: { flexDirection: 'column' },
  busRow: { flexDirection: 'row', height: 60 },
  stationRow: { flexDirection: 'row', height: 56 },

  timelineSection: { width: 40, alignItems: 'center' },
  line: { width: 2, backgroundColor: '#ddd', position: 'absolute', left: 19 },
  lineTop: { top: 0, bottom: '50%' },
  lineBottom: { top: '50%', bottom: 0 },

  nodeCircle: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 2,
    zIndex: 1, position: 'absolute', top: '50%', marginTop: -7,
    justifyContent: 'center', alignItems: 'center',
  },
  nodeCircleEnd: { width: 18, height: 18, borderRadius: 9, marginTop: -9 },
  innerDot: { width: 8, height: 8, borderRadius: 4 },

  busIconWrapper: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    zIndex: 2, position: 'absolute', top: '50%', marginTop: -17,
    elevation: 3,
  },
  busIconEmoji: { fontSize: 18 },

  busInfoSection: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  busInfoCard: {
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: '#fff', borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#E0EAE2',
  },
  plateNo: { fontSize: 15, fontWeight: 'bold', color: '#333' },

  stationInfoSection: {
    flex: 1, paddingLeft: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  textColumn: { flex: 1, justifyContent: 'center' },
  stopName: { fontSize: 18, color: '#333' },
  stopNameEnd: { fontWeight: 'bold', color: '#191F28', fontSize: 19 },
  nodeNo: { fontSize: 13, color: '#aaa', marginTop: 2 },
  chevron: { fontSize: 24, color: '#B0B8C1' },

  // 구분선
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ADEBB3' },
  dividerBadge: {
    backgroundColor: '#ADEBB3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  dividerText: { fontSize: 13, color: '#191F28', fontWeight: 'bold' },
});

export default BusRouteDetail;