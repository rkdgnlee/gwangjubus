import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  FlatList, Pressable, Dimensions, ScrollView
} from 'react-native';

const { width } = Dimensions.get('window');

const EMOJI_CATEGORIES = [
  { id: 'people', title: '사람 및 감정', icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'] },
  { id: 'nature', title: '동물 및 자연', icon: '🐶', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙊', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦢', '🦉', '🦩', '🦚', '🦜', '🐺'] },
  { id: 'food', title: '음식 및 식료품', icon: '🍎', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞'] },
  { id: 'activity', title: '활동', icon: '⚽', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '🥌', '⛳', '🏹', '🎣', '🤿', '🥊', '🥋', '🛹', '🛼', '🏋️', '🚴', '🏊', '🏆', '🥇', '🥈'] },
  { id: 'travel', title: '여행 및 장소', icon: '🚗', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛵', '🚲', '🛴', '🚏', '🛣️', '🛤️', '⚓', '⛵', '🛶', '🚤', '🛳️', '⛴️', '🚢', '✈️', '🚁', '🚀', '🛰️'] },
  { id: 'objects', title: '사물', icon: '💡', emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭'] },
  { id: 'symbols', title: '기호', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'] },
];

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ visible, onClose, onSelect }: EmojiPickerProps) => {
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

  const currentCategory = EMOJI_CATEGORIES[activeCategoryIdx];

  
    return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBg} onPress={onClose} />
        <View style={styles.pickerContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{currentCategory.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>닫기</Text>
            </TouchableOpacity>
          </View>
          {/* 이모지 그리드 영역 */}
          <FlatList
            data={currentCategory.emojis}
            numColumns={6}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContent}
            // 카테고리가 바뀔 때마다 리스트를 맨 위로 올리기 위해 key를 변경
            key={`list-${activeCategoryIdx}`}
            renderItem={({ item }) => {
              // 사소한 버그 방지: 이모지가 없는 빈 아이템 처리 (필요시)
              if (!item) return null;
              
              return (
                <TouchableOpacity
                  style={styles.emojiItem}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={styles.emojiText}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* 하단 카테고리 바 추가 */}
          <View style={styles.categoryBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    activeCategoryIdx === idx && styles.categoryItemActive
                  ]}
                  onPress={() => setActiveCategoryIdx(idx)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerContent: {
    width: width * 0.9,
    height: 420,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingTop: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#8B95A1' },
  closeBtn: { fontSize: 15, color: '#4E5968', fontWeight: '500' },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emojiItem: {
    flex: 1/6,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 12,
  },
  emojiText: { fontSize: 32 },
  categoryBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  categoryItemActive: {
    backgroundColor: '#E5E8EB',
  },
  categoryIcon: { fontSize: 20 },
});

export default EmojiPicker;