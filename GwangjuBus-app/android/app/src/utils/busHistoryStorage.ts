// utils/busHistoryStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IBusRideHistory } from '../types/IBusRideHistory';

const KEY = 'bus_ride_history';

export const busHistoryStorage = {
  getAll: async (): Promise<IBusRideHistory[]> => {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  },

  add: async (entry: Omit<IBusRideHistory, 'id' | 'arrivedAt'>) => {
    const all = await busHistoryStorage.getAll();
    const newEntry: IBusRideHistory = {
      ...entry,
      id: `${Date.now()}-${Math.random()}`,
      arrivedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEY, JSON.stringify([newEntry, ...all]));
    return newEntry;
  },

  // 특정 노선 승차 횟수
  getCountByRoute: async (routeid: string): Promise<number> => {
    const all = await busHistoryStorage.getAll();
    return all.filter(h => h.routeid === routeid).length;
  },
  remove: async (id: string) => {
    const all = await busHistoryStorage.getAll();
    const filtered = all.filter(h => h.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
  },

  removeAll: async () => {
    await AsyncStorage.removeItem(KEY);
  },

};
