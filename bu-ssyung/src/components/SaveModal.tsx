import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import EmojiPicker from './EmojiPicker';
import { COLORS } from '../constants/theme';

interface SaveModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  initialEmoji?: string; // ← 추가: 초기 이모지
  initialMemo?: string;  // ← 추가: 초기 메모
  modalTitle?: string;   // ← 추가: '저장하기' 또는 '북마크 편집'
  onClose: () => void;
  onSave: (emoji: string, memo: string) => void;
}

const DEFAULT_EMOJI = '🔖';

const SaveModal = ({
  visible,
  title,
  subtitle,
  initialEmoji = DEFAULT_EMOJI,
  initialMemo = '',
  modalTitle = '저장하기',
  onClose,
  onSave,
}: SaveModalProps) => {
  const [emoji, setEmoji] = useState(initialEmoji);
  const [memo, setMemo] = useState(initialMemo);
  const [pickerVisible, setPickerVisible] = useState(false);

  // 모달이 열리거나 초깃값이 변경될 때 상태 동기화
  useEffect(() => {
    if (visible) {
      setEmoji(initialEmoji || DEFAULT_EMOJI);
      setMemo(initialMemo || '');
    }
  }, [visible, initialEmoji, initialMemo]);

  const handleSave = () => {
    onSave(emoji, memo);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable style={styles.overlayBg} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{modalTitle}</Text>

          {/* 이모지 + 정보 한 row */}
          <View style={styles.emojiInfoRow}>
            <TouchableOpacity 
              style={styles.emojiCircleWrapper} 
              onPress={() => setPickerVisible(true)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
              <View style={styles.editDot} />
            </TouchableOpacity>

            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoTitle}>{title}</Text>
              <Text style={styles.infoSub}>{subtitle}</Text>
            </View>
          </View>

          {/* 메모 */}
          <Text style={styles.inputLabel}>메모 (선택)</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="예: 출근길, 집 앞 정류장..."
            placeholderTextColor={COLORS.text.muted}
            maxLength={12}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 커스텀 이모지 피커 */}
      <EmojiPicker 
        visible={pickerVisible} 
        onClose={() => setPickerVisible(false)} 
        onSelect={(selected) => setEmoji(selected)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.text.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 20 },

  emojiInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  emojiCircleWrapper: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16, position: 'relative',
  },
  emojiText: { fontSize: 32 },
  editDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.text.white,
  },
  infoTextWrapper: { flex: 1, justifyContent: 'center' },
  infoTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.main },
  infoSub: { fontSize: 13, color: COLORS.text.hint, marginTop: 4 },

  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.sub, marginBottom: 8 },
  memoInput: {
    backgroundColor: COLORS.background, borderRadius: 12,
    padding: 14, fontSize: 16, color: COLORS.text.main, marginBottom: 24,
  },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveButtonText: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.white },
});

export default SaveModal;