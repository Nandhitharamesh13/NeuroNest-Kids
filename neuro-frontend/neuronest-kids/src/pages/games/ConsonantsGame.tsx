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
import { ArrowLeft, Star, RotateCcw, Clock } from 'lucide-react';

const TOTAL_ROUNDS = 10;
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

interface Question {
  letter: string;
  word: string;
  emoji: string;
  isVowel: boolean;
}

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  timestamp: number;
  responseTimeMs: number;
}

const LETTER_DATA = [
  { letter: 'A', word: 'Apple', emoji: '🍎', isVowel: true },
  { letter: 'B', word: 'Ball', emoji: '⚽', isVowel: false },
  { letter: 'C', word: 'Cat', emoji: '🐱', isVowel: false },
  { letter: 'D', word: 'Dog', emoji: '🐶', isVowel: false },
  { letter: 'E', word: 'Elephant', emoji: '🐘', isVowel: true },
  { letter: 'F', word: 'Fish', emoji: '🐟', isVowel: false },
  { letter: 'G', word: 'Grapes', emoji: '🍇', isVowel: false },
  { letter: 'H', word: 'House', emoji: '🏠', isVowel: false },
  { letter: 'I', word: 'Ice cream', emoji: '🍦', isVowel: true },
  { letter: 'J', word: 'Juice', emoji: '🧃', isVowel: false },
  { letter: 'K', word: 'Kite', emoji: '🪁', isVowel: false },
  { letter: 'L', word: 'Lion', emoji: '🦁', isVowel: false },
  { letter: 'M', word: 'Moon', emoji: '🌙', isVowel: false },
  { letter: 'N', word: 'Nest', emoji: '🪺', isVowel: false },
  { letter: 'O', word: 'Orange', emoji: '🍊', isVowel: true },
  { letter: 'P', word: 'Penguin', emoji: '🐧', isVowel: false },
  { letter: 'R', word: 'Rainbow', emoji: '🌈', isVowel: false },
  { letter: 'S', word: 'Sun', emoji: '☀️', isVowel: false },
  { letter: 'T', word: 'Tree', emoji: '🌳', isVowel: false },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', isVowel: true },
  { letter: 'W', word: 'Whale', emoji: '🐋', isVowel: false },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', isVowel: false },
];

function generateQuestion(usedLetters: string[]): Question {
  const available = LETTER_DATA.filter(l => !usedLetters.includes(l.letter));
  const target = available.length > 0 
    ? available[Math.floor(Math.random() * available.length)]
    : LETTER_DATA[Math.floor(Math.random() * LETTER_DATA.length)];
  return target;
}

export default function ConsonantsGame() {
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
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
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
    const newQ = generateQuestion(usedLetters);
    setQuestion(newQ);
    setUsedLetters(prev => [...prev, newQ.letter]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    questionStartTime.current = Date.now();
    
    setTimeout(() => {
      speak(`Is ${newQ.letter} a vowel or consonant?`);
    }, 300);
  }, [usedLetters, speak]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user && childName) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'consonants');
      
      const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
      checkForMilestones(childId, childName, 'Consonants', score, score, accuracy, currentStreak);
    }
  }, [gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert([{
        child_id: childId,
        game_type: 'consonants',
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

  const handleAnswer = (answer: 'vowel' | 'consonant') => {
    if (selectedAnswer !== null || !question) return;
    
    const responseTime = Date.now() - questionStartTime.current;
    playClick();
    setSelectedAnswer(answer);
    const correctAnswer = question.isVowel ? 'vowel' : 'consonant';
    const correct = answer === correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      speak(`Yes! ${question.letter} is a ${correctAnswer}!`);
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      trackCorrect();
    } else {
      playWrong();
      speak(`${question.letter} is a ${correctAnswer}`);
      const mistake: Mistake = {
        question: `Is ${question.letter} a vowel or consonant?`,
        correctAnswer,
        userAnswer: answer,
        category: 'consonants',
        timestamp: Date.now(),
        responseTimeMs: responseTime,
      };
      setMistakes(prev => [...prev, mistake]);
      
      trackWrong({
        gameType: 'consonants',
        score,
        correctAnswers,
        wrongAnswers: mistakes.length + 1,
        totalQuestions: round,
        responseTimeMs: responseTime,
      });

      if (consecutiveWrong >= 2 && childId && childName) {
        const accuracy = round > 0 ? Math.round((correctAnswers / round) * 100) : 0;
        checkForStruggles(childId, childName, 'Consonants', consecutiveWrong + 1, mistakes.length + 1, accuracy);
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
    setUsedLetters([]);
    setMistakes([]);
    gameStartTime.current = Date.now();
    generateRound();
  };

  if (!question) return null;

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pastel-mint via-background to-pastel-sky flex items-center justify-center p-4 page-enter">
        <div className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-card">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Letter Expert!</h1>
          <p className="text-muted-foreground mb-6">You know vowels and consonants!</p>
          
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
    <div className="min-h-screen bg-gradient-to-b from-pastel-mint via-background to-pastel-sky overflow-hidden page-enter">
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
        {/* Reference */}
        <div className="bg-card rounded-2xl p-4 mb-6 shadow-card">
          <div className="text-center text-sm text-muted-foreground mb-2">
            Remember: Vowels are
          </div>
          <div className="flex justify-center gap-2">
            {VOWELS.map(v => (
              <div
                key={v}
                className="w-10 h-10 rounded-lg bg-duo-pink text-white flex items-center justify-center font-bold text-lg"
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-duo-blue to-duo-purple text-white text-7xl font-bold mb-4 shadow-xl animate-pulse">
            {question.letter}
          </div>
          <div className="text-4xl mb-2">{question.emoji}</div>
          <p className="font-display text-xl text-foreground">
            Is "{question.letter}" a vowel or consonant?
          </p>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleAnswer('vowel')}
            disabled={selectedAnswer !== null}
            className={cn(
              "p-6 rounded-2xl text-xl font-bold transition-all duration-200 gpu-accelerated",
              selectedAnswer === 'vowel'
                ? isCorrect
                  ? "bg-duo-green text-white scale-105"
                  : "bg-duo-red text-white shake"
                : selectedAnswer !== null && question.isVowel
                ? "bg-duo-green text-white"
                : "bg-gradient-to-br from-duo-pink to-duo-purple text-white shadow-lg",
              "hover:scale-105 active:scale-95"
            )}
          >
            🔴 Vowel
          </button>
          <button
            onClick={() => handleAnswer('consonant')}
            disabled={selectedAnswer !== null}
            className={cn(
              "p-6 rounded-2xl text-xl font-bold transition-all duration-200 gpu-accelerated",
              selectedAnswer === 'consonant'
                ? isCorrect
                  ? "bg-duo-green text-white scale-105"
                  : "bg-duo-red text-white shake"
                : selectedAnswer !== null && !question.isVowel
                ? "bg-duo-green text-white"
                : "bg-gradient-to-br from-duo-blue to-duo-teal text-white shadow-lg",
              "hover:scale-105 active:scale-95"
            )}
          >
            🔵 Consonant
          </button>
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? `Great job! ${question.letter} is a ${question.isVowel ? 'vowel' : 'consonant'}! 🎉`
                : isCorrect === false
                ? `${question.letter} is a ${question.isVowel ? 'vowel' : 'consonant'}!`
                : "Vowels: A, E, I, O, U. Everything else is a consonant!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl celebrate">{question.isVowel ? '🔴' : '🔵'}</div>
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
