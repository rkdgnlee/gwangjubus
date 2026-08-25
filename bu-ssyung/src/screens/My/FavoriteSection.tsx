// FavoriteSection.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { IFavorite, IFavoriteStop, IFavoriteBus } from '../../types/favorite';
import { useFavorites } from '../../hooks/favorites/useFavorites';
import { COLORS } from '../../constants/theme';
import { useFullScreenAd } from '../../hooks/ticket/useFullScreenAd';
import { useTicket } from '../../hooks/tickets/TicketContext';

interface Props {
  onNavigate: (type: 'bus' | 'stop', data: any) => void;
}

const FavoriteSection = ({ onNavigate }: Props) => {
  const { favorites, load } = useFavorites();
  const { rewardTickets, tickets, showWarn, dismissWarn } = useTicket();
  const { isAdLoading, showAd } = useFullScreenAd(); // 👈 2. 광고 상태 가져오기

  React.useEffect(() => { load(); }, []);

  const handlePress = (item: IFavorite) => {
    // 💡 티켓 검사/차감/광고 팝업은 이동을 받는 CityBusContainer(initialData)에서 
    // 전부 알아서 처리하므로 여기서는 단순 이동만 시켜줍니다.
    if (item.type === 'stop') {
      const s = item as IFavoriteStop;
      onNavigate('stop', { nodeid: s.nodeid, nodenm: s.nodenm, nodeno: s.nodeno });
    } else {
      const b = item as IFavoriteBus;
      onNavigate('bus', {
        routeid: b.routeid, routeno: b.routeno, routetp: b.routetp,
        startnodenm: b.startnodenm, endnodenm: b.endnodenm,
      });
    }
  };

  const getSubtitle = (item: IFavorite) => {
    if (item.type === 'stop') return `정류소 ${(item as IFavoriteStop).nodeno}`;
    const b = item as IFavoriteBus;
    return `${b.startnodenm} → ${b.endnodenm}`;
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔖</Text>
        <Text style={styles.emptyTitle}>저장한 항목이 없어요</Text>
        <Text style={styles.emptyDesc}>정류장이나 버스 노선을 저장해보세요!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ⚠️ 경고 배너 */}
      {showWarn && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText} numberOfLines={1}>
            💡 남은 티켓이 {tickets ?? 10}개 남았어요!
          </Text>
          
          {/* 👈 4. 우측에 [광고 보기], [닫기] 버튼 나열 */}
          <View style={styles.warnButtonsContainer}>
            {/* 🌟 변경된 핵심 코드: 클릭 전엔 활성화 상태이며, 누르면 로딩 중으로 변합니다. */}
            <TouchableOpacity 
              style={[styles.warnAdBtn, isAdLoading && styles.warnAdBtnDisabled]} 
              disabled={isAdLoading}
              onPress={() => showAd(rewardTickets)}
            >
              <Text style={[styles.warnAdBtnText, isAdLoading && styles.warnAdBtnTextDisabled]}>
                {isAdLoading ? '로딩 중...' : '광고 보기'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={dismissWarn} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.headerTitle}>저장해놓은 항목</Text>
      <FlatList
        data={[...favorites].sort((a, b) => b.savedAt - a.savedAt)}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => handlePress(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              {item.memo ? <Text style={styles.userTitle} numberOfLines={1}>{item.memo}</Text> : null}
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.type === 'stop' ? '정류장' : '버스'}</Text>
              </View>
              <Text style={styles.mainName}>
                {item.type === 'stop' ? (item as IFavoriteStop).nodenm : `${(item as IFavoriteBus).routeno}번`}
              </Text>
              <Text style={styles.subName}>{getSubtitle(item)}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  
  // 경고 배너 스타일
  warnBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD1D1'
  },
  warnText: { color: '#D32F2F', fontSize: 13, fontWeight: '600', flex: 1 },
  
  // 👈 5. 배너 우측 버튼 영역 스타일 추가
  warnButtonsContainer: { flexDirection: 'row', alignItems: 'center' },
  warnAdBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  warnAdBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  warnAdBtnText: {
    color: COLORS.text.white,
    fontSize: 12,
    fontWeight: '700',
  },
  warnAdBtnTextDisabled: {
    color: COLORS.text.muted,
  },
  closeButton: { paddingHorizontal: 8, paddingVertical: 6 },
  closeButtonText: { color: '#888', fontSize: 13, fontWeight: '500' },

  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 10, marginTop: 0 },
  listContent: { paddingBottom: 10 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    backgroundColor: COLORS.text.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    width: '48%',
    aspectRatio: 4 / 3,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  emoji: { fontSize: Platform.OS === 'ios' ? 24 : 22 },
  userTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.main, marginLeft: 6, flex: 1 },
  infoContainer: { marginTop: 'auto' },
  typeBadge: { backgroundColor: COLORS.primaryLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  typeBadgeText: { fontSize: 11, color: COLORS.primaryDark, fontWeight: '600' },
  mainName: { fontSize: 16, fontWeight: '700', color: COLORS.text.main, marginBottom: Platform.OS === 'ios' ? 6 : 4 },
  subName: { fontSize: 12, color: COLORS.text.hint },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.text.hint },
});

export default FavoriteSection;