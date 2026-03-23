import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';

// 더미 데이터: 정류장 도착 예정 버스 목록
const ARRIVAL_LIST = [
  { id: 'b1', name: '순환01', type: '급행', time: 2, remainStop: 1, crowded: '여유' },
  { id: 'b2', name: '봉선27', type: '지선', time: 5, remainStop: 3, crowded: '보통' },
  { id: 'b3', name: '일곡38', type: '지선', time: 12, remainStop: 8, crowded: '혼잡' },
  { id: 'b4', name: '수완03', type: '급행', time: 18, remainStop: 12, crowded: '여유' },
  { id: 'b5', name: '문흥39', type: '간선', time: 25, remainStop: 15, crowded: '보통' },
];

interface BusStopDetailProps {
  stopInfo: any; // 정류장 정보 객체
  cityName: string;
  onBack: () => void;
  onBusPress: (busInfo: any) => void;
}

const BusStopDetail = ({ stopInfo, cityName, onBack, onBusPress }: BusStopDetailProps) => {
  // 도착 시간이 적은 순으로 정렬
  const sortedArrivals = [...ARRIVAL_LIST].sort((a, b) => a.time - b.time);

  const handleMorePress = () => {
    Alert.alert("설정", `${stopInfo.name} 정류장`, [
      { text: "즐겨찾기 추가", onPress: () => Alert.alert("완료", "즐겨찾기에 추가되었습니다.") },
      { text: "정류장 위치 보기", onPress: () => console.log("지도 보기") },
      { text: "취소", style: "cancel" }
    ]);
  };

  const renderBusItem = ({ item }: { item: any }) => {
    const color = getBusTypeColor(cityName, item.type);
    return (
      <TouchableOpacity 
        style={styles.busItem} 
        activeOpacity={0.7}
        onPress={() => onBusPress(item)}
      >
        <View style={styles.busInfoLeft}>
          <Text style={[styles.busName, { color: color }]}>{item.name}</Text>
          <Text style={styles.busDirection}>{item.type} • {stopInfo.direction || '종점'} 방면</Text>
        </View>
        <View style={styles.busInfoRight}>
          <Text style={styles.remainTime}>{item.time}분</Text>
          <Text style={styles.remainStop}>{item.remainStop}번째 전</Text>
          <Text style={[
            styles.crowded, 
            item.crowded === '혼잡' ? styles.crowdedRed : item.crowded === '여유' ? styles.crowdedGreen : styles.crowdedGray
          ]}>
            {item.crowded}
          </Text>
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
          <Text style={styles.stopName}>{stopInfo.name}</Text>
          <Text style={styles.arsId}>{stopInfo.id || '0000'} | {stopInfo.direction || '방면 정보 없음'}</Text>
        </View>
        <TouchableOpacity onPress={handleMorePress} style={styles.moreButton}>
          <Text style={styles.moreText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* 도착 정보 리스트 */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>도착 예정 버스</Text>
      </View>
      
      <FlatList
        data={sortedArrivals}
        keyExtractor={(item) => item.id}
        renderItem={renderBusItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { padding: 5, marginRight: 10 },
  backText: { fontSize: 24, color: '#333' },
  headerContent: { flex: 1 },
  stopName: { fontSize: 20, fontWeight: 'bold', color: '#191F28' },
  arsId: { fontSize: 13, color: '#8B95A1', marginTop: 2 },
  moreButton: { padding: 5 },
  moreText: { fontSize: 20, color: '#333', fontWeight: 'bold', letterSpacing: 2 },

  listHeader: { padding: 15, paddingBottom: 5 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  listContent: { paddingHorizontal: 15, paddingBottom: 20 },
  
  busItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    backgroundColor: '#fff',
  },
  separator: { height: 1, backgroundColor: '#f0f0f0' },
  
  busInfoLeft: { justifyContent: 'center' },
  busName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  busDirection: { fontSize: 13, color: '#888' },
  
  busInfoRight: { alignItems: 'flex-end' },
  remainTime: { fontSize: 20, fontWeight: 'bold', color: '#D13535' }, // 강조색(빨강)
  remainStop: { fontSize: 13, color: '#666', marginBottom: 4 },
  crowded: { fontSize: 12, fontWeight: '600' },
  crowdedRed: { color: '#FF3B30' },
  crowdedGreen: { color: '#2E7D32' },
  crowdedGray: { color: '#8B95A1' },
});

export default BusStopDetail;