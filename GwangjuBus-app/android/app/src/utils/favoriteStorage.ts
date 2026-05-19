import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteBus } from '../types/favorite';

const FAVORITES_KEY = '@bus_favorites';

export const favoriteStorage = {
  // 전체 즐겨찾기 가져오기
  getFavorites: async (): Promise<FavoriteBus[]> => {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    return json ? JSON.parse(json) : [];
  },

  // 즐겨찾기 추가
  addFavorite: async (newItem: FavoriteBus) => {
    const list = await favoriteStorage.getFavorites();
    // 중복 체크 후 추가
    const isExist = list.some(item => item.id === newItem.id);
    if (!isExist) {
      const newList = [newItem, ...list];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newList));
    }
  },

  // 즐겨찾기 삭제
  removeFavorite: async (id: string) => {
    const list = await favoriteStorage.getFavorites();
    const newList = list.filter(item => item.id !== id);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newList));
  }
};