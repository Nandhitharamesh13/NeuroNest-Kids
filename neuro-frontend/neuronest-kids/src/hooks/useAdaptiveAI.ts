import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameData {
  gameType: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  responseTimeMs?: number;
  consecutiveWrong?: number;
  currentStreak?: number;
  sessionDuration?: number;
}

interface BehaviorProfile {
  preferred_pace: string;
  attention_span_minutes: number;
  prefers_sounds: boolean;
  prefers_animations: boolean;
  average_accuracy: number;
  frustration_threshold: number;
  current_difficulty_level: number;
  strong_categories: string[];
  challenging_categories: string[];
}

interface AdaptiveState {
  consecutiveWrong: number;
  currentStreak: number;
  sessionStartTime: number;
  lastResponseTime: number;
  totalResponseTime: number;
  responseCount: number;
}

interface RealTimeSupport {
  shouldShowHint: boolean;
  shouldSlowPace: boolean;
  shouldTakeBreak: boolean;
  encouragementMessage?: string;
  uiAdjustments?: {
    reduceAnimations?: boolean;
    increaseTiming?: boolean;
    showVisualCues?: boolean;
  };
}

type AdaptiveAIEvent = {
  ts: number;
  action: string;
  childId?: string;
  request: unknown;
  result: unknown;
  error?: string;
};

const AI_EVENT_NAME = 'neuronest:adaptive-ai';

export function useAdaptiveAI(childId: string | undefined) {
  const { toast } = useToast();
  const [behaviorProfile, setBehaviorProfile] = useState<BehaviorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [realTimeSupport, setRealTimeSupport] = useState<RealTimeSupport | null>(null);
  const [aiTrace, setAiTrace] = useState<AdaptiveAIEvent[]>([]);
  
  const adaptiveState = useRef<AdaptiveState>({
    consecutiveWrong: 0,
    currentStreak: 0,
    sessionStartTime: Date.now(),
    lastResponseTime: 0,
    totalResponseTime: 0,
    responseCount: 0,
  });

  // Fetch or create behavior profile using raw query since types aren't regenerated
  useEffect(() => {
    if (!childId) return;
    
    const fetchProfile = async () => {
      try {
        // Use any type since the table is new and types aren't regenerated
        const { data, error } = await supabase
          .from('child_behavior_profiles' as any)
          .select('*')
          .eq('child_id', childId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching behavior profile:', error);
          // If table doesn't exist in types yet, use defaults
          setBehaviorProfile({
            preferred_pace: 'normal',
            attention_span_minutes: 10,
            prefers_sounds: true,
            prefers_animations: true,
            average_accuracy: 0,
            frustration_threshold: 3,
            current_difficulty_level: 1,
            strong_categories: [],
            challenging_categories: [],
          });
          return;
        }
        
        if (data) {
          const profile = data as any;
          setBehaviorProfile({
            preferred_pace: profile.preferred_pace || 'normal',
            attention_span_minutes: profile.attention_span_minutes || 10,
            prefers_sounds: profile.prefers_sounds ?? true,
            prefers_animations: profile.prefers_animations ?? true,
            average_accuracy: Number(profile.average_accuracy) || 0,
            frustration_threshold: profile.frustration_threshold || 3,
            current_difficulty_level: profile.current_difficulty_level || 1,
            strong_categories: (profile.strong_categories as string[]) || [],
            challenging_categories: (profile.challenging_categories as string[]) || [],
          });
        } else {
          // Create new profile
          const { error: insertError } = await supabase
            .from('child_behavior_profiles' as any)
            .insert({ child_id: childId } as any);
          
          if (!insertError) {
            setBehaviorProfile({
              preferred_pace: 'normal',
              attention_span_minutes: 10,
              prefers_sounds: true,
              prefers_animations: true,
              average_accuracy: 0,
              frustration_threshold: 3,
              current_difficulty_level: 1,
              strong_categories: [],
              challenging_categories: [],
            });
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        // Use defaults on error
        setBehaviorProfile({
          preferred_pace: 'normal',
          attention_span_minutes: 10,
          prefers_sounds: true,
          prefers_animations: true,
          average_accuracy: 0,
          frustration_threshold: 3,
          current_difficulty_level: 1,
          strong_categories: [],
          challenging_categories: [],
        });
      }
    };
    
    fetchProfile();
  }, [childId]);

  const callAdaptiveAI = useCallback(async (action: string, gameData: Partial<GameData>, currentQuestion?: any) => {
    if (!childId) return null;
    const requestPayload = {
      action,
      childId,
      gameData: {
        ...gameData,
        consecutiveWrong: adaptiveState.current.consecutiveWrong,
        currentStreak: adaptiveState.current.currentStreak,
        sessionDuration: Math.round((Date.now() - adaptiveState.current.sessionStartTime) / 60000),
      },
      behaviorProfile,
      currentQuestion,
    };
    
    try {
      const { data, error } = await supabase.functions.invoke('adaptive-ai-helper', {
        body: {
          ...requestPayload,
        },
      });
      
      if (error) throw error;

      const result = data?.result;
      const evt: AdaptiveAIEvent = {
        ts: Date.now(),
        action,
        childId,
        request: requestPayload,
        result,
      };
      setAiTrace((prev) => [evt, ...prev].slice(0, 20));
      try {
        window.dispatchEvent(new CustomEvent(AI_EVENT_NAME, { detail: evt }));
      } catch {
        // ignore
      }
      // Developer visibility in console (non-fatal)
      console.debug('[AdaptiveAI]', action, result);
      return result;
    } catch (error) {
      console.error('Adaptive AI error:', error);

      const evt: AdaptiveAIEvent = {
        ts: Date.now(),
        action,
        childId,
        request: requestPayload,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setAiTrace((prev) => [evt, ...prev].slice(0, 20));
      try {
        window.dispatchEvent(new CustomEvent(AI_EVENT_NAME, { detail: evt }));
      } catch {
        // ignore
      }
      return null;
    }
  }, [childId, behaviorProfile]);

  // Track correct answer
  const trackCorrect = useCallback(() => {
    adaptiveState.current.consecutiveWrong = 0;
    adaptiveState.current.currentStreak += 1;
    setEncouragement(null);
    setHint(null);
  }, []);

  // Track wrong answer and get encouragement if needed
  const trackWrong = useCallback(async (gameData: Partial<GameData>) => {
    adaptiveState.current.consecutiveWrong += 1;
    adaptiveState.current.currentStreak = 0;
    
    const threshold = behaviorProfile?.frustration_threshold || 3;
    
    if (adaptiveState.current.consecutiveWrong >= threshold) {
      setIsLoading(true);
      const result = await callAdaptiveAI('get_encouragement', gameData);
      if (result) {
        setEncouragement(result);
      }
      setIsLoading(false);
    }
  }, [behaviorProfile, callAdaptiveAI]);

  // Request a hint
  const requestHint = useCallback(async (gameData: Partial<GameData>, currentQuestion: any) => {
    setIsLoading(true);
    const result = await callAdaptiveAI('generate_hint', gameData, currentQuestion);
    if (result) {
      setHint(result);
    }
    setIsLoading(false);
  }, [callAdaptiveAI]);

  // Check if real-time support is needed
  const checkRealTimeSupport = useCallback(async (gameData: Partial<GameData>) => {
    const result = await callAdaptiveAI('real_time_support', gameData);
    if (result && typeof result === 'object') {
      setRealTimeSupport(result as RealTimeSupport);
      
      if ((result as RealTimeSupport).shouldTakeBreak) {
        toast({
          title: "Break Time? 🌟",
          description: "You're doing great! Want to take a short break?",
          duration: 5000,
        });
      }
    }
  }, [callAdaptiveAI, toast]);

  // Get session summary at end of game
  const getSessionSummary = useCallback(async (gameData: Partial<GameData>) => {
    setIsLoading(true);
    const result = await callAdaptiveAI('session_summary', gameData);
    setIsLoading(false);
    return result;
  }, [callAdaptiveAI]);

  // Adjust difficulty based on performance
  const adjustDifficulty = useCallback(async (gameData: Partial<GameData>) => {
    const result = await callAdaptiveAI('adjust_difficulty', gameData);
    
    if (result && typeof result === 'object' && 'newDifficulty' in result) {
      const adjustmentResult = result as { newDifficulty: number; recommendedPace: string };
      // Update profile in database
      if (childId) {
        await supabase
          .from('child_behavior_profiles' as any)
          .update({
            current_difficulty_level: adjustmentResult.newDifficulty,
            preferred_pace: adjustmentResult.recommendedPace === 'slower' ? 'slow' : 
                           adjustmentResult.recommendedPace === 'faster' ? 'fast' : 'normal',
          } as any)
          .eq('child_id', childId);
      }
      return result;
    }
    return null;
  }, [callAdaptiveAI, childId]);

  // Update accuracy stats
  const updateStats = useCallback(async (correctAnswers: number, totalQuestions: number, gameType: string) => {
    if (!childId || totalQuestions === 0) return;
    
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    // Fetch current profile to calculate running average
    const { data } = await supabase
      .from('child_behavior_profiles' as any)
      .select('average_accuracy, strong_categories, challenging_categories')
      .eq('child_id', childId)
      .single();
    
    if (!data) return;
    
    const profile = data as any;
    const currentAvg = Number(profile.average_accuracy) || 0;
    const newAvg = currentAvg > 0 ? (currentAvg + accuracy) / 2 : accuracy;
    
    // Update categories based on performance
    let strongCats = (profile.strong_categories as string[]) || [];
    let challengingCats = (profile.challenging_categories as string[]) || [];
    
    if (accuracy >= 80 && !strongCats.includes(gameType)) {
      strongCats = [...strongCats, gameType].slice(-5);
      challengingCats = challengingCats.filter((c: string) => c !== gameType);
    } else if (accuracy < 50 && !challengingCats.includes(gameType)) {
      challengingCats = [...challengingCats, gameType].slice(-5);
      strongCats = strongCats.filter((c: string) => c !== gameType);
    }
    
    await supabase
      .from('child_behavior_profiles' as any)
      .update({
        average_accuracy: newAvg,
        strong_categories: strongCats,
        challenging_categories: challengingCats,
        last_ai_analysis: new Date().toISOString(),
      } as any)
      .eq('child_id', childId);
  }, [childId]);

  // Reset session state
  const resetSession = useCallback(() => {
    adaptiveState.current = {
      consecutiveWrong: 0,
      currentStreak: 0,
      sessionStartTime: Date.now(),
      lastResponseTime: 0,
      totalResponseTime: 0,
      responseCount: 0,
    };
    setEncouragement(null);
    setHint(null);
    setRealTimeSupport(null);
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setEncouragement(null);
    setHint(null);
  }, []);

  return {
    behaviorProfile,
    isLoading,
    encouragement,
    hint,
    realTimeSupport,
    trackCorrect,
    trackWrong,
    requestHint,
    checkRealTimeSupport,
    getSessionSummary,
    adjustDifficulty,
    updateStats,
    resetSession,
    clearMessages,
    consecutiveWrong: adaptiveState.current.consecutiveWrong,
    currentStreak: adaptiveState.current.currentStreak,
    aiTrace,
  };
}

