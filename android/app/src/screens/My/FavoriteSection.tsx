import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

// 더미 데이터
const FAVORITES = [
  { id: '1', title: '출근길', type: 'BUS', busName: '봉선27', stopName: '전남대후문', direction: '전남대 방면' },
  { id: '2', title: '집으로', type: 'STOP', stopName: '광주역', direction: '북구청 방면', busName: null },
  { id: '3', title: '헬스장', type: 'BUS', busName: '일곡38', stopName: '전대사거리', direction: '경신여고 방면' },
  { id: '4', title: '자주 가는 카페', type: 'STOP', stopName: '충장로입구', direction: '문화전당 방면', busName: null },
  { id: '5', title: '본가', type: 'BUS', busName: '송정19', stopName: '광주송정역', direction: '공항 방면' },
];

const FavoriteSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>즐겨찾기</Text>
      <FlatList
        data={FAVORITES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{item.type === 'BUS' ? '🚌' : '🚏'}</Text>
              <Text style={styles.userTitle}>{item.title}</Text>
            </View>
            
            <View style={styles.infoContainer}>
              {item.type === 'BUS' && (
                <Text style={styles.busName}>{item.busName}</Text>
              )}
              <Text style={styles.stopName}>{item.stopName}</Text>
              <Text style={styles.direction}>{item.direction}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#191F28', // Toss Black
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    width: '48%', // 2열 배치
    elevation: 2, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardHeader: { marginBottom: 12 },
  emoji: { fontSize: 24, marginBottom: 8 },
  userTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  infoContainer: { marginTop: 'auto' }, // 내용을 아래로 밀착
  busName: { fontSize: 15, fontWeight: '600', color: '#0064FF', marginBottom: 2 }, // Toss Blue
  stopName: { fontSize: 14, color: '#4E5968', fontWeight: '500' },
  direction: { fontSize: 12, color: '#8B95A1', marginTop: 2 },
});

export default FavoriteSection;