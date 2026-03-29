import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Pressable
} from 'react-native';

interface MenuBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSavePress: () => void;
  onUnsavePress?: () => void;
  isSaved: boolean;
  saveLabel?: string;
}

const MenuBottomSheet = ({
  visible,
  onClose,
  onSavePress,
  onUnsavePress,
  isSaved,
  saveLabel
}: MenuBottomSheetProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade" // 배경 페이드 인/아웃을 위해 fade 사용
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBg} onPress={onClose} />
        <View style={styles.menuSheet}>
          <TouchableOpacity style={styles.menuItem} onPress={onSavePress}>
            <Text style={styles.menuItemText}>
              {isSaved ? `🔖 ${saveLabel || '저장'} 수정` : `🔖 ${saveLabel || '저장'}하기`}
            </Text>
          </TouchableOpacity>
          
          {isSaved && onUnsavePress && (
            <TouchableOpacity style={styles.menuItem} onPress={onUnsavePress}>
              <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>저장 취소</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.menuItem} onPress={onClose}>
            <Text style={[styles.menuItemText, { color: '#aaa' }]}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  menuSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuItemText: { fontSize: 17, color: '#191F28', fontWeight: '500' },
});

export default MenuBottomSheet;