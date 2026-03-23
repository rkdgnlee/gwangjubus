import React, { useEffect, useState } from "react";
import { favoriteStorage } from "../utils/favoriteStorage";
import { FavoriteBus } from "../types/favorite";
import { FlatList, Text, View, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import MyContainer from "./My/MyContainer";
import InBusContainer from "./InBus/InBusContainer";

interface MainProps {
  cityName: string;
}

// 탭 타입 정의
type TabType = 'My' | 'CityBus' | 'ExpressBus' | 'Settings';

const MainScreen = ({ cityName }: MainProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('My');
  const [favorites, setFavorites] = useState<FavoriteBus[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const data = await favoriteStorage.getFavorites();
    setFavorites(data);
  };

  // 탭에 따라 보여줄 화면 렌더링
  const renderContent = () => {
    switch (activeTab) {
      case 'My':
        return (
          <MyContainer />
        );
      case 'CityBus':
        return (
          <InBusContainer cityName={cityName} />
        );
      case 'ExpressBus':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.placeholderText}>고속/시외 버스 조회</Text>
            <Text style={{ marginTop: 8, color: '#999' }}>준비중인 기능입니다.</Text>
          </View>
        );
      case 'Settings':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.placeholderText}>설정</Text>
            <Text style={{ marginTop: 10, color: '#666' }}>현재 지역: {cityName}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 메인 콘텐츠 영역 */}
      <View style={styles.contentArea}>
        {renderContent()}
      </View>

      {/* 커스텀 바텀 네비게이션 바 */}
      <View style={styles.bottomNav}>
        {['My', 'CityBus', 'ExpressBus', 'Settings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab as TabType)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'My' ? 'MY' : tab === 'CityBus' ? '시내버스' : tab === 'ExpressBus' ? '고속버스' : '설정'}
            </Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F6' }, // 전체 배경색 변경
  contentArea: { flex: 1 },
  tabContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 18, color: '#ccc', fontWeight: '600' },

  // 바텀 네비게이션 스타일
  bottomNav: {
    flexDirection: 'row',
    height: 65,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingBottom: 5,
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600',
    marginBottom: 4,
  },
  activeTabText: { color: '#000', fontWeight: 'bold' },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
    position: 'absolute',
    bottom: 10,
  }
});

export default MainScreen;