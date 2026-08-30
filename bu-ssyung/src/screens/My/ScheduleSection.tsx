import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { IBusRideHistory } from '../../types/IBusRideHistory';
import { Storage } from '@apps-in-toss/framework';
import { COLORS } from '../../constants/theme';
import { busHistoryStorage } from '../../utils/busHistoryStorage';

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
  setShowHistoryManage: (showHistory: boolean) => void;
}

const ScheduleSection = ({ onNavigate, setShowHistoryManage }: Props) => {
  const [history, setHistory] = useState<IBusRideHistory[]>([]);
  const MAX_HISTORYS = 5; // 👈 1. 최대 표시 개수를 5개로 변경
  const displayHistorys = history.slice(0, MAX_HISTORYS);
  
  const [showStorageNotice, setShowStorageNotice] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await busHistoryStorage.getRecent();
      setHistory(data);

      if (data.length > 0) {
        const noticed = await Storage.getItem('storage_notice_seen');
        if (!noticed) setShowStorageNotice(true);
      }
    };
    load();
  }, []);

  const dismissNotice = async () => {
    await Storage.setItem('storage_notice_seen', 'true');
    setShowStorageNotice(false);
  };

  // 👈 2. 전체 탑승 기록이 5개를 초과할 때만 더보기 버튼 노출
  const hasMore = history.length > MAX_HISTORYS;

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>나의 탑승 기록</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🤫</Text>
          <Text style={styles.emptyText}>아직 탑승 기록이 없어요.</Text>
          <Text style={styles.emptySubText}>버스에 타기 전에 버튼을 눌러 탑승 표시를 찍어보세요!</Text>
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
        data={displayHistorys}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent]}
        renderItem={({ item, index }) => {
          const { date, time } = formatRideTime(item.arrivedAt);
          const isFirst = index === 0;
          const isLast = index === displayHistorys.length - 1;

          return (
            <View style={styles.itemRow}>
              <View style={styles.timeContainer}>
                <Text style={styles.dateText}>{date}</Text>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              <View style={styles.timelineLine}>
                {!isFirst && <View style={styles.lineTop} />}
                <View style={styles.dot} />
                {/* 👈 3. 마지막 아이템 밑에는 타임라인 선이 그려지지 않도록 처리 */}
                {!isLast && <View style={styles.lineBottom} />}
              </View>
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
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity 
              style={styles.moreButton} 
              onPress={() => setShowHistoryManage(true)} // 👈 HistoryManageScreen으로 이동
              activeOpacity={0.7}
            >
              <Text style={styles.moreButtonText}>전체 탑승 기록 확인하기 ({history.length}개)</Text>
            </TouchableOpacity>
          ) : null
        }
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.main,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.text.sub, marginBottom: 8 },
  emptySubText: { fontSize: 13, color: COLORS.text.hint, textAlign: 'center', lineHeight: 20 },

  listContent: { paddingBottom: 20 },
  itemRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },

  timeContainer: { width: 72, alignItems: 'flex-end', paddingTop: 4 },
  dateText: { fontSize: 13, color: COLORS.text.hint, marginBottom: 2 },
  timeText: { fontSize: 14, fontWeight: '600', color: COLORS.text.main },

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
    backgroundColor: COLORS.border,
  },
  lineBottom: {
    position: 'absolute',
    top: 10,
    width: 2,
    height: 60,
    backgroundColor: COLORS.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    borderWidth: 2,
    borderColor: COLORS.text.white,
    zIndex: 1,
  },

  infoCard: {
    flex: 1,
    backgroundColor: COLORS.text.white,
    borderRadius: 16,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  busNo: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 4 },
  stopName: { fontSize: 14, color: COLORS.text.sub, marginBottom: 2 },
  cityName: { fontSize: 12, color: COLORS.text.hint },

  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  noticeEmoji: { fontSize: 18, marginRight: 8 },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 18,
  },
  noticeClose: { padding: 4, marginLeft: 8 },
  noticeCloseText: { fontSize: 14, color: COLORS.text.hint },
  moreButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
});

export default ScheduleSection;