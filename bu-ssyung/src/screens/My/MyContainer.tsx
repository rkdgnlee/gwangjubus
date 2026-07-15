// android/app/src/screens/My/MyContainer.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import FavoriteSection from './FavoriteSection'; 
import ScheduleSection from './ScheduleSection';
import { COLORS } from '../../constants/theme';

interface Props {
  onNavigate: (type: 'bus' | 'stop', data: any) => void;
  setShowHistoryManage: (showHistory: boolean) => void;
}

const MyContainer = ({ onNavigate, setShowHistoryManage }: Props) => {
  return (
    <View style={styles.container}>
      {/* 상단 50% */}
      <View style={styles.topSection}>
        <FavoriteSection onNavigate={onNavigate} />
      </View>
      {/* 하단 50% */}
      <View style={styles.bottomSection}>
        <ScheduleSection onNavigate={onNavigate} setShowHistoryManage={setShowHistoryManage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: { flex: 0.50 },
  bottomSection: { flex: 0.50 },
});

export default MyContainer;
