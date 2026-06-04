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
import { ArrowLeft, Star, RotateCcw, Clock, Scale, Sparkles, ChevronLeft, ChevronRight, Equal } from 'lucide-react';

const TOTAL_ROUNDS = 8;

type QuestionType = 'more' | 'less' | 'equal' | 'greater_than' | 'less_than';

interface CompareQuestion {
  leftEmoji: string;
  rightEmoji: string;
  leftCount: number;
  rightCount: number;
  questionType: QuestionType;
  leftColor: string;
  rightColor: string;
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
  { emoji: '🍎', color: 'from-red-400 to-red-500' },
  { emoji: '🌟', color: 'from-yellow-400 to-amber-500' },
  { emoji: '🐶', color: 'from-amber-400 to-orange-500' },
  { emoji: '🦋', color: 'from-purple-400 to-pink-500' },
  { emoji: '🎈', color: 'from-rose-400 to-red-500' },
  { emoji: '🌸', color: 'from-pink-400 to-rose-500' },
  { emoji: '🐱', color: 'from-orange-400 to-amber-500' },
  { emoji: '🍕', color: 'from-amber-400 to-yellow-500' },
  { emoji: '🚗', color: 'from-blue-400 to-sky-500' },
  { emoji: '⚽', color: 'from-green-400 to-emerald-500' },
  { emoji: '🎂', color: 'from-pink-400 to-fuchsia-500' },
  { emoji: '🍩', color: 'from-amber-400 to-orange-500' },
];

const QUESTION_TYPES: QuestionType[] = ['more', 'less', 'equal', 'greater_than', 'less_than'];

function generateQuestion(): CompareQuestion {
  const leftItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  let rightItem = leftItem;
  while (rightItem.emoji === leftItem.emoji) {
    rightItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  }
  
  const questionType = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
  const leftCount = Math.floor(Math.random() * 6) + 1;
  let rightCount: number;
  
  if (questionType === 'equal') {
    rightCount = leftCount;
  } else if (questionType === 'more' || questionType === 'greater_than') {
    rightCount = Math.max(1, leftCount - Math.floor(Math.random() * 3) - 1);
  } else {
    rightCount = leftCount + Math.floor(Math.random() * 3) + 1;
  }
  
  return { 
    leftEmoji: leftItem.emoji, 
    rightEmoji: rightItem.emoji, 
    leftCount, 
    rightCount, 
    questionType,
    leftColor: leftItem.color,
    rightColor: rightItem.color,
  };
}

function getQuestionText(type: QuestionType): { main: string; hint: string; icon: React.ReactNode } {
  switch (type) {
    case 'more':
      return { main: 'Which has MORE?', hint: 'Find the bigger group', icon: <ChevronRight className="w-6 h-6" /> };
    case 'less':
      return { main: 'Which has LESS?', hint: 'Find the smaller group', icon: <ChevronLeft className="w-6 h-6" /> };
    case 'equal':
      return { main: 'Which has MORE?', hint: 'Compare the groups', icon: <ChevronRight className="w-6 h-6" /> };
    case 'greater_than':
      return { main: 'Which is GREATER?', hint: 'Greater means more', icon: <ChevronRight className="w-6 h-6" /> };
    case 'less_than':
      return { main: 'Which is LESSER?', hint: 'Lesser means fewer', icon: <ChevronLeft className="w-6 h-6" /> };
    default:
      return { main: 'Compare!', hint: '', icon: null };
  }
}

export default function CompareItemsGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();

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
  const [question, setQuestion] = useState<CompareQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<'left' | 'right' | 'equal' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const gameStartTime = useRef<number>(Date.now());
  const questionStartTime = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer - FIXED: stops when game is complete
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
    setQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsCorrect(null);
    questionStartTime.current = Date.now();
  }, []);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'comparing');
      adjustDifficulty({
        gameType: 'comparing',
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
        game_type: 'comparing',
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

  const getCorrectAnswer = (): 'left' | 'right' | 'equal' => {
    if (!question) return 'equal';
    
    if (question.questionType === 'more' || question.questionType === 'greater_than') {
      if (question.leftCount > question.rightCount) return 'left';
      if (question.rightCount > question.leftCount) return 'right';
      return 'equal';
    }
    
    if (question.questionType === 'less' || question.questionType === 'less_than') {
      if (question.leftCount < question.rightCount) return 'left';
      if (question.rightCount < question.leftCount) return 'right';
      return 'equal';
    }
    
    if (question.leftCount === question.rightCount) return 'equal';
    if (question.leftCount > question.rightCount) return 'left';
    return 'right';
  };

  const getAnswerLabel = (answer: 'left' | 'right' | 'equal'): string => {
    if (!question) return '';
    switch (answer) {
      case 'left': return `Left (${question.leftCount})`;
      case 'right': return `Right (${question.rightCount})`;
      case 'equal': return 'Same';
    }
  };

  const handleAnswer = (answer: 'left' | 'right' | 'equal') => {
    if (selectedAnswer !== null || !question) return;
    
    const responseTime = Date.now() - questionStartTime.current;
    playClick();
    setSelectedAnswer(answer);
    const correctAnswer = getCorrectAnswer();
    const correct = answer === correctAnswer;
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
    } else {
      playWrong();
      setStreak(0);
      setConsecutiveWrong(prev => prev + 1);
      const mistake: Mistake = {
        question: getQuestionText(question.questionType).main,
        correctAnswer: getAnswerLabel(correctAnswer),
        userAnswer: getAnswerLabel(answer),
        category: 'comparing',
        timestamp: Date.now(),
        responseTimeMs: responseTime,
      };
      setMistakes(prev => [...prev, mistake]);
      
      trackWrong({
        gameType: 'comparing',
        score,
        correctAnswers,
        wrongAnswers: mistakes.length + 1,
        totalQuestions: round,
        responseTimeMs: responseTime,
        consecutiveWrong: consecutiveWrong + 1,
      });
    }
    
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
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setCorrectAnswers(0);
    setStreak(0);
    setMaxStreak(0);
    setConsecutiveWrong(0);
    setGameComplete(false);
    setMistakes([]);
    gameStartTime.current = Date.now();
    generateRound();
  };

  if (!question) return null;

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  const totalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);
  const correctAnswer = getCorrectAnswer();
  const questionInfo = getQuestionText(question.questionType);

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 dark:from-teal-950 dark:via-cyan-900 dark:to-sky-950 flex items-center justify-center p-4 page-enter">
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
          <div className="relative">
            <div className="text-7xl mb-4">⚖️</div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Compare Champion!
          </h1>
          <p className="text-muted-foreground mb-6">You mastered comparing numbers!</p>
          
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
            <div className="bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 rounded-2xl p-4 shadow-inner">
              <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{score}</div>
              <div className="text-sm text-muted-foreground font-medium">Score</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-2xl p-4 shadow-inner">
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
            <Button onClick={resetGame} className="flex-1 gap-2 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 dark:from-teal-950 dark:via-cyan-900 dark:to-sky-950 overflow-hidden page-enter">
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
      <div className="px-4 mb-4">
        <div className="max-w-lg mx-auto">
          <div className="h-3 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Question Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg mb-2">
            <Scale className="w-6 h-6 text-teal-500" />
            <span className="font-display text-2xl font-bold text-foreground">{questionInfo.main}</span>
          </div>
          <p className="text-sm text-muted-foreground">{questionInfo.hint}</p>
        </div>

        {/* Comparison display - ENHANCED */}
        <div className="grid grid-cols-3 gap-3 mb-6 items-stretch">
          {/* Left side */}
          <button
            onClick={() => handleAnswer('left')}
            disabled={selectedAnswer !== null}
            className={cn(
              "bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-4 shadow-xl transition-all duration-300 gpu-accelerated",
              "border-3 flex flex-col items-center justify-center min-h-[180px]",
              "hover:scale-[1.02] hover:shadow-2xl",
              selectedAnswer === 'left'
                ? isCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 scale-105"
                  : "border-rose-400 bg-rose-50 dark:bg-rose-900/30 shake"
                : selectedAnswer !== null && correctAnswer === 'left'
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-transparent hover:border-teal-300",
            )}
          >
            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              {Array.from({ length: question.leftCount }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
                    question.leftColor
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-xl drop-shadow-sm">{question.leftEmoji}</span>
                </div>
              ))}
            </div>
            <div className="text-3xl font-bold text-foreground">{question.leftCount}</div>
            <div className="text-xs text-muted-foreground mt-1">LEFT</div>
          </button>

          {/* Middle - comparison symbols */}
          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => handleAnswer('equal')}
              disabled={selectedAnswer !== null}
              className={cn(
                "w-16 h-16 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 gpu-accelerated",
                "border-2 flex flex-col items-center justify-center",
                "hover:scale-105 hover:shadow-xl",
                selectedAnswer === 'equal'
                  ? isCorrect
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 scale-110"
                    : "border-rose-400 bg-rose-50 dark:bg-rose-900/30 shake"
                  : selectedAnswer !== null && correctAnswer === 'equal'
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                  : "border-transparent hover:border-teal-300",
              )}
            >
              <Equal className="w-6 h-6 text-teal-600" />
              <span className="text-[10px] font-semibold text-muted-foreground">SAME</span>
            </button>
            
            <div className="text-center text-xs text-muted-foreground space-y-1 bg-white/50 dark:bg-black/20 rounded-xl p-2">
              <div className="flex items-center gap-1">
                <span className="text-lg">{'>'}</span>
                <span>Greater</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">{'<'}</span>
                <span>Less</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <button
            onClick={() => handleAnswer('right')}
            disabled={selectedAnswer !== null}
            className={cn(
              "bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-4 shadow-xl transition-all duration-300 gpu-accelerated",
              "border-3 flex flex-col items-center justify-center min-h-[180px]",
              "hover:scale-[1.02] hover:shadow-2xl",
              selectedAnswer === 'right'
                ? isCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 scale-105"
                  : "border-rose-400 bg-rose-50 dark:bg-rose-900/30 shake"
                : selectedAnswer !== null && correctAnswer === 'right'
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-transparent hover:border-teal-300",
            )}
          >
            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              {Array.from({ length: question.rightCount }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
                    question.rightColor
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-xl drop-shadow-sm">{question.rightEmoji}</span>
                </div>
              ))}
            </div>
            <div className="text-3xl font-bold text-foreground">{question.rightCount}</div>
            <div className="text-xs text-muted-foreground mt-1">RIGHT</div>
          </button>
        </div>

        {/* Mascot feedback */}
        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? "Excellent comparing! 🎉"
                : isCorrect === false
                ? `The answer was ${getAnswerLabel(correctAnswer)}!`
                : "Which side matches the question? Tap to answer!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-8xl celebrate">⚖️</div>
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
