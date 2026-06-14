import { Storage } from '@apps-in-toss/framework';

const CITY_KEY = '@selected_city';
const CITY_CODE_KEY = '@selected_city_code';

export const storage = {
  // 도시 저장
  setCity: async (value: string) => {
    await Storage.setItem(CITY_KEY, value);
  },
  // 도시 이름 불러오기 (없으면 null 반환)
  getCity: async () => {
    return await Storage.getItem(CITY_KEY);
  },
  // 도시 코드 저장
  setCityCode: async (value: string) => {
    await Storage.setItem(CITY_CODE_KEY, value);
  },
  // 도시 코드 불러오기
  getCityCode: async () => {
    return await Storage.getItem(CITY_CODE_KEY);
  },
  // 초기화 (테스트용)
  clear: async () => {
    await Storage.removeItem(CITY_KEY);
    await Storage.removeItem(CITY_CODE_KEY);
  }
};