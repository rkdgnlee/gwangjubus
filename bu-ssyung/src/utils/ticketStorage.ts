import { Storage } from '@apps-in-toss/framework';

const TICKET_KEY = 'search_ticket_count';
const INITIAL_TICKETS = 150;
const AD_REWARD_TICKETS = 100; // 광고 1회 시청 시 충전량 (추후 조정)
const WARN_THRESHOLD = 30; // 경고 표시 기준

export const ticketStorage = {
  // 현재 티켓 수 가져오기 (없으면 초기값 200으로 세팅)
  getTickets: async (): Promise<number> => {
    const value = await Storage.getItem(TICKET_KEY);
    if (value === null) {
      await Storage.setItem(TICKET_KEY, String(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return Number(value);
  },

  // 티켓 1회 차감 (0 이하면 차감 안 함)
  // 반환값: { success: boolean; remaining: number; shouldWarn: boolean }
  useTicket: async (): Promise<{ success: boolean; remaining: number; shouldWarn: boolean }> => {
    const current = await ticketStorage.getTickets();
    if (current <= 0) {
      return { success: false, remaining: 0, shouldWarn: true };
    }
    const next = current - 1;
    await Storage.setItem(TICKET_KEY, String(next));
    return {
      success: true,
      remaining: next,
      shouldWarn: next <= WARN_THRESHOLD,
    };
  },

  // 광고 시청 후 충전
  rewardTickets: async (): Promise<number> => {
    const current = await ticketStorage.getTickets();
    const next = current + AD_REWARD_TICKETS;
    await Storage.setItem(TICKET_KEY, String(next));
    return next;
  },

  // 직접 세팅 (테스트용)
  setTickets: async (count: number): Promise<void> => {
    await Storage.setItem(TICKET_KEY, String(count));
  },
};

export { WARN_THRESHOLD, INITIAL_TICKETS, AD_REWARD_TICKETS };