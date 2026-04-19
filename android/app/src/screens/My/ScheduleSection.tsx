import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { busHistoryStorage } from '../../utils/busHistoryStorage';
import { IBusRideHistory } from '../../types/IBusRideHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatRideTime = (isoString: string) => {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAYS[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return {
    date: `${month}/${day} (${dayOfWeek})`,
    time: `${hours}:${minutes}:${seconds}`,
  };
};

interface Props {
  onNavigate: (type: 'bus' | 'stop', data: any) => void;
}

const ScheduleSection = ({ onNavigate }: Props) => {
  const [history, setHistory] = useState<IBusRideHistory[]>([]);
  const [showStorageNotice, setShowStorageNotice] = useState(false); // ← 추가

  useEffect(() => {
    const load = async () => {
      const data = await busHistoryStorage.getAll();
      setHistory(data);

      // 기록이 있고 안내를 아직 안 봤으면 표시
      if (data.length > 0) {
        const noticed = await AsyncStorage.getItem('storage_notice_seen');
        if (!noticed) setShowStorageNotice(true);
      }
    };
    load();
  }, []);
  const dismissNotice = async () => {
    await AsyncStorage.setItem('storage_notice_seen', 'true');
    setShowStorageNotice(false);
  };
  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>나의 탑승 기록</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🚌</Text>
          <Text style={styles.emptyText}>아직 탑승 기록이 없어요.</Text>
          <Text style={styles.emptySubText}>1정거장 전 버스가 오면 탑승 확인을 눌러보세요!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>나의 탑승 기록</Text>
      {showStorageNotice && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeEmoji}>💾</Text>
          <Text style={styles.noticeText}>
            탑승 기록은 이 기기에만 저장돼요.{'\n'}앱을 삭제하면 기록이 사라질 수 있어요.
          </Text>
          <TouchableOpacity onPress={dismissNotice} style={styles.noticeClose}>
            <Text style={styles.noticeCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const { date, time } = formatRideTime(item.arrivedAt);
          const isFirst = index === 0;

          return (
            <View style={styles.itemRow}>
              {/* 왼쪽 날짜/시간 */}
              <View style={styles.timeContainer}>
                <Text style={styles.dateText}>{date}</Text>
                <Text style={styles.timeText}>{time}</Text>
              </View>

              {/* 타임라인 */}
              <View style={styles.timelineLine}>
                {!isFirst && <View style={styles.lineTop} />}
                <View style={styles.dot} />
                <View style={styles.lineBottom} />
              </View>

              {/* 오른쪽 카드 */}
              <TouchableOpacity
                style={styles.infoCard}
                activeOpacity={0.7}
                onPress={() => onNavigate('stop', {
                  nodeid: item.stopNodeid,
                  nodenm: item.stopNodenm,
                })}
              >
                <Text style={styles.busNo}>{item.routeno}번</Text>
                <Text style={styles.stopName}>📍 {item.stopNodenm}</Text>
                <Text style={styles.cityName}>{item.cityName}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#4E5968', marginBottom: 8 },
  emptySubText: { fontSize: 13, color: '#8B95A1', textAlign: 'center', lineHeight: 20 },

  listContent: { paddingBottom: 20 },
  itemRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },

  timeContainer: { width: 72, alignItems: 'flex-end', paddingTop: 4 },
  dateText: { fontSize: 12, color: '#8B95A1', marginBottom: 2 },
  timeText: { fontSize: 13, fontWeight: '600', color: '#333' },

  timelineLine: {
    width: 20,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  lineTop: {
    position: 'absolute',
    top: -16,
    width: 2,
    height: 16,
    backgroundColor: '#E5E8EB',
  },
  lineBottom: {
    position: 'absolute',
    top: 10,
    width: 2,
    height: 60,
    backgroundColor: '#E5E8EB',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#31D698',
    marginTop: 6,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },

  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  busNo: { fontSize: 16, fontWeight: 'bold', color: '#191F28', marginBottom: 4 },
  stopName: { fontSize: 14, color: '#4E5968', marginBottom: 2 },
  cityName: { fontSize: 12, color: '#8B95A1' },

  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noticeEmoji: { fontSize: 18, marginRight: 8 },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#7A6000',
    lineHeight: 18,
  },
  noticeClose: { padding: 4, marginLeft: 8 },
  noticeCloseText: { fontSize: 14, color: '#B0A060' },

});

export default ScheduleSection;