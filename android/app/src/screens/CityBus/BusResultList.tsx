import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';
import { IBusRoute } from '../../types/bus';
import { IStopWithRoutes } from '../../hooks/BusStop/useBusStopNoList';

interface BusResultListProps {
  data: IBusRoute[] | IStopWithRoutes[];
  mode: 'bus' | 'stop';
  cityName: string;
  onPressItem: (item: any) => void;
}

const BusResultList = ({ data, mode, cityName, onPressItem }: BusResultListProps) => {

  const renderItem = ({ item }: { item: any }) => {
    if (mode === 'stop') {
      const stopItem = item as IStopWithRoutes;
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          activeOpacity={0.7}
          onPress={() => onPressItem(item)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.stopName}>📍 {stopItem.nodenm}</Text>
            <View style={styles.routeList}>
              {stopItem.routes.slice(0, 3).map((route) => (
                <Text key={route.routeid} style={styles.routeText}>
                  🚌 {route.routeno}  🚩 {route.startnodenm} → 🏁 {route.endnodenm}
                </Text>
              ))}
              {stopItem.routes.length > 3 && (
                <Text style={styles.moreRoutes}>+{stopItem.routes.length - 3}개 노선 더 있음</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    const busItem = item as IBusRoute;
    const typeColor = getBusTypeColor(cityName, busItem.routetp);
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => onPressItem(item)}
      >
        <View style={styles.leftSection}>
          <View style={[styles.busIcon, { backgroundColor: typeColor }]}>
            <Text style={styles.busIconText}>B</Text>
          </View>
          <View>
            <Text style={[styles.busName, { color: typeColor }]}>{busItem.routeno}</Text>
            <Text style={[styles.busType, { color: typeColor }]}>{busItem.routetp}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.directionLabel}>🏁 {busItem.endnodenm}</Text>
          <Text style={styles.directionText}>막차 {String(busItem.endvehicletime).slice(0, 2)}시 {String(busItem.endvehicletime).slice(2, 4)}분</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item: any) => mode === 'bus' ? item.routeid : item.nodeid}
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  busIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12, opacity: 0.9 },
  busIconText: { fontSize: 20, fontWeight: 'bold' },
  busName: { fontSize: 18, fontWeight: 'bold' },
  busType: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  rightSection: { alignItems: 'flex-end', gap: 8 },
  directionLabel: { fontSize: 15, color: '#333', fontWeight: '500' },
  directionText: { fontSize: 12, color: '#aaa', marginBottom: 2 },
  stopName: { fontSize: 17, fontWeight: 'bold', color: '#191F28' },
  stopNo: { fontSize: 13, color: '#8B95A1', marginTop: 2 },
  routeList: { marginTop: 8, gap: 4 },
  routeText: { fontSize: 12, color: '#555' },
  moreRoutes: { fontSize: 12, color: '#ADEBB3', fontWeight: '600', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#aaa', fontSize: 16 },
});

export default BusResultList;