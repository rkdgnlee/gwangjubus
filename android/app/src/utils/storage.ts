import AsyncStorage from '@react-native-async-storage/async-storage';

const CITY_KEY = '@selected_city';

export const storage = {
  // 도시 저장
  setCity: async (value: string) => {
    await AsyncStorage.setItem(CITY_KEY, value);
  },
  // 도시 불러오 (없으면 null 반환)
  getCity: async () => {
    return await AsyncStorage.getItem(CITY_KEY);
  },
  // 초기화 (테스트용)
  clear: async () => {
    await AsyncStorage.removeItem(CITY_KEY);
  }
};