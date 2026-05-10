import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { IFavorite, IFavoriteStop, IFavoriteBus } from '../../types/favorite';
import { useFavorites } from '../../hooks/favorites/useFavorites';
import { COLORS } from '../../constants/theme';

interface Props {
  onNavigate: (type: 'bus' | 'stop', data: any) => void;
}

const FavoriteSection = ({ onNavigate }: Props) => {
  const { favorites, load } = useFavorites();

  React.useEffect(() => { load(); }, []);

  const handlePress = (item: IFavorite) => {
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
      <Text style={styles.headerTitle}>저장</Text>
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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 15, marginTop: 24 },
  listContent: { paddingBottom: 10 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    backgroundColor: COLORS.text.white,
    borderRadius: 16,
    paddingHorizontal: 12, // 좌우 여백을 균일하게
    paddingTop: Platform.OS === 'ios' ? 12 : 8,         // 상단 패딩 축소 (기존 10)
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,      // 하단 패딩 조정
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