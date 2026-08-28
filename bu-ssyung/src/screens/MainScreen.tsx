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
import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import MyContainer from './My/MyContainer';
import CityBusContainer from './CityBus/CityBusContainer';
import SettingsContainer from './Settings/SettingsContainer';
import { favoriteStorage } from '../utils/favoriteStorage';
import { IFavoriteBus } from '../types/favorite';
import { COLORS } from '../constants/theme';
import { useToast } from '@toss/tds-react-native';
import { getSpecifyArriveInfoInBusStop } from '../services/api-service-proxy';
import { TossBanner } from '../components/ads/TossBanner';
import { HomeAddTooltip } from '../components/HomeAddTooltip';
import { HomeIcon, BusIcon, SettingsIcon } from '../components/TabIcons'; // 경로 맞게 조정

interface MainProps {
  cityName: string;
  cityCode: number;
  onReset: () => void;
}

type TabType = 'My' | 'CityBus' | 'Settings';

const TAB_BAR_HEIGHT = 60;
const TAB_BAR_SIDE_MARGIN = 16;
const TAB_BAR_BOTTOM_MARGIN = 12;

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
    My: { Icon: HomeIcon, label: '홈' },
    CityBus: { Icon: BusIcon, label: '시내버스' },
    Settings: { Icon: SettingsIcon, label: '설정' },
  };

  const { Icon, label } = config[tab];
  const activeColor = isActive ? COLORS.secondary : COLORS.text.muted;

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Icon color={activeColor} size={22} />
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
  const insets = useSafeAreaInsets();
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

  // ticket
  const [showHistoryManage, setShowHistoryManage] = useState(false);

  const { open } = useToast();
  const onToggleAlarm = (item: any, stopInfo: any, cityCode: number) => {
    if (activeAlarmId === item.routeid) {
      setActiveAlarmId(null);
      setLastPrevCount(null);
      monitoringRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      Vibration.vibrate(200);
      open(`${item.routeno}번 알림이 해제됐어요`);
    } else {
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

      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      autoStopRef.current = setTimeout(() => {
        setActiveAlarmId(null);
        setLastPrevCount(null);
        monitoringRef.current = null;
        lastArrtimeRef.current = null;
        if (intervalRef.current) clearInterval(intervalRef.current);
        Vibration.vibrate([0, 300, 100, 300]);
        open('알림이 자동으로 종료됐어요');
      }, 5 * 60 * 1000);

      Vibration.vibrate(300);
      open(`${item.routeno}번 버스 알림 시작! 정거장이 줄어들면 진동으로 알려드려요`);
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
          open(`${mon.routeno}번 버스 도착 정보가 없어요`);
          return;
        }

        const firstResult = result[0]!;
        const currentStops = firstResult.arrprevstationcnt;
        const currentArrtime = firstResult.arrtime ?? 9999;

        if (
          lastPrevCount !== null &&
          currentArrtime > (lastArrtimeRef.current ?? 9999) &&
          (lastArrtimeRef.current ?? 9999) <= 100
        ) {
          setActiveAlarmId(null);
          monitoringRef.current = null;
          Vibration.vibrate([0, 500, 200, 500]);
          open(`${mon.routeno}번 버스가 지나쳤어요`);
          return;
        }

        if (currentStops <= 2) {
          Vibration.vibrate([0, 500, 100, 500, 100, 500]);
          open(`🚌 ${mon.routeno}번 버스가 ${currentStops}정거장 앞에 있어요!`);
        } else if (lastPrevCount !== null && currentStops < lastPrevCount) {
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
  const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom + 12; // 여유 12px

  const renderContent = () => {
    switch (activeTab) {
      case 'My':
        return (
          <View style={{ flex: 1 }}>
            <MyContainer
              onNavigate={handleNavigationRequest}
              setShowHistoryManage={() => {
                setShowHistoryManage(true);
                setActiveTab('Settings');
              }}
              bottomInset={TAB_BAR_CLEARANCE}
            />
            <HomeAddTooltip />
          </View>
        );
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
          <SettingsContainer
            cityName={cityName}
            onChangeRegion={onReset}
            initialShowHistoryManage={showHistoryManage}
            onDidMount={() => setShowHistoryManage(false)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <TossBanner />
      </View>
      <View style={styles.contentArea}>
        {renderContent()}
      </View>
      <View
        style={[
          styles.bottomNav,
          {
            bottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN,
            left: TAB_BAR_SIDE_MARGIN,
            right: TAB_BAR_SIDE_MARGIN,
            height: TAB_BAR_HEIGHT,
          },
        ]}
      >
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
  bannerContainer: {
    width: '100%',
    paddingTop: 5,
    backgroundColor: COLORS.background,
  },
  bottomNav: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 9999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 2 },
});

export default MainScreen;