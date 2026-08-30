import { useState, useEffect, useCallback } from 'react';
import { Storage } from '@apps-in-toss/framework';
import { IFavorite, IFavoriteBus, IFavoriteStop } from '../../types/favorite';

const STORAGE_KEY = 'favorites_v2';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<IFavorite[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await Storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        } else {
          setFavorites([]);
        }
      }
    } catch (e) {
      console.error('load favorites error:', e);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const save = async (next: IFavorite[]) => {
    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(next));
      setFavorites(next);
    } catch (e) {
      console.error('save favorites error:', e);
    }
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

  // 👈 1. 북마크 수정 기능 추가 (이모지, 별칭/메모 등)
  const updateFavorite = useCallback(async (id: string, updatedItem: IFavorite) => {
    const next = favorites.map(f => (f.id === id ? updatedItem : f));
    await save(next);
  }, [favorites]);

  // 👈 2. 개별 삭제 기능 (remove 및 기존 removeFavorite 함수명 모두 호환)
  const remove = useCallback(async (id: string) => {
    await save(favorites.filter(f => f.id !== id));
  }, [favorites]);

  // 👈 3. 전체 삭제 기능 추가
  const removeAll = useCallback(async () => {
    await save([]);
  }, []);

  const isStopSaved = useCallback((nodeid: string) => {
    return favorites.some(f => f.type === 'stop' && (f as IFavoriteStop).nodeid === nodeid);
  }, [favorites]);

  const isBusSaved = useCallback((routeid: string) => {
    return favorites.some(f => f.type === 'bus' && (f as IFavoriteBus).routeid === routeid);
  }, [favorites]);

  const getFavoriteId = useCallback((type: 'stop' | 'bus', id: string) => {
    return type === 'stop' ? `stop_${id}` : `bus_${id}`;
  }, []);

  return {
    favorites,
    addStop,
    addBus,
    updateFavorite,   // 👈 추가
    remove,           // 👈 추가
    removeFavorite: remove, // 👈 기존 코드와의 호환성 유지
    removeAll,        // 👈 추가
    isStopSaved,
    isBusSaved,
    getFavoriteId,
    load,
  };
};