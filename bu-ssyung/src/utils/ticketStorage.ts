import { Storage } from '@apps-in-toss/framework';

const TICKET_KEY = 'search_ticket_count';

// 🌟 이번 티켓 조정을 위한 고유 마이그레이션 키 (딱 한 번만 실행되도록 보장)
const MIGRATION_KEY = 'migration_ticket_cap_to_50_v1'; 

const INITIAL_TICKETS = 30;
const AD_REWARD_TICKETS = 20; 
const WARN_THRESHOLD = 10; 

export const ticketStorage = {
  /**
   * 🎟️ 배포 유저 대상 1회성 티켓 조정 마이그레이션
   */
  runMigrationIfNeeded: async (): Promise<void> => {
    try {
      // 1. 이미 마이그레이션이 실행된 기기인지 확인
      const isMigrated = await Storage.getItem(MIGRATION_KEY);
      if (isMigrated === 'true') {
        return; // 이미 완료되었다면 즉시 종료 (아무것도 하지 않음)
      }

      // 2. 기존 보유 티켓 조회
      const rawValue = await Storage.getItem(TICKET_KEY);
      
      if (rawValue !== null) {
        const current = Number(rawValue);
        // 90개 이상 가지고 있던 기존 배포 유저라면 50개로 조정
        if (current >= 90) {
          await Storage.setItem(TICKET_KEY, String(50));
        }
      }

      // 3. 마이그레이션 성공 기록 저장 (이후 앱을 껐다 켜도 위 1번에서 바로 걸러짐)
      await Storage.setItem(MIGRATION_KEY, 'true');
    } catch (e) {
      console.error('Migration failed:', e);
    }
  },

  getTickets: async (): Promise<number> => {
    // 🔍 티켓을 읽어오기 전, 마이그레이션 대상인지 체크하고 필요시 1회 실행
    await ticketStorage.runMigrationIfNeeded();

    const value = await Storage.getItem(TICKET_KEY);
    
    // 신규 유저인 경우 (저장된 값이 아예 없음)
    if (value === null) {
      await Storage.setItem(TICKET_KEY, String(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    
    return Number(value);
  },

  // 티켓 1회 차감
  useTicket: async (): Promise<{ success: boolean; remaining: number; shouldWarn: boolean }> => {
    const current = await ticketStorage.getTickets(); // 마이그레이션이 반영된 값을 기준으로 동작
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
    const current = await ticketStorage.getTickets(); // 마이그레이션이 반영된 값을 기준으로 동작
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