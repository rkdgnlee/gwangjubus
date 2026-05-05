import React, { useState } from 'react';
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
  onClose: () => void;
  onSave: (emoji: string, memo: string) => void;
}

const DEFAULT_EMOJI = '🔖';

const SaveModal = ({ visible, title, subtitle, onClose, onSave }: SaveModalProps) => {
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [memo, setMemo] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSave = () => {
    onSave(emoji, memo);
    setMemo('');
    setEmoji(DEFAULT_EMOJI);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable style={styles.overlayBg} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>저장하기</Text>

          {/* 이모지 + 정보 한 row */}
          <View style={styles.emojiInfoRow}>
            {/* 이모지 동그라미 - 클릭 시 피커 열림 */}
            <TouchableOpacity 
              style={styles.emojiCircleWrapper} 
              onPress={() => setPickerVisible(true)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
              {/* 편집 가능 표시 dot */}
              <View style={styles.editDot} />
            </TouchableOpacity>

            {/* 오른쪽 정보 */}
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
            placeholder="예: 출근길, 버스 놓쳤을 때..."
            placeholderTextColor={COLORS.text.muted}
            maxLength={20}
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