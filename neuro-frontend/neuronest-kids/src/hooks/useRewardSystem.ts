import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'games' | 'xp' | 'special' | 'time';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export interface Reward {
  id: string;
  type: 'badge' | 'sticker' | 'trophy' | 'star';
  earnedAt: string;
  gameType?: string;
}

// All available badges
const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Streak badges
  { id: 'streak_5', name: 'Hot Start', description: '5 correct answers in a row', icon: '🔥', category: 'streak', requirement: 5 },
  { id: 'streak_10', name: 'On Fire', description: '10 correct answers in a row', icon: '🌟', category: 'streak', requirement: 10 },
  { id: 'streak_15', name: 'Unstoppable', description: '15 correct answers in a row', icon: '⚡', category: 'streak', requirement: 15 },
  { id: 'streak_20', name: 'Legendary', description: '20 correct answers in a row', icon: '👑', category: 'streak', requirement: 20 },
  
  // Accuracy badges
  { id: 'accuracy_80', name: 'Sharp Mind', description: 'Get 80% accuracy in a game', icon: '🎯', category: 'accuracy', requirement: 80 },
  { id: 'accuracy_90', name: 'Super Sharp', description: 'Get 90% accuracy in a game', icon: '💎', category: 'accuracy', requirement: 90 },
  { id: 'accuracy_100', name: 'Perfect Score', description: 'Get 100% accuracy', icon: '🏆', category: 'accuracy', requirement: 100 },
  
  // Games played badges
  { id: 'games_10', name: 'Getting Started', description: 'Play 10 games', icon: '🎮', category: 'games', requirement: 10 },
  { id: 'games_25', name: 'Game Lover', description: 'Play 25 games', icon: '🎲', category: 'games', requirement: 25 },
  { id: 'games_50', name: 'Dedicated Learner', description: 'Play 50 games', icon: '📚', category: 'games', requirement: 50 },
  { id: 'games_100', name: 'Learning Champion', description: 'Play 100 games', icon: '🏅', category: 'games', requirement: 100 },
  
  // XP badges
  { id: 'xp_500', name: 'Rising Star', description: 'Earn 500 XP', icon: '⭐', category: 'xp', requirement: 500 },
  { id: 'xp_1000', name: 'Bright Star', description: 'Earn 1000 XP', icon: '🌟', category: 'xp', requirement: 1000 },
  { id: 'xp_2500', name: 'Super Star', description: 'Earn 2500 XP', icon: '✨', category: 'xp', requirement: 2500 },
  { id: 'xp_5000', name: 'Mega Star', description: 'Earn 5000 XP', icon: '💫', category: 'xp', requirement: 5000 },
  { id: 'xp_10000', name: 'Ultimate Star', description: 'Earn 10000 XP', icon: '🌠', category: 'xp', requirement: 10000 },
  
  // Time badges
  { id: 'time_30', name: 'Quick Learner', description: 'Play for 30 minutes', icon: '⏰', category: 'time', requirement: 30 },
  { id: 'time_60', name: 'Focused Mind', description: 'Play for 1 hour', icon: '🕐', category: 'time', requirement: 60 },
  { id: 'time_120', name: 'Study Champion', description: 'Play for 2 hours', icon: '📖', category: 'time', requirement: 120 },
  
  // Special badges
  { id: 'special_all_games', name: 'Explorer', description: 'Try all game types', icon: '🗺️', category: 'special', requirement: 12 },
  { id: 'special_first_game', name: 'First Steps', description: 'Complete your first game', icon: '👶', category: 'special', requirement: 1 },
  { id: 'special_comeback', name: 'Comeback Kid', description: 'Improve accuracy by 20%', icon: '🔄', category: 'special', requirement: 20 },
];

const REWARDS_STORAGE_KEY = 'neuro_nest_rewards';

export function useRewardSystem(childId?: string) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [unlockedBadgeCount, setUnlockedBadgeCount] = useState(0);

  // Load rewards from localStorage
  useEffect(() => {
    if (!childId) return;
    
    const storageKey = `${REWARDS_STORAGE_KEY}_${childId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setRewards(data.rewards || []);
        initializeBadges(data.unlockedBadges || []);
      } catch (e) {
        console.error('Failed to parse rewards:', e);
        initializeBadges([]);
      }
    } else {
      initializeBadges([]);
    }
  }, [childId]);

  // Save rewards whenever they change
  useEffect(() => {
    if (!childId) return;
    
    const storageKey = `${REWARDS_STORAGE_KEY}_${childId}`;
    const unlockedBadges = badges.filter(b => b.unlocked).map(b => b.id);
    
    localStorage.setItem(storageKey, JSON.stringify({
      rewards,
      unlockedBadges,
    }));
  }, [childId, rewards, badges]);

  const initializeBadges = useCallback((unlockedIds: string[]) => {
    const initialBadges = BADGE_DEFINITIONS.map(def => ({
      ...def,
      unlocked: unlockedIds.includes(def.id),
      progress: 0,
    }));
    setBadges(initialBadges);
  }, []);

  const updateProgress = useCallback(async (childId: string) => {
    try {
      // Fetch game sessions for the child
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_id', childId);

      if (!sessions) return;

      const totalGames = sessions.length;
      const totalXP = sessions.reduce((sum, s) => sum + s.score, 0);
      const totalTimeMinutes = Math.floor(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);
      const maxStreak = Math.max(...sessions.map(s => s.max_streak), 0);
      const maxAccuracy = Math.max(...sessions.map(s => 
        s.total_questions > 0 ? Math.round((s.correct_answers / s.total_questions) * 100) : 0
      ), 0);
      const uniqueGameTypes = new Set(sessions.map(s => s.game_type)).size;

      // Update badge progress + unlocks using a single derived next state (avoids stale closures)
      const newlyUnlocked: Badge[] = [];

      setBadges((prev) => {
        const next = prev.map((badge) => {
          let progress = 0;
          let shouldUnlock = false;

          switch (badge.category) {
            case 'streak':
              progress = Math.min((maxStreak / badge.requirement) * 100, 100);
              shouldUnlock = maxStreak >= badge.requirement;
              break;
            case 'accuracy':
              progress = Math.min((maxAccuracy / badge.requirement) * 100, 100);
              shouldUnlock = maxAccuracy >= badge.requirement;
              break;
            case 'games':
              progress = Math.min((totalGames / badge.requirement) * 100, 100);
              shouldUnlock = totalGames >= badge.requirement;
              break;
            case 'xp':
              progress = Math.min((totalXP / badge.requirement) * 100, 100);
              shouldUnlock = totalXP >= badge.requirement;
              break;
            case 'time':
              progress = Math.min((totalTimeMinutes / badge.requirement) * 100, 100);
              shouldUnlock = totalTimeMinutes >= badge.requirement;
              break;
            case 'special':
              if (badge.id === 'special_all_games') {
                progress = Math.min((uniqueGameTypes / badge.requirement) * 100, 100);
                shouldUnlock = uniqueGameTypes >= badge.requirement;
              } else if (badge.id === 'special_first_game') {
                progress = totalGames >= 1 ? 100 : 0;
                shouldUnlock = totalGames >= 1;
              }
              break;
          }

          const isNewlyUnlocked = shouldUnlock && !badge.unlocked;
          if (isNewlyUnlocked) {
            newlyUnlocked.push({
              ...badge,
              unlocked: true,
              progress: 100,
              unlockedAt: new Date().toISOString(),
            });
          }

          const unlocked = badge.unlocked || shouldUnlock;
          return {
            ...badge,
            progress,
            unlocked,
            unlockedAt: unlocked && !badge.unlockedAt ? new Date().toISOString() : badge.unlockedAt,
          };
        });

        const unlockedCount = next.filter((b) => b.unlocked).length;
        setUnlockedBadgeCount(unlockedCount);
        setTotalStars(unlockedCount);

        return next;
      });

      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedBadges(newlyUnlocked);
        setRewards((prev) => [
          ...prev,
          ...newlyUnlocked.map(() => ({
            id: crypto.randomUUID(),
            type: 'badge' as const,
            earnedAt: new Date().toISOString(),
          })),
        ]);
      }

    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlockedBadges([]);
  }, []);

  const awardSticker = useCallback((gameType: string) => {
    const sticker: Reward = {
      id: crypto.randomUUID(),
      type: 'sticker',
      earnedAt: new Date().toISOString(),
      gameType,
    };
    setRewards(prev => [...prev, sticker]);
    return sticker;
  }, []);

  const getUnlockedBadgeCount = useCallback(() => {
    return badges.filter(b => b.unlocked).length;
  }, [badges]);

  const getBadgesByCategory = useCallback((category: Badge['category']) => {
    return badges.filter(b => b.category === category);
  }, [badges]);

  return {
    badges,
    rewards,
    newlyUnlockedBadges,
    totalStars,
    unlockedBadgeCount,
    updateProgress,
    clearNewlyUnlocked,
    awardSticker,
    getUnlockedBadgeCount,
    getBadgesByCategory,
  };
}
