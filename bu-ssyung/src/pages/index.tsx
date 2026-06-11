import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createRoute } from '@granite-js/react-native';
import { storage } from '../utils/storage';
import MainScreen from '../screens/MainScreen';
import RegionSelectScreen from '../screens/region/RegionSelectScreen';

export const Route = createRoute('/', {
  component: IndexPage,
});

function IndexPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [savedCity, setSavedCity] = useState<string | null>(null);
  const [savedCityCode, setSavedCityCode] = useState<number | null>(null);

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
  console.log('[checkStorage] 시작');
  const city = await storage.getCity();
  const cityCode = await storage.getCityCode();
  console.log('[checkStorage] 가져온 값 - city:', city, '/ cityCode:', cityCode);
  
  setSavedCity(city);
  setSavedCityCode(Number(cityCode));
  setIsLoading(false);
  console.log('[checkStorage] state 세팅 완료');
};

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (savedCity && savedCityCode) ? (
    <MainScreen
      cityName={savedCity}
      cityCode={savedCityCode}
      onReset={() => setSavedCity(null)}
    />
  ) : (
    <RegionSelectScreen onComplete={(city, cityCode) => {
      setSavedCity(city);
      setSavedCityCode(cityCode);
    }} />
  );
}