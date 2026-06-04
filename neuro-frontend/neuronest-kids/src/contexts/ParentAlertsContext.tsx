import { createContext, useContext, ReactNode } from 'react';
import { useParentAlerts, ParentAlert } from '@/hooks/useParentAlerts';

interface ParentAlertsContextType {
  alerts: ParentAlert[];
  unreadCount: number;
  addAlert: (alert: Omit<ParentAlert, 'id' | 'isRead' | 'createdAt'>) => ParentAlert;
  checkForMilestones: (
    childId: string,
    childName: string,
    gameType: string,
    score: number,
    totalScore: number,
    accuracy: number,
    streak: number,
    previousAccuracy?: number
  ) => number;
  checkForStruggles: (
    childId: string,
    childName: string,
    gameType: string,
    consecutiveWrong: number,
    totalWrong: number,
    accuracy: number
  ) => boolean;
  generateDailySummary: (parentId: string) => Promise<void>;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  deleteAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
}

const ParentAlertsContext = createContext<ParentAlertsContextType | null>(null);

export function ParentAlertsProvider({ children }: { children: ReactNode }) {
  const alertsHook = useParentAlerts();

  return (
    <ParentAlertsContext.Provider value={alertsHook}>
      {children}
    </ParentAlertsContext.Provider>
  );
}

export function useParentAlertsContext() {
  const context = useContext(ParentAlertsContext);
  if (!context) {
    throw new Error('useParentAlertsContext must be used within ParentAlertsProvider');
  }
  return context;
}
