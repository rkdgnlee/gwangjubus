import React, { useEffect, useState, useRef } from "react";
import { favoriteStorage } from "../utils/favoriteStorage";
import { IFavoriteBus } from "../types/favorite";
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Easing, Platform, Vibration } from "react-native";
import MyContainer from "./My/MyContainer";
import CityBusContainer from "./CityBus/CityBusContainer";
import SettingsContainer from "./Settings/SettingsContainer";
import notifee, { AndroidColor, AndroidImportance, EventType } from '@notifee/react-native';
import { getSpecifyArriveInfoInBusStop } from "../services/Arrive/getSpecifyArriveInfoInBusStop";

interface MainProps {
  cityName: string;
  cityCode: number;
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

const MainScreen = ({ cityName, cityCode, onReset }: MainProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('My');
  const [, setFavorites] = useState<IFavoriteBus[]>([]);
  const [, setCityBusInitData] = useState<{ type: 'bus' | 'stop', data: any } | null>(null);
  const [cityBusKey, setCityBusKey] = useState(0); // 시내버스 탭 초기화를 위한 카운터
  const [activeAlarmId, setActiveAlarmId] = useState<string | null>(null);
  const [lastPrevCount, setLastPrevCount] = useState<number | null>(null);
  const monitoringRef = useRef<{ routeid: string; cityCode: number; nodeid: string; nodenm: string; routeno: string } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastArrtimeRef = useRef<number | null>(null); // ← 추가

  const onToggleAlarm = (item: any, stopInfo: any, cityCode: number) => {
    const autoStopRef = useRef<NodeJS.Timeout | null>(null);

    if (activeAlarmId === item.routeid) {
      setActiveAlarmId(null);
      setLastPrevCount(null);
      monitoringRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      
      notifee.cancelAllNotifications();
      notifee.displayNotification({
        title: '🔕 알림 종료',
        body: `${item.routeno}번 버스 추적을 종료했어요.`,
        ...(Platform.OS === 'android'
          ? { android: { channelId: 'bus-arrival-alert', smallIcon: 'ic_launcher', pressAction: { id: 'default' } } }
          : { ios: { sound: 'default', foregroundPresentationOptions: { alert: true, sound: false, badge: false } } }
        ),
      });
    } else {
      setActiveAlarmId(item.routeid);
      setLastPrevCount(item.arrprevstationcnt ?? null);
      lastArrtimeRef.current = item.arrtime ?? null; // ← 추가
      monitoringRef.current = {
        routeid: item.routeid,
        routeno: item.routeno,
        cityCode,
        nodeid: stopInfo.nodeid,
        nodenm: stopInfo.nodenm,
      };

      // 5분 뒤 자동 종료 
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      autoStopRef.current = setTimeout(() => {
        setActiveAlarmId(null);
        setLastPrevCount(null);
        monitoringRef.current = null;
        lastArrtimeRef.current = null;
        if (intervalRef.current) clearInterval(intervalRef.current);
        notifee.cancelAllNotifications();
        notifee.displayNotification({
          title: '🔕 알림 자동 종료',
          body: `${item.routeno}번 버스 알림이 5분이 지나 자동으로 종료됐어요.`,
          ...(Platform.OS === 'android'
            ? { android: { channelId: 'bus-arrival-alert', smallIcon: 'ic_launcher', pressAction: { id: 'default' } } }
            : { ios: { sound: 'default', foregroundPresentationOptions: { alert: true, sound: false, badge: false } } }
          ),
        });
      }, 5 * 60 * 1000); // 5분


      notifee.displayNotification({
        title: `🚌 ${item.routeno}번 버스 추적 시작`,
        body: '30초마다 위치를 확인할게요. 정거장이 줄어들면 진동으로 알려드려요!',
        ...(Platform.OS === 'android'
          ? { android: { channelId: 'bus-arrival-alert', smallIcon: 'ic_launcher', pressAction: { id: 'default' } } }
          : { ios: { sound: 'default', foregroundPresentationOptions: { alert: true, sound: false, badge: false } } }
        ),
      });
    }
  };
  useEffect(() => {
    if (!activeAlarmId || !monitoringRef.current) return;

    intervalRef.current = setInterval(async () => {
      const mon = monitoringRef.current;
      if (!mon) return;
      try {
        const result = await getSpecifyArriveInfoInBusStop(mon.cityCode, mon.nodeid, mon.routeid);
        
        if (!result || result.length === 0) {
          // 데이터 없으면 종료
          setActiveAlarmId(null);
          monitoringRef.current = null;
          notifee.displayNotification({
            title: '🚌 알림 자동 종료',
            body: `${mon.routeno}번 버스 도착 정보가 없어졌어요.`,
            ...(Platform.OS === 'android'
              ? { android: { channelId: 'bus-arrival-alert', smallIcon: 'ic_launcher', pressAction: { id: 'default' } } }
              : { ios: { sound: 'default', foregroundPresentationOptions: { alert: true, sound: false, badge: false } } }
            ),
          });
          return;
        }

        const currentStops = result[0].arrprevstationcnt;
        const currentArrtime = result[0].arrtime ?? 9999;

        // 이전 시간이 100초 이내였는데 시간이 늘어났으면 → 버스 지나친 것
        if (lastPrevCount !== null && currentArrtime > (lastArrtimeRef.current ?? 9999) && (lastArrtimeRef.current ?? 9999) <= 100) {
          setActiveAlarmId(null);
          monitoringRef.current = null;
          notifee.cancelAllNotifications();
          notifee.displayNotification({
            title: '🚌 버스가 지나쳤어요',
            body: `${mon.routeno}번 버스 알림을 종료할게요.`,
            ...(Platform.OS === 'android'
              ? { android: { channelId: 'bus-arrival-alert', smallIcon: 'ic_launcher', pressAction: { id: 'default' } } }
              : { ios: { sound: 'default', foregroundPresentationOptions: { alert: true, sound: false, badge: false } } }
            ),
          });
          return;
        }

        // 정거장 줄어들었을 때 알림
        if (lastPrevCount !== null && currentStops < lastPrevCount) {
          const title = `🚌 ${mon.routeno}번 버스 접근 중`;
          const body = `${currentStops}정거장 전이에요. 준비하세요!`;
          if (Platform.OS === 'android') {
            await notifee.displayNotification({
              title, body,
              android: { channelId: 'bus-arrival-alert', smallIcon: 'ic_launcher', pressAction: { id: 'default' } },
            });
          }
          if (Platform.OS === 'ios') {
            await notifee.displayNotification({
              title, body,
              ios: { sound: 'default', foregroundPresentationOptions: { alert: true, sound: true, badge: false } },
            });
          }
          Vibration.vibrate([0, 500, 100, 500]);
        }

        setLastPrevCount(currentStops);
        lastArrtimeRef.current = currentArrtime; // ← 마지막 시간 저장

      } catch (e) {
        console.error('Monitoring error:', e);
      }
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeAlarmId, lastPrevCount]);
  
  useEffect(() => {
    // 포그라운드
    const setup = async () => {
      if (Platform.OS === 'ios') await notifee.requestPermission();
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'bus-arrival-alert',
          name: '버스 도착 알림',
          lights: true,
          lightColor: AndroidColor.GREEN,
          importance: AndroidImportance.HIGH,
          vibration: true,
        });
      }
    };
    setup();
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
            cityCode={cityCode}
            activeAlarmId={activeAlarmId}    // ← 추가
            onToggleAlarm={onToggleAlarm}    // ← 추가
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