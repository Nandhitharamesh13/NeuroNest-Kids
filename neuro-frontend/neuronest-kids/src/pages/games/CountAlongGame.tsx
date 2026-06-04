import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GuideMascot } from '@/components/GuideMascot';
import { VoiceButton } from '@/components/VoiceButton';
import { GameFinishScreen } from '@/components/GameFinishScreen';
import { GameAIIndicator } from '@/components/GameAIIndicator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { cn } from '@/lib/utils';
import { ArrowLeft, Star, RotateCcw, Clock, Sparkles } from 'lucide-react';

const TOTAL_ROUNDS = 8;

interface CountQuestion {
  emoji: string;
  count: number;
  options: number[];
}

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  timestamp: number;
  responseTimeMs: number;
}

const ITEMS = [
  { emoji: '🍎', bg: 'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30' },
  { emoji: '🌟', bg: 'from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-800/30' },
  { emoji: '🐶', bg: 'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30' },
  { emoji: '🦋', bg: 'from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30' },
  { emoji: '🎈', bg: 'from-rose-100 to-red-200 dark:from-rose-900/30 dark:to-red-800/30' },
  { emoji: '🌸', bg: 'from-pink-100 to-rose-200 dark:from-pink-900/30 dark:to-rose-800/30' },
  { emoji: '🐱', bg: 'from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30' },
  { emoji: '🍕', bg: 'from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-800/30' },
  { emoji: '🚗', bg: 'from-blue-100 to-sky-200 dark:from-blue-900/30 dark:to-sky-800/30' },
  { emoji: '⚽', bg: 'from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30' },
];

function generateQuestion(usedCounts: number[]): CountQuestion {
  const itemData = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  let count: number;
  do {
    count = Math.floor(Math.random() * 10) + 1;
  } while (usedCounts.includes(count) && usedCounts.length < 10);
  
  const options = [count];
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 5) - 2;
    const option = Math.max(1, count + offset);
    if (!options.includes(option)) {
      options.push(option);
    }
  }
  
  return {
    emoji: itemData.emoji,
    count,
    options: options.sort(() => Math.random() - 0.5),
  };
}

export default function CountAlongGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();
  
  // Adaptive AI
  const {
    encouragement,
    hint,
    isLoading: aiLoading,
    trackCorrect,
    trackWrong,
    updateStats,
    adjustDifficulty,
    clearMessages,
    behaviorProfile,
    aiTrace,
  } = useAdaptiveAI(childId);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<CountQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [usedCounts, setUsedCounts] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  
  // Time tracking
  const gameStartTime = useRef<number>(Date.now());
  const questionStartTime = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect - FIXED: stops when game is complete
  useEffect(() => {
    if (gameComplete) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - gameStartTime.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateRound = useCallback(() => {
    const newQ = generateQuestion(usedCounts);
    setQuestion(newQ);
    setUsedCounts(prev => [...prev, newQ.count]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    questionStartTime.current = Date.now();
  }, [usedCounts]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'counting');
      adjustDifficulty({
        gameType: 'counting',
        score,
        correctAnswers,
        wrongAnswers: TOTAL_ROUNDS - correctAnswers,
        totalQuestions: TOTAL_ROUNDS,
      });
    }
  }, [gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert([{
        child_id: childId,
        game_type: 'counting',
        score,
        correct_answers: correctAnswers,
        wrong_answers: TOTAL_ROUNDS - correctAnswers,
        total_questions: TOTAL_ROUNDS,
        max_streak: maxStreak,
        mistakes: mistakes as any,
        duration_seconds: Math.floor((Date.now() - gameStartTime.current) / 1000),
      }]);
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null || !question) return;
    
    const responseTime = Date.now() - questionStartTime.current;
    playClick();
    setSelectedAnswer(answer);
    const correct = answer === question.count;
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      setScore(prev => prev + 10 + streak * 2);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setConsecutiveWrong(0);
      setShowCelebration(true);
      trackCorrect();
      
      setTimeout(() => {
        setShowCelebration(false);
        if (round >= TOTAL_ROUNDS) {
          playComplete();
          setGameComplete(true);
        } else {
          setRound(prev => prev + 1);
          generateRound();
        }
      }, 1200);
    } else {
      playWrong();
      setStreak(0);
      setConsecutiveWrong(prev => prev + 1);
      const mistake: Mistake = {
        question: `How many ${question.emoji}?`,
        correctAnswer: String(question.count),
        userAnswer: String(answer),
        category: 'counting',
        timestamp: Date.now(),
        responseTimeMs: responseTime,
      };
      setMistakes(prev => [...prev, mistake]);
      
      trackWrong({
        gameType: 'counting',
        score,
        correctAnswers,
        wrongAnswers: mistakes.length + 1,
        totalQuestions: round,
        responseTimeMs: responseTime,
        consecutiveWrong: consecutiveWrong + 1,
      });
      
      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          playComplete();
          setGameComplete(true);
        } else {
          setRound(prev => prev + 1);
          generateRound();
        }
      }, 1500);
    }
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setCorrectAnswers(0);
    setStreak(0);
    setMaxStreak(0);
    setConsecutiveWrong(0);
    setGameComplete(false);
    setUsedCounts([]);
    setMistakes([]);
    gameStartTime.current = Date.now();
    generateRound();
  };

  if (!question) return null;

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  const totalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-900 dark:to-fuchsia-950 flex items-center justify-center p-4 page-enter">
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
          <div className="relative">
            <div className="text-7xl mb-4 animate-bounce">🧮</div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Counting Champion!
          </h1>
          <p className="text-muted-foreground mb-6">You counted everything perfectly!</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                className={cn(
                  "w-12 h-12 transition-all drop-shadow-lg",
                  i <= stars ? "text-yellow-400 fill-yellow-400 star-spin" : "text-muted"
                )}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 rounded-2xl p-4 shadow-inner">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{score}</div>
              <div className="text-sm text-muted-foreground font-medium">Score</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-2xl p-4 shadow-inner">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
              <div className="text-sm text-muted-foreground font-medium">Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-2xl p-4 shadow-inner">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{formatTime(totalTime)}</div>
              <div className="text-sm text-muted-foreground font-medium">Time</div>
            </div>
            <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50 rounded-2xl p-4 shadow-inner">
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{maxStreak}</div>
              <div className="text-sm text-muted-foreground font-medium">Best Streak</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/game-hub/${childId}`)} className="flex-1 h-12 rounded-2xl">
              Back
            </Button>
            <Button onClick={resetGame} className="flex-1 gap-2 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-900 dark:to-fuchsia-950 overflow-hidden page-enter">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/game-hub/${childId}`)} className="gap-2 rounded-2xl">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedTime)}
          </div>
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
            {round}/{TOTAL_ROUNDS}
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full font-bold text-sm animate-pulse">
              🔥 {streak}
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 px-4 py-2 rounded-full shadow-sm">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-foreground">{score}</span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto">
          <div className="h-3 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Question */}
        <div className="text-center mb-6">
          <p className="font-display text-2xl text-foreground mb-6 flex items-center justify-center gap-2">
            <span className="text-4xl">{question.emoji}</span>
            How many do you see?
          </p>
          
          {/* Items display - ENHANCED */}
          <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: question.count }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-white/50 animate-bounce gpu-accelerated"
                  style={{ animationDelay: `${i * 0.08}s`, animationDuration: '1s' }}
                >
                  <span className="text-3xl drop-shadow-sm">{question.emoji}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Count each {question.emoji} carefully!
            </div>
          </div>
        </div>

        {/* Answer options - ENHANCED */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {question.options.map((option, idx) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={cn(
                "relative p-6 rounded-3xl text-4xl font-bold transition-all duration-300 gpu-accelerated",
                "border-2 shadow-lg hover:shadow-xl",
                "transform hover:scale-[1.02] active:scale-[0.98]",
                selectedAnswer === option
                  ? isCorrect
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-300 scale-105"
                    : "bg-gradient-to-br from-rose-400 to-red-500 text-white border-rose-300 shake"
                  : selectedAnswer !== null && option === question.count
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-violet-400",
                "shadow-[0_6px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_0_rgba(0,0,0,0.1)]",
                "active:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-1"
              )}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {option}
              {selectedAnswer === option && isCorrect && (
                <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-300 animate-spin" />
              )}
            </button>
          ))}
        </div>

        {/* Mascot feedback */}
        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? "Amazing counting! You got it! 🎉"
                : isCorrect === false
                ? `The answer was ${question.count}! Keep going!`
                : "Count each one and pick the number!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-8xl celebrate">⭐</div>
        </div>
      )}

      {/* AI Indicator Button */}
      <GameAIIndicator
        behaviorProfile={behaviorProfile}
        aiTrace={aiTrace}
        consecutiveWrong={consecutiveWrong}
        currentStreak={streak}
      />

      {/* Adaptive AI Feedback */}
      <AdaptiveAIFeedback
        encouragement={encouragement}
        hint={hint}
        isLoading={aiLoading}
        onDismiss={clearMessages}
      />
    </div>
  );
}
