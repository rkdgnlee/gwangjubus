import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { storage } from './android/app/src/utils/storage';
import MainScreen from './android/app/src/screens/MainScreen';
import RegionSelectScreen from './android/app/src/screens/region/RegionSelectScreen';
import BootSplash from 'react-native-bootsplash';
import MobileAds from 'react-native-google-mobile-ads';
import { getCrashlytics } from '@react-native-firebase/crashlytics';

const App = () => {
  
  const [isLoading, setIsLoading] = useState(true);
  const [savedCity, setSavedCity] = useState<string | null>(null);
  const [savedCityCode, setSavedCityCode] = useState<number | null>(null);
  useEffect(() => {
    checkStorage();

    const initAds = async () => {
      // Crashlytics 먼저 활성화
      await getCrashlytics().setCrashlyticsCollectionEnabled(true);

      try {
        await MobileAds().initialize();
        console.log('AdMob initialized');
        getCrashlytics().log('AdMob 초기화 성공');
      } catch (error: any) {
        console.error('AdMob initialization error:', error);
        getCrashlytics().log('AdMob 초기화 중 예외 발생');
        getCrashlytics().recordError(
          new Error(`AdMob_Init_Failure: ${error.message || '알 수 없는 오류'}`)
        );
      }
    };

    initAds();
  }, []);

  const checkStorage = async () => {
    const city = await storage.getCity();
    const cityCode = await storage.getCityCode();
    setSavedCity(city);
    setSavedCityCode(Number(cityCode));
    console.log(city);
    setIsLoading(false); // 로딩 끝
    await BootSplash.hide({ fade: true });
  };

  // 로딩 중일 때 (데이터 읽는 찰나의 순간)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // 데이터가 있으면 메인, 없으면 지역 선택 화면
  return (savedCity && savedCityCode) ? (
    <MainScreen cityName={savedCity} cityCode={savedCityCode} onReset={() => setSavedCity(null)} />
  ) : (
    <RegionSelectScreen onComplete={checkStorage} /> 
    // 저장 후 checkStorage를 다시 호출하게 하여 화면을 전환함
  );
};

export default App;