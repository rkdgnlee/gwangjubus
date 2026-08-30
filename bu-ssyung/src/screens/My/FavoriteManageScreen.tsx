// src/screens/My/FavoriteManageScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert
} from 'react-native';
import { useFavorites } from '../../hooks/favorites/useFavorites';
import { IFavorite, IFavoriteStop, IFavoriteBus } from '../../types/favorite';
import { COLORS } from '../../constants/theme';
import SaveModal from '../../components/SaveModal'; // 경로에 맞게 확인해주세요!

interface Props {
  onBack: () => void;
}

const FavoriteManageScreen = ({ onBack }: Props) => {
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
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>북마크 관리</Text>
        {favorites.length > 0 ? (
          <TouchableOpacity onPress={handleRemoveAll} style={styles.deleteAllButton}>
            <Text style={styles.deleteAllText}>전체 삭제</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 64 }} />
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
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemove(item)}>
                    <Text style={styles.deleteButtonText}>✕</Text>
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
    padding: 15,
    backgroundColor: COLORS.text.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 5, width: 40 },
  backText: { fontSize: 24, color: COLORS.text.main },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.main },
  deleteAllButton: { paddingVertical: 6, paddingHorizontal: 10 },
  deleteAllText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: COLORS.text.hint },

  listContent: { padding: 20 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  itemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 26, marginRight: 12 },
  itemInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  itemMainName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.main, marginRight: 8, flexShrink: 1 },
  typeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 10, color: COLORS.primaryDark, fontWeight: '600' },
  itemSubName: { fontSize: 12, color: COLORS.text.hint },

  actionButtons: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    marginRight: 6,
  },
  editButtonText: { fontSize: 12, color: COLORS.text.sub, fontWeight: '600' },
  deleteButton: { padding: 8 },
  deleteButtonText: { fontSize: 16, color: COLORS.text.muted, fontWeight: '600' },
});

export default FavoriteManageScreen;