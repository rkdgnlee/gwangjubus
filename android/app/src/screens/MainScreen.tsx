import React, { useEffect, useState, useRef } from "react";
import { favoriteStorage } from "../utils/favoriteStorage";
import { IFavoriteBus } from "../types/favorite";
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Easing } from "react-native";
import MyContainer from "./My/MyContainer";
import CityBusContainer from "./CityBus/CityBusContainer";
import SettingsContainer from "./Settings/SettingsContainer";
import notifee, { EventType } from '@notifee/react-native';

interface MainProps {
  cityName: string;
  onReset: () => void;
}

// 탭 타입 정의
type TabType = 'My' | 'CityBus' | /* 'ExpressBus' | */ 'Settings';

// 탭 버튼 컴포넌트 (애니메이션 적용)
const TabButton = ({ 
  tab, 
  isActive, 
  onPress 
}: { 
  tab: TabType; 
  isActive: boolean; 
  onPress: () => void 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // 크기 애니메이션 값

  useEffect(() => {
    if (isActive) {
      // 활성화될 때: 커졌다가 작아지는 젤리 효과
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 50,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive]);

  // 탭별 아이콘/라벨 설정
  const config = {
    My: { icon: "🏠", label: "홈" },
    CityBus: { icon: "🚌", label: "시내버스" },
    // ExpressBus: { icon: "🎫", label: "고속버스" },
    Settings: { icon: "⚙️", label: "설정" },
  };

  const { icon, label } = config[tab];
  const activeColor = isActive ? "#191F28" : "#B0B8C1"; // Toss Black vs Gray

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={[styles.tabIcon, { color: activeColor }]}>{icon}</Text>
      </Animated.View>
      <Text style={[styles.tabText, { color: activeColor, fontWeight: isActive ? '700' : '500' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const MainScreen = ({ cityName, onReset }: MainProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('My');
  const [favorites, setFavorites] = useState<IFavoriteBus[]>([]);
  const [cityBusInitData, setCityBusInitData] = useState<{ type: 'bus' | 'stop', data: any } | null>(null);
  const [cityBusKey, setCityBusKey] = useState(0); // 시내버스 탭 초기화를 위한 카운터
  useEffect(() => {
    // 포그라운드
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        const data = detail.notification.data;
        handleNavigationRequest('stop', {
          nodeid: data.stopNodeid,
          nodenm: data.stopNodenm,
          nodeno: data.stopNodeno,
        });
      }
    });

    // 백그라운드/종료 후 진입
    notifee.getInitialNotification().then(notification => {
      if (notification?.notification?.data) {
        const data = notification.notification.data;
        handleNavigationRequest('stop', {
          nodeid: data.stopNodeid,
          nodenm: data.stopNodenm,
          nodeno: data.stopNodeno,
        });
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const data = await favoriteStorage.getFavorites();
    setFavorites(data);
  };

  // My탭 등에서 버스/정류장 상세 화면으로 이동 요청 처리
  const handleNavigationRequest = (type: 'bus' | 'stop', data: any) => {
    setCityBusInitData({ type, data }); // CityBusContainer에 전달할 데이터 설정
    setActiveTab('CityBus'); // 탭 전환
  };

  // 탭에 따라 보여줄 화면 렌더링
  const renderContent = () => {
    switch (activeTab) {
      case 'My':
        return (
          <MyContainer onNavigate={handleNavigationRequest} />
        );
      case 'CityBus':
        return (
          <CityBusContainer 
            key={`city-bus-${cityBusKey}`} // 키가 바뀌면 화면이 초기화됨
            cityName={cityName} 
          />
        );
      /*
      case 'ExpressBus':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.placeholderText}>고속/시외 버스 조회</Text>
            <Text style={{ marginTop: 8, color: '#999' }}>준비중인 기능입니다.</Text>
          </View>
        );
      */
      case 'Settings':
        return (
          <SettingsContainer cityName={cityName} onChangeRegion={onReset} />
        );
    }
  };

  return (
    <>
      {/* 1. 상단 상태바 배경 (민트색) - flex: 0으로 영역만 차지 */}
      <SafeAreaView style={{ flex: 0, backgroundColor: '#F5FBF6' }} />
      
      {/* 2. 메인 화면 (하단 Safe Area는 바텀바와 같은 흰색으로 처리) */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.container}>
          {/* 메인 콘텐츠 영역 */}
          <View style={styles.contentArea}>
            {renderContent()}
          </View>

          {/* 커스텀 바텀 네비게이션 바 */}
          <View style={styles.bottomNav}>
            {(['My', 'CityBus', /* 'ExpressBus', */ 'Settings'] as TabType[]).map((tab) => (
              <TabButton
                key={tab}
                tab={tab}
                isActive={activeTab === tab}
                onPress={() => {
                  if (activeTab === tab && tab === 'CityBus') {
                    // 이미 시내버스 탭인데 또 누른 경우 -> 초기화 실행
                    setCityBusKey(prev => prev + 1);
                    setCityBusInitData(null);
                  } else {
                    setActiveTab(tab);
                    if (tab !== 'CityBus') setCityBusInitData(null);
                  }
                }}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FBF6' }, // 민트 테마 배경
  contentArea: { flex: 1 },
  tabContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 18, color: '#ccc', fontWeight: '600' },

  // 바텀 네비게이션 스타일
  bottomNav: {
    flexDirection: 'row',
    height: 60, // 높이를 컴팩트하게 조정
    backgroundColor: '#fff',
    alignItems: 'center', // 세로 중앙 정렬
    justifyContent: 'space-around',
    
    // 상단에만 은은한 경계선/그림자 주기
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 }, // iOS: 위쪽으로 살짝 그림자
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderTopWidth: 1, // Android/iOS 공통: 상단 경계선 추가
    borderTopColor: '#f0f0f0',
    elevation: 0, // Android: 하단 그림자 제거
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabIcon: { fontSize: 24, marginBottom: 4 }, // 아이콘 크기
  tabText: { fontSize: 11 },
});

export default MainScreen;