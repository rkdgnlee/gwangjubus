import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';

// 더미 데이터: 노선상의 정류장 목록
const ROUTE_STOPS = [
  { id: '101', name: '기점(차고지)', arsId: '0001' },
  { id: '102', name: '문화전당역', arsId: '0002' },
  { id: '103', name: '전남대병원', arsId: '0003' },
  { id: '104', name: '남광주역', arsId: '0004' },
  { id: '105', name: '조선대', arsId: '0005' },
  { id: '106', name: '살레시오여고', arsId: '0006' },
  { id: '107', name: '산수오거리', arsId: '0007' },
  { id: '108', name: '두암타운', arsId: '0008' },
  { id: '109', name: '말바우시장', arsId: '0009' },
  { id: '110', name: '전남대후문', arsId: '0010' },
  { id: '111', name: '종점(회차지)', arsId: '0011' },
];

// 더미 데이터: 현재 운행중인 버스 위치
const REALTIME_BUSES = [
  { stopId: '102', plateNo: '1234', isLowFloor: true, crowded: '여유' },
  { stopId: '105', plateNo: '5678', isLowFloor: false, crowded: '혼잡' },
  { stopId: '109', plateNo: '9012', isLowFloor: true, crowded: '보통' },
];

interface BusRouteDetailProps {
  busInfo: any;
  cityName: string;
  onBack: () => void;
  onStopPress: (stopInfo: any) => void;
}

const BusRouteDetail = ({ busInfo, cityName, onBack, onStopPress }: BusRouteDetailProps) => {
  const busColor = getBusTypeColor(cityName, busInfo.type);

  // 정류장 렌더링
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // 해당 정류장에 있는 버스 찾기
    const currentBus = REALTIME_BUSES.find(b => b.stopId === item.id);
    const isFirst = index === 0;
    const isLast = index === ROUTE_STOPS.length - 1;

    return (
      <TouchableOpacity style={styles.nodeContainer} onPress={() => onStopPress(item)} activeOpacity={0.6}>
        {/* 1. 왼쪽 타임라인 선과 노드 */}
        <View style={styles.timelineSection}>
          {/* 위쪽 선 (첫번째가 아니면 표시) */}
          {!isFirst && <View style={[styles.line, styles.lineTop]} />}
          {/* 아래쪽 선 (마지막이 아니면 표시) */}
          {!isLast && <View style={[styles.line, styles.lineBottom]} />}
          
          {/* 노드 (버스가 있으면 버스 아이콘, 없으면 동그라미) */}
          <View style={[styles.nodeCircle, currentBus && { backgroundColor: 'transparent', borderWidth: 0 }]}>
             {currentBus ? (
               <View style={[styles.busIconWrapper, { backgroundColor: busColor }]}>
                 <Text style={styles.busIconEmoji}>🚌</Text>
               </View>
             ) : (
               <View style={styles.innerDot} />
             )}
          </View>
        </View>

        {/* 2. 오른쪽 정보 영역 */}
        <View style={styles.infoSection}>
          {/* 버스가 있다면 버스 정보 카드 표시 */}
          {currentBus && (
            <View style={styles.busInfoCard}>
              <View style={styles.busCardHeader}>
                <Text style={styles.plateNo}>{currentBus.plateNo}</Text>
                {currentBus.isLowFloor && (
                  <View style={styles.lowFloorBadge}>
                    <Text style={styles.lowFloorText}>저상</Text>
                  </View>
                )}
              </View>
              <Text style={styles.crowdedText}>{currentBus.crowded}</Text>
            </View>
          )}

          {/* 정류장 이름 */}
          <View style={styles.stopNameWrapper}>
            <Text style={[styles.stopName, currentBus && styles.stopNameActive]}>
              {item.name}
            </Text>
            <Text style={styles.arsId}>{item.arsId}</Text>
          </View>
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
        <View>
          <Text style={[styles.headerBusName, { color: busColor }]}>{busInfo.name}</Text>
          <Text style={styles.headerDirection}>{busInfo.direction} 방면</Text>
        </View>
      </View>

      {/* 노선 리스트 */}
      <FlatList
        data={ROUTE_STOPS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FBF6' },
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
  headerBusName: { fontSize: 20, fontWeight: 'bold' },
  headerDirection: { fontSize: 13, color: '#888' },

  listContent: { paddingVertical: 20, paddingHorizontal: 20 },
  nodeContainer: { flexDirection: 'row', minHeight: 60 },
  
  // 타임라인 스타일
  timelineSection: { width: 40, alignItems: 'center' },
  line: { width: 2, backgroundColor: '#ddd', position: 'absolute', left: 19 },
  lineTop: { top: 0, height: '50%' },
  lineBottom: { top: '50%', bottom: 0 },
  
  nodeCircle: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 2,
    marginTop: 20, // 텍스트와 줄 맞춤
    zIndex: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  innerDot: { width: 0, height: 0 }, // 일반 정류장은 빈 원

  // 버스 아이콘 스타일
  busIconWrapper: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    elevation: 4,
  },
  busIconEmoji: { fontSize: 18 },

  // 정보 영역 스타일
  infoSection: { flex: 1, paddingLeft: 10, paddingBottom: 20 },
  stopNameWrapper: { marginTop: 16 }, // 노드와 높이 맞춤
  stopName: { fontSize: 16, color: '#333' },
  stopNameActive: { fontWeight: 'bold', color: '#000' },
  arsId: { fontSize: 12, color: '#aaa', marginTop: 2 },

  // 실시간 버스 카드 스타일
  busInfoCard: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0EAE2',
  },
  busCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  plateNo: { fontSize: 13, fontWeight: 'bold', color: '#333', marginRight: 6 },
  lowFloorBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }, // 연한 녹색 배경
  lowFloorText: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold' }, // 진한 녹색 텍스트
  crowdedText: { fontSize: 11, color: '#666' },
});

export default BusRouteDetail;
