import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ParentAlert {
  id: string;
  type: 'milestone' | 'struggle' | 'achievement' | 'daily_summary' | 'streak' | 'improvement';
  title: string;
  message: string;
  childId: string;
  childName: string;
  gameType?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

interface AlertThresholds {
  consecutiveWrongAnswers: number;
  milestoneScore: number;
  streakAchievement: number;
  accuracyImprovement: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  consecutiveWrongAnswers: 3,
  milestoneScore: 100,
  streakAchievement: 5,
  accuracyImprovement: 20,
};

// Store alerts in localStorage for persistence
const ALERTS_STORAGE_KEY = 'neuro_nest_parent_alerts';
export const ALERTS_UPDATED_EVENT = 'neuro_nest_alerts_updated';

export function useParentAlerts() {
  const [alerts, setAlerts] = useState<ParentAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const isUpdatingRef = useRef(false);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsedAlerts = JSON.parse(stored) as ParentAlert[];
        setAlerts(parsedAlerts);
        setUnreadCount(parsedAlerts.filter(a => !a.isRead).length);
      } catch (e) {
        console.error('Failed to parse alerts:', e);
      }
    }
  }, []);

  // Keep multiple hook instances in sync (e.g., games + parent dashboard)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ALERTS_STORAGE_KEY || isUpdatingRef.current) return;
      try {
        const next = e.newValue ? (JSON.parse(e.newValue) as ParentAlert[]) : [];
        setAlerts(next);
        setUnreadCount(next.filter((a) => !a.isRead).length);
      } catch (err) {
        console.error('Failed to sync alerts from storage:', err);
      }
    };

    const onLocalUpdate = () => {
      if (isUpdatingRef.current) return; // Prevent infinite loop
      try {
        const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
        const next = stored ? (JSON.parse(stored) as ParentAlert[]) : [];
        setAlerts(next);
        setUnreadCount(next.filter((a) => !a.isRead).length);
      } catch (err) {
        console.error('Failed to sync alerts from local update:', err);
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(ALERTS_UPDATED_EVENT, onLocalUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(ALERTS_UPDATED_EVENT, onLocalUpdate as EventListener);
    };
  }, []);

  // Helper to persist and broadcast changes
  const persistAlerts = useCallback((newAlerts: ParentAlert[]) => {
    isUpdatingRef.current = true;
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(newAlerts));
    setAlerts(newAlerts);
    setUnreadCount(newAlerts.filter(a => !a.isRead).length);
    // Notify other hook instances in the SAME tab
    window.dispatchEvent(new CustomEvent(ALERTS_UPDATED_EVENT));
    // Reset flag after event loop
    setTimeout(() => { isUpdatingRef.current = false; }, 0);
  }, []);

  const addAlert = useCallback((alert: Omit<ParentAlert, 'id' | 'isRead' | 'createdAt'>) => {
    const newAlert: ParentAlert = {
      ...alert,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    const currentAlerts = JSON.parse(localStorage.getItem(ALERTS_STORAGE_KEY) || '[]') as ParentAlert[];
    const updatedAlerts = [newAlert, ...currentAlerts].slice(0, 50);
    persistAlerts(updatedAlerts);
    
    // Show toast notification
    toast({
      title: alert.title,
      description: alert.message,
      duration: 5000,
    });

    return newAlert;
  }, [toast, persistAlerts]);

  const checkForMilestones = useCallback((
    childId: string,
    childName: string,
    gameType: string,
    score: number,
    totalScore: number,
    accuracy: number,
    streak: number,
    previousAccuracy?: number
  ) => {
    const alertsToAdd: Omit<ParentAlert, 'id' | 'isRead' | 'createdAt'>[] = [];

    // Milestone: First 100 XP in a game
    if (score >= DEFAULT_THRESHOLDS.milestoneScore && score < DEFAULT_THRESHOLDS.milestoneScore + 20) {
      alertsToAdd.push({
        type: 'milestone',
        title: '🎉 Milestone Reached!',
        message: `${childName} scored ${score} points in ${gameType}! They're making great progress!`,
        childId,
        childName,
        gameType,
        data: { score },
      });
    }

    // Total XP milestones
    const milestones = [500, 1000, 2500, 5000, 10000];
    for (const milestone of milestones) {
      if (totalScore >= milestone && totalScore < milestone + 50) {
        alertsToAdd.push({
          type: 'achievement',
          title: '⭐ XP Milestone!',
          message: `${childName} has earned ${totalScore} total XP! Amazing dedication!`,
          childId,
          childName,
          data: { totalScore, milestone },
        });
        break;
      }
    }

    // Streak achievements
    if (streak >= DEFAULT_THRESHOLDS.streakAchievement) {
      alertsToAdd.push({
        type: 'streak',
        title: '🔥 Hot Streak!',
        message: `${childName} got ${streak} correct answers in a row in ${gameType}!`,
        childId,
        childName,
        gameType,
        data: { streak },
      });
    }

    // Accuracy improvement
    if (previousAccuracy !== undefined && accuracy - previousAccuracy >= DEFAULT_THRESHOLDS.accuracyImprovement) {
      alertsToAdd.push({
        type: 'improvement',
        title: '📈 Big Improvement!',
        message: `${childName}'s accuracy in ${gameType} improved by ${accuracy - previousAccuracy}%!`,
        childId,
        childName,
        gameType,
        data: { previousAccuracy, accuracy },
      });
    }

    // Perfect game
    if (accuracy === 100) {
      alertsToAdd.push({
        type: 'achievement',
        title: '🏆 Perfect Game!',
        message: `${childName} got 100% accuracy in ${gameType}! Incredible!`,
        childId,
        childName,
        gameType,
        data: { accuracy },
      });
    }

    // Add all alerts
    alertsToAdd.forEach(alert => addAlert(alert));

    return alertsToAdd.length;
  }, [addAlert]);

  const checkForStruggles = useCallback((
    childId: string,
    childName: string,
    gameType: string,
    consecutiveWrong: number,
    totalWrong: number,
    accuracy: number
  ) => {
    if (consecutiveWrong >= DEFAULT_THRESHOLDS.consecutiveWrongAnswers) {
      addAlert({
        type: 'struggle',
        title: '💙 Support Needed',
        message: `${childName} is finding ${gameType} challenging. They got ${consecutiveWrong} answers wrong in a row. Consider offering some encouragement!`,
        childId,
        childName,
        gameType,
        data: { consecutiveWrong, totalWrong, accuracy },
      });
      return true;
    }

    // Low accuracy alert
    if (accuracy < 40 && totalWrong >= 5) {
      addAlert({
        type: 'struggle',
        title: '📚 Extra Practice Needed',
        message: `${childName} might need more practice with ${gameType}. Current accuracy is ${accuracy}%.`,
        childId,
        childName,
        gameType,
        data: { accuracy, totalWrong },
      });
      return true;
    }

    return false;
  }, [addAlert]);

  const generateDailySummary = useCallback(async (parentId: string) => {
    try {
      // Get all children for this parent
      const { data: children } = await supabase
        .from('child_profiles')
        .select('id, name')
        .eq('parent_id', parentId);

      if (!children || children.length === 0) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const child of children) {
        const { data: sessions } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('child_id', child.id)
          .gte('created_at', today.toISOString());

        if (sessions && sessions.length > 0) {
          const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
          const totalGames = sessions.length;
          const totalTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
          const avgAccuracy = Math.round(
            sessions.reduce((sum, s) => sum + (s.correct_answers / s.total_questions) * 100, 0) / totalGames
          );

          addAlert({
            type: 'daily_summary',
            title: '📊 Daily Summary',
            message: `${child.name} played ${totalGames} games today, earning ${totalScore} XP with ${avgAccuracy}% accuracy. Total play time: ${Math.round(totalTime / 60)} minutes.`,
            childId: child.id,
            childName: child.name,
            data: { totalScore, totalGames, totalTime, avgAccuracy },
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate daily summary:', error);
    }
  }, [addAlert]);

  const markAsRead = useCallback((alertId: string) => {
    const currentAlerts = JSON.parse(localStorage.getItem(ALERTS_STORAGE_KEY) || '[]') as ParentAlert[];
    const updated = currentAlerts.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    );
    persistAlerts(updated);
  }, [persistAlerts]);

  const markAllAsRead = useCallback(() => {
    const currentAlerts = JSON.parse(localStorage.getItem(ALERTS_STORAGE_KEY) || '[]') as ParentAlert[];
    const updated = currentAlerts.map(a => ({ ...a, isRead: true }));
    persistAlerts(updated);
  }, [persistAlerts]);

  const deleteAlert = useCallback((alertId: string) => {
    const currentAlerts = JSON.parse(localStorage.getItem(ALERTS_STORAGE_KEY) || '[]') as ParentAlert[];
    const updated = currentAlerts.filter(a => a.id !== alertId);
    persistAlerts(updated);
  }, [persistAlerts]);

  const clearAllAlerts = useCallback(() => {
    persistAlerts([]);
  }, [persistAlerts]);

  return {
    alerts,
    unreadCount,
    addAlert,
    checkForMilestones,
    checkForStruggles,
    generateDailySummary,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    clearAllAlerts,
  };
}
