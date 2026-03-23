import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';

// 더미 데이터 타입
interface BusResult {
  id: string;
  name: string;      // 버스 번호
  type: string;      // 급행, 간선 등
  direction: string; // 종점 방향
}

interface BusResultListProps {
  data: BusResult[];
  cityName: string;
  onPressItem: (item: BusResult) => void;
}

const BusResultList = ({ data, cityName, onPressItem }: BusResultListProps) => {
  
  const renderItem = ({ item }: { item: BusResult }) => {
    const typeColor = getBusTypeColor(cityName, item.type);

    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        activeOpacity={0.7}
        onPress={() => onPressItem(item)}
      >
        {/* 버스 아이콘 & 번호 영역 */}
        <View style={styles.leftSection}>
          <View style={[styles.busIcon, { backgroundColor: typeColor }]}>
            <Text style={styles.busIconText}>🚌</Text>
          </View>
          <View>
            <Text style={[styles.busName, { color: typeColor }]}>{item.name}</Text>
            <Text style={[styles.busType, { color: typeColor }]}>{item.type}</Text>
          </View>
        </View>

        {/* 방향 정보 영역 */}
        <View style={styles.rightSection}>
          <Text style={styles.directionLabel}>방향</Text>
          <Text style={styles.directionText}>{item.direction}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: { padding: 20 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // 그림자 효과
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  busIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12, opacity: 0.9 },
  busIconText: { fontSize: 20 },
  busName: { fontSize: 18, fontWeight: 'bold' },
  busType: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  rightSection: { alignItems: 'flex-end' },
  directionLabel: { fontSize: 12, color: '#aaa', marginBottom: 2 },
  directionText: { fontSize: 15, color: '#333', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#aaa', fontSize: 16 },
});

export default BusResultList;