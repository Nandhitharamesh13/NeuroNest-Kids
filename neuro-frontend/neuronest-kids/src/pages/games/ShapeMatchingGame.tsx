import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/Mascot';
import { VoiceButton } from '@/components/VoiceButton';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { GameFinishScreen } from '@/components/GameFinishScreen';
import { ArrowLeft, Star, Trophy, Clock, Brain, RotateCcw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStats } from '@/hooks/useGameStats';
import { useParentAlerts } from '@/hooks/useParentAlerts';
import { useRewardSystem } from '@/hooks/useRewardSystem';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { supabase } from '@/integrations/supabase/client';
import gsap from 'gsap';

interface Shape {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'pentagon' | 'hexagon' | 'oval' | 'cross';
  color: string;
  name: string;
}

const ALL_SHAPES: Shape[] = [
  { id: '1', type: 'circle', color: 'hsl(0, 75%, 55%)', name: 'Circle' },
  { id: '2', type: 'square', color: 'hsl(200, 85%, 50%)', name: 'Square' },
  { id: '3', type: 'triangle', color: 'hsl(45, 95%, 55%)', name: 'Triangle' },
  { id: '4', type: 'star', color: 'hsl(270, 75%, 60%)', name: 'Star' },
  { id: '5', type: 'heart', color: 'hsl(330, 80%, 60%)', name: 'Heart' },
  { id: '6', type: 'diamond', color: 'hsl(145, 65%, 42%)', name: 'Diamond' },
  { id: '7', type: 'pentagon', color: 'hsl(28, 95%, 55%)', name: 'Pentagon' },
  { id: '8', type: 'hexagon', color: 'hsl(175, 70%, 45%)', name: 'Hexagon' },
  { id: '9', type: 'oval', color: 'hsl(280, 70%, 55%)', name: 'Oval' },
  { id: '10', type: 'cross', color: 'hsl(350, 80%, 55%)', name: 'Cross' },
];

const ShapeSVG = ({ type, color, size = 60 }: { type: string; color: string; size?: number }) => {
  const half = size / 2;
  const pad = 4;
  
  switch (type) {
    case 'circle':
      return <circle cx={half} cy={half} r={half - pad} fill={color} />;
    case 'square':
      return <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} rx="6" fill={color} />;
    case 'triangle':
      return <polygon points={`${half},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`} fill={color} />;
    case 'star': {
      const cx = half, cy = half, outerR = half - pad, innerR = size / 4;
      const points = Array.from({ length: 5 }, (_, i) => {
        const outerAngle = (i * 72 - 90) * Math.PI / 180;
        const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
        return `${cx + outerR * Math.cos(outerAngle)},${cy + outerR * Math.sin(outerAngle)} ${cx + innerR * Math.cos(innerAngle)},${cy + innerR * Math.sin(innerAngle)}`;
      }).join(' ');
      return <polygon points={points} fill={color} />;
    }
    case 'heart':
      return (
        <path 
          d={`M ${half} ${size - 8} C ${half - size/3} ${half} ${pad} ${size/3} ${half} ${pad + 8} C ${size - pad} ${size/3} ${half + size/3} ${half} ${half} ${size - 8}`}
          fill={color}
        />
      );
    case 'diamond':
      return <polygon points={`${half},${pad} ${size - pad},${half} ${half},${size - pad} ${pad},${half}`} fill={color} />;
    case 'pentagon': {
      const r = half - pad;
      const pts = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 72 - 90) * Math.PI / 180;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(' ');
      return <polygon points={pts} fill={color} />;
    }
    case 'hexagon': {
      const r = half - pad;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 60 - 90) * Math.PI / 180;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(' ');
      return <polygon points={pts} fill={color} />;
    }
    case 'oval':
      return <ellipse cx={half} cy={half} rx={half - pad} ry={half * 0.6} fill={color} />;
    case 'cross': {
      const w = (size - pad * 2) / 3;
      return (
        <path 
          d={`M ${pad + w} ${pad} h ${w} v ${w} h ${w} v ${w} h ${-w} v ${w} h ${-w} v ${-w} h ${-w} v ${-w} h ${w} z`}
          fill={color}
        />
      );
    }
    default:
      return null;
  }
};

export default function ShapeMatchingGame() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { saveGameSession } = useGameStats();
  const { checkForMilestones, checkForStruggles } = useParentAlerts();
  const { updateProgress } = useRewardSystem(childId);
  const { speakInstruction, speakCelebration, speakEncouragement, stop: stopSpeech } = useTextToSpeech();
  const startTimeRef = useRef(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [childName, setChildName] = useState('');
  
  // Adaptive AI
  const {
    encouragement,
    hint,
    isLoading: aiLoading,
    trackCorrect,
    trackWrong,
    clearMessages,
    behaviorProfile,
    adjustDifficulty,
  } = useAdaptiveAI(childId);
  
  // Adaptive difficulty
  const {
    getQuestionDifficulty,
    recordCorrect: recordDifficultyCorrect,
    recordWrong: recordDifficultyWrong,
    currentDifficulty,
    aiRecommendation,
    reset: resetDifficulty,
  } = useAdaptiveDifficulty();

  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const totalRounds = 10;
  const [targetShape, setTargetShape] = useState<Shape | null>(null);
  const [options, setOptions] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ question: string; correctAnswer: string; userAnswer: string; category: string; responseTimeMs: number }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Fetch child name for alerts
  useEffect(() => {
    if (childId) {
      supabase.from('child_profiles').select('name').eq('id', childId).single()
        .then(({ data }) => {
          if (data) setChildName(data.name);
        });
    }
  }, [childId]);

  // Easy shapes: basic (circle, square, triangle, star, heart)
  // Hard shapes: complex (diamond, pentagon, hexagon, oval, cross)
  const EASY_SHAPES = ALL_SHAPES.filter(s => ['circle', 'square', 'triangle', 'star', 'heart'].includes(s.type));
  const HARD_SHAPES = ALL_SHAPES.filter(s => ['diamond', 'pentagon', 'hexagon', 'oval', 'cross'].includes(s.type));

  const generateRound = useCallback((): void => {
    const difficulty = getQuestionDifficulty();
    const pool = difficulty === 'hard' ? HARD_SHAPES : EASY_SHAPES;
    const otherPool = difficulty === 'hard' ? EASY_SHAPES : HARD_SHAPES;
    
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const target = shuffledPool[0];
    
    // Mix wrong options from both pools
    const wrongCandidates = [...shuffledPool.slice(1), ...otherPool].sort(() => Math.random() - 0.5);
    const wrongOptions = wrongCandidates.slice(0, 3);
    const allOptions = [target, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setTargetShape(target);
    setOptions(allOptions);
    setSelectedId(null);
    setIsCorrect(null);
    setQuestionStartTime(Date.now());
    
    setTimeout(() => {
      speakInstruction(`Find the ${target.name}`);
    }, 500);
  }, [getQuestionDifficulty, speakInstruction]);

  useEffect(() => {
    generateRound();
    startTimeRef.current = Date.now();
  }, []);

  // Timer effect - stops when game is complete
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

  // Animate new round
  useEffect(() => {
    if (!targetRef.current || !optionsRef.current) return;
    
    gsap.fromTo(targetRef.current,
      { scale: 0.5, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' }
    );
    
    const buttons = optionsRef.current.querySelectorAll('button');
    gsap.fromTo(buttons,
      { scale: 0.8, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)' }
    );
  }, [round, targetShape]);

  const handleSelect = (shape: Shape) => {
    if (selectedId) return;
    
    const responseTime = Date.now() - questionStartTime;
    setSelectedId(shape.id);
    const correct = shape.id === targetShape?.id;
    setIsCorrect(correct);
    
    // Animate selection
    const button = optionsRef.current?.querySelector(`[data-id="${shape.id}"]`);
    if (button) {
      if (correct) {
        gsap.to(button, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      } else {
        gsap.to(button, {
          x: -8,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          ease: 'power2.inOut',
        });
      }
    }
    
    if (correct) {
      const basePoints = streak >= 3 ? 20 : 10;
      const points = basePoints + (currentDifficulty === 'hard' ? 5 : 0);
      setScore(prev => prev + points);
      recordDifficultyCorrect();
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(ms => Math.max(ms, newStreak));
        return newStreak;
      });
      setCorrectAnswers(prev => prev + 1);
      setConsecutiveWrong(0);
      setShowCelebration(true);
      
      // Voice celebration
      if (streak >= 2) {
        speakCelebration("Amazing streak! You're on fire!");
      } else {
        speakCelebration("Great job!");
      }
      
      trackCorrect();
      setTimeout(() => setShowCelebration(false), 600);
    } else {
      setStreak(0);
      recordDifficultyWrong();
      setWrongAnswers(prev => prev + 1);
      setConsecutiveWrong(prev => {
        const newCount = prev + 1;
        // Check for struggles and send alert
        if (childId && childName && newCount >= 3) {
          checkForStruggles(childId, childName, 'Match Shapes', newCount, wrongAnswers + 1, 
            Math.round((correctAnswers / (round)) * 100));
        }
        return newCount;
      });
      setMistakes(prev => [...prev, {
        question: `Find the ${targetShape?.name}`,
        correctAnswer: targetShape?.name || '',
        userAnswer: shape.name,
        category: 'Shapes',
        responseTimeMs: responseTime,
      }]);
      
      // Voice encouragement
      speakEncouragement(`That was a ${shape.name}. The answer was ${targetShape?.name}. Keep trying!`);
      trackWrong({
        gameType: 'shapes',
        score,
        correctAnswers,
        wrongAnswers: wrongAnswers + 1,
        totalQuestions: round,
      });
    }
    
    setTimeout(() => {
      if (round < totalRounds) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        setGameComplete(true);
        stopSpeech();
      }
    }, 1200);
  };

  // Save game and trigger alerts on completion
  useEffect(() => {
    if (gameComplete && childId) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const accuracy = Math.round((correctAnswers / totalRounds) * 100);
      
      // Save game session
      saveGameSession({
        childId,
        gameType: 'shapes',
        score,
        totalQuestions: totalRounds,
        correctAnswers,
        wrongAnswers,
        mistakes,
        maxStreak,
        durationSeconds: duration,
      });
      
      // Update rewards
      updateProgress(childId);

      // Ask AI to adjust difficulty for next sessions (developer-visible via AI Debug overlay)
      adjustDifficulty({
        gameType: 'shapes',
        score,
        correctAnswers,
        wrongAnswers,
        totalQuestions: totalRounds,
      });
      
      // Check for milestones and send parent alerts
      if (childName) {
        checkForMilestones(
          childId,
          childName,
          'Match Shapes',
          score,
          score, // Total score for this game
          accuracy,
          maxStreak
        );
      }
      
      // Speak completion
      if (accuracy >= 80) {
        speakCelebration(`Fantastic! You got ${accuracy} percent correct! You're a shape master!`);
      } else if (accuracy >= 60) {
        speakEncouragement(`Good job! You got ${accuracy} percent correct. Keep practicing!`);
      } else {
        speakEncouragement(`You got ${accuracy} percent correct. Let's try again and do even better!`);
      }
    }
  }, [gameComplete]);

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setStreak(0);
    setMaxStreak(0);
    setConsecutiveWrong(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setMistakes([]);
    resetDifficulty();
    setGameComplete(false);
    startTimeRef.current = Date.now();
    generateRound();
  };

  if (gameComplete) {
    const accuracy = Math.round((correctAnswers / totalRounds) * 100);
    
    return (
      <GameFinishScreen
        childId={childId || ''}
        score={score}
        accuracy={accuracy}
        totalTime={elapsedTime}
        maxStreak={maxStreak}
        mistakes={wrongAnswers}
        gameTitle="Match Shapes"
        gameEmoji="🔷"
        onPlayAgain={resetGame}
        gradientFrom="from-duo-purple/10"
        gradientTo="to-duo-pink/10"
      />
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-duo-purple/10 via-background to-duo-pink/10">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/child-dashboard/${childId}`)}
          className="gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
          </div>
          {streak >= 3 && (
            <div className="flex items-center gap-1 text-duo-orange font-bold animate-pulse">
              🔥 {streak}
            </div>
          )}
          <div className="flex items-center gap-2 bg-gradient-to-r from-duo-yellow/20 to-duo-orange/20 px-5 py-2.5 rounded-full shadow-sm">
            <Trophy className="w-5 h-5 text-duo-yellow" />
            <span className="font-bold text-foreground">{score}</span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-4 mb-8">
        <div className="max-w-md mx-auto">
          <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-duo-purple to-duo-pink rounded-full transition-all duration-500"
              style={{ width: `${(round / totalRounds) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-sm text-muted-foreground font-medium">
              Round {round} of {totalRounds}
            </p>
            {currentDifficulty === 'hard' && (
              <span className="text-xs bg-duo-orange/20 text-duo-orange px-2 py-0.5 rounded-full font-bold">
                ⚡ Challenge
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Game area */}
      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Target shape */}
        <div ref={targetRef} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-lg text-muted-foreground font-medium">
              Find this shape:
            </p>
            <VoiceButton 
              text={`Find the ${targetShape?.name}`} 
              size="sm"
              className="bg-duo-blue/10 hover:bg-duo-blue/20 border-duo-blue/30"
            />
          </div>
          
          <div className={cn(
            "inline-block p-8 bg-card rounded-3xl shadow-xl border-2 border-primary/20",
            showCelebration && "animate-bounce"
          )}>
            {targetShape && (
              <svg width="100" height="100" className="drop-shadow-lg">
                <ShapeSVG type={targetShape.type} color={targetShape.color} size={100} />
              </svg>
            )}
          </div>
          
          <p className="mt-4 font-display text-2xl font-bold text-foreground">
            {targetShape?.name}
          </p>
        </div>

        {/* Options grid */}
        <div ref={optionsRef} className="grid grid-cols-2 gap-4">
          {options.map((shape) => (
            <button
              key={shape.id}
              data-id={shape.id}
              onClick={() => handleSelect(shape)}
              disabled={!!selectedId}
              className={cn(
                "p-6 rounded-3xl flex items-center justify-center bg-card shadow-lg border-2 transition-all duration-200",
                "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                !selectedId && "border-transparent hover:border-primary/30",
                selectedId === shape.id && isCorrect && "border-duo-green bg-duo-green/10 ring-4 ring-duo-green/30",
                selectedId === shape.id && !isCorrect && "border-duo-red bg-duo-red/10 ring-4 ring-duo-red/30",
                selectedId && shape.id === targetShape?.id && selectedId !== shape.id && "border-duo-green ring-2 ring-duo-green"
              )}
            >
              <svg width="80" height="80" className="drop-shadow-md">
                <ShapeSVG type={shape.type} color={shape.color} size={80} />
              </svg>
            </button>
          ))}
        </div>

        {/* AI Feedback */}
        <AdaptiveAIFeedback
          encouragement={encouragement}
          hint={hint}
          isLoading={aiLoading}
          onDismiss={clearMessages}
        />

        {/* Mascot feedback */}
        <div className="mt-8 flex justify-center">
          <div className={cn(
            "flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-lg border transition-colors",
            isCorrect === true && "bg-duo-green/10 border-duo-green/30",
            isCorrect === false && "bg-duo-red/10 border-duo-red/30",
            isCorrect === null && "border-transparent"
          )}>
            <Mascot size="sm" happy={isCorrect === true} animated={false} />
            <p className="font-medium text-foreground">
              {isCorrect === null && "Tap the matching shape! 👆"}
              {isCorrect === true && (streak >= 3 ? "🔥 Amazing streak!" : "Great job! ⭐")}
              {isCorrect === false && "Try again next time! 💪"}
            </p>
          </div>
        </div>
      </main>

      {/* Celebration particles */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 40}%`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: '0.6s',
              }}
            >
              {['⭐', '✨', '🎉', '💫'][i % 4]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
