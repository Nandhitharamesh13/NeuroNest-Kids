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

interface WeatherItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: 'easy' | 'hard';
}

const EASY_WEATHER: WeatherItem[] = [
  { id: 'sunny', name: 'Sunny', emoji: '☀️', description: 'Bright and warm', difficulty: 'easy' },
  { id: 'cloudy', name: 'Cloudy', emoji: '☁️', description: 'Clouds in the sky', difficulty: 'easy' },
  { id: 'rainy', name: 'Rainy', emoji: '🌧️', description: 'Water from clouds', difficulty: 'easy' },
  { id: 'snowy', name: 'Snowy', emoji: '❄️', description: 'Cold white flakes', difficulty: 'easy' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', description: 'Colors in the sky', difficulty: 'easy' },
  { id: 'windy', name: 'Windy', emoji: '💨', description: 'Blowing air', difficulty: 'easy' },
  { id: 'hot', name: 'Hot', emoji: '🥵', description: 'Very warm', difficulty: 'easy' },
];

const HARD_WEATHER: WeatherItem[] = [
  { id: 'stormy', name: 'Stormy', emoji: '⛈️', description: 'Thunder and lightning', difficulty: 'hard' },
  { id: 'foggy', name: 'Foggy', emoji: '🌫️', description: 'Hard to see', difficulty: 'hard' },
  { id: 'cold', name: 'Cold', emoji: '🥶', description: 'Very chilly', difficulty: 'hard' },
];

export default function WeatherGame() {
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
  const [target, setTarget] = useState<WeatherItem>(EASY_WEATHER[0]);
  const [options, setOptions] = useState<WeatherItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ question: string; correctAnswer: string; userAnswer: string; category: string }>>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [usedItems, setUsedItems] = useState<string[]>([]);
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
    const pool = difficulty === 'hard' ? HARD_WEATHER : EASY_WEATHER;
    const allPool = [...EASY_WEATHER, ...HARD_WEATHER];

    const available = pool.filter(w => !usedItems.includes(w.id));
    const itemPool = available.length >= 1 ? available : pool;

    const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
    const newTarget = shuffled[0];
    const wrongPool = allPool.filter(w => w.id !== newTarget.id);
    const wrongOptions = [...wrongPool].sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [newTarget, ...wrongOptions].sort(() => Math.random() - 0.5);

    setTarget(newTarget);
    setOptions(allOptions);
    setSelected(null);
    setIsCorrect(null);
    setIsChallenge(difficulty === 'hard');
    setUsedItems(prev => [...prev, newTarget.id]);
  }, [usedItems, adaptiveDifficulty]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'weather');
      updateProgress(childId);
      if (childName) {
        const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
        checkForMilestones(childId, childName, 'Weather', score, score, accuracy, maxStreak);
      }
    }
  }, [gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert({
        child_id: childId, game_type: 'weather', score,
        correct_answers: correctAnswers, wrong_answers: wrongAnswers,
        total_questions: TOTAL_ROUNDS, max_streak: maxStreak,
        mistakes: mistakes as any,
        duration_seconds: Math.floor((Date.now() - gameStartTime.current) / 1000),
      });
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  const handleSelect = (item: WeatherItem) => {
    if (selected) return;
    playClick();
    setSelected(item.id);

    if (item.id === target.id) {
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
      setMistakes(prev => [...prev, { question: `Find ${target.name}`, correctAnswer: target.name, userAnswer: item.name, category: 'Weather' }]);
      aiTrackWrong({ gameType: 'weather', score, correctAnswers, wrongAnswers: wrongAnswers + 1, totalQuestions: round });

      setTimeout(() => { setSelected(null); setIsCorrect(null); }, 1000);
    }
  };

  const resetGame = () => {
    setRound(1); setScore(0); setStreak(0); setMaxStreak(0);
    setCorrectAnswers(0); setWrongAnswers(0); setMistakes([]);
    setGameComplete(false); setUsedItems([]); adaptiveDifficulty.reset();
    gameStartTime.current = Date.now(); generateRound();
  };

  const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
  const totalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);

  if (gameComplete) {
    return (
      <GameFinishScreen childId={childId || ''} score={score} accuracy={accuracy}
        totalTime={totalTime} maxStreak={maxStreak} mistakes={wrongAnswers}
        gameTitle="Weather Game" gameEmoji="🌤️" onPlayAgain={resetGame}
        gradientFrom="from-pastel-sky/30" gradientTo="to-pastel-mint/30" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-sky via-background to-pastel-mint overflow-hidden page-enter">
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
          <p className="font-display text-xl text-foreground mb-2">Find the weather that means:</p>
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <p className="font-display text-2xl font-bold text-duo-blue mb-1">{target.name}</p>
            <p className="text-muted-foreground">{target.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map(option => (
            <button key={option.id} onClick={() => handleSelect(option)}
              disabled={!!selected && selected !== option.id}
              className={cn(
                "option-card p-5 text-center bg-card border-2",
                selected === option.id
                  ? isCorrect ? "border-duo-green bg-duo-green/10 correct-flash" : "border-duo-red bg-duo-red/10 wrong-shake"
                  : "border-border hover:border-duo-teal",
                selected && selected !== option.id && "opacity-50"
              )}
            >
              <div className="text-5xl mb-2">{option.emoji}</div>
              <div className="font-display text-lg font-bold text-foreground">{option.name}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={showCelebration ? "You found it! Great weather knowledge! 🌈" : isCorrect === false ? "Not quite! Think about what it means!" : "Which weather matches the description?"}
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
