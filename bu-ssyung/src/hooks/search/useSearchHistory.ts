import { useState, useEffect, useCallback } from 'react';
import { Storage } from '@apps-in-toss/framework';

export interface ISearchHistory {
  query: string;
  timestamp: number; // ms
}

const KEYS = {
  bus: 'search_history_bus',
  stop: 'search_history_stop',
};

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;
const MAX_COUNT = 20;

export const useSearchHistory = (mode: 'bus' | 'stop') => {
  const [history, setHistory] = useState<ISearchHistory[]>([]);

  // 불러오기 + 6개월 지난 것 자동 삭제
  const loadHistory = useCallback(async () => {
    try {
      const raw = await Storage.getItem(KEYS[mode]);
      if (!raw) return;
      const parsed: ISearchHistory[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Invalid data format');

      const now = Date.now();
      const filtered = parsed.filter(h => now - h.timestamp < SIX_MONTHS_MS);
      setHistory(filtered);
      if (filtered.length !== parsed.length) {
        await Storage.setItem(KEYS[mode], JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('loadHistory error:', e);
    }
  }, [mode]);

  useEffect(() => {
    loadHistory();
  }, [mode]);

  // 검색어 추가
  const addHistory = useCallback(async (query: string) => {
    if (!query.trim()) return;
    try {
      const raw = await Storage.getItem(KEYS[mode]);
      const prev: ISearchHistory[] = raw ? JSON.parse(raw) : [];
      // 중복 제거 후 최신순 앞에 추가
      const deduped = prev.filter(h => h.query !== query);
      const next = [{ query, timestamp: Date.now() }, ...deduped].slice(0, MAX_COUNT);
      await Storage.setItem(KEYS[mode], JSON.stringify(next));
      setHistory(next);
    } catch (e) {
      console.error('addHistory error:', e);
    }
  }, [mode]);

  // 전체 삭제
  const clearHistory = useCallback(async () => {
    try {
      await Storage.removeItem(KEYS[mode]);
      setHistory([]);
    } catch (e) {
      console.error('clearHistory error:', e);
    }
  }, [mode]);

  // 개별 삭제
  const removeHistory = useCallback(async (query: string) => {
    try {
      const next = history.filter(h => h.query !== query);
      await Storage.setItem(KEYS[mode], JSON.stringify(next));
      setHistory(next);
    } catch (e) {
      console.error('removeHistory error:', e);
    }
  }, [history, mode]);

  return { history, addHistory, clearHistory, removeHistory };
};