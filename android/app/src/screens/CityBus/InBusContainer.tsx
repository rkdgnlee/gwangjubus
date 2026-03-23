import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import BusRouteDetail from './BusRouteDetail';
import BusStopDetail from './BusStopDetail';
import SearchBar from './SearchBar';
import BusResultList from './BusResultList';

// 더미 데이터 (버스)
const MOCK_BUS_DATA = [
  { id: '1', name: '순환01', type: '급행', direction: '세하동' },
  { id: '2', name: '수완03', type: '급행', direction: '송원대' },
  { id: '3', name: '봉선27', type: '지선', direction: '용산지구' },
];

// 더미 데이터 (정류장 - 예시)
const MOCK_STOP_DATA = [
  { id: 's1', name: '광주역', type: '일반', direction: '북구청' }, 
  // 정류장도 BusResultList 구조를 임시로 사용하여 표시 (type만 다르게)
];

interface Props {
  cityName: string;
  initialData?: { type: 'bus' | 'stop', data: any } | null; // My탭에서 넘어온 데이터
}

const InBusContainer = ({ cityName, initialData }: Props) => {
  const [searchMode, setSearchMode] = useState<'bus' | 'stop'>('bus');
  const [searchText, setSearchText] = useState('');
  
  // 화면 스택 관리 (버스 <-> 정류장 무한 이동 지원)
  // stack items: { screen: 'bus' | 'stop', data: any }
  const [navStack, setNavStack] = useState<any[]>([]);

  // My탭에서 넘어온 데이터가 있으면 스택 초기화 후 이동
  useEffect(() => {
    if (initialData) {
      setNavStack([{ screen: initialData.type, data: initialData.data }]);
    }
  }, [initialData]);

  const pushScreen = (screen: 'bus' | 'stop', data: any) => {
    setNavStack(prev => [...prev, { screen, data }]);
  };

  const popScreen = () => {
    setNavStack(prev => prev.slice(0, -1));
  };

  // 1. 상세 화면이 활성화된 경우
  const currentScreen = navStack[navStack.length - 1];
  if (currentScreen) {
    if (currentScreen.screen === 'bus') {
      return (
        <BusRouteDetail 
          busInfo={currentScreen.data} 
          cityName={cityName} 
          onBack={popScreen}
          onStopPress={(stopInfo) => pushScreen('stop', stopInfo)}
        />
      );
    } else if (currentScreen.screen === 'stop') {
      return (
        <BusStopDetail
          stopInfo={currentScreen.data}
          cityName={cityName}
          onBack={popScreen}
          onBusPress={(busInfo) => pushScreen('bus', busInfo)}
        />
      );
    }
  }

  // 2. 검색 화면 (버스/정류장 통합)
  const currentData = searchMode === 'bus' ? MOCK_BUS_DATA : MOCK_STOP_DATA;
  const filteredData = searchText.length > 0 
    ? currentData // 실제로는 여기서 filter 로직 수행
    : [];

  const handlePressItem = (item: any) => {
    if (searchMode === 'bus') {
      pushScreen('bus', item);
    } else {
      pushScreen('stop', item);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 모드 전환 토글 */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, searchMode === 'bus' && styles.toggleBtnActive]}
          onPress={() => setSearchMode('bus')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, searchMode === 'bus' && styles.toggleTextActive]}>버스 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, searchMode === 'stop' && styles.toggleBtnActive]}
          onPress={() => setSearchMode('stop')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, searchMode === 'stop' && styles.toggleTextActive]}>정류장 검색</Text>
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      <SearchBar 
        value={searchText}
        onChangeText={setSearchText}
        onSearch={() => console.log('Search:', searchText)}
      />

      {/* 결과 리스트 */}
      <BusResultList 
        data={filteredData}
        cityName={cityName}
        onPressItem={handlePressItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FBF6' },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 25, // 상태바와의 간격을 위해 상단 여백 추가
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  toggleBtn: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EEF6F0',
  },
  toggleBtnActive: {
    backgroundColor: '#ADEBB3', // 활성화 시 메인 민트색
  },
  toggleText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#191F28', // 민트 배경 위에서는 진한 회색 텍스트
    fontWeight: 'bold',
  },
});

export default InBusContainer;
