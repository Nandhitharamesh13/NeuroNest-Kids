import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category?: string;
  timestamp?: number;
  responseTimeMs?: number;
}

interface GameSessionData {
  childId: string;
  gameType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  mistakes: Mistake[];
  maxStreak: number;
  durationSeconds: number;
}

// All game types for comprehensive stats
const ALL_GAME_TYPES = [
  'shapes', 'colors', 'fruits', 'sorting',
  'clock', 'weather', 'numbers', 'letters',
  'emotions', 'memory', 'counting', 'comparing',
  'alphabet', 'vowels', 'consonants', 'kitchen',
  'hometools', 'animals', 'bodyparts', 'music'
];

export function useGameStats() {
  const saveGameSession = useCallback(async (data: GameSessionData) => {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .insert({
          child_id: data.childId,
          game_type: data.gameType,
          score: data.score,
          total_questions: data.totalQuestions,
          correct_answers: data.correctAnswers,
          wrong_answers: data.wrongAnswers,
          mistakes: JSON.parse(JSON.stringify(data.mistakes)),
          max_streak: data.maxStreak,
          duration_seconds: data.durationSeconds,
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error saving game session:', error);
      return { success: false, error };
    }
  }, []);

  const getChildStats = useCallback(async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalGames: 0,
          totalScore: 0,
          averageAccuracy: 0,
          totalMistakes: 0,
          bestStreak: 0,
          totalPlayTime: 0,
          averageResponseTime: 0,
          gameBreakdown: {},
          recentMistakes: [],
          areasToImprove: [],
          mistakeDetails: [],
          performanceOverTime: [],
        };
      }

      const totalGames = data.length;
      const totalScore = data.reduce((sum, s) => sum + s.score, 0);
      const totalCorrect = data.reduce((sum, s) => sum + s.correct_answers, 0);
      const totalQuestions = data.reduce((sum, s) => sum + s.total_questions, 0);
      const totalMistakes = data.reduce((sum, s) => sum + s.wrong_answers, 0);
      const bestStreak = Math.max(...data.map(s => s.max_streak));
      const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const totalPlayTime = data.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

      // Game breakdown for ALL game types
      const gameBreakdown: Record<string, {
        games: number;
        accuracy: number;
        totalScore: number;
        totalTime: number;
        avgTime: number;
        wrongAnswers: number;
      }> = {};

      ALL_GAME_TYPES.forEach(gameType => {
        const gameData = data.filter(s => s.game_type === gameType);
        if (gameData.length > 0) {
          const correct = gameData.reduce((sum, s) => sum + s.correct_answers, 0);
          const total = gameData.reduce((sum, s) => sum + s.total_questions, 0);
          const totalTime = gameData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
          const wrongAnswers = gameData.reduce((sum, s) => sum + s.wrong_answers, 0);

          gameBreakdown[gameType] = {
            games: gameData.length,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
            totalScore: gameData.reduce((sum, s) => sum + s.score, 0),
            totalTime,
            avgTime: gameData.length > 0 ? Math.round(totalTime / gameData.length) : 0,
            wrongAnswers,
          };
        }
      });

      // Collect ALL mistakes with detailed info
      const allMistakes: (Mistake & { gameType: string; sessionDate: string })[] = [];
      data.forEach(session => {
        const mistakes = session.mistakes as unknown as Mistake[] | null;
        if (mistakes && Array.isArray(mistakes)) {
          mistakes.forEach(m => {
            allMistakes.push({
              ...m,
              gameType: session.game_type,
              sessionDate: session.created_at,
            });
          });
        }
      });

      // Calculate average response time from mistakes
      const responseTimes = allMistakes
        .filter(m => m.responseTimeMs)
        .map(m => m.responseTimeMs!);
      const averageResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      // Find areas to improve (most common mistake categories)
      const mistakeCategories: Record<string, number> = {};
      allMistakes.forEach(m => {
        const key = m.category || m.correctAnswer;
        mistakeCategories[key] = (mistakeCategories[key] || 0) + 1;
      });

      const areasToImprove = Object.entries(mistakeCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([area, count]) => ({ area, count }));

      // Performance over time (last 10 sessions)
      const performanceOverTime = data.slice(0, 10).map(session => ({
        date: session.created_at,
        gameType: session.game_type,
        accuracy: session.total_questions > 0
          ? Math.round((session.correct_answers / session.total_questions) * 100)
          : 0,
        score: session.score,
        duration: session.duration_seconds || 0,
      })).reverse();

      return {
        totalGames,
        totalScore,
        averageAccuracy,
        totalMistakes,
        bestStreak,
        totalPlayTime,
        averageResponseTime,
        gameBreakdown,
        recentMistakes: allMistakes.slice(0, 10),
        areasToImprove,
        mistakeDetails: allMistakes,
        performanceOverTime,
      };
    } catch (error) {
      console.error('Error fetching child stats:', error);
      return null;
    }
  }, []);

  return { saveGameSession, getChildStats };
}
