// android/app/src/screens/My/MyContainer.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import FavoriteSection from './FavoriteSection'; 
import ScheduleSection from './ScheduleSection';
import { COLORS } from '../../constants/theme';

interface Props {
  onNavigate: (type: 'bus' | 'stop', data: any) => void;
  setShowHistoryManage: (showHistory: boolean) => void;
  bottomInset?: number;
}

interface Props {
  onNavigate: (type: 'bus' | 'stop', data: any) => void;
  setShowHistoryManage: (showHistory: boolean) => void;
  bottomInset?: number;
}

const MyContainer = ({ onNavigate, setShowHistoryManage, bottomInset = 0 }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <FavoriteSection onNavigate={onNavigate} bottomInset={bottomInset} />
      </View>
      <View style={styles.bottomSection}>
        <ScheduleSection
          onNavigate={onNavigate}
          setShowHistoryManage={setShowHistoryManage}
          bottomInset={bottomInset}
        />
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
