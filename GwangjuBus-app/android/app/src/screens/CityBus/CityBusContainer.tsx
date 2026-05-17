import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, FlatList } from 'react-native';
import BusRouteDetail from './BusRouteDetail';
import BusStopDetail from './BusStopDetail';
import SearchBar from './SearchBar';
import BusResultList from './BusResultList';
import { useBusRouteNoList } from '../../hooks/BusRoute/useBusRouteNoList';
import { useBusStopNoList } from '../../hooks/BusStop/useBusStopNoList';
import { useSearchHistory } from '../../hooks/search/useSearchHistory';
import { COLORS } from '../../constants/theme';

interface Props {
  cityName: string;
  cityCode: number;
  initialData?: { type: 'bus' | 'stop', data: any } | null;
  activeAlarmId?: string | null;
  onToggleAlarm?: (item: any, stopInfo: any, cityCode: number) => void;
}

const CityBusContainer = ({ cityName, cityCode, initialData, activeAlarmId, onToggleAlarm }: Props) => {
  const [searchMode, setSearchMode] = useState<'bus' | 'stop'>('bus');
  const [searchText, setSearchText] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  // initialData가 있으면 스택을 해당 화면으로 시작, 없으면 빈 스택(검색창)으로 시작
  const [navStack, setNavStack] = useState<any[]>(
    initialData ? [{ screen: initialData.type, data: initialData.data }] : []
  );
  const { routes, loading: busLoading, search: searchBus, reset: resetBus } = useBusRouteNoList();
  const { stops, loading: stopLoading, search: searchStop, reset: resetStop } = useBusStopNoList();

  const {
    history: busHistory,
    addHistory: addBusHistory,
    clearHistory: clearBusHistory,
    removeHistory: removeBusHistory,
  } = useSearchHistory('bus');

  const {
    history: stopHistory,
    addHistory: addStopHistory,
    clearHistory: clearStopHistory,
    removeHistory: removeStopHistory,
  } = useSearchHistory('stop');

  // 현재 모드에 맞는 것만 사용
  const history = searchMode === 'bus' ? busHistory : stopHistory;
  const addHistory = searchMode === 'bus' ? addBusHistory : addStopHistory;
  const clearHistory = searchMode === 'bus' ? clearBusHistory : clearStopHistory;
  const removeHistory = searchMode === 'bus' ? removeBusHistory : removeStopHistory;

  useEffect(() => {
    if (initialData) {
      // 즐겨찾기로 진입 시 기존 검색 상태 초기화
      setSearchText('');
      setHasSearched(false);
      // 스택을 즐겨찾기 화면으로 교체
      setNavStack([{ screen: initialData.type, data: initialData.data }]);
    }
  }, [initialData]);

  // 모드 전환 시 초기화
  const handleModeChange = (mode: 'bus' | 'stop') => {
    setSearchMode(mode);
    setSearchText('');
    setHasSearched(false);
    resetBus();
    resetStop();
  };

  const pushScreen = (screen: 'bus' | 'stop', data: any) => {
    setNavStack(prev => [...prev, { screen, data }]);
  };

  const popScreen = () => {
    setNavStack(prev => prev.slice(0, -1));
  };

  const handleSearch = useCallback(async (text?: string) => {
    const query = text ?? searchText;
    if (!query.trim()) return;
    setHasSearched(true);
    await addHistory(query);
    if (searchMode === 'bus') {
      searchBus(cityCode, query);
    } else {
      searchStop(cityCode, query);
    }
  }, [searchText, searchMode, cityCode]);

  // 상세 화면
  const currentScreen = navStack[navStack.length - 1];
  if (currentScreen) {
    if (currentScreen.screen === 'bus') {
      return (
        <BusRouteDetail
          busInfo={currentScreen.data}
          cityName={cityName}
          cityCode={cityCode}
          onBack={popScreen}
          onStopPress={(stop) => pushScreen('stop', stop)}
          targetNodeId={currentScreen.data.fromNodeId} // ← 추가
        />
      );
    } else {
      return (
        <BusStopDetail
          stopInfo={currentScreen.data}
          cityName={cityName}
          cityCode={cityCode}
          onBack={popScreen}
          onBusPress={(bus) => pushScreen('bus', bus)}
          activeAlarmId={activeAlarmId}
          onToggleAlarm={onToggleAlarm}
        />
      );
    }
  }

  const isLoading = busLoading || stopLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>통합 검색</Text>

      {/* 모드 토글 */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, searchMode === 'bus' && styles.toggleBtnActive]}
          onPress={() => handleModeChange('bus')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, searchMode === 'bus' && styles.toggleTextActive]}>버스 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, searchMode === 'stop' && styles.toggleBtnActive]}
          onPress={() => handleModeChange('stop')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, searchMode === 'stop' && styles.toggleTextActive]}>정류장 검색</Text>
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSearch={() => handleSearch()}
      />

      {/* 결과 or 검색기록 */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: COLORS.text.sub }}>정보를 불러오고 있어요...</Text>
          </View>
        ) : hasSearched ? (
          <BusResultList
            data={searchMode === 'bus' ? routes : stops}
            mode={searchMode}
            cityName={cityName}
            onPressItem={(item) => pushScreen(searchMode, item)}
          />
        ) : (
          // 검색 전 - 검색기록 표시
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>최근 검색</Text>
              {history.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearHistoryText}>전체 삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            {history.length === 0 ? (
              <Text style={styles.emptyHistory}>최근 검색 기록이 없습니다.</Text>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.query + item.timestamp}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => {
                      setSearchText(item.query);
                      handleSearch(item.query);
                    }}
                  >
                    <Text style={styles.historyItemText}>🕐 {item.query}</Text>
                    <TouchableOpacity onPress={() => removeHistory(item.query)}>
                      <Text style={styles.historyDeleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text.main,
    marginBottom: 15,
    marginTop: 24,
    marginLeft: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 25,
    paddingBottom: 15,
    backgroundColor: COLORS.text.white,
  },
  toggleBtn: {
    marginRight: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleText: { color: COLORS.text.hint, fontWeight: '600', fontSize: 14 },
  toggleTextActive: { color: COLORS.text.white, fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  historyContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.sub },
  clearHistoryText: { fontSize: 13, color: COLORS.text.muted },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyItemText: { fontSize: 16, color: COLORS.text.main },
  historyDeleteBtn: { fontSize: 14, color: COLORS.text.muted, paddingHorizontal: 8 },
  emptyHistory: { color: COLORS.text.muted, fontSize: 14, textAlign: 'center', marginTop: 30 },
});

export default CityBusContainer;