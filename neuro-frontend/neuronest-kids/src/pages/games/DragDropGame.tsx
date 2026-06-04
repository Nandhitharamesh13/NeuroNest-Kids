import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GuideMascot } from '@/components/GuideMascot';
import { VoiceButton } from '@/components/VoiceButton';
import { GameFinishScreen } from '@/components/GameFinishScreen';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useGameStats } from '@/hooks/useGameStats';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, GripVertical, Star, Trophy, Target, Clock, Brain } from 'lucide-react';

// Item definitions with categories
interface DragItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

interface DropZone {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const CATEGORIES: DropZone[] = [
  { id: 'fruits', name: 'Fruits', emoji: '🍎', color: 'bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-600' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥕', color: 'bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-600' },
  { id: 'animals', name: 'Animals', emoji: '🐾', color: 'bg-amber-100 border-amber-400 dark:bg-amber-900/30 dark:border-amber-600' },
  { id: 'vehicles', name: 'Vehicles', emoji: '🚗', color: 'bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600' },
];

const ALL_ITEMS: DragItem[] = [
  // Fruits
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruits' },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruits' },
  { id: 'orange', name: 'Orange', emoji: '🍊', category: 'fruits' },
  { id: 'grape', name: 'Grapes', emoji: '🍇', category: 'fruits' },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', category: 'fruits' },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', category: 'fruits' },
  // Vegetables
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetables' },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'vegetables' },
  { id: 'corn', name: 'Corn', emoji: '🌽', category: 'vegetables' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetables' },
  { id: 'potato', name: 'Potato', emoji: '🥔', category: 'vegetables' },
  { id: 'cucumber', name: 'Cucumber', emoji: '🥒', category: 'vegetables' },
  // Animals
  { id: 'dog', name: 'Dog', emoji: '🐕', category: 'animals' },
  { id: 'cat', name: 'Cat', emoji: '🐈', category: 'animals' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', category: 'animals' },
  { id: 'lion', name: 'Lion', emoji: '🦁', category: 'animals' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', category: 'animals' },
  { id: 'bird', name: 'Bird', emoji: '🐦', category: 'animals' },
  // Vehicles
  { id: 'car', name: 'Car', emoji: '🚗', category: 'vehicles' },
  { id: 'bus', name: 'Bus', emoji: '🚌', category: 'vehicles' },
  { id: 'train', name: 'Train', emoji: '🚂', category: 'vehicles' },
  { id: 'plane', name: 'Airplane', emoji: '✈️', category: 'vehicles' },
  { id: 'boat', name: 'Boat', emoji: '⛵', category: 'vehicles' },
  { id: 'bicycle', name: 'Bicycle', emoji: '🚲', category: 'vehicles' },
];

const TOTAL_QUESTIONS = 8; // Fixed number of questions

// Shuffle helper
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface Mistake {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
}

export default function DragDropGame() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playPick, playDrop, playSuccess, playEncourage } = useSoundEffects();
  const { saveGameSession } = useGameStats();
  
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [gameItems, setGameItems] = useState<DragItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [guideMessage, setGuideMessage] = useState('');
  const [guideEmotion, setGuideEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'encouraging'>('neutral');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [placedItems, setPlacedItems] = useState<Record<string, DragItem[]>>({});
  
  const startTime = useRef(Date.now());

  // Initialize game - select random items for all questions
  const initializeGame = useCallback(() => {
    const shuffledItems = shuffle(ALL_ITEMS).slice(0, TOTAL_QUESTIONS);
    setGameItems(shuffledItems);
    setCurrentItemIndex(0);
    setPlacedItems({});
    setShowTryAgain(false);
    setIsCorrect(null);
    setGuideMessage("Sort each item into the correct category. Take your time and think!");
    setGuideEmotion('encouraging');
  }, []);

  // Start game
  useEffect(() => {
    initializeGame();
    setTimeout(() => playEncourage(), 500);
  }, [initializeGame, playEncourage]);

  // Get current item
  const currentItem = gameItems[currentItemIndex];

  // Handle drag start
  const handleDragStart = (item: DragItem) => {
    setDraggedItem(item);
    playPick();
    setGuideMessage(`Where does ${item.name} belong? Think carefully!`);
    setGuideEmotion('thinking');
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setHoveredZone(null);
  };

  // Handle drop
  const handleDrop = (zoneId: string) => {
    if (!draggedItem) return;
    
    playDrop();
    setAttempts(prev => prev + 1);
    
    if (draggedItem.category === zoneId) {
      // Correct!
      setIsCorrect(true);
      setScore(prev => prev + 10 + (streak * 2)); // Bonus for streak
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setCorrectAnswers(prev => prev + 1);
      
      // Add to placed items
      setPlacedItems(prev => ({
        ...prev,
        [zoneId]: [...(prev[zoneId] || []), draggedItem]
      }));
      
      playCorrect();
      
      const categoryName = CATEGORIES.find(c => c.id === zoneId)?.name || zoneId;
      setGuideMessage(`Excellent! ${draggedItem.name} is a ${categoryName.slice(0, -1).toLowerCase()}!`);
      setGuideEmotion('happy');
      
      // Move to next question after delay
      setTimeout(() => {
        if (currentItemIndex < gameItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
          setQuestionNumber(prev => prev + 1);
          setIsCorrect(null);
          setGuideEmotion('neutral');
          setGuideMessage("Great progress! What about this one?");
        } else {
          // Game complete
          setGameComplete(true);
          playSuccess();
          setGuideMessage("Congratulations! You completed all the sorting!");
          setGuideEmotion('happy');
        }
      }, 1000);
      
    } else {
      // Wrong!
      setIsCorrect(false);
      setShowTryAgain(true);
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
      
      // Record mistake
      const correctCat = CATEGORIES.find(c => c.id === draggedItem.category);
      const wrongCat = CATEGORIES.find(c => c.id === zoneId);
      
      setMistakes(prev => [...prev, {
        question: `Sort ${draggedItem.name}`,
        correctAnswer: correctCat?.name || draggedItem.category,
        userAnswer: wrongCat?.name || zoneId,
        category: 'sorting'
      }]);
      
      playWrong();
      setGuideMessage(`Not quite! Try again. Think about what ${draggedItem.name} is.`);
      setGuideEmotion('encouraging');
      
      // Reset after delay - don't advance
      setTimeout(() => {
        setShowTryAgain(false);
        setIsCorrect(null);
      }, 1200);
    }
    
    setDraggedItem(null);
    setHoveredZone(null);
  };

  // Touch handlers for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneElement = element?.closest('[data-zone-id]');
    if (zoneElement) {
      setHoveredZone(zoneElement.getAttribute('data-zone-id'));
    } else {
      setHoveredZone(null);
    }
  };

  const handleTouchEnd = () => {
    if (hoveredZone && draggedItem) {
      handleDrop(hoveredZone);
    }
    handleDragEnd();
  };

  // Save stats when game completes
  useEffect(() => {
    if (gameComplete && childId) {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      saveGameSession({
        childId,
        gameType: 'sorting' as any,
        score,
        totalQuestions: TOTAL_QUESTIONS,
        correctAnswers,
        wrongAnswers,
        mistakes,
        maxStreak,
        durationSeconds: duration,
      });
    }
  }, [gameComplete, childId, score, correctAnswers, wrongAnswers, mistakes, maxStreak, saveGameSession]);

  // Reset game
  const resetGame = () => {
    setQuestionNumber(1);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setMistakes([]);
    setGameComplete(false);
    startTime.current = Date.now();
    initializeGame();
  };

  // Game complete screen
  if (gameComplete) {
    const accuracy = TOTAL_QUESTIONS > 0 ? Math.round((correctAnswers / TOTAL_QUESTIONS) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-duo-blue/10 via-background to-duo-purple/10 flex flex-col items-center justify-center p-4 page-enter">
        <div className="bg-card rounded-3xl p-8 shadow-card max-w-md w-full text-center space-y-6">
          <div className="text-6xl mb-4 celebrate">🏆</div>
          <h1 className="font-display text-3xl font-bold text-foreground">Well Done!</h1>
          
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="bg-duo-yellow/20 rounded-xl p-3">
              <Star className="w-6 h-6 text-duo-yellow mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{score}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div className="bg-duo-green/20 rounded-xl p-3">
              <Target className="w-6 h-6 text-duo-green mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-duo-orange/20 rounded-xl p-3">
              <Trophy className="w-6 h-6 text-duo-orange mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{maxStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
          
          <GuideMascot message="You're a sorting champion! Want to play again?" emotion="happy" position="center" />
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate(`/child-dashboard/${childId}`)} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button onClick={resetGame} className="flex-1 bg-duo-green hover:bg-duo-green/90">
              <RotateCcw className="w-4 h-4 mr-2" /> Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-duo-blue/10 via-background to-duo-purple/10 flex flex-col page-enter">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/child-dashboard/${childId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2 bg-duo-yellow/20 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
          <span className="font-bold text-foreground">{score}</span>
        </div>
        
        <div className="text-sm font-medium text-muted-foreground">
          {questionNumber}/{TOTAL_QUESTIONS}
        </div>
      </header>
      
      {/* Progress */}
      <div className="px-4 mb-4">
        <Progress value={(questionNumber / TOTAL_QUESTIONS) * 100} className="h-3 bg-muted" />
      </div>
      
      {/* Guide Mascot */}
      <div className="px-4 mb-4">
        <GuideMascot message={guideMessage} emotion={guideEmotion} position="left" />
      </div>
      
      {/* Game Area */}
      <main className="flex-1 px-4 pb-6 flex flex-col gap-4">
        {/* Current Item to Drag */}
        {currentItem && !isCorrect && (
          <div className="flex justify-center">
            <div
              draggable
              onDragStart={() => handleDragStart(currentItem)}
              onDragEnd={handleDragEnd}
              onTouchStart={() => handleDragStart(currentItem)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={cn(
                'bg-card rounded-2xl p-6 shadow-card cursor-grab active:cursor-grabbing',
                'flex flex-col items-center gap-2 min-w-[140px]',
                'border-2 border-dashed border-primary/30',
                'transition-all duration-200 gpu-accelerated',
                'hover:scale-105 hover:shadow-lg',
                draggedItem?.id === currentItem.id && 'scale-110 shadow-xl opacity-80 rotate-2',
                showTryAgain && 'animate-shake border-destructive',
                isCorrect === true && 'animate-correct-flash border-duo-green'
              )}
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
              <span className="text-5xl">{currentItem.emoji}</span>
              <span className="font-bold text-foreground">{currentItem.name}</span>
            </div>
          </div>
        )}
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {gameItems.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                idx < currentItemIndex ? 'bg-duo-green' : idx === currentItemIndex ? 'bg-primary scale-125' : 'bg-muted'
              )}
            />
          ))}
        </div>
        
        {/* All 4 Drop Zones */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {CATEGORIES.map((zone) => (
            <div
              key={zone.id}
              data-zone-id={zone.id}
              onDragOver={(e) => {
                e.preventDefault();
                setHoveredZone(zone.id);
              }}
              onDragLeave={() => setHoveredZone(null)}
              onDrop={() => handleDrop(zone.id)}
              className={cn(
                'rounded-2xl border-2 border-dashed p-3 transition-all duration-200',
                zone.color,
                'flex flex-col items-center gap-1 min-h-[120px]',
                'gpu-accelerated',
                hoveredZone === zone.id && 'scale-[1.02] shadow-lg border-solid border-3'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xl">{zone.emoji}</span>
                <span className="font-bold text-sm text-foreground">{zone.name}</span>
              </div>
              
              {/* Placed items */}
              <div className="flex flex-wrap gap-1 justify-center">
                {(placedItems[zone.id] || []).map((item) => (
                  <div
                    key={item.id}
                    className="text-2xl animate-pop-in"
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Streak indicator */}
        {streak >= 2 && (
          <div className="flex justify-center">
            <div className="bg-duo-orange/20 text-duo-orange px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 animate-bounce-in">
              🔥 {streak} in a row!
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
