import React from 'react';
import { View, StyleSheet, Image, Animated, Text } from 'react-native';

interface IsometricMapProps {
  moveX: Animated.Value;
  moveY: Animated.Value;
  onLayout: (event: any) => void;
  mapSize: { width: number; height: number };
}

const IsometricMap = ({ moveX, moveY, onLayout, mapSize }: IsometricMapProps) => {
  return (
    <View style={styles.mapSection} onLayout={onLayout}>
      <Image 
        source={require('../../assets/images/korea.png')} 
        style={styles.mapImage}
        resizeMode="contain" // 이미지를 중앙에 꽉 차게 배치
      />
      
      {mapSize.width > 0 && (
        <Animated.View 
          style={[
            styles.markerWrapper,
            { transform: [{ translateX: moveX }, { translateY: moveY }] }
          ]}
        >
          <Text style={styles.emojiMarker}>📍</Text>
          <View style={styles.shadow} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapSection: {
    flex: 1, // 상단 남는 공간을 모두 차지 (이미지를 중앙으로 보냄)
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapImage: {
    width: '90%',
    height: '90%',
  },
  markerWrapper: {
    position: 'absolute',
    top: 0, left: 0,
    alignItems: 'center',
    marginLeft: -15, // 마커 중심 맞추기
    marginTop: -30,
  },
  emojiMarker: { fontSize: 30 },
  shadow: {
    width: 12, height: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 5,
    marginTop: -4,
  },
});

export default IsometricMap;