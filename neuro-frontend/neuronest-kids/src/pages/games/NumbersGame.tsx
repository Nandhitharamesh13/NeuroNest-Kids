import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GuideMascot } from '@/components/GuideMascot';
import { GameFinishScreen } from '@/components/GameFinishScreen';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { useParentAlertsContext } from '@/contexts/ParentAlertsContext';
import { useRewardSystem } from '@/hooks/useRewardSystem';
import { cn } from '@/lib/utils';
import { ArrowLeft, Star, RotateCcw, Clock, Brain, Zap } from 'lucide-react';

const TOTAL_ROUNDS = 10;

interface NumberItem {
  value: number;
  word: string;
  dots: number;
  difficulty: 'easy' | 'hard';
}

const EASY_NUMBERS: NumberItem[] = [
  { value: 1, word: 'One', dots: 1, difficulty: 'easy' },
  { value: 2, word: 'Two', dots: 2, difficulty: 'easy' },
  { value: 3, word: 'Three', dots: 3, difficulty: 'easy' },
  { value: 4, word: 'Four', dots: 4, difficulty: 'easy' },
  { value: 5, word: 'Five', dots: 5, difficulty: 'easy' },
  { value: 6, word: 'Six', dots: 6, difficulty: 'easy' },
  { value: 7, word: 'Seven', dots: 7, difficulty: 'easy' },
];

const HARD_NUMBERS: NumberItem[] = [
  { value: 8, word: 'Eight', dots: 8, difficulty: 'hard' },
  { value: 9, word: 'Nine', dots: 9, difficulty: 'hard' },
  { value: 10, word: 'Ten', dots: 10, difficulty: 'hard' },
];

function DotDisplay({ count, color }: { count: number; color: string }) {
  const rows = Math.ceil(count / 5);
  return (
    <div className="flex flex-col items-center gap-1">
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-1">
          {[...Array(Math.min(5, count - rowIdx * 5))].map((_, dotIdx) => (
            <div key={dotIdx} className={cn("w-3 h-3 rounded-full", color)} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function NumbersGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();
  const { checkForMilestones } = useParentAlertsContext();
  const { updateProgress } = useRewardSystem(childId);

  const { encouragement, hint, isLoading: aiLoading, trackCorrect: aiTrackCorrect, trackWrong: aiTrackWrong, updateStats, clearMessages } = useAdaptiveAI(childId);
  const adaptiveDifficulty = useAdaptiveDifficulty();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [target, setTarget] = useState<NumberItem>(EASY_NUMBERS[0]);
  const [options, setOptions] = useState<NumberItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ question: string; correctAnswer: string; userAnswer: string; category: string }>>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]);
  const [isChallenge, setIsChallenge] = useState(false);
  const [childName, setChildName] = useState('');

  const gameStartTime = useRef<number>(Date.now());
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
    const difficulty = adaptiveDifficulty.getQuestionDifficulty();
    const pool = difficulty === 'hard' ? HARD_NUMBERS : EASY_NUMBERS;
    const allPool = [...EASY_NUMBERS, ...HARD_NUMBERS];
    
    const available = pool.filter(n => !usedNumbers.includes(n.value));
    const itemPool = available.length >= 1 ? available : pool;
    
    const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
    const newTarget = shuffled[0];
    const wrongPool = allPool.filter(n => n.value !== newTarget.value);
    const wrongOptions = [...wrongPool].sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [newTarget, ...wrongOptions].sort(() => Math.random() - 0.5);

    setTarget(newTarget);
    setOptions(allOptions);
    setSelected(null);
    setIsCorrect(null);
    setIsChallenge(difficulty === 'hard');
    setUsedNumbers(prev => [...prev, newTarget.value]);
  }, [usedNumbers, adaptiveDifficulty]);

  useEffect(() => { gameStartTime.current = Date.now(); generateRound(); }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'numbers');
      updateProgress(childId);
      if (childName) {
        const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
        checkForMilestones(childId, childName, 'Numbers', score, score, accuracy, maxStreak);
      }
    }
  }, [gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert({
        child_id: childId, game_type: 'numbers', score,
        correct_answers: correctAnswers, wrong_answers: wrongAnswers,
        total_questions: TOTAL_ROUNDS, max_streak: maxStreak,
        mistakes: mistakes as any,
        duration_seconds: Math.floor((Date.now() - gameStartTime.current) / 1000),
      });
    } catch (error) { console.error('Failed to save game session:', error); }
  };

  const handleSelect = (item: NumberItem) => {
    if (selected !== null) return;
    playClick();
    setSelected(item.value);
    
    if (item.value === target.value) {
      setIsCorrect(true);
      playCorrect();
      const bonus = isChallenge ? 5 : 0;
      setScore(prev => prev + 10 + streak * 2 + bonus);
      setStreak(prev => { const n = prev + 1; if (n > maxStreak) setMaxStreak(n); return n; });
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      aiTrackCorrect();
      adaptiveDifficulty.recordCorrect();
      
      setTimeout(() => {
        setShowCelebration(false);
        if (round >= TOTAL_ROUNDS) { playComplete(); setGameComplete(true); }
        else { setRound(prev => prev + 1); generateRound(); }
      }, 1200);
    } else {
      setIsCorrect(false);
      playWrong();
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
      adaptiveDifficulty.recordWrong();
      setMistakes(prev => [...prev, { question: `Count ${target.dots} dots`, correctAnswer: target.word, userAnswer: item.word, category: 'Numbers' }]);
      aiTrackWrong({ gameType: 'numbers', score, correctAnswers, wrongAnswers: wrongAnswers + 1, totalQuestions: round });
      
      setTimeout(() => { setSelected(null); setIsCorrect(null); }, 1000);
    }
  };

  const resetGame = () => {
    setRound(1); setScore(0); setStreak(0); setMaxStreak(0);
    setCorrectAnswers(0); setWrongAnswers(0); setMistakes([]);
    setGameComplete(false); setUsedNumbers([]); adaptiveDifficulty.reset();
    gameStartTime.current = Date.now(); generateRound();
  };

  const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
  const totalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);

  if (gameComplete) {
    return (
      <GameFinishScreen childId={childId || ''} score={score} accuracy={accuracy}
        totalTime={totalTime} maxStreak={maxStreak} mistakes={wrongAnswers}
        gameTitle="Numbers Game" gameEmoji="🔢" onPlayAgain={resetGame}
        gradientFrom="from-pastel-peach/30" gradientTo="to-pastel-lemon/30" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-peach via-background to-pastel-lemon overflow-hidden page-enter">
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/game-hub/${childId}`)} className="gap-2">
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
          <div className="text-sm text-muted-foreground">{round}/{TOTAL_ROUNDS}</div>
          {streak > 0 && <div className="flex items-center gap-1 text-duo-orange font-bold">🔥 {streak}</div>}
          <div className="flex items-center gap-1 font-bold">
            <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" /> {score}
          </div>
        </div>
      </header>

      {adaptiveDifficulty.aiRecommendation && (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3 h-3" /> <span>{adaptiveDifficulty.aiRecommendation.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <p className="font-display text-xl text-foreground mb-4">Count the dots and find the number!</p>
          <div className="bg-card rounded-2xl p-6 shadow-card inline-block">
            <DotDisplay count={target.dots} color="bg-duo-orange" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map(option => (
            <button key={option.value} onClick={() => handleSelect(option)}
              disabled={selected !== null && selected !== option.value}
              className={cn(
                "option-card p-5 text-center bg-card border-2",
                selected === option.value
                  ? isCorrect ? "border-duo-green bg-duo-green/10 correct-flash" : "border-duo-red bg-duo-red/10 wrong-shake"
                  : "border-border hover:border-duo-orange",
                selected !== null && selected !== option.value && "opacity-50"
              )}
            >
              <div className="font-display text-4xl font-bold text-duo-orange mb-1">{option.value}</div>
              <div className="text-muted-foreground capitalize">{option.word}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={showCelebration ? "Perfect counting! You are so smart! 🎉" : isCorrect === false ? "Count the dots again! You can do it!" : "Count each dot carefully!"}
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl celebrate">🌟</div>
        </div>
      )}

      <AdaptiveAIFeedback encouragement={encouragement} hint={hint} isLoading={aiLoading} onDismiss={clearMessages} />
    </div>
  );
}
