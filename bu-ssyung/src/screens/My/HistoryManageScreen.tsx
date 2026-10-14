// screens/Settings/HistoryManageScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert
} from 'react-native';
import { Storage } from '@apps-in-toss/framework';
import { IBusRideHistory } from '../../types/IBusRideHistory';
import { COLORS } from '../../constants/theme';
import { busHistoryStorage } from '../../utils/busHistoryStorage';
import { CloseIcon } from '../../components/Icons';

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

const HistoryManageScreen = () => {
  const [history, setHistory] = useState<IBusRideHistory[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await busHistoryStorage.getAll();
    setHistory(data);
  };

  const handleRemove = (item: IBusRideHistory) => {
    Alert.alert(
      '기록 삭제',
      `${item.routeno}번 버스 탑승 기록을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await busHistoryStorage.remove(item.id);
            load();
          },
        },
      ]
    );
  };

  const handleRemoveAll = () => {
    Alert.alert(
      '전체 삭제',
      '모든 탑승 기록을 삭제할까요?\n이 작업은 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전체 삭제',
          style: 'destructive',
          onPress: async () => {
            await busHistoryStorage.removeAll();
            // 안내 배너도 초기화 (다시 보여주기)
            await Storage.removeItem('storage_notice_seen');
            load();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 화면 제목 — 뒤로가기는 앱인토스 상단 내비게이션 바가 담당 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>탑승 기록 관리</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleRemoveAll} style={styles.deleteAllButton}>
            <Text style={styles.deleteAllText}>전체 삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🗑️</Text>
          <Text style={styles.emptyText}>탑승 기록이 없어요.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const { date, time } = formatRideTime(item.arrivedAt);
            return (
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemDot} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemBusNo}>{item.routeno}번</Text>
                    <Text style={styles.itemStop}>📍 {item.stopNodenm}</Text>
                    <Text style={styles.itemTime}>{date}  {time}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemove(item)}
                  accessibilityLabel="탑승 기록 삭제"
                >
                  <CloseIcon color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text.main },
  deleteAllButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  deleteAllText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: COLORS.text.hint },

  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.primary, marginRight: 14,
  },
  itemInfo: { flex: 1 },
  itemBusNo: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 4 },
  itemStop: { fontSize: 15, color: COLORS.text.sub, marginBottom: 4 },
  itemTime: { fontSize: 13, color: COLORS.text.hint },
  deleteButton: { width: 44, height: 44, marginRight: -8, justifyContent: 'center', alignItems: 'center' },
});

export default HistoryManageScreen;