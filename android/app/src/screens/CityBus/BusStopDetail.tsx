import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';
import { IArriveWithDestination, useArriveInfoInBusStop } from '../../hooks/Arrive/useArriveInfoInBusStop';
import { useFavorites } from '../../hooks/favorites/useFavorites';
import SaveModal from '../../components/SaveModal';
import MenuBottomSheet from '../../components/MenuBottomSheet';
import { getSpecifyArriveInfoInBusStop } from '../../services/Arrive/getSpecifyArriveInfoInBusStop';
import { Bell, Info } from 'lucide-react-native';
import { Alert, Vibration, NativeModules } from 'react-native';
import notifee, { AndroidImportance, AndroidColor } from '@notifee/react-native';

const formatArrTime = (seconds: number): string => {
  if (seconds < 60) return '곧 도착';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const roundedSec = Math.floor(sec / 10) * 10;
  if (roundedSec === 0) return `${min}분`;
  return `${min}분 ${roundedSec}초`;
};

const CITY_CODE_MAP: Record<string, number> = {
  '광주': 24, '서울': 11, '부산': 26, '대구': 22,
  '인천': 23, '대전': 25, '울산': 21, '세종': 12, '경기': 31,
};

const DEFAULT_EMOJI = '🔖';

interface BusStopDetailProps {
  stopInfo: any;
  cityName: string;
  onBack: () => void;
  onBusPress: (busInfo: any) => void;
}

const BusStopDetail = ({ stopInfo, cityName, onBack, onBusPress }: BusStopDetailProps) => {
  const cityCode = CITY_CODE_MAP[cityName] || 24;
  const { locations, loading, error, search, reset } = useArriveInfoInBusStop();
  const { addStop, removeFavorite, isStopSaved, getFavoriteId, load } = useFavorites();

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  
  const { LiveActivityModule } = NativeModules; // iOS 전용 모듈 브릿지

  // 버스 위치 데이터 참조 (인터벌 내에서 최신 데이터를 참조하기 위함)
  const locationsRef = useRef(locations);
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  // 알람 감시 상태
  const [monitoringRouteId, setMonitoringBus] = useState<string | null>(null);
  const [lastPrevCount, setLastPrevCount] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(true); // 처음 진입 시 도움말 표시 여부

  const saved = isStopSaved(stopInfo.nodeid);

  useEffect(() => {
    load();
    search(cityCode, stopInfo.nodeid);
    setupNotificationChannels();
    return () => reset();
  }, []);

  // 안드로이드 알림 채널 초기화 (LTS 기준)
  const setupNotificationChannels = async () => {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'bus-arrival-alert',
        name: '버스 도착 알림',
        lights: true,
        lightColor: AndroidColor.GREEN,
        importance: AndroidImportance.HIGH,
        vibration: true,
      });
    }
  };

  // 실제 시스템 알림 발송 함수
  const triggerSystemNotification = async (routeno: string, currentStops: number) => {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        title: `🚌 ${routeno}번 버스 접근 중!`,
        body: `현재 ${currentStops}정거장 전입니다. 준비하세요!`,
        android: {
          channelId: 'bus-arrival-alert',
          smallIcon: 'ic_launcher', // 앱 아이콘 설정 필요
          pressAction: { id: 'default' },
          importance: AndroidImportance.HIGH,
        },
      });
    } else if (Platform.OS === 'ios' && LiveActivityModule) {
      // iOS Dynamic Island 업데이트 호출
      LiveActivityModule.updateActivity(routeno, currentStops);
    }
    
    Vibration.vibrate([0, 500, 100, 500]);
  };

  // 알람 감시 로직 (30초 주기)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // 알람 설정 시 iOS Live Activity 시작 (브릿지 호출)
    if (monitoringRouteId && Platform.OS === 'ios' && LiveActivityModule) {
      LiveActivityModule.startActivity(stopInfo.nodenm, monitoringRouteId);
    }

    if (monitoringRouteId) {
      interval = setInterval(async () => {
        try {
          const result = await getSpecifyArriveInfoInBusStop(cityCode, stopInfo.nodeid, monitoringRouteId);
          if (result && result.length > 0) {
            const currentStops = result[0].arrprevstationcnt;
            
            // 정거장 수가 줄어들었을 때 알림
            if (lastPrevCount !== null && currentStops < lastPrevCount) {
              const targetBus = locationsRef.current.find(l => l.routeid === monitoringRouteId);
              if (targetBus) {
                triggerSystemNotification(targetBus.routeno, currentStops);
              }
            }
            setLastPrevCount(currentStops);
          }
        } catch (e) {
          console.error("Monitoring error:", e);
        }
      }, 30000);
    }
    
    return () => {
      clearInterval(interval);
      // 종료 시 Live Activity 종료
      if (Platform.OS === 'ios' && LiveActivityModule) LiveActivityModule.stopActivity();
    };
  }, [monitoringRouteId, lastPrevCount, cityCode, stopInfo.nodeid, stopInfo.nodenm]);

  const toggleAlarm = (item: IArriveWithDestination) => {
    if (monitoringRouteId === item.routeid) {
      setMonitoringBus(null);
      setLastPrevCount(null);
      if (Platform.OS === 'android') {
        notifee.cancelAllNotifications();
      }
    } else {
      setMonitoringBus(item.routeid);
      setLastPrevCount(item.arrprevstationcnt ?? null);
      Alert.alert("알림 설정", `${item.routeno}번 버스 추적을 시작합니다. 정거장이 줄어들면 알려드릴게요!`);
    }
  };

  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => (a.arrtime ?? 999999) - (b.arrtime ?? 999999));
  }, [locations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await search(cityCode, stopInfo.nodeid);
    setRefreshing(false);
  }, [cityCode, stopInfo.nodeid]);

  const handleSave = async (emoji: string, memo: string) => {
    await addStop({
      type: 'stop',
      nodeid: stopInfo.nodeid,
      nodenm: stopInfo.nodenm,
      nodeno: stopInfo.nodeno,
      cityName,
      emoji,
      memo,
    });
    setSaveModalVisible(false);
    setMenuVisible(false);
  };

  const handleUnsave = async () => {
    await removeFavorite(getFavoriteId('stop', stopInfo.nodeid));
    setMenuVisible(false);
  };

  const handleOpenSaveModal = () => {
    setMenuVisible(false);
    setSaveModalVisible(true);
  };

  const renderBusItem = ({ item }: { item: IArriveWithDestination }) => {
    const color = getBusTypeColor(cityName, item.routetp);
    const hasArrival = item.arrtime !== undefined && item.arrtime !== null;
    const arrprevstationcnt = item.arrprevstationcnt ?? 0;
    const isCritical = hasArrival && arrprevstationcnt <= 2;
    const isWarning = hasArrival && item.arrtime! <= 300;

    return (
      <TouchableOpacity style={styles.busItem} activeOpacity={0.7} onPress={() => onBusPress(item)}>
        <View style={styles.busInfoLeft}>
          <Text style={[styles.busName, { color }]}>{item.routeno}</Text>
          <Text style={styles.busDirection}>{item.endnodenm} 종점</Text>
        </View>
        <View style={styles.busInfoRight}>
          {hasArrival ? (
            <>
              <View style={styles.timeRow}>
                <TouchableOpacity 
                  style={styles.alarmIcon} 
                  onPress={() => toggleAlarm(item)}
                >
                  {monitoringRouteId === item.routeid ? (
                    <Bell size={20} color="#31D698" fill="#31D698" />
                  ) : (
                    <Bell size={20} color="#D1D6DB" />
                  )}
                </TouchableOpacity>
                <View style={[styles.timeBadge, isCritical ? styles.criticalBadge : isWarning ? styles.warningBadge : styles.normalBadge]}>
                <Text style={[styles.remainTime, isCritical ? styles.criticalText : isWarning ? styles.warningText : styles.normalText]}>
                  {formatArrTime(item.arrtime!)}
                </Text>
              </View>
              </View>
              <Text style={styles.remainStop}>{arrprevstationcnt}정거장 전</Text>
            </>
          ) : (
            <Text style={styles.noArrivalText}>도착 정보 없음</Text>
          )}
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
          <Text style={styles.stopName}>{stopInfo.nodenm}</Text>
          <Text style={styles.arsId}>정류소 번호 {stopInfo.nodeno}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuText}>•••</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>도착 예정 버스</Text>
        <Text style={styles.listCount}>총 {sortedLocations.length}대</Text>
      </View>

      {showGuide && (
        <View style={styles.guideBox}>
          <Info size={16} color="#8B95A1" />
          <Text style={styles.guideText}>종 모양 아이콘을 누르면 도착 알림을 받을 수 있어요.</Text>
          <TouchableOpacity onPress={() => setShowGuide(false)}><Text style={styles.guideClose}>✕</Text></TouchableOpacity>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ADEBB3" />
          <Text style={{ marginTop: 10, color: '#888' }}>도착 정보를 불러오고 있어요...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: '#aaa' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={sortedLocations}
          keyExtractor={(item) => item.routeid}
          renderItem={renderBusItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ADEBB3" />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>도착 예정 버스가 없습니다.</Text>
            </View>
          }
        />
      )}

      {/* 공통 메뉴 바텀시트 적용 */}
      <MenuBottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSavePress={handleOpenSaveModal}
        onUnsavePress={handleUnsave}
        isSaved={saved}
        saveLabel="저장"
      />

      {/* 저장 Modal - SaveModal로 교체 */}
      <SaveModal
        visible={saveModalVisible}
        title={stopInfo.nodenm}
        subtitle={`정류소 번호 ${stopInfo.nodeno}`}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FBF6' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backButton: { padding: 5, marginRight: 10 },
  backText: { fontSize: 24, color: '#333' },
  headerContent: { flex: 1 },
  stopName: { fontSize: 20, fontWeight: 'bold', color: '#191F28' },
  arsId: { fontSize: 13, color: '#8B95A1', marginTop: 2 },
  menuButton: { padding: 8 },
  menuText: { fontSize: 20, color: '#333', fontWeight: 'bold', letterSpacing: 2 },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#191F28' },
  listCount: { fontSize: 14, color: '#8B95A1' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },

  busItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  busInfoLeft: { justifyContent: 'center' },
  busName: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
  busDirection: { fontSize: 14, color: '#8B95A1', fontWeight: '500' },
  busInfoRight: { alignItems: 'flex-end' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  alarmIcon: { padding: 8, marginRight: 4 },
  timeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 6 },
  normalBadge: { backgroundColor: '#F2F4F6' },
  warningBadge: { backgroundColor: '#E7F9ED' },
  criticalBadge: { backgroundColor: '#31D698' },
  remainTime: { fontSize: 16, fontWeight: 'bold' },
  normalText: { color: '#4E5968' },
  warningText: { color: '#2E7D32' },
  criticalText: { color: '#FFFFFF' },
  remainStop: { fontSize: 13, color: '#8B95A1', fontWeight: '500' },
  noArrivalText: { fontSize: 14, color: '#D1D6DB', fontWeight: '500' },
  guideBox: { 
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, 
    padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: '#E5E8EB'
  },
  guideText: { flex: 1, marginLeft: 8, fontSize: 13, color: '#4E5968' },
  guideClose: { paddingHorizontal: 8, color: '#8B95A1' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#aaa', fontSize: 16 },

  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },

  menuSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40,
  },
  menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuItemText: { fontSize: 17, color: '#191F28', fontWeight: '500' },

  saveSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  saveSheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#191F28', marginBottom: 16 },
  infoBox: { backgroundColor: '#F5FBF6', borderRadius: 12, padding: 14, marginBottom: 20 },
  infoTitle: { fontSize: 17, fontWeight: 'bold', color: '#191F28' },
  infoSub: { fontSize: 13, color: '#8B95A1', marginTop: 4 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4E5968', marginBottom: 8 },
  emojiRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5FBF6', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  emojiInput: { fontSize: 32, marginRight: 12, minWidth: 44 },
  emojiHint: { fontSize: 14, color: '#8B95A1' },
  memoInput: {
    backgroundColor: '#F5FBF6', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#191F28', marginBottom: 24,
  },
  saveButton: { backgroundColor: '#ADEBB3', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveButtonText: { fontSize: 17, fontWeight: 'bold', color: '#191F28' },
});

export default BusStopDetail;