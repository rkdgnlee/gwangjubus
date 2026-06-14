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
import { useTicket } from '../../hooks/ticket/useTicket';
import { AdComponent } from '../../components/ads/AdComponent';

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
  const [navStack, setNavStack] = useState<any[]>(
    initialData ? [{ screen: initialData.type, data: initialData.data }] : []
  );
  const [pendingScreen, setPendingScreen] = useState<{ screen: 'bus' | 'stop', data: any } | null>(null);
  const [showAdPhase, setShowAdPhase] = useState(false);

  const { routes, loading: busLoading, search: searchBus, reset: resetBus } = useBusRouteNoList();
  const { stops, loading: stopLoading, search: searchStop, reset: resetStop } = useBusStopNoList();

  // ← 컴포넌트 안으로 이동
  const { consumeTicket, rewardTickets, tickets, showWarn, dismissWarn } = useTicket();
  const [showTicketTooltip, setShowTicketTooltip] = useState(false);
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

  const history = searchMode === 'bus' ? busHistory : stopHistory;
  const addHistory = searchMode === 'bus' ? addBusHistory : addStopHistory;
  const clearHistory = searchMode === 'bus' ? clearBusHistory : clearStopHistory;
  const removeHistory = searchMode === 'bus' ? removeBusHistory : removeStopHistory;

  useEffect(() => {
    if (initialData) {
      setSearchText('');
      setHasSearched(false);
      setNavStack([{ screen: initialData.type, data: initialData.data }]);
    }
  }, [initialData]);

  const handleModeChange = (mode: 'bus' | 'stop') => {
    setSearchMode(mode);
    setSearchText('');
    setHasSearched(false);
    resetBus();
    resetStop();
  };

  const pushScreen = async (screen: 'bus' | 'stop', data: any) => {
    const ok = await consumeTicket();
    if (!ok) {
      // 티켓 0 → 광고 전체화면
      setPendingScreen({ screen, data });
      setShowAdPhase(true);
      return;
    }
    setNavStack(prev => [...prev, { screen, data }]);
  };

  const handleAdReward = async () => {
    await rewardTickets();
    setShowAdPhase(false);
    if (pendingScreen) {
      setNavStack(prev => [...prev, pendingScreen]);
      setPendingScreen(null);
    }
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

  // 광고 전체화면
  if (showAdPhase) {
    return (
      <AdComponent
        tickets={tickets ?? 0}
        onReward={handleAdReward}
        onClose={() => setShowAdPhase(false)}
      />
    );
  }

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
          targetNodeId={currentScreen.data.fromNodeId}
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

      {/* 모드 토글 */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleButtons}>
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

        {/* 티켓 카운트 */}
        <TouchableOpacity
          onPress={() => setShowTicketTooltip(prev => !prev)}
          style={styles.ticketBadge}
          activeOpacity={0.7}
        >
          <Text style={styles.ticketText}>🎟️ {tickets ?? 0}</Text>
          {showTicketTooltip && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>검색 결과 선택 시{'\n'}티켓 1개가 소모돼요</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      

      {/* 검색창 */}
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSearch={() => handleSearch()}
      />

      {/* 30회 이하 경고 배너 */}
      {showWarn && hasSearched && (
        <AdComponent
          tickets={tickets ?? 0}
          onReward={rewardTickets}
          onClose={dismissWarn}
        />
      )}

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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: COLORS.text.white,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketBadge: {
    position: 'relative',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ticketText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.main,
  },
  tooltip: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: COLORS.text.main,
    borderRadius: 8,
    padding: 10,
    width: 160,
    zIndex: 999,
  },
  tooltipText: {
    fontSize: 12,
    color: COLORS.text.white,
    lineHeight: 18,
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