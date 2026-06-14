import { useCallback, useEffect, useState } from 'react';
import { ticketStorage, WARN_THRESHOLD } from '../../utils/ticketStorage';

export const useTicket = () => {
  const [tickets, setTickets] = useState<number | null>(null);
  const [showWarn, setShowWarn] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  // 초기 로드
  useEffect(() => {
    ticketStorage.getTickets().then((count) => {
      setTickets(count);
      if (count <= WARN_THRESHOLD) setShowWarn(true);
    });
  }, []);

  // 검색 결과에서 항목 눌렀을 때 호출
  const consumeTicket = useCallback(async (): Promise<boolean> => {
    const { success, remaining, shouldWarn } = await ticketStorage.useTicket();
    setTickets(remaining);

    if (!success) {
      setShowEmpty(true); // 티켓 0 → 광고 강제 유도
      return false;
    }

    if (shouldWarn) {
      setShowWarn(true); // 30회 이하 → 경고 배너
    }

    return true;
  }, []);

  // 광고 시청 완료 후 호출
  const rewardTickets = useCallback(async () => {
    const next = await ticketStorage.rewardTickets();
    setTickets(next);
    setShowWarn(false);
    setShowEmpty(false);
  }, []);

  const dismissWarn = useCallback(() => setShowWarn(false), []);

  return {
    tickets,          // 현재 남은 횟수
    showWarn,         // 30회 이하 경고 표시 여부
    showEmpty,        // 0회 → 광고 강제 표시 여부
    consumeTicket,    // 항목 누를 때 호출 → false면 이동 막기
    rewardTickets,    // 광고 완료 후 호출
    dismissWarn,      // 경고 배너 닫기
  };
};