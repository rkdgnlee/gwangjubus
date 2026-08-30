import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, 
} from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';
import { useBusRouteDetail } from '../../hooks/BusRoute/useBusRouteDetail';
import { useFavorites } from '../../hooks/favorites/useFavorites';
import { IBusViaRoute, IBusLocation } from '../../types/bus';
import SaveModal from '../../components/SaveModal';
import MenuBottomSheet from '../../components/MenuBottomSheet';
import { COLORS } from '../../constants/theme';

interface BusRouteDetailProps {
  busInfo: any;
  cityName: string;
  cityCode: number;
  onBack: () => void;
  onStopPress: (stopInfo: any) => void;
  targetNodeId?: string;
}

const BusRouteDetail = ({ busInfo, cityName, cityCode, onBack, onStopPress, targetNodeId }: BusRouteDetailProps) => {
  const busColor = getBusTypeColor(cityName, busInfo.routetp);
  const { info, stops, locations, loading, error, fetch, refreshLocations } = useBusRouteDetail();
  const { addBus, removeFavorite, isBusSaved, getFavoriteId, load } = useFavorites();

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const saved = isBusSaved(busInfo.routeid);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    load();
    fetch(cityCode, busInfo.routeid);
  }, [busInfo.routeid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLocations(cityCode, busInfo.routeid);
    setRefreshing(false);
  }, [cityCode, busInfo.routeid]);

  const handleSave = async (emoji: string, memo: string) => {
    await addBus({
      type: 'bus',
      routeid: busInfo.routeid,
      routeno: busInfo.routeno,
      routetp: busInfo.routetp,
      startnodenm: busInfo.startnodenm,
      endnodenm: busInfo.endnodenm,
      cityName,
      emoji: emoji,
      memo: memo,
    });
    setSaveModalVisible(false);
    setMenuVisible(false);
  };

  const handleUnsave = async () => {
    const favoriteId = getFavoriteId('bus', busInfo.routeid);
    if (!favoriteId) {
      console.warn('favoriteId not found');
      setMenuVisible(false);
      return;
    }
    await removeFavorite(favoriteId);
    setMenuVisible(false);
  };

  const handleOpenSaveModal = () => {
    setMenuVisible(false);
    setSaveModalVisible(true);
  };

  // 💡 안전한 locationMap 생성 (부산 등 nodeid가 undefined/숫자인 경우 예외 처리)
  const locationMap: Record<string, IBusLocation[]> = {};
  if (Array.isArray(locations)) {
    locations.forEach(loc => {
      if (!loc || loc.nodeid == null) return;
      const key = String(loc.nodeid);
      if (!locationMap[key]) locationMap[key] = [];
      locationMap[key].push(loc);
    });
  }

  const sortedStops = [...stops].sort((a, b) => a.nodeord - b.nodeord);
  const listData: any[] = sortedStops.map(s => ({ ...s, __type: 'stop' }));

  useEffect(() => {
    if (!targetNodeId || listData.length === 0) return;
    
    const index = listData.findIndex(item => String(item.nodeid) === String(targetNodeId));
    if (index !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 300);
    }
  }, [targetNodeId, listData]);

  const renderStop = (item: IBusViaRoute, index: number, sectionStops: IBusViaRoute[]) => {
    const busesHere = locationMap[String(item.nodeid)] || [];
    const isFirst = index === 0;
    const isLast = index === sectionStops.length - 1;
    const isTarget = String(item.nodeid) === String(targetNodeId);

    return (
      <View style={styles.itemContainer}>
        {/* 1. 정류장 표시 */}
        <TouchableOpacity
          style={[
            styles.stationRow,
            isTarget && styles.targetStationRow 
          ]}
          onPress={() => onStopPress(item)}
          activeOpacity={0.6}
        >
          <View style={styles.timelineSection}>
            {!isFirst && <View style={[styles.line, styles.lineTop]} />}
            {(!isLast || busesHere.length > 0) && <View style={[styles.line, styles.lineBottom]} />}
            <View style={[styles.nodeCircle, isFirst || isLast ? styles.nodeCircleEnd : {}]}>
              {(isFirst || isLast) && <View style={[styles.innerDot, { backgroundColor: busColor }]} />}
            </View>
          </View>
          <View style={styles.stationInfoSection}>
            <View style={styles.textColumn}>
              <Text style={[styles.stopName, (isFirst || isLast) && styles.stopNameEnd]}>{item.nodenm}</Text>
              <Text style={styles.nodeNo}>{item.nodeno}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 2. 버스 위치 표시 (정류장 '아래'로 이동) */}
        {busesHere.map((bus) => (
          <View key={bus.vehicleno} style={styles.busRow}>
            <View style={styles.timelineSection}>
              <View style={[styles.line, styles.lineTop]} />
              {!isLast && <View style={[styles.line, styles.lineBottom]} />}
              <View style={[styles.busIconWrapper, { backgroundColor: busColor }]}>
                <Text style={styles.busIconEmoji}>🚌</Text>
              </View>
            </View>
            <View style={styles.busInfoSection}>
              <View style={styles.busInfoCard}>
                <Text style={styles.plateNo}>{bus.vehicleno}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return renderStop(item, index, sortedStops);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text.sub }}>노선 정보를 불러오고 있어요...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: COLORS.text.muted }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBusTitleRow}>
            <Text style={[styles.headerBusName, { color: busColor }]}>{busInfo.routeno}</Text>
            <View style={[styles.routeTypeBadge, { backgroundColor: busColor + '15' }]}>
              <Text style={[styles.routeTypeSmall, { color: busColor }]}>{busInfo.routetp}</Text>
            </View>
          </View>
          <Text style={styles.headerDirection}>
            🚩 {info?.startnodenm ?? ""}  →  🏁 {info?.endnodenm ?? ""}
          </Text>
          {info && (
            <Text style={styles.headerInterval}>
              배차 {info.intervaltime}분 간격  |  첫차 {String(info.startvehicletime).slice(0, 2)}:{String(info.startvehicletime).slice(2, 4)}  막차 {String(info.endvehicletime).slice(0, 2)}:{String(info.endvehicletime).slice(2, 4)}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* 노선 리스트 */}
      <FlatList
        ref={flatListRef}
        data={listData}
        keyExtractor={(item, index) => `${item.nodeid}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.5,
            });
          }, 500);
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ADEBB3" />
        }
      />

      {/* 바텀시트 메뉴 */}
      <MenuBottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSavePress={handleOpenSaveModal}
        onUnsavePress={handleUnsave}
        isSaved={saved}
      />

      {/* 저장 모달 */}
      <SaveModal
        visible={saveModalVisible}
        title={busInfo.routeno}
        subtitle={`노선 정보 | 🚩${busInfo.startnodenm} → 🏁${busInfo.endnodenm}`}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.text.white,
  },
  backButton: { marginRight: 15, padding: 5 },
  backText: { fontSize: 24, color: COLORS.text.main },
  headerBusTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  headerBusName: { fontSize: 24, fontWeight: 'bold' },
  routeTypeBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  routeTypeSmall: { fontSize: 14, fontWeight: '700' },
  headerDirection: { fontSize: 15, color: COLORS.text.sub, marginTop: 2 },
  headerInterval: { fontSize: 13, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
  menuButton: { padding: 8, marginLeft: 8 },
  menuText: { fontSize: 20, color: COLORS.text.main, fontWeight: 'bold', letterSpacing: 2 },

  listContent: { paddingVertical: 20, paddingHorizontal: 20 },
  itemContainer: { flexDirection: 'column' },
  busRow: { flexDirection: 'row', height: 60 },
  stationRow: { flexDirection: 'row', height: 56 },

  timelineSection: { width: 40, alignItems: 'center' },
  line: { width: 2, backgroundColor: COLORS.border, position: 'absolute', left: 19 },
  lineTop: { top: 0, bottom: '50%' },
  lineBottom: { top: '50%', bottom: 0 },

  nodeCircle: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: COLORS.text.white, borderColor: COLORS.text.muted, borderWidth: 2,
    zIndex: 1, position: 'absolute', top: '50%', marginTop: -7,
    justifyContent: 'center', alignItems: 'center',
  },
  nodeCircleEnd: { width: 18, height: 18, borderRadius: 9, marginTop: -9 },
  innerDot: { width: 8, height: 8, borderRadius: 4 },

  busIconWrapper: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.text.white,
    zIndex: 2, position: 'absolute', top: '50%', marginTop: -17,
    elevation: 3,
  },
  busIconEmoji: { fontSize: 18 },

  busInfoSection: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  busInfoCard: {
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: COLORS.text.white, borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: COLORS.border,
  },
  plateNo: { fontSize: 15, fontWeight: 'bold', color: COLORS.text.main },

  stationInfoSection: {
    flex: 1, paddingLeft: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  textColumn: { flex: 1, justifyContent: 'center' },
  stopName: { fontSize: 18, color: COLORS.text.main },
  stopNameEnd: { fontWeight: 'bold', color: COLORS.text.main, fontSize: 19 },
  nodeNo: { fontSize: 13, color: COLORS.text.hint, marginTop: 2 },
  chevron: { fontSize: 24, color: COLORS.text.muted },

  targetStationRow: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
});

export default BusRouteDetail;