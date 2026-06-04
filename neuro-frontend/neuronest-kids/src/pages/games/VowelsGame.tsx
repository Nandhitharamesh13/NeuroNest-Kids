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
import { useParentAlertsContext } from '@/contexts/ParentAlertsContext';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { cn } from '@/lib/utils';
import { ArrowLeft, Star, RotateCcw, Clock, Volume2 } from 'lucide-react';

const TOTAL_ROUNDS = 10;
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

interface VowelQuestion {
  word: string;
  emoji: string;
  vowel: string;
  type: 'identify' | 'fill';
}

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  timestamp: number;
  responseTimeMs: number;
}

const VOWEL_WORDS = [
  { word: 'Apple', emoji: '🍎', vowel: 'A' },
  { word: 'Ant', emoji: '🐜', vowel: 'A' },
  { word: 'Elephant', emoji: '🐘', vowel: 'E' },
  { word: 'Egg', emoji: '🥚', vowel: 'E' },
  { word: 'Ice cream', emoji: '🍦', vowel: 'I' },
  { word: 'Igloo', emoji: '🏠', vowel: 'I' },
  { word: 'Orange', emoji: '🍊', vowel: 'O' },
  { word: 'Octopus', emoji: '🐙', vowel: 'O' },
  { word: 'Umbrella', emoji: '☂️', vowel: 'U' },
  { word: 'Unicorn', emoji: '🦄', vowel: 'U' },
  { word: 'Alligator', emoji: '🐊', vowel: 'A' },
  { word: 'Eagle', emoji: '🦅', vowel: 'E' },
  { word: 'Island', emoji: '🏝️', vowel: 'I' },
  { word: 'Owl', emoji: '🦉', vowel: 'O' },
  { word: 'Up', emoji: '⬆️', vowel: 'U' },
];

function generateQuestion(usedWords: string[]): VowelQuestion {
  const available = VOWEL_WORDS.filter(w => !usedWords.includes(w.word));
  const target = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : VOWEL_WORDS[Math.floor(Math.random() * VOWEL_WORDS.length)];

  return {
    word: target.word,
    emoji: target.emoji,
    vowel: target.vowel,
    type: Math.random() > 0.5 ? 'identify' : 'fill',
  };
}

export default function VowelsGame() {
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

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<VowelQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);
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
    const newQ = generateQuestion(usedWords);
    setQuestion(newQ);
    setUsedWords(prev => [...prev, newQ.word]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    questionStartTime.current = Date.now();

    setTimeout(() => {
      speak(`${newQ.word}. Which vowel does it start with?`);
    }, 300);
  }, [usedWords, speak]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user && childName) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'vowels');

      const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
      checkForMilestones(childId, childName, 'Vowels', score, score, accuracy, currentStreak);
    }
  }, [gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert([{
        child_id: childId,
        game_type: 'vowels',
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
    const correct = answer === question.vowel;
    setIsCorrect(correct);

    if (correct) {
      playCorrect();
      speak(`Correct! ${question.word} starts with ${question.vowel}!`);
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      trackCorrect();
    } else {
      playWrong();
      speak(`${question.word} starts with ${question.vowel}`);
      const mistake: Mistake = {
        question: `${question.word} starts with which vowel?`,
        correctAnswer: question.vowel,
        userAnswer: answer,
        category: 'vowels',
        timestamp: Date.now(),
        responseTimeMs: responseTime,
      };
      setMistakes(prev => [...prev, mistake]);

      trackWrong({
        gameType: 'vowels',
        score,
        correctAnswers,
        wrongAnswers: mistakes.length + 1,
        totalQuestions: round,
        responseTimeMs: responseTime,
      });

      if (consecutiveWrong >= 2 && childId && childName) {
        const accuracy = round > 0 ? Math.round((correctAnswers / round) * 100) : 0;
        checkForStruggles(childId, childName, 'Vowels', consecutiveWrong + 1, mistakes.length + 1, accuracy);
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
    setUsedWords([]);
    setMistakes([]);
    gameStartTime.current = Date.now();
    generateRound();
  };

  if (!question) return null;

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pastel-rose via-background to-pastel-lavender flex items-center justify-center p-4 page-enter">
        <div className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-card">
          <div className="text-6xl mb-4">🔤</div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Vowel Expert!</h1>
          <p className="text-muted-foreground mb-6">A, E, I, O, U - You know them all!</p>

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
    <div className="min-h-screen bg-gradient-to-b from-pastel-rose via-background to-pastel-lavender overflow-hidden page-enter">
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
        {/* Vowels header */}
        <div className="flex justify-center gap-2 mb-6">
          {VOWELS.map(v => (
            <div
              key={v}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold",
                v === question.vowel && selectedAnswer !== null
                  ? "bg-duo-green text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {v}
            </div>
          ))}
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce">{question.emoji}</div>
          <p className="font-display text-2xl text-foreground mb-2">
            {question.word}
          </p>
          <p className="text-muted-foreground">
            Which vowel does this word start with?
          </p>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {VOWELS.map(vowel => (
            <button
              key={vowel}
              onClick={() => handleAnswer(vowel)}
              disabled={selectedAnswer !== null}
              className={cn(
                "aspect-square rounded-2xl text-3xl font-bold transition-all duration-200 gpu-accelerated",
                selectedAnswer === vowel
                  ? isCorrect
                    ? "bg-duo-green text-white scale-105"
                    : "bg-duo-red text-white shake"
                  : selectedAnswer !== null && vowel === question.vowel
                    ? "bg-duo-green text-white"
                    : "bg-gradient-to-br from-duo-pink to-duo-purple text-white shadow-lg",
                "hover:scale-105 active:scale-95"
              )}
            >
              {vowel}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? `Perfect! ${question.vowel} is correct! 🎉`
                : isCorrect === false
                  ? `${question.word} starts with ${question.vowel}!`
                  : "Vowels are A, E, I, O, U! Pick one!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl celebrate">{question.vowel}</div>
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
