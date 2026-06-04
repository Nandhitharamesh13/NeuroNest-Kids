import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GuideMascot } from '@/components/GuideMascot';
import { VoiceButton } from '@/components/VoiceButton';
import { GameFinishScreen } from '@/components/GameFinishScreen';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { cn } from '@/lib/utils';
import { ArrowLeft, Star, RotateCcw, Clock, Brain } from 'lucide-react';

const TOTAL_PAIRS = 6;

interface Card {
  id: string;
  emoji: string;
  matched: boolean;
}

const CARD_EMOJIS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🦁', '🐸', '🐵', '🦄'];

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  timestamp: number;
  responseTimeMs: number;
}

export default function MemoryGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();

  // Adaptive AI
  const {
    encouragement,
    hint,
    isLoading: aiLoading,
    trackCorrect,
    trackWrong,
    updateStats,
    clearMessages,
    behaviorProfile,
  } = useAdaptiveAI(childId);

  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [canFlip, setCanFlip] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);

  // Time tracking
  const gameStartTime = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  // Timer effect - stops when game is complete
  useEffect(() => {
    if (gameComplete) return; // Stop timer when game ends
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - gameStartTime.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeGame = useCallback(() => {
    const selectedEmojis = [...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL_PAIRS);
    
    const cardPairs = selectedEmojis.flatMap((emoji, idx) => [
      { id: `${idx}-a`, emoji, matched: false },
      { id: `${idx}-b`, emoji, matched: false },
    ]);
    
    setCards(cardPairs.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setMoves(0);
    setGameComplete(false);
    setCanFlip(true);
  }, []);

  useEffect(() => {
    gameStartTime.current = Date.now();
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (matched.length === TOTAL_PAIRS * 2 && cards.length > 0) {
      playComplete();
      setGameComplete(true);
      saveGameSession();
      updateStats(TOTAL_PAIRS, TOTAL_PAIRS, 'memory');
    }
  }, [matched]);

  useEffect(() => {
    if (flipped.length === 2) {
      setCanFlip(false);
      const [first, second] = flipped;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          playCorrect();
          trackCorrect();
          setMatched(prev => [...prev, first, second]);
          setScore(prev => prev + 20);
          setFlipped([]);
          setCanFlip(true);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 800);
        }, 500);
      } else {
        // No match - track as mistake
        const mistake: Mistake = {
          question: 'Find matching pair',
          correctAnswer: firstCard?.emoji || '',
          userAnswer: secondCard?.emoji || '',
          category: 'memory',
          timestamp: Date.now(),
          responseTimeMs: 0,
        };
        setMistakes(prev => [...prev, mistake]);
        
        trackWrong({
          gameType: 'memory',
          score,
          correctAnswers: matched.length / 2,
          wrongAnswers: mistakes.length + 1,
          totalQuestions: TOTAL_PAIRS,
        });
        setTimeout(() => {
          playWrong();
          setFlipped([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  }, [flipped, cards]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert([{
        child_id: childId,
        game_type: 'memory',
        score,
        correct_answers: TOTAL_PAIRS,
        wrong_answers: Math.max(0, moves - TOTAL_PAIRS),
        total_questions: TOTAL_PAIRS,
        max_streak: TOTAL_PAIRS,
        mistakes: mistakes as any,
        duration_seconds: Math.floor((Date.now() - gameStartTime.current) / 1000),
      }]);
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  const handleCardClick = (cardId: string) => {
    if (!canFlip) return;
    if (flipped.includes(cardId)) return;
    if (matched.includes(cardId)) return;
    if (flipped.length >= 2) return;
    
    playClick();
    setFlipped(prev => [...prev, cardId]);
    setMoves(prev => prev + 1);
  };

  const accuracy = moves > 0 ? Math.round((TOTAL_PAIRS / moves) * 100) : 0;
  const stars = accuracy >= 80 ? 3 : accuracy >= 60 ? 2 : accuracy >= 40 ? 1 : 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pastel-mint via-background to-pastel-sky flex items-center justify-center p-4 page-enter">
        <div className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-card">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Memory Master!</h1>
          <p className="text-muted-foreground mb-6">You found all the pairs!</p>
          
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
              <div className="text-2xl font-bold text-foreground">{moves}</div>
              <div className="text-sm text-muted-foreground">Moves</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold text-foreground">{formatTime(Math.floor((Date.now() - gameStartTime.current) / 1000))}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold text-foreground">{mistakes.length}</div>
              <div className="text-sm text-muted-foreground">Mismatches</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/game-hub/${childId}`)} className="flex-1">
              Back
            </Button>
            <Button onClick={initializeGame} className="flex-1 gap-2">
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
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/game-hub/${childId}`)} className="gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          {/* Time display */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            Moves: <span className="font-bold text-foreground">{moves}</span>
          </div>
          <div className="flex items-center gap-1 font-bold">
            <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
            {score}
          </div>
        </div>
      </header>

      {/* AI Difficulty indicator */}
      {behaviorProfile && (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3 h-3" />
            <span>AI Level: {behaviorProfile.current_difficulty_level}/5</span>
            <span className="text-primary">•</span>
            <span>Pace: {behaviorProfile.preferred_pace}</span>
          </div>
        </div>
      )}

      {/* Progress - pairs found */}
      <div className="px-4 mb-6">
        <div className="text-center text-sm text-muted-foreground">
          {matched.length / 2} of {TOTAL_PAIRS} pairs found
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pb-8">
        {/* Instructions */}
        <div className="text-center mb-4">
          <p className="font-display text-lg text-foreground">
            Find the matching pairs!
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);
            
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isMatched || !canFlip}
                className={cn(
                  "aspect-square rounded-xl transition-all duration-300 gpu-accelerated",
                  "flex items-center justify-center text-3xl md:text-4xl",
                  isFlipped
                    ? "bg-pastel-sky border-3 border-duo-blue shadow-lg"
                    : "bg-gradient-to-br from-duo-teal to-duo-blue hover:from-duo-teal/90 hover:to-duo-blue/90",
                  isMatched && "bg-pastel-mint border-duo-green scale-95",
                  !isFlipped && "shadow-[0_4px_0_hsl(175,70%,32%)] active:shadow-[0_1px_0_hsl(175,70%,32%)] active:translate-y-[3px]"
                )}
              >
                {isFlipped ? (
                  <span className="drop-shadow-md">
                    {card.emoji}
                  </span>
                ) : (
                  <span className="text-white text-2xl md:text-3xl font-bold drop-shadow-sm">?</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mascot feedback */}
        <div className="flex justify-center">
          <GuideMascot
            message={
              showCelebration
                ? "Great match! Keep going! 🎉"
                : flipped.length === 1
                ? "Find the matching card!"
                : "Tap a card to flip it!"
            }
            emotion={showCelebration ? 'celebrating' : 'happy'}
          />
        </div>
      </main>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl celebrate">✨</div>
        </div>
      )}

      {/* Adaptive AI Feedback */}
      <AdaptiveAIFeedback
        encouragement={encouragement}
        hint={hint}
        isLoading={aiLoading}
        onDismiss={clearMessages}
      />
    </div>
  );
}
