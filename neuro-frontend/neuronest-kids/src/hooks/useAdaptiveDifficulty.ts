import { useState, useCallback, useMemo } from 'react';

/**
 * Adaptive Difficulty Hook
 * 
 * This hook manages AI-driven difficulty adaptation for games.
 * It splits questions into 7 EASY + 3 HARD tiers and dynamically
 * selects which tier to use based on child's performance.
 * 
 * The AI adapts by:
 * 1. Starting with easy questions (first 5 are always easy)
 * 2. If accuracy > 80% after 5 questions, introduce hard questions
 * 3. If child struggles (accuracy < 50%), stay on easy questions
 * 4. Track consecutive correct/wrong to adjust in real-time
 */

export interface DifficultyConfig {
  easyQuestionCount: number;  // Default 7
  hardQuestionCount: number;  // Default 3
  totalQuestions: number;     // Default 10
  easyThreshold: number;      // Accuracy % to stay on easy (default 50)
  hardThreshold: number;      // Accuracy % to unlock hard (default 80)
}

interface DifficultyState {
  currentDifficulty: 'easy' | 'hard';
  questionsAnswered: number;
  correctAnswers: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  easyQuestionsUsed: number;
  hardQuestionsUsed: number;
  currentAccuracy: number;
  shouldShowHard: boolean;
}

const defaultConfig: DifficultyConfig = {
  easyQuestionCount: 7,
  hardQuestionCount: 3,
  totalQuestions: 10,
  easyThreshold: 50,
  hardThreshold: 80,
};

export function useAdaptiveDifficulty(config: Partial<DifficultyConfig> = {}) {
  const settings = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<DifficultyState>({
    currentDifficulty: 'easy',
    questionsAnswered: 0,
    correctAnswers: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    easyQuestionsUsed: 0,
    hardQuestionsUsed: 0,
    currentAccuracy: 0,
    shouldShowHard: false,
  });

  // Calculate if we should show hard questions based on performance
  const calculateShouldShowHard = useCallback((newState: DifficultyState): boolean => {
    const { questionsAnswered, correctAnswers, easyQuestionsUsed, hardQuestionsUsed } = newState;
    
    // Always start with easy questions (first 5)
    if (questionsAnswered < 5) return false;
    
    // Don't show hard if we've used all hard questions
    if (hardQuestionsUsed >= settings.hardQuestionCount) return false;
    
    // Don't show hard if we've run out of easy questions and need to fill with hard
    const remainingQuestions = settings.totalQuestions - questionsAnswered;
    const remainingHard = settings.hardQuestionCount - hardQuestionsUsed;
    if (remainingQuestions <= remainingHard) return true;
    
    // Calculate current accuracy
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    
    // If doing very well (>80%), show hard questions
    if (accuracy >= settings.hardThreshold) {
      // Show hard question every 2-3 questions when doing well
      return (questionsAnswered - 5) % 2 === 0;
    }
    
    // If struggling (<50%), keep on easy
    if (accuracy < settings.easyThreshold) return false;
    
    // Medium performance: occasionally show hard (every 3rd question after #5)
    return (questionsAnswered >= 7 && (questionsAnswered - 5) % 3 === 0);
  }, [settings]);

  // Get the current question difficulty
  const getQuestionDifficulty = useCallback((): 'easy' | 'hard' => {
    return state.shouldShowHard ? 'hard' : 'easy';
  }, [state.shouldShowHard]);

  // Record a correct answer
  const recordCorrect = useCallback(() => {
    setState(prev => {
      const newState: DifficultyState = {
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + 1,
        consecutiveCorrect: prev.consecutiveCorrect + 1,
        consecutiveWrong: 0,
        easyQuestionsUsed: prev.currentDifficulty === 'easy' ? prev.easyQuestionsUsed + 1 : prev.easyQuestionsUsed,
        hardQuestionsUsed: prev.currentDifficulty === 'hard' ? prev.hardQuestionsUsed + 1 : prev.hardQuestionsUsed,
        currentAccuracy: ((prev.correctAnswers + 1) / (prev.questionsAnswered + 1)) * 100,
        currentDifficulty: prev.currentDifficulty,
        shouldShowHard: false,
      };
      newState.shouldShowHard = calculateShouldShowHard(newState);
      newState.currentDifficulty = newState.shouldShowHard ? 'hard' : 'easy';
      return newState;
    });
  }, [calculateShouldShowHard]);

  // Record a wrong answer
  const recordWrong = useCallback(() => {
    setState(prev => {
      const newState: DifficultyState = {
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        consecutiveCorrect: 0,
        consecutiveWrong: prev.consecutiveWrong + 1,
        easyQuestionsUsed: prev.currentDifficulty === 'easy' ? prev.easyQuestionsUsed + 1 : prev.easyQuestionsUsed,
        hardQuestionsUsed: prev.currentDifficulty === 'hard' ? prev.hardQuestionsUsed + 1 : prev.hardQuestionsUsed,
        currentAccuracy: (prev.correctAnswers / (prev.questionsAnswered + 1)) * 100,
        correctAnswers: prev.correctAnswers,
        currentDifficulty: prev.currentDifficulty,
        shouldShowHard: false,
      };
      
      // If struggling (3+ wrong in a row), force easy mode
      if (newState.consecutiveWrong >= 3) {
        newState.shouldShowHard = false;
        newState.currentDifficulty = 'easy';
      } else {
        newState.shouldShowHard = calculateShouldShowHard(newState);
        newState.currentDifficulty = newState.shouldShowHard ? 'hard' : 'easy';
      }
      
      return newState;
    });
  }, [calculateShouldShowHard]);

  // Reset for new game
  const reset = useCallback(() => {
    setState({
      currentDifficulty: 'easy',
      questionsAnswered: 0,
      correctAnswers: 0,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      easyQuestionsUsed: 0,
      hardQuestionsUsed: 0,
      currentAccuracy: 0,
      shouldShowHard: false,
    });
  }, []);

  // AI difficulty recommendation based on current state
  const aiRecommendation = useMemo(() => {
    const { currentAccuracy, consecutiveWrong, consecutiveCorrect, questionsAnswered } = state;
    
    if (questionsAnswered < 3) {
      return { level: 'warming_up', message: 'Starting with easy questions...' };
    }
    
    if (consecutiveWrong >= 3) {
      return { level: 'needs_support', message: 'Keeping questions simple for confidence' };
    }
    
    if (consecutiveCorrect >= 5) {
      return { level: 'excelling', message: 'Great streak! Adding challenge!' };
    }
    
    if (currentAccuracy >= 80) {
      return { level: 'doing_great', message: 'Excellent! Mixing in harder questions' };
    }
    
    if (currentAccuracy >= 60) {
      return { level: 'good_progress', message: 'Nice progress! Building skills' };
    }
    
    if (currentAccuracy >= 40) {
      return { level: 'building', message: 'Learning! Focusing on core concepts' };
    }
    
    return { level: 'supporting', message: 'Extra practice with basics' };
  }, [state]);

  return {
    state,
    getQuestionDifficulty,
    recordCorrect,
    recordWrong,
    reset,
    aiRecommendation,
    currentDifficulty: state.currentDifficulty,
    currentAccuracy: state.currentAccuracy,
    questionsAnswered: state.questionsAnswered,
  };
}

/**
 * Helper function to split questions into easy/hard pools
 * Use this when setting up game questions
 */
export function splitQuestionsByDifficulty<T extends { difficulty?: 'easy' | 'hard' }>(
  questions: T[],
  easyCount: number = 7,
  hardCount: number = 3
): { easy: T[]; hard: T[] } {
  // If questions already have difficulty, use that
  const hasExplicitDifficulty = questions.some(q => q.difficulty);
  
  if (hasExplicitDifficulty) {
    return {
      easy: questions.filter(q => q.difficulty === 'easy' || !q.difficulty).slice(0, easyCount),
      hard: questions.filter(q => q.difficulty === 'hard').slice(0, hardCount),
    };
  }
  
  // Otherwise, shuffle and split
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return {
    easy: shuffled.slice(0, easyCount),
    hard: shuffled.slice(easyCount, easyCount + hardCount),
  };
}
