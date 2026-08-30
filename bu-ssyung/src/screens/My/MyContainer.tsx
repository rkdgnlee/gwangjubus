// android/app/src/screens/My/MyContainer.tsx

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import FavoriteSection from './FavoriteSection'; 
import ScheduleSection from './ScheduleSection';
import { COLORS } from '../../constants/theme';

interface Props {
  onNavigate: (type: 'bus' | 'stop', data: any) => void;
  setShowHistoryManage: (showHistory: boolean) => void;
  bottomInset?: number;
}

const MyContainer = ({ onNavigate, setShowHistoryManage, bottomInset = 0 }: Props) => {
  return (
    <ScrollView
      style={styles.container}
      // 💡 바텀바에 콘텐츠가 가려지지 않도록 하단 패딩 부여
      contentContainerStyle={{ paddingBottom: bottomInset }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <FavoriteSection onNavigate={onNavigate} />
      </View>
      <View style={styles.section}>
        <ScheduleSection
          onNavigate={onNavigate}
          setShowHistoryManage={setShowHistoryManage}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // 💡 flex: 0.5 를 제거하여 내부 자식 높이만큼 자연스럽게 늘어나도록 함 (wrap_content 효과)
  section: {
    width: '100%',
  },
});

export default MyContainer;