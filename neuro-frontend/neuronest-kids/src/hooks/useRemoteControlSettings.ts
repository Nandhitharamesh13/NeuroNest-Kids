import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RemoteControlSettings {
  difficultyLevel: number;
  enabledCategories: string[];
  dailyTimeLimit: number;
  learningGoals: LearningGoal[];
  autoAdjustDifficulty: boolean;
  focusMode: boolean;
  ageFilter: number;
  contentFilterLevel: 'basic' | 'standard' | 'advanced';
  schedule: ScheduleSlot[];
  milestoneNotifications: MilestoneNotification[];
  breakReminders: boolean;
  breakIntervalMinutes: number;
  maxGamesPerSession: number;
}

export interface LearningGoal {
  id: string;
  name: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface MilestoneNotification {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: RemoteControlSettings = {
  difficultyLevel: 3,
  enabledCategories: ['everyday', 'numbers', 'words', 'sensory', 'world'],
  dailyTimeLimit: 30,
  learningGoals: [
    { id: 'letters', name: 'Letters & Alphabet', enabled: true, priority: 'high' },
    { id: 'numbers', name: 'Numbers & Counting', enabled: true, priority: 'high' },
    { id: 'colors', name: 'Colors & Shapes', enabled: true, priority: 'medium' },
    { id: 'music', name: 'Music & Sounds', enabled: true, priority: 'low' },
    { id: 'world', name: 'World Around Us', enabled: true, priority: 'medium' },
    { id: 'social', name: 'Social Skills', enabled: true, priority: 'medium' },
  ],
  autoAdjustDifficulty: true,
  focusMode: false,
  ageFilter: 5,
  contentFilterLevel: 'standard',
  schedule: [
    { id: 'mon', day: 'Monday', startTime: '09:00', endTime: '10:00', enabled: true },
    { id: 'tue', day: 'Tuesday', startTime: '09:00', endTime: '10:00', enabled: true },
    { id: 'wed', day: 'Wednesday', startTime: '09:00', endTime: '10:00', enabled: true },
    { id: 'thu', day: 'Thursday', startTime: '09:00', endTime: '10:00', enabled: true },
    { id: 'fri', day: 'Friday', startTime: '09:00', endTime: '10:00', enabled: true },
    { id: 'sat', day: 'Saturday', startTime: '10:00', endTime: '11:00', enabled: false },
    { id: 'sun', day: 'Sunday', startTime: '10:00', endTime: '11:00', enabled: false },
  ],
  milestoneNotifications: [
    { id: 'perfect_game', type: 'achievement', label: 'Perfect Game (100%)', enabled: true },
    { id: 'xp_milestone', type: 'milestone', label: 'XP Milestones (500, 1K, 5K)', enabled: true },
    { id: 'streak_5', type: 'streak', label: 'Hot Streak (5+ correct)', enabled: true },
    { id: 'struggle_alert', type: 'struggle', label: 'Struggle Alerts', enabled: true },
    { id: 'daily_summary', type: 'daily_summary', label: 'Daily Summary Report', enabled: true },
    { id: 'new_badge', type: 'badge', label: 'New Badge Unlocked', enabled: true },
    { id: 'accuracy_drop', type: 'improvement', label: 'Accuracy Changes (±20%)', enabled: true },
  ],
  breakReminders: true,
  breakIntervalMinutes: 15,
  maxGamesPerSession: 10,
};

function dbRowToSettings(row: any): RemoteControlSettings {
  return {
    difficultyLevel: row.difficulty_level ?? 3,
    autoAdjustDifficulty: row.auto_adjust_difficulty ?? true,
    enabledCategories: (row.enabled_categories as string[]) ?? DEFAULT_SETTINGS.enabledCategories,
    dailyTimeLimit: row.daily_time_limit ?? 30,
    learningGoals: (row.learning_goals as LearningGoal[]) ?? DEFAULT_SETTINGS.learningGoals,
    focusMode: row.focus_mode ?? false,
    ageFilter: row.age_filter ?? 5,
    contentFilterLevel: (row.content_filter_level ?? 'standard') as any,
    schedule: (row.schedule as ScheduleSlot[]) ?? DEFAULT_SETTINGS.schedule,
    milestoneNotifications: (row.milestone_notifications as MilestoneNotification[]) ?? DEFAULT_SETTINGS.milestoneNotifications,
    breakReminders: row.break_reminders ?? true,
    breakIntervalMinutes: row.break_interval_minutes ?? 15,
    maxGamesPerSession: row.max_games_per_session ?? 10,
  };
}

function settingsToDbRow(settings: RemoteControlSettings, childId: string, parentId: string) {
  return {
    child_id: childId,
    parent_id: parentId,
    difficulty_level: settings.difficultyLevel,
    auto_adjust_difficulty: settings.autoAdjustDifficulty,
    enabled_categories: settings.enabledCategories as any,
    daily_time_limit: settings.dailyTimeLimit,
    learning_goals: settings.learningGoals as any,
    focus_mode: settings.focusMode,
    age_filter: settings.ageFilter,
    content_filter_level: settings.contentFilterLevel,
    schedule: settings.schedule as any,
    milestone_notifications: settings.milestoneNotifications as any,
    break_reminders: settings.breakReminders,
    break_interval_minutes: settings.breakIntervalMinutes,
    max_games_per_session: settings.maxGamesPerSession,
  };
}

/**
 * Hook for PARENT side: load, save, and manage remote control settings.
 * Saves to Supabase `remote_control_settings` table for real-time sync.
 */
export function useRemoteControlSettingsParent(childId: string | null) {
  const [settings, setSettings] = useState<RemoteControlSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load settings from DB
  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    supabase
      .from('remote_control_settings' as any)
      .select('*')
      .eq('child_id', childId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (data) {
          setSettings(dbRowToSettings(data));
        } else {
          setSettings({ ...DEFAULT_SETTINGS });
        }
        setLoading(false);
      });
  }, [childId]);

  const saveSettings = useCallback(async (newSettings: RemoteControlSettings) => {
    if (!childId) return false;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      const row = settingsToDbRow(newSettings, childId, user.id);

      // Check if row exists
      const { data: existing } = await (supabase.from('remote_control_settings' as any) as any)
        .select('id')
        .eq('child_id', childId)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase.from('remote_control_settings' as any) as any)
          .update(row)
          .eq('child_id', childId);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('remote_control_settings' as any) as any)
          .insert(row);
        if (error) throw error;
      }

      setSettings(newSettings);
      return true;
    } catch (err) {
      console.error('Failed to save remote settings:', err);
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
      return false;
    }
  }, [childId, toast]);

  return { settings, setSettings, saveSettings, loading, DEFAULT_SETTINGS };
}

/**
 * Hook for CHILD side: subscribes to real-time changes from parent's remote control.
 * Returns the latest settings and auto-updates when parent changes them.
 */
export function useRemoteControlSettingsChild(childId: string | null) {
  const [settings, setSettings] = useState<RemoteControlSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    (supabase.from('remote_control_settings' as any) as any)
      .select('*')
      .eq('child_id', childId)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setSettings(dbRowToSettings(data));
        }
        setLoading(false);
      });
  }, [childId]);

  // Real-time subscription
  useEffect(() => {
    if (!childId) return;

    const channel = supabase
      .channel(`remote-control-${childId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'remote_control_settings',
          filter: `child_id=eq.${childId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'child_id' in payload.new) {
            setSettings(dbRowToSettings(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);

  return { settings, loading };
}

export { DEFAULT_SETTINGS };
