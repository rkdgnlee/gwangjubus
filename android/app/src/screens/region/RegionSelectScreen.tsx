import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated, SafeAreaView, Alert } from 'react-native';
import IsometricMap from '../../components/region/IsometricMap';
import { CITIES }  from '../../constants/cities';
import TypingHeader from '../../components/region/TypingHeader';

interface RegionSelectProps {
  onComplete: () => void;
}

const RegionSelectScreen = ({ onComplete }: RegionSelectProps ) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const moveX = useRef(new Animated.Value(0)).current;
  const moveY = useRef(new Animated.Value(0)).current;

  const handleConfirm = () => {
    const selectedCity = CITIES[selectedIdx];
    // 실제 사용 시 Alert.alert를 사용합니다.
    Alert.alert("설정 완료", `${selectedCity.name} 지역으로 설정되었습니다!`);
    onComplete(); // 선택 완료 후 호출
  };

  useEffect(() => {
    if (mapSize.width > 0 && mapSize.height > 0) {
      Animated.spring(moveX, {
        toValue: CITIES[selectedIdx].left * mapSize.width,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }).start();
      
      Animated.spring(moveY, {
        toValue: CITIES[selectedIdx].top * mapSize.height,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }).start();
    }
  }, [selectedIdx, mapSize]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 타이핑 헤더 */}
      <TypingHeader />

      {/* 1. 지도 영역: 위로 올리기 위해 flex 비율 조정 */}
      <View style={styles.mapWrapper}>
        <IsometricMap 
          moveX={moveX} 
          moveY={moveY} 
          mapSize={mapSize}
          onLayout={(e) => setMapSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height
          })}
        />
      </View>

      {/* 2. 하단 선택 영역: 전체 높이의 하단부를 차지하며 칩을 중앙(75% 지점)에 배치 */}
      <View style={styles.bottomSection}>
        <View style={styles.selectionArea}>
          <Text style={styles.guideText}>도시를 옆으로 밀어서 선택하세요</Text>
          <View style={styles.scrollContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.scrollContent}
            >
              {CITIES.map((city, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.cityChip, selectedIdx === index && styles.cityChipActive]}
                  onPress={() => setSelectedIdx(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cityText, selectedIdx === index && styles.cityTextActive]}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* 3. 최하단 확인 버튼 */}
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirm}
          activeOpacity={0.9}
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  // 지도를 위로 붙이기 위해 flex를 1.5 정도로 크게 잡음
  mapWrapper: {
    flex: 1.5,
    justifyContent: 'flex-start', // 위쪽 정렬
    marginTop: -20, // 헤더와 더 밀착시키고 싶을 때 조정
  },
  bottomSection: {
    flex: 1, // 하단 영역 확보
    justifyContent: 'flex-end',
  },
  // 칩들이 위치할 영역 (전체 화면의 75% 지점 즈음 오도록 배치)
  selectionArea: {
    flex: 1,
    justifyContent: 'center', // 세로 중앙 정렬 (이게 화면 전체로 보면 70~80% 지점이 됩니다)
    alignItems: 'center',
  },
  guideText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 15,
    fontWeight: '500'
  },
  scrollContainer: {
    height: 120, // 칩 크기에 맞춰 높이 증가
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // 1.5배 커진 칩 스타일
  cityChip: {
    paddingVertical: 18,    // 10 -> 18
    paddingHorizontal: 35,  // 20 -> 35
    marginHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 40,       // 더 둥글게
    borderWidth: 1,
    borderColor: '#eee'
  },
  cityChipActive: { 
    backgroundColor: '#000',
    borderColor: '#000',
    elevation: 8,           // 안드로이드 그림자
    shadowColor: '#000',    // iOS 그림자
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cityText: { 
    fontSize: 24,           // 18 -> 24 (1.5배 가량 확대)
    color: '#888', 
    fontWeight: '700' 
  },
  cityTextActive: { 
    color: '#fff',
    fontWeight: '800'
  },
  confirmButton: {
    backgroundColor: '#000',
    height: 75,             // 버튼도 더 묵직하게
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  }
});

export default RegionSelectScreen;