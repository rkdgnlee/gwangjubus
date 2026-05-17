import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Pressable
} from 'react-native';
import { COLORS } from '../constants/theme';

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
              <Text style={[styles.menuItemText, { color: COLORS.accent }]}>저장 취소</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.menuItemText, { color: COLORS.text.muted }]}>닫기</Text>
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
    backgroundColor: COLORS.text.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuItemText: { fontSize: 17, color: COLORS.text.main, fontWeight: '500' },
  closeButton: { paddingVertical: 16, alignItems: 'center' },
});

export default MenuBottomSheet;