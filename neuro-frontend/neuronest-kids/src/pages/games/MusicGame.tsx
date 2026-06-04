import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GuideMascot } from '@/components/GuideMascot';
import { GameAIIndicator } from '@/components/GameAIIndicator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { cn } from '@/lib/utils';
import { ArrowLeft, Star, RotateCcw, Clock, Music, Sparkles } from 'lucide-react';

const TOTAL_ROUNDS = 10;

interface MusicItem {
  id: string;
  name: string;
  emoji: string;
  category: 'instrument' | 'action' | 'genre';
  description: string;
  difficulty: 'easy' | 'hard';
}

// Easy questions (7) - Common, recognizable instruments
const EASY_MUSIC_ITEMS: MusicItem[] = [
  { id: 'guitar', name: 'Guitar', emoji: '🎸', category: 'instrument', description: 'Has strings you strum', difficulty: 'easy' },
  { id: 'piano', name: 'Piano', emoji: '🎹', category: 'instrument', description: 'Has black and white keys', difficulty: 'easy' },
  { id: 'drums', name: 'Drums', emoji: '🥁', category: 'instrument', description: 'You hit with sticks', difficulty: 'easy' },
  { id: 'microphone', name: 'Microphone', emoji: '🎤', category: 'action', description: 'Used for singing', difficulty: 'easy' },
  { id: 'headphones', name: 'Headphones', emoji: '🎧', category: 'action', description: 'For listening to music', difficulty: 'easy' },
  { id: 'notes', name: 'Music Notes', emoji: '🎵', category: 'genre', description: 'Written music symbols', difficulty: 'easy' },
  { id: 'dance', name: 'Dancing', emoji: '💃', category: 'action', description: 'Moving to the music', difficulty: 'easy' },
  { id: 'bell', name: 'Bell', emoji: '🔔', category: 'instrument', description: 'Makes a ringing sound', difficulty: 'easy' },
];

// Hard questions (3) - Less common instruments
const HARD_MUSIC_ITEMS: MusicItem[] = [
  { id: 'violin', name: 'Violin', emoji: '🎻', category: 'instrument', description: 'Played with a bow on strings', difficulty: 'hard' },
  { id: 'trumpet', name: 'Trumpet', emoji: '🎺', category: 'instrument', description: 'Brass instrument you blow into', difficulty: 'hard' },
  { id: 'saxophone', name: 'Saxophone', emoji: '🎷', category: 'instrument', description: 'A curved jazz instrument', difficulty: 'hard' },
  { id: 'accordion', name: 'Accordion', emoji: '🪗', category: 'instrument', description: 'Has buttons and bellows', difficulty: 'hard' },
];

const ALL_MUSIC_ITEMS = [...EASY_MUSIC_ITEMS, ...HARD_MUSIC_ITEMS];

export default function MusicGame() {
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
  const [target, setTarget] = useState<MusicItem>(EASY_MUSIC_ITEMS[0]);
  const [options, setOptions] = useState<MusicItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [usedItems, setUsedItems] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [mistakes, setMistakes] = useState<any[]>([]);

  const gameStartTime = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

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
    // Select from easy or hard pool based on round and performance
    const useHard = round > 5 && correctAnswers >= 4; // Use hard after 5 correct
    const primaryPool = useHard ? HARD_MUSIC_ITEMS : EASY_MUSIC_ITEMS;
    const available = primaryPool.filter(i => !usedItems.includes(i.id));
    const pool = available.length >= 1 ? available : primaryPool;
    
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const newTarget = shuffled[0];
    // Get wrong options from all items to provide variety
    const otherItems = ALL_MUSIC_ITEMS.filter(i => i.id !== newTarget.id);
    const wrongOptions = otherItems.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [newTarget, ...wrongOptions].sort(() => Math.random() - 0.5);

    setTarget(newTarget);
    setOptions(allOptions);
    setSelected(null);
    setIsCorrect(null);
    setUsedItems(prev => [...prev, newTarget.id]);
  }, [usedItems, round, correctAnswers]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'music');
      adjustDifficulty({
        gameType: 'music',
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
      await supabase.from('game_sessions').insert({
        child_id: childId,
        game_type: 'music',
        score,
        correct_answers: correctAnswers,
        wrong_answers: TOTAL_ROUNDS - correctAnswers,
        total_questions: TOTAL_ROUNDS,
        max_streak: maxStreak,
        mistakes: mistakes,
        duration_seconds: Math.floor((Date.now() - gameStartTime.current) / 1000),
      });
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  const handleSelect = (item: MusicItem) => {
    if (selected) return;
    
    playClick();
    setSelected(item.id);
    
    if (item.id === target.id) {
      setIsCorrect(true);
      playCorrect();
      setScore(prev => prev + 10 + streak * 2);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setConsecutiveWrong(0);
      setCorrectAnswers(prev => prev + 1);
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
      setIsCorrect(false);
      playWrong();
      setStreak(0);
      setConsecutiveWrong(prev => prev + 1);
      setMistakes(prev => [...prev, { expected: target.name, selected: item.name }]);
      
      trackWrong({
        gameType: 'music',
        score,
        correctAnswers,
        wrongAnswers: mistakes.length + 1,
        totalQuestions: round,
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
    setStreak(0);
    setMaxStreak(0);
    setConsecutiveWrong(0);
    setCorrectAnswers(0);
    setMistakes([]);
    setGameComplete(false);
    setUsedItems([]);
    gameStartTime.current = Date.now();
    generateRound();
  };

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-pink-950 dark:via-purple-900 dark:to-indigo-950 flex items-center justify-center p-4 page-enter">
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
          <div className="relative">
            <div className="text-7xl mb-4 animate-bounce">🎵</div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Music Master!
          </h1>
          <p className="text-muted-foreground mb-6">You know your music well!</p>
          
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
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/game-hub/${childId}`)} className="flex-1 h-12 rounded-2xl">
              Back
            </Button>
            <Button onClick={resetGame} className="flex-1 gap-2 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-pink-950 dark:via-purple-900 dark:to-indigo-950 overflow-hidden page-enter">
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/game-hub/${childId}`)} className="gap-2 rounded-2xl">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedTime)}
          </div>
          <div className="bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full text-sm font-medium">
            {round}/{TOTAL_ROUNDS}
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 px-3 py-1.5 rounded-full font-bold text-sm animate-pulse">
              🔥 {streak}
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </header>

      <div className="px-4 mb-4">
        <div className="max-w-md mx-auto">
          <div className="h-3 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg mb-2">
            <Music className="w-6 h-6 text-pink-500" />
            <span className="font-display text-xl font-bold">Find the:</span>
          </div>
          <div className="bg-white/90 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg mt-4">
            <p className="font-display text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {target.name}
            </p>
            <p className="text-muted-foreground">{target.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map(option => (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={!!selected && selected !== option.id}
              className={cn(
                "p-6 rounded-3xl transition-all duration-300 gpu-accelerated",
                "bg-white/80 dark:bg-black/20 backdrop-blur-sm border-2 shadow-lg",
                "hover:scale-[1.02] hover:shadow-xl",
                selected === option.id
                  ? isCorrect
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 scale-105"
                    : "border-rose-400 bg-rose-50 dark:bg-rose-900/30 shake"
                  : selected && option.id === target.id
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                  : "border-transparent hover:border-pink-300",
                selected && selected !== option.id && "opacity-50"
              )}
            >
              <div className="text-5xl mb-2">{option.emoji}</div>
              <div className="font-bold text-foreground">{option.name}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? "You're a music star! 🎵"
                : isCorrect === false
                ? `That was ${options.find(o => o.id === selected)?.name}! Keep going!`
                : "Which one matches? Tap to answer!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-8xl celebrate">🎵</div>
        </div>
      )}

      <GameAIIndicator
        behaviorProfile={behaviorProfile}
        aiTrace={aiTrace}
        consecutiveWrong={consecutiveWrong}
        currentStreak={streak}
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
