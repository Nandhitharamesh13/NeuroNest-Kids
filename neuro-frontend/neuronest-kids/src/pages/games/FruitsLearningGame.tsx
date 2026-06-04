import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/Mascot';
import { GameFinishScreen } from '@/components/GameFinishScreen';
import { ArrowLeft, Star, Trophy, Clock, Brain, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStats } from '@/hooks/useGameStats';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { useParentAlertsContext } from '@/contexts/ParentAlertsContext';
import { useRewardSystem } from '@/hooks/useRewardSystem';
import { supabase } from '@/integrations/supabase/client';

const TOTAL_ROUNDS = 10;

interface FruitItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: 'fruit' | 'vegetable';
  difficulty: 'easy' | 'hard';
}

const EASY_ITEMS: FruitItem[] = [
  { id: '1', name: 'Apple', emoji: '🍎', color: 'hsl(0, 75%, 55%)', category: 'fruit', difficulty: 'easy' },
  { id: '2', name: 'Banana', emoji: '🍌', color: 'hsl(45, 95%, 55%)', category: 'fruit', difficulty: 'easy' },
  { id: '3', name: 'Orange', emoji: '🍊', color: 'hsl(28, 95%, 55%)', category: 'fruit', difficulty: 'easy' },
  { id: '4', name: 'Grapes', emoji: '🍇', color: 'hsl(270, 75%, 60%)', category: 'fruit', difficulty: 'easy' },
  { id: '5', name: 'Strawberry', emoji: '🍓', color: 'hsl(330, 80%, 60%)', category: 'fruit', difficulty: 'easy' },
  { id: '6', name: 'Watermelon', emoji: '🍉', color: 'hsl(145, 65%, 42%)', category: 'fruit', difficulty: 'easy' },
  { id: '15', name: 'Carrot', emoji: '🥕', color: 'hsl(28, 95%, 55%)', category: 'vegetable', difficulty: 'easy' },
];

const HARD_ITEMS: FruitItem[] = [
  { id: '13', name: 'Kiwi', emoji: '🥝', color: 'hsl(90, 60%, 45%)', category: 'fruit', difficulty: 'hard' },
  { id: '14', name: 'Blueberry', emoji: '🫐', color: 'hsl(240, 60%, 50%)', category: 'fruit', difficulty: 'hard' },
  { id: '19', name: 'Eggplant', emoji: '🍆', color: 'hsl(270, 50%, 40%)', category: 'vegetable', difficulty: 'hard' },
];

export default function FruitsLearningGame() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { saveGameSession } = useGameStats();
  const { checkForMilestones } = useParentAlertsContext();
  const { updateProgress } = useRewardSystem(childId);
  const startTimeRef = useRef(Date.now());

  const { encouragement, hint, isLoading: aiLoading, trackCorrect: aiTrackCorrect, trackWrong: aiTrackWrong, updateStats, clearMessages } = useAdaptiveAI(childId);
  const adaptiveDifficulty = useAdaptiveDifficulty();
  
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [targetItem, setTargetItem] = useState<FruitItem | null>(null);
  const [options, setOptions] = useState<FruitItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ question: string; correctAnswer: string; userAnswer: string; category: string }>>([]);
  const [isChallenge, setIsChallenge] = useState(false);
  const [childName, setChildName] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (childId) {
      supabase.from('child_profiles').select('name').eq('id', childId).single()
        .then(({ data }) => { if (data) setChildName(data.name); });
    }
  }, [childId]);

  useEffect(() => {
    if (gameComplete) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateRound = useCallback(() => {
    const difficulty = adaptiveDifficulty.getQuestionDifficulty();
    const pool = difficulty === 'hard' ? HARD_ITEMS : EASY_ITEMS;
    const allPool = [...EASY_ITEMS, ...HARD_ITEMS];
    
    let available = pool.filter(i => !usedItems.has(i.id));
    if (available.length < 1) { available = [...pool]; setUsedItems(new Set()); }
    
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const wrongPool = allPool.filter(i => i.id !== target.id);
    const wrongOptions = [...wrongPool].sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [target, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setUsedItems(prev => new Set([...prev, target.id]));
    setTargetItem(target);
    setOptions(allOptions);
    setSelectedId(null);
    setIsCorrect(null);
    setIsChallenge(difficulty === 'hard');
  }, [usedItems, adaptiveDifficulty]);

  useEffect(() => { generateRound(); startTimeRef.current = Date.now(); }, []);

  const handleSelect = (item: FruitItem) => {
    if (selectedId) return;
    setSelectedId(item.id);
    const correct = item.id === targetItem?.id;
    setIsCorrect(correct);
    
    if (correct) {
      const bonus = isChallenge ? 5 : 0;
      const points = (streak >= 3 ? 20 : 10) + bonus;
      setScore(prev => prev + points);
      setStreak(prev => { const n = prev + 1; setMaxStreak(ms => Math.max(ms, n)); return n; });
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      aiTrackCorrect();
      adaptiveDifficulty.recordCorrect();
      setTimeout(() => setShowCelebration(false), 600);
    } else {
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
      adaptiveDifficulty.recordWrong();
      setMistakes(prev => [...prev, {
        question: `Find the ${targetItem?.name}`, correctAnswer: targetItem?.name || '',
        userAnswer: item.name, category: targetItem?.category === 'fruit' ? 'Fruits' : 'Vegetables',
      }]);
      aiTrackWrong({ gameType: 'fruits', score, correctAnswers, wrongAnswers: wrongAnswers + 1, totalQuestions: round });
    }
    
    setTimeout(() => {
      if (round < TOTAL_ROUNDS) { setRound(prev => prev + 1); generateRound(); }
      else { setGameComplete(true); }
    }, 1000);
  };

  useEffect(() => {
    if (gameComplete && childId) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      saveGameSession({
        childId, gameType: 'fruits', score, totalQuestions: TOTAL_ROUNDS,
        correctAnswers, wrongAnswers, mistakes, maxStreak, durationSeconds: duration,
      });
      updateProgress(childId);
      if (childName) {
        const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
        checkForMilestones(childId, childName, 'Fruits', score, score, accuracy, maxStreak);
      }
    }
  }, [gameComplete]);

  const resetGame = () => {
    setScore(0); setRound(1); setStreak(0); setMaxStreak(0);
    setCorrectAnswers(0); setWrongAnswers(0); setMistakes([]);
    setUsedItems(new Set()); setGameComplete(false); adaptiveDifficulty.reset();
    startTimeRef.current = Date.now(); generateRound();
  };

  const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
  const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

  if (gameComplete) {
    return (
      <GameFinishScreen childId={childId || ''} score={score} accuracy={accuracy}
        totalTime={totalTime} maxStreak={maxStreak} mistakes={wrongAnswers}
        gameTitle="Fruits & Veggies" gameEmoji="🍎" onPlayAgain={resetGame}
        gradientFrom="from-duo-green/10" gradientTo="to-duo-teal/10" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-duo-green/10 via-background to-duo-teal/10 page-enter">
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/child-dashboard/${childId}`)} className="gap-2">
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /> {formatTime(elapsedTime)}
          </div>
          {isChallenge && (
            <div className="flex items-center gap-1 bg-duo-purple/20 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3 text-duo-purple" />
              <span className="text-xs font-bold text-duo-purple">Challenge</span>
            </div>
          )}
          {streak >= 3 && <div className="flex items-center gap-1 text-duo-orange font-bold pulse-scale">🔥 {streak}</div>}
          <div className="flex items-center gap-2 bg-duo-yellow/20 px-4 py-2 rounded-full">
            <Trophy className="w-5 h-5 text-duo-yellow" />
            <span className="font-bold text-foreground">{score}</span>
          </div>
        </div>
      </header>

      <div className="px-4 mb-8">
        <div className="max-w-md mx-auto">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">Round {round} of {TOTAL_ROUNDS}</p>
        </div>
      </div>

      {adaptiveDifficulty.aiRecommendation && (
        <div className="px-4 mb-2 max-w-lg mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3 h-3" /> <span>{adaptiveDifficulty.aiRecommendation.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pb-8">
        <div className="text-center mb-8 slide-up">
          <p className="text-lg text-muted-foreground mb-4">Find the:</p>
          <div className={cn("inline-block px-8 py-4 bg-card rounded-2xl shadow-card", showCelebration && "celebrate")}>
            <span className="font-display text-4xl font-bold text-foreground">{targetItem?.name}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground capitalize">({targetItem?.category})</p>
        </div>

        <div className="grid grid-cols-2 gap-4 stagger-children">
          {options.map((item) => (
            <button key={item.id} onClick={() => handleSelect(item)} disabled={!!selectedId}
              className={cn(
                "aspect-square rounded-3xl bg-card shadow-3d option-card flex flex-col items-center justify-center gap-2",
                selectedId === item.id && isCorrect && "bg-duo-green/20 ring-4 ring-duo-green correct-flash",
                selectedId === item.id && !isCorrect && "bg-duo-red/20 ring-4 ring-duo-red wrong-shake",
                selectedId && item.id === targetItem?.id && selectedId !== item.id && "ring-4 ring-duo-green"
              )}
            >
              <span className="text-6xl" style={{ transform: showCelebration && selectedId === item.id && isCorrect ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
                {item.emoji}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center slide-up" style={{ animationDelay: '0.2s' }}>
          <div className={cn(
            "flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-soft",
            isCorrect === true && "bg-duo-green/10", isCorrect === false && "bg-duo-red/10"
          )}>
            <Mascot size="sm" happy={isCorrect === true} animated={false} />
            <p className="font-medium text-foreground">
              {isCorrect === null && `Where is the ${targetItem?.name}?`}
              {isCorrect === true && (streak >= 3 ? "🔥 Food expert!" : "Delicious! 🍎")}
              {isCorrect === false && "Try again! 🥗"}
            </p>
          </div>
        </div>
      </main>

      <AdaptiveAIFeedback encouragement={encouragement} hint={hint} isLoading={aiLoading} onDismiss={clearMessages} />
    </div>
  );
}
