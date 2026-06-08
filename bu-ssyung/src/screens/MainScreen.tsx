import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Vibration,
} from 'react-native';
import MyContainer from './My/MyContainer'; // 기존 경로에 맞게 수정
import CityBusContainer from './CityBus/CityBusContainer'; // 기존 경로에 맞게 수정
import SettingsContainer from './Settings/SettingsContainer'; // 기존 경로에 맞게 수정
import { favoriteStorage } from '../utils/favoriteStorage'; // 기존 경로에 맞게 수정
import { IFavoriteBus } from '../types/favorite'; // 기존 경로에 맞게 수정
import { COLORS } from '../constants/theme';
import { getSpecifyArriveInfoInBusStop } from '../services/Arrive/getSpecifyArriveInfoInBusStop';

interface MainProps {
  cityName: string;
  cityCode: number;
  onReset: () => void;
}

type TabType = 'My' | 'CityBus' | 'Settings';

const TabButton = ({
  tab,
  isActive,
  onPress,
}: {
  tab: TabType;
  isActive: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
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
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive]);

  const config = {
    My: { icon: '🏠', label: '홈' },
    CityBus: { icon: '🚌', label: '시내버스' },
    Settings: { icon: '⚙️', label: '설정' },
  };

  const { icon, label } = config[tab];
  const activeColor = isActive ? COLORS.secondary : COLORS.text.muted;

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={[styles.tabIcon, { color: activeColor }]}>{icon}</Text>
      </Animated.View>
      <Text
        style={[
          styles.tabText,
          { color: activeColor, fontWeight: isActive ? '700' : '500' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const MainScreen = ({ cityName, cityCode, onReset }: MainProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('My');
  const [, setFavorites] = useState<IFavoriteBus[]>([]);
  const [cityBusInitData, setCityBusInitData] = useState<{
    type: 'bus' | 'stop';
    data: any;
  } | null>(null);
  const [cityBusKey, setCityBusKey] = useState(0);
  const [activeAlarmId, setActiveAlarmId] = useState<string | null>(null);
  const [lastPrevCount, setLastPrevCount] = useState<number | null>(null);
  const monitoringRef = useRef<{
    routeid: string;
    cityCode: number;
    nodeid: string;
    nodenm: string;
    routeno: string;
  } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArrtimeRef = useRef<number | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onToggleAlarm = (item: any, stopInfo: any, cityCode: number) => {
    if (activeAlarmId === item.routeid) {
      // 알림 종료
      setActiveAlarmId(null);
      setLastPrevCount(null);
      monitoringRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      // notifee 대신 진동으로 종료 알림
      Vibration.vibrate(200);
    } else {
      // 알림 시작
      setActiveAlarmId(item.routeid);
      setLastPrevCount(item.arrprevstationcnt ?? null);
      lastArrtimeRef.current = item.arrtime ?? null;
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
        Vibration.vibrate([0, 300, 100, 300]); // 자동 종료 진동
      }, 5 * 60 * 1000);

      Vibration.vibrate(300); // 시작 진동
    }
  };

  useEffect(() => {
    if (!activeAlarmId || !monitoringRef.current) return;

    intervalRef.current = setInterval(async () => {
      const mon = monitoringRef.current;
      if (!mon) return;
      try {
        const result = await getSpecifyArriveInfoInBusStop(
          mon.cityCode,
          mon.nodeid,
          mon.routeid,
        );

        if (!result || result.length === 0) {
          setActiveAlarmId(null);
          monitoringRef.current = null;
          Vibration.vibrate([0, 200, 100, 200]);
          return;
        }

        const currentStops = result[0].arrprevstationcnt;
        const currentArrtime = result[0].arrtime ?? 9999;

        // 버스 지나친 경우
        if (
          lastPrevCount !== null &&
          currentArrtime > (lastArrtimeRef.current ?? 9999) &&
          (lastArrtimeRef.current ?? 9999) <= 100
        ) {
          setActiveAlarmId(null);
          monitoringRef.current = null;
          Vibration.vibrate([0, 500, 200, 500]);
          return;
        }

        // 정거장 줄어들었을 때 진동
        if (lastPrevCount !== null && currentStops < lastPrevCount) {
          Vibration.vibrate([0, 500, 100, 500]);
        }

        setLastPrevCount(currentStops);
        lastArrtimeRef.current = currentArrtime;
      } catch (e) {
        console.error('Monitoring error:', e);
      }
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeAlarmId, lastPrevCount]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const data = await favoriteStorage.getFavorites();
    setFavorites(data);
  };

  const handleNavigationRequest = (type: 'bus' | 'stop', data: any) => {
    setCityBusInitData({ type, data });
    setActiveTab('CityBus');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'My':
        return <MyContainer onNavigate={handleNavigationRequest} />;
      case 'CityBus':
        return (
          <CityBusContainer
            key={`city-bus-${cityBusKey}`}
            cityName={cityName}
            cityCode={cityCode}
            initialData={cityBusInitData}
            activeAlarmId={activeAlarmId}
            onToggleAlarm={onToggleAlarm}
          />
        );
      case 'Settings':
        return (
          <SettingsContainer cityName={cityName} onChangeRegion={onReset} />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>{renderContent()}</View>
      <View style={styles.bottomNav}>
        {(['My', 'CityBus', 'Settings'] as TabType[]).map(tab => (
          <TabButton
            key={tab}
            tab={tab}
            isActive={activeTab === tab}
            onPress={() => {
              if (activeTab === tab && tab === 'CityBus') {
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentArea: { flex: 1 },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.text.white,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 0,
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabIcon: { fontSize: 24, marginBottom: 4 },
  tabText: { fontSize: 11 },
});

export default MainScreen;