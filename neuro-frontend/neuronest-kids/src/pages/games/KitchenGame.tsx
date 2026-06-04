import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GuideMascot } from '@/components/GuideMascot';
import { GameAIIndicator } from '@/components/GameAIIndicator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { useParentAlertsContext } from '@/contexts/ParentAlertsContext';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { cn } from '@/lib/utils';
import { ArrowLeft, Star, RotateCcw, Clock, ChefHat, Brain } from 'lucide-react';

const TOTAL_ROUNDS = 10;

interface KitchenQuestion {
  item: string;
  emoji: string;
  category: 'utensil' | 'appliance' | 'ingredient' | 'cookware';
  difficulty?: 'easy' | 'hard';
  options: { name: string; emoji: string }[];
}

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  timestamp: number;
  responseTimeMs: number;
}

const KITCHEN_ITEMS = [
  // Easy items (common, recognizable)
  { item: 'Fork', emoji: '🍴', category: 'utensil' as const, difficulty: 'easy' as const },
  { item: 'Spoon', emoji: '🥄', category: 'utensil' as const, difficulty: 'easy' as const },
  { item: 'Plate', emoji: '🍽️', category: 'cookware' as const, difficulty: 'easy' as const },
  { item: 'Cup', emoji: '☕', category: 'cookware' as const, difficulty: 'easy' as const },
  { item: 'Egg', emoji: '🥚', category: 'ingredient' as const, difficulty: 'easy' as const },
  { item: 'Milk', emoji: '🥛', category: 'ingredient' as const, difficulty: 'easy' as const },
  { item: 'Bread', emoji: '🍞', category: 'ingredient' as const, difficulty: 'easy' as const },
  { item: 'Pizza', emoji: '🍕', category: 'ingredient' as const, difficulty: 'easy' as const },
  { item: 'Cake', emoji: '🎂', category: 'ingredient' as const, difficulty: 'easy' as const },
  // Hard items (less common, similar looking)
  { item: 'Knife', emoji: '🔪', category: 'utensil' as const, difficulty: 'hard' as const },
  { item: 'Bowl', emoji: '🥣', category: 'cookware' as const, difficulty: 'hard' as const },
  { item: 'Pan', emoji: '🍳', category: 'cookware' as const, difficulty: 'hard' as const },
  { item: 'Pot', emoji: '🫕', category: 'cookware' as const, difficulty: 'hard' as const },
  { item: 'Blender', emoji: '🧃', category: 'appliance' as const, difficulty: 'hard' as const },
  { item: 'Butter', emoji: '🧈', category: 'ingredient' as const, difficulty: 'hard' as const },
  { item: 'Cheese', emoji: '🧀', category: 'ingredient' as const, difficulty: 'hard' as const },
  { item: 'Salt', emoji: '🧂', category: 'ingredient' as const, difficulty: 'hard' as const },
];

function generateQuestion(usedItems: string[]): KitchenQuestion {
  const available = KITCHEN_ITEMS.filter(i => !usedItems.includes(i.item));
  const target = available.length > 0 
    ? available[Math.floor(Math.random() * available.length)]
    : KITCHEN_ITEMS[Math.floor(Math.random() * KITCHEN_ITEMS.length)];
  
  const options = [{ name: target.item, emoji: target.emoji }];
  while (options.length < 4) {
    const random = KITCHEN_ITEMS[Math.floor(Math.random() * KITCHEN_ITEMS.length)];
    if (!options.find(o => o.name === random.item)) {
      options.push({ name: random.item, emoji: random.emoji });
    }
  }
  
  return {
    item: target.item,
    emoji: target.emoji,
    category: target.category,
    options: options.sort(() => Math.random() - 0.5),
  };
}

export default function KitchenGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();
  const { speak } = useTextToSpeech();
  const { checkForMilestones, checkForStruggles } = useParentAlertsContext();

  const {
    encouragement,
    hint,
    isLoading: aiLoading,
    trackCorrect,
    trackWrong,
    updateStats,
    clearMessages,
    behaviorProfile,
    aiTrace,
    consecutiveWrong,
    currentStreak,
  } = useAdaptiveAI(childId);

  const {
    currentDifficulty,
    recordCorrect: recordDiffCorrect,
    recordWrong: recordDiffWrong,
    aiRecommendation,
    questionsAnswered: diffQuestionsAnswered,
    reset: resetDifficulty,
  } = useAdaptiveDifficulty();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<KitchenQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [usedItems, setUsedItems] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [childName, setChildName] = useState('');

  const gameStartTime = useRef<number>(Date.now());
  const questionStartTime = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (childId) {
      supabase.from('child_profiles').select('name').eq('id', childId).single()
        .then(({ data }) => {
          if (data) setChildName(data.name);
        });
    }
  }, [childId]);

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
    const pool = currentDifficulty === 'hard'
      ? KITCHEN_ITEMS.filter(i => i.difficulty === 'hard' && !usedItems.includes(i.item))
      : KITCHEN_ITEMS.filter(i => i.difficulty === 'easy' && !usedItems.includes(i.item));
    const fallback = KITCHEN_ITEMS.filter(i => !usedItems.includes(i.item));
    const items = pool.length > 0 ? pool : fallback.length > 0 ? fallback : KITCHEN_ITEMS;
    const target = items[Math.floor(Math.random() * items.length)];

    const options = [{ name: target.item, emoji: target.emoji }];
    while (options.length < 4) {
      const random = KITCHEN_ITEMS[Math.floor(Math.random() * KITCHEN_ITEMS.length)];
      if (!options.find(o => o.name === random.item)) {
        options.push({ name: random.item, emoji: random.emoji });
      }
    }

    const newQ: KitchenQuestion = {
      item: target.item,
      emoji: target.emoji,
      category: target.category,
      difficulty: target.difficulty,
      options: options.sort(() => Math.random() - 0.5),
    };
    setQuestion(newQ);
    setUsedItems(prev => [...prev, newQ.item]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    questionStartTime.current = Date.now();
    
    setTimeout(() => {
      speak(`Find the ${newQ.item}!`);
    }, 300);
  }, [usedItems, speak, currentDifficulty]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user && childName) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'kitchen');
      
      const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
      checkForMilestones(childId, childName, 'Kitchen', score, score, accuracy, currentStreak);
    }
  }, [gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert([{
        child_id: childId,
        game_type: 'kitchen',
        score,
        correct_answers: correctAnswers,
        wrong_answers: TOTAL_ROUNDS - correctAnswers,
        total_questions: TOTAL_ROUNDS,
        max_streak: currentStreak,
        mistakes: mistakes as any,
        duration_seconds: Math.floor((Date.now() - gameStartTime.current) / 1000),
      }]);
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null || !question) return;
    
    const responseTime = Date.now() - questionStartTime.current;
    playClick();
    setSelectedAnswer(answer);
    const correct = answer === question.item;
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      speak(`Yes! That's a ${question.item}!`);
      const bonus = question.difficulty === 'hard' ? 5 : 0;
      setScore(prev => prev + 10 + bonus);
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      trackCorrect();
      recordDiffCorrect();
    } else {
      playWrong();
      speak(`That's not it. This is a ${question.item}`);
      const mistake: Mistake = {
        question: `Find the ${question.item}`,
        correctAnswer: question.item,
        userAnswer: answer,
        category: 'kitchen',
        timestamp: Date.now(),
        responseTimeMs: responseTime,
      };
      setMistakes(prev => [...prev, mistake]);
      
      trackWrong({
        gameType: 'kitchen',
        score,
        correctAnswers,
        wrongAnswers: mistakes.length + 1,
        totalQuestions: round,
        responseTimeMs: responseTime,
      });
      recordDiffWrong();

      if (consecutiveWrong >= 2 && childId && childName) {
        const accuracy = round > 0 ? Math.round((correctAnswers / round) * 100) : 0;
        checkForStruggles(childId, childName, 'Kitchen', consecutiveWrong + 1, mistakes.length + 1, accuracy);
      }
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
    }, 1500);
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setCorrectAnswers(0);
    setGameComplete(false);
    setUsedItems([]);
    setMistakes([]);
    gameStartTime.current = Date.now();
    resetDifficulty();
    generateRound();
  };

  if (!question) return null;

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pastel-peach via-background to-pastel-rose flex items-center justify-center p-4 page-enter">
        <div className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-card">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Kitchen Master!</h1>
          <p className="text-muted-foreground mb-6">You know your kitchen items!</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                className={cn(
                  "w-10 h-10 transition-all",
                  i <= stars ? "text-duo-yellow fill-duo-yellow star-spin" : "text-muted"
                )}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold text-foreground">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold text-foreground">{formatTime(elapsedTime)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold text-foreground">{mistakes.length}</div>
              <div className="text-sm text-muted-foreground">Mistakes</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/game-hub/${childId}`)} className="flex-1">
              Back
            </Button>
            <Button onClick={resetGame} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-peach via-background to-pastel-rose overflow-hidden page-enter">
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/game-hub/${childId}`)} className="gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedTime)}
          </div>
          <div className={cn(
            "text-xs px-2 py-1 rounded-full font-bold",
            currentDifficulty === 'hard' ? 'bg-duo-orange/20 text-duo-orange' : 'bg-duo-green/20 text-duo-green'
          )}>
            {currentDifficulty === 'hard' ? '🔥 Challenge' : '📖 Practice'}
          </div>
          <div className="text-sm text-muted-foreground">
            {round}/{TOTAL_ROUNDS}
          </div>
          <div className="flex items-center gap-1 font-bold">
            <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
            {score}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-8">
        {/* Header with chef icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-duo-orange to-duo-red flex items-center justify-center shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <p className="font-display text-2xl text-foreground mb-2">
            Find the {question.item}!
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            Category: {question.category}
          </p>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {question.options.map(option => (
            <button
              key={option.name}
              onClick={() => handleAnswer(option.name)}
              disabled={selectedAnswer !== null}
              className={cn(
                "p-4 rounded-2xl transition-all duration-200 gpu-accelerated flex flex-col items-center gap-2",
                selectedAnswer === option.name
                  ? isCorrect
                    ? "bg-duo-green text-white scale-105 shadow-lg"
                    : "bg-duo-red text-white shake"
                  : selectedAnswer !== null && option.name === question.item
                  ? "bg-duo-green text-white shadow-lg"
                  : "bg-card border-2 border-muted hover:border-duo-orange shadow-card",
                "hover:scale-102 active:scale-98"
              )}
            >
              <span className="text-5xl">{option.emoji}</span>
              <span className="font-medium text-sm">{option.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? `Yummy! You found the ${question.item}! 🎉`
                : isCorrect === false
                ? `This is a ${question.item}!`
                : "Look carefully and tap the right kitchen item!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl celebrate">{question.emoji}</div>
        </div>
      )}

      <GameAIIndicator 
        behaviorProfile={behaviorProfile}
        aiTrace={aiTrace}
        consecutiveWrong={consecutiveWrong}
        currentStreak={currentStreak}
      />

      <AdaptiveAIFeedback
        encouragement={encouragement}
        hint={hint}
        isLoading={aiLoading}
        onDismiss={clearMessages}
      />
    </div>
  );
}
