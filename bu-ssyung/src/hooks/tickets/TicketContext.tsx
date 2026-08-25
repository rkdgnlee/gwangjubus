import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ticketStorage, WARN_THRESHOLD } from '../../utils/ticketStorage';

interface TicketContextType {
  tickets: number | null;
  showWarn: boolean;
  showEmpty: boolean;
  consumeTicket: () => Promise<boolean>;
  rewardTickets: () => Promise<void>;
  dismissWarn: () => void;
  refreshTickets: () => Promise<void>;
}

const TicketContext = createContext<TicketContextType | null>(null);

export const TicketProvider = ({ children }: { children: React.ReactNode }) => {
  const [tickets, setTickets] = useState<number | null>(null);
  const [showWarn, setShowWarn] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const refreshTickets = useCallback(async () => {
    const count = await ticketStorage.getTickets();
    setTickets(count);
    if (count <= WARN_THRESHOLD) setShowWarn(true);
  }, []);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const consumeTicket = useCallback(async (): Promise<boolean> => {
    const { success, remaining, shouldWarn } = await ticketStorage.useTicket();
    setTickets(remaining);

    if (!success) {
      setShowEmpty(true);
      return false;
    }

    if (shouldWarn) {
      setShowWarn(true);
    }

    return true;
  }, []);

  const rewardTickets = useCallback(async () => {
    const next = await ticketStorage.rewardTickets();
    setTickets(next);
    setShowWarn(false);
    setShowEmpty(false);
  }, []);

  const dismissWarn = useCallback(() => setShowWarn(false), []);

  return (
    <TicketContext.Provider
      value={{
        tickets,
        showWarn,
        showEmpty,
        consumeTicket,
        rewardTickets,
        dismissWarn,
        refreshTickets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  return context;
};