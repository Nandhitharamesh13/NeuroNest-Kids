import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InteractiveMascot } from '@/components/InteractiveMascot';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Star, Trophy, Target, Clock, Flame, Medal, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface GameFinishScreenProps {
  childId: string;
  gameTitle: string;
  gameEmoji: string;
  score: number;
  accuracy: number;
  totalTime: number;
  maxStreak: number;
  mistakes: number;
  onPlayAgain: () => void;
  gradientFrom?: string;
  gradientTo?: string;
}

export function GameFinishScreen({
  childId,
  gameTitle,
  gameEmoji,
  score,
  accuracy,
  totalTime,
  maxStreak,
  mistakes,
  onPlayAgain,
  gradientFrom = 'from-duo-green/10',
  gradientTo = 'to-duo-teal/10',
}: GameFinishScreenProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Celebration message based on performance
  const getMessage = () => {
    if (accuracy >= 90) return { title: 'Outstanding! 🏆', subtitle: 'You are a true champion!' };
    if (accuracy >= 70) return { title: 'Great Job! 🌟', subtitle: 'Keep up the amazing work!' };
    if (accuracy >= 50) return { title: 'Good Effort! 💪', subtitle: 'Practice makes perfect!' };
    return { title: 'Nice Try! 🎯', subtitle: 'Every attempt helps you learn!' };
  };

  const message = getMessage();

  // Entrance animations
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate container
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.5)' }
      );

      // Animate stars with stagger
      if (starsRef.current) {
        const starElements = starsRef.current.querySelectorAll('.star-item');
        gsap.fromTo(starElements,
          { opacity: 0, scale: 0, rotation: -180 },
          { 
            opacity: 1, 
            scale: 1, 
            rotation: 0, 
            duration: 0.5, 
            stagger: 0.15,
            ease: 'back.out(2)',
            delay: 0.4
          }
        );
      }

      // Animate stats cards
      if (statsRef.current) {
        const statCards = statsRef.current.querySelectorAll('.stat-card');
        gsap.fromTo(statCards,
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.8
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Confetti effect for high scores
  useEffect(() => {
    if (accuracy < 80) return;

    const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const confetti: HTMLDivElement[] = [];

    for (let i = 0; i < 50; i++) {
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.width = '10px';
      div.style.height = '10px';
      div.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      div.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      div.style.left = `${Math.random() * 100}vw`;
      div.style.top = '-20px';
      div.style.zIndex = '100';
      div.style.pointerEvents = 'none';
      document.body.appendChild(div);
      confetti.push(div);

      gsap.to(div, {
        y: window.innerHeight + 50,
        x: `+=${(Math.random() - 0.5) * 200}`,
        rotation: Math.random() * 720,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
        ease: 'power1.out',
        onComplete: () => div.remove(),
      });
    }

    return () => confetti.forEach(c => c.remove());
  }, [accuracy]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientFrom} via-background ${gradientTo} flex items-center justify-center p-4`}>
      <div 
        ref={containerRef}
        className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20 backdrop-blur-sm"
      >
        {/* Mascot celebration */}
        <div className="mb-4 flex justify-center">
          <InteractiveMascot size="lg" emotion="celebrating" />
        </div>

        {/* Game emoji badge */}
        <div className="relative inline-block mb-4">
          <div className="text-6xl animate-bounce">
            {gameEmoji}
          </div>
          {accuracy >= 80 && (
            <div className="absolute -top-2 -right-2 text-2xl">
              <Sparkles className="w-6 h-6 text-duo-yellow animate-pulse" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          {message.title}
        </h1>
        <p className="text-muted-foreground mb-2">{message.subtitle}</p>
        <p className="text-sm text-primary font-medium mb-6">{gameTitle}</p>

        {/* Stars display */}
        <div ref={starsRef} className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="star-item">
              <Star
                className={cn(
                  'w-14 h-14 drop-shadow-lg transition-all duration-500',
                  i <= stars 
                    ? 'text-duo-yellow fill-duo-yellow' 
                    : 'text-muted/40'
                )}
              />
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div ref={statsRef} className="grid grid-cols-2 gap-3 mb-8">
          <div className="stat-card bg-gradient-to-br from-duo-yellow/10 to-duo-orange/10 rounded-2xl p-4 border border-duo-yellow/20">
            <Trophy className="w-6 h-6 text-duo-yellow mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{score}</div>
            <div className="text-xs text-muted-foreground font-medium">Score</div>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-duo-green/10 to-duo-teal/10 rounded-2xl p-4 border border-duo-green/20">
            <Target className="w-6 h-6 text-duo-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
            <div className="text-xs text-muted-foreground font-medium">Accuracy</div>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-duo-blue/10 to-duo-purple/10 rounded-2xl p-4 border border-duo-blue/20">
            <Clock className="w-6 h-6 text-duo-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{formatTime(totalTime)}</div>
            <div className="text-xs text-muted-foreground font-medium">Time</div>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-duo-orange/10 to-duo-red/10 rounded-2xl p-4 border border-duo-orange/20">
            <Flame className="w-6 h-6 text-duo-orange mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{maxStreak}</div>
            <div className="text-xs text-muted-foreground font-medium">Best Streak</div>
          </div>
        </div>

        {/* Performance badges */}
        <div className="flex justify-center gap-2 mb-6">
          {accuracy >= 80 && (
            <div className="bg-duo-yellow/20 text-duo-yellow px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Medal className="w-3 h-3" /> Star Performer
            </div>
          )}
          {maxStreak >= 5 && (
            <div className="bg-duo-orange/20 text-duo-orange px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" /> Streak Master
            </div>
          )}
          {mistakes === 0 && (
            <div className="bg-duo-green/20 text-duo-green px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3" /> Perfect!
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/child-dashboard/${childId}`)}
            className="flex-1 h-14 text-lg rounded-2xl border-2 hover:bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={onPlayAgain}
            className="flex-1 h-14 text-lg rounded-2xl bg-gradient-to-r from-duo-green to-duo-teal hover:opacity-90 shadow-lg shadow-duo-green/30"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
