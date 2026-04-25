import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { getBusTypeColor } from '../../constants/busColors';
import { useBusRouteDetail } from '../../hooks/BusRoute/useBusRouteDetail';
import { useFavorites } from '../../hooks/favorites/useFavorites';
import { IBusViaRoute, IBusLocation } from '../../types/bus';
import SaveModal from '../../components/SaveModal';
import MenuBottomSheet from '../../components/MenuBottomSheet';

const DEFAULT_EMOJI = '🔖';

interface BusRouteDetailProps {
  busInfo: any;
  cityName: string;
  cityCode: number;
  onBack: () => void;
  onStopPress: (stopInfo: any) => void;
  targetNodeId?: string; // ← 추가
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
    await removeFavorite(getFavoriteId('bus', busInfo.routeid));
    setMenuVisible(false);
  };

  const handleOpenSaveModal = () => {
    setMenuVisible(false);
    setSaveModalVisible(true);
  };

  const locationMap: Record<string, IBusLocation[]> = {};
  console.log(locations)
  locations.forEach(loc => {
    if (!locationMap[loc.nodeid]) locationMap[loc.nodeid] = [];
    locationMap[loc.nodeid].push(loc);
  });

  const sortedStops = [...stops].sort((a, b) => a.nodeord - b.nodeord);
  const listData: any[] = sortedStops.map(s => ({ ...s, __type: 'stop' }));

  // 기존 useEffect 아래에 추가
  useEffect(() => {
    if (!targetNodeId || listData.length === 0) return;
    
    const index = listData.findIndex(item => item.nodeid === targetNodeId);
    if (index !== -1) {
      // 데이터 렌더링 후 스크롤하도록 약간 딜레이
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // 화면 정가운데
        });
      }, 300);
    }
  }, [targetNodeId, listData]);

  const renderStop = (item: IBusViaRoute, index: number, sectionStops: IBusViaRoute[]) => {
    const busesHere = locationMap[item.nodeid] || [];
    const isFirst = index === 0;
    const isLast = index === sectionStops.length - 1;
    const isTarget = item.nodeid === targetNodeId;
    return (
      <View style={styles.itemContainer}>
        {busesHere.map((bus) => (
          <View key={bus.vehicleno} style={styles.busRow}>
            <View style={styles.timelineSection}>
              {!isFirst && <View style={[styles.line, styles.lineTop]} />}
              <View style={[styles.line, styles.lineBottom]} />
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

        <TouchableOpacity
          style={[
          styles.stationRow,
          isTarget && styles.targetStationRow 
          ]}
          onPress={() => onStopPress(item)}
          activeOpacity={0.6}
        >
          <View style={styles.timelineSection}>
            {(isFirst && busesHere.length === 0) ? null : <View style={[styles.line, styles.lineTop]} />}
            {!isLast && <View style={[styles.line, styles.lineBottom]} />}
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
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return renderStop(item, index, sortedStops);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ADEBB3" />
        <Text style={{ marginTop: 10, color: '#888' }}>노선 정보를 불러오고 있어요...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#aaa' }}>{error}</Text>
      </View>
    );
  }
  // TODO 부산에서 nodeid가 안나오는 사고 발생. ypeError: Cannot read property 'nodeid' of undefined
    // at anonymous (&platform=ios&dev=true&lazy=true&minify=false&inlineSourceMap=false&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server&app=com.sardinespicysalad.gwangjubus:101758:27)
    // at forEach (native)
    // at BusRouteDetail (&platform=ios&dev=true&lazy=true&minify=false&inlineSourceMap=false&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server&app=com.sardinespicysalad.gwangjubus:101757:22)
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
        {/* 메뉴 버튼 */}
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

      {/* 공통 메뉴 바텀시트 적용 */}
      <MenuBottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSavePress={handleOpenSaveModal}
        onUnsavePress={handleUnsave}
        isSaved={saved}
      />

      {/* 저장 Modal - SaveModal로 교체 */}
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
  container: { flex: 1, backgroundColor: '#F5FBF6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: { marginRight: 15, padding: 5 },
  backText: { fontSize: 24, color: '#333' },
  headerBusTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  headerBusName: { fontSize: 24, fontWeight: 'bold' },
  routeTypeBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  routeTypeSmall: { fontSize: 14, fontWeight: '700' },
  headerDirection: { fontSize: 15, color: '#555', marginTop: 2 },
  headerInterval: { fontSize: 13, color: '#ADEBB3', marginTop: 4, fontWeight: '600' },
  menuButton: { padding: 8, marginLeft: 8 },
  menuText: { fontSize: 20, color: '#333', fontWeight: 'bold', letterSpacing: 2 },

  listContent: { paddingVertical: 20, paddingHorizontal: 20 },
  itemContainer: { flexDirection: 'column' },
  busRow: { flexDirection: 'row', height: 60 },
  stationRow: { flexDirection: 'row', height: 56 },

  timelineSection: { width: 40, alignItems: 'center' },
  line: { width: 2, backgroundColor: '#ddd', position: 'absolute', left: 19 },
  lineTop: { top: 0, bottom: '50%' },
  lineBottom: { top: '50%', bottom: 0 },

  nodeCircle: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 2,
    zIndex: 1, position: 'absolute', top: '50%', marginTop: -7,
    justifyContent: 'center', alignItems: 'center',
  },
  nodeCircleEnd: { width: 18, height: 18, borderRadius: 9, marginTop: -9 },
  innerDot: { width: 8, height: 8, borderRadius: 4 },

  busIconWrapper: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    zIndex: 2, position: 'absolute', top: '50%', marginTop: -17,
    elevation: 3,
  },
  busIconEmoji: { fontSize: 18 },

  busInfoSection: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  busInfoCard: {
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: '#fff', borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#E0EAE2',
  },
  plateNo: { fontSize: 15, fontWeight: 'bold', color: '#333' },

  stationInfoSection: {
    flex: 1, paddingLeft: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  textColumn: { flex: 1, justifyContent: 'center' },
  stopName: { fontSize: 18, color: '#333' },
  stopNameEnd: { fontWeight: 'bold', color: '#191F28', fontSize: 19 },
  nodeNo: { fontSize: 13, color: '#aaa', marginTop: 2 },
  chevron: { fontSize: 24, color: '#B0B8C1' },

  dividerContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 16, paddingHorizontal: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ADEBB3' },
  dividerBadge: {
    backgroundColor: '#ADEBB3', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20, marginHorizontal: 8,
  },
  dividerText: { fontSize: 13, color: '#191F28', fontWeight: 'bold' },

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

  // styles.StyleSheet.create 안에 추가
  targetStationRow: {
    backgroundColor: '#E8FBF2',
    borderRadius: 12,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  targetNodeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: '#31D698',
    borderWidth: 2.5,
    marginTop: -9,
  },
  targetStopName: {
    color: '#191F28',
    fontWeight: 'bold',
  },
  targetBadgeText: {
    fontSize: 12,
    color: '#31D698',
    fontWeight: '600',
  },
});

export default BusRouteDetail;