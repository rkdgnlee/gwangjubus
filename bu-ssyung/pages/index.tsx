import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createRoute } from '@granite-js/react-native';
import { storage } from '../src/utils/storage';
import RegionSelectScreen from '../src/screens/region/RegionSelectScreen';
import MainScreen from '../src/screens/MainScreen';

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
    const city = await storage.getCity();
    const cityCode = await storage.getCityCode();
    setSavedCity(city);
    setSavedCityCode(Number(cityCode));
    setIsLoading(false);
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
    <RegionSelectScreen onComplete={checkStorage} />
  );
}