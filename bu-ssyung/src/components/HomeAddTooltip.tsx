import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Storage } from '@apps-in-toss/framework';
import { COLORS } from '../constants/theme';

const SEEN_KEY = 'home_add_tooltip_seen';

export const HomeAddTooltip = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = async () => {
      const seen = await Storage.getItem(SEEN_KEY);
      if (!seen) setVisible(true);
    };
    check();
  }, []);

  const handleClose = async () => {
    setVisible(false);
    await Storage.setItem(SEEN_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* 말풍선 위쪽, ... 메뉴를 향하는 작은 삼각형 */}
      {/* <View style={styles.arrow} /> */}
      <View style={styles.bubble}>
        <Text style={styles.text}>··· 를 눌러 홈화면에 추가하고{'\n'}더 빠르게 이용해보세요</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  arrow: {
    width: 0,
    height: 0,
    marginRight: 18,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.text.white,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.text.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 220,
    maxWidth: 260,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  text: {
    fontSize: Platform.OS === 'ios' ? 14 : 13,
    color: COLORS.text.main,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
    padding: 2,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
});