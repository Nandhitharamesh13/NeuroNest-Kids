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

interface ClockTime {
  hour: number;
  minute: number;
  display: string;
  spoken: string;
  difficulty?: 'easy' | 'hard';
}

const EASY_TIMES: ClockTime[] = [
  { hour: 12, minute: 0, display: '12:00', spoken: "twelve o'clock", difficulty: 'easy' },
  { hour: 3, minute: 0, display: '3:00', spoken: "three o'clock", difficulty: 'easy' },
  { hour: 6, minute: 0, display: '6:00', spoken: "six o'clock", difficulty: 'easy' },
  { hour: 9, minute: 0, display: '9:00', spoken: "nine o'clock", difficulty: 'easy' },
  { hour: 2, minute: 30, display: '2:30', spoken: 'two thirty', difficulty: 'easy' },
  { hour: 5, minute: 30, display: '5:30', spoken: 'five thirty', difficulty: 'easy' },
  { hour: 8, minute: 30, display: '8:30', spoken: 'eight thirty', difficulty: 'easy' },
];

const HARD_TIMES: ClockTime[] = [
  { hour: 3, minute: 20, display: '3:20', spoken: 'three twenty', difficulty: 'hard' },
  { hour: 6, minute: 55, display: '6:55', spoken: 'six fifty-five', difficulty: 'hard' },
  { hour: 10, minute: 35, display: '10:35', spoken: 'ten thirty-five', difficulty: 'hard' },
  { hour: 1, minute: 45, display: '1:45', spoken: 'one forty-five', difficulty: 'hard' },
  { hour: 9, minute: 10, display: '9:10', spoken: 'nine ten', difficulty: 'hard' },
];

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  timestamp: number;
  responseTimeMs: number;
}

function ClockFace({ hour, minute, size = 150 }: { hour: number; minute: number; size?: number }) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;

  return (
    <div 
      className="relative rounded-full bg-white border-4 border-duo-blue shadow-lg"
      style={{ width: size, height: size }}
    >
      {[...Array(12)].map((_, i) => {
        const angle = i * 30;
        const isMain = i % 3 === 0;
        return (
          <div
            key={i}
            className={cn("absolute bg-foreground", isMain ? "w-1 h-3" : "w-0.5 h-2")}
            style={{
              top: '50%', left: '50%',
              transformOrigin: 'center bottom',
              transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-${size / 2 - 10}px)`,
            }}
          />
        );
      })}
      <div
        className="absolute w-2 bg-foreground rounded-full"
        style={{
          height: size * 0.25, top: '50%', left: '50%',
          transformOrigin: 'center bottom',
          transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
        }}
      />
      <div
        className="absolute w-1.5 bg-duo-blue rounded-full"
        style={{
          height: size * 0.35, top: '50%', left: '50%',
          transformOrigin: 'center bottom',
          transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
        }}
      />
      <div 
        className="absolute w-3 h-3 bg-duo-red rounded-full"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
}

export default function ClockGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();
  const { checkForMilestones, checkForStruggles } = useParentAlertsContext();
  const { updateProgress } = useRewardSystem(childId);

  const {
    encouragement, hint, isLoading: aiLoading,
    trackCorrect: aiTrackCorrect, trackWrong: aiTrackWrong,
    updateStats, clearMessages, behaviorProfile,
  } = useAdaptiveAI(childId);

  const adaptiveDifficulty = useAdaptiveDifficulty();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [target, setTarget] = useState<ClockTime>(EASY_TIMES[0]);
  const [options, setOptions] = useState<ClockTime[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [usedTimes, setUsedTimes] = useState<string[]>([]);
  const [isChallenge, setIsChallenge] = useState(false);
  const [childName, setChildName] = useState('');

  const gameStartTime = useRef<number>(Date.now());
  const questionStartTime = useRef<number>(Date.now());
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
    const pool = difficulty === 'hard' ? HARD_TIMES : EASY_TIMES;
    const allPool = [...EASY_TIMES, ...HARD_TIMES];
    
    const available = pool.filter(t => !usedTimes.includes(t.display));
    const timePool = available.length >= 1 ? available : pool;
    
    const shuffled = [...timePool].sort(() => Math.random() - 0.5);
    const newTarget = shuffled[0];
    
    const wrongPool = allPool.filter(t => t.display !== newTarget.display);
    const wrongOptions = [...wrongPool].sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [newTarget, ...wrongOptions].sort(() => Math.random() - 0.5);

    setTarget(newTarget);
    setOptions(allOptions);
    setSelected(null);
    setIsCorrect(null);
    setIsChallenge(difficulty === 'hard');
    setUsedTimes(prev => [...prev, newTarget.display]);
    questionStartTime.current = Date.now();
  }, [usedTimes, adaptiveDifficulty]);

  useEffect(() => {
    gameStartTime.current = Date.now();
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
      updateStats(correctAnswers, TOTAL_ROUNDS, 'clock');
      updateProgress(childId);
      if (childName) {
        const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
        checkForMilestones(childId, childName, 'Clock', score, score, accuracy, maxStreak);
      }
    }
  }, [gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert([{
        child_id: childId,
        game_type: 'clock',
        score,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        total_questions: TOTAL_ROUNDS,
        max_streak: maxStreak,
        mistakes: mistakes as any,
        duration_seconds: Math.floor((Date.now() - gameStartTime.current) / 1000),
      }]);
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  const handleSelect = (time: ClockTime) => {
    if (selected) return;
    
    const responseTime = Date.now() - questionStartTime.current;
    playClick();
    setSelected(time.display);
    
    if (time.display === target.display) {
      setIsCorrect(true);
      playCorrect();
      const bonus = isChallenge ? 5 : 0;
      setScore(prev => prev + 10 + streak * 2 + bonus);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      aiTrackCorrect();
      adaptiveDifficulty.recordCorrect();
      
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
      setWrongAnswers(prev => prev + 1);
      adaptiveDifficulty.recordWrong();
      
      const mistake: Mistake = {
        question: `What time is ${target.display}?`,
        correctAnswer: target.spoken,
        userAnswer: time.spoken,
        category: 'clock',
        timestamp: Date.now(),
        responseTimeMs: responseTime,
      };
      setMistakes(prev => [...prev, mistake]);
      
      aiTrackWrong({
        gameType: 'clock', score, correctAnswers,
        wrongAnswers: mistakes.length + 1, totalQuestions: round, responseTimeMs: responseTime,
      });

      if (childId && childName && wrongAnswers + 1 >= 3) {
        checkForStruggles(childId, childName, 'Clock', wrongAnswers + 1, wrongAnswers + 1, 
          Math.round((correctAnswers / round) * 100));
      }
      
      setTimeout(() => {
        setSelected(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setMistakes([]);
    setGameComplete(false);
    setUsedTimes([]);
    adaptiveDifficulty.reset();
    gameStartTime.current = Date.now();
    generateRound();
  };

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const totalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);

  if (gameComplete) {
    return (
      <GameFinishScreen
        childId={childId || ''}
        score={score}
        accuracy={accuracy}
        totalTime={totalTime}
        maxStreak={maxStreak}
        mistakes={wrongAnswers}
        gameTitle="Clock Game"
        gameEmoji="🕐"
        onPlayAgain={resetGame}
        gradientFrom="from-pastel-sky/30"
        gradientTo="to-pastel-mint/30"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-sky via-background to-pastel-mint overflow-hidden page-enter">
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
          {isChallenge && (
            <div className="flex items-center gap-1 bg-duo-purple/20 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3 text-duo-purple" />
              <span className="text-xs font-bold text-duo-purple">Challenge</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground">{round}/{TOTAL_ROUNDS}</div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-duo-orange font-bold">🔥 {streak}</div>
          )}
          <div className="flex items-center gap-1 font-bold">
            <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
            {score}
          </div>
        </div>
      </header>

      {adaptiveDifficulty.aiRecommendation && (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3 h-3" />
            <span>{adaptiveDifficulty.aiRecommendation.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <p className="font-display text-xl text-foreground mb-4">
            What time does the clock show?
          </p>
          <div className="flex justify-center">
            <ClockFace hour={target.hour} minute={target.minute} size={160} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map(option => (
            <button
              key={option.display}
              onClick={() => handleSelect(option)}
              disabled={!!selected && selected !== option.display}
              className={cn(
                "option-card p-5 text-center bg-card border-2",
                selected === option.display
                  ? isCorrect ? "border-duo-green bg-duo-green/10 correct-flash" : "border-duo-red bg-duo-red/10 wrong-shake"
                  : "border-border hover:border-duo-blue",
                selected && selected !== option.display && "opacity-50"
              )}
            >
              <Clock className="w-8 h-8 mx-auto mb-2 text-duo-blue" />
              <div className="font-display text-2xl font-bold text-foreground">{option.display}</div>
              <div className="text-sm text-muted-foreground capitalize">{option.spoken}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration ? "Great job! You read the clock! ⏰"
              : isCorrect === false ? "Look at the hands carefully! Try again!"
              : "Look at the clock hands!"
            }
            emotion={showCelebration ? 'celebrating' : isCorrect === false ? 'thinking' : 'happy'}
          />
        </div>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl celebrate">✨</div>
        </div>
      )}

      <AdaptiveAIFeedback encouragement={encouragement} hint={hint} isLoading={aiLoading} onDismiss={clearMessages} />
    </div>
  );
}
