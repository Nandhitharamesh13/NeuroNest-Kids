import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GuideMascot } from '@/components/GuideMascot';
import { GameAIIndicator } from '@/components/GameAIIndicator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { cn } from '@/lib/utils';
import { ArrowLeft, Star, RotateCcw, Clock, PawPrint, Sparkles, Zap } from 'lucide-react';

const TOTAL_ROUNDS = 10;

interface AnimalItem {
  id: string;
  name: string;
  emoji: string;
  habitat: 'farm' | 'wild' | 'ocean' | 'forest';
  sound: string;
  difficulty: 'easy' | 'hard';
}

// Split into EASY (common animals) and HARD (less common animals)
const EASY_ANIMALS: AnimalItem[] = [
  { id: 'cow', name: 'Cow', emoji: '🐄', habitat: 'farm', sound: 'Moo!', difficulty: 'easy' },
  { id: 'pig', name: 'Pig', emoji: '🐷', habitat: 'farm', sound: 'Oink!', difficulty: 'easy' },
  { id: 'chicken', name: 'Chicken', emoji: '🐔', habitat: 'farm', sound: 'Cluck!', difficulty: 'easy' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', habitat: 'farm', sound: 'Baa!', difficulty: 'easy' },
  { id: 'horse', name: 'Horse', emoji: '🐴', habitat: 'farm', sound: 'Neigh!', difficulty: 'easy' },
  { id: 'lion', name: 'Lion', emoji: '🦁', habitat: 'wild', sound: 'Roar!', difficulty: 'easy' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', habitat: 'wild', sound: 'Trumpet!', difficulty: 'easy' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', habitat: 'wild', sound: 'Ooh ooh!', difficulty: 'easy' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬', habitat: 'ocean', sound: 'Click!', difficulty: 'easy' },
  { id: 'bear', name: 'Bear', emoji: '🐻', habitat: 'forest', sound: 'Growl!', difficulty: 'easy' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', habitat: 'forest', sound: 'Thump!', difficulty: 'easy' },
];

const HARD_ANIMALS: AnimalItem[] = [
  { id: 'giraffe', name: 'Giraffe', emoji: '🦒', habitat: 'wild', sound: 'Hum!', difficulty: 'hard' },
  { id: 'zebra', name: 'Zebra', emoji: '🦓', habitat: 'wild', sound: 'Bark!', difficulty: 'hard' },
  { id: 'whale', name: 'Whale', emoji: '🐋', habitat: 'ocean', sound: 'Song!', difficulty: 'hard' },
  { id: 'octopus', name: 'Octopus', emoji: '🐙', habitat: 'ocean', sound: 'Squish!', difficulty: 'hard' },
  { id: 'shark', name: 'Shark', emoji: '🦈', habitat: 'ocean', sound: 'Swish!', difficulty: 'hard' },
  { id: 'fox', name: 'Fox', emoji: '🦊', habitat: 'forest', sound: 'Yip!', difficulty: 'hard' },
  { id: 'owl', name: 'Owl', emoji: '🦉', habitat: 'forest', sound: 'Hoot!', difficulty: 'hard' },
  { id: 'deer', name: 'Deer', emoji: '🦌', habitat: 'forest', sound: 'Bleat!', difficulty: 'hard' },
];

export default function AnimalsGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();

  // Adaptive AI for encouragement and hints
  const {
    encouragement,
    hint,
    isLoading: aiLoading,
    trackCorrect: aiTrackCorrect,
    trackWrong: aiTrackWrong,
    updateStats,
    adjustDifficulty: aiAdjustDifficulty,
    clearMessages,
    behaviorProfile,
    aiTrace,
  } = useAdaptiveAI(childId);

  // AI-driven difficulty adaptation (7 easy + 3 hard questions)
  const {
    currentDifficulty,
    recordCorrect: difficultyRecordCorrect,
    recordWrong: difficultyRecordWrong,
    reset: resetDifficulty,
    aiRecommendation,
    currentAccuracy,
    questionsAnswered,
  } = useAdaptiveDifficulty({ easyQuestionCount: 7, hardQuestionCount: 3, totalQuestions: 10 });

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<AnimalItem>(EASY_ANIMALS[0]);
  const [options, setOptions] = useState<AnimalItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [usedEasyItems, setUsedEasyItems] = useState<string[]>([]);
  const [usedHardItems, setUsedHardItems] = useState<string[]>([]);
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

  // Generate question based on AI-determined difficulty
  const generateRound = useCallback(() => {
    // Determine which pool to use based on AI recommendation
    const useHard = currentDifficulty === 'hard';
    
    // Get available items from the appropriate pool
    const easyAvailable = EASY_ANIMALS.filter(a => !usedEasyItems.includes(a.id));
    const hardAvailable = HARD_ANIMALS.filter(a => !usedHardItems.includes(a.id));
    
    let pool: AnimalItem[];
    let targetAnimal: AnimalItem;
    
    if (useHard && hardAvailable.length > 0) {
      // Use hard question
      const shuffled = [...hardAvailable].sort(() => Math.random() - 0.5);
      targetAnimal = shuffled[0];
      setUsedHardItems(prev => [...prev, targetAnimal.id]);
      // Mix hard target with some easy distractors
      const easyDistractors = [...EASY_ANIMALS].sort(() => Math.random() - 0.5).slice(0, 2);
      const hardDistractor = HARD_ANIMALS.filter(a => a.id !== targetAnimal.id).sort(() => Math.random() - 0.5)[0];
      pool = [targetAnimal, ...easyDistractors, hardDistractor].filter(Boolean);
    } else {
      // Use easy question
      const available = easyAvailable.length > 0 ? easyAvailable : EASY_ANIMALS;
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      targetAnimal = shuffled[0];
      setUsedEasyItems(prev => [...prev, targetAnimal.id]);
      pool = shuffled.slice(0, 4);
    }
    
    const allOptions = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    // Ensure target is in options
    if (!allOptions.find(a => a.id === targetAnimal.id)) {
      allOptions[Math.floor(Math.random() * 4)] = targetAnimal;
    }

    setTarget(targetAnimal);
    setOptions(allOptions);
    setSelected(null);
    setIsCorrect(null);
  }, [currentDifficulty, usedEasyItems, usedHardItems]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'animals');
      aiAdjustDifficulty({
        gameType: 'animals',
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
        game_type: 'animals',
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

  const handleSelect = (animal: AnimalItem) => {
    if (selected) return;
    
    playClick();
    setSelected(animal.id);
    
    if (animal.id === target.id) {
      setIsCorrect(true);
      playCorrect();
      // Bonus points for hard questions
      const basePoints = target.difficulty === 'hard' ? 15 : 10;
      setScore(prev => prev + basePoints + streak * 2);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setConsecutiveWrong(0);
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      
      // Track for both AI systems
      aiTrackCorrect();
      difficultyRecordCorrect();
      
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
      setMistakes(prev => [...prev, { expected: target.name, selected: animal.name, difficulty: target.difficulty }]);
      
      // Track for both AI systems
      aiTrackWrong({
        gameType: 'animals',
        score,
        correctAnswers,
        wrongAnswers: mistakes.length + 1,
        totalQuestions: round,
        consecutiveWrong: consecutiveWrong + 1,
      });
      difficultyRecordWrong();
      
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
    setUsedEasyItems([]);
    setUsedHardItems([]);
    resetDifficulty();
    gameStartTime.current = Date.now();
    generateRound();
  };

  const getHabitatLabel = (habitat: string) => {
    switch (habitat) {
      case 'farm': return '🏡 Farm';
      case 'wild': return '🌿 Safari';
      case 'ocean': return '🌊 Ocean';
      case 'forest': return '🌲 Forest';
      default: return habitat;
    }
  };

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 dark:from-emerald-950 dark:via-green-900 dark:to-teal-950 flex items-center justify-center p-4 page-enter">
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
          <div className="relative">
            <div className="text-7xl mb-4 animate-bounce">🦁</div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Animal Expert!
          </h1>
          <p className="text-muted-foreground mb-6">You know all the animals!</p>
          
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
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-lime-100 dark:from-green-900/50 dark:to-lime-900/50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/game-hub/${childId}`)} className="flex-1 h-12 rounded-2xl">
              Back
            </Button>
            <Button onClick={resetGame} className="flex-1 gap-2 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 dark:from-emerald-950 dark:via-green-900 dark:to-teal-950 overflow-hidden page-enter">
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/game-hub/${childId}`)} className="gap-2 rounded-2xl">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          {/* AI Difficulty indicator */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
            currentDifficulty === 'hard' 
              ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
              : "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
          )}>
            <Zap className="w-3 h-3" />
            {currentDifficulty === 'hard' ? 'Challenge' : 'Practice'}
          </div>
          
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
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg mb-2">
            <PawPrint className="w-6 h-6 text-emerald-500" />
            <span className="font-display text-xl font-bold">Find the:</span>
          </div>
          <div className="bg-white/90 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg mt-4">
            <p className="font-display text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              {target.name}
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span>{getHabitatLabel(target.habitat)}</span>
              <span>•</span>
              <span>{target.sound}</span>
            </div>
            {target.difficulty === 'hard' && (
              <div className="mt-2 inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs">
                <Zap className="w-3 h-3" />
                Challenge Question (+5 bonus)
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map(animal => (
            <button
              key={animal.id}
              onClick={() => handleSelect(animal)}
              disabled={!!selected && selected !== animal.id}
              className={cn(
                "p-6 rounded-3xl transition-all duration-300 gpu-accelerated",
                "bg-white/80 dark:bg-black/20 backdrop-blur-sm border-2 shadow-lg",
                "hover:scale-[1.02] hover:shadow-xl",
                selected === animal.id
                  ? isCorrect
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 scale-105"
                    : "border-rose-400 bg-rose-50 dark:bg-rose-900/30 shake"
                  : selected && animal.id === target.id
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                  : "border-transparent hover:border-emerald-300",
                selected && selected !== animal.id && "opacity-50"
              )}
            >
              <div className="text-5xl mb-2">{animal.emoji}</div>
              <div className="font-bold text-foreground">{animal.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{animal.sound}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? `You found the ${target.name}! 🎉`
                : isCorrect === false
                ? `That was a ${options.find(a => a.id === selected)?.name}! Keep going!`
                : "Which animal matches? Tap to answer!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-8xl celebrate">🦁</div>
        </div>
      )}

      <GameAIIndicator
        behaviorProfile={behaviorProfile}
        aiTrace={aiTrace}
        consecutiveWrong={consecutiveWrong}
        currentStreak={streak}
        currentDifficulty={currentDifficulty}
        aiRecommendation={aiRecommendation}
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
