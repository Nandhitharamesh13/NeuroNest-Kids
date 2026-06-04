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
import { ArrowLeft, Star, RotateCcw, Eraser, Check, Loader2, Brain, Clock } from 'lucide-react';
import gsap from 'gsap';
import { toast } from 'sonner';

const TOTAL_ROUNDS = 8;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface AIAnalysisResult {
  isCorrect: boolean;
  confidence: number;
  feedback: string;
  recognizedLetter: string;
}

export default function LetterTracingGame() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [targetLetter, setTargetLetter] = useState('A');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'good' | 'try-more'>('none');
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const generateRound = useCallback(() => {
    const available = LETTERS.filter(l => !usedLetters.includes(l));
    const pool = available.length > 0 ? available : LETTERS;
    const newLetter = pool[Math.floor(Math.random() * pool.length)];
    
    setTargetLetter(newLetter);
    setHasDrawn(false);
    setFeedback('none');
    setStrokes([]);
    setCurrentStroke([]);
    setUsedLetters(prev => [...prev, newLetter]);
    clearCanvas();
  }, [usedLetters]);

  useEffect(() => {
    generateRound();
  }, []);

  useEffect(() => {
    if (gameComplete && childId && user) {
      saveGameSession();
    }
  }, [gameComplete]);

  // Animate round transitions
  useEffect(() => {
    if (containerRef.current && !gameComplete) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [round, gameComplete]);

  const saveGameSession = async () => {
    if (!childId) return;
    try {
      await supabase.from('game_sessions').insert({
        child_id: childId,
        game_type: 'letters',
        score,
        correct_answers: correctAnswers,
        wrong_answers: TOTAL_ROUNDS - correctAnswers,
        total_questions: TOTAL_ROUNDS,
        max_streak: correctAnswers,
        mistakes: [],
      });
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setStrokes([]);
    setCurrentStroke([]);
    setFeedback('none');
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawn(true);
    setFeedback('none');
    
    const coords = getCoordinates(e);
    setCurrentStroke([coords]);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = 'hsl(270, 75%, 60%)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'hsl(270, 75%, 60%)';
    ctx.shadowBlur = 4;
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  // Get canvas as base64 image for AI analysis
  const getCanvasImage = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  // AI-powered letter analysis
  const analyzeWithAI = async (): Promise<AIAnalysisResult | null> => {
    const imageBase64 = getCanvasImage();
    if (!imageBase64) return null;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-letter-drawing', {
        body: { imageBase64, targetLetter }
      });

      if (error) {
        console.error('AI analysis error:', error);
        toast.error('AI analysis failed, using backup check');
        return null;
      }

      if (data?.analysis) {
        return data.analysis as AIAnalysisResult;
      }

      return null;
    } catch (err) {
      console.error('Failed to analyze with AI:', err);
      return null;
    }
  };

  // Basic fallback validation (used if AI fails)
  const basicValidation = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let totalDrawnPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 50) totalDrawnPixels++;
    }
    
    const totalPixels = canvas.width * canvas.height;
    const coverage = totalDrawnPixels / totalPixels;
    
    // At least 1.5% coverage and some strokes
    return coverage >= 0.015 && strokes.length >= 1;
  };

  const handleSubmit = async () => {
    if (!hasDrawn || isAnalyzing) return;
    
    playClick();
    setIsAnalyzing(true);
    setAiFeedback(null);
    
    try {
      // Try AI analysis first
      const aiResult = await analyzeWithAI();
      
      let isCorrect = false;
      
      if (aiResult) {
        isCorrect = aiResult.isCorrect;
        setAiFeedback(aiResult.feedback);
        
        // Show what AI recognized
        if (aiResult.recognizedLetter && aiResult.recognizedLetter !== 'unclear') {
          console.log(`AI recognized: ${aiResult.recognizedLetter} (confidence: ${aiResult.confidence}%)`);
        }
      } else {
        // Fallback to basic validation
        isCorrect = basicValidation();
        setAiFeedback(isCorrect ? "Great job!" : "Try tracing the whole letter!");
      }
      
      if (isCorrect) {
        playCorrect();
        setScore(prev => prev + 10);
        setCorrectAnswers(prev => prev + 1);
        setShowCelebration(true);
        setFeedback('good');
        
        // Celebration animation
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            scale: 1.02,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
          });
        }
        
        setTimeout(() => {
          setShowCelebration(false);
          setAiFeedback(null);
          if (round >= TOTAL_ROUNDS) {
            playComplete();
            setGameComplete(true);
          } else {
            setRound(prev => prev + 1);
            generateRound();
          }
        }, 2000);
      } else {
        playWrong();
        setFeedback('try-more');
        
        // Shake animation
        if (canvasRef.current) {
          gsap.to(canvasRef.current, {
            x: -5,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: 'power2.inOut',
            onComplete: () => gsap.set(canvasRef.current, { x: 0 }),
          });
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Something went wrong, please try again');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setCorrectAnswers(0);
    setGameComplete(false);
    setUsedLetters([]);
    setStrokes([]);
    setCurrentStroke([]);
    generateRound();
  };

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((correctAnswers / TOTAL_ROUNDS) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pastel-lavender via-background to-pastel-rose flex items-center justify-center p-4 page-enter">
        <div className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="text-6xl mb-4 animate-bounce">✏️</div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Letter Master!</h1>
          <p className="text-muted-foreground mb-6">You traced all the letters beautifully!</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                className={cn(
                  "w-12 h-12 transition-all duration-500",
                  i <= stars ? "text-duo-yellow fill-duo-yellow" : "text-muted"
                )}
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animation: i <= stars ? 'star-spin 0.6s ease-out forwards' : 'none'
                }}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-duo-purple/10 to-duo-pink/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-duo-purple">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="bg-gradient-to-br from-duo-green/10 to-duo-teal/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-duo-green">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/child-dashboard/${childId}`)} 
              className="flex-1 h-14 rounded-2xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button 
              onClick={resetGame} 
              className="flex-1 h-14 gap-2 rounded-2xl bg-gradient-to-r from-duo-purple to-duo-pink hover:opacity-90"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-pastel-lavender via-background to-pastel-rose overflow-hidden page-enter">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/child-dashboard/${childId}`)} className="gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-2 bg-duo-yellow/20 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
          <span className="font-bold">{score}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-duo-purple to-duo-pink rounded-full transition-all duration-500"
              style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2">
            {round} of {TOTAL_ROUNDS}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Target letter display */}
        <div className="text-center mb-6">
          <p className="font-display text-lg text-muted-foreground mb-2">
            Trace this letter carefully!
          </p>
          <div className="inline-block relative">
            <div 
              className="font-display text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-duo-purple via-duo-pink to-duo-orange"
              style={{
                textShadow: '0 4px 20px rgba(155, 89, 182, 0.3)',
              }}
            >
              {targetLetter}
            </div>
            {showCelebration && (
              <div className="absolute -top-2 -right-2 text-3xl animate-bounce">✨</div>
            )}
          </div>
        </div>

        {/* Drawing canvas */}
        <div className={cn(
          "bg-card rounded-3xl p-4 shadow-xl border-2 transition-all duration-300",
          feedback === 'good' && "border-duo-green",
          feedback === 'try-more' && "border-duo-orange",
          feedback === 'none' && "border-transparent"
        )}>
          <div className="relative rounded-2xl overflow-hidden bg-white">
            {/* Guide letter behind canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span 
                className="font-display text-[140px] md:text-[160px] text-muted/15"
                style={{ lineHeight: 1 }}
              >
                {targetLetter}
              </span>
            </div>
            
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="w-full h-[200px] md:h-[240px] cursor-crosshair touch-none relative z-10"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          
          {/* AI Feedback message */}
          {aiFeedback && (
            <div className={cn(
              "mt-3 text-center text-sm font-medium animate-fade-in flex items-center justify-center gap-2",
              feedback === 'good' ? "text-duo-green" : "text-duo-orange"
            )}>
              <Brain className="w-4 h-4" />
              {aiFeedback}
            </div>
          )}
          
          {/* Fallback feedback when no AI response */}
          {!aiFeedback && feedback === 'try-more' && (
            <div className="mt-3 text-center text-duo-orange text-sm font-medium animate-fade-in">
              Draw more of the letter! Cover the shape better. 🎨
            </div>
          )}
          
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={clearCanvas}
              disabled={isAnalyzing}
              className="flex-1 h-12 gap-2 rounded-xl"
            >
              <Eraser className="w-5 h-5" />
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasDrawn || isAnalyzing}
              className={cn(
                "flex-1 h-12 gap-2 rounded-xl transition-all",
                hasDrawn && !isAnalyzing
                  ? "bg-gradient-to-r from-duo-green to-duo-teal hover:opacity-90" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI Checking...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Check!
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mascot feedback */}
        <div className="mt-6 flex justify-center">
          <GuideMascot
            message={
              isAnalyzing
                ? "Let me look at your letter... 🔍"
                : showCelebration
                ? aiFeedback || "Beautiful letter! You're amazing! ⭐"
                : feedback === 'try-more'
                ? aiFeedback || "Try tracing more of the letter! You can do it! 💪"
                : hasDrawn
                ? "Great work! Press Check when finished!"
                : "Use your finger to trace the letter above!"
            }
            emotion={
              isAnalyzing ? 'thinking'
              : showCelebration ? 'celebrating' 
              : feedback === 'try-more' ? 'encouraging'
              : hasDrawn ? 'happy' 
              : 'neutral'
            }
          />
        </div>
      </main>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="relative">
            <div className="text-7xl animate-bounce">⭐</div>
            <div className="absolute -top-4 -left-8 text-4xl animate-ping">✨</div>
            <div className="absolute -top-4 -right-8 text-4xl animate-ping" style={{ animationDelay: '0.1s' }}>✨</div>
            <div className="absolute -bottom-4 -left-4 text-3xl animate-ping" style={{ animationDelay: '0.2s' }}>🎉</div>
            <div className="absolute -bottom-4 -right-4 text-3xl animate-ping" style={{ animationDelay: '0.3s' }}>🎉</div>
          </div>
        </div>
      )}
    </div>
  );
}
