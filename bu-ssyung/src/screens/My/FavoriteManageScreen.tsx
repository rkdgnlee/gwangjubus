// src/screens/My/FavoriteManageScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert
} from 'react-native';
import { useFavorites } from '../../hooks/favorites/useFavorites';
import { IFavorite, IFavoriteStop, IFavoriteBus } from '../../types/favorite';
import { COLORS } from '../../constants/theme';
import SaveModal from '../../components/SaveModal';
import { CloseIcon } from '../../components/Icons';

const FavoriteManageScreen = () => {
  const { favorites, load, remove, updateFavorite, removeAll } = useFavorites();
  
  const [editingItem, setEditingItem] = useState<IFavorite | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const handleEdit = (item: IFavorite) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (newEmoji: string, newMemo: string) => {
    if (!editingItem) return;
    try {
      await updateFavorite(editingItem.id, {
        ...editingItem,
        memo: newMemo.trim(),
        emoji: newEmoji.trim() || '⭐️',
      });
      await load();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error) {
      Alert.alert('오류', '북마크 수정 중 문제가 발생했습니다.');
    }
  };

  const handleRemove = (item: IFavorite) => {
    const title = item.type === 'stop' ? (item as IFavoriteStop).nodenm : `${(item as IFavoriteBus).routeno}번 버스`;
    Alert.alert(
      '북마크 삭제',
      `'${title}' 북마크를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await remove(item.id);
            load();
          },
        },
      ]
    );
  };

  const handleRemoveAll = () => {
    Alert.alert(
      '전체 삭제',
      '모든 북마크를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전체 삭제',
          style: 'destructive',
          onPress: async () => {
            if (removeAll) {
              await removeAll();
            } else {
              for (const fav of favorites) {
                await remove(fav.id);
              }
            }
            load();
          },
        },
      ]
    );
  };

  const getSubtitle = (item: IFavorite) => {
    if (item.type === 'stop') return `정류소 ${(item as IFavoriteStop).nodeno}`;
    const b = item as IFavoriteBus;
    return `${b.startnodenm} → ${b.endnodenm}`;
  };

  return (
    <View style={styles.container}>
      {/* 화면 제목 — 뒤로가기는 앱인토스 상단 내비게이션 바가 담당 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>북마크 관리</Text>
        {favorites.length > 0 && (
          <TouchableOpacity onPress={handleRemoveAll} style={styles.deleteAllButton}>
            <Text style={styles.deleteAllText}>전체 삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔖</Text>
          <Text style={styles.emptyText}>저장한 북마크가 없어요.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const mainName = item.type === 'stop' ? (item as IFavoriteStop).nodenm : `${(item as IFavoriteBus).routeno}번`;
            const routeOrStopInfo = getSubtitle(item);

            // 메모(별칭) 유무에 따른 제목/부제목 분기
            const displayTitle = item.memo ? item.memo : mainName;
            const displaySub = item.memo ? `${mainName} · ${routeOrStopInfo}` : routeOrStopInfo;

            return (
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.emoji}>{item.emoji || '⭐️'}</Text>
                  <View style={styles.itemInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemMainName} numberOfLines={1}>
                        {displayTitle}
                      </Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{item.type === 'stop' ? '정류장' : '버스'}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemSubName} numberOfLines={1}>
                      {displaySub}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                    <Text style={styles.editButtonText}>편집</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemove(item)}
                    accessibilityLabel="북마크 삭제"
                  >
                    <CloseIcon color={COLORS.text.muted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* 편집 모달 (기존 SaveModal 재활용) */}
      {editingItem && (
        <SaveModal
          visible={showEditModal}
          modalTitle="북마크 편집"
          title={
            editingItem.type === 'stop'
              ? (editingItem as IFavoriteStop).nodenm
              : `${(editingItem as IFavoriteBus).routeno}번`
          }
          subtitle={getSubtitle(editingItem)}
          initialEmoji={editingItem.emoji || '⭐️'}
          initialMemo={editingItem.memo || ''}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveEdit}
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
  emoji: { fontSize: 26, marginRight: 12 },
  itemInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  itemMainName: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.main, marginRight: 8, flexShrink: 1 },
  typeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '600' },
  itemSubName: { fontSize: 14, color: COLORS.text.hint },

  actionButtons: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  editButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    marginRight: 2,
  },
  editButtonText: { fontSize: 14, color: COLORS.text.sub, fontWeight: '600' },
  deleteButton: { width: 44, height: 44, marginRight: -8, justifyContent: 'center', alignItems: 'center' },
});

export default FavoriteManageScreen;