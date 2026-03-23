// android/app/src/screens/My/MyContainer.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
// '../' 대신 './' 를 사용해야 합니다.
import FavoriteSection from './FavoriteSection'; 
import ScheduleSection from './ScheduleSection';

const MyContainer = () => {
  return (
    <View style={styles.container}>
      {/* 상단 50% */}
      <View style={styles.topSection}>
        <FavoriteSection />
      </View>
      {/* 하단 50% */}
      <View style={styles.bottomSection}>
        <ScheduleSection />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F6',
  },
  topSection: { flex: 0.55 },
  bottomSection: { flex: 0.45 },
});

export default MyContainer;
