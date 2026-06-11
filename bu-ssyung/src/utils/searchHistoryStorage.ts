import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@search_history_';
const MAX_HISTORY_COUNT = 10;

export const searchHistoryStorage = {
  // 검색 기록 저장 (중복 제거 및 최신순 정렬)
  async saveHistory(mode: 'bus' | 'stop', keyword: string) {
    if (!keyword.trim()) return;
    try {
      const history = await this.getHistory(mode);
      const filteredHistory = history.filter((item) => item !== keyword);
      const newHistory = [keyword, ...filteredHistory].slice(0, MAX_HISTORY_COUNT);
      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${mode}`, JSON.stringify(newHistory));
      return newHistory;
    } catch (e) {
      console.error('Failed to save search history', e);
      return [];
    }
  },

  // 검색 기록 불러오기
  async getHistory(mode: 'bus' | 'stop'): Promise<string[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${mode}`);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Failed to get search history', e);
      return [];
    }
  },

  // 검색 기록 삭제
  async clearHistory(mode: 'bus' | 'stop') {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEY_PREFIX}${mode}`);
    } catch (e) {
      console.error('Failed to clear search history', e);
    }
  }
};