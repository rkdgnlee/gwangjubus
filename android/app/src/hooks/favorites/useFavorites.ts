import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IFavorite, IFavoriteBus, IFavoriteStop } from '../../types/favorite';

const STORAGE_KEY = 'favorites_v2';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<IFavorite[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch (e) {
      console.error('load favorites error:', e);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const save = async (next: IFavorite[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavorites(next);
  };

  const addStop = useCallback(async (
    item: Omit<IFavoriteStop, 'id' | 'savedAt'>
  ) => {
    const next = [
      ...favorites.filter(f => !(f.type === 'stop' && (f as IFavoriteStop).nodeid === item.nodeid)),
      { ...item, id: `stop_${item.nodeid}`, savedAt: Date.now() } as IFavoriteStop,
    ];
    await save(next);
  }, [favorites]);

  const addBus = useCallback(async (
    item: Omit<IFavoriteBus, 'id' | 'savedAt'>
  ) => {
    const next = [
      ...favorites.filter(f => !(f.type === 'bus' && (f as IFavoriteBus).routeid === item.routeid)),
      { ...item, id: `bus_${item.routeid}`, savedAt: Date.now() } as IFavoriteBus,
    ];
    await save(next);
  }, [favorites]);

  const removeFavorite = useCallback(async (id: string) => {
    await save(favorites.filter(f => f.id !== id));
  }, [favorites]);

  const isStopSaved = useCallback((nodeid: string) => {
    return favorites.some(f => f.type === 'stop' && (f as IFavoriteStop).nodeid === nodeid);
  }, [favorites]);

  const isBusSaved = useCallback((routeid: string) => {
    return favorites.some(f => f.type === 'bus' && (f as IFavoriteBus).routeid === routeid);
  }, [favorites]);

  const getFavoriteId = useCallback((type: 'stop' | 'bus', id: string) => {
    return type === 'stop' ? `stop_${id}` : `bus_${id}`;
  }, []);

  return { favorites, addStop, addBus, removeFavorite, isStopSaved, isBusSaved, getFavoriteId, load };
};