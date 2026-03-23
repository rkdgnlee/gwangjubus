import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

// 더미 데이터: 버스 스케줄 및 사용자 탑승 기록
const SCHEDULES = [
  { id: '1', time: '08:10', busNo: '봉선27', stop: '전남대후문', comment: '지각할 뻔 했음', status: 'boarded' },
  { id: '2', time: '18:20', busNo: '일곡38', stop: '문화전당', comment: null, status: 'upcoming' },
  { id: '3', time: '19:05', busNo: '문흥18', stop: '광주역', comment: '사람 많아서 보냄', status: 'missed' },
  { id: '4', time: '07:50 (내일)', busNo: '수완03', stop: '수완지구', comment: null, status: 'upcoming' },
];

const ScheduleSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>나의 타임라인</Text>
      <FlatList
        data={SCHEDULES}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            {/* 왼쪽 시간 영역 */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{item.time.split(' ')[0]}</Text>
              {item.time.includes('(') && <Text style={styles.timeSubText}>{item.time.split(' ')[1]}</Text>}
            </View>

            {/* 구분선 (타임라인 느낌) */}
            <View style={styles.timelineLine}>
              <View style={[styles.dot, item.status === 'upcoming' ? styles.dotBlue : styles.dotGray]} />
            </View>

            {/* 오른쪽 정보 영역 */}
            <View style={styles.infoCard}>
              <View style={styles.cardContent}>
                <Text style={styles.busInfo}>
                  <Text style={styles.busNo}>{item.busNo}</Text> • {item.stop}
                </Text>
                {item.comment && (
                  <Text style={styles.comment}>💬 {item.comment}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#191F28',
    marginBottom: 15,
  },
  listContent: { paddingBottom: 20 },
  itemRow: { flexDirection: 'row', marginBottom: 20 },
  timeContainer: { width: 60, alignItems: 'flex-end', paddingTop: 2 },
  timeText: { fontSize: 16, fontWeight: '600', color: '#333' },
  timeSubText: { fontSize: 12, color: '#8B95A1', marginTop: 2 },
  
  timelineLine: { width: 20, alignItems: 'center', position: 'relative', marginHorizontal: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, borderWidth: 2, borderColor: '#fff' },
  dotBlue: { backgroundColor: '#ADEBB3' }, // 메인 민트색
  dotGray: { backgroundColor: '#B0B8C1' },
  
  infoCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 15, elevation: 1 },
  cardContent: { justifyContent: 'center' },
  busInfo: { fontSize: 16, color: '#333' },
  busNo: { fontWeight: 'bold', color: '#2E7D32' },
  comment: { fontSize: 13, color: '#8B95A1', marginTop: 8 },
});

export default ScheduleSection;